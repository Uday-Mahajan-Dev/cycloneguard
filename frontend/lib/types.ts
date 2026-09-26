export interface StormTrackPoint {
  lat: number;
  lon: number;
  timestamp: string;
  wind_kmh: number;
  pressure_hpa: number;
  stage?: string;
  wave_height_m?: number;
}

export interface StormResponse {
  id: string;
  name: string;
  basin: string;
  category: string | null;
  status: string;
  current_lat: number;
  current_lon: number;
  max_wind_kmh: number | null;
  central_pressure_hpa: number | null;
  predicted_landfall_lat: number | null;
  predicted_landfall_lon: number | null;
  predicted_landfall_time: string | null;
  track_geojson: {
    type: string;
    features: Array<{
      type: string;
      geometry: { type: string; coordinates: number[] };
      properties: Record<string, any>;
    }>;
  } | null;
  source: string;
  fetched_at: string;
  created_at: string;
  hours_to_landfall?: number | null;
}

export interface SurgeSimulationResponse {
  id: string;
  storm_id: string;
  surge_height_m: number;
  flood_area_km2: number;
  flood_polygon_geojson: {
    type: string;
    features: Array<{
      type: string;
      id?: string;
      geometry: any;
      properties: {
        flood_depth_m: number;
        elevation_m: number;
        extrude_height: number;
        surge_height_m?: number;
        hazard_level?: string;
        inundation_area_km2?: number;
      };
    }>;
  };
  dem_source: string;
  model_used: string;
  confidence: number;
  computed_at: string;
}

export interface InfrastructureResponse {
  id: string;
  osm_id: number | null;
  name: string;
  type: "power_substation" | "hospital" | "shelter" | "bridge" | "pumping_station" | string;
  subtype: string | null;
  capacity: number | null;
  district: string | null;
  state: string | null;
  elevation_m: number | null;
  geom_geojson: {
    type: string;
    coordinates: [number, number];
  } | null;
}

export interface ExposureResultResponse {
  infrastructure_id: string;
  name: string;
  type: string;
  flood_depth_m: number;
  risk_level: "Critical" | "High" | "Moderate" | "Low" | string;
  is_accessible: boolean;
  recommended_action: string;
  lat: number;
  lon: number;
}

export interface CascadeRiskItem {
  component: string;
  description: string;
  severity: "Critical" | "High" | "Moderate" | "Low" | string;
  mitigation: string;
}

export interface GridShutdownItem {
  substation_name: string;
  action: string;
  execute_by_t_minus_hours: number;
  rationale: string;
}

export interface EvacuationPriority {
  zone: string;
  population: number;
  priority_rank: number;
  recommended_route: string;
  clear_until_hours: number;
}

export interface CycloneGuardGeminiAnalysis {
  danger_level: "RED_ALERT_EXTREME" | "ORANGE_ALERT_SEVERE" | "YELLOW_ALERT_MODERATE" | string;
  summary: string;
  cascade_risks: CascadeRiskItem[];
  grid_shutdown_schedule: GridShutdownItem[];
  evacuation_priorities: EvacuationPriority[];
  bulletin_en: string;
  bulletin_local: string;
  parametric_trigger_eligible: boolean;
}

export interface InsuranceTriggerEvaluation {
  storm_id: string;
  municipal_zone: string;
  observed_wind_kmh: number;
  observed_surge_m: number;
  wind_threshold_kmh: number;
  surge_threshold_m: number;
  trigger_met: boolean;
  payout_amount_usd: number;
  rationale: string;
}

export interface AlertResponse {
  id: string;
  storm_id: string | null;
  alert_type: string;
  severity: string;
  message_en: string;
  message_local: string | null;
  target_audience: string;
  dispatch_channel: string;
  dispatch_status: string;
  created_at: string;
}

export type UserRole =
  | "admin"
  | "collector"
  | "responder"
  | "underwriter"
  | "authority"
  | "analyst";

export interface UserProfile {
  email: string;
  role: UserRole;
  name: string;
  title: string;
  badge: string;
  district?: string;
}

export interface MarineDataResponse {
  lat: number;
  lon: number;
  wave_height_m: number;
  wave_period_s: number;
  wave_direction_deg: number;
  ocean_current_velocity_kmh: number;
  ocean_current_direction_deg: number;
  wave_drag_coefficient: number;
  pressure_drop_rate_hpa_hr: number;
  timestamp: string;
  source: string;
  hourly_forecast?: Array<{
    time: string;
    wave_height_m: number | null;
    wave_period_s: number | null;
    ocean_current_velocity_kmh: number | null;
  }>;
}

