import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.routes.auth import get_current_user, require_admin, require_pastor
from src.db.setup import get_session
from src.db.models.user import User
from src.schemas.auth import InviteResponse, UserCreate, UserRead, UserUpdate
from src.services.auth_service import (
    create_user,
    deactivate_user,
    get_user,
    list_users,
    regenerate_invite_token,
    update_user,
)

users_router = APIRouter(prefix="/api/users", tags=["users"])

ADMIN_ALLOWED_ROLES = {"evangelist", "data_collector"}


@users_router.get("", response_model=list[UserRead])
async def list_users_route(
    role: str | None = None,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_session),
):
    return await list_users(db, role=role)


@users_router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user_route(
    data: UserCreate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_session),
):
    # Admins can only create evangelist/data_collector roles
    if current_user.role == "admin" and data.role not in ADMIN_ALLOWED_ROLES:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            f"Admins can only create roles: {', '.join(ADMIN_ALLOWED_ROLES)}",
        )
    return await create_user(db, data)


@users_router.get("/{user_id}", response_model=UserRead)
async def get_user_route(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    # Allow self-access or admin+
    if current_user.id != user_id and current_user.role not in ("pastor", "admin"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")
    user = await get_user(db, user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return user


@users_router.patch("/{user_id}", response_model=UserRead)
async def update_user_route(
    user_id: uuid.UUID,
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    if current_user.id != user_id and current_user.role not in ("pastor", "admin"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")
    user = await get_user(db, user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return await update_user(db, user, data.model_dump(exclude_none=True))


@users_router.post("/{user_id}/resend-invite", response_model=InviteResponse)
async def resend_invite_route(
    user_id: uuid.UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_session),
):
    """Regenerate an invite token for a user who hasn't set their password yet."""
    if current_user.role == "admin":
        target = await get_user(db, user_id)
        if target and target.role not in ADMIN_ALLOWED_ROLES:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")
    result = await regenerate_invite_token(db, user_id)
    if not result:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "User not found or has already set their password",
        )
    user, token = result
    return InviteResponse(user=UserRead.model_validate(user), token=token)


@users_router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_user_route(
    user_id: uuid.UUID,
    _: User = Depends(require_pastor),
    db: AsyncSession = Depends(get_session),
):
    ok = await deactivate_user(db, user_id)
    if not ok:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found or cannot be deactivated")
