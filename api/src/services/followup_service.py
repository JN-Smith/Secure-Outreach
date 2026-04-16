import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.followup import FollowUpLog
from src.db.models.contact import Contact
from src.db.models.user import User
from src.schemas.followup import FollowUpLogCreate, FollowUpLogRead


async def _enrich(logs: list[FollowUpLog], db: AsyncSession) -> list[FollowUpLogRead]:
    """Attach contact_name and evangelist_name to follow-up logs."""
    contact_ids = list({l.contact_id for l in logs})
    user_ids = list({l.created_by for l in logs})

    contact_map: dict[uuid.UUID, str] = {}
    user_map: dict[uuid.UUID, str] = {}

    if contact_ids:
        rows = await db.execute(select(Contact.id, Contact.full_name).where(Contact.id.in_(contact_ids)))
        contact_map = {r.id: r.full_name for r in rows.all()}
    if user_ids:
        rows = await db.execute(select(User.id, User.full_name).where(User.id.in_(user_ids)))
        user_map = {r.id: r.full_name for r in rows.all()}

    result = []
    for log in logs:
        data = FollowUpLogRead.model_validate(log)
        data.contact_name = contact_map.get(log.contact_id)
        data.evangelist_name = user_map.get(log.created_by)
        result.append(data)
    return result


async def create_follow_up(
    db: AsyncSession, data: FollowUpLogCreate, created_by: uuid.UUID
) -> FollowUpLogRead:
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
    enriched = await _enrich([log], db)
    return enriched[0]


async def list_follow_ups_for_contact(
    db: AsyncSession, contact_id: uuid.UUID
) -> list[FollowUpLogRead]:
    result = await db.execute(
        select(FollowUpLog)
        .where(FollowUpLog.contact_id == contact_id)
        .order_by(FollowUpLog.date.desc())
    )
    return await _enrich(list(result.scalars().all()), db)


async def list_my_follow_ups(
    db: AsyncSession, user: User, limit: int = 50
) -> list[FollowUpLogRead]:
    """All follow-up logs, most recent first. Evangelists see only their own."""
    q = select(FollowUpLog).order_by(FollowUpLog.date.desc()).limit(limit)
    if user.role == "evangelist":
        q = q.where(FollowUpLog.created_by == user.id)
    result = await db.execute(q)
    return await _enrich(list(result.scalars().all()), db)
