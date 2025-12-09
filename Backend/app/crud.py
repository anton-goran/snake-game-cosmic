from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models_db import User, LeaderboardEntry
from .models import User as UserModel, LeaderboardEntry as LeaderboardEntryModel

# CRUD operations

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def get_user_by_username(db: AsyncSession, username: str):
    result = await db.execute(select(User).where(User.username == username))
    return result.scalars().first()

async def get_user(db: AsyncSession, user_id: str):
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()

async def create_user(db: AsyncSession, user: User) -> User:
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def get_leaderboard(db: AsyncSession, limit: int = 50):
    result = await db.execute(select(LeaderboardEntry).order_by(LeaderboardEntry.score.desc()).limit(limit))
    return result.scalars().all()

async def create_leaderboard_entry(db: AsyncSession, entry: LeaderboardEntry):
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry

async def get_user_stats(db: AsyncSession, username: str):
    # Games Played
    result = await db.execute(select(func.count(LeaderboardEntry.id)).where(LeaderboardEntry.username == username))
    games_played = result.scalar() or 0
    
    # Best Score
    result = await db.execute(select(func.max(LeaderboardEntry.score)).where(LeaderboardEntry.username == username))
    best_score = result.scalar() or 0
    
    # Rank (Global position based on best score)
    # This is a bit simplified: Rank = count of unique players with higher max score + 1
    # Or simpler: Rank = count of entries with higher score + 1 (if entries are game runs).
    # Usually rank is per player.
    # Let's do: Rank of THIS player's best score in the list of all scores.
    # If best_score > 0:
    #   rank = count(distinct username) where max(score) > my_best_score?
    #   That's complex in SQL.
    #   Simpler approach: Rank in the "Leaderboard" list (entries).
    #   rank = count(entries) where score > best_score + 1.
    
    rank = 0
    if best_score > 0:
        result = await db.execute(select(func.count(LeaderboardEntry.id)).where(LeaderboardEntry.score > best_score))
        rank = (result.scalar() or 0) + 1
        
    return {
        "games_played": games_played,
        "best_score": best_score,
        "rank": rank if games_played > 0 else 0
    }
