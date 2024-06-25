"""Main module for the vertex_dashboards package."""

import base64
import logging
import os
from datetime import datetime

import resend
import vertexai
from fastapi import FastAPI
from google.cloud.firestore import Client as FirestoreClient
from google.cloud.logging import Client as LoggingClient
from google.cloud.storage import Client as StorageClient
from vertexai.generative_models import GenerativeModel, Part

from vertex_dashboards.models import DashboardWebhook, Summarizer, Summary

PROJECT_ID = "vertex-dashboards"

app = FastAPI()

# Initialize Google Cloud Logging
logging_client = LoggingClient()
logging_client.setup_logging()

# Configure the root logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Firestore client
firestore_client = FirestoreClient(project=PROJECT_ID, database=PROJECT_ID)


@app.post("/summarizer/{summarizer_id}")
async def create_summarizer(summarizer_id: str, summarizer: Summarizer) -> None:
    """Endpoint to create a summarizer."""
    summarizer_dict = summarizer.model_dump()
    firestore_client.collection("summarizers").document(summarizer_id).set(
        summarizer_dict
    )
    logger.info(
        f"Summarizer {summarizer_id} has been created and written to Firestore."
    )


@app.get("/summarizer/{summarizer_id}")
async def get_summarizer(summarizer_id: str) -> Summarizer:
    """Endpoint to get a summarizer."""
    summarizer = (
        firestore_client.collection("summarizers").document(summarizer_id).get()
    )
    return summarizer.to_dict()


@app.get("/summarizer")
async def list_summarizers() -> list[Summarizer]:
    """Endpoint to list all summarizers."""
    summarizers = firestore_client.collection("summarizers").get()
    return [summarizer.to_dict() for summarizer in summarizers]


@app.post("/webhook/{summarizer_id}")
async def run_summarizer(summarizer_id: str, webhook: DashboardWebhook) -> None:
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
    summarizer_config = Summarizer(**summarizer_dict)

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

    # Run the summarizer
    vertexai.init(project=PROJECT_ID, location="us-central1")
    model = GenerativeModel(model_name="gemini-1.5-flash-001")
    pdf_file_uri = f"gs://{bucket.name}/{blob.name}"
    # TODO: Prompt engineering and RAG
    prompt = """
        You are a very professional document summarization specialist.
        Please summarize the given document.
    """
    pdf_file = Part.from_uri(pdf_file_uri, mime_type="application/pdf")
    contents = [pdf_file, prompt]
    response = model.generate_content(contents)

    resend.api_key = os.getenv("RESEND_API_KEY")
    attachment = resend.Attachment(filename="dashboard.pdf", content=attachment_data)
    resend.Emails.send(
        {
            "from": "hello@spectacles.dev",
            "to": summarizer_config.recipients,
            "subject": "Your Dashboard Has Been AI Analyzed!",
            "html": f"<p>Here is the summary of your dashboard: {response.text}</p>",
            "attachments": [attachment],
        }
    )

    # Save the Summary
    summary = Summary(
        body=response.text,
        prompt=prompt,
        report_location=pdf_file_uri,
        recipients=summarizer_config.recipients,
        summarizer_id=summarizer_id,
        timestamp=datetime.now(),
    )
    firestore_client.collection("summaries").document(summarizer_id).collection(
        "summaries"
    ).document(timestamp).set(summary.model_dump())


def main() -> None:
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
