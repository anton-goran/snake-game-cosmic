from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from typing import List, Generator
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import ActivePlayer, GameFrame, Coordinate, Direction, GameMode
from ..core.database import get_db
from .. import crud
import asyncio
import random

router = APIRouter(prefix="/players", tags=["Spectate"])

@router.get("/active", response_model=List[ActivePlayer])
async def get_active_players():
    # Mock implementation: return dummy active players
    # In a real app, this would query a Redis set or similar game state store
    return [
        ActivePlayer(
            id="user_demo_1",
            username="CosmicGamer",
            currentScore=random.randint(50, 200),
            mode=GameMode.pass_through
        ),
        ActivePlayer(
            id="user_demo_2",
            username="StarSnake",
            currentScore=random.randint(20, 100),
            mode=GameMode.walls
        )
    ]

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
async def watch_player(playerId: str, db: AsyncSession = Depends(get_db)):
    # For now, allow watching any ID for demo purposes, or check if user exists
    # If we want to check validation:
    # user = await crud.get_user(db, playerId)
    # if not user and not playerId.startswith("user_demo"):
    #    raise HTTPException(status_code=404, detail="Player not found")
        
    return StreamingResponse(
        game_stream_generator(playerId), 
        media_type="text/event-stream"
    )
