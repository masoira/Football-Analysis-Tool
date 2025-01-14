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


class Match(BaseModel):
    match_name: str 
    home_team: str
    away_team: str
    date: datetime
    actions: list[Action]
