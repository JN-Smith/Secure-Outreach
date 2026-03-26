import uuid
from typing import Optional

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.contact import Contact
from src.db.models.team import TeamMember
from src.db.models.user import User
from src.schemas.contact import ContactCreate, ContactUpdate


async def create_contact(db: AsyncSession, data: ContactCreate, evangelist_id: uuid.UUID) -> Contact:
    contact = Contact(
        full_name=data.full_name,
        phone=data.phone,
        email=data.email,
        gender=data.gender,
        age_range=data.age_range,
        born_again=data.born_again,
        discipleship_status=data.discipleship_status,
        baptized=data.baptized,
        location=data.location,
        is_student=data.is_student,
        institution=data.institution,
        course=data.course,
        follow_up_method=data.follow_up_method,
        prayer_requests=data.prayer_requests,
        notes=data.notes,
        tags=data.tags,
        team_id=data.team_id,
        evangelist_id=evangelist_id,
    )
    db.add(contact)
    await db.commit()
    await db.refresh(contact)
    return contact


async def list_contacts(
    db: AsyncSession,
    current_user: User,
    status: str | None = None,
    team_id: uuid.UUID | None = None,
    evangelist_id: uuid.UUID | None = None,
    search: str | None = None,
    is_student: bool | None = None,
    page: int = 1,
    limit: int = 50,
) -> list[Contact]:
    query = select(Contact)

    # Role-based scoping
    if current_user.role == "evangelist" or current_user.role == "data_collector":
        query = query.where(Contact.evangelist_id == current_user.id)
    elif current_user.role == "admin":
        # Admin sees contacts from their managed teams
        teams_result = await db.execute(
            select(TeamMember.team_id).where(TeamMember.user_id == current_user.id)
        )
        admin_team_ids = [row.team_id for row in teams_result.all()]
        query = query.where(Contact.team_id.in_(admin_team_ids))

    # Additional filters
    if status:
        query = query.where(Contact.status == status)
    if team_id:
        query = query.where(Contact.team_id == team_id)
    if evangelist_id:
        query = query.where(Contact.evangelist_id == evangelist_id)
    if is_student is not None:
        query = query.where(Contact.is_student == is_student)
    if search:
        query = query.where(
            or_(
                Contact.full_name.ilike(f"%{search}%"),
                Contact.phone.ilike(f"%{search}%"),
                Contact.location.ilike(f"%{search}%"),
            )
        )

    query = query.order_by(Contact.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_contact(db: AsyncSession, contact_id: uuid.UUID, current_user: User) -> Optional[Contact]:
    result = await db.execute(select(Contact).where(Contact.id == contact_id))
    contact = result.scalar_one_or_none()
    if not contact:
        return None
    # Scope check
    if current_user.role in ("evangelist", "data_collector") and contact.evangelist_id != current_user.id:
        return None
    return contact


async def update_contact(db: AsyncSession, contact: Contact, data: ContactUpdate) -> Contact:
    update_data = data.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(contact, key, value)
    await db.commit()
    await db.refresh(contact)
    return contact


async def delete_contact(db: AsyncSession, contact_id: uuid.UUID) -> bool:
    result = await db.execute(select(Contact).where(Contact.id == contact_id))
    contact = result.scalar_one_or_none()
    if not contact:
        return False
    await db.delete(contact)
    await db.commit()
    return True
