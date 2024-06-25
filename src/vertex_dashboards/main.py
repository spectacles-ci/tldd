"""Main module for the vertex_dashboards package."""

import base64
import logging
import os
from datetime import datetime
from typing import Any

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
async def get_summarizer(summarizer_id: str) -> dict[str, Any]:
    """Endpoint to get a summarizer."""
    summarizer = (
        firestore_client.collection("summarizers").document(summarizer_id).get()
    )
    return summarizer.to_dict()  # type: ignore[no-any-return]


@app.get("/summarizer")
async def list_summarizers() -> list[dict[str, Any]]:
    """Endpoint to list all summarizers."""
    summarizers = firestore_client.collection("summarizers").get()
    return [summarizer.to_dict() for summarizer in summarizers]


@app.delete("/summarizer/{summarizer_id}")
async def delete_summarizer(summarizer_id: str) -> None:
    """Endpoint to delete a summarizer."""
    firestore_client.collection("summarizers").document(summarizer_id).delete()


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
    model = GenerativeModel(model_name="gemini-1.5-pro-001")
    pdf_file_uri = f"gs://{bucket.name}/{blob.name}"
    # TODO: Prompt engineering and RAG
    prompt = """
You are provided with a dashboard containing various data visualizations, charts, graphs, and key metrics. Your task is to analyze the dashboard and provide a comprehensive, data-dense summary. Follow these guidelines to ensure a thorough and accurate analysis:

	1.	Overall Summary: Start with a brief overview of the dashboard’s theme and purpose.
	2.	Key Metrics and Trends: Identify and describe the most important metrics and trends. Highlight significant changes, specific values, and relevant timeframes.
	3.	Interesting Insights: Focus on notable data points and insights. Emphasize unusual patterns, correlations, or significant changes, ensuring accuracy.
	4.	Comparative Analysis: Summarize any comparisons (e.g., year-over-year, month-over-month, category comparisons) and what they indicate.
	5.	Performance Indicators: Discuss key performance indicators (KPIs) and their status. Mention if they are meeting, exceeding, or falling short of targets.
	6.	Actionable Insights: Identify actionable insights derived from the data. Suggest possible actions or decisions informed by these insights.
	7.	Confidence Level: Only highlight data and insights that you are confident in. Avoid unclear or ambiguous points.

Example Analysis Structure:

	•	Introduction: Briefly introduce the dashboard’s purpose and focus.
	•	Key Findings: List significant metrics and trends with specific details.
	•	Detailed Insights: Elaborate on noteworthy and confident data points.
	•	Comparative Analysis: Discuss any relevant comparative data.
	•	Conclusion: Summarize actionable insights and suggest potential actions.

Sample Text:

“The dashboard provides an overview of the company’s sales performance over the past year. Key metrics include a 15% increase in monthly sales with a peak in December 2023 and a steady upward trend in quarterly revenue.

A notable insight is the correlation between marketing spend and sales performance, particularly in North America and Europe, which have higher sales figures linked to increased marketing investments.

Comparative analysis shows that Q4 2023 sales were 20% higher than Q4 2022, indicating effective holiday sales strategies.

The data suggests increasing marketing efforts in underperforming regions could boost sales. Maintaining current strategies in high-performing regions is advisable to sustain growth.

Overall, the dashboard highlights a positive sales trajectory with actionable insights for further growth.
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
    firestore_client.collection("summaries").document(
        f"{summarizer_id}-{timestamp}"
    ).set(summary.model_dump())


def main() -> None:
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
