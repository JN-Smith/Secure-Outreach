import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.followup import FollowUpLog
from src.db.models.contact import Contact
from src.db.models.user import User
from src.schemas.followup import FollowUpLogCreate


async def create_follow_up(
    db: AsyncSession, data: FollowUpLogCreate, created_by: uuid.UUID
) -> FollowUpLog:
    log = FollowUpLog(
        contact_id=data.contact_id,
        created_by=created_by,
        date=data.date,
        method=data.method,
        outcome=data.outcome,
        notes=data.notes,
        new_status=data.new_status,
    )
    db.add(log)

    # Optionally update the contact status
    if data.new_status:
        result = await db.execute(select(Contact).where(Contact.id == data.contact_id))
        contact = result.scalar_one_or_none()
        if contact:
            contact.status = data.new_status

    await db.commit()
    await db.refresh(log)
    return log


async def list_follow_ups_for_contact(
    db: AsyncSession, contact_id: uuid.UUID
) -> list[FollowUpLog]:
    result = await db.execute(
        select(FollowUpLog)
        .where(FollowUpLog.contact_id == contact_id)
        .order_by(FollowUpLog.date.desc())
    )
    return list(result.scalars().all())


async def list_my_follow_ups(
    db: AsyncSession, user: User, limit: int = 50
) -> list[FollowUpLog]:
    """All follow-up logs created by this user, most recent first."""
    q = select(FollowUpLog).order_by(FollowUpLog.date.desc()).limit(limit)
    if user.role == "evangelist":
        q = q.where(FollowUpLog.created_by == user.id)
    result = await db.execute(q)
    return list(result.scalars().all())
