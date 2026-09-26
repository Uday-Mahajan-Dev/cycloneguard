import axios from "axios";
import {
  AlertResponse,
  CycloneGuardGeminiAnalysis,
  ExposureResultResponse,
  InfrastructureResponse,
  InsuranceTriggerEvaluation,
  MarineDataResponse,
  StormResponse,
  SurgeSimulationResponse,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export const api = {
  // Health
  checkHealth: async () => {
    const res = await apiClient.get("/health");
    return res.data;
  },

  // Storms (Dual Engine)
  getActiveStorms: async (): Promise<StormResponse[]> => {
    const res = await apiClient.get<StormResponse[]>("/storms/active");
    return res.data;
  },

  getStormById: async (stormId: string): Promise<StormResponse> => {
    const res = await apiClient.get<StormResponse>(`/storms/${stormId}`);
    return res.data;
  },

  loadFaniCaseStudy: async (): Promise<StormResponse> => {
    const res = await apiClient.post<StormResponse>("/storms/load-case-study/fani-2019");
    return res.data;
  },

  fetchLiveStorm: async (): Promise<StormResponse> => {
    const res = await apiClient.post<StormResponse>("/storms/fetch-live");
    return res.data;
  },

  getLiveMarineData: async (lat = 19.805, lon = 85.830): Promise<MarineDataResponse> => {
    const res = await apiClient.get<MarineDataResponse>("/storms/live-marine", {
      params: { lat, lon },
    });
    return res.data;
  },

  // Surge Simulation
  simulateSurge: async (params: {
    storm_id: string;
    lat: number;
    lon: number;
    max_wind_kmh: number;
    central_pressure_hpa: number;
  }): Promise<SurgeSimulationResponse> => {
    const res = await apiClient.post<SurgeSimulationResponse>("/surge/simulate", params);
    return res.data;
  },

  // Infrastructure
  listInfrastructure: async (params?: {
    type?: string;
    district?: string;
  }): Promise<InfrastructureResponse[]> => {
    const res = await apiClient.get<InfrastructureResponse[]>("/infrastructure", {
      params,
    });
    return res.data;
  },

  loadPuriGroundTruth: async (): Promise<{ status: string; assets_inserted: number }> => {
    const res = await apiClient.post("/infrastructure/load-puri-ground-truth");
    return res.data;
  },

  fetchLiveOSMInfrastructure: async (districtName = "Puri"): Promise<any> => {
    const res = await apiClient.post(`/infrastructure/fetch-live-osm/${districtName}`);
    return res.data;
  },

  getExposedInfrastructure: async (
    simulationId: string
  ): Promise<ExposureResultResponse[]> => {
    const res = await apiClient.get<ExposureResultResponse[]>(
      `/infrastructure/exposed/${simulationId}`
    );
    return res.data;
  },

  // Gemini AI Analysis
  analyzeStormWithGemini: async (params: {
    storm_id: string;
    simulation_id?: string;
  }): Promise<CycloneGuardGeminiAnalysis> => {
    const res = await apiClient.post<CycloneGuardGeminiAnalysis>("/gemini/analyze", params);
    return res.data;
  },

  // Parametric Insurance
  evaluateInsurance: async (stormId: string): Promise<InsuranceTriggerEvaluation> => {
    const res = await apiClient.post<InsuranceTriggerEvaluation>(
      `/insurance/evaluate/${stormId}`
    );
    return res.data;
  },

  // Alerts
  dispatchAlert: async (payload: {
    storm_id?: string;
    alert_type: string;
    severity: string;
    message_en: string;
    message_local?: string;
    target_audience: string;
    dispatch_channel: string;
  }): Promise<{ alert: AlertResponse; delivery: any }> => {
    const res = await apiClient.post("/alerts/dispatch", payload);
    return res.data;
  },

  listAlerts: async (): Promise<AlertResponse[]> => {
    const res = await apiClient.get<AlertResponse[]>("/alerts");
    return res.data;
  },
};
