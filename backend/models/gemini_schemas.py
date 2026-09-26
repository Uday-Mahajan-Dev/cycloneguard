from pydantic import BaseModel, ConfigDict


class CascadeRiskItem(BaseModel):
    component: str
    description: str
    severity: str
    mitigation: str


class GridShutdownItem(BaseModel):
    substation_name: str
    action: str
    execute_by_t_minus_hours: int
    rationale: str


class EvacuationPriority(BaseModel):
    zone: str
    population: int
    priority_rank: int
    recommended_route: str
    clear_until_hours: int


class CycloneGuardGeminiAnalysis(BaseModel):
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

    danger_level: str
    summary: str
    cascade_risks: list[CascadeRiskItem]
    grid_shutdown_schedule: list[GridShutdownItem]
    evacuation_priorities: list[EvacuationPriority]
    bulletin_en: str
    bulletin_local: str
    parametric_trigger_eligible: bool
