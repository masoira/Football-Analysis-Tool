from sqlmodel.ext.asyncio.session import AsyncSession
from models import Match
from sqlalchemy import select
from fastapi import HTTPException


# TODO: Filter everything by user_id
# TODO: Check rollback handling
# TODO: Potentially create a model for MatchDB which has user_id


async def get_match_from_db(match_id: str, user_id: str, session: AsyncSession) -> Match:
   """Get a single match by id for a specific user"""
   statement = select(Match).where(Match.match_id == match_id)
   result = await session.exec(statement)
   match = result.first()
   if not match:
       raise HTTPException(status_code=404, detail="Match not found")
   return match

async def list_matches_from_db(user_id: str, session: AsyncSession) -> list[Match]:
   """Get all matches for a specific user"""
   statement = select(Match)
   result = await session.exec(statement)
   matches = result.all()
   return matches

async def create_match_in_db(match_data: Match, user_id: str, session: AsyncSession) -> Match:
   """Create a new match for a specific user"""
   session.add(match_data)
   await session.commit()
   await session.refresh(match_data)
   return match_data

async def update_match_in_db(
    match_id: str,
    match_data: Match,
    user_id: str,
    session: AsyncSession
) -> Match:
    """
    Update existing match for a specific user.
    """
    statement = select(Match).where(Match.match_id == match_id)
    existing_match = (await session.exec(statement)).first()
    if not existing_match:
        raise HTTPException(status_code=404, detail="Match not found")

    existing_match.match_name = match_data.match_name
    existing_match.home_team = match_data.home_team
    existing_match.away_team = match_data.away_team
    existing_match.date = match_data.date
    existing_match.periods = match_data.periods

    session.add(existing_match)
    await session.commit()
    await session.refresh(existing_match)
    return existing_match

async def delete_match_from_db(match_id: str, user_id: str, session: AsyncSession) -> None:
   """Delete a match for a specific user"""
   statement = select(Match).where(Match.match_id == match_id)
   result = await session.exec(statement)
   match = result.first()
   if not match:
       raise HTTPException(status_code=404, detail="Match not found")
   
   await session.delete(match)
   await session.commit()
