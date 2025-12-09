import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_user_stats(client: AsyncClient):
    # 1. Signup user
    username = "StatsUser"
    email = "stats@example.com"
    password = "pw"
    
    response = await client.post("/auth/signup", json={
        "username": username,
        "email": email,
        "password": password
    })
    token = response.json()["token"]
    
    # 2. Check initial stats (0/0/0)
    response = await client.get("/auth/stats", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    stats = response.json()
    assert stats["games_played"] == 0
    assert stats["best_score"] == 0
    assert stats["rank"] == 0
    
    # 3. Submit a score
    score = 100
    await client.post("/leaderboard", 
        json={"score": score, "mode": "pass-through"},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # 4. Check stats again
    response = await client.get("/auth/stats", headers={"Authorization": f"Bearer {token}"})
    stats = response.json()
    assert stats["games_played"] == 1
    assert stats["best_score"] == score
    assert stats["rank"] > 0
    
    # 5. Submit a lower score
    await client.post("/leaderboard", 
        json={"score": 50, "mode": "pass-through"},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Check stats (games played = 2, best score still 100)
    response = await client.get("/auth/stats", headers={"Authorization": f"Bearer {token}"})
    stats = response.json()
    assert stats["games_played"] == 2
    assert stats["best_score"] == 100
