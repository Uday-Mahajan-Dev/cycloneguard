"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { AlertResponse } from "@/lib/types";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Shield,
  MapPin,
  Users,
  Navigation,
  Radio,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Activity,
  Compass,
} from "lucide-react";

interface ShelterStatus {
  id: string;
  name: string;
  location: string;
  capacity: number;
  occupancy: number;
  status: "Operational" | "Near Capacity" | "Submerged / Divert";
  waterDepth: number;
  elevation: number;
}

export default function FieldResponderPage() {
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [shelters, setShelters] = useState<ShelterStatus[]>([
    {
      id: "sh-1",
      name: "Talabania Multi-purpose Cyclone Shelter",
      location: "Puri Town Sector 4",
      capacity: 2500,
      occupancy: 2050,
      status: "Near Capacity",
      waterDepth: 0.0,
      elevation: 3.2,
    },
    {
      id: "sh-2",
      name: "Swargadwar High-Capacity Center",
      location: "Puri Coastal Marine Belt",
      capacity: 1500,
      occupancy: 1420,
      status: "Near Capacity",
      waterDepth: 1.5,
      elevation: 1.5,
    },
    {
      id: "sh-3",
      name: "Gop Block Disaster Cyclone Shelter",
      location: "Gop Inland Sector",
      capacity: 1800,
      occupancy: 1710,
      status: "Near Capacity",
      waterDepth: 0.0,
      elevation: 4.5,
    },
    {
      id: "sh-4",
      name: "Balighai Coastal School Shelter",
      location: "Marine Drive East",
      capacity: 800,
      occupancy: 360,
      status: "Operational",
      waterDepth: 0.0,
      elevation: 3.8,
    },
  ]);

  useEffect(() => {
    api.listAlerts().then(setAlerts).catch(console.error);
  }, []);

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
                NDRF Tactical Responder Console
              </span>
              <span className="px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-950/80 border border-yellow-300 dark:border-yellow-800 text-[10px] text-yellow-800 dark:text-yellow-300 font-bold">
                BATTALION 3 (PURI)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mobile-First Evacuation Corridors & Real-Time Shelter Capacity Desk
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

      {/* Main Grid: Shelter Operations & Evacuation Route Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Live Shelter Status Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>Puri Sector Disaster Shelters Capacity</span>
            </h2>
            <span className="text-xs text-slate-500">4 Active Centers Monitored</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shelters.map((shelter) => {
              const percent = Math.round((shelter.occupancy / shelter.capacity) * 100);
              const isFull = percent >= 85;

              return (
                <div
                  key={shelter.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {shelter.name}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{shelter.location}</span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isFull
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      }`}
                    >
                      {isFull ? "NEAR CAPACITY" : "ACCEPTING"}
                    </span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-500">Occupancy:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {shelter.occupancy} / {shelter.capacity} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull ? "bg-amber-500" : "bg-blue-600"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800 font-mono">
                    <span className="text-slate-500">Elevation: {shelter.elevation}m</span>
                    <span className={shelter.waterDepth > 0 ? "text-red-600 font-bold" : "text-emerald-600"}>
                      Surge: {shelter.waterDepth > 0 ? `+${shelter.waterDepth}m` : "Dry Ground"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Route Accessibility Monitor */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm space-y-3 mt-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Evacuation Corridor Accessibility Matrix</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-900 dark:text-emerald-300">
                    NH-316 Puri-Bhubaneswar Corridor
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Paved Dual Carriage • Clear for High-Capacity Rescue Convoys
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">
                  PASSABLE (OPEN)
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-red-900 dark:text-red-300">
                    Mangalahat Coastal Bridge Approach
                  </div>
                  <div className="text-[11px] text-red-700 dark:text-red-400">
                    Submergence Threshold Reached (+1.4m Surge Depth at T-6h)
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px]">
                  IMPASSABLE (SUBMERGED)
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-amber-900 dark:text-amber-300">
                    Marine Drive (Puri - Balighai Section)
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400">
                    High Wave Wash-Away Hazard • Diverting inland via Gop Highway
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-bold text-[10px]">
                  DIVERSION ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tactical Dispatch Inbox */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-600" />
            <span>Incoming Tactical Advisory Inbox</span>
          </h2>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm space-y-3">
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 space-y-1">
              <div className="flex justify-between items-center text-[10px] text-red-700 dark:text-red-400 font-bold uppercase">
                <span>IMD / OSDMA RED BULLETIN</span>
                <span>T-36h 00m</span>
              </div>
              <p className="text-xs text-red-900 dark:text-red-200 leading-relaxed font-sans">
                Active Severe System SYS-91B making landfall near Puri. Sustained winds 186 km/h. Complete evacuation of 0-2km zone mandatory.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1">
              <div className="flex justify-between items-center text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase">
                <span>DM PURI DIRECTIVE #88</span>
                <span>T-30h 00m</span>
              </div>
              <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed font-sans">
                Controlled tripping of 33kV electrical feeders authorized. Hospital backup diesel generators engaged.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
