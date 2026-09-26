import logging
import math
from typing import Any

from shapely.geometry import MultiPolygon, Polygon, mapping, shape
from shapely.ops import unary_union

from backend.utils.geo_utils import normalize_to_multipolygon_geojson

logger = logging.getLogger("cycloneguard.surge_model")


def calculate_parametric_surge_height(central_pressure_hpa: float, max_wind_kmh: float) -> float:
    """
    Parametric storm surge calculation for Bay of Bengal bathymetry:
    H_surge = (1013 - central_pressure_hpa) * 0.01 + max_wind_kmh * 0.015
    """
    delta_p = max(0.0, 1013.25 - central_pressure_hpa)
    h_barometer = delta_p * 0.01
    h_wind = max(0.0, max_wind_kmh) * 0.015
    total_surge = h_barometer + h_wind
    return round(max(0.5, total_surge), 2)


def sanitize_flood_geometry(geom_or_geojson: Any) -> dict[str, Any]:
    """
    Sanitizes any flood geometry to ensure it is always a valid GeoJSON MultiPolygon or Polygon,
    extracting sub-geometries from GeometryCollections and combining them using Shapely unary_union.
    """
    if isinstance(geom_or_geojson, dict):
        return normalize_to_multipolygon_geojson(geom_or_geojson)
    elif hasattr(geom_or_geojson, "geom_type"):
        s = geom_or_geojson
        if not s.is_valid:
            s = s.buffer(0)
        if s.geom_type == "Polygon":
            return mapping(MultiPolygon([s]))
        elif s.geom_type == "MultiPolygon":
            return mapping(s)
        elif s.geom_type == "GeometryCollection":
            polys = [p for p in s.geoms if p.geom_type in ("Polygon", "MultiPolygon")]
            if not polys:
                return {"type": "MultiPolygon", "coordinates": []}
            merged = unary_union(polys)
            if merged.geom_type == "Polygon":
                merged = MultiPolygon([merged])
            return mapping(merged)
        return mapping(s)
    return {"type": "MultiPolygon", "coordinates": []}
