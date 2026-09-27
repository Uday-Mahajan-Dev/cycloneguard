from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class InfrastructureResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

    id: UUID | str
    osm_id: int | None = None
    name: str
    type: str
    subtype: str | None = None
    capacity: int | None = None
    district: str | None = None
    state: str | None = None
    elevation_m: float | None = None
    geom_geojson: dict[str, Any] | None = None


class ExposureResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

    infrastructure_id: UUID | str
    name: str
    type: str
    flood_depth_m: float
    risk_level: str
    is_accessible: bool
    recommended_action: str
    lat: float
    lon: float
