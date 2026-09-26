"use client";

import React from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Radar,
  ArrowRight,
  Shield,
  Zap,
  DollarSign,
  Layers,
  Sparkles,
  Waves,
  CheckCircle2,
  Activity,
  Building,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col justify-between selection:bg-blue-500/30">
      {/* Top Header */}
      <header className="w-full z-20 px-6 py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 text-white shadow-sm">
            <Radar className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Cyclone<span className="text-blue-600 dark:text-cyan-400">Guard</span>
            </span>
            <span className="ml-2 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold">
              3D AI OPS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Evaluator Login
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Hero */}
      <main className="z-10 px-6 py-12 md:py-20 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-cyan-300 font-bold shadow-sm">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <span>Google Earth Engine 3D NASADEM + Gemini 2.5 Flash Disaster Intelligence</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight uppercase">
          Autonomous Disaster <span className="text-blue-600 dark:text-cyan-400">Inundation</span> & Anticipatory <span className="text-red-600 dark:text-red-400">Grid Defense</span>
        </h1>

        <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Pioneering high-resolution 3D hydrodynamic storm surge modeling, sub-meter critical infrastructure
          vulnerability mapping, and automated parametric disaster relief payouts for coastal resilience in the Bay of Bengal.
        </p>

        {/* Action Gateways */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2.5 shadow-md transition-colors cursor-pointer"
          >
            <Activity className="w-4 h-4" />
            <span>Launch 3D Command View (Fani 2019 Case Study)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <span>⚡ Evaluator Matrix (One-Click)</span>
          </Link>
        </div>

        {/* 4 Feature Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-12 text-left">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-800">
              <Waves className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase">
              3D GEE Flood Mesh
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              True 3D extrusions derived from NASADEM 30m terrain elevation for sub-meter coastal surge modeling.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase">
              Grid Tripping Intel
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Anticipatory 33kV substation isolation protocols scheduled prior to surge breach at T-6h.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase">
              Responder Dispatch
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Live shelter occupancy trackers and real-time evacuation corridor submergence alerts for NDRF teams.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase">
              $250k Parametric Fund
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Instant automated liquidity disbursement to municipal relief funds upon threshold breach.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        CycloneGuard Autonomous Geospatial Disaster Intelligence • State of Odisha & Bay of Bengal Littoral
      </footer>
    </div>
  );
}
