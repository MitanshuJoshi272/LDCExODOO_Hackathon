def test_get_trips(client):
    response = client.get("/api/trips")
    assert response.status_code == 200
    trips = response.json()
    assert len(trips) >= 2
    trip_ids = [t["id"] for t in trips]
    assert "trip-iberia" in trip_ids

def test_get_single_trip(client):
    response = client.get("/api/trips/trip-iberia")
    assert response.status_code == 200
    trip = response.json()
    assert trip["name"] == "Iberian Slow Loop"
    assert len(trip["stops"]) == 3

def test_create_trip_and_add_stop(client):
    # 1. Create Trip
    create_res = client.post("/api/trips", json={
        "name": "Nordic Adventure",
        "description": "Reykjavik and beyond",
        "startDate": "2026-10-01",
        "budgetCap": 3500.0,
        "travelers": 2,
        "isPublic": True,
        "stops": [
            {
                "cityId": "reykjavik",
                "startDate": "2026-10-01",
                "endDate": "2026-10-05",
                "notes": "Base in downtown",
                "transportCost": 500.0,
                "activityIds": ["rey-1", "rey-2"]
            }
        ]
    })
    assert create_res.status_code == 201
    created = create_res.json()
    trip_id = created["id"]
    assert created["name"] == "Nordic Adventure"
    assert len(created["stops"]) == 1

    # 2. Add Stop to Trip
    stop_res = client.post(f"/api/trips/{trip_id}/stops", json={
        "cityId": "lisbon",
        "startDate": "2026-10-05",
        "endDate": "2026-10-09",
        "notes": "Sunny layover in Portugal",
        "transportCost": 120.0,
        "activityIds": ["lis-1"]
    })
    assert stop_res.status_code == 201
    stop = stop_res.json()
    stop_id = stop["id"]

    # 3. Toggle activity in stop
    toggle_res = client.post(f"/api/trips/{trip_id}/stops/{stop_id}/activities/lis-2/toggle")
    assert toggle_res.status_code == 200
    assert "lis-2" in toggle_res.json()["activityIds"]

    # 4. Duplicate Trip
    dup_res = client.post(f"/api/trips/{trip_id}/duplicate")
    assert dup_res.status_code == 200
    assert "Copy of Nordic Adventure" in dup_res.json()["name"]

def test_reorder_stops(client):
    # Iberian loop has 3 stops
    reorder_res = client.post("/api/trips/trip-iberia/stops/reorder", json={
        "stopId": "stop-lis",
        "direction": 1
    })
    assert reorder_res.status_code == 200
    stops = reorder_res.json()
    assert stops[0]["cityId"] == "barcelona"
    assert stops[1]["cityId"] == "lisbon"
