import uuid

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.setup import get_session
from src.db.models.user import User
from src.schemas.auth import (
    AcceptInvite,
    EvangelistInvite,
    InviteResponse,
    InviteTokenInfo,
    LoginRequest,
    TokenResponse,
    UserCreate,
    UserRead,
    UserUpdate,
)
from src.services.auth_service import (
    accept_invite,
    create_invite,
    create_user,
    deactivate_user,
    get_invite_info,
    get_user,
    get_user_from_refresh_token,
    get_user_from_token,
    list_users,
    login,
    update_user,
    user_count,
)

auth_router = APIRouter(prefix="/api/auth", tags=["auth"])
_bearer = HTTPBearer()

ADMIN_ALLOWED_ROLES = {"evangelist", "data_collector"}


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: AsyncSession = Depends(get_session),
) -> User:
    user = await get_user_from_token(credentials.credentials, db)
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    return user


def require_role(*roles):
    async def dep(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")
        return current_user
    return dep


require_pastor = require_role("pastor")
require_admin = require_role("pastor", "admin")
require_any = require_role("pastor", "admin", "evangelist", "data_collector")


@auth_router.post("/login", response_model=TokenResponse)
async def login_route(data: LoginRequest, response: Response, db: AsyncSession = Depends(get_session)):
    result = await login(db, data.email, data.password)
    if not result:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    access_token, refresh_token, user = result
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=False,  # set to True in production with HTTPS
        max_age=7 * 24 * 60 * 60,
    )
    return TokenResponse(access_token=access_token, user=UserRead.model_validate(user))


@auth_router.post("/refresh")
async def refresh_route(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    db: AsyncSession = Depends(get_session),
):
    if not refresh_token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "No refresh token")
    user = await get_user_from_refresh_token(refresh_token, db)
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired refresh token")
    from src.services.auth_service import _create_access_token, _create_refresh_token
    new_access = _create_access_token(user)
    new_refresh = _create_refresh_token(user)
    response.set_cookie(
        key="refresh_token",
        value=new_refresh,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=7 * 24 * 60 * 60,
    )
    return {"access_token": new_access, "token_type": "bearer"}


@auth_router.get("/me", response_model=UserRead)
async def me_route(current_user: User = Depends(get_current_user)):
    return current_user


@auth_router.post("/logout")
async def logout_route(response: Response, _: User = Depends(get_current_user)):
    response.delete_cookie("refresh_token")
    return {"message": "Logged out"}


@auth_router.post("/setup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def setup_route(data: UserCreate, response: Response, db: AsyncSession = Depends(get_session)):
    """Create the first pastor. Only works when no users exist."""
    if await user_count(db) > 0:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Setup already complete")
    data.role = "pastor"
    user = await create_user(db, data)
    result = await login(db, user.email, data.password)
    access_token, refresh_token, user = result
    response.set_cookie(
        key="refresh_token", value=refresh_token, httponly=True, samesite="lax", secure=False,
        max_age=7 * 24 * 60 * 60,
    )
    return TokenResponse(access_token=access_token, user=UserRead.model_validate(user))


@auth_router.post("/invite", response_model=InviteResponse, status_code=status.HTTP_201_CREATED)
async def invite_user_route(
    data: EvangelistInvite,
    request: Request,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_session),
):
    """Create an evangelist account and return an invite link for them to set their password."""
    if current_user.role == "admin" and data.role not in ADMIN_ALLOWED_ROLES:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            f"Admins can only invite roles: {', '.join(ADMIN_ALLOWED_ROLES)}",
        )
    user, token = await create_invite(db, data)
    return InviteResponse(user=UserRead.model_validate(user), token=token)


@auth_router.get("/invite/{token}", response_model=InviteTokenInfo)
async def get_invite_info_route(token: str, db: AsyncSession = Depends(get_session)):
    """Validate an invite token and return basic info (public endpoint)."""
    user = await get_invite_info(db, token)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Invalid or expired invite link")
    return InviteTokenInfo(email=user.email, full_name=user.full_name)


@auth_router.post("/accept-invite", response_model=TokenResponse)
async def accept_invite_route(
    data: AcceptInvite,
    response: Response,
    db: AsyncSession = Depends(get_session),
):
    """Accept an invite by setting a password. Logs the user in on success."""
    user = await accept_invite(db, data.token, data.password)
    if not user:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired invite link")
    result = await login(db, user.email, data.password)
    access_token, refresh_token, user = result
    response.set_cookie(
        key="refresh_token", value=refresh_token, httponly=True,
        samesite="lax", secure=False, max_age=7 * 24 * 60 * 60,
    )
    return TokenResponse(access_token=access_token, user=UserRead.model_validate(user))
