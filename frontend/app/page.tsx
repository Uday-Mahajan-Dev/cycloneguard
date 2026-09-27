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
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col justify-between selection:bg-blue-500/30">
      {/* Top Header */}
      <header className="w-full z-20 px-3 sm:px-6 py-3 sm:py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 max-w-[100vw] overflow-x-hidden">
        {/* Left Logo Section */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 text-white shadow-sm shrink-0">
            <Radar className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          </div>
          <div className="flex items-center">
            <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Cyclone<span className="text-blue-600 dark:text-cyan-400">Guard</span>
            </span>
            <span className="ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-[9px] sm:text-[10px] font-bold shrink-0">
              3D AI OPS
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 border border-slate-200 dark:border-slate-700 sm:border-transparent"
          >
            <span className="hidden sm:inline">Evaluator Login</span>
            <span className="sm:hidden">Login</span>
          </Link>
          <Link
            href="/dashboard"
            className="hidden md:flex px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs items-center gap-1.5 shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Hero */}
      <main className="z-10 px-4 sm:px-6 py-8 sm:py-16 md:py-20 max-w-5xl mx-auto text-center space-y-6 sm:space-y-8 w-full">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[10px] sm:text-xs text-blue-700 dark:text-cyan-300 font-bold shadow-sm max-w-[94vw] text-center leading-tight mx-auto">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
          <span className="break-words">Google Earth Engine 3D NASADEM + Gemini 2.5 Flash Disaster Intelligence</span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight uppercase px-2 sm:px-4 text-center break-words max-w-full">
          Autonomous Disaster <span className="text-blue-600 dark:text-cyan-400">Inundation</span> & Anticipatory <span className="text-red-600 dark:text-red-400">Grid Defense</span>
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed px-2">
          Pioneering high-resolution 3D hydrodynamic storm surge modeling, sub-meter critical infrastructure
          vulnerability mapping, and automated parametric disaster relief payouts for coastal resilience in the Bay of Bengal.
        </p>

        {/* Action Gateways */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 w-full max-w-md sm:max-w-none mx-auto">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer text-center"
          >
            <Activity className="w-4 h-4 shrink-0" />
            <span>Launch 3D Command View (Fani 2019 Case Study)</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm text-center"
          >
            <span>⚡ Evaluator Matrix (One-Click)</span>
          </Link>
        </div>

        {/* 4 Feature Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8 sm:pt-12 text-left">
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
