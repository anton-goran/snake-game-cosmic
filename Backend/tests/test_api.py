from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "Snake Game Cosmic Backend is running"}

def test_auth_flow():
    # Signup
    response = client.post("/auth/signup", json={
        "username": "TestUser",
        "email": "test@example.com",
        "password": "password"
    })
    assert response.status_code == 201
    token = response.json()["token"]
    
    # Login
    response = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "password"
    })
    assert response.status_code == 200
    assert response.json()["token"] == token
    
    # Get Me
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["username"] == "TestUser"

def test_leaderboard():
    # 1. Login to get token (using demo user)
    # Actually, let's just signup a new one to be clean
    response = client.post("/auth/signup", json={
        "username": "LeaderUser",
        "email": "leader@example.com",
        "password": "pw"
    })
    token = response.json()["token"]
    
    # 2. Submit score
    response = client.post("/leaderboard", 
        json={"score": 500, "mode": "walls"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    
    # 3. Get leaderboard
    response = client.get("/leaderboard")
    assert response.status_code == 200
    entries = response.json()
    assert entries[0]["score"] == 500
    assert entries[0]["username"] == "LeaderUser"

def test_spectate_active():
    response = client.get("/players/active")
    assert response.status_code == 200
    # Checks if we get a list
    assert isinstance(response.json(), list)
