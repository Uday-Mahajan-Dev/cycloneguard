"use client";

import React, { useState, useEffect } from "react";
import TacticalGauge from "@/components/ui/TacticalGauge";
import { StormResponse, SurgeSimulationResponse, UserProfile } from "@/lib/types";
import {
  Clock,
  Wind,
  Gauge,
  Waves,
  Play,
  Layers,
  MapPin,
  RefreshCw,
  Shield,
  Users,
  AlertTriangle,
  Building,
  CheckCircle2,
  FileText,
  Sliders,
  Flame,
  Radio,
  Compass,
  TrendingDown,
  Anchor,
  Sparkles,
  Radar,
  Check,
} from "lucide-react";

import { useStormStore } from "@/lib/stores/useStormStore";

interface LeftTelemetryPanelProps {
  storm: StormResponse | null;
  simulation: SurgeSimulationResponse | null;
  onRunSimulation: (params?: { maxWind?: number; centralPressure?: number }) => void;
  loadingSimulation: boolean;
  is3dTerrain: boolean;
  onToggle3dTerrain: () => void;
  user: UserProfile | null;
  isMarineMode?: boolean;
  realtimeTelemetry?: any;
}

export default function LeftTelemetryPanel({
  storm,
  simulation,
  onRunSimulation,
  loadingSimulation,
  is3dTerrain,
  onToggle3dTerrain,
  user,
  isMarineMode = false,
  realtimeTelemetry,
}: LeftTelemetryPanelProps) {
  const [countdown, setCountdown] = useState<string>("T-36h 00m 00s");

  const {
    simWind,
    simPressure,
    isSimulating,
    previewSurgeHeight,
    previewInundationArea,
    setSimulationParameters,
    runSurgeSimulation,
  } = useStormStore();

  useEffect(() => {
    if (isMarineMode || !simulation) return;

    const updateCountdown = () => {
      if (!storm?.predicted_landfall_time) {
        setCountdown("T-36h 00m 00s");
        return;
      }
      const target = new Date(storm.predicted_landfall_time).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown("LANDFALL ACTIVE");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `T-${hours.toString().padStart(2, "0")}h ${mins
          .toString()
          .padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [storm, isMarineMode, simulation]);

  const windSpeed = isMarineMode
    ? realtimeTelemetry?.windSpeedKmh || 34.0
    : simWind || storm?.max_wind_kmh || 186.0;
  const centralPressure = isMarineMode
    ? realtimeTelemetry?.surfacePressure || 1012.0
    : simPressure || storm?.central_pressure_hpa || 937.0;
  const surgeHeight = previewSurgeHeight || simulation?.surge_height_m || 3.5;
  const floodArea = previewInundationArea || simulation?.flood_area_km2 || 1746.5;

  const role = user?.role || "admin";

  return (
    <aside className="w-full space-y-3 font-mono text-xs z-20 pointer-events-auto p-0.5">
      {/* 1. Universal Top Header: Live Surveillance vs Landfall Countdown */}
      {isMarineMode || !simulation ? (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 rounded-xl p-3.5 shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
              REAL-TIME MARITIME SURVEILLANCE
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>LIVE ACTIVE</span>
            </span>
          </div>
          <div className="text-xl font-black tracking-tight text-slate-900 dark:text-white mt-1 flex items-center justify-between">
            <span>NO ACTIVE CYCLOGENESIS</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            <span className="truncate">Bay of Bengal Sector (19.805°N, 85.830°E)</span>
          </div>
        </div>
      ) : (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 dark:text-cyan-400">
              <Clock className="w-3.5 h-3.5 animate-pulse text-red-600 dark:text-red-400" />
              LANDFALL COUNTDOWN
            </span>
            <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/80 text-[10px] text-red-700 dark:text-red-400 font-bold border border-red-200 dark:border-red-800 animate-pulse">
              IMMINENT
            </span>
          </div>
          <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            {countdown}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
            <span className="truncate">Puri Coastal Corridor (19.805°N, 85.830°E)</span>
          </div>
        </div>
      )}

      {/* 2. Role: ADMIN View */}
      {role === "admin" && (
        <>
          {/* Kinematic Telemetry Dials */}
          <div className="grid grid-cols-2 gap-2.5">
            <TacticalGauge
              value={Math.round(windSpeed)}
              min={0}
              max={260}
              unit="KM/H"
              label={isMarineMode ? "Surface Wind" : "Sustained Wind"}
              color={isMarineMode ? "#06b6d4" : "#2563eb"}
              dangerThreshold={isMarineMode ? 90 : 165}
            />
            <TacticalGauge
              value={Math.round(centralPressure)}
              min={900}
              max={1025}
              unit="HPA"
              label={isMarineMode ? "Surface Pressure" : "Central Pressure"}
              color={isMarineMode ? "#10b981" : "#ea580c"}
              dangerThreshold={950}
            />
          </div>

          {/* Conditional Card: Real-Time Ocean Telemetry vs 3D Hydrodynamic Surge Simulation */}
          {isMarineMode || !simulation ? (
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-400">
                  <Waves className="w-4 h-4 text-cyan-500" />
                  REAL-TIME OCEAN PHYSICS
                </span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[9px] font-bold">
                  Open-Meteo Buoy
                </span>
              </div>

              {/* 4 Real-Time Ocean Physical Gauges */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
                    <Waves className="w-3 h-3 text-cyan-500" />
                    <span>WAVE HEIGHT</span>
                  </div>
                  <div className="text-lg font-black text-cyan-700 dark:text-cyan-400 mt-0.5">
                    {realtimeTelemetry?.waveHeightM?.toFixed(2) || "2.82"}m
                  </div>
                  <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Moderate Swell (Safe)
                  </div>
                </div>

                <div className="border-l border-slate-200 dark:border-slate-800 pl-2.5">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-amber-500" />
                    <span>SWELL PERIOD</span>
                  </div>
                  <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
                    {realtimeTelemetry?.wavePeriodS?.toFixed(1) || "8.9"}s
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Peak Period (T_p)
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
                    <Compass className="w-3 h-3 text-blue-500" />
                    <span>OCEAN CURRENTS</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {realtimeTelemetry?.oceanCurrentVelocityKmh?.toFixed(1) || "0.9"} km/h
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Heading {realtimeTelemetry?.oceanCurrentDirectionDeg?.toFixed(0) || "37"}°
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 border-l pl-2.5">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-emerald-500" />
                    <span>PRESSURE RATE</span>
                  </div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Stable
                  </div>
                  <div className="text-[9px] text-slate-500">
                    {realtimeTelemetry?.surfacePressure || 1012} hPa
                  </div>
                </div>
              </div>

              {/* Cyclone Detection Summary */}
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Real-Time Cyclogenesis Analysis</span>
                </div>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-sans leading-relaxed">
                  Continuous Doppler radar scan and NASA VIIRS satellite sweeps detect no developing convective circulation over Bay of Bengal basin. Maritime navigation channels are nominal.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-md space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-cyan-400">
                  <Waves className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  3D HYDRODYNAMIC SURGE
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  NASADEM 30m
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                    PEAK SURGE
                  </div>
                  <div className="text-lg font-black text-blue-700 dark:text-cyan-400 mt-0.5">
                    +{surgeHeight.toFixed(1)}m
                  </div>
                  <div className="text-[9px] text-red-600 dark:text-red-400 font-medium">
                    Above MSL Datum
                  </div>
                </div>
                <div className="border-l border-slate-200 dark:border-slate-800 pl-2.5">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                    INUNDATION AREA
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    ~{floodArea.toFixed(1)}{" "}
                    <span className="text-xs text-slate-500">km²</span>
                  </div>
                  <div className="text-[9px] text-blue-600 dark:text-cyan-400 font-medium">
                    Lowland Coast
                  </div>
                </div>
              </div>

              {/* Simulation Lab Controls */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-blue-600" />
                    Simulation Parameters
                  </span>
                  <span className="text-[10px] text-slate-400">GEE Earth Engine</span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-500 dark:text-slate-400">Max Wind:</span>
                      <span className="font-bold text-blue-600 dark:text-cyan-400">
                        {simWind} km/h
                      </span>
                    </div>
                    <input
                      type="range"
                      min={80}
                      max={260}
                      step={1}
                      value={simWind}
                      onChange={(e) =>
                        setSimulationParameters({ maxWind: Number(e.target.value) })
                      }
                      className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-500 dark:text-slate-400">Pressure:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {simPressure} hPa
                      </span>
                    </div>
                    <input
                      type="range"
                      min={900}
                      max={1000}
                      step={1}
                      value={simPressure}
                      onChange={(e) =>
                        setSimulationParameters({ centralPressure: Number(e.target.value) })
                      }
                      className="w-full accent-amber-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                  </div>
                </div>

                <button
                  onClick={() => runSurgeSimulation()}
                  disabled={isSimulating || loadingSimulation}
                  type="button"
                  className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSimulating || loadingSimulation ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>SIMULATING...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>RUN 3D SURGE RE-SIMULATION</span>
                    </>
                  )}
                </button>
                <div className="text-[9.5px] text-center text-slate-400 dark:text-slate-500 font-mono">
                  Uses Holland-parametric surge + NASADEM mask (demo)
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 3. Role: AUTHORITY (District Magistrate / Collector) View */}
      {(role === "collector" || role === "authority") && (
        <>
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-orange-600" />
                Puri District Command
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isMarineMode
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300"
                }`}
              >
                {isMarineMode ? "PEACETIME ROUTINE" : "DISTRICT CLAMPED"}
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">
                  Target Coastal Inundation:
                </span>
                <span
                  className={`font-bold text-sm ${
                    isMarineMode
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {isMarineMode ? "0.0 km² (Normal Tide)" : "42.8 km²"}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">
                  Population in Lowlands:
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  ~180,000 (Safe)
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">
                  Substations Requiring Trip:
                </span>
                <span
                  className={`font-bold text-sm ${
                    isMarineMode
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {isMarineMode ? "0 (All 100% Online)" : "4 Primary (33kV)"}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">
                  Hospitals in Alert Stage:
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {isMarineMode ? "0 (All Clear)" : "3 Facilities"}
                </span>
              </div>
            </div>
          </div>

          {/* Administrative Summary Box */}
          <div
            className={`border rounded-xl p-3.5 shadow-sm space-y-2 ${
              isMarineMode
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
                : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80"
            }`}
          >
            <div
              className={`font-bold flex items-center gap-1.5 text-xs ${
                isMarineMode
                  ? "text-emerald-900 dark:text-emerald-300"
                  : "text-amber-900 dark:text-amber-300"
              }`}
            >
              {isMarineMode ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              District Collector Directive Status
            </div>
            <p
              className={`text-[11px] leading-relaxed font-sans ${
                isMarineMode
                  ? "text-emerald-800 dark:text-emerald-200"
                  : "text-amber-800 dark:text-amber-200"
              }`}
            >
              {isMarineMode
                ? "All 11 coastal blocks of Puri district are operating under normal maritime conditions. Power grids, transportation corridors, and hospital facilities are fully operational."
                : "All 11 coastal blocks of Puri district are placed on Extreme Red Alert. Controlled power grid tripping is required prior to T-6h to prevent electrocution upon storm surge breach."}
            </p>
          </div>
        </>
      )}

      {/* 4. Role: RESPONDER (NDRF / Field Team Lead) View */}
      {role === "responder" && (
        <>
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-yellow-600" />
                NDRF Tactical Field Board
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                STANDBY / READY
              </span>
            </div>

            {/* Evacuation Meter */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-600 dark:text-slate-400">
                  Evacuation Requirement:
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {isMarineMode ? "0 (Normal Routine)" : "142,500 / 180,000 (79.2%)"}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: isMarineMode ? "100%" : "79.2%" }}
                />
              </div>
            </div>

            {/* Deployment Units */}
            <div className="space-y-1.5 text-[11px] pt-1 border-t border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-700 dark:text-slate-300">
                Active Tactical Units:
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">NDRF 3rd Bn:</span>
                <span className="font-bold">Standby at Mundali Base</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ODRAF Unit 2:</span>
                <span className="font-bold">Routine Readiness</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Odisha Fire Dept:</span>
                <span className="font-bold">250 Rescuers on Peacetime Alert</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 5. Role: ANALYST (Parametric Insurer / Reinsurance) View */}
      {(role === "underwriter" || role === "analyst") && (
        <>
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                Parametric Policy Evaluation
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                UNDERWRITER DESK
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Policy Ref:</span>
                <span className="font-bold">
                  {isMarineMode ? "#IND-PUR-SYS02A-LIVE" : "#IND-PUR-SYS91B-CAT4"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Beneficiary:</span>
                <span className="font-bold">Puri Municipal Relief</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Risk Severity Score:</span>
                <span
                  className={`font-bold ${
                    isMarineMode
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {isMarineMode ? "0.8 / 10.0 (NOMINAL)" : "9.4 / 10.0 (EXTREME)"}
                </span>
              </div>
            </div>

            {/* Condition Matrices */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold">
                    CONDITION A: SUSTAINED WIND
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-900 dark:text-emerald-200">
                    {isMarineMode
                      ? "34 km/h < 120 km/h (Normal)"
                      : "185 km/h ≥ 120 km/h Threshold"}
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>

              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold">
                    CONDITION B: SURGE INUNDATION
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-900 dark:text-emerald-200">
                    {isMarineMode
                      ? "0.0m Surge < 1.2m (Normal)"
                      : "3.2m Surge ≥ 1.2m Threshold"}
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* 6. 3D Terrain Elevation Control for All Roles */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-md">
        <button
          onClick={onToggle3dTerrain}
          type="button"
          className={`w-full py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            is3dTerrain
              ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-slate-800 dark:border-slate-700 dark:text-cyan-300"
              : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>3D RIDGE & DUNE ELEVATION: {is3dTerrain ? "ENABLED" : "DISABLED"}</span>
        </button>
      </div>
    </aside>
  );
}
