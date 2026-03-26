import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.routes.auth import get_current_user, require_admin, require_any, require_pastor
from src.db.setup import get_session
from src.db.models.user import User
from src.schemas.team import TeamCreate, TeamMemberAdd, TeamMemberRead, TeamRead, TeamUpdate
from src.services.teams_service import (
    add_team_member,
    create_team,
    delete_team,
    get_team,
    list_team_members,
    list_teams,
    remove_team_member,
    update_team,
)

teams_router = APIRouter(prefix="/api/teams", tags=["teams"])


@teams_router.get("/", response_model=list[TeamRead])
async def list_teams_route(
    current_user: User = Depends(require_any),
    db: AsyncSession = Depends(get_session),
):
    return await list_teams(db, current_user)


@teams_router.post("/", response_model=TeamRead, status_code=status.HTTP_201_CREATED)
async def create_team_route(
    data: TeamCreate,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_session),
):
    return await create_team(db, data)


@teams_router.get("/{team_id}", response_model=TeamRead)
async def get_team_route(
    team_id: uuid.UUID,
    _: User = Depends(require_any),
    db: AsyncSession = Depends(get_session),
):
    team = await get_team(db, team_id)
    if not team:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Team not found")
    return team


@teams_router.patch("/{team_id}", response_model=TeamRead)
async def update_team_route(
    team_id: uuid.UUID,
    data: TeamUpdate,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_session),
):
    team = await get_team(db, team_id)
    if not team:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Team not found")
    return await update_team(db, team, data)


@teams_router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_team_route(
    team_id: uuid.UUID,
    _: User = Depends(require_pastor),
    db: AsyncSession = Depends(get_session),
):
    ok = await delete_team(db, team_id)
    if not ok:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Team not found")


@teams_router.post("/{team_id}/members", response_model=TeamMemberRead, status_code=status.HTTP_201_CREATED)
async def add_member_route(
    team_id: uuid.UUID,
    data: TeamMemberAdd,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_session),
):
    return await add_team_member(db, team_id, data)


@teams_router.delete("/{team_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member_route(
    team_id: uuid.UUID,
    user_id: uuid.UUID,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_session),
):
    ok = await remove_team_member(db, team_id, user_id)
    if not ok:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Member not found")


@teams_router.get("/{team_id}/members", response_model=list[TeamMemberRead])
async def list_members_route(
    team_id: uuid.UUID,
    _: User = Depends(require_any),
    db: AsyncSession = Depends(get_session),
):
    return await list_team_members(db, team_id)
