import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.team import Team, TeamMember
from src.db.models.user import User
from src.schemas.team import TeamCreate, TeamMemberAdd, TeamUpdate


async def create_team(db: AsyncSession, data: TeamCreate) -> Team:
    team = Team(
        name=data.name,
        zone=data.zone,
        lead_evangelist_id=data.lead_evangelist_id,
        outreach_days=data.outreach_days,
        active_zones=data.active_zones,
    )
    db.add(team)
    await db.commit()
    await db.refresh(team)
    return team


async def list_teams(db: AsyncSession, current_user: User) -> list[Team]:
    if current_user.role in ("evangelist", "data_collector"):
        # Return only the teams the evangelist belongs to
        result = await db.execute(
            select(Team)
            .join(TeamMember, Team.id == TeamMember.team_id)
            .where(TeamMember.user_id == current_user.id)
        )
    else:
        result = await db.execute(select(Team).order_by(Team.name))
    return list(result.scalars().all())


async def get_team(db: AsyncSession, team_id: uuid.UUID) -> Optional[Team]:
    result = await db.execute(select(Team).where(Team.id == team_id))
    return result.scalar_one_or_none()


async def update_team(db: AsyncSession, team: Team, data: TeamUpdate) -> Team:
    update_data = data.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(team, key, value)
    await db.commit()
    await db.refresh(team)
    return team


async def delete_team(db: AsyncSession, team_id: uuid.UUID) -> bool:
    result = await db.execute(select(Team).where(Team.id == team_id))
    team = result.scalar_one_or_none()
    if not team:
        return False
    await db.delete(team)
    await db.commit()
    return True


async def add_team_member(db: AsyncSession, team_id: uuid.UUID, data: TeamMemberAdd) -> TeamMember:
    member = TeamMember(team_id=team_id, user_id=data.user_id, team_role=data.team_role)
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return member


async def remove_team_member(db: AsyncSession, team_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    result = await db.execute(
        select(TeamMember).where(TeamMember.team_id == team_id, TeamMember.user_id == user_id)
    )
    member = result.scalar_one_or_none()
    if not member:
        return False
    await db.delete(member)
    await db.commit()
    return True


async def list_team_members(db: AsyncSession, team_id: uuid.UUID) -> list[TeamMember]:
    result = await db.execute(select(TeamMember).where(TeamMember.team_id == team_id))
    return list(result.scalars().all())
