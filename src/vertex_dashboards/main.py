"""Main module for the vertex_dashboards package."""

from fastapi import FastAPI
import base64
from google.cloud import storage
from vertex_dashboards.models import DashboardWebhook

app = FastAPI()


@app.post("/webhook")
async def receive_webhook(webhook: DashboardWebhook) -> dict[str, str]:
    attachment_data = webhook.attachment.data
    if attachment_data:
        decoded_data = base64.b64decode(attachment_data)
        client = storage.Client()
        bucket = client.bucket("your-gcs-bucket-name")
        blob = bucket.blob("decoded_attachment.pdf")
        blob.upload_from_string(decoded_data, content_type="application/pdf")
        return {"message": "Decoded data has been uploaded to GCS bucket."}
    else:
        return {"message": "No attachment data found."}


def main() -> None:
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
