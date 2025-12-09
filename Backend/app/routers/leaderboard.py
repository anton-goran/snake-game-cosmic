from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ..models import SubmitScoreRequest, LeaderboardEntry
from ..models_db import LeaderboardEntry as DBLeaderboardEntry, User as DBUser
from ..core.database import get_db
from .. import crud
from ..dependencies import get_current_user
import uuid
import time

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("", response_model=List[LeaderboardEntry]) # Actually, Schema model should be used in response_model, not DB model. 
# But Pydantic V2 often handles ORM models if from_attributes=True. 
# Let's check models.py LeaderboardEntry.
async def get_leaderboard(db: AsyncSession = Depends(get_db)):
    # crud.get_leaderboard returns DBLeaderboardEntry objects.
    # FastAPI response_model (List[LeaderboardEntry]) refers to Pydantic model.
    return await crud.get_leaderboard(db)

@router.post("", status_code=201)
async def submit_score(request: SubmitScoreRequest, current_user: DBUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    entry = DBLeaderboardEntry(
        id=f"entry_{uuid.uuid4().hex[:8]}",
        username=current_user.username,
        score=request.score,
        mode=request.mode,
        timestamp=int(time.time() * 1000)
    )
    await crud.create_leaderboard_entry(db, entry)
    return {"description": "Score submitted successfully"}
