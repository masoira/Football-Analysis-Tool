from datetime import datetime
from pydantic import BaseModel
from typing import Literal


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


class Match(BaseModel):
    match_id: str  # UUID created by the frontend
    match_name: str 
    home_team: str | None = None
    away_team: str | None = None
    date: datetime
    periods: list[Period]
