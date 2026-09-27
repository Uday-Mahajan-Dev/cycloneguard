"use client";

import React, { useState } from "react";
import {
  Play,
  Pause,
  CloudSun,
  CloudRain,
  Layers,
  FastForward,
  RotateCcw,
  Sliders,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface LiveRadarPlaybackProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  radarTimestamps: number[];
  currentFrameIndex: number;
  onSelectFrame: (index: number) => void;
  overlayOpacity: number;
  onChangeOpacity: (opacity: number) => void;
  isRadarActive: boolean;
  onToggleRadar: () => void;
  isNasaCloudsActive: boolean;
  onToggleNasaClouds: () => void;
  isCycloneOverlayActive: boolean;
  onToggleCycloneOverlay: () => void;
  onClose?: () => void;
}

export default function LiveRadarPlayback({
  isPlaying,
  onTogglePlay,
  radarTimestamps,
  currentFrameIndex,
  onSelectFrame,
  overlayOpacity,
  onChangeOpacity,
  isRadarActive,
  onToggleRadar,
  isNasaCloudsActive,
  onToggleNasaClouds,
  isCycloneOverlayActive,
  onToggleCycloneOverlay,
  onClose,
}: LiveRadarPlaybackProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  const currentTimestamp =
    radarTimestamps[currentFrameIndex] || radarTimestamps[radarTimestamps.length - 1] || 1711368000;

  const formattedTime = new Date(currentTimestamp * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-2 sm:p-2.5 shadow-2xl text-xs font-mono text-slate-200 flex flex-col gap-1.5 sm:gap-2 w-full max-w-[92vw] sm:max-w-sm pointer-events-auto transition-all">
      {/* Header with Live Status, Timestamp & Action Buttons (Minimize / Close) */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-[10px] sm:text-[11px]">
        <div className="flex items-center gap-1.5 font-bold text-cyan-400">
          <CloudRain className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
          <span className="truncate">LIVE RADAR PLAYBACK</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>{formattedTime} UTC</span>
          </div>

          {/* Minimize / Expand Toggle */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            type="button"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isMinimized ? "Expand Controls" : "Minimize Controls"}
          >
            {isMinimized ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Close (X) Button */}
          {onClose && (
            <button
              onClick={onClose}
              type="button"
              className="p-1 rounded hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
              title="Close Radar Controls"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Minimized View */}
      {isMinimized ? (
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <button
            onClick={onTogglePlay}
            type="button"
            className={`flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] transition-all cursor-pointer ${
              isPlaying
                ? "bg-amber-500 text-slate-950"
                : "bg-emerald-600 text-white"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>PLAY</span>
              </>
            )}
          </button>

          <span className="text-[10px] text-slate-400 font-mono">
            Frame {currentFrameIndex + 1}/{radarTimestamps.length}
          </span>

          <button
            onClick={() => setIsMinimized(false)}
            type="button"
            className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
          >
            Expand Layers →
          </button>
        </div>
      ) : (
        <>
          {/* Frame Timeline Scrubber & Loop Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onTogglePlay}
              type="button"
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg font-bold text-[10px] sm:text-[11px] transition-all cursor-pointer shrink-0 ${
                isPlaying
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
              }`}
              title={isPlaying ? "Pause Radar Loop" : "Play 5-Frame Radar Loop"}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>PLAY LOOP</span>
                </>
              )}
            </button>

            {/* Timeline Frame Step Buttons */}
            <div className="flex-1 flex items-center gap-1 bg-slate-950/80 p-0.5 sm:p-1 rounded-lg border border-slate-800">
              {radarTimestamps.slice(0, 5).map((ts, idx) => (
                <button
                  key={ts}
                  onClick={() => onSelectFrame(idx)}
                  type="button"
                  className={`flex-1 py-0.5 sm:py-1 rounded text-[9.5px] sm:text-[10px] font-bold transition-colors cursor-pointer ${
                    currentFrameIndex === idx
                      ? "bg-cyan-500 text-slate-950 font-black shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                  title={`Frame ${idx + 1}: ${new Date(ts * 1000).toLocaleTimeString()}`}
                >
                  F{idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Weather Layer Toggles (Radar, Cloud Spiral, NASA TrueColor) */}
          <div className="grid grid-cols-3 gap-1 sm:gap-1.5 pt-1 border-t border-slate-800/80">
            <button
              onClick={onToggleCycloneOverlay}
              type="button"
              className={`px-1 sm:px-1.5 py-0.5 sm:py-1 rounded text-[9.5px] sm:text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                isCycloneOverlayActive
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
              title="Toggle Massive Infrared Satellite Cyclone Cloud Spiral"
            >
              <span>🌀 CYCLONE</span>
            </button>

            <button
              onClick={onToggleRadar}
              type="button"
              className={`px-1 sm:px-1.5 py-0.5 sm:py-1 rounded text-[9.5px] sm:text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                isRadarActive
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
              title="Toggle RainViewer Live Doppler Radar Feed"
            >
              <span>📡 RADAR</span>
            </button>

            <button
              onClick={onToggleNasaClouds}
              type="button"
              className={`px-1 sm:px-1.5 py-0.5 sm:py-1 rounded text-[9.5px] sm:text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                isNasaCloudsActive
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
              title="Toggle NASA GIBS TrueColor Infrared Clouds"
            >
              <span>🛰️ NASA</span>
            </button>
          </div>

          {/* Weather Overlay Opacity Slider */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80 text-[9.5px] sm:text-[10px] text-slate-400">
            <Sliders className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="shrink-0">Opacity: {Math.round(overlayOpacity * 100)}%</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={overlayOpacity}
              onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </>
      )}
    </div>
  );
}
