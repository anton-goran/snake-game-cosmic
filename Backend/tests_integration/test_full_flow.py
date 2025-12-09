import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_full_user_journey(client: AsyncClient):
    # 1. Signup
    username = "IntegrationUser"
    email = "integration@example.com"
    password = "securePassword123"
    
    response = await client.post("/auth/signup", json={
        "username": username,
        "email": email,
        "password": password
    })
    
    assert response.status_code == 201
    auth_data = response.json()
    token = auth_data["token"]
    assert auth_data["user"]["username"] == username
    assert auth_data["user"]["email"] == email
    
    # 2. Login (verify credentials work)
    response = await client.post("/auth/login", json={
        "email": email,
        "password": password
    })
    
    assert response.status_code == 200
    assert response.json()["token"] == token # In our mock token impl, it's consistent
    
    # 3. Access Protected Route (Me)
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == auth_data["user"]["id"]
    
    # 4. Submit Score (Play Game)
    score1 = 150
    response = await client.post("/leaderboard", 
        json={"score": score1, "mode": "pass-through"},
        headers=headers
    )
    assert response.status_code == 201
    
    # 5. Check Leaderboard
    response = await client.get("/leaderboard")
    assert response.status_code == 200
    entries = response.json()
    
    # Verify our entry is there
    user_entry = next((e for e in entries if e["username"] == username), None)
    assert user_entry is not None
    assert user_entry["score"] == score1
    assert user_entry["mode"] == "pass-through"
    
    # 6. Submit better score
    score2 = 300
    response = await client.post("/leaderboard", 
        json={"score": score2, "mode": "walls"},
        headers=headers
    )
    assert response.status_code == 201
    
    # 7. Verify Leaderboard update
    response = await client.get("/leaderboard")
    entries = response.json()
    
    # We should see both entries ? Or does leaderboard consolidate? 
    # Current implementation pushes new entry for every submission.
    user_entries = [e for e in entries if e["username"] == username]
    assert len(user_entries) >= 2
    
    # 8. Logout
    response = await client.post("/auth/logout", headers=headers)
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_duplicate_signup(client: AsyncClient):
    # Try to signup with same email as above (persisted in file db for this session if sequence relies on it or parallel?)
    # Pytest runs functions isolated by default fixture scope, 
    # BUT our db_engine fixture is session scoped, so DB file persists!
    # However, db_session fixture logic might NOT truncate? 
    # Let's checkconftest.py: db_session yields session but doesn't clean up explicitly per test.
    # So "IntegrationUser" might still exist if tests run in order.
    # To be safe, use unique data.
    
    email = "duplicate@example.com"
    
    await client.post("/auth/signup", json={
        "username": "User1",
        "email": email,
        "password": "pw"
    })
    
    response = await client.post("/auth/signup", json={
        "username": "User2",
        "email": email,
        "password": "pw"
    })
    
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]
