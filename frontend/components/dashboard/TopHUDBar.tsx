"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/types";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Radar,
  Radio,
  Shield,
  Activity,
  LogOut,
  Loader2,
  Users,
  ChevronDown,
  Sparkles,
  Zap,
  Send,
  AlertTriangle,
} from "lucide-react";

interface TopHUDBarProps {
  engineMode: "fani" | "live";
  onToggleEngineMode: (mode: "fani" | "live") => void;
  loadingMode: boolean;
  onToggleMarineHUD?: () => void;
  isMarineHUDOpen?: boolean;
  onOpenAlertModal?: () => void;
  onTriggerGeminiAnalysis?: () => void;
  loadingAnalysis?: boolean;
}

export default function TopHUDBar({
  engineMode,
  onToggleEngineMode,
  loadingMode,
  onToggleMarineHUD,
  isMarineHUDOpen = false,
  onOpenAlertModal,
  onTriggerGeminiAnalysis,
  loadingAnalysis = false,
}: TopHUDBarProps) {
  const pathname = usePathname();
  const { user, loginAsRole, logout } = useAuth();
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);

  const activeSectors = [
    {
      id: "sec-bob-puri",
      code: "fani" as const,
      name: "SYS-91B (Bay of Bengal / Puri Sector)",
      codeName: "SYS-91B",
      intensity: "Cat 4 Cyclone • 186 km/h",
      status: "🔴 Active Warning",
    },
    {
      id: "sec-bob-marine",
      code: "live" as const,
      name: "Central BOB Marine Sector",
      codeName: "SYS-02A",
      intensity: "Live Marine Buoy Feed",
      status: "🟢 Live Open-Meteo",
    },
  ];

  const currentSector =
    activeSectors.find((s) => s.code === engineMode) || activeSectors[0];

  const roleOptions: { role: UserRole; label: string; icon: string }[] = [
    { role: "admin", label: "Admin", icon: "🔴" },
    { role: "collector", label: "Collector", icon: "🟠" },
    { role: "responder", label: "NDRF", icon: "🟡" },
    { role: "underwriter", label: "Underwriter", icon: "🟢" },
  ];

  return (
    <header className="w-full h-14 z-30 px-3 md:px-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2.5 text-xs select-none">
      {/* Brand & Live Incident Command Crest */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 text-white shadow-sm dark:bg-blue-950 dark:border dark:border-blue-700/60 dark:text-cyan-400">
            <Radar className="w-4 h-4 group-hover:rotate-45 transition-transform duration-500" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
                Cyclone<span className="text-blue-600 dark:text-cyan-400">Guard</span>
              </span>
            </div>
          </div>
        </Link>

        {/* 🔴 LIVE INCIDENT COMMAND Status Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-[10px] font-mono font-bold text-red-700 dark:text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
          <span>LIVE INCIDENT COMMAND</span>
        </div>
      </div>

      {/* Center Operational Controls: Active Sector Dropdown & Quick Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Active Sector Dropdown Selector */}
        <div className="relative">
          <button
            onClick={() => setIsSectorDropdownOpen(!isSectorDropdownOpen)}
            disabled={loadingMode}
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 font-medium transition-all shadow-inner cursor-pointer text-xs"
          >
            {loadingMode ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
            <span className="font-bold text-blue-700 dark:text-cyan-300">
              {currentSector.codeName}:
            </span>
            <span className="truncate max-w-[130px] sm:max-w-[180px]">
              {currentSector.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {/* Sectors Dropdown Menu */}
          {isSectorDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 text-xs font-mono">
              <div className="px-2.5 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
                Active Threat Sectors
              </div>
              {activeSectors.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => {
                    onToggleEngineMode(sec.code);
                    setIsSectorDropdownOpen(false);
                  }}
                  type="button"
                  className={`w-full text-left p-2 rounded-lg transition-colors flex flex-col gap-0.5 cursor-pointer ${
                    currentSector.id === sec.id
                      ? "bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {sec.name}
                    </span>
                    <span className="text-[10px]">{sec.status.split(" ")[0]}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>{sec.codeName}</span>
                    <span className="text-cyan-400 font-bold">{sec.intensity}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ⚡ Emergency Broadcast CAP Alert Button */}
        {onOpenAlertModal && (
          <button
            onClick={onOpenAlertModal}
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            title="Dispatch Public Common Alerting Protocol (CAP) Warning"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">CAP Alert</span>
          </button>
        )}

        {/* 🤖 Trigger Gemini AI Re-Analysis Button */}
        {onTriggerGeminiAnalysis && (
          <button
            onClick={onTriggerGeminiAnalysis}
            disabled={loadingAnalysis}
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            title="Trigger Gemini 2.5 Flash Cascade Risk Re-Analysis"
          >
            {loadingAnalysis ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span className="hidden xl:inline">AI Analyze</span>
          </button>
        )}

        {/* Live Marine Stream Toggle Switch */}
        {onToggleMarineHUD && (
          <button
            onClick={onToggleMarineHUD}
            type="button"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
              isMarineHUDOpen || engineMode === "live"
                ? "bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-md"
                : "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
            title="Toggle Live Real-Time Marine Telemetry HUD"
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                isMarineHUDOpen || engineMode === "live"
                  ? "text-emerald-400 animate-pulse"
                  : "text-slate-400"
              }`}
            />
            <span className="hidden sm:inline">Marine</span>
            <div
              className={`w-6 h-3 flex items-center rounded-full p-0.5 transition-colors ${
                isMarineHUDOpen || engineMode === "live"
                  ? "bg-emerald-500 justify-end"
                  : "bg-slate-300 dark:bg-slate-700 justify-start"
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
            </div>
          </button>
        )}
      </div>

      {/* Right Controls: Role Switcher, Navigation, Theme Toggle, User Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Evaluator Role Switcher */}
        <div className="hidden 2xl:flex items-center gap-0.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-1 flex items-center gap-1">
            <Users className="w-3 h-3" />
            Role:
          </span>
          {roleOptions.map((opt) => (
            <button
              key={opt.role}
              onClick={() => loginAsRole(opt.role)}
              type="button"
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                user?.role === opt.role
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold border border-slate-200 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Navigation Portal Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/dashboard"
            className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
              pathname === "/dashboard"
                ? "bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-cyan-300 font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Command</span>
          </Link>
          <Link
            href="/field"
            className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
              pathname === "/field"
                ? "bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-cyan-300 font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Field</span>
          </Link>
          <Link
            href="/insurance"
            className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
              pathname === "/insurance"
                ? "bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-cyan-300 font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <span className="font-bold text-emerald-600 dark:text-emerald-400">$</span>
            <span>Insurance</span>
          </Link>
        </nav>

        {/* Theme Toggle (Sun/Moon) */}
        <ThemeToggle />

        {/* User Profile Chip */}
        {user ? (
          <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200 dark:border-slate-800">
            <button
              onClick={logout}
              title="Logout / Switch Account"
              type="button"
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
