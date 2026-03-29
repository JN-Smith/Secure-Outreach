from datetime import datetime

from advanced_alchemy.base import UUIDAuditBase
from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column


class User(UUIDAuditBase):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)  # None = invite pending
    role: Mapped[str] = mapped_column(String(50), nullable=False)  # pastor | admin | evangelist | data_collector
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    invite_token: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    login_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    @property
    def invite_pending(self) -> bool:
        return self.password_hash is None
