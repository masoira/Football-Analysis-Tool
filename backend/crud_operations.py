import logging
from sqlmodel.ext.asyncio.session import AsyncSession
from models import MatchDB, MatchCreate, MatchPublic
from sqlalchemy import select
from fastapi import HTTPException

logger = logging.getLogger(__name__)


async def get_match_from_db(match_id: str, user_id: str, session: AsyncSession) -> MatchDB:
    logger.info(f"User {user_id} fetching match {match_id}")
    statement = select(MatchDB).where(MatchDB.user_id == user_id, MatchDB.match_id == match_id)
    result = await session.scalars(statement)
    match = result.first()
    if not match:
        logger.info(f"User {user_id} tried to fetch non-existent match {match_id}")
        raise HTTPException(status_code=404, detail="Match not found")
    logger.info(f"Found match: {match}")
    return match


async def list_matches_from_db(user_id: str, session: AsyncSession) -> list[MatchPublic]:
    logger.info(f"User {user_id} listing matches")
    statement = select(MatchDB).where(MatchDB.user_id == user_id)
    result = await session.scalars(statement)
    matches = result.all()
    logger.info(f"User {user_id} found {len(matches)} matches")
    if matches:
        logger.info(f"The first match on the list is: {matches[0]}")
    return matches


async def create_match_in_db(match_data: MatchCreate, session: AsyncSession) -> MatchDB:
    logger.info(f"User {match_data.user_id} creating match {match_data.match_id}")
    session.add(match_data)
    await session.flush()
    await session.refresh(match_data)
    logger.info(f"Added match_data to session, returning: {match_data}")
    return match_data


async def update_match_in_db(
    match_id: str,
    match_data: MatchPublic,
    session: AsyncSession
) -> MatchDB:
    logger.info(f"User {match_data.user_id} updating match {match_id}")
    statement = select(MatchDB).where(MatchDB.user_id == match_data.user_id, MatchDB.match_id == match_id)
    result = await session.scalars(statement)
    existing_match = result.first()
    if not existing_match:
        logger.info(f"User {match_data.user_id} tried to update non-existent match {match_id}")
        raise HTTPException(status_code=404, detail="Match not found")

    existing_match.match_name = match_data.match_name
    existing_match.home_team = match_data.home_team
    existing_match.away_team = match_data.away_team
    existing_match.date = match_data.date
    existing_match.periods = match_data.periods

    session.add(existing_match)
    await session.flush()
    await session.refresh(existing_match)
    logger.info(f"Added updated existing_data to session, returning: {existing_match}")
    return existing_match


async def delete_match_from_db(match_id: str, user_id: str, session: AsyncSession) -> None:
    logger.info(f"User {user_id} deleting match {match_id}")
    statement = select(MatchDB).where(MatchDB.user_id == user_id, MatchDB.match_id == match_id)
    result = await session.scalars(statement)
    match = result.first()
    if not match:
        logger.info(f"User {user_id} tried to delete non-existent match {match_id}")
        raise HTTPException(status_code=404, detail="Match not found")

    await session.delete(match)
