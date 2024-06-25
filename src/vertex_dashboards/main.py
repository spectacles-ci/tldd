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

from vertex_dashboards.models import DashboardWebhook, Summarizer

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


@app.post("/webhook")
async def receive_webhook(webhook: DashboardWebhook) -> None:
    attachment_data = webhook.attachment.data
    decoded_data = base64.b64decode(attachment_data)
    storage_client = StorageClient(project=PROJECT_ID)
    bucket = storage_client.bucket("vertex-dashboards")
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    blob = bucket.blob(f"decoded_attachment_{timestamp}.pdf")
    blob.upload_from_string(decoded_data, content_type="application/pdf")
    logger.info(f"Decoded data has been uploaded to GCS bucket: {blob.name}")

    vertexai.init(project=PROJECT_ID, location="us-central1")
    model = GenerativeModel(model_name="gemini-1.5-flash-001")
    pdf_file_uri = f"gs://{bucket.name}/{blob.name}"
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
            "to": "dylan@spectacles.dev",
            "subject": "Your Dashboard Has Been AI Analyzed!",
            "html": f"<p>Here is the summary of your dashboard: {response.text}</p>",
            "attachments": [attachment],
        }
    )


def main() -> None:
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
