"""Models for the vertex_dashboards package."""

from pydantic import BaseModel


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
