import uuid
from datetime import date, datetime, timedelta, timezone


def _dt(d: date) -> datetime:
    """Convert a date to a UTC-aware datetime so advanced_alchemy's DateTimeUTC type is happy."""
    return datetime(d.year, d.month, d.day, tzinfo=timezone.utc)

from sqlalchemy import and_, case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.config import settings
from src.db.models.contact import Contact
from src.db.models.session import OutreachSession
from src.db.models.team import Team, TeamMember
from src.db.models.user import User

_is_sqlite = bool(settings.DATABASE_URL and settings.DATABASE_URL.startswith("sqlite"))


def _bool_to_int(condition):
    """SQLAlchemy expression that yields 1/0 from a boolean condition on any dialect."""
    return case((condition, 1), else_=0)


def _week_label(col):
    """Group-by expression for 'week'. Returns a string label on both SQLite and Postgres."""
    if _is_sqlite:
        return func.strftime("%Y-%W", col)
    return func.to_char(func.date_trunc("week", col), "YYYY-MM-DD")
from src.db.models.followup import FollowUpLog
from src.schemas.dashboard import (
    AdminDashboard,
    DailyTrendPoint,
    EvangelistDashboard,
    EvangelistKPI,
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
    this_week = await db.scalar(base.where(Contact.created_at >= _dt(week_start))) or 0
    this_month = await db.scalar(base.where(Contact.created_at >= _dt(month_start))) or 0
    saved = await db.scalar(base.where(Contact.born_again == "Yes")) or 0
    follow_up = await db.scalar(base.where(Contact.status == "Needs Follow-up")) or 0
    connected = await db.scalar(base.where(Contact.status == "Connected to Church")) or 0

    # 7-day daily trend
    seven_days_ago = today - timedelta(days=6)
    trend_rows = await db.execute(
        select(func.date(Contact.created_at).label("day"), func.count().label("cnt"))
        .where(Contact.evangelist_id == user.id)
        .where(Contact.created_at >= _dt(seven_days_ago))
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

    week_expr = _week_label(Contact.created_at)
    base_q = (
        select(
            week_expr.label("week"),
            func.count().label("contacts"),
            func.sum(_bool_to_int(Contact.born_again == "Yes")).label("saved"),
        )
        .where(Contact.created_at >= _dt(twelve_weeks_ago))
        .group_by(week_expr)
        .order_by(week_expr)
    )
    if team_ids is not None:
        base_q = base_q.where(Contact.team_id.in_(team_ids))

    rows = await db.execute(base_q)
    return [
        WeeklyTrendPoint(
            week=row.week if isinstance(row.week, str) else row.week.strftime("%Y-%m-%d"),
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
                _bool_to_int(and_(Contact.born_again == "Yes", Contact.created_at >= _dt(month_start)))
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
    # Admin sees org-wide stats (same as pastor)
    base = select(func.count()).select_from(Contact)

    total = await db.scalar(base) or 0
    saved = await db.scalar(base.where(Contact.born_again == "Yes")) or 0
    follow_up = await db.scalar(base.where(Contact.status == "Needs Follow-up")) or 0

    active_evangelists = await db.scalar(
        select(func.count()).select_from(User)
        .where(User.role == "evangelist", User.is_active == True)  # noqa: E712
    ) or 0

    return AdminDashboard(
        total_reached=total,
        saved_all_time=saved,
        active_evangelists=active_evangelists,
        follow_up_pending=follow_up,
        weekly_trends=await _weekly_trends(db),
        pipeline=await _pipeline(db),
        team_performance=await _team_performance(db),
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


async def get_evangelist_analytics(
    db: AsyncSession, team_ids: list[uuid.UUID] | None = None
) -> list[EvangelistKPI]:
    today = date.today()
    week_start = today - timedelta(days=today.weekday())

    users_q = (
        select(User, Team.name.label("team_name"))
        .where(User.role == "evangelist", User.is_active == True)  # noqa: E712
        .outerjoin(TeamMember, TeamMember.user_id == User.id)
        .outerjoin(Team, Team.id == TeamMember.team_id)
    )
    if team_ids is not None:
        users_q = users_q.where(TeamMember.team_id.in_(team_ids))

    rows = await db.execute(users_q)
    result = []
    for row in rows.all():
        user = row[0]
        team_name = row[1]

        base_q = select(func.count()).select_from(Contact).where(Contact.evangelist_id == user.id)
        total = await db.scalar(base_q) or 0
        this_week = await db.scalar(base_q.where(Contact.created_at >= _dt(week_start))) or 0
        pending = await db.scalar(base_q.where(Contact.status == "Needs Follow-up")) or 0
        converted = await db.scalar(base_q.where(Contact.status == "Connected to Church")) or 0
        done = await db.scalar(
            select(func.count()).select_from(FollowUpLog).where(FollowUpLog.created_by == user.id)
        ) or 0

        result.append(EvangelistKPI(
            user_id=str(user.id),
            full_name=user.full_name,
            email=user.email,
            team_name=team_name,
            contacts_total=total,
            contacts_this_week=this_week,
            followups_done=done,
            followups_pending=pending,
            converted=converted,
            last_login_at=user.last_login_at,
            login_count=user.login_count,
            invite_pending=user.invite_pending,
        ))

    return result
