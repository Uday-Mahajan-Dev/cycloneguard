from datetime import datetime, timezone
from typing import Any
from pydantic import BaseModel, Field


class MarineDataResponse(BaseModel):
    lat: float = Field(..., description="Latitude of marine buoy/grid point")
    lon: float = Field(..., description="Longitude of marine buoy/grid point")
    wave_height_m: float = Field(..., description="Significant wave height in meters")
    wave_period_s: float = Field(..., description="Peak swell period in seconds")
    wave_direction_deg: float = Field(..., description="Wave direction in degrees")
    ocean_current_velocity_kmh: float = Field(..., description="Ocean surface current velocity in km/h")
    ocean_current_direction_deg: float = Field(..., description="Ocean surface current direction in degrees")
    wave_drag_coefficient: float = Field(..., description="Hydrodynamic surface wave drag coefficient (Cd)")
    pressure_drop_rate_hpa_hr: float = Field(..., description="Atmospheric barometric pressure drop rate (hPa/hr)")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    source: str = Field(default="Open-Meteo Marine Global Ocean Telemetry")
    hourly_forecast: list[dict[str, Any]] | None = Field(default=None, description="Hourly time-series marine forecast")
