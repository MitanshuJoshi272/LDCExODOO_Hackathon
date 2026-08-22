import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.trip import Trip
from app.models.stop import Stop
from app.models.log import ActivityLog
from app.schemas.trip import TripCreate, TripUpdate, TripResponse
from app.services.auth import get_current_user_optional, get_current_user
from app.services.export_service import export_trip_to_csv, export_trip_to_ics

router = APIRouter(prefix="/trips", tags=["Trips"])

@router.get("", response_model=List[TripResponse])
def get_trips(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    if current_user:
        trips = db.query(Trip).filter((Trip.user_id == current_user.id) | (Trip.user_id == None)).order_by(Trip.created_at.desc()).all()
    else:
        trips = db.query(Trip).order_by(Trip.created_at.desc()).all()
    return trips

@router.get("/public/{trip_id}", response_model=TripResponse)
def get_public_trip(trip_id: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")
    return trip

@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(trip_id: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip '{trip_id}' not found.")
    return trip

@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(
    payload: TripCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    trip_id = payload.id or f"trip-{uuid.uuid4().hex[:8]}"
    
    trip = Trip(
        id=trip_id,
        user_id=current_user.id if current_user else None,
        name=payload.name.strip(),
        description=payload.description or "",
        cover_image=payload.cover_image or "",
        start_date=payload.start_date,
        budget_cap=payload.budget_cap,
        travelers=payload.travelers,
        is_public=payload.is_public
    )
    db.add(trip)
    db.flush()

    if payload.stops:
        for idx, s in enumerate(payload.stops):
            stop_id = s.id or f"stop-{uuid.uuid4().hex[:8]}"
            stop = Stop(
                id=stop_id,
                trip_id=trip.id,
                city_id=s.city_id,
                start_date=s.start_date,
                end_date=s.end_date,
                notes=s.notes or "",
                transport_cost=s.transport_cost,
                order_index=idx,
                activity_ids=s.activity_ids or []
            )
            db.add(stop)

    # Activity Log
    user_name = current_user.name if current_user else "Guest Explorer"
    user_email = current_user.email if current_user else "guest@globetrotter.io"
    log = ActivityLog(
        user_name=user_name,
        user_email=user_email,
        action="Created trip",
        details=trip.name
    )
    db.add(log)

    db.commit()
    db.refresh(trip)
    return trip

@router.put("/{trip_id}", response_model=TripResponse)
def update_trip(
    trip_id: str,
    payload: TripUpdate,
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")

    if payload.name is not None:
        trip.name = payload.name.strip()
    if payload.description is not None:
        trip.description = payload.description
    if payload.cover_image is not None:
        trip.cover_image = payload.cover_image
    if payload.start_date is not None:
        trip.start_date = payload.start_date
    if payload.budget_cap is not None:
        trip.budget_cap = payload.budget_cap
    if payload.travelers is not None:
        trip.travelers = payload.travelers
    if payload.is_public is not None:
        trip.is_public = payload.is_public

    if payload.stops is not None:
        # Replace stops
        db.query(Stop).filter(Stop.trip_id == trip.id).delete()
        for idx, s in enumerate(payload.stops):
            stop = Stop(
                id=s.id or f"stop-{uuid.uuid4().hex[:8]}",
                trip_id=trip.id,
                city_id=s.city_id,
                start_date=s.start_date,
                end_date=s.end_date,
                notes=s.notes or "",
                transport_cost=s.transport_cost,
                order_index=idx,
                activity_ids=s.activity_ids or []
            )
            db.add(stop)

    db.commit()
    db.refresh(trip)
    return trip

@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(trip_id: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")
    db.delete(trip)
    db.commit()
    return None

@router.post("/{trip_id}/duplicate", response_model=TripResponse)
def duplicate_trip(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    original = db.query(Trip).filter(Trip.id == trip_id).first()
    if not original:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")

    new_trip_id = f"trip-{uuid.uuid4().hex[:8]}"
    duplicated = Trip(
        id=new_trip_id,
        user_id=current_user.id if current_user else original.user_id,
        name=f"Copy of {original.name}",
        description=original.description,
        cover_image=original.cover_image,
        start_date=original.start_date,
        budget_cap=original.budget_cap,
        travelers=original.travelers,
        is_public=False
    )
    db.add(duplicated)
    db.flush()

    for s in original.stops:
        dup_stop = Stop(
            id=f"stop-{uuid.uuid4().hex[:8]}",
            trip_id=duplicated.id,
            city_id=s.city_id,
            start_date=s.start_date,
            end_date=s.end_date,
            notes=s.notes,
            transport_cost=s.transport_cost,
            order_index=s.order_index,
            activity_ids=list(s.activity_ids or [])
        )
        db.add(dup_stop)

    log = ActivityLog(
        user_name=current_user.name if current_user else "Explorer",
        user_email=current_user.email if current_user else "guest@globetrotter.io",
        action="Duplicated trip",
        details=duplicated.name
    )
    db.add(log)
    db.commit()
    db.refresh(duplicated)
    return duplicated

@router.get("/{trip_id}/export/csv")
def export_csv(trip_id: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")
    
    csv_data = export_trip_to_csv(trip, db)
    filename = f"{trip.name.lower().replace(' ', '_')}_itinerary.csv"
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/{trip_id}/export/ics")
def export_ics(trip_id: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")
    
    ics_data = export_trip_to_ics(trip, db)
    filename = f"{trip.name.lower().replace(' ', '_')}_calendar.ics"
    return Response(
        content=ics_data,
        media_type="text/calendar",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
