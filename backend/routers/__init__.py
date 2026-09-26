from backend.routers.alerts import router as alerts_router
from backend.routers.gemini import router as gemini_router
from backend.routers.health import router as health_router
from backend.routers.infrastructure import router as infrastructure_router
from backend.routers.insurance import router as insurance_router
from backend.routers.storm import router as storm_router
from backend.routers.surge import router as surge_router

__all__ = [
    "health_router",
    "storm_router",
    "surge_router",
    "infrastructure_router",
    "gemini_router",
    "alerts_router",
    "insurance_router",
]
