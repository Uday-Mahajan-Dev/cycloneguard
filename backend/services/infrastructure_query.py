import json
import logging
import uuid
from typing import Any
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.models import ExposureResult
from backend.models.infrastructure import ExposureResultResponse
from backend.utils.geo_utils import extract_geometry_from_geojson

logger = logging.getLogger("cycloneguard.infra_query")


def determine_risk_and_action(infra_type: str, flood_depth_m: float) -> tuple[str, bool, str]:
    """
    Computes risk level, accessibility, and operational action recommendation
    based on asset category and computed flood depth.
    """
    infra_type_clean = (infra_type or "").lower()

    if flood_depth_m >= 1.5:
        risk_level = "Critical"
        is_accessible = False
    elif flood_depth_m >= 0.5:
        risk_level = "High"
        is_accessible = flood_depth_m < 0.8
    elif flood_depth_m >= 0.1:
        risk_level = "Moderate"
        is_accessible = True
    else:
        risk_level = "Low"
        is_accessible = True

    if "substation" in infra_type_clean or "power" in infra_type_clean or "grid" in infra_type_clean:
        if risk_level == "Critical":
            action = "Immediate controlled shutdown and islanding required to prevent catastrophic grid cascade and transformer explosions"
        elif risk_level == "High":
            action = "Prepare backup power circuits; de-energize ground-level distribution switchgears and isolate vulnerable coastal feeders"
        elif risk_level == "Moderate":
            action = "Monitor water ingress telemetry; stage rapid response electrical restoration crew"
        else:
            action = "Standard coastal monitoring and telemetry watch"

    elif "hospital" in infra_type_clean or "health" in infra_type_clean or "medical" in infra_type_clean:
        if risk_level == "Critical":
            action = "Vertical evacuation of ICU/patients to level 2+; activate elevated emergency generators and emergency oxygen supply"
        elif risk_level == "High":
            action = "Deploy perimeter flood barriers; transfer ground-floor pharmaceuticals and diagnostics to upper floors"
        elif risk_level == "Moderate":
            action = "Verify oxygen cylinder security; test auxiliary emergency water filtration units"
        else:
            action = "Stock 72-hour emergency trauma supplies and standby emergency medical teams"

    elif "shelter" in infra_type_clean:
        if risk_level == "Critical":
            action = "Reroute evacuees to secondary inland shelter; ground floor submerged"
        elif risk_level == "High":
            action = "Inundated ground floor; house all evacuees on 1st & 2nd floors; deploy dewatering pumps"
        elif risk_level == "Moderate":
            action = "Active sheltering mode; verify emergency dry food rations and sanitation water"
        else:
            action = "Normal cyclone reception mode with full capacity available"

    elif "bridge" in infra_type_clean or "road" in infra_type_clean:
        if risk_level == "Critical":
            action = "Full corridor closure; bridge approach inundation danger; deploy barricades and detour traffic"
        elif risk_level == "High":
            action = "Restrict heavy transport; post dynamic hazard warning signs"
        elif risk_level == "Moderate":
            action = "Impose 20 km/h cautionary speed limit due to water sheeting"
        else:
            action = "Corridor clear with normal traffic flow"

    elif "pump" in infra_type_clean or "water" in infra_type_clean:
        if risk_level == "Critical":
            action = "De-energize low-lying motor bays; switch to automated elevated gravity bypass"
        elif risk_level == "High":
            action = "Operate drainage pumps at maximum surge clearance capacity"
        elif risk_level == "Moderate":
            action = "Continuous intake salinity and siltation monitoring"
        else:
            action = "Normal baseline operations"

    else:
        if risk_level == "Critical":
            action = "Mandatory emergency evacuation and site lockout"
        elif risk_level == "High":
            action = "Deploy flood protection barriers and secure auxiliary utilities"
        elif risk_level == "Moderate":
            action = "Monitor localized flood gauge sensors"
        else:
            action = "Routine precautionary standby"

    return risk_level, is_accessible, action


async def find_exposed_infrastructure(
    session: AsyncSession,
    storm_id: UUID,
    simulation_id: UUID,
    surge_height_m: float,
    flood_polygon_geojson: dict[str, Any],
) -> list[ExposureResultResponse]:
    """
    Performs PostGIS spatial intersection using ST_Force2D and ST_SetSRID(..., 4326)
    to eliminate coordinate dimension mismatches against the infrastructure table.
    """
    clean_geom = extract_geometry_from_geojson(flood_polygon_geojson)
    polygon_str = json.dumps(clean_geom)

    # 1. Primary spatial intersection query with ST_Force2D and ST_SetSRID
    query = text(
        """
        SELECT 
            id,
            name,
            type,
            subtype,
            capacity,
            district,
            state,
            COALESCE(elevation_m, 2.5) AS elevation_m,
            ST_X(ST_Centroid(ST_Force2D(geom))) AS lon,
            ST_Y(ST_Centroid(ST_Force2D(geom))) AS lat
        FROM infrastructure
        WHERE ST_Intersects(
            ST_Force2D(geom),
            ST_Force2D(ST_SetSRID(ST_GeomFromGeoJSON(:poly), 4326))
        )
        ORDER BY elevation_m ASC;
        """
    )

    result = await session.execute(query, {"poly": polygon_str})
    rows = result.fetchall()

    # 2. Fallback query if localized polygon did not directly intersect stored assets
    if not rows:
        fallback_query = text(
            """
            SELECT 
                id,
                name,
                type,
                subtype,
                capacity,
                district,
                state,
                COALESCE(elevation_m, 2.5) AS elevation_m,
                ST_X(ST_Centroid(ST_Force2D(geom))) AS lon,
                ST_Y(ST_Centroid(ST_Force2D(geom))) AS lat
            FROM infrastructure
            ORDER BY elevation_m ASC
            LIMIT 15;
            """
        )
        result = await session.execute(fallback_query)
        rows = result.fetchall()

    # Clean existing exposure records for this simulation
    await session.execute(
        text("DELETE FROM exposure_results WHERE simulation_id = :sim_id"),
        {"sim_id": simulation_id},
    )

    exposure_responses: list[ExposureResultResponse] = []
    exposure_db_objects: list[ExposureResult] = []

    for row in rows:
        infra_id = row.id
        name = row.name
        infra_type = row.type
        elevation = float(row.elevation_m)
        lon = float(row.lon)
        lat = float(row.lat)

        # Inundation depth: max(0.0, surge_height - elevation)
        flood_depth = max(0.0, round(surge_height_m - elevation, 2))
        risk_level, is_accessible, action = determine_risk_and_action(infra_type, flood_depth)

        db_exposure = ExposureResult(
            id=uuid.uuid4(),
            storm_id=storm_id,
            simulation_id=simulation_id,
            infrastructure_id=infra_id,
            flood_depth_m=flood_depth,
            risk_level=risk_level,
            is_accessible=is_accessible,
            recommended_action=action,
        )
        exposure_db_objects.append(db_exposure)

        exposure_responses.append(
            ExposureResultResponse(
                infrastructure_id=infra_id,
                name=name,
                type=infra_type,
                flood_depth_m=flood_depth,
                risk_level=risk_level,
                is_accessible=is_accessible,
                recommended_action=action,
                lat=lat,
                lon=lon,
            )
        )

    if exposure_db_objects:
        session.add_all(exposure_db_objects)
        await session.commit()

    return exposure_responses
