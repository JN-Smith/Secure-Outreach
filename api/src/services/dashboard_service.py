import uuid
from datetime import date, timedelta

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.contact import Contact
from src.db.models.session import OutreachSession
from src.db.models.team import Team, TeamMember
from src.db.models.user import User
from src.schemas.dashboard import (
    AdminDashboard,
    DailyTrendPoint,
    EvangelistDashboard,
    PastorDashboard,
    PipelineStage,
    RecentSession,
    TeamPerformance,
    TopEvangelist,
    WeeklyTrendPoint,
)

DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


async def get_evangelist_dashboard(db: AsyncSession, user: User) -> EvangelistDashboard:
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)

    base = select(func.count()).select_from(Contact).where(Contact.evangelist_id == user.id)

    total = await db.scalar(base) or 0
    this_week = await db.scalar(base.where(Contact.created_at >= week_start)) or 0
    this_month = await db.scalar(base.where(Contact.created_at >= month_start)) or 0
    saved = await db.scalar(base.where(Contact.born_again == "Yes")) or 0
    follow_up = await db.scalar(base.where(Contact.status == "Needs Follow-up")) or 0
    connected = await db.scalar(base.where(Contact.status == "Connected to Church")) or 0

    # 7-day daily trend
    seven_days_ago = today - timedelta(days=6)
    trend_rows = await db.execute(
        select(func.date(Contact.created_at).label("day"), func.count().label("cnt"))
        .where(Contact.evangelist_id == user.id)
        .where(func.date(Contact.created_at) >= seven_days_ago)
        .group_by(func.date(Contact.created_at))
    )
    day_counts = {row.day: row.cnt for row in trend_rows.all()}
    weekly_trend = []
    for i in range(7):
        d = today - timedelta(days=6 - i)
        weekly_trend.append(DailyTrendPoint(day=DAYS[d.weekday()], contacts=day_counts.get(d, 0)))

    return EvangelistDashboard(
        total_contacts=total,
        this_week_contacts=this_week,
        this_month_contacts=this_month,
        saved_count=saved,
        follow_up_pending=follow_up,
        connected_to_church=connected,
        weekly_trend=weekly_trend,
    )


async def _weekly_trends(db: AsyncSession, team_ids: list[uuid.UUID] | None = None) -> list[WeeklyTrendPoint]:
    today = date.today()
    twelve_weeks_ago = today - timedelta(weeks=12)

    base_q = (
        select(
            func.date_trunc("week", Contact.created_at).label("week"),
            func.count().label("contacts"),
            func.sum(
                func.cast(Contact.born_again == "Yes", db.bind.dialect.name == "postgresql" and "integer" or "int")
            ).label("saved"),
        )
        .where(Contact.created_at >= twelve_weeks_ago)
        .group_by(func.date_trunc("week", Contact.created_at))
        .order_by(func.date_trunc("week", Contact.created_at))
    )
    if team_ids is not None:
        base_q = base_q.where(Contact.team_id.in_(team_ids))

    rows = await db.execute(base_q)
    return [
        WeeklyTrendPoint(
            week=row.week.strftime("%Y-%m-%d"),
            contacts=row.contacts,
            saved=row.saved or 0,
        )
        for row in rows.all()
    ]


async def _pipeline(db: AsyncSession, team_ids: list[uuid.UUID] | None = None) -> list[PipelineStage]:
    q = select(Contact.status, func.count().label("cnt")).group_by(Contact.status)
    if team_ids is not None:
        q = q.where(Contact.team_id.in_(team_ids))
    rows = await db.execute(q)
    return [PipelineStage(status=row.status, count=row.cnt) for row in rows.all()]


async def _team_performance(db: AsyncSession, team_ids: list[uuid.UUID] | None = None) -> list[TeamPerformance]:
    month_start = date.today().replace(day=1)
    q = (
        select(
            Team.id,
            Team.name,
            func.count(Contact.id).label("contacts"),
            func.sum(
                func.cast(and_(Contact.born_again == "Yes", Contact.created_at >= month_start), "integer")
            ).label("saved"),
        )
        .join(Contact, Contact.team_id == Team.id, isouter=True)
        .group_by(Team.id, Team.name)
        .order_by(func.count(Contact.id).desc())
    )
    if team_ids is not None:
        q = q.where(Team.id.in_(team_ids))
    rows = await db.execute(q)
    return [
        TeamPerformance(team_id=str(row.id), team_name=row.name, contacts=row.contacts or 0, saved=row.saved or 0)
        for row in rows.all()
    ]


async def get_admin_dashboard(db: AsyncSession, user: User) -> AdminDashboard:
    # Get teams this admin belongs to
    teams_result = await db.execute(
        select(TeamMember.team_id).where(TeamMember.user_id == user.id)
    )
    team_ids = [row.team_id for row in teams_result.all()]

    base = select(func.count()).select_from(Contact).where(Contact.team_id.in_(team_ids))

    total = await db.scalar(base) or 0
    saved = await db.scalar(base.where(Contact.born_again == "Yes")) or 0
    follow_up = await db.scalar(base.where(Contact.status == "Needs Follow-up")) or 0

    evangelists_result = await db.execute(
        select(func.count(func.distinct(TeamMember.user_id)))
        .where(TeamMember.team_id.in_(team_ids))
    )
    active_evangelists = await db.scalar(
        select(func.count(func.distinct(TeamMember.user_id)))
        .join(User, User.id == TeamMember.user_id)
        .where(TeamMember.team_id.in_(team_ids), User.is_active == True)  # noqa: E712
    ) or 0

    return AdminDashboard(
        total_reached=total,
        saved_all_time=saved,
        active_evangelists=active_evangelists,
        follow_up_pending=follow_up,
        weekly_trends=await _weekly_trends(db, team_ids),
        pipeline=await _pipeline(db, team_ids),
        team_performance=await _team_performance(db, team_ids),
    )


async def get_pastor_dashboard(db: AsyncSession) -> PastorDashboard:
    base = select(func.count()).select_from(Contact)

    total = await db.scalar(base) or 0
    saved = await db.scalar(base.where(Contact.born_again == "Yes")) or 0
    students = await db.scalar(base.where(Contact.is_student == True)) or 0  # noqa: E712
    connected = await db.scalar(base.where(Contact.status == "Connected to Church")) or 0

    # Top evangelists by contact count
    top_rows = await db.execute(
        select(User.id, User.full_name, func.count(Contact.id).label("contacts"))
        .join(Contact, Contact.evangelist_id == User.id)
        .group_by(User.id, User.full_name)
        .order_by(func.count(Contact.id).desc())
        .limit(5)
    )
    top_evangelists = []
    for row in top_rows.all():
        saved_cnt = await db.scalar(
            select(func.count()).select_from(Contact)
            .where(Contact.evangelist_id == row.id, Contact.born_again == "Yes")
        ) or 0
        top_evangelists.append(
            TopEvangelist(user_id=str(row.id), full_name=row.full_name, contacts=row.contacts, saved=saved_cnt)
        )

    # Recent sessions
    session_rows = await db.execute(
        select(OutreachSession).order_by(OutreachSession.date.desc()).limit(8)
    )
    recent_sessions = [
        RecentSession(
            id=str(s.id),
            date=s.date,
            location=s.location,
            contacts_made=s.contacts_made,
            saved_count=s.saved_count,
        )
        for s in session_rows.scalars().all()
    ]

    return PastorDashboard(
        total_reached=total,
        saved_all_time=saved,
        students_reached=students,
        connected_to_church=connected,
        weekly_trends=await _weekly_trends(db),
        pipeline=await _pipeline(db),
        team_performance=await _team_performance(db),
        top_evangelists=top_evangelists,
        recent_sessions=recent_sessions,
    )
