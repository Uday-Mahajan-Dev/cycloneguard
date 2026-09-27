"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  CycloneGuardGeminiAnalysis,
  ExposureResultResponse,
  InfrastructureResponse,
  InsuranceTriggerEvaluation,
  MarineDataResponse,
  StormResponse,
  SurgeSimulationResponse,
} from "@/lib/types";
import TopHUDBar from "@/components/dashboard/TopHUDBar";
import LeftTelemetryPanel from "@/components/dashboard/LeftTelemetryPanel";
import RightIntelligencePanel from "@/components/dashboard/RightIntelligencePanel";
import GridMonitorPanel from "@/components/dashboard/GridMonitorPanel";
import LiveTerminalFeed from "@/components/dashboard/LiveTerminalFeed";
import AlertModal from "@/components/ui/AlertModal";
import type { MapContainerRef } from "@/components/map/MapContainer";
import { useRealtimeTelemetry } from "@/hooks/useRealtimeTelemetry";
import {
  Radio,
  Waves,
  Gauge,
  Compass,
  TrendingDown,
  X,
  Sparkles,
  RefreshCw,
  Anchor,
} from "lucide-react";
import {
  buildStormTrackGeoJSON,
  FANI_WAYPOINTS,
  StormWaypointData,
  DEFAULT_PURI_FLOOD_GEOJSON,
  DEFAULT_INFRASTRUCTURE_ASSETS,
  DEFAULT_EXPOSED_ASSETS,
} from "@/lib/stormGeometry";

// Dynamic import with SSR disabled for MapLibre WebGL canvas
const MapContainer = dynamic(
  () => import("@/components/map/MapContainer"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-400 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span>INITIALIZING 3D WEBGL ENGINE &amp; TERRARIUM DEM...</span>
        </div>
      </div>
    ),
  }
);

// Initial Guaranteed Storm Object
const INITIAL_STORM: StormResponse = {
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

const INITIAL_SIMULATION: SurgeSimulationResponse = {
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

const INITIAL_ANALYSIS: CycloneGuardGeminiAnalysis = {
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

const LIVE_MARINE_ANALYSIS: CycloneGuardGeminiAnalysis = {
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

import { useStormStore } from "@/lib/stores/useStormStore";

export default function DashboardPage() {
  const { user } = useAuth();
  const mapRef = useRef<MapContainerRef | null>(null);

  const {
    isMarineMode,
    engineMode,
    showMarineHUD,
    activeStorm,
    activeSimulation,
    infrastructure,
    exposedAssets,
    analysis,
    insurance,
    selectedAsset,
    is3dTerrain,
    isSimulating,
    toggleMarineMode,
    setEngineMode,
    setShowMarineHUD,
    setActiveStorm,
    setActiveSimulation,
    setInfrastructure,
    setExposedAssets,
    setAnalysis,
    setInsurance,
    setSelectedAsset,
    setIs3dTerrain,
    runSurgeSimulation,
    resetToDemoScenario,
    switchToLiveMarineMode,
  } = useStormStore();

  const [loadingMode, setLoadingMode] = useState(false);
  const [loadingSimulation, setLoadingSimulation] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);

  // Real-time 10s auto-polling telemetry stream
  const realtimeTelemetry = useRealtimeTelemetry(19.805, 85.83);

  // Initialize Mode A: Cyclone Fani / SYS-91B
  useEffect(() => {
    loadFaniGroundTruth();
  }, []);

  const loadFaniGroundTruth = async () => {
    setLoadingMode(true);
    try {
      // 1. Load Storm Trajectory
      const rawStorm = await api.loadFaniCaseStudy();
      const faniGeoJSON = buildStormTrackGeoJSON(FANI_WAYPOINTS);
      const stormData: StormResponse = {
        ...rawStorm,
        name: "Active Severe System SYS-91B",
        current_lat: 19.805,
        current_lon: 85.83,
        predicted_landfall_lat: 19.805,
        predicted_landfall_lon: 85.83,
        max_wind_kmh: 186.0,
        central_pressure_hpa: 937.0,
        predicted_landfall_time: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
        track_geojson: faniGeoJSON as any,
      };
      setActiveStorm(stormData);

      // 2. Load Infrastructure
      await api.loadPuriGroundTruth();
      const infraList = await api.listInfrastructure({ district: "Puri" });
      if (infraList && infraList.length > 0) {
        setInfrastructure(infraList);
      }

      // 3. Compute Surge Simulation
      const simData = await api.simulateSurge({
        storm_id: stormData.id,
        lat: 19.805,
        lon: 85.83,
        max_wind_kmh: 185.0,
        central_pressure_hpa: 937.0,
      });
      if (simData) {
        setActiveSimulation(simData);
      }

      // 4. Query Exposed Assets
      const exposed = await api.getExposedInfrastructure(simData.id);
      if (exposed && exposed.length > 0) {
        setExposedAssets(exposed);
      }

      // 5. Evaluate Gemini 2.5 Flash
      const aiRes = await api.analyzeStormWithGemini({
        storm_id: stormData.id,
        simulation_id: simData.id,
      });
      if (aiRes) setAnalysis(aiRes);

      // 6. Evaluate Insurance
      const insRes = await api.evaluateInsurance(stormData.id);
      if (insRes) setInsurance(insRes);

      setEngineMode("fani");

      // Auto-focus on active threat zone: [85.830, 19.805], zoom 9.2, pitch 50, bearing -20
      if (mapRef.current) {
        mapRef.current.flyToLocation(19.805, 85.83, 9.2, 50, -20);
      }
    } catch (err: any) {
      console.warn("Using guaranteed offline simulation datasets:", err);
      resetToDemoScenario();
      if (mapRef.current) {
        mapRef.current.flyToLocation(19.805, 85.83, 9.2, 50, -20);
      }
    } finally {
      setLoadingMode(false);
    }
  };

  const loadLiveFeed = async () => {
    setLoadingMode(true);
    switchToLiveMarineMode();

    try {
      await api.loadPuriGroundTruth();
      const infraList = await api.listInfrastructure({ district: "Puri" });
      if (infraList && infraList.length > 0) setInfrastructure(infraList);

      if (mapRef.current) {
        mapRef.current.flyToLocation(19.805, 85.83, 9.0, 48, -20);
      }
    } catch (err: any) {
      console.warn("Live marine feed notice:", err);
    } finally {
      setLoadingMode(false);
    }
  };

  const handleToggleEngineMode = (mode: "fani" | "live") => {
    if (mode === "fani") {
      resetToDemoScenario();
      loadFaniGroundTruth();
    } else {
      loadLiveFeed();
    }
  };

  const handleToggleMarineHUD = () => {
    if (!isMarineMode) {
      loadLiveFeed();
    } else {
      resetToDemoScenario();
      loadFaniGroundTruth();
    }
  };

  const handleRunSimulation = async (params?: {
    maxWind?: number;
    centralPressure?: number;
  }) => {
    setLoadingSimulation(true);
    try {
      await runSurgeSimulation(params);

      if (activeStorm) {
        api
          .simulateSurge({
            storm_id: activeStorm.id,
            lat: activeStorm.predicted_landfall_lat || activeStorm.current_lat || 19.805,
            lon: activeStorm.predicted_landfall_lon || activeStorm.current_lon || 85.83,
            max_wind_kmh: params?.maxWind || activeStorm.max_wind_kmh || 186.0,
            central_pressure_hpa:
              params?.centralPressure || activeStorm.central_pressure_hpa || 937.0,
          })
          .catch((e) => console.warn("Background API simulation sync notice:", e));
      }
    } catch (err) {
      console.warn("Simulation run using fallback calculation:", err);
    } finally {
      setLoadingSimulation(false);
    }
  };

  const handleTriggerGeminiAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const aiRes = await api.analyzeStormWithGemini({
        storm_id: activeStorm?.id || "storm-sys-91b",
        simulation_id: activeSimulation?.id || "sim-puri-35m",
      });
      if (aiRes) setAnalysis(aiRes);
    } catch (err) {
      console.warn("Gemini re-analysis notice:", err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-full lg:w-screen overflow-x-hidden flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-none">
      {/* Top HUD Bar */}
      <TopHUDBar
        engineMode={engineMode}
        onToggleEngineMode={handleToggleEngineMode}
        loadingMode={loadingMode}
        onToggleMarineHUD={handleToggleMarineHUD}
        isMarineHUDOpen={isMarineMode}
        onOpenAlertModal={() => setIsAlertModalOpen(true)}
        onTriggerGeminiAnalysis={handleTriggerGeminiAnalysis}
        loadingAnalysis={loadingAnalysis}
      />

      {/* Main Viewport Container (Mobile Stack + Desktop Full-bleed Command Center) */}
      <div className="flex-1 w-full lg:h-[calc(100vh-3.5rem)] flex flex-col lg:block relative p-2 sm:p-3 lg:p-0 gap-3.5 sm:gap-4 overflow-y-auto lg:overflow-hidden overflow-x-hidden">
        {/* Full-Screen Map Container */}
        <div className="w-full h-[380px] sm:h-[450px] lg:h-full lg:w-full lg:absolute lg:inset-0 lg:z-0 rounded-xl lg:rounded-none overflow-hidden relative shrink-0 shadow-md border border-slate-200 dark:border-slate-800 order-2 lg:order-none">
          <MapContainer
            ref={mapRef}
            storm={isMarineMode ? null : activeStorm}
            simulation={isMarineMode ? null : activeSimulation}
            infrastructure={infrastructure}
            exposedAssets={isMarineMode ? [] : exposedAssets}
            selectedAsset={selectedAsset}
            onSelectAsset={setSelectedAsset}
            is3dTerrain={is3dTerrain}
            onToggle3dTerrain={() => setIs3dTerrain(!is3dTerrain)}
            isMarineMode={isMarineMode}
          />
        </div>

        {/* Floating LIVE MARINE TELEMETRY HUD POPOVER */}
        {showMarineHUD && (
          <div className="w-full max-w-[95vw] sm:max-w-lg lg:absolute lg:top-3 lg:left-1/2 lg:-translate-x-1/2 z-30 pointer-events-auto order-1 lg:order-none mx-auto">
            <div className="bg-slate-950/92 backdrop-blur-xl border border-cyan-500/50 rounded-2xl p-3.5 shadow-2xl text-slate-100 font-mono text-xs space-y-2.5 animate-in fade-in slide-in-from-top-3 duration-250">
              {/* Header with animated live status */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center justify-center">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <div>
                    <div className="font-black tracking-tight text-white flex items-center gap-1.5 uppercase text-xs">
                      <span>Live Marine Ocean Telemetry</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[9px] font-bold">
                        {realtimeTelemetry.statusText}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      Bay of Bengal Marine Sector (19.805°N, 85.830°E) • Updated {realtimeTelemetry.lastUpdated}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowMarineHUD(false)}
                  type="button"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Close Marine Telemetry HUD"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 4 Core Ocean Physics Telemetry Gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-cyan-400 font-bold flex items-center justify-center gap-1">
                    <Waves className="w-3 h-3" />
                    <span>WAVE HEIGHT</span>
                  </div>
                  <div className="text-xl font-black text-white mt-0.5">
                    {realtimeTelemetry.waveHeightM.toFixed(2)}
                    <span className="text-[10px] text-slate-400 ml-0.5">m</span>
                  </div>
                  <div className="text-[9px] text-slate-400">Sig. Swell Crest</div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-amber-400 font-bold flex items-center justify-center gap-1">
                    <Gauge className="w-3 h-3" />
                    <span>SWELL PERIOD</span>
                  </div>
                  <div className="text-xl font-black text-white mt-0.5">
                    {realtimeTelemetry.wavePeriodS.toFixed(1)}
                    <span className="text-[10px] text-slate-400 ml-0.5">s</span>
                  </div>
                  <div className="text-[9px] text-slate-400">Peak Energy T_p</div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-blue-400 font-bold flex items-center justify-center gap-1">
                    <Compass className="w-3 h-3" />
                    <span>CURRENTS</span>
                  </div>
                  <div className="text-xl font-black text-white mt-0.5">
                    {realtimeTelemetry.oceanCurrentVelocityKmh.toFixed(1)}
                    <span className="text-[10px] text-slate-400 ml-0.5">km/h</span>
                  </div>
                  <div className="text-[9px] text-slate-400">
                    Dir: {realtimeTelemetry.oceanCurrentDirectionDeg.toFixed(0)}°
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-red-400 font-bold flex items-center justify-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    <span>PRESSURE DROP</span>
                  </div>
                  <div className="text-xl font-black text-red-400 mt-0.5">
                    -{realtimeTelemetry.pressureDropRate.toFixed(2)}
                  </div>
                  <div className="text-[9px] text-slate-400">hPa / hour</div>
                </div>
              </div>

              {/* Physical Coefficients & Real-time Status */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span>
                    Wave Drag (Cd):{" "}
                    <strong className="text-cyan-300 font-mono">
                      {realtimeTelemetry.marineData.wave_drag_coefficient}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Heading:{" "}
                    <strong className="text-white font-mono">
                      {realtimeTelemetry.marineData.wave_direction_deg.toFixed(0)}°
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Anchor className="w-3 h-3" />
                  <span>Real-Time Buoy Ingestion</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Left Telemetry & Grid Monitor Panel */}
        <div className="w-full lg:w-[350px] lg:absolute lg:top-3 lg:left-4 lg:max-h-[calc(100vh-4.75rem)] lg:overflow-y-auto pointer-events-auto z-10 space-y-3 lg:pr-1 scrollbar-thin order-3 lg:order-none">
          <LeftTelemetryPanel
            storm={
              isMarineMode
                ? null
                : {
                    ...(activeStorm || INITIAL_STORM),
                    max_wind_kmh: activeStorm?.max_wind_kmh || 186.0,
                    central_pressure_hpa: activeStorm?.central_pressure_hpa || 937.0,
                  }
            }
            simulation={isMarineMode ? null : activeSimulation}
            onRunSimulation={handleRunSimulation}
            loadingSimulation={isSimulating || loadingSimulation}
            is3dTerrain={is3dTerrain}
            onToggle3dTerrain={() => setIs3dTerrain(!is3dTerrain)}
            user={user}
            isMarineMode={isMarineMode}
            realtimeTelemetry={realtimeTelemetry}
          />

          {/* Real-time Infrastructure Grid Monitoring Panel */}
          <GridMonitorPanel
            infrastructure={infrastructure}
            exposedAssets={exposedAssets}
            isMarineMode={isMarineMode}
            onSelectAsset={(asset) => {
              setSelectedAsset(asset);
              if (asset.geom_geojson?.coordinates && mapRef.current) {
                mapRef.current.flyToLocation(
                  asset.geom_geojson.coordinates[1],
                  asset.geom_geojson.coordinates[0],
                  14.5,
                  60,
                  -25
                );
              }
            }}
          />
        </div>

        {/* Floating Right Intelligence Panel */}
        <div className="w-full lg:w-[350px] lg:absolute lg:top-3 lg:right-4 lg:max-h-[calc(100vh-4.75rem)] lg:overflow-y-auto pointer-events-auto z-10 space-y-3 lg:pr-1 scrollbar-thin order-4 lg:order-none">
          <RightIntelligencePanel
            analysis={analysis}
            insurance={insurance}
            exposedAssets={exposedAssets}
            onOpenAlertModal={() => setIsAlertModalOpen(true)}
            loadingAnalysis={loadingAnalysis}
            user={user}
            isMarineMode={isMarineMode}
            realtimeTelemetry={realtimeTelemetry}
          />
        </div>

        {/* Streaming Live Dispatch Terminal (Bottom-Right over Map on Desktop) */}
        <div className="absolute bottom-3 right-4 z-20 pointer-events-auto hidden lg:block w-96 max-w-sm">
          <LiveTerminalFeed />
        </div>
      </div>

      {/* Emergency Broadcast Dispatch Modal */}
      <AlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        stormId={activeStorm?.id}
        defaultMessageEn={
          analysis?.bulletin_en ||
          "URGENT CYCLONE WARNING: SYS-91B is advancing with sustained winds of 185 km/h. Mandatory evacuation of coastal lowlands within 2.5 km is required immediately."
        }
        defaultMessageLocal={analysis?.bulletin_local}
      />
    </div>
  );
}
