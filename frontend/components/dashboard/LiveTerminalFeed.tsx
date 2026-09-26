"use client";

import React, { useState, useEffect, useRef } from "react";
import { Terminal, Radio, Shield, Sparkles, Send, Waves, Zap } from "lucide-react";

export interface TerminalLogEntry {
  id: string;
  timestamp: string;
  source: "METEO" | "GEMINI" | "TELEGRAM" | "HYDRO" | "GRID";
  message: string;
  level: "info" | "warning" | "critical" | "success";
}

const INITIAL_LOGS: TerminalLogEntry[] = [
  {
    id: "log-1",
    timestamp: "14:00:10",
    source: "HYDRO",
    message: "GEE Inundation Engine recomputed 3.5m surge polygon for Puri sector (1746.5 km² impacted).",
    level: "warning",
  },
  {
    id: "log-2",
    timestamp: "14:01:15",
    source: "TELEGRAM",
    message: "CAP Emergency Broadcast dispatched to @CycloneGuard_Alert_Bot & SMS Cell Broadcast.",
    level: "success",
  },
  {
    id: "log-3",
    timestamp: "14:02:00",
    source: "GEMINI",
    message: "Gemini 2.5 Flash analysis complete. High priority: Preemptive grid trip on Puri Town 33kV.",
    level: "critical",
  },
  {
    id: "log-4",
    timestamp: "14:02:45",
    source: "METEO",
    message: "Open-Meteo Marine Sync: Pressure dropped to 937 hPa (-2.15 hPa/hr), Sustained Wind 185 km/h.",
    level: "info",
  },
];

const STREAMING_TEMPLATES = [
  {
    source: "METEO" as const,
    message: "Open-Meteo Marine Buoy BOB-01: Peak swell crest recorded at 6.42m with 14.8s wave period.",
    level: "info" as const,
  },
  {
    source: "GRID" as const,
    message: "OPTCL Central Grid: Feeder Marine Drive 33kV tripped on overcurrent surge sensor.",
    level: "critical" as const,
  },
  {
    source: "GEMINI" as const,
    message: "Gemini Cascade Intelligence: Road access to Puri District Hospital reduced to 45%.",
    level: "warning" as const,
  },
  {
    source: "TELEGRAM" as const,
    message: "CAP Dispatch: Automated evacuation siren broadcast sent to Ward 4 & Ward 9 Puri.",
    level: "success" as const,
  },
  {
    source: "HYDRO" as const,
    message: "3D DEM Extrusion: Flood elevation threshold exceeded 2.5m at Pentakota Coastal Lowlands.",
    level: "warning" as const,
  },
];

export default function LiveTerminalFeed() {
  const [logs, setLogs] = useState<TerminalLogEntry[]>(INITIAL_LOGS);
  const [isMinimized, setIsMinimized] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-generate streaming events every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const template =
        STREAMING_TEMPLATES[Math.floor(Math.random() * STREAMING_TEMPLATES.length)];
      const newEntry: TerminalLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        source: template.source,
        message: template.message,
        level: template.level,
      };

      setLogs((prev) => [...prev.slice(-15), newEntry]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to latest log
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        type="button"
        className="bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-2xl flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-white transition-all cursor-pointer pointer-events-auto"
      >
        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
        <span>LIVE TELEMETRY LOGS (ACTIVE)</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
      </button>
    );
  }

  return (
    <div className="bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-3 text-xs font-mono text-slate-300 w-full max-w-sm pointer-events-auto flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold text-white text-[11px] uppercase tracking-wider">
            Live Dispatch Terminal
          </span>
          <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-400 text-[9px] font-black flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            STREAMING
          </span>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          type="button"
          className="text-[10px] text-slate-500 hover:text-white cursor-pointer px-1 py-0.5 rounded hover:bg-slate-800"
        >
          Hide _
        </button>
      </div>

      {/* Terminal Log Output */}
      <div
        ref={logContainerRef}
        className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-[10px] font-mono leading-relaxed select-text scrollbar-thin"
      >
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-1.5 animate-in fade-in duration-200">
            <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
            <span
              className={`px-1 rounded text-[9px] font-bold shrink-0 ${
                log.source === "METEO"
                  ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                  : log.source === "GEMINI"
                  ? "bg-purple-950 text-purple-300 border border-purple-800"
                  : log.source === "TELEGRAM"
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                  : log.source === "HYDRO"
                  ? "bg-blue-950 text-blue-300 border border-blue-800"
                  : "bg-red-950 text-red-300 border border-red-800"
              }`}
            >
              {log.source}
            </span>
            <span
              className={`${
                log.level === "critical"
                  ? "text-red-400 font-semibold"
                  : log.level === "warning"
                  ? "text-amber-300"
                  : log.level === "success"
                  ? "text-emerald-300"
                  : "text-slate-300"
              }`}
            >
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
