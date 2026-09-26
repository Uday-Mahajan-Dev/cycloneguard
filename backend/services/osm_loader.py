import logging
import uuid
from typing import Any
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from backend.utils.http_client import get_http_client

logger = logging.getLogger("cycloneguard.osm_loader")

OVERPASS_HEADERS = {
    "User-Agent": "CycloneGuard/1.0 (Emergency-Action-Platform)",
    "Accept": "application/json, */*",
}


async def fetch_osm_infrastructure(
    district_name: str = "Puri",
    bbox: tuple[float, float, float, float] = (19.7, 85.6, 20.1, 86.2),
    session: AsyncSession | None = None,
) -> dict[str, Any]:
    """
    Queries live OpenStreetMap Overpass API for critical infrastructure
    (hospitals, power substations, disaster shelters) within the given bounding box.
    Uses custom User-Agent header to avoid HTTP 406 Not Acceptable errors.
    """
    client = get_http_client()
    overpass_url = "https://overpass-api.de/api/interpreter"

    min_lat, min_lon, max_lat, max_lon = bbox
    query = f"""
    [out:json][timeout:25];
    (
      node["amenity"="hospital"]({min_lat},{min_lon},{max_lat},{max_lon});
      node["power"="substation"]({min_lat},{min_lon},{max_lat},{max_lon});
      node["amenity"="shelter"]({min_lat},{min_lon},{max_lat},{max_lon});
    );
    out body 25;
    """

    inserted = 0
    elements: list[dict[str, Any]] = []

    try:
        resp = await client.post(
            overpass_url,
            data={"data": query},
            headers=OVERPASS_HEADERS,
            timeout=20.0,
        )
        if resp.status_code == 200:
            data = resp.json()
            elements = data.get("elements", [])

            if session:
                for elem in elements:
                    osm_id = elem.get("id")
                    tags = elem.get("tags", {})
                    name = tags.get("name", tags.get("name:en", f"OSM Asset {osm_id}"))
                    raw_type = tags.get("amenity") or tags.get("power") or "shelter"

                    if "hospital" in raw_type:
                        infra_type = "hospital"
                    elif "substation" in raw_type or "power" in raw_type:
                        infra_type = "power_substation"
                    else:
                        infra_type = "shelter"

                    lat = elem.get("lat")
                    lon = elem.get("lon")
                    if lat and lon:
                        check_sql = text("SELECT id FROM infrastructure WHERE osm_id = :osm_id")
                        res = await session.execute(check_sql, {"osm_id": osm_id})
                        if not res.fetchone():
                            insert_sql = text(
                                """
                                INSERT INTO infrastructure (
                                    id, osm_id, name, type, subtype, geom, district, state, elevation_m
                                ) VALUES (
                                    :id, :osm_id, :name, :type, :subtype,
                                    ST_Force2D(ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)),
                                    :district, :state, :elevation_m
                                );
                                """
                            )
                            await session.execute(
                                insert_sql,
                                {
                                    "id": uuid.uuid4(),
                                    "osm_id": osm_id,
                                    "name": name,
                                    "type": infra_type,
                                    "subtype": tags.get("operator", "Live OSM Feed"),
                                    "lon": lon,
                                    "lat": lat,
                                    "district": district_name,
                                    "state": "Odisha",
                                    "elevation_m": 2.2,
                                },
                            )
                            inserted += 1

                await session.commit()

            return {
                "status": "success",
                "district": district_name,
                "elements_found": len(elements),
                "assets_inserted": inserted,
            }
        else:
            logger.warning("Overpass API returned status code %d: %s", resp.status_code, resp.text[:200])
    except Exception as exc:
        logger.warning("Overpass API query failed: %s", exc)

    return {
        "status": "failed",
        "district": district_name,
        "elements_found": 0,
        "assets_inserted": 0,
    }
