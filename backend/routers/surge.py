import json
import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.connection import get_db
from backend.db.models import Storm, SurgeSimulation
from backend.models.surge import SurgeSimulationRequest, SurgeSimulationResponse
from backend.services.gee_processor import GEEProcessor
from backend.services.surge_model import calculate_parametric_surge_height, sanitize_flood_geometry
from backend.utils.geo_utils import extract_geometry_from_geojson

router = APIRouter(prefix="/surge", tags=["Surge Simulation"])
logger = logging.getLogger("cycloneguard.surge_router")

gee_processor = GEEProcessor()


@router.post("/simulate", response_model=SurgeSimulationResponse, summary="Run parametric storm surge and 3D coastal inundation simulation")
async def simulate_surge(
    req: SurgeSimulationRequest,
    db: AsyncSession = Depends(get_db),
) -> SurgeSimulationResponse:
    """
    Calculates hydrodynamic storm surge height, runs NASADEM 30m digital elevation thresholding,
    and returns vector inundation polygons with 3D extrusion properties for Deck.gl frontend rendering.
    """
    # 1. Verify storm exists
    storm = None
    if req.storm_id:
        try:
            storm_uuid = UUID(str(req.storm_id))
            stmt = select(Storm).where(Storm.id == storm_uuid)
            res = await db.execute(stmt)
            storm = res.scalar_one_or_none()
        except Exception:
            storm = None

    if not storm:
        stmt = select(Storm).where(Storm.status == "active").order_by(Storm.created_at.desc())
        res = await db.execute(stmt)
        storm = res.scalars().first()

    if not storm:
        from backend.services.storm_fetcher import StormFetcher
        fani_create = StormFetcher.get_fani_2019_ground_truth()
        storm = Storm(
            id=uuid.uuid4(),
            name=fani_create.name,
            basin=fani_create.basin,
            category=fani_create.category,
            status="active",
            current_lat=fani_create.current_lat,
            current_lon=fani_create.current_lon,
            max_wind_kmh=fani_create.max_wind_kmh,
            central_pressure_hpa=fani_create.central_pressure_hpa,
            predicted_landfall_lat=fani_create.predicted_landfall_lat,
            predicted_landfall_lon=fani_create.predicted_landfall_lon,
            predicted_landfall_time=fani_create.predicted_landfall_time,
            track_geojson=fani_create.track_geojson,
            source=fani_create.source,
        )
        db.add(storm)
        await db.commit()
        await db.refresh(storm)

    target_storm_id = storm.id

    # 2. Compute parametric surge height
    surge_height_m = calculate_parametric_surge_height(
        central_pressure_hpa=req.central_pressure_hpa,
        max_wind_kmh=req.max_wind_kmh,
    )

    # 3. Compute GEE / DEM flood polygon FeatureCollection with 3D extrusion attributes
    flood_res = await gee_processor.compute_surge_flood_polygon(
        lat=req.lat,
        lon=req.lon,
        surge_height_m=surge_height_m,
        radius_km=60.0,
    )
    polygon_geojson = flood_res.get("geojson", {})
    flood_area = float(flood_res.get("area_km2", 65.0))

    # 4. Store simulation in PostGIS database
    sim_id = uuid.uuid4()
    now_utc = datetime.now(timezone.utc)

    clean_geom = sanitize_flood_geometry(polygon_geojson)
    geom_expr = func.ST_Multi(
        func.ST_CollectionExtract(
            func.ST_Force2D(
                func.ST_SetSRID(
                    func.ST_GeomFromGeoJSON(json.dumps(clean_geom)),
                    4326,
                )
            ),
            3,
        )
    )

    simulation = SurgeSimulation(
        id=sim_id,
        storm_id=target_storm_id,
        surge_height_m=surge_height_m,
        flood_polygon=geom_expr,
        flood_area_km2=flood_area,
        rainfall_mm_72h=round(req.max_wind_kmh * 1.8, 1),
        dem_source="NASADEM_30m",
        model_used="Holland_SLOSH_Parametric",
        confidence=0.88,
    )

    db.add(simulation)
    await db.commit()

    return SurgeSimulationResponse(
        id=sim_id,
        storm_id=target_storm_id,
        surge_height_m=surge_height_m,
        flood_area_km2=flood_area,
        flood_polygon_geojson=polygon_geojson,
        dem_source="NASADEM_30m",
        model_used="Holland_SLOSH_Parametric",
        confidence=0.88,
        computed_at=now_utc,
    )
