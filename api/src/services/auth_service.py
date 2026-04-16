import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.config import settings
from src.db.models.user import User
from src.schemas.auth import EvangelistInvite, TokenResponse, UserCreate, UserRead


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def _create_access_token(user: User) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_ACCESS_EXPIRE_MINUTES)
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "exp": expire,
        "type": "access",
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def _create_refresh_token(user: User) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_EXPIRE_DAYS)
    payload = {
        "sub": str(user.id),
        "exp": expire,
        "type": "refresh",
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


async def login(db: AsyncSession, email: str, password: str) -> Optional[tuple[str, str, User]]:
    result = await db.execute(select(User).where(User.email == email, User.is_active == True))  # noqa: E712
    user = result.scalar_one_or_none()
    if not user or user.password_hash is None or not verify_password(password, user.password_hash):
        return None
    user.last_login_at = datetime.now(timezone.utc)
    user.login_count = (user.login_count or 0) + 1
    await db.commit()
    await db.refresh(user)
    return _create_access_token(user), _create_refresh_token(user), user


async def get_user_from_token(token: str, db: AsyncSession) -> Optional[User]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "access":
            return None
        user_id = uuid.UUID(payload["sub"])
    except (JWTError, KeyError, ValueError):
        return None
    result = await db.execute(select(User).where(User.id == user_id, User.is_active == True))  # noqa: E712
    return result.scalar_one_or_none()


async def get_user_from_refresh_token(token: str, db: AsyncSession) -> Optional[User]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            return None
        user_id = uuid.UUID(payload["sub"])
    except (JWTError, KeyError, ValueError):
        return None
    result = await db.execute(select(User).where(User.id == user_id, User.is_active == True))  # noqa: E712
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, data: UserCreate) -> User:
    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
        full_name=data.full_name,
        phone=data.phone,
        location=data.location,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def create_invite(db: AsyncSession, data: EvangelistInvite) -> tuple[User, str]:
    token = secrets.token_urlsafe(32)
    user = User(
        email=data.email,
        password_hash=None,
        role=data.role,
        full_name=data.full_name,
        phone=data.phone,
        invite_token=token,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user, token


async def regenerate_invite_token(db: AsyncSession, user_id: uuid.UUID) -> Optional[tuple[User, str]]:
    result = await db.execute(
        select(User).where(User.id == user_id, User.is_active == True)  # noqa: E712
    )
    user = result.scalar_one_or_none()
    if not user:
        return None
    token = secrets.token_urlsafe(32)
    user.invite_token = token
    await db.commit()
    await db.refresh(user)
    return user, token


async def get_invite_info(db: AsyncSession, token: str) -> Optional[User]:
    result = await db.execute(
        select(User).where(User.invite_token == token, User.is_active == True)  # noqa: E712
    )
    return result.scalar_one_or_none()


async def accept_invite(db: AsyncSession, token: str, password: str) -> Optional[User]:
    result = await db.execute(
        select(User).where(User.invite_token == token, User.is_active == True)  # noqa: E712
    )
    user = result.scalar_one_or_none()
    if not user:
        return None
    user.password_hash = hash_password(password)
    user.invite_token = None
    await db.commit()
    await db.refresh(user)
    return user


async def list_users(db: AsyncSession, role: str | None = None) -> list[User]:
    query = select(User).where(User.is_active == True).order_by(User.created_at)  # noqa: E712
    if role:
        query = query.where(User.role == role)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_user(db: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def update_user(db: AsyncSession, user: User, data: dict) -> User:
    for key, value in data.items():
        if value is not None:
            setattr(user, key, value)
    await db.commit()
    await db.refresh(user)
    return user


async def deactivate_user(db: AsyncSession, user_id: uuid.UUID) -> bool:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or user.role == "pastor":
        return False
    user.is_active = False
    await db.commit()
    return True


async def user_count(db: AsyncSession) -> int:
    result = await db.execute(select(User))
    return len(result.scalars().all())
