from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List
from enum import Enum

class GameMode(str, Enum):
    pass_through = "pass-through"
    walls = "walls"

class Direction(str, Enum):
    UP = "UP"
    DOWN = "DOWN"
    LEFT = "LEFT"
    RIGHT = "RIGHT"

class Coordinate(BaseModel):
    x: int
    y: int

class User(BaseModel):
    id: str = Field(..., json_schema_extra={"example": "user_12345"})
    username: str = Field(..., json_schema_extra={"example": "CosmicGamer"})
    email: EmailStr = Field(..., json_schema_extra={"example": "gamer@example.com"})

    model_config = ConfigDict(from_attributes=True)

class LeaderboardEntry(BaseModel):
    id: str
    username: str
    score: int
    mode: GameMode
    timestamp: int = Field(..., description="Unix timestamp in milliseconds")

    model_config = ConfigDict(from_attributes=True)

class ActivePlayer(BaseModel):
    id: str
    username: str
    currentScore: int
    mode: GameMode

class GameFrame(BaseModel):
    snake: List[Coordinate]
    food: Coordinate
    score: int
    direction: Direction

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SignupRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class SubmitScoreRequest(BaseModel):
    score: int
    mode: GameMode

class Token(BaseModel):
    access_token: str
    token_type: str
