import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TeamCreate(BaseModel):
    name: str
    zone: str
    lead_evangelist_id: uuid.UUID | None = None
    outreach_days: list[str] = []
    active_zones: list[str] = []


class TeamUpdate(BaseModel):
    name: str | None = None
    zone: str | None = None
    lead_evangelist_id: uuid.UUID | None = None
    outreach_days: list[str] | None = None
    active_zones: list[str] | None = None


class TeamRead(BaseModel):
    id: uuid.UUID
    name: str
    zone: str
    lead_evangelist_id: uuid.UUID | None
    outreach_days: list
    active_zones: list
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TeamMemberAdd(BaseModel):
    user_id: uuid.UUID
    team_role: str = "member"  # lead | member


class TeamMemberRead(BaseModel):
    id: uuid.UUID
    team_id: uuid.UUID
    user_id: uuid.UUID
    team_role: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
