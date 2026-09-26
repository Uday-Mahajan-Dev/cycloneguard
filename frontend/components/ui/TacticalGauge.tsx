"use client";

import React from "react";

interface TacticalGaugeProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  color?: string;
  dangerThreshold?: number;
}

export default function TacticalGauge({
  value,
  min,
  max,
  unit,
  label,
  color = "#00f0ff",
  dangerThreshold,
}: TacticalGaugeProps) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const isDanger = dangerThreshold !== undefined && value >= dangerThreshold;
  const activeColor = isDanger ? "#ff003c" : color;

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * (circumference * 0.75);

  return (
    <div className="flex flex-col items-center justify-center p-2.5 glass-panel rounded-xl hud-corner-tl hud-corner-br">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-135" viewBox="0 0 100 100">
          {/* Background Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="7"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
          />
          {/* Active Meter */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={activeColor}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${activeColor}80)`,
            }}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold font-mono tracking-tight text-slate-100 leading-none">
            {value}
          </span>
          <span className="text-[10px] font-mono text-slate-400 mt-0.5">{unit}</span>
        </div>
      </div>

      <span className="text-[11px] font-mono font-medium tracking-wide uppercase text-slate-300 mt-1 text-center">
        {label}
      </span>
    </div>
  );
}
