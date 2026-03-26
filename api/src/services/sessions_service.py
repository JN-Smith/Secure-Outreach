import uuid
from datetime import date
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.session import OutreachSession
from src.db.models.team import TeamMember
from src.db.models.user import User
from src.schemas.session import SessionCreate, SessionUpdate


async def create_session(db: AsyncSession, data: SessionCreate, created_by: uuid.UUID) -> OutreachSession:
    session = OutreachSession(
        date=data.date,
        team_id=data.team_id,
        location=data.location,
        evangelists_present=data.evangelists_present,
        contacts_made=data.contacts_made,
        saved_count=data.saved_count,
        prayer_count=data.prayer_count,
        notes=data.notes,
        created_by=created_by,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


async def list_sessions(
    db: AsyncSession,
    current_user: User,
    team_id: uuid.UUID | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
) -> list[OutreachSession]:
    query = select(OutreachSession)

    if current_user.role in ("evangelist", "data_collector"):
        query = query.where(OutreachSession.created_by == current_user.id)
    elif current_user.role == "admin":
        teams_result = await db.execute(
            select(TeamMember.team_id).where(TeamMember.user_id == current_user.id)
        )
        admin_team_ids = [row.team_id for row in teams_result.all()]
        query = query.where(OutreachSession.team_id.in_(admin_team_ids))

    if team_id:
        query = query.where(OutreachSession.team_id == team_id)
    if date_from:
        query = query.where(OutreachSession.date >= date_from)
    if date_to:
        query = query.where(OutreachSession.date <= date_to)

    query = query.order_by(OutreachSession.date.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_outreach_session(db: AsyncSession, session_id: uuid.UUID) -> Optional[OutreachSession]:
    result = await db.execute(select(OutreachSession).where(OutreachSession.id == session_id))
    return result.scalar_one_or_none()


async def update_session(db: AsyncSession, session: OutreachSession, data: SessionUpdate) -> OutreachSession:
    update_data = data.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(session, key, value)
    await db.commit()
    await db.refresh(session)
    return session


async def delete_outreach_session(db: AsyncSession, session_id: uuid.UUID) -> bool:
    result = await db.execute(select(OutreachSession).where(OutreachSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        return False
    await db.delete(session)
    await db.commit()
    return True
