import uuid
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.connection import get_db
from backend.db.models import Storm
from backend.models.marine import MarineDataResponse
from backend.models.storm import StormCreate, StormResponse
from backend.services.marine_fetcher import fetch_live_marine_data
from backend.services.storm_fetcher import StormFetcher

router = APIRouter(prefix="/storms", tags=["Storms"])
fetcher = StormFetcher()


@router.get("/live-marine", response_model=MarineDataResponse, summary="Fetch real-time marine telemetry, wave height, and ocean currents")
async def get_live_marine(
    lat: float = Query(19.805, description="Latitude for marine telemetry"),
    lon: float = Query(85.830, description="Longitude for marine telemetry"),
) -> MarineDataResponse:
    """
    Returns real-time significant wave height, swell period, ocean surface current velocity,
    wave drag coefficients, and barometric pressure drop rate.
    """
    return await fetch_live_marine_data(lat=lat, lon=lon)


@router.get("/active", response_model=list[StormResponse], summary="Fetch all currently active storms")
async def get_active_storms(db: AsyncSession = Depends(get_db)) -> list[StormResponse]:
    """Retrieves all storms marked with 'active' status."""
    stmt = select(Storm).where(Storm.status == "active").order_by(Storm.created_at.desc())
    result = await db.execute(stmt)
    storms = result.scalars().all()

    # If no storms in DB, trigger auto-load of Fani 2019 Ground Truth
    if not storms:
        fani_create = StormFetcher.get_fani_2019_ground_truth()
        fani_storm = Storm(
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
        db.add(fani_storm)
        await db.commit()
        await db.refresh(fani_storm)
        storms = [fani_storm]

    return [StormResponse.model_validate(s) for s in storms]


@router.get("/{storm_id}", response_model=StormResponse, summary="Get details for a specific storm")
async def get_storm(storm_id: UUID, db: AsyncSession = Depends(get_db)) -> StormResponse:
    """Retrieves full trajectory and meteorological parameters for a storm by UUID."""
    stmt = select(Storm).where(Storm.id == storm_id)
    result = await db.execute(stmt)
    storm = result.scalar_one_or_none()

    if not storm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Storm with ID {storm_id} not found",
        )

    return StormResponse.model_validate(storm)


@router.post("/load-case-study/fani-2019", response_model=StormResponse, summary="Load Mode A: Cyclone Fani May 2019 Verified Historical Case Study")
async def load_fani_case_study(db: AsyncSession = Depends(get_db)) -> StormResponse:
    """
    Seeds verified historical ground truth for Cyclone Fani (May 2019):
    Category: Extremely Severe Cyclonic Storm (Cat 4 Equivalent), 185 km/h winds, 937 hPa pressure, Puri landfall.
    """
    demo_data = StormFetcher.get_fani_2019_ground_truth()
    storm_id = uuid.uuid4()

    storm = Storm(
        id=storm_id,
        name=demo_data.name,
        basin=demo_data.basin,
        category=demo_data.category,
        status="active",
        current_lat=demo_data.current_lat,
        current_lon=demo_data.current_lon,
        max_wind_kmh=demo_data.max_wind_kmh,
        central_pressure_hpa=demo_data.central_pressure_hpa,
        predicted_landfall_lat=demo_data.predicted_landfall_lat,
        predicted_landfall_lon=demo_data.predicted_landfall_lon,
        predicted_landfall_time=demo_data.predicted_landfall_time,
        track_geojson=demo_data.track_geojson,
        source=demo_data.source,
    )

    db.add(storm)
    await db.commit()
    await db.refresh(storm)

    return StormResponse.model_validate(storm)


@router.post("/fetch-live", response_model=StormResponse, summary="Load Mode B: Ingest Live Atmospheric & Marine Telemetry from Open-Meteo")
async def fetch_live_storm(db: AsyncSession = Depends(get_db)) -> StormResponse:
    """
    Queries live Open-Meteo marine and atmospheric APIs for the Bay of Bengal and persists
    real-time pressure and cyclonic wind indicators.
    """
    live_data = await fetcher.fetch_live_bay_of_bengal()
    storm_id = uuid.uuid4()

    storm = Storm(
        id=storm_id,
        name=live_data.name,
        basin=live_data.basin,
        category=live_data.category,
        status="active",
        current_lat=live_data.current_lat,
        current_lon=live_data.current_lon,
        max_wind_kmh=live_data.max_wind_kmh,
        central_pressure_hpa=live_data.central_pressure_hpa,
        predicted_landfall_lat=live_data.predicted_landfall_lat,
        predicted_landfall_lon=live_data.predicted_landfall_lon,
        predicted_landfall_time=live_data.predicted_landfall_time,
        track_geojson=live_data.track_geojson,
        source=live_data.source,
    )

    db.add(storm)
    await db.commit()
    await db.refresh(storm)

    return StormResponse.model_validate(storm)


# Backward-compatible alias
@router.post("/seed-demo", response_model=StormResponse, summary="Alias for load-case-study/fani-2019")
async def seed_demo_storm(db: AsyncSession = Depends(get_db)) -> StormResponse:
    return await load_fani_case_study(db=db)
