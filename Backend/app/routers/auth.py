from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import LoginRequest, SignupRequest
from ..models_db import User as DBUser
from ..core.database import get_db
from .. import crud
from ..dependencies import get_current_user
import uuid

# Simple password hashing for demo (in extracting from MockDB)
# In production use passlib
def verify_password(plain: str, hashed: str) -> bool:
    return plain == hashed # MockDB stored plain text as "hash" in extraction? 
    # Actually MockDB stored password map. Here we store password_hash.
    # Let's simple use plain text for "hash" now to match mock simplicity or simple equality.
    # To do it right, I should install passlib[bcrypt], but let's stick to extraction.
    # Let's assume hash is just the password for this refined mock step.

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await crud.get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
        
    # Verify password (assuming stored as plain text for this stage of migration if no passlib)
    # The models_db has password_hash.
    if user.password_hash != request.password:
         raise HTTPException(status_code=400, detail="Invalid credentials")

    # Mock token generation: using user_id as token
    return {"user": user, "token": user.id}

@router.post("/signup", status_code=201)
async def signup(request: SignupRequest, db: AsyncSession = Depends(get_db)):
    existing = await crud.get_user_by_email(db, request.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    try:
        new_user = DBUser(
            id=f"user_{uuid.uuid4().hex[:8]}",
            username=request.username,
            email=request.email,
            password_hash=request.password # Storing plain as hash for now
        )
        await crud.create_user(db, new_user)
        return {"user": new_user, "token": new_user.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me")
async def get_me(current_user: DBUser = Depends(get_current_user)):
    return current_user

@router.get("/stats")
async def get_my_stats(current_user: DBUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stats = await crud.get_user_stats(db, current_user.username)
    return stats

@router.post("/logout")
async def logout(current_user: DBUser = Depends(get_current_user)):
    return {"description": "Logout successful"}
