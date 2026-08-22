def test_ai_suggest_itinerary(client):
    response = client.post("/api/ai/suggest-itinerary", json={
        "region": "Europe",
        "startDate": "2026-09-01",
        "durationDays": 8,
        "travelers": 2,
        "budgetCap": 4000.0,
        "travelStyle": "Balanced",
        "interests": ["Culture", "Food"]
    })
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert len(data["stops"]) >= 1
    assert data["estimatedTotalCost"] > 0
    assert "aiRationale" in data

def test_smart_packing_list(client):
    response = client.get("/api/ai/packing-list/trip-iberia")
    assert response.status_code == 200
    data = response.json()
    assert data["tripId"] == "trip-iberia"
    assert "season" in data
    assert len(data["categories"]) >= 3

def test_export_csv_and_ics(client):
    csv_res = client.get("/api/trips/trip-iberia/export/csv")
    assert csv_res.status_code == 200
    assert "Trip Name,Iberian Slow Loop" in csv_res.text

    ics_res = client.get("/api/trips/trip-iberia/export/ics")
    assert ics_res.status_code == 200
    assert "BEGIN:VCALENDAR" in ics_res.text
    assert "END:VCALENDAR" in ics_res.text

def test_admin_metrics(client):
    response = client.get("/api/admin/metrics")
    assert response.status_code == 200
    metrics = response.json()
    assert metrics["totalTrips"] >= 2
    assert metrics["registeredCities"] >= 9
    assert metrics["availableActivities"] >= 30
