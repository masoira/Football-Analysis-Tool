from datetime import datetime
from pydantic import BaseModel
from typing import Literal

from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import SQLModel, Field, Column


class AssistAction(BaseModel):
    x: float
    y: float
    type: Literal["assist", "dribble"]


class Action(BaseModel):
    type: Literal["shot"]
    x: float
    y: float
    shot_type: Literal["on-target", "blocked", "off-target"]
    is_header: bool
    team: str
    assist: AssistAction | None = None


class Period(BaseModel):
    type: Literal["Full Match", "First Half", "Second Half", "Extra"]
    actions: list[Action]


# Models are split to keep things clean:
# - MatchBase holds shared fields to avoid duplication
# - MatchDB is the full DB model (includes user_id for ownership). user_id must not be provided by the frontend because it is used
#   to filter for rows in the DB. Altered user_id could grant unauthorized access to data.
# - MatchPublic is what we return to clients (no user_id)

class MatchBase(SQLModel):
    match_name: str 
    home_team: str | None = None
    away_team: str | None = None
    date: datetime
    periods: list[dict] = Field(sa_column=Column(JSONB))


class MatchDB(MatchBase, table=True):
    match_id: str = Field(primary_key=True)  # UUID created by the frontend
    user_id: str  # Should be a foreign key but no user table exists yet


class MatchPublic(MatchBase):
    match_id: str  # UUID created by the frontend
