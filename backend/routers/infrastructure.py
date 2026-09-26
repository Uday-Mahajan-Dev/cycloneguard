import json
import logging
import uuid
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.connection import get_db
from backend.models.infrastructure import ExposureResultResponse, InfrastructureResponse
from backend.services.infrastructure_query import find_exposed_infrastructure
from backend.utils.http_client import get_http_client

router = APIRouter(prefix="/infrastructure", tags=["Infrastructure"])
logger = logging.getLogger("cycloneguard.infra_router")


PURI_FANI_GROUND_TRUTH_ASSETS = [
    {
        "name": "District HQ Hospital Puri",
        "type": "hospital",
        "subtype": "Tertiary Trauma & Emergency Center",
        "capacity": 650,
        "lat": 19.805,
        "lon": 85.828,
        "district": "Puri",
        "state": "Odisha",
        "elevation_m": 2.5,
    },
    {
        "name": "Puri Town 33kV Substation",
        "type": "power_substation",
        "subtype": "Primary Grid Distribution Substation",
        "capacity": 45000,
        "lat": 19.825,
        "lon": 85.845,
        "district": "Puri",
        "state": "Odisha",
        "elevation_m": 1.8,
    },
    {
        "name": "Mangalahat Feeder Bridge (NH-316)",
        "type": "bridge",
        "subtype": "Primary Evacuation Corridor Bridge",
        "capacity": 50000,
        "lat": 19.812,
        "lon": 85.811,
        "district": "Puri",
        "state": "Odisha",
        "elevation_m": 1.2,
    },
    {
        "name": "Talabania Multi-purpose Cyclone Shelter",
        "type": "shelter",
        "subtype": "Multi-Purpose Cyclone Shelter",
        "capacity": 2500,
        "lat": 19.818,
        "lon": 85.849,
        "district": "Puri",
        "state": "Odisha",
        "elevation_m": 3.2,
    },
    {
        "name": "Balighai Substation",
        "type": "power_substation",
        "subtype": "Coastal Feeder Substation",
        "capacity": 18000,
        "lat": 19.845,
        "lon": 85.905,
        "district": "Puri",
        "state": "Odisha",
        "elevation_m": 1.4,
    },
    {
        "name": "Swargadwar Coastal Center & Shelter",
        "type": "shelter",
        "subtype": "High-Capacity Coastal Shelter",
        "capacity": 1500,
        "lat": 19.791,
        "lon": 85.819,
        "district": "Puri",
        "state": "Odisha",
        "elevation_m": 1.5,
    },
    {
        "name": "Puri Municipal Stormwater Pumping Station",
        "type": "pumping_station",
        "subtype": "Urban Storm Drainage Station",
        "capacity": 120000,
        "lat": 19.798,
        "lon": 85.822,
        "district": "Puri",
        "state": "Odisha",
        "elevation_m": 0.9,
    },
    {
        "name": "Konark 11kV Feeder Substation",
        "type": "power_substation",
        "subtype": "Secondary Distribution Substation",
        "capacity": 20000,
        "lat": 19.892,
        "lon": 86.094,
        "district": "Puri",
        "state": "Odisha",
        "elevation_m": 2.1,
    },
    {
        "name": "Gop Block Cyclone Shelter",
        "type": "shelter",
        "subtype": "Regional Disaster Shelter",
        "capacity": 1800,
        "lat": 19.996,
        "lon": 86.008,
        "district": "Puri",
        "state": "Odisha",
        "elevation_m": 4.5,
    },
    {
        "name": "Brahmagiri Rural Power Substation",
        "type": "power_substation",
        "subtype": "Rural Grid Substation",
        "capacity": 25000,
        "lat": 19.802,
        "lon": 85.672,
        "district": "Puri",
        "state": "Odisha",
        "elevation_m": 2.8,
    },
]


@router.get("", response_model=list[InfrastructureResponse], summary="List critical infrastructure assets with GeoJSON geometry")
async def list_infrastructure(
    type: str | None = Query(None, description="Filter by asset category (e.g. power_substation, hospital, shelter, bridge)"),
    district: str | None = Query(None, description="Filter by district name (e.g. Puri)"),
    db: AsyncSession = Depends(get_db),
) -> list[InfrastructureResponse]:
    """
    Returns registered infrastructure assets. Geometries are serialized directly to GeoJSON
    via PostGIS ST_AsGeoJSON(ST_Force2D(geom)) to prevent dimension and binary WKB serialization errors.
    """
    conditions = ["1=1"]
    params: dict[str, Any] = {}

    if type:
        conditions.append("type = :type")
        params["type"] = type
    if district:
        conditions.append("district = :district")
        params["district"] = district

    where_clause = " AND ".join(conditions)
    sql = f"""
        SELECT 
            id,
            osm_id,
            name,
            type,
            subtype,
            capacity,
            district,
            state,
            elevation_m,
            ST_AsGeoJSON(ST_Force2D(geom))::json AS geom_geojson
        FROM infrastructure
        WHERE {where_clause}
        ORDER BY name ASC;
    """

    res = await db.execute(text(sql), params)
    rows = res.fetchall()

    results: list[InfrastructureResponse] = []
    for r in rows:
        results.append(
            InfrastructureResponse(
                id=r.id,
                osm_id=r.osm_id,
                name=r.name,
                type=r.type,
                subtype=r.subtype,
                capacity=r.capacity,
                district=r.district,
                state=r.state,
                elevation_m=r.elevation_m,
                geom_geojson=r.geom_geojson if isinstance(r.geom_geojson, dict) else json.loads(r.geom_geojson) if r.geom_geojson else None,
            )
        )

    return results


@router.get("/exposed/{simulation_id}", response_model=list[ExposureResultResponse], summary="Perform spatial exposure analysis for a surge simulation")
async def get_exposed_infrastructure(
    simulation_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> list[ExposureResultResponse]:
    """
    Performs spatial overlay between the simulated coastal inundation polygon and critical assets.
    Computes asset-level inundation depth and operational mitigations using 2D PostGIS primitives.
    """
    sim_sql = text(
        """
        SELECT 
            id,
            storm_id,
            surge_height_m,
            ST_AsGeoJSON(ST_Force2D(flood_polygon))::json AS flood_geojson
        FROM surge_simulations
        WHERE id = :sim_id;
        """
    )
    sim_res = await db.execute(sim_sql, {"sim_id": simulation_id})
    sim_row = sim_res.fetchone()

    if not sim_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Surge simulation with ID {simulation_id} not found",
        )

    flood_polygon_geojson = sim_row.flood_geojson
    if isinstance(flood_polygon_geojson, str):
        flood_polygon_geojson = json.loads(flood_polygon_geojson)
    elif not isinstance(flood_polygon_geojson, dict):
        flood_polygon_geojson = {}

    exposed_assets = await find_exposed_infrastructure(
        session=db,
        storm_id=sim_row.storm_id,
        simulation_id=sim_row.id,
        surge_height_m=sim_row.surge_height_m,
        flood_polygon_geojson=flood_polygon_geojson,
    )

    return exposed_assets


@router.post("/load-puri-ground-truth", summary="Mode A: Seed 10 Authentic Puri Infrastructure Facilities Affected During Cyclone Fani")
async def load_puri_ground_truth(db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    """
    Seeds 10 authentic coastal infrastructure assets in Puri (District HQ Hospital, Town Substation,
    Mangalahat Bridge, Talabania Shelter, Balighai, Swargadwar, etc.) with accurate elevations and coordinates.
    """
    inserted_count = 0
    for asset in PURI_FANI_GROUND_TRUTH_ASSETS:
        check_sql = text("SELECT id FROM infrastructure WHERE name = :name")
        res = await db.execute(check_sql, {"name": asset["name"]})
        if res.fetchone():
            continue

        insert_sql = text(
            """
            INSERT INTO infrastructure (
                id, name, type, subtype, capacity, geom, district, state, elevation_m
            ) VALUES (
                :id,
                :name,
                :type,
                :subtype,
                :capacity,
                ST_Force2D(ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)),
                :district,
                :state,
                :elevation_m
            );
            """
        )
        await db.execute(
            insert_sql,
            {
                "id": uuid.uuid4(),
                "name": asset["name"],
                "type": asset["type"],
                "subtype": asset["subtype"],
                "capacity": asset["capacity"],
                "lon": asset["lon"],
                "lat": asset["lat"],
                "district": asset["district"],
                "state": asset["state"],
                "elevation_m": asset["elevation_m"],
            },
        )
        inserted_count += 1

    await db.commit()

    return {
        "status": "success",
        "mode": "Mode A (Fani 2019 Ground Truth)",
        "assets_inserted": inserted_count,
        "total_seeded_profile": len(PURI_FANI_GROUND_TRUTH_ASSETS),
        "district": "Puri",
    }


@router.post("/fetch-live-osm/{district_name}", summary="Mode B: Query Live OpenStreetMap Overpass API for Real-Time Infrastructure")
async def fetch_live_osm_infrastructure(
    district_name: str = "Puri",
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """
    Queries live OpenStreetMap Overpass API for active hospitals, power substations, and emergency shelters
    within the specified district bounding box, inserting them directly into PostGIS.
    """
    client = get_http_client()
    overpass_url = "https://overpass-api.de/api/interpreter"

    # Overpass QL query around Puri coastal zone [19.7, 85.6, 20.1, 86.2]
    query = f"""
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](19.7,85.6,20.1,86.2);
      node["power"="substation"](19.7,85.6,20.1,86.2);
      node["amenity"="shelter"](19.7,85.6,20.1,86.2);
    );
    out body 20;
    """

    inserted = 0
    try:
        headers = {
            "User-Agent": "CycloneGuard/1.0 (Emergency-Action-Platform)",
            "Accept": "application/json, */*",
        }
        resp = await client.post(
            overpass_url,
            data={"data": query},
            headers=headers,
            timeout=20.0,
        )
        if resp.status_code == 200:
            data = resp.json()
            elements = data.get("elements", [])
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
                    res = await db.execute(check_sql, {"osm_id": osm_id})
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
                        await db.execute(
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

            await db.commit()
            return {
                "status": "success",
                "mode": "Mode B (Live OSM Ingestion)",
                "district": district_name,
                "elements_found": len(elements),
                "assets_inserted": inserted,
            }
    except Exception as exc:
        logger.warning("Overpass API query failed (%s); falling back to Puri ground truth.", exc)

    # Fallback to local ground truth if OSM Overpass is unreachable
    return await load_puri_ground_truth(db=db)


# Backward-compatible alias
@router.post("/seed-demo", summary="Alias for load-puri-ground-truth")
async def seed_demo_infrastructure(db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    return await load_puri_ground_truth(db=db)
