import uuid

from advanced_alchemy.base import UUIDAuditBase
from sqlalchemy import Boolean, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from src.config import settings

# Use JSONB on Postgres for indexing support; fall back to generic JSON on SQLite
if not settings.DATABASE_URL or not settings.DATABASE_URL.startswith("sqlite"):
    from sqlalchemy.dialects.postgresql import JSONB
else:
    JSONB = JSON  # type: ignore[assignment,misc]


class Contact(UUIDAuditBase):
    __tablename__ = "contacts"

    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)        # Male | Female
    age_range: Mapped[str | None] = mapped_column(String(20), nullable=True)     # Under 18 | 18-25 | 26-35 | 36-50 | 50+
    born_again: Mapped[str] = mapped_column(String(20), nullable=False)          # Yes | No | Not Sure
    discipleship_status: Mapped[str] = mapped_column(String(50), nullable=False) # Done | In Progress | Not Started
    baptized: Mapped[str] = mapped_column(String(20), nullable=False)            # Yes | No | Not Sure
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    is_student: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    institution: Mapped[str | None] = mapped_column(String(255), nullable=True)
    course: Mapped[str | None] = mapped_column(String(255), nullable=True)
    follow_up_method: Mapped[str] = mapped_column(String(50), nullable=False)    # Call | WhatsApp | Visit | Church Invitation
    prayer_requests: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="New")
    tags: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    evangelist_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    team_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("teams.id", ondelete="SET NULL"), nullable=True
    )
