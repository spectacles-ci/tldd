"""Models for the vertex_dashboards package."""

from typing import Optional

from pydantic import BaseModel, EmailStr


class Attachment(BaseModel):
    data: str
    mimetype: str = "application/pdf;base64"
    extension: str = "pdf"


class ScheduledPlan(BaseModel):
    title: str
    url: str
    scheduled_plan_id: int
    type: str


class DashboardWebhook(BaseModel):
    attachment: Attachment
    scheduled_plan: ScheduledPlan
    type: str = "dashboard"


class Summarizer(BaseModel):
    recipients: list[EmailStr]
    name: str
    use_prior_reports: bool
    attach_pdf: bool
    custom_instructions: Optional[str] = None
