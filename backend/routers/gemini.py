import json
import logging
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.connection import get_db
from backend.models.gemini_schemas import CycloneGuardGeminiAnalysis
from backend.services.gemini_agent import GeminiAgent
from backend.services.marine_fetcher import fetch_live_marine_data

router = APIRouter(prefix="/gemini", tags=["Gemini AI Analysis"])
logger = logging.getLogger("cycloneguard.gemini_router")

gemini_agent = GeminiAgent()


class GeminiAnalyzeRequest(BaseModel):
    storm_id: UUID | str | None = None
    simulation_id: UUID | str | None = None


@router.post("/analyze", response_model=CycloneGuardGeminiAnalysis, summary="Synthesize multimodal cyclone disaster mitigation analysis via Gemini 2.5 Flash")
async def analyze_storm_impact(
    req: GeminiAnalyzeRequest,
    db: AsyncSession = Depends(get_db),
) -> CycloneGuardGeminiAnalysis:
    """
    Combines live/case-study storm kinematics, hydrodynamic surge modeling, and PostGIS infrastructure exposure
    to execute Gemini 2.5 Flash disaster cascade reasoning, grid shutdown scheduling, and bilingual emergency bulletins.
    """
    # 1. Fetch Storm record
    storm_uuid: UUID | None = None
    if req.storm_id:
        try:
            storm_uuid = UUID(str(req.storm_id))
        except (ValueError, TypeError, AttributeError):
            storm_uuid = None

    storm_row = None
    if storm_uuid:
        storm_sql = text(
            """
            SELECT 
                id, name, basin, category, status, current_lat, current_lon,
                max_wind_kmh, central_pressure_hpa, predicted_landfall_lat,
                predicted_landfall_lon, predicted_landfall_time, source
            FROM storms
            WHERE id = :storm_id;
            """
        )
        storm_res = await db.execute(storm_sql, {"storm_id": storm_uuid})
        storm_row = storm_res.fetchone()

    if not storm_row:
        active_sql = text(
            """
            SELECT 
                id, name, basin, category, status, current_lat, current_lon,
                max_wind_kmh, central_pressure_hpa, predicted_landfall_lat,
                predicted_landfall_lon, predicted_landfall_time, source
            FROM storms
            WHERE status = 'active'
            ORDER BY created_at DESC
            LIMIT 1;
            """
        )
        active_res = await db.execute(active_sql)
        storm_row = active_res.fetchone()

    if storm_row:
        storm_data: dict[str, Any] = {
            "id": str(storm_row.id),
            "name": storm_row.name,
            "basin": storm_row.basin,
            "category": storm_row.category,
            "current_lat": storm_row.current_lat,
            "current_lon": storm_row.current_lon,
            "max_wind_kmh": storm_row.max_wind_kmh,
            "central_pressure_hpa": storm_row.central_pressure_hpa,
            "predicted_landfall_lat": storm_row.predicted_landfall_lat,
            "predicted_landfall_lon": storm_row.predicted_landfall_lon,
            "predicted_landfall_time": str(storm_row.predicted_landfall_time) if storm_row.predicted_landfall_time else None,
        }
    else:
        storm_data = {
            "id": "storm-sys-91b",
            "name": "Active Severe System SYS-91B",
            "basin": "Bay of Bengal",
            "category": "Extremely Severe Cyclonic Storm (Cat 4)",
            "current_lat": 19.805,
            "current_lon": 85.83,
            "max_wind_kmh": 186.0,
            "central_pressure_hpa": 937.0,
            "predicted_landfall_lat": 19.805,
            "predicted_landfall_lon": 85.83,
            "predicted_landfall_time": None,
        }

    # 2. Fetch Surge Simulation
    sim_uuid: UUID | None = None
    if req.simulation_id:
        try:
            sim_uuid = UUID(str(req.simulation_id))
        except (ValueError, TypeError, AttributeError):
            sim_uuid = None

    sim_row = None
    if sim_uuid:
        sim_sql = text(
            """
            SELECT id, surge_height_m, flood_area_km2, rainfall_mm_72h, model_used, confidence
            FROM surge_simulations
            WHERE id = :sim_id;
            """
        )
        sim_res = await db.execute(sim_sql, {"sim_id": sim_uuid})
        sim_row = sim_res.fetchone()
    elif storm_uuid:
        sim_sql = text(
            """
            SELECT id, surge_height_m, flood_area_km2, rainfall_mm_72h, model_used, confidence
            FROM surge_simulations
            WHERE storm_id = :storm_id
            ORDER BY computed_at DESC
            LIMIT 1;
            """
        )
        sim_res = await db.execute(sim_sql, {"storm_id": storm_uuid})
        sim_row = sim_res.fetchone()

    if not sim_row:
        sim_sql = text(
            """
            SELECT id, surge_height_m, flood_area_km2, rainfall_mm_72h, model_used, confidence
            FROM surge_simulations
            ORDER BY computed_at DESC
            LIMIT 1;
            """
        )
        sim_res = await db.execute(sim_sql)
        sim_row = sim_res.fetchone()
    if sim_row:
        surge_data: dict[str, Any] = {
            "simulation_id": str(sim_row.id),
            "surge_height_m": sim_row.surge_height_m,
            "flood_area_km2": sim_row.flood_area_km2,
            "rainfall_mm_72h": sim_row.rainfall_mm_72h,
            "model_used": sim_row.model_used,
            "confidence": sim_row.confidence,
        }
        sim_id_for_exposure = sim_row.id
    else:
        surge_data = {
            "surge_height_m": 3.2,
            "flood_area_km2": 65.0,
            "rainfall_mm_72h": 320.0,
            "model_used": "Holland_SLOSH_Parametric",
            "confidence": 0.88,
        }
        sim_id_for_exposure = None

    # 3. Fetch Exposed Infrastructure
    if sim_id_for_exposure:
        exp_sql = text(
            """
            SELECT 
                e.flood_depth_m,
                e.risk_level,
                e.is_accessible,
                e.recommended_action,
                i.name,
                i.type,
                i.district,
                i.elevation_m
            FROM exposure_results e
            JOIN infrastructure i ON e.infrastructure_id = i.id
            WHERE e.simulation_id = :sim_id
            ORDER BY e.flood_depth_m DESC;
            """
        )
        exp_res = await db.execute(exp_sql, {"sim_id": sim_id_for_exposure})
        exp_rows = exp_res.fetchall()
        exposed_infra = [
            {
                "name": r.name,
                "type": r.type,
                "district": r.district,
                "elevation_m": r.elevation_m,
                "flood_depth_m": r.flood_depth_m,
                "risk_level": r.risk_level,
                "is_accessible": r.is_accessible,
                "recommended_action": r.recommended_action,
            }
            for r in exp_rows
        ]
    else:
        infra_sql = text("SELECT name, type, district, elevation_m FROM infrastructure LIMIT 10;")
        infra_res = await db.execute(infra_sql)
        exposed_infra = [
            {
                "name": r.name,
                "type": r.type,
                "district": r.district,
                "elevation_m": r.elevation_m,
                "flood_depth_m": max(0.0, round(3.2 - (r.elevation_m or 2.0), 2)),
                "risk_level": "High" if (r.elevation_m or 2.0) < 2.0 else "Moderate",
            }
            for r in infra_res.fetchall()
        ]

    # 4. Fetch Live Marine Telemetry (Wave Height, Currents, Drag)
    target_lat = float(storm_row.predicted_landfall_lat or storm_row.current_lat or 19.805)
    target_lon = float(storm_row.predicted_landfall_lon or storm_row.current_lon or 85.830)
    try:
        marine_res = await fetch_live_marine_data(lat=target_lat, lon=target_lon)
        marine_data = marine_res.model_dump()
    except Exception as e:
        logger.warning("Marine telemetry fetch failed (%s); using defaults", e)
        marine_data = None

    # 5. Invoke Gemini AI Agent
    analysis = await gemini_agent.analyze(
        storm_data=storm_data,
        exposed_infra=exposed_infra,
        surge_data=surge_data,
        marine_data=marine_data,
    )

    return analysis
