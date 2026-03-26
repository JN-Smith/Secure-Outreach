import uuid
from datetime import date

from advanced_alchemy.base import UUIDAuditBase
from sqlalchemy import Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column


class OutreachSession(UUIDAuditBase):
    __tablename__ = "outreach_sessions"

    date: Mapped[date] = mapped_column(Date, nullable=False)
    team_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("teams.id", ondelete="CASCADE"), nullable=False
    )
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    evangelists_present: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    contacts_made: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    saved_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    prayer_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
