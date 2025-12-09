from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
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
