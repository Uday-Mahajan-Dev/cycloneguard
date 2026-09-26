from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class FloodPolygonFeatureProperties(BaseModel):
    flood_depth_m: float = Field(..., description="Inundation depth in meters above ground level")
    elevation_m: float = Field(..., description="Estimated ground elevation in meters")
    extrude_height: float = Field(..., description="Scaled 3D extrusion height for Deck.gl / MapLibre 3D")
    surge_height_m: float | None = None
    hazard_level: str | None = None
    inundation_area_km2: float | None = None


class SurgeSimulationRequest(BaseModel):
    storm_id: UUID
    lat: float
    lon: float
    max_wind_kmh: float
    central_pressure_hpa: float


class SurgeSimulationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

    id: UUID
    storm_id: UUID
    surge_height_m: float
    flood_area_km2: float
    flood_polygon_geojson: dict[str, Any]
    dem_source: str
    model_used: str
    confidence: float
    computed_at: datetime
