from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

class StopCostResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    stop_id: str = Field(..., alias="stopId")
    city_id: Optional[str] = Field(None, alias="cityId")
    city_name: Optional[str] = Field(None, alias="cityName")
    nights: int
    days: int
    lodging: float
    living: float
    activities: float
    transport: float
    total: float

class TripCostResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    lodging: float
    living: float
    activities: float
    transport: float
    total: float
    nights: int
    days: int
    per_stop: List[StopCostResponse] = Field(..., alias="perStop")
    budget_cap: float = Field(..., alias="budgetCap")
    is_over_budget: bool = Field(..., alias="isOverBudget")
    variance: float
    cost_per_day: float = Field(..., alias="costPerDay")

class BudgetCategoryBreakdown(BaseModel):
    category: str
    amount: float
    percentage: float

class BudgetOptimizationTip(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str
    description: str
    potential_savings: float = Field(..., alias="potentialSavings")
    impact: str

class BudgetOptimizationResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    trip_id: str = Field(..., alias="tripId")
    current_cost: float = Field(..., alias="currentCost")
    budget_cap: float = Field(..., alias="budgetCap")
    is_over_budget: bool = Field(..., alias="isOverBudget")
    breakdown: List[BudgetCategoryBreakdown]
    tips: List[BudgetOptimizationTip]
