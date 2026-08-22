def test_trip_cost_calculation(client):
    response = client.get("/api/trips/trip-japan/cost")
    assert response.status_code == 200
    cost = response.json()
    
    # Kyoto trip: 1 stop, 7 nights, 1 traveler
    # Lodging: 8000 * 7 = 56000
    # Living: 4800 * 7 * 1 = 33600
    # Activities: kyo-1 (₹0), kyo-2 (₹2300), kyo-4 (₹4500) = ₹6800
    # Transport: ₹74000
    # Total: 56000 + 33600 + 6800 + 74000 = 170400
    assert cost["nights"] == 7
    assert cost["lodging"] == 56000.0
    assert cost["living"] == 33600.0
    assert cost["activities"] == 6800.0
    assert cost["transport"] == 74000.0
    assert cost["total"] == 170400.0
    assert cost["budgetCap"] == 215000.0
    assert cost["isOverBudget"] is False
    assert cost["variance"] == 44600.0

def test_budget_optimization_tips(client):
    response = client.get("/api/trips/trip-iberia/budget-optimization")
    assert response.status_code == 200
    data = response.json()
    assert "breakdown" in data
    assert len(data["breakdown"]) == 4
    assert len(data["tips"]) >= 1
