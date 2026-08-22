from datetime import datetime
from typing import List, Dict, Tuple
from sqlalchemy.orm import Session
from app.models.trip import Trip
from app.models.stop import Stop
from app.models.city import City
from app.models.activity import Activity
from app.schemas.budget import (
    StopCostResponse,
    TripCostResponse,
    BudgetOptimizationResponse,
    BudgetCategoryBreakdown,
    BudgetOptimizationTip,
)

def parse_iso_date(date_str: str) -> datetime:
    try:
        return datetime.strptime(date_str.strip()[:10], "%Y-%m-%d")
    except Exception:
        return datetime.utcnow()

def calculate_stop_nights(start_date_str: str, end_date_str: str) -> int:
    d1 = parse_iso_date(start_date_str)
    d2 = parse_iso_date(end_date_str)
    delta = (d2 - d1).days
    return max(delta, 0)

def calculate_stop_cost(stop: Stop, travelers: int, db: Session) -> StopCostResponse:
    city = db.query(City).filter(City.id == stop.city_id).first()
    nights = calculate_stop_nights(stop.start_date, stop.end_date)
    days = max(nights, 1)

    lodging = (city.lodging_per_night * nights) if city else 0.0
    living = (city.daily_living_cost * days * travelers) if city else 0.0

    # Activities cost
    activities_cost = 0.0
    if stop.activity_ids:
        acts = db.query(Activity).filter(Activity.id.in_(stop.activity_ids)).all()
        activities_cost = sum(a.cost * travelers for a in acts)

    transport = stop.transport_cost * travelers
    total = lodging + living + activities_cost + transport

    return StopCostResponse(
        stop_id=stop.id,
        city_id=stop.city_id,
        city_name=city.name if city else stop.city_id,
        nights=nights,
        days=days,
        lodging=round(lodging, 2),
        living=round(living, 2),
        activities=round(activities_cost, 2),
        transport=round(transport, 2),
        total=round(total, 2)
    )

def calculate_trip_cost(trip: Trip, db: Session) -> TripCostResponse:
    per_stop_costs = [calculate_stop_cost(stop, trip.travelers, db) for stop in trip.stops]

    total_nights = sum(s.nights for s in per_stop_costs)
    total_days = max(total_nights, 1)
    total_lodging = sum(s.lodging for s in per_stop_costs)
    total_living = sum(s.living for s in per_stop_costs)
    total_activities = sum(s.activities for s in per_stop_costs)
    total_transport = sum(s.transport for s in per_stop_costs)
    total_cost = sum(s.total for s in per_stop_costs)

    is_over = total_cost > trip.budget_cap
    variance = round(trip.budget_cap - total_cost, 2)
    cost_per_day = round(total_cost / total_nights, 2) if total_nights > 0 else round(total_cost, 2)

    return TripCostResponse(
        lodging=round(total_lodging, 2),
        living=round(total_living, 2),
        activities=round(total_activities, 2),
        transport=round(total_transport, 2),
        total=round(total_cost, 2),
        nights=total_nights,
        days=total_days,
        per_stop=per_stop_costs,
        budget_cap=round(trip.budget_cap, 2),
        is_over_budget=is_over,
        variance=variance,
        cost_per_day=cost_per_day
    )

def optimize_trip_budget(trip: Trip, db: Session) -> BudgetOptimizationResponse:
    cost = calculate_trip_cost(trip, db)
    total = cost.total or 1.0

    breakdown = [
        BudgetCategoryBreakdown(category="Lodging", amount=cost.lodging, percentage=round((cost.lodging / total) * 100, 1)),
        BudgetCategoryBreakdown(category="Daily Living & Food", amount=cost.living, percentage=round((cost.living / total) * 100, 1)),
        BudgetCategoryBreakdown(category="Activities & Experiences", amount=cost.activities, percentage=round((cost.activities / total) * 100, 1)),
        BudgetCategoryBreakdown(category="Transport", amount=cost.transport, percentage=round((cost.transport / total) * 100, 1)),
    ]

    tips: List[BudgetOptimizationTip] = []

    # High lodging tip
    if cost.lodging > 0.4 * cost.total:
        tips.append(BudgetOptimizationTip(
            title="Consider Boutique Apartments or Neighborhood Stays",
            description="Lodging accounts for over 40% of your total spend. Switching from central city hotels to rated holiday apartments in adjacent bohemian quarters can save up to 25% on accommodation.",
            potential_savings=round(cost.lodging * 0.20, 2),
            impact="High"
        ))

    # Transport savings
    if cost.transport > 0.25 * cost.total:
        tips.append(BudgetOptimizationTip(
            title="Book High-Speed Rail & Regional Transit in Advance",
            description="Regional high-speed trains (like Renfe or Shinkansen) offer early-bird discounts of 30-50% when booked 6-8 weeks ahead instead of on-demand ticketing.",
            potential_savings=round(cost.transport * 0.25, 2),
            impact="Medium"
        ))

    # Activities optimization
    if cost.activities > 0.2 * cost.total:
        tips.append(BudgetOptimizationTip(
            title="Leverage Multi-Attraction City Passes & Free Museum Days",
            description="Many European and Asian cultural capitals offer combined museum cards and free admission mornings (e.g. first Sunday of the month).",
            potential_savings=round(cost.activities * 0.30, 2),
            impact="Medium"
        ))

    if not tips:
        tips.append(BudgetOptimizationTip(
            title="Balanced Itinerary Efficiency",
            description="Your current trip allocation is well-balanced across living, transport, and experiences!",
            potential_savings=round(cost.total * 0.05, 2),
            impact="Low"
        ))

    return BudgetOptimizationResponse(
        trip_id=trip.id,
        current_cost=cost.total,
        budget_cap=trip.budget_cap,
        is_over_budget=cost.is_over_budget,
        breakdown=breakdown,
        tips=tips
    )
