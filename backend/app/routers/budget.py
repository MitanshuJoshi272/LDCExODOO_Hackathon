from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.trip import Trip
from app.schemas.budget import TripCostResponse, BudgetOptimizationResponse
from app.services.budget_calculator import calculate_trip_cost, optimize_trip_budget

router = APIRouter(prefix="/trips/{trip_id}", tags=["Budget"])

@router.get("/cost", response_model=TripCostResponse)
def get_trip_cost(trip_id: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")
    return calculate_trip_cost(trip, db)

@router.get("/budget-optimization", response_model=BudgetOptimizationResponse)
def get_budget_optimization(trip_id: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")
    return optimize_trip_budget(trip, db)
