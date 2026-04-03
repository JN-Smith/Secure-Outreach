import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.routes.auth import get_current_user, require_admin, require_any
from src.db.setup import get_session
from src.db.models.user import User
from src.db.models.contact import Contact
from src.db.models.team import TeamMember
from src.schemas.contact import ContactCreate, ContactRead, ContactUpdate
from src.services.contacts_service import (
    create_contact,
    delete_contact,
    get_contact,
    list_contacts,
    update_contact,
)

contacts_router = APIRouter(prefix="/api/contacts", tags=["contacts"])


async def _enrich(contacts: list[Contact], db: AsyncSession) -> list[ContactRead]:
    """Attach evangelist_name to a list of contacts in a single query."""
    ids = list({c.evangelist_id for c in contacts})
    if ids:
        rows = await db.execute(select(User.id, User.full_name).where(User.id.in_(ids)))
        name_map: dict[uuid.UUID, str] = {row.id: row.full_name for row in rows.all()}
    else:
        name_map = {}

    results = []
    for c in contacts:
        data = ContactRead.model_validate(c)
        data.evangelist_name = name_map.get(c.evangelist_id)
        results.append(data)
    return results


@contacts_router.get("", response_model=list[ContactRead])
async def list_contacts_route(
    status: str | None = None,
    team_id: uuid.UUID | None = None,
    evangelist_id: uuid.UUID | None = None,
    search: str | None = None,
    is_student: bool | None = None,
    page: int = 1,
    limit: int = 50,
    current_user: User = Depends(require_any),
    db: AsyncSession = Depends(get_session),
):
    contacts = await list_contacts(
        db, current_user,
        status=status, team_id=team_id, evangelist_id=evangelist_id,
        search=search, is_student=is_student, page=page, limit=limit,
    )
    return await _enrich(contacts, db)


@contacts_router.post("", response_model=ContactRead, status_code=status.HTTP_201_CREATED)
async def create_contact_route(
    data: ContactCreate,
    current_user: User = Depends(require_any),
    db: AsyncSession = Depends(get_session),
):
    # Auto-assign team from the user's membership if not supplied
    if not data.team_id:
        result = await db.execute(
            select(TeamMember.team_id).where(TeamMember.user_id == current_user.id).limit(1)
        )
        row = result.scalar_one_or_none()
        if row:
            data = data.model_copy(update={"team_id": row})
    contact = await create_contact(db, data, evangelist_id=current_user.id)
    enriched = await _enrich([contact], db)
    return enriched[0]


@contacts_router.get("/{contact_id}", response_model=ContactRead)
async def get_contact_route(
    contact_id: uuid.UUID,
    current_user: User = Depends(require_any),
    db: AsyncSession = Depends(get_session),
):
    contact = await get_contact(db, contact_id, current_user)
    if not contact:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Contact not found")
    enriched = await _enrich([contact], db)
    return enriched[0]


@contacts_router.patch("/{contact_id}", response_model=ContactRead)
async def update_contact_route(
    contact_id: uuid.UUID,
    data: ContactUpdate,
    current_user: User = Depends(require_any),
    db: AsyncSession = Depends(get_session),
):
    contact = await get_contact(db, contact_id, current_user)
    if not contact:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Contact not found")
    contact = await update_contact(db, contact, data)
    enriched = await _enrich([contact], db)
    return enriched[0]


@contacts_router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact_route(
    contact_id: uuid.UUID,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_session),
):
    ok = await delete_contact(db, contact_id)
    if not ok:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Contact not found")
