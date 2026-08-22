from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.activity import Activity
from app.models.city import City
from app.schemas.activity import ActivityCreate, ActivityUpdate, ActivityResponse
from app.services.auth import require_admin

router = APIRouter(prefix="/activities", tags=["Activities"])

@router.get("", response_model=List[ActivityResponse])
def get_activities(
    city_id: Optional[str] = Query(None, alias="cityId", description="Filter by city ID"),
    category: Optional[str] = Query(None, description="Filter by category (Food, Culture, Nature, Nightlife, Adventure)"),
    max_cost: Optional[float] = Query(None, alias="maxCost", description="Filter by max cost in USD"),
    query: Optional[str] = Query(None, description="Search term in activity name or description"),
    db: Session = Depends(get_db)
):
    q = db.query(Activity)

    if city_id:
        q = q.filter(Activity.city_id == city_id)

    if category and category != "All":
        q = q.filter(Activity.category == category)

    if max_cost is not None:
        q = q.filter(Activity.cost <= max_cost)

    results = q.all()

    if query and query.strip():
        term = query.strip().lower()
        results = [
            a for a in results
            if term in a.name.lower() or term in a.description.lower()
        ]

    return results

@router.get("/{activity_id}", response_model=ActivityResponse)
def get_activity(activity_id: str, db: Session = Depends(get_db)):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Activity '{activity_id}' not found.")
    return activity

@router.post("", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(
    payload: ActivityCreate,
    db: Session = Depends(get_db),
    _admin = Depends(require_admin)
):
    # Verify city exists
    city = db.query(City).filter(City.id == payload.city_id).first()
    if not city:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"City '{payload.city_id}' does not exist.")

    activity = Activity(
        id=payload.id,
        city_id=payload.city_id,
        name=payload.name,
        category=payload.category,
        duration_hours=payload.duration_hours,
        cost=payload.cost,
        description=payload.description
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity

@router.put("/{activity_id}", response_model=ActivityResponse)
def update_activity(
    activity_id: str,
    payload: ActivityUpdate,
    db: Session = Depends(get_db),
    _admin = Depends(require_admin)
):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found.")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(activity, field, value)

    db.commit()
    db.refresh(activity)
    return activity

@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(
    activity_id: str,
    db: Session = Depends(get_db),
    _admin = Depends(require_admin)
):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found.")
    db.delete(activity)
    db.commit()
    return None
