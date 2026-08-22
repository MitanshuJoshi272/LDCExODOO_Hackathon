def test_get_all_cities(client):
    response = client.get("/api/cities")
    assert response.status_code == 200
    cities = response.json()
    assert len(cities) >= 9
    city_ids = [c["id"] for c in cities]
    assert "kyoto" in city_ids
    assert "lisbon" in city_ids

def test_filter_cities_by_region(client):
    response = client.get("/api/cities?region=Europe")
    assert response.status_code == 200
    cities = response.json()
    for c in cities:
        assert c["region"] == "Europe"

def test_search_cities_by_query(client):
    response = client.get("/api/cities?query=temple")
    assert response.status_code == 200
    cities = response.json()
    assert any(c["id"] == "kyoto" for c in cities)

def test_get_single_city(client):
    response = client.get("/api/cities/kyoto")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Kyoto"
    assert data["lodgingPerNight"] == 96.0

def test_get_activities_for_city(client):
    response = client.get("/api/activities?cityId=kyoto")
    assert response.status_code == 200
    acts = response.json()
    assert len(acts) >= 4
    categories = [a["category"] for a in acts]
    assert "Culture" in categories

def test_filter_activities_by_category(client):
    response = client.get("/api/activities?cityId=kyoto&category=Culture")
    assert response.status_code == 200
    acts = response.json()
    for a in acts:
        assert a["category"] == "Culture"
