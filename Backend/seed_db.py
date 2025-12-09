import asyncio
import uuid
from app.core.database import AsyncSessionLocal
from app.models_db import User
from app.crud import create_user

async def seed_users():
    async with AsyncSessionLocal() as session:
        users = [
            {"username": "CosmicVoyager", "email": "voyager@example.com", "password": "password123"},
            {"username": "StarHunter", "email": "hunter@example.com", "password": "password123"},
            {"username": "NebulaNavigator", "email": "navigator@example.com", "password": "password123"}
        ]
        
        print("Seeding users...")
        for u in users:
            user = User(
                id=f"user_{uuid.uuid4().hex[:8]}",
                username=u["username"],
                email=u["email"],
                password_hash=u["password"] # Storing plain as hash per current simplistic implementation
            )
            # Check if exists first to avoid crash? 
            # crud.create_user doesn't check, but let's just try/except or assume fresh/dev db
            try:
                await create_user(session, user)
                print(f"Created user: {user.username}")
            except Exception as e:
                print(f"Skipped {user.username}: {e}")
        
        print("Done.")

if __name__ == "__main__":
    asyncio.run(seed_users())
