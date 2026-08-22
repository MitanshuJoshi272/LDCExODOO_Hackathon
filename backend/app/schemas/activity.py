from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class ActivityBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    id: str
    city_id: str = Field(..., alias="cityId")
    name: str
    category: str
    duration_hours: float = Field(2.0, alias="durationHours")
    cost: float = 0.0
    description: str

class ActivityCreate(ActivityBase):
    pass

class ActivityUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    city_id: Optional[str] = Field(None, alias="cityId")
    name: Optional[str] = None
    category: Optional[str] = None
    duration_hours: Optional[float] = Field(None, alias="durationHours")
    cost: Optional[float] = None
    description: Optional[str] = None

class ActivityResponse(ActivityBase):
    pass
