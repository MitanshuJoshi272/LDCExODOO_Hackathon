import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.trip import Trip
from app.models.stop import Stop
from app.models.city import City
from app.models.activity import Activity
from app.schemas.trip import StopCreate, StopUpdate, StopResponse, StopReorderRequest

router = APIRouter(prefix="/trips/{trip_id}/stops", tags=["Stops"])

@router.post("", response_model=StopResponse, status_code=status.HTTP_201_CREATED)
def add_stop_to_trip(
    trip_id: str,
    payload: StopCreate,
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")

    city = db.query(City).filter(City.id == payload.city_id).first()
    if not city:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"City '{payload.city_id}' does not exist.")

    stop_count = db.query(Stop).filter(Stop.trip_id == trip.id).count()
    stop_id = payload.id or f"stop-{uuid.uuid4().hex[:8]}"

    stop = Stop(
        id=stop_id,
        trip_id=trip.id,
        city_id=payload.city_id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        notes=payload.notes or "",
        transport_cost=payload.transport_cost,
        order_index=stop_count,
        activity_ids=payload.activity_ids or []
    )
    db.add(stop)
    db.commit()
    db.refresh(stop)
    return stop

@router.put("/{stop_id}", response_model=StopResponse)
def update_stop(
    trip_id: str,
    stop_id: str,
    payload: StopUpdate,
    db: Session = Depends(get_db)
):
    stop = db.query(Stop).filter(Stop.id == stop_id, Stop.trip_id == trip_id).first()
    if not stop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stop not found in this trip.")

    if payload.city_id is not None:
        city = db.query(City).filter(City.id == payload.city_id).first()
        if not city:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid cityId.")
        stop.city_id = payload.city_id

    if payload.start_date is not None:
        stop.start_date = payload.start_date
    if payload.end_date is not None:
        stop.end_date = payload.end_date
    if payload.notes is not None:
        stop.notes = payload.notes
    if payload.transport_cost is not None:
        stop.transport_cost = payload.transport_cost
    if payload.activity_ids is not None:
        stop.activity_ids = payload.activity_ids

    db.commit()
    db.refresh(stop)
    return stop

@router.delete("/{stop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stop(
    trip_id: str,
    stop_id: str,
    db: Session = Depends(get_db)
):
    stop = db.query(Stop).filter(Stop.id == stop_id, Stop.trip_id == trip_id).first()
    if not stop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stop not found.")

    db.delete(stop)
    db.commit()

    # Re-normalize order indices
    remaining = db.query(Stop).filter(Stop.trip_id == trip_id).order_by(Stop.order_index).all()
    for idx, s in enumerate(remaining):
        s.order_index = idx
    db.commit()
    return None

@router.post("/reorder", response_model=List[StopResponse])
def reorder_stops(
    trip_id: str,
    req: StopReorderRequest,
    db: Session = Depends(get_db)
):
    stops = db.query(Stop).filter(Stop.trip_id == trip_id).order_by(Stop.order_index).all()
    idx = next((i for i, s in enumerate(stops) if s.id == req.stop_id), -1)
    if idx < 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stop not found.")

    target_idx = idx + req.direction
    if 0 <= target_idx < len(stops):
        # Swap
        stops[idx], stops[target_idx] = stops[target_idx], stops[idx]
        for i, s in enumerate(stops):
            s.order_index = i
        db.commit()

    return db.query(Stop).filter(Stop.trip_id == trip_id).order_by(Stop.order_index).all()

@router.post("/{stop_id}/activities/{activity_id}/toggle", response_model=StopResponse)
def toggle_stop_activity(
    trip_id: str,
    stop_id: str,
    activity_id: str,
    db: Session = Depends(get_db)
):
    stop = db.query(Stop).filter(Stop.id == stop_id, Stop.trip_id == trip_id).first()
    if not stop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stop not found.")

    curr_acts = list(stop.activity_ids or [])
    if activity_id in curr_acts:
        curr_acts.remove(activity_id)
    else:
        curr_acts.append(activity_id)

    stop.activity_ids = curr_acts
    db.commit()
    db.refresh(stop)
    return stop
