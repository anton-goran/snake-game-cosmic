import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_repro_leaderboard_visibility(client: AsyncClient):
    # 1. Signup user
    username = "InvisibleUser"
    email = "invisible@example.com"
    password = "pw"
    
    response = await client.post("/auth/signup", json={
        "username": username,
        "email": email,
        "password": password
    })
    token = response.json()["token"]
    
    # 2. Submit high score
    score = 9999
    response = await client.post("/leaderboard", 
        json={"score": score, "mode": "pass-through"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    
    # 3. Fetch leaderboard
    response = await client.get("/leaderboard")
    assert response.status_code == 200
    entries = response.json()
    
    # Check if user is present
    user_entry = next((e for e in entries if e["username"] == username), None)
    
    if not user_entry:
        pytest.fail(f"User {username} with score {score} not found in leaderboard!")
        
    assert user_entry["score"] == score
    print(f"Found user {user_entry['username']} with score {user_entry['score']}")
