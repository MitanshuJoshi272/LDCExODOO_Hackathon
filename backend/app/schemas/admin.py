from typing import List
from pydantic import BaseModel, Field, ConfigDict

class CityStat(BaseModel):
    id: str
    name: str
    country: str
    count: int

class AdminMetricsResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    total_trips: int = Field(..., alias="totalTrips")
    total_users: int = Field(..., alias="totalUsers")
    avg_budget_cap: float = Field(..., alias="avgBudgetCap")
    registered_cities: int = Field(..., alias="registeredCities")
    available_activities: int = Field(..., alias="availableActivities")
    popular_cities: List[CityStat] = Field(..., alias="popularCities")

class ActivityLogCreate(BaseModel):
    user_name: str
    user_email: str
    action: str
    details: str

class ActivityLogResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    id: str
    user: str = Field(..., alias="user")
    user_email: str = Field(..., alias="userEmail")
    action: str
    details: str
    time: str
