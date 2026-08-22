def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_login_success(client):
    response = client.post("/api/auth/login", json={
        "email": "maya@globetrotter.io",
        "password": "password"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "maya@globetrotter.io"
    assert data["user"]["name"] == "Maya Rao"

def test_login_invalid_password(client):
    response = client.post("/api/auth/login", json={
        "email": "maya@globetrotter.io",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

def test_register_user(client):
    response = client.post("/api/auth/register", json={
        "name": "Alex Smith",
        "email": "alex@globetrotter.io",
        "password": "securepassword123",
        "language": "French"
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["name"] == "Alex Smith"
    assert data["user"]["avatar"] == "AS"

def test_get_me(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "maya@globetrotter.io"

def test_update_profile(client, auth_headers):
    response = client.put("/api/users/profile", json={
        "name": "Maya Rao Updated",
        "language": "Spanish"
    }, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Maya Rao Updated"
    assert data["language"] == "Spanish"

def test_save_and_remove_destination(client, auth_headers):
    # Save destination
    res1 = client.post("/api/users/saved-destinations/barcelona", headers=auth_headers)
    assert res1.status_code == 200
    assert "barcelona" in res1.json()["saved_destinations"]

    # Remove destination
    res2 = client.delete("/api/users/saved-destinations/barcelona", headers=auth_headers)
    assert res2.status_code == 200
    assert "barcelona" not in res2.json()["saved_destinations"]
