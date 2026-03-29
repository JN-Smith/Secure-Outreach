import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.routes.auth import require_admin, require_any, require_pastor
from src.db.setup import get_session
from src.db.models.team import TeamMember
from src.db.models.user import User
from src.schemas.dashboard import AdminDashboard, EvangelistDashboard, EvangelistKPI, PastorDashboard
from src.services.dashboard_service import (
    get_admin_dashboard,
    get_evangelist_analytics,
    get_evangelist_dashboard,
    get_pastor_dashboard,
)

dashboard_router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@dashboard_router.get("/evangelist", response_model=EvangelistDashboard)
async def evangelist_dashboard(
    current_user: User = Depends(require_any),
    db: AsyncSession = Depends(get_session),
):
    return await get_evangelist_dashboard(db, current_user)


@dashboard_router.get("/admin", response_model=AdminDashboard)
async def admin_dashboard(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_session),
):
    return await get_admin_dashboard(db, current_user)


@dashboard_router.get("/pastor", response_model=PastorDashboard)
async def pastor_dashboard(
    _: User = Depends(require_pastor),
    db: AsyncSession = Depends(get_session),
):
    return await get_pastor_dashboard(db)


@dashboard_router.get("/evangelist-analytics", response_model=list[EvangelistKPI])
async def evangelist_analytics_route(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_session),
):
    """Per-evangelist KPIs: contacts, follow-ups, login stats."""
    if current_user.role == "admin":
        teams_result = await db.execute(
            select(TeamMember.team_id).where(TeamMember.user_id == current_user.id)
        )
        team_ids = [row.team_id for row in teams_result.all()]
    else:
        team_ids = None  # pastor sees all
    return await get_evangelist_analytics(db, team_ids)
