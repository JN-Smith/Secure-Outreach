from advanced_alchemy.repository import SQLAlchemyAsyncRepository
from src.db.models.team import Team, TeamMember


class TeamRepository(SQLAlchemyAsyncRepository[Team]):
    model_type = Team


class TeamMemberRepository(SQLAlchemyAsyncRepository[TeamMember]):
    model_type = TeamMember
