from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.cities import router as cities_router
from app.routers.activities import router as activities_router
from app.routers.trips import router as trips_router
from app.routers.stops import router as stops_router
from app.routers.budget import router as budget_router
from app.routers.ai import router as ai_router
from app.routers.admin import router as admin_router

__all__ = [
    "auth_router",
    "users_router",
    "cities_router",
    "activities_router",
    "trips_router",
    "stops_router",
    "budget_router",
    "ai_router",
    "admin_router",
]
