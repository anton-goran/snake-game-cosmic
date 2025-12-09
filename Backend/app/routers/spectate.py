from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import List, Generator
from ..models import ActivePlayer, GameFrame, Coordinate, Direction, GameMode
from ..db import db
import asyncio
import json
import random

router = APIRouter(prefix="/players", tags=["Spectate"])

@router.get("/active", response_model=List[ActivePlayer])
def get_active_players():
    # Mock implementation: return some dummy active players or existing users
    active_players = []
    for user_email, user in db.users.items():
        # Simulate that the demo user is playing
        if user.username == "DemoUser":
            active_players.append(ActivePlayer(
                id=user.id,
                username=user.username,
                currentScore=random.randint(50, 200),
                mode=GameMode.pass_through
            ))
    return active_players

async def game_stream_generator(player_id: str) -> Generator[str, None, None]:
    # Mock data stream generator
    snake = [Coordinate(x=10, y=10), Coordinate(x=10, y=11), Coordinate(x=10, y=12)]
    food = Coordinate(x=15, y=15)
    score = 100
    
    while True:
        # Simulate game update
        snake[0].y += 1 # Move head down (simplified)
        snake.pop() # Remove tail
        snake.insert(0, Coordinate(x=snake[0].x, y=snake[0].y + 1)) # Add new head
        
        frame = GameFrame(
            snake=snake,
            food=food,
            score=score,
            direction=Direction.DOWN
        )
        
        # SSE format: data: <json>\n\n
        yield f"data: {frame.model_dump_json()}\n\n"
        await asyncio.sleep(0.5) # 2 FPS for spectating demo

@router.get("/{playerId}/watch")
async def watch_player(playerId: str):
    user = db.get_user_by_id(playerId)
    if not user:
        raise HTTPException(status_code=404, detail="Player not found")
        
    return StreamingResponse(
        game_stream_generator(playerId), 
        media_type="text/event-stream"
    )
