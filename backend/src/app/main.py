"""Main module for the vertex_dashboards package."""

import base64
import logging
import os
from datetime import datetime
from http import HTTPStatus
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
    last_receipt = await get_last_receipt(summarizer_id)
    if last_receipt:
        summarizer_dict["last_receipt_timestamp"] = last_receipt["timestamp"]
    return summarizer_dict  # type: ignore[no-any-return]


@app.get("/summarizer")
async def list_summarizers() -> list[dict[str, Any]]:
    """Endpoint to list all summarizers."""
    summarizers = firestore_client.collection("summarizers").get()
    response = []
    for summarizer in summarizers:
        last_receipt = await get_last_receipt(summarizer.id)
        summarizer_dict = summarizer.to_dict()
        if last_receipt:
            summarizer_dict["last_receipt_timestamp"] = last_receipt["timestamp"]
        response.append(summarizer_dict)
    return response


@app.delete("/summarizer/{summarizer_id}")
async def delete_summarizer(summarizer_id: str) -> None:
    """Endpoint to delete a summarizer."""
    firestore_client.collection("summarizers").document(summarizer_id).delete()


@app.post("/summarizer/{summarizer_id}/summarise")
async def summarise(data: SummaryRequest) -> dict[str, Any]:
    """Endpoint to run a summarizer."""
    summarizer = data.summarizer  # noqa: F841
    receipt = data.receipt

    # Run the summarizer
    vertexai.init(project=PROJECT_ID, location="us-central1")
    model = GenerativeModel(model_name="gemini-1.5-pro-001")
    # TODO: Prompt engineering and RAG
    prompt = """
        You are a very professional document summarization specialist.
        Please summarize the given document.
    """
    report_location = f"gs://vertex-dashboards/{receipt.report_location}"
    pdf_file = Part.from_uri(report_location, mime_type="application/pdf")
    contents = [pdf_file, prompt]
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
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail=f"No receipts found for summarizer {summarizer_id}",
        )


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
    bucket = storage_client.bucket("vertex-dashboards")
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

    response = await summarise(
        SummaryRequest(summarizer=summarizer_config, receipt=receipt)
    )

    resend.api_key = os.getenv("RESEND_API_KEY")
    attachment = resend.Attachment(filename="dashboard.pdf", content=attachment_data)

    with open("src/app/email.html", "r") as file:
        email_template = file.read()

    email_template = email_template.replace("__body__", response["body"])

    resend.Emails.send(
        {
            "from": "hello@spectacles.dev",
            "to": summarizer_config.recipients,
            "subject": "Your Dashboard Has Been AI Analyzed!",
            "html": email_template,
            "attachments": [attachment],
        }
    )


def main() -> None:
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
