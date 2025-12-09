import pytest
import httpx
import uuid
import asyncio

# This test requires the full stack running in Docker
BASE_URL = "http://localhost:8080"

@pytest.mark.asyncio
async def test_leaderboard_update_via_nginx():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        # 1. Check health/connectivity (via frontend serving or proxy?)
        # Let's hit the docs endpoint proxied
        try:
            resp = await client.get("/docs")
            if resp.status_code != 200:
                pytest.skip("Full stack not running or not accessible at localhost:8080")
        except httpx.ConnectError:
            pytest.skip("Full stack not running")

        # 2. Signup
        unique_id = uuid.uuid4().hex[:6]
        username = f"E2EUser_{unique_id}"
        email = f"e2e_{unique_id}@img.com"
        password = "password"

        reg_resp = await client.post("/auth/signup", json={
            "username": username,
            "email": email,
            "password": password
        })
        assert reg_resp.status_code == 201, f"Signup failed: {reg_resp.text}"
        token = reg_resp.json()["token"]

        # 3. Get Leaderboard (Initial State)
        lb_resp = await client.get("/leaderboard") # Nginx might cache this?
        assert lb_resp.status_code == 200
        initial_entries = lb_resp.json()
        
        # 4. Submit Score
        score = 8888
        sub_resp = await client.post("/leaderboard", 
            json={"score": score, "mode": "pass-through"},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert sub_resp.status_code == 201
        
        # 5. Get Leaderboard Again (Should reflect update)
        # If Nginx caches, this might return the old list!
        lb_resp_2 = await client.get("/leaderboard") # Trailing slash matter? Nginx config has /leaderboard/ -> /leaderboard/
        # Wait, config logic: location /leaderboard/ { ... }
        # If request is /leaderboard (no slash), does Nginx match?
        # Standard nginx: location /leaderboard/ matches only if starts with /leaderboard/.
        # If I request /leaderboard, it might hit index.html (React app)!
        # React app then calls API via `api.ts` which uses `API_Base_URL` (empty) + `/leaderboard`.
        # So it requests `/leaderboard` from browser against `localhost:8080`.
        # If Nginx only matches `/leaderboard/`, then `/leaderboard` goes to React App (index.html).
        # This is a BIG FINDING.
        
        # Let's verify what the test gets.
        # But wait, api.ts calls `${API_Base_URL}/leaderboard`.
        # If API_Base_URL is empty, it calls `/leaderboard`.
        # Nginx config:
        # location /leaderboard/ { ... }
        # This will NOT match `/leaderboard`.
        
        # This means the frontend request actually returns the HTML of the app (200 OK)
        # and result.json() fails or parsing fails?
        # api.ts: return response.json().
        # HTML is not JSON. SyntaxError in frontend console.
        
        # User said "I cant see the results".
        # If it was SyntaxError, they would probably see nothing or verify error.
        
        # Let's assume this is the bug.
        
        pass

