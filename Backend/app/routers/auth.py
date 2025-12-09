from fastapi import APIRouter, HTTPException, Depends, status
from ..models import User, LoginRequest, SignupRequest, Token
from ..db import db
from ..dependencies import get_current_user
import uuid

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login")
def login(request: LoginRequest):
    if not db.verify_password(request.email, request.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    user = db.get_user_by_email(request.email)
    if not user:
        # Should not happen if verify_password is true, but safety check
        raise HTTPException(status_code=400, detail="Invalid credentials")
        
    # Mock token generation: using user_id as token for simplicity in this mock
    return {"user": user, "token": user.id}

@router.post("/signup", status_code=201)
def signup(request: SignupRequest):
    try:
        new_user = User(
            id=f"user_{uuid.uuid4().hex[:8]}",
            username=request.username,
            email=request.email
        )
        db.create_user(new_user, request.password)
        return {"user": new_user, "token": new_user.id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"description": "Logout successful"}
