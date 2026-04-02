import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ContactCreate(BaseModel):
    full_name: str
    phone: str
    email: str | None = None
    gender: str | None = None
    age_range: str | None = None
    born_again: str
    discipleship_status: str
    baptized: str
    location: str
    is_student: bool = False
    institution: str | None = None
    course: str | None = None
    follow_up_method: str
    prayer_requests: str | None = None
    notes: str | None = None
    tags: list[str] = []
    team_id: uuid.UUID | None = None


class ContactUpdate(BaseModel):
    status: str | None = None
    discipleship_status: str | None = None
    baptized: str | None = None
    born_again: str | None = None
    follow_up_method: str | None = None
    prayer_requests: str | None = None
    notes: str | None = None
    tags: list[str] | None = None


class ContactRead(BaseModel):
    id: uuid.UUID
    full_name: str
    phone: str
    email: str | None
    gender: str | None
    age_range: str | None
    born_again: str
    discipleship_status: str
    baptized: str
    location: str
    is_student: bool
    institution: str | None
    course: str | None
    follow_up_method: str
    prayer_requests: str | None
    notes: str | None
    status: str
    tags: list
    evangelist_id: uuid.UUID
    evangelist_name: str | None = None   # enriched in the route
    team_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
