import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.routes.auth import get_current_user, require_admin, require_any
from src.db.setup import get_session
from src.db.models.user import User
from src.schemas.contact import ContactCreate, ContactRead, ContactUpdate
from src.services.contacts_service import (
    create_contact,
    delete_contact,
    get_contact,
    list_contacts,
    update_contact,
)

contacts_router = APIRouter(prefix="/api/contacts", tags=["contacts"])


@contacts_router.get("/", response_model=list[ContactRead])
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
    return await list_contacts(
        db, current_user,
        status=status, team_id=team_id, evangelist_id=evangelist_id,
        search=search, is_student=is_student, page=page, limit=limit,
    )


@contacts_router.post("/", response_model=ContactRead, status_code=status.HTTP_201_CREATED)
async def create_contact_route(
    data: ContactCreate,
    current_user: User = Depends(require_any),
    db: AsyncSession = Depends(get_session),
):
    return await create_contact(db, data, evangelist_id=current_user.id)


@contacts_router.get("/{contact_id}", response_model=ContactRead)
async def get_contact_route(
    contact_id: uuid.UUID,
    current_user: User = Depends(require_any),
    db: AsyncSession = Depends(get_session),
):
    contact = await get_contact(db, contact_id, current_user)
    if not contact:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Contact not found")
    return contact


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
    return await update_contact(db, contact, data)


@contacts_router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact_route(
    contact_id: uuid.UUID,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_session),
):
    ok = await delete_contact(db, contact_id)
    if not ok:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Contact not found")
