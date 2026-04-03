import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.routes.auth import get_current_user, require_admin, require_any
from src.db.setup import get_session
from src.db.models.user import User
from src.schemas.session import SessionCreate, SessionRead, SessionUpdate
from src.services.sessions_service import (
    create_session,
    delete_outreach_session,
    get_outreach_session,
    list_sessions,
    update_session,
)

sessions_router = APIRouter(prefix="/api/outreach-sessions", tags=["outreach-sessions"])


@sessions_router.get("", response_model=list[SessionRead])
async def list_sessions_route(
    team_id: uuid.UUID | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    current_user: User = Depends(require_any),
    db: AsyncSession = Depends(get_session),
):
    return await list_sessions(db, current_user, team_id=team_id, date_from=date_from, date_to=date_to)


@sessions_router.post("", response_model=SessionRead, status_code=status.HTTP_201_CREATED)
async def create_session_route(
    data: SessionCreate,
    current_user: User = Depends(require_any),
    db: AsyncSession = Depends(get_session),
):
    return await create_session(db, data, created_by=current_user.id)


@sessions_router.get("/{session_id}", response_model=SessionRead)
async def get_session_route(
    session_id: uuid.UUID,
    _: User = Depends(require_any),
    db: AsyncSession = Depends(get_session),
):
    s = await get_outreach_session(db, session_id)
    if not s:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
    return s


@sessions_router.patch("/{session_id}", response_model=SessionRead)
async def update_session_route(
    session_id: uuid.UUID,
    data: SessionUpdate,
    current_user: User = Depends(require_any),
    db: AsyncSession = Depends(get_session),
):
    s = await get_outreach_session(db, session_id)
    if not s:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
    if current_user.role in ("evangelist", "data_collector") and s.created_by != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Cannot edit another evangelist's session")
    return await update_session(db, s, data)


@sessions_router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session_route(
    session_id: uuid.UUID,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_session),
):
    ok = await delete_outreach_session(db, session_id)
    if not ok:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
