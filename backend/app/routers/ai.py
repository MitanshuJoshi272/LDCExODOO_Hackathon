from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.trip import Trip
from app.schemas.ai import AISuggestRequest, AISuggestResponse, PackingListResponse
from app.services.ai_generator import generate_ai_itinerary, generate_smart_packing_list

router = APIRouter(prefix="/ai", tags=["AI & Recommendations"])

@router.post("/suggest-itinerary", response_model=AISuggestResponse)
def suggest_itinerary(req: AISuggestRequest, db: Session = Depends(get_db)):
    return generate_ai_itinerary(req, db)

@router.get("/packing-list/{trip_id}", response_model=PackingListResponse)
def get_packing_list(trip_id: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")
    return generate_smart_packing_list(trip, db)
