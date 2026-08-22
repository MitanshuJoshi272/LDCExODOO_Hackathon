from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

class AISuggestRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    destination_city_id: Optional[str] = Field(None, alias="destinationCityId")
    region: Optional[str] = "Europe"
    start_date: str = Field(..., alias="startDate")
    duration_days: int = Field(7, alias="durationDays")
    travelers: int = 1
    budget_cap: float = Field(2500.0, alias="budgetCap")
    travel_style: Optional[str] = Field("Balanced", alias="travelStyle")
    interests: List[str] = Field(default_factory=lambda: ["Culture", "Food"], alias="interests")

class AISuggestedStop(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    city_id: str = Field(..., alias="cityId")
    city_name: str = Field(..., alias="cityName")
    country: str
    start_date: str = Field(..., alias="startDate")
    end_date: str = Field(..., alias="endDate")
    nights: int
    notes: str
    recommended_activity_ids: List[str] = Field(..., alias="recommendedActivityIds")
    estimated_stop_cost: float = Field(..., alias="estimatedStopCost")

class AISuggestResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str
    description: str
    cover_image: str = Field(..., alias="coverImage")
    start_date: str = Field(..., alias="startDate")
    travelers: int
    budget_cap: float = Field(..., alias="budgetCap")
    estimated_total_cost: float = Field(..., alias="estimatedTotalCost")
    stops: List[AISuggestedStop]
    ai_rationale: str = Field(..., alias="aiRationale")

class PackingCategoryItem(BaseModel):
    item: str
    essential: bool = True
    tip: Optional[str] = None

class PackingCategory(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    category_name: str = Field(..., alias="categoryName")
    items: List[PackingCategoryItem]

class PackingListResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    trip_id: str = Field(..., alias="tripId")
    trip_name: str = Field(..., alias="tripName")
    season: str
    destinations: List[str]
    weather_summary: str = Field(..., alias="weatherSummary")
    categories: List[PackingCategory]
