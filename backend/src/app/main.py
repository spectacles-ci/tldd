"""Main module for the vertex_dashboards package."""

import base64
import logging
import os
import re
from datetime import datetime
from http import HTTPStatus
from pathlib import Path
from typing import Any

import resend
import vertexai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.cloud.firestore import Client as FirestoreClient
from google.cloud.logging import Client as LoggingClient
from google.cloud.storage import Client as StorageClient
from vertexai.generative_models import GenerativeModel, Part

from app.models import (
    DashboardWebhook,
    Receipt,
    Summarizer,
    Summary,
    SummaryRequest,
)

PROJECT_ID = "vertex-dashboards"
K_SERVICE = os.getenv("K_SERVICE")


app = FastAPI()

# Set CORS to allow requests from all websites
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if K_SERVICE and K_SERVICE != "dev":
    # Initialize Google Cloud Logging
    logging_client = LoggingClient(project=PROJECT_ID)
    logging_client.setup_logging()

# Configure the root logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Firestore client
firestore_client = FirestoreClient(project=PROJECT_ID, database=PROJECT_ID)


@app.get("/")
async def healthcheck() -> dict[str, Any]:
    """Healthcheck endpoint."""
    return {"status": "ok"}


@app.post("/summarizer/")
async def create_summarizer(summarizer: Summarizer) -> None:
    """Endpoint to create a summarizer."""
    summarizer_dict = summarizer.model_dump()
    firestore_client.collection("summarizers").document(summarizer.id).set(
        summarizer_dict
    )
    logger.info(
        f"Summarizer {summarizer.id} has been created and written to Firestore."
    )


@app.get("/summarizer/{summarizer_id}")
async def get_summarizer(summarizer_id: str) -> dict[str, Any]:
    """Endpoint to get a summarizer."""
    summarizer = (
        firestore_client.collection("summarizers").document(summarizer_id).get()
    )
    summarizer_dict = summarizer.to_dict()
    last_receipt = await _get_last_receipt(summarizer_id)
    if last_receipt:
        summarizer_dict["last_receipt_timestamp"] = last_receipt["timestamp"]
    logger.info(f"Summarizer {summarizer_id} has been retrieved from Firestore.")
    return summarizer_dict  # type: ignore[no-any-return]


@app.get("/summarizer")
async def list_summarizers() -> list[dict[str, Any]]:
    """Endpoint to list all summarizers."""
    summarizers = firestore_client.collection("summarizers").get()
    response = []
    for summarizer in summarizers:
        last_receipt = await _get_last_receipt(summarizer.id)
        summarizer_dict = summarizer.to_dict()
        if last_receipt:
            summarizer_dict["last_receipt_timestamp"] = last_receipt["timestamp"]
        response.append(summarizer_dict)
    logger.info("Summarizers have been retrieved from Firestore.")
    return response


@app.delete("/summarizer/{summarizer_id}")
async def delete_summarizer(summarizer_id: str) -> None:
    """Endpoint to delete a summarizer."""
    firestore_client.collection("summarizers").document(summarizer_id).delete()
    logger.info(f"Summarizer {summarizer_id} has been deleted from Firestore.")


async def _get_prior_summary(summarizer_id: str) -> Summary | None:
    """Get the last summary for a given summarizer_id."""
    summaries = (
        firestore_client.collection("summaries")
        .where("summarizer_id", "==", summarizer_id)
        .order_by("timestamp", direction="DESCENDING")
        .limit(1)
        .get()
    )
    if summaries:
        return Summary(**summaries[0].to_dict())
    return None


@app.post("/summarizer/{summarizer_id}/summarize")
async def summarize(data: SummaryRequest) -> dict[str, Any]:
    """Endpoint to run a summarizer."""
    summarizer = data.summarizer  # noqa: F841
    receipt = data.receipt

    if summarizer.use_prior_reports:
        prior_summary = await _get_prior_summary(summarizer.id)
        if prior_summary:
            if prior_summary:
                prior_report_location = (
                    f"gs://vertex-dashboards/{prior_summary.report_location}"
                )
                prior_report_pdf = Part.from_uri(
                    prior_report_location, mime_type="application/pdf"
                )

    # Build the prompt
    system_instruction_path = Path(__file__).parent / "prompts" / "system.txt"
    system_instruction = system_instruction_path.read_text()

    if summarizer.use_prior_reports and prior_summary:
        prior_report_prompt_path = Path(__file__).parent / "prompts" / "prior.txt"
        prompt = prior_report_prompt_path.read_text()
        prompt = re.sub(r"{{ previous_dashboard_summary }}", prior_summary.body, prompt)
        prompt_chunks = [prompt]
    else:
        prompt_file_path = Path(__file__).parent / "prompts" / "default.txt"
        prompt_chunks = [prompt_file_path.read_text()]

    if summarizer.custom_instructions:
        prompt_chunks.append(
            f"You must also follow these instructions: {summarizer.custom_instructions}"
        )

    prompt = "\n\n".join(prompt_chunks)
    logger.info(f"Prompt: {prompt}")

    # Run the summarizer
    vertexai.init(project=PROJECT_ID, location="us-central1")
    model = GenerativeModel(
        model_name="gemini-1.5-pro-001", system_instruction=system_instruction
    )
    report_location = f"gs://vertex-dashboards/{receipt.report_location}"
    pdf_file = Part.from_uri(report_location, mime_type="application/pdf")
    contents = [prompt, pdf_file]
    if summarizer.use_prior_reports and prior_summary:
        contents.append(prior_report_pdf)
    response = model.generate_content(contents)

    # Save the Summary
    summary = Summary(
        body=response.text,
        prompt=prompt,
        report_location=receipt.report_location,
        recipients=summarizer.recipients,
        summarizer_id=summarizer.id,
        timestamp=datetime.now(),
    )
    timestamp = receipt.timestamp.strftime("%Y%m%d%H%M%S")
    firestore_client.collection("summaries").document(
        f"{summarizer.id}-{timestamp}"
    ).set(summary.model_dump())

    return summary.model_dump()


@app.get("/summarizer/{summarizer_id}/receipt")
async def get_last_receipt(summarizer_id: str) -> dict[str, Any] | None:
    """Endpoint to get the last receipt."""
    receipt = await _get_last_receipt(summarizer_id)
    if receipt:
        return receipt
    else:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail=f"No receipts found for summarizer {summarizer_id}",
        )


async def _get_last_receipt(summarizer_id: str) -> dict[str, Any] | None:
    """Get the last receipt."""
    receipt_doc = (
        firestore_client.collection("receipts")
        .where("summarizer_id", "==", summarizer_id)
        .order_by("timestamp", direction="DESCENDING")
        .limit(1)
        .get()
    )
    try:
        return receipt_doc[0].to_dict()  # type: ignore[no-any-return]
    except IndexError:
        return None


@app.post("/webhook/{summarizer_id}")
async def receive_webhook(summarizer_id: str, webhook: DashboardWebhook) -> None:
    """Endpoint to run a summarizer.

    The service will decode the attachment, save it in GCS as a PDF,
    run the LLM over it based on the summarizer config, and send
    it to the email recipients.

    It will also save a history of the summary in Firestore."""
    # Load summarizer from Firestore
    summarizer = (
        firestore_client.collection("summarizers").document(summarizer_id).get()
    )
    summarizer_dict = summarizer.to_dict()

    # Decode the attachment
    attachment_data = webhook.attachment.data
    decoded_data = base64.b64decode(attachment_data)

    # Save the attachment to GCS
    storage_client = StorageClient(project=PROJECT_ID)
    bucket = storage_client.bucket(os.getenv("PDF_BUCKET"))
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    blob = bucket.blob(f"summaries/{summarizer_id}/{timestamp}.pdf")
    blob.upload_from_string(decoded_data, content_type="application/pdf")
    logger.info(f"Decoded data has been uploaded to GCS bucket: {blob.name}")

    # Save the receipt to Firestore
    receipt = Receipt(
        timestamp=datetime.now(),
        report_location=blob.name,
        summarizer_id=summarizer_id,
    )
    firestore_client.collection("receipts").document(
        f"{summarizer_id}-{timestamp}"
    ).set(receipt.model_dump())

    # if summarizer doesn't exist, don't process
    if not summarizer_dict:
        logger.info(f"Summarizer {summarizer_id} does not exist.")
        return

    summarizer_config = Summarizer(**summarizer_dict)

    response = await summarize(
        SummaryRequest(summarizer=summarizer_config, receipt=receipt)
    )

    resend.api_key = os.getenv("RESEND_API_KEY")

    email_payload: resend.Emails.SendParams = {
        "from": "hello@spectacles.dev",
        "to": summarizer_config.recipients,
        "subject": f"tl;dd: {webhook.scheduled_plan.title}",
        "html": response["body"].replace("\n", ""),
    }
    if summarizer_config.attach_pdf:
        attachment = resend.Attachment(
            filename="dashboard.pdf", content=attachment_data
        )
        email_payload["attachments"] = [attachment]

    resend.Emails.send(email_payload)


def main() -> None:
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
