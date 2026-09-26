import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from backend.models.storm import StormCreate
from backend.utils.http_client import get_http_client

logger = logging.getLogger("cycloneguard.storm_fetcher")


class StormFetcher:
    """
    Dual-engine storm telemetry service:
    - Mode A (Default Hackathon Ground Truth): Cyclone Fani (May 2019, Puri, Odisha)
      with verified historical trajectory, 185 km/h winds, and 937 hPa central pressure.
    - Mode B (Operational Live Feed): Live Open-Meteo marine/atmospheric telemetry queries.
    """

    @staticmethod
    def get_fani_2019_ground_truth() -> StormCreate:
        """
        Returns verified historical parameters for Cyclone Fani (May 2019, Puri Landfall).
        Category: Extremely Severe Cyclonic Storm (Cat 4 Equivalent)
        Peak Landfall Wind: 185 km/h (gusts to 215 km/h)
        Minimum Central Pressure: 937 hPa
        Landfall Target: Puri Coast, Odisha (19.805°N, 85.830°E)
        """
        now = datetime.now(timezone.utc)
        landfall_time = now + timedelta(hours=36)

        track_features: list[dict[str, Any]] = [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [87.5, 14.2]},
                "properties": {
                    "timestamp": (now - timedelta(hours=36)).isoformat(),
                    "wind_kmh": 115.0,
                    "pressure_hpa": 982.0,
                    "stage": "Deep Bay of Bengal (Genesis / T-36h)",
                    "is_historical": True,
                },
            },
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [86.8, 16.5]},
                "properties": {
                    "timestamp": (now - timedelta(hours=24)).isoformat(),
                    "wind_kmh": 155.0,
                    "pressure_hpa": 960.0,
                    "stage": "Very Severe Cyclonic Storm (T-24h)",
                    "is_historical": True,
                },
            },
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [86.2, 18.1]},
                "properties": {
                    "timestamp": (now - timedelta(hours=12)).isoformat(),
                    "wind_kmh": 185.0,
                    "pressure_hpa": 937.0,
                    "stage": "Extremely Severe Cyclone (Peak Cat 4 / T-12h)",
                    "is_historical": True,
                },
            },
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [85.830, 19.805]},
                "properties": {
                    "timestamp": landfall_time.isoformat(),
                    "wind_kmh": 185.0,
                    "pressure_hpa": 937.0,
                    "stage": "Landfall at Puri Coastal Corridor (T-0)",
                    "is_historical": False,
                },
            },
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [85.5, 21.0]},
                "properties": {
                    "timestamp": (landfall_time + timedelta(hours=12)).isoformat(),
                    "wind_kmh": 95.0,
                    "pressure_hpa": 990.0,
                    "stage": "Inland Weakening Corridor (T+12h)",
                    "is_historical": False,
                },
            },
        ]

        track_geojson = {
            "type": "FeatureCollection",
            "features": track_features,
        }

        return StormCreate(
            name="Cyclone Fani (May 2019)",
            basin="BOB",
            category="Extremely Severe Cyclone",
            current_lat=18.3,
            current_lon=85.2,
            max_wind_kmh=185.0,
            central_pressure_hpa=937.0,
            predicted_landfall_lat=19.805,
            predicted_landfall_lon=85.830,
            predicted_landfall_time=landfall_time,
            track_geojson=track_geojson,
            source="IMD_Fani_2019",
        )

    # Alias for backward compatibility
    @staticmethod
    def generate_demo_storm() -> StormCreate:
        return StormFetcher.get_fani_2019_ground_truth()

    async def fetch_live_bay_of_bengal(self) -> StormCreate:
        """
        Queries live Open-Meteo marine and atmospheric APIs for the Bay of Bengal (lat=18.0, lon=87.0).
        Classifies current meteorological indicators and returns live StormCreate telemetry.
        """
        client = get_http_client()
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": 18.0,
            "longitude": 87.0,
            "current": "surface_pressure,wind_speed_10m,wind_gusts_10m",
            "hourly": "surface_pressure,wind_speed_10m",
            "timezone": "UTC",
        }

        try:
            resp = await client.get(url, params=params, timeout=10.0)
            if resp.status_code == 200:
                data = resp.json()
                curr = data.get("current", {})
                wind_speed_kmh = float(curr.get("wind_speed_10m", 45.0) or 45.0)
                pressure_hpa = float(curr.get("surface_pressure", 1008.0) or 1008.0)

                # Classify based on IMD cyclonic storm scale
                if wind_speed_kmh >= 166:
                    category = "Extremely Severe Cyclonic Storm"
                elif wind_speed_kmh >= 118:
                    category = "Very Severe Cyclonic Storm"
                elif wind_speed_kmh >= 88:
                    category = "Severe Cyclonic Storm"
                elif wind_speed_kmh >= 62:
                    category = "Cyclonic Storm"
                elif wind_speed_kmh >= 51:
                    category = "Deep Depression"
                else:
                    category = "Tropical Depression / Marine Baseline"

                now = datetime.now(timezone.utc)
                landfall_time = now + timedelta(hours=36)

                track_geojson = {
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "type": "Feature",
                            "geometry": {"type": "Point", "coordinates": [87.0, 18.0]},
                            "properties": {
                                "timestamp": now.isoformat(),
                                "wind_kmh": wind_speed_kmh,
                                "pressure_hpa": pressure_hpa,
                                "stage": category,
                            },
                        },
                        {
                            "type": "Feature",
                            "geometry": {"type": "Point", "coordinates": [85.83, 19.8]},
                            "properties": {
                                "timestamp": landfall_time.isoformat(),
                                "wind_kmh": round(wind_speed_kmh * 1.1, 1),
                                "pressure_hpa": round(pressure_hpa - 5.0, 1),
                                "stage": "Forecast Trajectory",
                            },
                        },
                    ],
                }

                return StormCreate(
                    name=f"Bay of Bengal Live Monitoring ({category})",
                    basin="BOB",
                    category=category,
                    current_lat=18.0,
                    current_lon=87.0,
                    max_wind_kmh=wind_speed_kmh,
                    central_pressure_hpa=pressure_hpa,
                    predicted_landfall_lat=19.80,
                    predicted_landfall_lon=85.83,
                    predicted_landfall_time=landfall_time,
                    track_geojson=track_geojson,
                    source="Open_Meteo_Live_Atmospheric_Grid",
                )
        except Exception as exc:
            logger.warning("Failed to query live Open-Meteo endpoint (%s); returning Fani 2019 ground-truth", exc)

        return self.get_fani_2019_ground_truth()

    async def fetch_active_storms(self) -> list[StormCreate]:
        """Returns list of active storms, defaulting to live or Fani ground-truth."""
        live_storm = await self.fetch_live_bay_of_bengal()
        return [live_storm]
