from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .db import db, User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    # In this mock implementation, the token is just the user ID (except for login response where we might return something else, 
    # but for simplicity let's say token = user_id for now or a simple random string mapped to user id).
    # Actually, let's make it simple: token IS the user_id for this mock.
    user = db.get_user_by_id(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
