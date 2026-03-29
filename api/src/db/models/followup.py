import uuid

from advanced_alchemy.base import UUIDAuditBase
from sqlalchemy import Date, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column
import datetime


class FollowUpLog(UUIDAuditBase):
    __tablename__ = "follow_up_logs"

    contact_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("contacts.id", ondelete="CASCADE"), nullable=False
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    date: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    method: Mapped[str] = mapped_column(String(50), nullable=False)   # Call | WhatsApp | Visit | Church Invitation
    outcome: Mapped[str] = mapped_column(String(50), nullable=False)  # Positive | Neutral | No Response | Not Interested
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    new_status: Mapped[str | None] = mapped_column(String(50), nullable=True)  # optional status update applied to contact
