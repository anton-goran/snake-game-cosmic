from sqlalchemy import Column, Integer, String, BigInteger
from .core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=False, index=True) # Username not unique per requirements/openapi? Let's assume unique usually. Or logic allows duplicates? Mock allowed. Let's keep strict for SQL usually but spec didn't say. Mock allowed dupes? Actually spec schema says nothing about uniqueness but id is unique.
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)

class LeaderboardEntry(Base):
    __tablename__ = "leaderboard"
    
    id = Column(String, primary_key=True, index=True)
    username = Column(String, index=True)
    score = Column(Integer, index=True)
    mode = Column(String, index=True) # 'pass-through' or 'walls'
    timestamp = Column(BigInteger)
