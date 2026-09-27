from uuid import UUID

from pydantic import BaseModel, ConfigDict


class InsuranceTriggerEvaluation(BaseModel):
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

    storm_id: UUID | str
    municipal_zone: str
    observed_wind_kmh: float
    observed_surge_m: float
    wind_threshold_kmh: float
    surge_threshold_m: float
    trigger_met: bool
    payout_amount_usd: float
    rationale: str
