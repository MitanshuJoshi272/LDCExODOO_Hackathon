from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.city import City
from app.models.trip import Trip
from app.schemas.auth import UserProfileResponse, UserProfileUpdate
from app.services.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    patch: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if patch.name is not None:
        current_user.name = patch.name.strip()
        current_user.avatar = "".join([p[0] for p in patch.name.split() if p])[:2].upper() or "US"
    if patch.email is not None:
        existing = db.query(User).filter(User.email == patch.email.lower(), User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already taken by another account.")
        current_user.email = patch.email.lower().strip()
    if patch.avatar is not None:
        current_user.avatar = patch.avatar
    if patch.language is not None:
        current_user.language = patch.language

    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/saved-destinations/{city_id}", response_model=UserProfileResponse)
def save_destination(
    city_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="City not found")
    
    saved = list(current_user.saved_destinations or [])
    if city_id not in saved:
        saved.append(city_id)
        current_user.saved_destinations = saved
        db.commit()
        db.refresh(current_user)
    return current_user

@router.delete("/saved-destinations/{city_id}", response_model=UserProfileResponse)
def remove_saved_destination(
    city_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    saved = list(current_user.saved_destinations or [])
    if city_id in saved:
        saved.remove(city_id)
        current_user.saved_destinations = saved
        db.commit()
        db.refresh(current_user)
    return current_user

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Delete trips owned by user
    db.query(Trip).filter(Trip.user_id == current_user.id).delete()
    db.delete(current_user)
    db.commit()
    return None
