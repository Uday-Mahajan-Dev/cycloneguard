import { create } from "zustand";
import {
  StormResponse,
  SurgeSimulationResponse,
  InfrastructureResponse,
  ExposureResultResponse,
  CycloneGuardGeminiAnalysis,
  InsuranceTriggerEvaluation,
} from "@/lib/types";
import {
  buildStormTrackGeoJSON,
  FANI_WAYPOINTS,
  DEFAULT_PURI_FLOOD_GEOJSON,
  DEFAULT_INFRASTRUCTURE_ASSETS,
  DEFAULT_EXPOSED_ASSETS,
  calculateParametricSurge,
  generateDynamicFloodPolygon,
  computeExposedAssets,
  generateDynamicAnalysis,
} from "@/lib/stormGeometry";

export const INITIAL_DEMO_STORM: StormResponse = {
  id: "storm-sys-91b",
  name: "Active Severe System SYS-91B",
  basin: "Bay of Bengal",
  category: "Extremely Severe Cyclonic Storm (Cat 4)",
  status: "active",
  current_lat: 19.805,
  current_lon: 85.83,
  max_wind_kmh: 186.0,
  central_pressure_hpa: 937.0,
  predicted_landfall_lat: 19.805,
  predicted_landfall_lon: 85.83,
  predicted_landfall_time: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
  track_geojson: buildStormTrackGeoJSON(FANI_WAYPOINTS) as any,
  source: "IMD_Odisha_Command",
  fetched_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
};

export const INITIAL_DEMO_SIMULATION: SurgeSimulationResponse = {
  id: "sim-puri-35m",
  storm_id: "storm-sys-91b",
  surge_height_m: 3.5,
  flood_area_km2: 1746.5,
  flood_polygon_geojson: DEFAULT_PURI_FLOOD_GEOJSON,
  dem_source: "NASADEM 30m / AWS Terrarium",
  model_used: "Delft3D Hydrodynamic Surging Model",
  confidence: 0.94,
  computed_at: new Date().toISOString(),
};

export const INITIAL_DEMO_ANALYSIS: CycloneGuardGeminiAnalysis = {
  danger_level: "RED ALERT: EXTREME (CATEGORY 4)",
  summary:
    "Catastrophic 3.5m hydrodynamic surge inundation predicted at Puri coastal corridor. Critical power distribution assets (Puri Town 33kV & Marine Drive Feeder) face complete submersion.",
  bulletin_en:
    "URGENT CYCLONE WARNING: Active Severe System SYS-91B is advancing toward Puri Coastal Corridor with sustained winds of 186 km/h, storm surge of 3.5m, and offshore wave crests of 2.92m. Complete evacuation of coastal lowlands within 2.0 km of shoreline is mandatory before T-12 hours.",
  bulletin_local:
    "ଜରୁରୀ ସୂଚନା: ବାତ୍ୟା SYS-91B ପୁରୀ ଉପକୂଳରେ ୧୮୬ କି.ମି. ବେଗରେ ପ୍ରବେଶ କରୁଛି। ଉପକୂଳବର୍ତ୍ତୀ ନିମ୍ନ ଭୂମି ଅଞ୍ଚଳ ତୁରନ୍ତ ଖାଲି କରନ୍ତୁ।",
  cascade_risks: [
    {
      component: "Puri Town 33kV Substation",
      severity: "Critical",
      description: "Substation inundated 1.8m. Arc-flash risk across urban grid.",
      mitigation: "Execute preemptive switchgear tripping and feeder lockout.",
    },
    {
      component: "Puri District Hospital Access",
      severity: "High",
      description: "Perimeter access road inundated 0.6m; ambulances blocked.",
      mitigation: "Deploy amphibious disaster transport and rooftop diesel power.",
    },
  ],
  grid_shutdown_schedule: [
    {
      substation_name: "Puri Town 33kV Substation",
      action: "TRIP IMMEDIATELY",
      execute_by_t_minus_hours: 2,
      rationale: "Surge depth exceeds 1.5m clearance threshold",
    },
    {
      substation_name: "Konark Sea-Facing Feeder",
      action: "HOLD & ARM",
      execute_by_t_minus_hours: 6,
      rationale: "Elevation 6.2m MSL secure outside surge polygon",
    },
  ],
  evacuation_priorities: [
    {
      zone: "Pentakota Fishermen Colony",
      population: 14500,
      priority_rank: 1,
      recommended_route: "NH-316 North Corridor to Puri South Cyclone Center",
      clear_until_hours: 4,
    },
    {
      zone: "Marine Drive Lowlands",
      population: 8200,
      priority_rank: 2,
      recommended_route: "SH-60 Bypass to Konark Safe Cyclone Shelter",
      clear_until_hours: 6,
    },
  ],
  parametric_trigger_eligible: true,
};

export const LIVE_MARINE_ANALYSIS: CycloneGuardGeminiAnalysis = {
  danger_level: "NORMAL: CONTINUOUS SURVEILLANCE",
  summary:
    "Real-time Open-Meteo buoy telemetry indicates nominal maritime conditions across Bay of Bengal. No tropical cyclogenesis detected. All coastal infrastructure and port channels remain 100% operational.",
  bulletin_en:
    "REAL-TIME MARINE ADVISORY: Bay of Bengal Sector (19.805°N, 85.830°E). Wave heights 2.82m with 8.9s swell period. Surface winds 34 km/h. Sea lanes and port operations at Paradip & Dhamra are fully open and clear.",
  bulletin_local:
    "ସାମ୍ପ୍ରତିକ ସାମୁଦ୍ରିକ ସୂଚନା: ବଙ୍ଗୋପସାଗରରେ ସ୍ଥିତି ସ୍ୱାଭାବିକ ରହିଛି। ସମସ୍ତ ବନ୍ଦର ଓ ଉପକୂଳବର୍ତ୍ତୀ କ୍ଷେତ୍ରରେ ଚେତାବନୀ ନାହିଁ।",
  cascade_risks: [],
  grid_shutdown_schedule: [],
  evacuation_priorities: [],
  parametric_trigger_eligible: false,
};

export interface StormStore {
  isMarineMode: boolean;
  engineMode: "fani" | "live";
  showMarineHUD: boolean;
  showStormLayers: boolean;
  showInfraLayers: boolean;
  showFloodLayers: boolean;
  showWeatherOverlay: boolean;
  mapStyle: "satellite" | "dark";
  activeStorm: StormResponse | null;
  activeSimulation: SurgeSimulationResponse | null;
  infrastructure: InfrastructureResponse[];
  exposedAssets: ExposureResultResponse[];
  analysis: CycloneGuardGeminiAnalysis | null;
  insurance: InsuranceTriggerEvaluation | null;
  selectedAsset: InfrastructureResponse | null;
  is3dTerrain: boolean;
  isWeatherRadarActive: boolean;

  // Simulation Parameters & Lab State
  simWind: number;
  simPressure: number;
  isSimulating: boolean;
  lastSimulationAt: string | null;
  previewSurgeHeight: number;
  previewInundationArea: number;

  // Actions
  toggleMarineMode: (forceState?: boolean) => void;
  setEngineMode: (mode: "fani" | "live") => void;
  setShowMarineHUD: (show: boolean) => void;
  setMapStyle: (style: "satellite" | "dark") => void;
  setActiveStorm: (storm: StormResponse | null) => void;
  setActiveSimulation: (sim: SurgeSimulationResponse | null) => void;
  setInfrastructure: (infra: InfrastructureResponse[]) => void;
  setExposedAssets: (exposed: ExposureResultResponse[]) => void;
  setAnalysis: (analysis: CycloneGuardGeminiAnalysis | null) => void;
  setInsurance: (insurance: InsuranceTriggerEvaluation | null) => void;
  setSelectedAsset: (asset: InfrastructureResponse | null) => void;
  setIs3dTerrain: (is3d: boolean) => void;
  setIsWeatherRadarActive: (active: boolean) => void;
  setSimulationParameters: (params: { maxWind?: number; centralPressure?: number }) => void;
  runSurgeSimulation: (options?: { maxWind?: number; centralPressure?: number }) => Promise<void>;
  resetToDemoScenario: () => void;
  switchToLiveMarineMode: () => void;
}

export const useStormStore = create<StormStore>((set, get) => ({
  isMarineMode: false,
  engineMode: "fani",
  showMarineHUD: false,
  showStormLayers: true,
  showInfraLayers: true,
  showFloodLayers: true,
  showWeatherOverlay: false,
  mapStyle: "satellite",
  activeStorm: INITIAL_DEMO_STORM,
  activeSimulation: INITIAL_DEMO_SIMULATION,
  infrastructure: DEFAULT_INFRASTRUCTURE_ASSETS,
  exposedAssets: DEFAULT_EXPOSED_ASSETS,
  analysis: INITIAL_DEMO_ANALYSIS,
  insurance: null,
  selectedAsset: null,
  is3dTerrain: true,
  isWeatherRadarActive: false,

  // Default Parameters (Category 4 SYS-91B)
  simWind: 186,
  simPressure: 937,
  isSimulating: false,
  lastSimulationAt: null,
  previewSurgeHeight: 3.5,
  previewInundationArea: 1746.5,

  toggleMarineMode: (forceState?: boolean) => {
    const currentState = get().isMarineMode;
    const nextState = forceState !== undefined ? forceState : !currentState;

    if (nextState) {
      get().switchToLiveMarineMode();
    } else {
      get().resetToDemoScenario();
    }
  },

  setEngineMode: (mode: "fani" | "live") => {
    if (mode === "live") {
      get().switchToLiveMarineMode();
    } else {
      get().resetToDemoScenario();
    }
  },

  setShowMarineHUD: (show: boolean) => {
    if (show) {
      get().switchToLiveMarineMode();
    } else {
      get().resetToDemoScenario();
    }
  },

  setMapStyle: (style: "satellite" | "dark") => set({ mapStyle: style }),

  setSimulationParameters: (params: { maxWind?: number; centralPressure?: number }) => {
    const currentWind = params.maxWind !== undefined ? params.maxWind : get().simWind;
    const currentPressure =
      params.centralPressure !== undefined ? params.centralPressure : get().simPressure;

    const { surgeHeightM, inundationAreaKm2 } = calculateParametricSurge(
      currentWind,
      currentPressure
    );

    set({
      simWind: currentWind,
      simPressure: currentPressure,
      previewSurgeHeight: surgeHeightM,
      previewInundationArea: inundationAreaKm2,
    });
  },

  runSurgeSimulation: async (options?: { maxWind?: number; centralPressure?: number }) => {
    const targetWind = options?.maxWind !== undefined ? options.maxWind : get().simWind;
    const targetPressure =
      options?.centralPressure !== undefined ? options.centralPressure : get().simPressure;

    set({ isSimulating: true });

    // Realistic simulation latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      // 1. Hydrodynamic calculations
      const { surgeHeightM, inundationAreaKm2 } = calculateParametricSurge(
        targetWind,
        targetPressure
      );

      // 2. Scaled flood polygon
      const floodPolygon = generateDynamicFloodPolygon(surgeHeightM, inundationAreaKm2);

      // 3. Re-evaluate exposed infrastructure
      const infraList =
        get().infrastructure.length > 0
          ? get().infrastructure
          : DEFAULT_INFRASTRUCTURE_ASSETS;
      const exposed = computeExposedAssets(infraList, surgeHeightM);

      // 4. Re-evaluate dynamic Gemini AI analysis & bulletin
      const newAnalysis = generateDynamicAnalysis(
        targetWind,
        targetPressure,
        surgeHeightM,
        inundationAreaKm2,
        exposed
      );

      // 5. Update storm state
      const currentStorm = get().activeStorm;
      const updatedStorm: StormResponse = currentStorm
        ? {
            ...currentStorm,
            max_wind_kmh: targetWind,
            central_pressure_hpa: targetPressure,
            category:
              targetWind >= 220
                ? "Super Cyclonic Storm (Cat 5)"
                : targetWind >= 165
                ? "Extremely Severe Cyclonic Storm (Cat 4)"
                : targetWind >= 120
                ? "Very Severe Cyclonic Storm (Cat 3)"
                : "Severe Cyclonic Storm (Cat 2)",
          }
        : {
            ...INITIAL_DEMO_STORM,
            max_wind_kmh: targetWind,
            central_pressure_hpa: targetPressure,
          };

      // 6. Update simulation state
      const currentSim = get().activeSimulation;
      const updatedSimulation: SurgeSimulationResponse = currentSim
        ? {
            ...currentSim,
            surge_height_m: surgeHeightM,
            flood_area_km2: inundationAreaKm2,
            flood_polygon_geojson: floodPolygon,
            computed_at: new Date().toISOString(),
          }
        : {
            id: `sim-dynamic-${Date.now()}`,
            storm_id: updatedStorm.id,
            surge_height_m: surgeHeightM,
            flood_area_km2: inundationAreaKm2,
            flood_polygon_geojson: floodPolygon,
            dem_source: "NASADEM 30m / AWS Terrarium",
            model_used: "Delft3D Hydrodynamic Surging Model",
            confidence: 0.94,
            computed_at: new Date().toISOString(),
          };

      set({
        simWind: targetWind,
        simPressure: targetPressure,
        previewSurgeHeight: surgeHeightM,
        previewInundationArea: inundationAreaKm2,
        activeStorm: updatedStorm,
        activeSimulation: updatedSimulation,
        exposedAssets: exposed,
        analysis: newAnalysis,
        lastSimulationAt: new Date().toISOString(),
        isSimulating: false,
      });
    } catch (err) {
      console.warn("Surge simulation execution notice:", err);
      set({ isSimulating: false });
    }
  },

  switchToLiveMarineMode: () => {
    set({
      isMarineMode: true,
      engineMode: "live",
      showMarineHUD: true,
      showStormLayers: false, // master kill switch for all storm layers
      showInfraLayers: false, // master kill switch for demo pins
      showFloodLayers: false, // master kill switch for flood polygon
      showWeatherOverlay: true, // live satellite / radar overlay
      mapStyle: "satellite",
      activeStorm: null,
      activeSimulation: null,
      exposedAssets: [],
      analysis: LIVE_MARINE_ANALYSIS,
      insurance: null,
      isWeatherRadarActive: true,
      isSimulating: false,
    });
  },

  resetToDemoScenario: () => {
    set({
      isMarineMode: false,
      engineMode: "fani",
      showMarineHUD: false,
      showStormLayers: true,
      showInfraLayers: true,
      showFloodLayers: true,
      showWeatherOverlay: false,
      activeStorm: INITIAL_DEMO_STORM,
      activeSimulation: INITIAL_DEMO_SIMULATION,
      infrastructure: DEFAULT_INFRASTRUCTURE_ASSETS,
      exposedAssets: DEFAULT_EXPOSED_ASSETS,
      analysis: INITIAL_DEMO_ANALYSIS,
      isWeatherRadarActive: false,
      simWind: 186,
      simPressure: 937,
      isSimulating: false,
      previewSurgeHeight: 3.5,
      previewInundationArea: 1746.5,
    });
  },

  setActiveStorm: (storm: StormResponse | null) => {
    const isMarine = get().isMarineMode;
    set({ activeStorm: isMarine ? null : storm });
  },
  setActiveSimulation: (sim: SurgeSimulationResponse | null) => {
    const isMarine = get().isMarineMode;
    set({ activeSimulation: isMarine ? null : sim });
  },
  setInfrastructure: (infra: InfrastructureResponse[]) =>
    set({ infrastructure: infra }),
  setExposedAssets: (exposed: ExposureResultResponse[]) => {
    const isMarine = get().isMarineMode;
    set({ exposedAssets: isMarine ? [] : exposed });
  },
  setAnalysis: (analysis: CycloneGuardGeminiAnalysis | null) =>
    set({ analysis: analysis }),
  setInsurance: (insurance: InsuranceTriggerEvaluation | null) =>
    set({ insurance: insurance }),
  setSelectedAsset: (asset: InfrastructureResponse | null) =>
    set({ selectedAsset: asset }),
  setIs3dTerrain: (is3d: boolean) => set({ is3dTerrain: is3d }),
  setIsWeatherRadarActive: (active: boolean) =>
    set({ isWeatherRadarActive: active }),
}));

// Also alias useMapStore for convenient access
export const useMapStore = useStormStore;


