import pytest

@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/")
    # The root endpoint serves static/index.html
    assert response.status_code == 200
    assert b"Dummy Test File" in response.content or b"html" in response.content.lower()

@pytest.mark.asyncio
async def test_auth_flow(client):
    # Signup
    response = await client.post("/auth/signup", json={
        "username": "TestUser",
        "email": "test@example.com",
        "password": "password"
    })
    assert response.status_code == 201
    token = response.json()["token"]
    
    # Login
    response = await client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "password"
    })
    assert response.status_code == 200
    assert response.json()["token"] == token
    
    # Get Me
    response = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["username"] == "TestUser"

@pytest.mark.asyncio
async def test_leaderboard(client):
    # 1. Signup to get token
    response = await client.post("/auth/signup", json={
        "username": "LeaderUser",
        "email": "leader@example.com",
        "password": "pw"
    })
    token = response.json()["token"]
    
    # 2. Submit score
    response = await client.post("/leaderboard", 
        json={"score": 500, "mode": "walls"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    
    # 3. Get leaderboard
    response = await client.get("/leaderboard")
    assert response.status_code == 200
    entries = response.json()
    assert len(entries) > 0
    assert entries[0]["score"] == 500
    assert entries[0]["username"] == "LeaderUser"

@pytest.mark.asyncio
async def test_spectate_active(client):
    response = await client.get("/players/active")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
