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
    storm_id: UUID
    simulation_id: UUID | None = None


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
    storm_res = await db.execute(storm_sql, {"storm_id": req.storm_id})
    storm_row = storm_res.fetchone()

    if not storm_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Storm with ID {req.storm_id} not found",
        )

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

    # 2. Fetch Surge Simulation
    if req.simulation_id:
        sim_sql = text(
            """
            SELECT id, surge_height_m, flood_area_km2, rainfall_mm_72h, model_used, confidence
            FROM surge_simulations
            WHERE id = :sim_id;
            """
        )
        sim_res = await db.execute(sim_sql, {"sim_id": req.simulation_id})
    else:
        sim_sql = text(
            """
            SELECT id, surge_height_m, flood_area_km2, rainfall_mm_72h, model_used, confidence
            FROM surge_simulations
            WHERE storm_id = :storm_id
            ORDER BY computed_at DESC
            LIMIT 1;
            """
        )
        sim_res = await db.execute(sim_sql, {"storm_id": req.storm_id})

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
