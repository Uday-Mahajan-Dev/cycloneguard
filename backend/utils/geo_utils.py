import math
from typing import Any

from shapely.geometry import GeometryCollection, MultiPolygon, Polygon, mapping, shape
from shapely.ops import unary_union


def geom_to_geojson_sql(column_name: str) -> str:
    """Returns SQL fragment to serialize a PostGIS geometry column as JSON."""
    return f"ST_AsGeoJSON({column_name})::json"


def bbox_from_point(lat: float, lon: float, radius_km: float) -> tuple[float, float, float, float]:
    """
    Computes a bounding box (min_lon, min_lat, max_lon, max_lat) around a coordinate.
    Uses 1 degree latitude ~ 111.32 km and longitude scaled by cos(lat).
    """
    lat_delta = radius_km / 111.32
    cos_lat = math.cos(math.radians(lat))
    lon_delta = radius_km / (111.32 * abs(cos_lat)) if abs(cos_lat) > 1e-6 else radius_km / 111.32

    min_lat = lat - lat_delta
    max_lat = lat + lat_delta
    min_lon = lon - lon_delta
    max_lon = lon + lon_delta

    return (min_lon, min_lat, max_lon, max_lat)


def normalize_to_multipolygon_geojson(geojson_obj: dict[str, Any]) -> dict[str, Any]:
    """
    Normalizes any GeoJSON geometry, Feature, or FeatureCollection into a valid
    GeoJSON MultiPolygon or Polygon dictionary.
    
    If the geometry is a GeometryCollection or a collection of features,
    it extracts all Polygon/MultiPolygon sub-geometries and combines them
    using unary_union to prevent PostGIS 'GeometryCollection does not match column type MultiPolygon' errors.
    """
    if not geojson_obj or not isinstance(geojson_obj, dict):
        return {"type": "MultiPolygon", "coordinates": []}

    try:
        obj_type = geojson_obj.get("type")
        if obj_type == "FeatureCollection":
            features = geojson_obj.get("features", [])
            polys: list[Polygon] = []
            for f in features:
                geom_dict = f.get("geometry") if isinstance(f, dict) else None
                if geom_dict:
                    s = shape(geom_dict)
                    if not s.is_valid:
                        s = s.buffer(0)
                    if s.geom_type == "Polygon":
                        polys.append(s)
                    elif s.geom_type == "MultiPolygon":
                        polys.extend(list(s.geoms))
                    elif s.geom_type == "GeometryCollection":
                        for sub_geom in s.geoms:
                            if sub_geom.geom_type == "Polygon":
                                polys.append(sub_geom)
                            elif sub_geom.geom_type == "MultiPolygon":
                                polys.extend(list(sub_geom.geoms))
            if not polys:
                return {"type": "MultiPolygon", "coordinates": []}
            merged = unary_union(polys)
            if not merged.is_valid:
                merged = merged.buffer(0)
            if merged.geom_type == "Polygon":
                merged = MultiPolygon([merged])
            elif merged.geom_type == "GeometryCollection":
                clean_polys = [p for p in merged.geoms if p.geom_type in ("Polygon", "MultiPolygon")]
                merged = MultiPolygon([p for p in clean_polys if p.geom_type == "Polygon"] + [p for mp in clean_polys if mp.geom_type == "MultiPolygon" for p in mp.geoms])
            return mapping(merged)

        elif obj_type == "Feature":
            geom_dict = geojson_obj.get("geometry", {})
            return normalize_to_multipolygon_geojson(geom_dict)

        else:
            s = shape(geojson_obj)
            if not s.is_valid:
                s = s.buffer(0)
            if s.geom_type == "Polygon":
                return mapping(MultiPolygon([s]))
            elif s.geom_type == "MultiPolygon":
                return mapping(s)
            elif s.geom_type == "GeometryCollection":
                polys = []
                for p in s.geoms:
                    if p.geom_type == "Polygon":
                        polys.append(p)
                    elif p.geom_type == "MultiPolygon":
                        polys.extend(list(p.geoms))
                if not polys:
                    return {"type": "MultiPolygon", "coordinates": []}
                merged = unary_union(polys)
                if not merged.is_valid:
                    merged = merged.buffer(0)
                if merged.geom_type == "Polygon":
                    merged = MultiPolygon([merged])
                return mapping(merged)
            else:
                return mapping(s)
    except Exception:
        # Fallback to basic dictionary if shape parsing fails
        if geojson_obj.get("type") == "GeometryCollection":
            geoms = geojson_obj.get("geometries", [])
            poly_geoms = [g for g in geoms if isinstance(g, dict) and g.get("type") in ("Polygon", "MultiPolygon")]
            if poly_geoms:
                return poly_geoms[0]
        return geojson_obj


def extract_geometry_from_geojson(geojson_obj: dict[str, Any]) -> dict[str, Any]:
    """
    Extracts a PostGIS-compatible GeoJSON geometry from a FeatureCollection, Feature,
    or Geometry dictionary, always normalizing to Polygon/MultiPolygon.
    """
    return normalize_to_multipolygon_geojson(geojson_obj)
