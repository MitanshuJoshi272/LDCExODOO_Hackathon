from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class StopBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    city_id: str = Field(..., alias="cityId")
    start_date: str = Field(..., alias="startDate")
    end_date: str = Field(..., alias="endDate")
    notes: Optional[str] = ""
    activity_ids: List[str] = Field(default_factory=list, alias="activityIds")
    transport_cost: float = Field(default=0.0, alias="transportCost")

class StopCreate(StopBase):
    id: Optional[str] = None

class StopUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    city_id: Optional[str] = Field(None, alias="cityId")
    start_date: Optional[str] = Field(None, alias="startDate")
    end_date: Optional[str] = Field(None, alias="endDate")
    notes: Optional[str] = None
    activity_ids: Optional[List[str]] = Field(None, alias="activityIds")
    transport_cost: Optional[float] = Field(None, alias="transportCost")

class StopResponse(StopBase):
    id: str

class StopReorderRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    stop_id: str = Field(..., alias="stopId")
    direction: int

class TripBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    name: str
    description: Optional[str] = ""
    cover_image: Optional[str] = Field("", alias="coverImage")
    start_date: str = Field(..., alias="startDate")
    budget_cap: float = Field(3000.0, alias="budgetCap")
    travelers: int = 1
    is_public: bool = Field(False, alias="isPublic")

class TripCreate(TripBase):
    id: Optional[str] = None
    stops: Optional[List[StopCreate]] = []

class TripUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = Field(None, alias="coverImage")
    start_date: Optional[str] = Field(None, alias="startDate")
    budget_cap: Optional[float] = Field(None, alias="budgetCap")
    travelers: Optional[int] = None
    is_public: Optional[bool] = Field(None, alias="isPublic")
    stops: Optional[List[StopCreate]] = None

class TripResponse(TripBase):
    id: str
    user_id: Optional[str] = Field(None, alias="userId")
    stops: List[StopResponse] = []
    created_at: Optional[datetime] = Field(None, alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")
