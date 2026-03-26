import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class SessionCreate(BaseModel):
    date: date
    team_id: uuid.UUID
    location: str
    evangelists_present: int = 0
    contacts_made: int = 0
    saved_count: int = 0
    prayer_count: int = 0
    notes: str | None = None


class SessionUpdate(BaseModel):
    evangelists_present: int | None = None
    contacts_made: int | None = None
    saved_count: int | None = None
    prayer_count: int | None = None
    notes: str | None = None


class SessionRead(BaseModel):
    id: uuid.UUID
    date: date
    team_id: uuid.UUID
    location: str
    evangelists_present: int
    contacts_made: int
    saved_count: int
    prayer_count: int
    notes: str | None
    created_by: uuid.UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
