"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  CycloneGuardGeminiAnalysis,
  ExposureResultResponse,
  InsuranceTriggerEvaluation,
  UserProfile,
} from "@/lib/types";
import {
  Sparkles,
  Zap,
  Hospital,
  ShieldAlert,
  Send,
  DollarSign,
  CheckCircle2,
  AlertOctagon,
  Languages,
  ChevronRight,
  Lock,
  Building,
  AlertTriangle,
  Radio,
  FileCheck,
  Compass,
  ArrowRight,
  Anchor,
  ShieldCheck,
} from "lucide-react";

interface RightIntelligencePanelProps {
  analysis: CycloneGuardGeminiAnalysis | null;
  insurance: InsuranceTriggerEvaluation | null;
  exposedAssets: ExposureResultResponse[];
  onOpenAlertModal: () => void;
  loadingAnalysis: boolean;
  user: UserProfile | null;
  isMarineMode?: boolean;
  realtimeTelemetry?: any;
}

export default function RightIntelligencePanel({
  analysis,
  insurance,
  exposedAssets,
  onOpenAlertModal,
  loadingAnalysis,
  user,
  isMarineMode = false,
  realtimeTelemetry,
}: RightIntelligencePanelProps) {
  const role = user?.role || "admin";

  const [bulletinLang, setBulletinLang] = useState<"en" | "local">("en");
  const [gridShutdownAuthorized, setGridShutdownAuthorized] = useState(false);
  const [evacuationAuthorized, setEvacuationAuthorized] = useState(false);
  const [payoutReleased, setPayoutReleased] = useState(false);
  const [payoutTxHash, setPayoutTxHash] = useState<string | null>(null);

  // Grid feeder manual trip overrides
  const [manualTrips, setManualTrips] = useState<Record<string, boolean>>({});

  // Reset manual overrides whenever simulation / exposedAssets changes
  React.useEffect(() => {
    setManualTrips({});
  }, [exposedAssets]);

  const toggleFeeder = (name: string) => {
    const exp = exposedAssets.find((a) => a.name === name);
    const autoTripped = (exp?.flood_depth_m || 0) > 1.0;
    const current = manualTrips[name] !== undefined ? manualTrips[name] : autoTripped;
    setManualTrips((prev) => ({
      ...prev,
      [name]: !current,
    }));
  };

  const handleAuthorizeGrid = () => {
    setGridShutdownAuthorized(true);
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  const handleAuthorizeEvac = () => {
    setEvacuationAuthorized(true);
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  const handleReleasePayout = () => {
    setPayoutReleased(true);
    setPayoutTxHash("0x8f2a9c41b83d7e5201af334091c6e107d9fb412a");
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#2563eb", "#10b981", "#f59e0b"],
    });
  };

  return (
    <aside className="w-full space-y-3 font-mono text-xs z-20 pointer-events-auto p-0.5">
      {/* 1. ROLE: ADMIN (State Incident Commander) VIEW */}
      {role === "admin" && (
        <>
          {/* AI Danger Level Banner */}
          {isMarineMode ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3.5 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  STATEWIDE SURVEILLANCE — CENTRAL BOB
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-black text-[10px]">
                  ALL CLEAR
                </span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                Real-time Open-Meteo buoy telemetry indicates nominal maritime conditions across Bay of Bengal. No tropical cyclogenesis detected. All coastal infrastructure and port channels remain 100% operational.
              </p>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl p-3.5 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-400">
                  <AlertOctagon className="w-4 h-4 text-red-600 animate-pulse" />
                  STATEWIDE CASCADE RISK — SYSTEM SYS-91B
                </span>
                <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px]">
                  {analysis?.danger_level || "RED ALERT: EXTREME"}
                </span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                {analysis?.summary ||
                  "Severe storm surge will breach Puri coastal defenses. Critical power substations and hospital access bridges require immediate anticipatory mitigation before T-6h."}
              </p>
            </div>
          )}

          {/* Statewide Electrical Grid & Maritime Infrastructure Status */}
          {isMarineMode ? (
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  Coastal Grid & Maritime Feeder Status
                </span>
                <span className="text-[10px] text-emerald-500 font-bold">
                  100% ONLINE
                </span>
              </div>

              <div className="space-y-2">
                {[
                  { name: "Puri Town 33kV Substation", status: "ONLINE (NORMAL)" },
                  { name: "Marine Drive 33kV Feeder", status: "ONLINE (NORMAL)" },
                  { name: "Konark Sea-Facing Feeder", status: "ONLINE (NORMAL)" },
                  { name: "Nimapada 132kV Primary Substation", status: "ONLINE (NORMAL)" },
                  { name: "BOB Ocean Buoy #01", status: "LIVE TRANSMITTING" },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                  >
                    <div className="truncate">
                      <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                        Status: 50.0 Hz • Grid Stable
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] shrink-0 border border-emerald-300 dark:border-emerald-800">
                      🟢 {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-red-600" />
                  Statewide Grid Tripping Protocol
                </span>
                <span className="text-[10px] text-slate-500 font-sans">
                  OPTCL / TPCODL
                </span>
              </div>

              <div className="space-y-2">
                {[
                  "Puri Town 33kV Substation",
                  "Marine Drive 33kV Feeder",
                  "Konark Sea-Facing Feeder",
                  "Nimapada 132kV Primary Substation",
                ].map((name) => {
                  const exp = exposedAssets.find((a) => a.name === name);
                  const depth = exp?.flood_depth_m || 0;
                  const autoTripped = depth > 1.0;
                  const isAtRisk = depth > 0.3 && depth <= 1.0;

                  const isTripped =
                    manualTrips[name] !== undefined
                      ? manualTrips[name]
                      : autoTripped;

                  const cutoff = isTripped
                    ? "Cutoff: T-2h 00m (Immediate)"
                    : isAtRisk
                    ? "Cutoff: T-4h 00m (Standby)"
                    : "Cutoff: T-6h 00m (Armed)";

                  return (
                    <div
                      key={name}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          Surge Depth:{" "}
                          <span
                            className={
                              depth > 1.0
                                ? "font-bold text-red-600"
                                : depth > 0.3
                                ? "font-bold text-amber-500"
                                : "font-bold text-emerald-500"
                            }
                          >
                            {depth.toFixed(1)}m
                          </span>{" "}
                          • <span className="font-bold text-slate-400">{cutoff}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFeeder(name)}
                        type="button"
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer shrink-0 ${
                          isTripped
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : isAtRisk
                            ? "bg-amber-500 text-white hover:bg-amber-600"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200"
                        }`}
                      >
                        {isTripped
                          ? "⚡ ISOLATED (TRIPPED)"
                          : isAtRisk
                          ? "⚠️ AT RISK"
                          : "🟢 LIVE (ARMED)"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bilingual Alert Bulletin */}
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-md space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                {isMarineMode ? "Real-Time Maritime Bulletin" : "Emergency Public Bulletin"}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setBulletinLang("en")}
                  type="button"
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                    bulletinLang === "en"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setBulletinLang("local")}
                  type="button"
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                    bulletinLang === "local"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                  }`}
                >
                  ଓଡ଼ିଆ (Odia)
                </button>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] leading-relaxed font-sans text-slate-700 dark:text-slate-300">
              {isMarineMode
                ? bulletinLang === "en"
                  ? "REAL-TIME MARINE ADVISORY: Bay of Bengal Sector (19.805°N, 85.830°E). Wave heights 2.82m with 8.9s swell period. Surface winds 34 km/h. Sea lanes and port operations at Paradip & Dhamra are fully open and clear."
                  : "ସାମ୍ପ୍ରତିକ ସାମୁଦ୍ରିକ ସୂଚନା: ବଙ୍ଗୋପସାଗରରେ ସ୍ଥିତି ସ୍ୱାଭାବିକ ରହିଛି। ସମସ୍ତ ବନ୍ଦର ଓ ଉପକୂଳବର୍ତ୍ତୀ କ୍ଷେତ୍ରରେ କୌଣସି ବିପଦ ନାହିଁ।"
                : bulletinLang === "en"
                ? analysis?.bulletin_en ||
                  "URGENT CYCLONE WARNING: Active Severe System SYS-91B is advancing toward Puri Coastal Corridor with sustained winds of 186 km/h, storm surge of 3.5m, and offshore wave crests of 2.92m. Complete evacuation of coastal lowlands within 2.0 km of shoreline is mandatory before T-12 hours."
                : analysis?.bulletin_local ||
                  "ଜରୁରୀ ସୂଚନା: ବାତ୍ୟା SYS-91B ପ୍ରଭାବରେ ୩.୫ ମିଟର ଉଚ୍ଚ ଜୁଆର ଆଶଙ୍କା। ତୁରନ୍ତ ନିକଟସ୍ଥ ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳକୁ ଯାଆନ୍ତୁ।"}
            </div>

            <button
              onClick={onOpenAlertModal}
              type="button"
              className={`w-full py-2.5 px-3 rounded-lg text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer ${
                isMarineMode
                  ? "bg-cyan-600 hover:bg-cyan-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isMarineMode
                  ? "DISPATCH MARITIME ADVISORY UPDATE"
                  : "DISPATCH TELEGRAM & CAP ALERT"}
              </span>
            </button>
          </div>
        </>
      )}

      {/* 2. ROLE: AUTHORITY (District Magistrate / Collector) VIEW */}
      {(role === "collector" || role === "authority") && (
        <>
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-orange-600" />
                Collector Directive Deck
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isMarineMode
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300"
                }`}
              >
                {isMarineMode ? "PEACETIME STATUS" : "REQUIRED SIGN-OFF"}
              </span>
            </div>

            {/* Directive 1: Power Grid Shutdown */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    Controlled 33kV Feeder Tripping
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {isMarineMode
                      ? "Grid Operating at Normal 50Hz • No cutoffs required"
                      : "Puri Town Substation & Marine Drive Coastal Feeders"}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    isMarineMode
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : gridShutdownAuthorized
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {isMarineMode
                    ? "NORMAL (ONLINE)"
                    : gridShutdownAuthorized
                    ? "AUTHORIZED (#OD-PUR-88)"
                    : "PENDING SIGN-OFF"}
                </span>
              </div>

              {!isMarineMode && !gridShutdownAuthorized && (
                <button
                  onClick={handleAuthorizeGrid}
                  type="button"
                  className="w-full py-2 px-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>AUTHORIZE CONTROLLED GRID SHUTDOWN</span>
                </button>
              )}
            </div>

            {/* Directive 2: Evacuation Order */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    Lowland Evacuation Directive
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {isMarineMode
                      ? "All coastal sectors safe • Standard civilian activities"
                      : "Mandatory relocation of 0-2km coastal population"}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    isMarineMode
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : evacuationAuthorized
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {isMarineMode ? "NOT REQUIRED" : evacuationAuthorized ? "EXECUTED" : "DRAFT"}
                </span>
              </div>

              {!isMarineMode && !evacuationAuthorized && (
                <button
                  onClick={handleAuthorizeEvac}
                  type="button"
                  className="w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>APPROVE EVACUATION DIRECTIVE</span>
                </button>
              )}
            </div>
          </div>

          {/* District Action Dispatch Button */}
          <button
            onClick={onOpenAlertModal}
            type="button"
            className="w-full py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>DISPATCH PURI MUNICIPAL ADVISORY</span>
          </button>
        </>
      )}

      {/* 3. ROLE: RESPONDER (NDRF / Field Team Lead) VIEW */}
      {role === "responder" && (
        <>
          {/* Route Viability Monitor */}
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-600" />
                Route Viability Monitor
              </span>
              <span className="text-[10px] text-slate-500 font-sans">
                Real-Time
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-900 dark:text-emerald-300">
                    NH-316 Corridor (Puri - BBSR)
                  </div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400">
                    100% Clear & Passable
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">
                  OPEN
                </span>
              </div>

              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-900 dark:text-emerald-300">
                    Mangalahat Bridge Access
                  </div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400">
                    {isMarineMode ? "Normal Water Level" : "1.4m Surge Submergence at T-6h"}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    isMarineMode
                      ? "bg-emerald-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {isMarineMode ? "OPEN" : "SUBMERGED"}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-900 dark:text-emerald-300">
                    Marine Drive (Puri - Konark)
                  </div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400">
                    {isMarineMode ? "Clear Maritime Road" : "High Wave Wash-Away Hazard"}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    isMarineMode
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-600 text-white"
                  }`}
                >
                  {isMarineMode ? "OPEN" : "HIGH RISK"}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 4. ROLE: ANALYST (Parametric Insurer / Reinsurance) VIEW */}
      {(role === "underwriter" || role === "analyst") && (
        <>
          {/* Payout Authorization Card */}
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Parametric Liquidity Authorization
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isMarineMode
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                }`}
              >
                {isMarineMode ? "ARMED (INACTIVE)" : "100% UNLOCKED"}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
              <div className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold uppercase">
                {isMarineMode
                  ? "Active Policy Coverage Liquidity"
                  : "Authorized Pre-Landfall Relief Liquidity"}
              </div>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                $250,000 USD
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Equivalent: ₹2.08 Crore INR (Puri Municipal Relief Fund)
              </div>
            </div>

            {!isMarineMode && !payoutReleased ? (
              <button
                onClick={handleReleasePayout}
                type="button"
                className="w-full py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>RELEASE MUNICIPAL LIQUIDITY RELIEF FUND</span>
              </button>
            ) : isMarineMode ? (
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center text-[10px] text-slate-400">
                Zero parametric triggers exceeded. Automatic liquidity reserves are armed and awaiting sensor data breach.
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 text-[11px]">
                <div className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Payout Transmitted to Treasury Smart Contract</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 break-all font-mono">
                  TxHash: <span className="font-bold text-slate-800 dark:text-slate-200">{payoutTxHash}</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Status: 12 Block Confirmations • Settled
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
