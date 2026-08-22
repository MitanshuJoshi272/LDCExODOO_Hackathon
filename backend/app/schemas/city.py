from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

class CityBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    id: str
    name: str
    country: str
    region: str
    image: str
    blurb: str
    lodging_per_night: float = Field(..., alias="lodgingPerNight")
    daily_living_cost: float = Field(..., alias="dailyLivingCost")
    cost_index: int = Field(..., alias="costIndex")
    popularity: int = 80
    tags: List[str] = []

class CityCreate(CityBase):
    pass

class CityUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: Optional[str] = None
    country: Optional[str] = None
    region: Optional[str] = None
    image: Optional[str] = None
    blurb: Optional[str] = None
    lodging_per_night: Optional[float] = Field(None, alias="lodgingPerNight")
    daily_living_cost: Optional[float] = Field(None, alias="dailyLivingCost")
    cost_index: Optional[int] = Field(None, alias="costIndex")
    popularity: Optional[int] = None
    tags: Optional[List[str]] = None

class CityResponse(CityBase):
    pass
