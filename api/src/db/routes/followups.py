import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.routes.auth import require_any
from src.db.setup import get_session
from src.db.models.user import User
from src.schemas.followup import FollowUpLogCreate, FollowUpLogRead
from src.services.followup_service import (
    create_follow_up,
    list_follow_ups_for_contact,
    list_my_follow_ups,
)

followups_router = APIRouter(prefix="/api/followups", tags=["followups"])


@followups_router.post("", response_model=FollowUpLogRead, status_code=status.HTTP_201_CREATED)
async def log_follow_up(
    data: FollowUpLogCreate,
    current_user: User = Depends(require_any),
    db: AsyncSession = Depends(get_session),
):
    return await create_follow_up(db, data, created_by=current_user.id)


@followups_router.get("", response_model=list[FollowUpLogRead])
async def get_my_follow_ups(
    limit: int = 50,
    current_user: User = Depends(require_any),
    db: AsyncSession = Depends(get_session),
):
    return await list_my_follow_ups(db, current_user, limit=limit)


@followups_router.get("/contact/{contact_id}", response_model=list[FollowUpLogRead])
async def get_contact_follow_ups(
    contact_id: uuid.UUID,
    current_user: User = Depends(require_any),
    db: AsyncSession = Depends(get_session),
):
    return await list_follow_ups_for_contact(db, contact_id)
