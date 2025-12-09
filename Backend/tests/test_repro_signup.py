import pytest
import pytest_asyncio

@pytest.mark.asyncio
async def test_signup_repro(client):
    # Attempt to signup with valid data
    response = await client.post("/auth/signup", json={
        "username": "ReproUser",
        "email": "repro@example.com",
        "password": "password123"
    })
    
    # If this fails with 404, we have reproduced the issue
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    assert response.status_code == 201
