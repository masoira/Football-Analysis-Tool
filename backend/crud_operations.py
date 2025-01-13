async def get_match_from_db(match_name: str, user_id: str) -> dict:
   """Get a single match by name for a specific user"""
   pass


async def list_matches_from_db(user_id: str) -> list[dict]:
   """Get all matches for a specific user"""
   pass


async def create_match_in_db(match_data: dict, user_id: str) -> dict:
   """Create a new match for a specific user"""
   pass


async def update_match_in_db(match_name: str, match_data: dict, user_id: str) -> dict:
   """Update a match for a specific user"""
   pass


async def delete_match_from_db(match_name: str, user_id: str) -> None:
   """Delete a match for a specific user"""
   pass
