import uuid

from advanced_alchemy.base import UUIDAuditBase
from sqlalchemy import ForeignKey, JSON, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from src.config import settings

# Use JSONB on Postgres for indexing support; fall back to generic JSON on SQLite
if not settings.DATABASE_URL or not settings.DATABASE_URL.startswith("sqlite"):
    from sqlalchemy.dialects.postgresql import JSONB
else:
    JSONB = JSON  # type: ignore[assignment,misc]


class Team(UUIDAuditBase):
    __tablename__ = "teams"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    zone: Mapped[str] = mapped_column(String(100), nullable=False)
    lead_evangelist_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    outreach_days: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    active_zones: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)


class TeamMember(UUIDAuditBase):
    __tablename__ = "team_members"
    __table_args__ = (UniqueConstraint("team_id", "user_id", name="uq_team_member"),)

    team_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("teams.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    team_role: Mapped[str] = mapped_column(String(20), nullable=False, default="member")  # lead | member
