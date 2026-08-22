from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.city import City
from app.schemas.city import CityCreate, CityUpdate, CityResponse
from app.services.auth import require_admin

router = APIRouter(prefix="/cities", tags=["Cities"])

@router.get("", response_model=List[CityResponse])
def get_cities(
    query: Optional[str] = Query(None, description="Search by name, country, or tag"),
    region: Optional[str] = Query(None, description="Filter by region e.g. Europe, Asia, Africa"),
    max_budget: Optional[int] = Query(None, alias="maxBudget", description="Max cost index (1 to 5)"),
    db: Session = Depends(get_db)
):
    q = db.query(City)

    if region and region != "All regions":
        q = q.filter(City.region == region)

    if max_budget is not None:
        q = q.filter(City.cost_index <= max_budget)

    results = q.order_by(City.popularity.desc()).all()

    if query and query.strip():
        term = query.strip().lower()
        results = [
            c for c in results
            if term in c.name.lower() or term in c.country.lower() or any(term in t.lower() for t in (c.tags or []))
        ]

    return results

@router.get("/{city_id}", response_model=CityResponse)
def get_city(city_id: str, db: Session = Depends(get_db)):
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"City '{city_id}' not found.")
    return city

@router.post("", response_model=CityResponse, status_code=status.HTTP_201_CREATED)
def create_city(
    payload: CityCreate,
    db: Session = Depends(get_db),
    _admin = Depends(require_admin)
):
    existing = db.query(City).filter(City.id == payload.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"City with id '{payload.id}' already exists.")

    city = City(
        id=payload.id,
        name=payload.name,
        country=payload.country,
        region=payload.region,
        image=payload.image,
        blurb=payload.blurb,
        lodging_per_night=payload.lodging_per_night,
        daily_living_cost=payload.daily_living_cost,
        cost_index=payload.cost_index,
        popularity=payload.popularity,
        tags=payload.tags
    )
    db.add(city)
    db.commit()
    db.refresh(city)
    return city

@router.put("/{city_id}", response_model=CityResponse)
def update_city(
    city_id: str,
    payload: CityUpdate,
    db: Session = Depends(get_db),
    _admin = Depends(require_admin)
):
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="City not found.")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(city, field, value)

    db.commit()
    db.refresh(city)
    return city

@router.delete("/{city_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_city(
    city_id: str,
    db: Session = Depends(get_db),
    _admin = Depends(require_admin)
):
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="City not found.")
    db.delete(city)
    db.commit()
    return None
