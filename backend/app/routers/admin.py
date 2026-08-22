from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.trip import Trip
from app.models.stop import Stop
from app.models.city import City
from app.models.activity import Activity
from app.models.log import ActivityLog
from app.schemas.admin import AdminMetricsResponse, ActivityLogResponse, CityStat

router = APIRouter(prefix="/admin", tags=["Admin & Analytics"])

def format_relative_time(dt: datetime) -> str:
    now = datetime.utcnow()
    diff = now - dt
    seconds = int(diff.total_seconds())
    if seconds < 60:
        return "Just now"
    minutes = seconds // 60
    if minutes < 60:
        return f"{minutes} min{'s' if minutes > 1 else ''} ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    days = hours // 24
    return f"{days} day{'s' if days > 1 else ''} ago"

@router.get("/metrics", response_model=AdminMetricsResponse)
def get_admin_metrics(db: Session = Depends(get_db)):
    trips = db.query(Trip).all()
    users_count = db.query(User).count()
    cities = db.query(City).all()
    activities_count = db.query(Activity).count()

    total_trips = len(trips)
    avg_budget = (
        round(sum(t.budget_cap for t in trips) / total_trips, 2)
        if total_trips > 0 else 0.0
    )

    # City counts across all itinerary stops
    city_counts: dict[str, int] = {}
    stops = db.query(Stop).all()
    for s in stops:
        city_counts[s.city_id] = city_counts.get(s.city_id, 0) + 1

    popular_cities = [
        CityStat(
            id=c.id,
            name=c.name,
            country=c.country,
            count=city_counts.get(c.id, 0)
        )
        for c in cities
    ]
    popular_cities.sort(key=lambda x: x.count, reverse=True)

    return AdminMetricsResponse(
        total_trips=total_trips,
        total_users=users_count,
        avg_budget_cap=avg_budget,
        registered_cities=len(cities),
        available_activities=activities_count,
        popular_cities=popular_cities
    )

@router.get("/logs", response_model=List[ActivityLogResponse])
def get_activity_logs(db: Session = Depends(get_db)):
    logs = db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(20).all()
    return [
        ActivityLogResponse(
            id=l.id,
            user=l.user_name,
            user_email=l.user_email,
            action=l.action,
            details=l.details,
            time=format_relative_time(l.timestamp)
        )
        for l in logs
    ]
