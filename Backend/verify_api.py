import httpx
import time
import sys
import threading
import uvicorn
from app.main import app

def run_server():
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="error")

def verify_backend():
    base_url = "http://127.0.0.1:8000"
    
    # Wait for server to start
    print("Waiting for server to start...")
    for _ in range(10):
        try:
            httpx.get(f"{base_url}/")
            break
        except httpx.ConnectError:
            time.sleep(1)
    else:
        print("Server failed to start")
        sys.exit(1)
    
    print("Server started!")
    
    # 1. Signup
    print("Testing Signup...")
    signup_data = {
        "username": "NewUser",
        "email": "newuser@example.com",
        "password": "securepassword"
    }
    response = httpx.post(f"{base_url}/auth/signup", json=signup_data)
    assert response.status_code == 201
    token = response.json()["token"]
    user_id = response.json()["user"]["id"]
    print("Signup - OK")
    
    # 2. Login
    print("Testing Login...")
    login_data = {
        "email": "newuser@example.com",
        "password": "securepassword"
    }
    response = httpx.post(f"{base_url}/auth/login", json=login_data)
    assert response.status_code == 200
    assert response.json()["token"] == token
    print("Login - OK")
    
    # 3. Me
    print("Testing Me...")
    headers = {"Authorization": f"Bearer {token}"}
    response = httpx.get(f"{base_url}/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "newuser@example.com"
    print("Me - OK")
    
    # 4. Submit Score
    print("Testing Submit Score...")
    score_data = {
        "score": 150,
        "mode": "pass-through"
    }
    response = httpx.post(f"{base_url}/leaderboard", json=score_data, headers=headers)
    assert response.status_code == 201
    print("Submit Score - OK")
    
    # 5. Get Leaderboard
    print("Testing Get Leaderboard...")
    response = httpx.get(f"{base_url}/leaderboard")
    assert response.status_code == 200
    leaderboard = response.json()
    assert len(leaderboard) > 0
    assert leaderboard[0]["username"] == "NewUser" # Since 150 > 100 (demo user)
    print("Get Leaderboard - OK")
    
    # 6. Active Players
    print("Testing Active Players...")
    response = httpx.get(f"{base_url}/players/active")
    assert response.status_code == 200
    # DemoUser should be active by default logic in my mock
    players = response.json()
    assert any(p["username"] == "DemoUser" for p in players)
    print("Active Players - OK")
    
    print("\nALL VERIFICATIONS PASSED!")

if __name__ == "__main__":
    # Start server in a separate thread
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    try:
        verify_backend()
    except Exception as e:
        print(f"\nVerification FAILED: {e}")
        sys.exit(1)
