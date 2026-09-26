"use client";

import React, { useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import ThemeToggle from "@/components/ThemeToggle";
import {
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Activity,
  ArrowLeft,
  Lock,
  ExternalLink,
  Layers,
  Clock,
  TrendingUp,
} from "lucide-react";

export default function ParametricInsurancePage() {
  const [released, setReleased] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleRelease = () => {
    setReleased(true);
    setTxHash("0x8f2a9c41b83d7e5201af334091c6e107d9fb412a");
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#2563eb", "#f59e0b"],
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans p-4 md:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                Parametric Disaster Liquidity Desk
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-[10px] text-emerald-800 dark:text-emerald-300 font-bold">
                MUNICIPAL UNDERWRITER
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Autonomous PostGIS Index Verification & Instant Zero-Loss-Adjustment Payouts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Open 3D Command Map</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Liquidity Release Card & Policy Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Liquidity Release Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                PAYOUT AUTHORIZATION #PG-2019-FANI-01
              </span>
              <span className="text-xs text-slate-500">Puri Municipal Corp</span>
            </div>

            <div className="pt-2">
              <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                Autonomous Emergency Liquidity
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                $250,000.00 <span className="text-sm text-emerald-600 font-normal">USD</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Equivalent: <span className="text-slate-800 dark:text-slate-200 font-bold">₹2,08,25,000 INR</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2 text-slate-700 dark:text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Trigger Mechanism:</span>
                <span className="text-blue-600 dark:text-cyan-400 font-bold">Dual Wind + Hydro Surge Index</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Settlement Speed:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Instant (T-0 Hours at Landfall)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Loss Adjuster Req:</span>
                <span className="font-bold">NONE (Parametric Index)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            {!released ? (
              <button
                onClick={handleRelease}
                type="button"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>RELEASE MUNICIPAL LIQUIDITY RELIEF FUND</span>
              </button>
            ) : (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1.5 text-xs">
                <div className="text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Wire Dispatched to Municipal Treasury Account</span>
                </div>
                <div className="text-[11px] text-slate-500 break-all font-mono">
                  TxHash: <span className="font-bold text-slate-800 dark:text-slate-200">{txHash}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Cols: Parametric Policy Index Matrices */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Coastal Municipal Ward Index Verification Table</span>
            </h2>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    Ward 1-6 (Puri Seafront & Swargadwar Coastal Belt)
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Recorded Wind: <span className="font-bold text-red-600">185 km/h</span> (Threshold: 120 km/h) • Surge: <span className="font-bold text-red-600">3.2m</span> (Threshold: 1.2m)
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs shrink-0 self-start md:self-center">
                  TRIGGER MET (100% PAYOUT)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    Ward 7-12 (Gop & Inland Drainage Basin)
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Recorded Wind: <span className="font-bold text-red-600">165 km/h</span> (Threshold: 120 km/h) • Surge: <span className="font-bold text-amber-600">1.8m</span> (Threshold: 1.2m)
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs shrink-0 self-start md:self-center">
                  TRIGGER MET (100% PAYOUT)
                </span>
              </div>
            </div>
          </div>

          {/* Historical Comparison */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Historical Severe Cyclonic Event Benchmark
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">1999 Super Cyclone</div>
                <div className="text-slate-500">Wind: 260 km/h • Surge: 6.0m</div>
                <div className="text-red-600 font-bold">Catastrophic Inundation</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">Cyclone Phailin (2013)</div>
                <div className="text-slate-500">Wind: 215 km/h • Surge: 2.5m</div>
                <div className="text-amber-600 font-bold">Severe Coastal Breach</div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 space-y-1">
                <div className="font-bold text-blue-900 dark:text-cyan-300">Cyclone Fani (2019)</div>
                <div className="text-slate-500">Wind: 185 km/h • Surge: 3.2m</div>
                <div className="text-emerald-600 font-bold">Parametric $250k Auto-Trigger</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
