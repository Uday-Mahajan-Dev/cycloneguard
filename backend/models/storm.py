from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, computed_field


class StormTrackPoint(BaseModel):
    lat: float
    lon: float
    timestamp: str | datetime
    wind_kmh: float
    pressure_hpa: float


class StormCreate(BaseModel):
    name: str
    basin: str = "BOB"
    category: str | None = None
    current_lat: float
    current_lon: float
    max_wind_kmh: float | None = None
    central_pressure_hpa: float | None = None
    predicted_landfall_lat: float | None = None
    predicted_landfall_lon: float | None = None
    predicted_landfall_time: datetime | None = None
    track_geojson: dict[str, Any] | None = None
    source: str = "NOAA_IBTrACS"


class StormResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

    id: UUID
    name: str
    basin: str
    category: str | None = None
    status: str
    current_lat: float
    current_lon: float
    max_wind_kmh: float | None = None
    central_pressure_hpa: float | None = None
    predicted_landfall_lat: float | None = None
    predicted_landfall_lon: float | None = None
    predicted_landfall_time: datetime | None = None
    track_geojson: dict[str, Any] | None = None
    source: str
    fetched_at: datetime
    created_at: datetime

    @computed_field
    def hours_to_landfall(self) -> float | None:
        if not self.predicted_landfall_time:
            return None
        landfall = self.predicted_landfall_time
        if landfall.tzinfo is None:
            landfall = landfall.replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        diff_seconds = (landfall - now).total_seconds()
        return round(diff_seconds / 3600.0, 2)
