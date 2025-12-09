from fastapi import APIRouter, Depends, status
from typing import List
from ..models import LeaderboardEntry, SubmitScoreRequest, User
from ..db import db
from ..dependencies import get_current_user
import uuid
import time

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("", response_model=List[LeaderboardEntry])
def get_leaderboard():
    return db.get_leaderboard()

@router.post("", status_code=201)
def submit_score(request: SubmitScoreRequest, current_user: User = Depends(get_current_user)):
    entry = LeaderboardEntry(
        id=f"entry_{uuid.uuid4().hex[:8]}",
        username=current_user.username,
        score=request.score,
        mode=request.mode,
        timestamp=int(time.time() * 1000)
    )
    db.add_score(entry)
    return {"description": "Score submitted successfully"}
