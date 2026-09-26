"use client";

import React, { useState } from "react";
import {
  Zap,
  Hospital,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Fuel,
  Users,
  Building,
  Radio,
} from "lucide-react";
import { InfrastructureResponse, ExposureResultResponse } from "@/lib/types";

interface GridMonitorPanelProps {
  infrastructure: InfrastructureResponse[];
  exposedAssets: ExposureResultResponse[];
  onSelectAsset?: (asset: InfrastructureResponse) => void;
  isMarineMode?: boolean;
}

export default function GridMonitorPanel({
  infrastructure,
  exposedAssets,
  onSelectAsset,
  isMarineMode = false,
}: GridMonitorPanelProps) {
  const [activeTab, setActiveTab] = useState<"grid" | "hospitals" | "shelters">("grid");

  // Filter categories
  const substations = infrastructure.filter((i) => i.type === "power_substation");
  const hospitals = infrastructure.filter((i) => i.type === "hospital");
  const shelters = infrastructure.filter((i) => i.type === "shelter");

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-md space-y-3 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
          <Activity className="w-4 h-4 text-cyan-500 animate-pulse" />
          <span>REAL-TIME INFRASTRUCTURE GRID</span>
        </div>
        <span
          className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
            isMarineMode
              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
              : "bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800"
          }`}
        >
          {isMarineMode ? "100% ONLINE" : "ODISHA DISCOM"}
        </span>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px]">
        <button
          onClick={() => setActiveTab("grid")}
          type="button"
          className={`py-1 rounded font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === "grid"
              ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-cyan-300 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Zap className="w-3 h-3 text-red-500" />
          <span>Grid ({substations.length || 4})</span>
        </button>

        <button
          onClick={() => setActiveTab("hospitals")}
          type="button"
          className={`py-1 rounded font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === "hospitals"
              ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-cyan-300 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Hospital className="w-3 h-3 text-orange-500" />
          <span>Care ({hospitals.length || 1})</span>
        </button>

        <button
          onClick={() => setActiveTab("shelters")}
          type="button"
          className={`py-1 rounded font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === "shelters"
              ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-cyan-300 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Shield className="w-3 h-3 text-emerald-500" />
          <span>Shelter ({shelters.length || 1})</span>
        </button>
      </div>

      {/* Tab 1: Electrical Substations */}
      {activeTab === "grid" && (
        <div className="space-y-2">
          {substations.map((sub) => {
            const exp = isMarineMode
              ? null
              : exposedAssets.find(
                  (e) => e.infrastructure_id === sub.id || e.name === sub.name
                );
            const depth = exp?.flood_depth_m || 0;
            const isCritical = !isMarineMode && depth > 1.0;
            const isAtRisk = !isMarineMode && depth > 0.3 && depth <= 1.0;

            return (
              <div
                key={sub.id}
                onClick={() => onSelectAsset && onSelectAsset(sub)}
                className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/60 transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white truncate">
                    <Zap
                      className={`w-3.5 h-3.5 ${
                        isCritical
                          ? "text-red-500 animate-pulse"
                          : isAtRisk
                          ? "text-amber-500 animate-pulse"
                          : "text-emerald-400"
                      }`}
                    />
                    <span className="truncate">{sub.name}</span>
                  </div>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                      isCritical
                        ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800"
                        : isAtRisk
                        ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
                        : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                    }`}
                  >
                    {isCritical ? "TRIPPED 🔴" : isAtRisk ? "AT RISK 🟠" : "ONLINE 🟢"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                  <div>
                    Surge:{" "}
                    <strong
                      className={
                        isCritical
                          ? "text-red-500"
                          : isAtRisk
                          ? "text-amber-500"
                          : "text-slate-300"
                      }
                    >
                      {isMarineMode ? "0.0m" : `${depth.toFixed(1)}m`}
                    </strong>
                  </div>
                  <div>
                    Elev: <strong>{(sub.elevation_m || 3.5).toFixed(1)}m</strong>
                  </div>
                  <div>
                    Load:{" "}
                    <strong>
                      {isCritical
                        ? "0 MW"
                        : isAtRisk
                        ? `${Math.round((sub.capacity || 20) * 0.5)} MW`
                        : `${sub.capacity || 20} MW`}
                    </strong>
                  </div>
                </div>

                {/* Load Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      isCritical
                        ? "bg-red-500 w-full"
                        : isAtRisk
                        ? "bg-amber-500 w-1/2"
                        : "bg-emerald-500 w-4/5"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Hospitals & Critical Trauma Centers */}
      {activeTab === "hospitals" && (
        <div className="space-y-2">
          {hospitals.map((hosp) => {
            return (
              <div
                key={hosp.id}
                onClick={() => onSelectAsset && onSelectAsset(hosp)}
                className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/60 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white truncate">
                    <Hospital className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="truncate">{hosp.name}</span>
                  </div>
                  <span
                    className={`px-1.5 py-0.2 rounded border text-[9px] font-bold ${
                      isMarineMode
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                        : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800"
                    }`}
                  >
                    {isMarineMode ? "100% OPERATIONAL 🟢" : "ACCESS AT RISK 🟡"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[9px]">ROAD ACCESS</div>
                    <div className="text-emerald-500 font-bold text-xs mt-0.5">
                      {isMarineMode ? "100% Passable" : "45% Passable"}
                    </div>
                  </div>
                  <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[9px]">PRIMARY GRID</div>
                    <div className="text-emerald-400 font-bold text-xs mt-0.5 flex items-center gap-1">
                      <Fuel className="w-3 h-3" />
                      <span>{isMarineMode ? "Grid Online 100%" : "Diesel Gen (94h)"}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>Bed Capacity: <strong className="text-white">450 Beds</strong></span>
                  <span className="text-emerald-400 font-bold">Peacetime Ready</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Cyclone Shelters */}
      {activeTab === "shelters" && (
        <div className="space-y-2">
          {shelters.map((shelter) => {
            return (
              <div
                key={shelter.id}
                onClick={() => onSelectAsset && onSelectAsset(shelter)}
                className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/60 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white truncate">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate">{shelter.name}</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-[9px] font-bold">
                    {isMarineMode ? "STANDBY 🟢" : "ACTIVE 🟢"}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Capacity: <strong className="text-white">2,500 Max</strong></span>
                    <strong className="text-emerald-400">{isMarineMode ? "Standby" : "88%"}</strong>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: isMarineMode ? "10%" : "88%" }}
                    />
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between">
                  <span>Rations: <strong className="text-emerald-400">72h Ready</strong></span>
                  <span>Safe Elevation: <strong className="text-white">7.8m MSL</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
