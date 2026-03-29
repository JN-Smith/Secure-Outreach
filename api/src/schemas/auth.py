import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserRead"


class UserRead(BaseModel):
    id: uuid.UUID
    email: str
    role: str
    full_name: str
    phone: str | None
    location: str | None
    is_active: bool
    invite_pending: bool = False
    last_login_at: datetime | None = None
    login_count: int = 0
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    email: str
    password: str
    role: str  # admin | evangelist | data_collector (pastor can create any, admin can only create evangelist/data_collector)
    full_name: str
    phone: str | None = None
    location: str | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    location: str | None = None
    is_active: bool | None = None


class EvangelistInvite(BaseModel):
    full_name: str
    email: str
    phone: str | None = None
    role: str = "evangelist"


class InviteTokenInfo(BaseModel):
    email: str
    full_name: str


class AcceptInvite(BaseModel):
    token: str
    password: str


class InviteResponse(BaseModel):
    user: UserRead
    token: str
