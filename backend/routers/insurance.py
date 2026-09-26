import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.connection import get_db
from backend.db.models import Storm, SurgeSimulation
from backend.models.insurance import InsuranceTriggerEvaluation

router = APIRouter(prefix="/insurance", tags=["Parametric Insurance"])
logger = logging.getLogger("cycloneguard.insurance_router")

# Parametric Contract Policy Parameters for Puri Municipal Corporation
WIND_THRESHOLD_KMH = 120.0
SURGE_THRESHOLD_M = 1.2
PARAMETRIC_PAYOUT_AMOUNT_USD = 250_000.00


@router.post(
    "/evaluate/{storm_id}",
    response_model=InsuranceTriggerEvaluation,
    summary="Evaluate parametric disaster insurance payout eligibility for Puri Municipal Corporation",
)
async def evaluate_parametric_insurance(
    storm_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> InsuranceTriggerEvaluation:
    """
    Evaluates instant parametric insurance liquidity trigger conditions for Puri Municipal Corporation.
    Policy triggers automatically without manual loss adjustment when:
    1. Sustained Wind Speed >= 120 km/h (Category 1+ threshold)
    2. Storm Surge Height >= 1.2 meters
    """
    # 1. Fetch Storm
    storm_stmt = select(Storm).where(Storm.id == storm_id)
    storm_res = await db.execute(storm_stmt)
    storm = storm_res.scalar_one_or_none()

    if not storm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Storm with ID {storm_id} not found",
        )

    # 2. Fetch latest Surge Simulation for this storm
    surge_stmt = (
        select(SurgeSimulation)
        .where(SurgeSimulation.storm_id == storm_id)
        .order_by(SurgeSimulation.computed_at.desc())
        .limit(1)
    )
    surge_res = await db.execute(surge_stmt)
    sim = surge_res.scalar_one_or_none()

    observed_wind = float(storm.max_wind_kmh or 0.0)
    observed_surge = float(sim.surge_height_m if sim else 0.0)

    wind_met = observed_wind >= WIND_THRESHOLD_KMH
    surge_met = observed_surge >= SURGE_THRESHOLD_M
    trigger_met = wind_met and surge_met

    if trigger_met:
        payout = PARAMETRIC_PAYOUT_AMOUNT_USD
        rationale = (
            f"Parametric trigger MET: Observed wind ({observed_wind:.1f} km/h >= {WIND_THRESHOLD_KMH:.1f} km/h) "
            f"and hydrodynamic storm surge ({observed_surge:.2f}m >= {SURGE_THRESHOLD_M:.2f}m) breach policy contract "
            f"index thresholds. Pre-authorized liquidity release of ${payout:,.2f} USD to Puri Municipal Disaster Fund activated."
        )
    elif wind_met and not surge_met:
        payout = 0.0
        rationale = (
            f"Parametric trigger UNMET: Wind speed ({observed_wind:.1f} km/h) exceeded threshold ({WIND_THRESHOLD_KMH:.1f} km/h), "
            f"but storm surge ({observed_surge:.2f}m) remained below contract minimum ({SURGE_THRESHOLD_M:.2f}m)."
        )
    elif surge_met and not wind_met:
        payout = 0.0
        rationale = (
            f"Parametric trigger UNMET: Storm surge ({observed_surge:.2f}m) exceeded threshold ({SURGE_THRESHOLD_M:.2f}m), "
            f"but wind speed ({observed_wind:.1f} km/h) remained below contract minimum ({WIND_THRESHOLD_KMH:.1f} km/h)."
        )
    else:
        payout = 0.0
        rationale = (
            f"Parametric trigger UNMET: Neither wind ({observed_wind:.1f} km/h vs {WIND_THRESHOLD_KMH:.1f} km/h) "
            f"nor surge ({observed_surge:.2f}m vs {SURGE_THRESHOLD_M:.2f}m) reached contract trigger thresholds."
        )

    return InsuranceTriggerEvaluation(
        storm_id=storm_id,
        municipal_zone="Puri Municipal Corporation Coastal Zone",
        observed_wind_kmh=observed_wind,
        observed_surge_m=observed_surge,
        wind_threshold_kmh=WIND_THRESHOLD_KMH,
        surge_threshold_m=SURGE_THRESHOLD_M,
        trigger_met=trigger_met,
        payout_amount_usd=payout,
        rationale=rationale,
    )
