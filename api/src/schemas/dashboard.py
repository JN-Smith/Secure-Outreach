from datetime import date

from pydantic import BaseModel


class WeeklyTrendPoint(BaseModel):
    week: str   # ISO date string of week start
    contacts: int
    saved: int


class DailyTrendPoint(BaseModel):
    day: str    # e.g. "Mon"
    contacts: int


class PipelineStage(BaseModel):
    status: str
    count: int


class TeamPerformance(BaseModel):
    team_id: str
    team_name: str
    contacts: int
    saved: int


class TopEvangelist(BaseModel):
    user_id: str
    full_name: str
    contacts: int
    saved: int


class RecentSession(BaseModel):
    id: str
    date: date
    location: str
    contacts_made: int
    saved_count: int


class EvangelistDashboard(BaseModel):
    total_contacts: int
    this_week_contacts: int
    this_month_contacts: int
    saved_count: int
    follow_up_pending: int
    connected_to_church: int
    weekly_trend: list[DailyTrendPoint]


class AdminDashboard(BaseModel):
    total_reached: int
    saved_all_time: int
    active_evangelists: int
    follow_up_pending: int
    weekly_trends: list[WeeklyTrendPoint]
    pipeline: list[PipelineStage]
    team_performance: list[TeamPerformance]


class PastorDashboard(BaseModel):
    total_reached: int
    saved_all_time: int
    students_reached: int
    connected_to_church: int
    weekly_trends: list[WeeklyTrendPoint]
    pipeline: list[PipelineStage]
    team_performance: list[TeamPerformance]
    top_evangelists: list[TopEvangelist]
    recent_sessions: list[RecentSession]
