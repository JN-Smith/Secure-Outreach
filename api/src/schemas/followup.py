import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class FollowUpLogCreate(BaseModel):
    contact_id: uuid.UUID
    date: date
    method: str
    outcome: str
    notes: str | None = None
    new_status: str | None = None   # if set, the contact's status is updated too


class FollowUpLogRead(BaseModel):
    id: uuid.UUID
    contact_id: uuid.UUID
    created_by: uuid.UUID
    date: date
    method: str
    outcome: str
    notes: str | None
    new_status: str | None
    created_at: datetime
    contact_name: str | None = None
    evangelist_name: str | None = None

    model_config = ConfigDict(from_attributes=True)
