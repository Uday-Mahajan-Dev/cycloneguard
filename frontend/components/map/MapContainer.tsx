"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
  memo,
} from "react";
import * as maplibregl from "maplibre-gl";
import {
  ExposureResultResponse,
  InfrastructureResponse,
  StormResponse,
  SurgeSimulationResponse,
} from "@/lib/types";
import {
  Compass,
  Layers,
  Plus,
  Minus,
  RotateCcw,
  Zap,
  Hospital,
  Shield,
  Radio,
  Waves,
  Building2,
  Globe2,
  CloudSun,
  CloudRain,
  Navigation,
  Crosshair,
} from "lucide-react";
import { getPuri3DBuildingsGeoJSON } from "./puriBuildings";
import {
  DEFAULT_PURI_FLOOD_GEOJSON,
  DEFAULT_INFRASTRUCTURE_ASSETS,
  DEFAULT_EXPOSED_ASSETS,
} from "@/lib/stormGeometry";
import {
  getFaniIMDTrackGeoJSON,
  FANI_TRACK_WAYPOINTS,
} from "@/lib/demoTrack";
import { useRainViewerTiles } from "@/hooks/useRainViewerTiles";
import LiveRadarPlayback from "./LiveRadarPlayback";

type MapLibreMap = maplibregl.Map;

export interface MapContainerRef {
  flyToLocation: (
    lat: number,
    lon: number,
    zoom?: number,
    pitch?: number,
    bearing?: number
  ) => void;
  resetCamera: () => void;
  recenterOnStorm: () => void;
}

interface MapContainerProps {
  storm: StormResponse | null;
  simulation: SurgeSimulationResponse | null;
  infrastructure: InfrastructureResponse[];
  exposedAssets: ExposureResultResponse[];
  selectedAsset: InfrastructureResponse | null;
  onSelectAsset?: (asset: InfrastructureResponse | null) => void;
  is3dTerrain?: boolean;
  onToggle3dTerrain?: () => void;
  targetCoords?: {
    lat: number;
    lon: number;
    zoom?: number;
    pitch?: number;
    bearing?: number;
  } | null;
  isMarineMode?: boolean;
}

// Master list of all storm, trajectory, cone, flood, and infrastructure layer IDs
const ALL_STORM_LAYER_IDS = [
  "cyclone-satellite-image-layer",
  "cyclone-cloud-layer",
  "forecast-cone-layer",
  "forecast-cone-fill",
  "track-line-glow",
  "track-line-layer",
  "storm-track-line",
  "waypoint-nodes-layer",
  "flood-inundation-fill",
  "flood-surge-fill",
  "flood-extrusion-3d",
  "flood-outline-line",
  "infra-halo-layer",
  "infra-points-layer",
  // Official IMD Cyclone Fani Trajectory & Swath Stack
  "fani-cone-swath-fill",
  "fani-cone-swath-outline",
  "fani-track-line-glow",
  "fani-track-line",
  "fani-past-track-line",
  "fani-forecast-track-line",
  "fani-track-center-core",
  "fani-range-rings-line",
  "fani-stage-circles",
  "demo-track-swath",
  "demo-track-past",
  "demo-track-forecast",
  "demo-track-eye",
  "demo-track-landfall",
];

// Helper to get formatted NASA GIBS date string (YYYY-MM-DD)
function getGibsDateString(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 1. High-Resolution ESRI World Imagery Satellite Style
const SATELLITE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    "esri-satellite": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: "&copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    },
    "esri-satellite-labels": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "esri-satellite-layer",
      type: "raster",
      source: "esri-satellite",
      minzoom: 0,
      maxzoom: 22,
    },
    {
      id: "esri-satellite-labels-layer",
      type: "raster",
      source: "esri-satellite-labels",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

// 2. High-Contrast Tactical Dark Mode Style
const DARK_RASTER_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    "base-dark": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: 16,
      attribution: "&copy; Esri, DeLorme, NAVTEQ &copy; OpenStreetMap contributors",
    },
    "base-dark-labels": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: 16,
    },
  },
  layers: [
    {
      id: "base-dark-layer",
      type: "raster",
      source: "base-dark",
      minzoom: 0,
      maxzoom: 22,
    },
    {
      id: "base-dark-labels-layer",
      type: "raster",
      source: "base-dark-labels",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

export type BasemapMode = "satellite" | "dark";

const MapContainer = forwardRef<MapContainerRef, MapContainerProps>(
  function MapContainer(
    {
      storm,
      simulation,
      infrastructure,
      exposedAssets,
      selectedAsset,
      onSelectAsset,
      is3dTerrain = true,
      onToggle3dTerrain,
      targetCoords,
      isMarineMode = false,
    },
    ref
  ) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapLibreMap | null>(null);

    const [mapLoaded, setMapLoaded] = useState(false);
    const [basemapMode, setBasemapMode] = useState<BasemapMode>("satellite");
    const [is3dBuildings, setIs3dBuildings] = useState(true);
    const [isNasaClouds, setIsNasaClouds] = useState(false);
    const [isLiveRadar, setIsLiveRadar] = useState(true);
    const [isCycloneSatelliteOverlay, setIsCycloneSatelliteOverlay] = useState(true);
    const [weatherOverlayOpacity, setWeatherOverlayOpacity] = useState(0.75);

    // Auto-fetch RainViewer live radar timestamps safely with 10-minute auto-refresh
    const {
      tileUrl: validRainViewerUrl,
      timestamps: liveRadarTimestamps,
    } = useRainViewerTiles();

    // Radar playback loop state
    const [radarTimestamps, setRadarTimestamps] = useState<number[]>([
      1711365000, 1711365600, 1711366200, 1711366800, 1711368000,
    ]);
    const [currentFrameIndex, setCurrentFrameIndex] = useState(4);
    const [isPlayingRadar, setIsPlayingRadar] = useState(false);
    const [showRadarPlayer, setShowRadarPlayer] = useState(true);

    const [pitchVal, setPitchVal] = useState(42);
    const [bearingVal, setBearingVal] = useState(-15);

    const [hoverTooltip, setHoverTooltip] = useState<{
      x: number;
      y: number;
      data: any;
      type: "infrastructure" | "flood" | "track" | "building" | "cone";
    } | null>(null);

    // Sync live timestamps from hook
    useEffect(() => {
      if (liveRadarTimestamps && liveRadarTimestamps.length > 0) {
        const last5 = liveRadarTimestamps.slice(-5);
        setRadarTimestamps(last5);
        setCurrentFrameIndex(last5.length - 1);
      }
    }, [liveRadarTimestamps]);

    // Playback Loop Timer
    useEffect(() => {
      if (!isPlayingRadar) return;
      const interval = setInterval(() => {
        setCurrentFrameIndex((prev) => (prev + 1) % radarTimestamps.length);
      }, 1200);
      return () => clearInterval(interval);
    }, [isPlayingRadar, radarTimestamps.length]);

    // HTML Markers Ref
    const htmlMarkersRef = useRef<maplibregl.Marker[]>([]);

    // Explicit camera flying functions
    const flyToLocation = useCallback(
      (lat: number, lon: number, zoom = 5.8, pitch = 42, bearing = -15) => {
        const map = mapRef.current;
        if (!map) return;
        map.flyTo({
          center: [lon, lat],
          zoom,
          pitch,
          bearing,
          duration: 1800,
          essential: true,
        });
      },
      []
    );

    const recenterOnStorm = useCallback(() => {
      flyToLocation(19.5, 86.8, 5.8, 42, -15);
    }, [flyToLocation]);

    const resetCamera = useCallback(() => {
      recenterOnStorm();
    }, [recenterOnStorm]);

    useImperativeHandle(
      ref,
      () => ({
        flyToLocation,
        resetCamera,
        recenterOnStorm,
      }),
      [flyToLocation, resetCamera, recenterOnStorm]
    );

    // Native HTML Markers Injection (Clear all in Marine Mode; inject in Demo Mode)
    const injectHTMLMarkers = useCallback(
      (map: MapLibreMap, isMarine = isMarineMode) => {
        if (!map) return;

        // Clean up previous markers
        htmlMarkersRef.current.forEach((m) => m.remove());
        htmlMarkersRef.current = [];

        if (isMarine) {
          // In Marine Mode: Complete clean LIVE satellite view with radar overlay (no demo pins/rings)
          return;
        }

        // ─── 1. OFFICIAL IMD CYCLONE FANI TIMELINE CALLOUT BADGES & RED CYCLONE SPIRALS ───
        FANI_TRACK_WAYPOINTS.forEach((wp) => {
          const isCurrent = wp.isCurrentPosition || false;
          const nodeEl = document.createElement("div");
          nodeEl.className = "flex items-center select-none cursor-pointer group";
          nodeEl.style.position = "relative";
          nodeEl.style.width = "0px";
          nodeEl.style.height = "0px";

          const ringBorderColor = isCurrent ? "#f59e0b" : "#ffffff";
          const ringShadow = isCurrent
            ? "0 0 20px #f59e0b, 0 0 35px rgba(220, 38, 38, 0.95)"
            : "0 0 16px rgba(220, 38, 38, 0.95)";

          nodeEl.innerHTML = `
            <!-- Red Cyclone Spiral Badge Exactly Centered at (0,0) so connecting line passes directly through its center -->
            <div style="position: absolute; left: -18px; top: -18px; width: 36px; height: 36px; border-radius: 9999px; background: #dc2626; border: 2.5px solid ${ringBorderColor}; box-shadow: ${ringShadow}; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 10px; font-family: monospace; z-index: 15; transition: transform 0.2s;">
              <svg style="position: absolute; inset: -2px; width: 36px; height: 36px; color: rgba(255,255,255,0.85); animation: spin 3s linear infinite;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2a10 10 0 0 1 10 10c0 3.3-1.6 6.3-4.1 8.1M12 22a10 10 0 0 1-10-10c0-3.3 1.6-6.3 4.1-8.1"/>
              </svg>
              <span style="position: relative; z-index: 2; text-shadow: 0 1px 3px rgba(0,0,0,0.9);">${wp.stageCode}</span>
            </div>

            <!-- White Leader Line (from badge edge x=18px to x=40px) -->
            <div style="position: absolute; left: 18px; top: -1px; width: 22px; height: 2px; background: ${ringBorderColor}; box-shadow: 0 1px 4px rgba(0,0,0,0.9); z-index: 10;"></div>

            <!-- Dark Callout Tag with Exact Time Label -->
            <div style="position: absolute; left: 40px; top: -14px; padding: 3px 8px; background: rgba(0, 0, 0, 0.92); border: 1.5px solid ${ringBorderColor}; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.85); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 800; color: #ffffff; white-space: nowrap; backdrop-filter: blur(4px); z-index: 10;">
              ${wp.timeLabel} ${wp.isLandfall ? "• LANDFALL" : ""}
            </div>
          `;

          nodeEl.addEventListener("click", () => {
            flyToLocation(wp.coordinates[1], wp.coordinates[0], 9.5, 50, -20);
          });

          // anchor: "center" ensures the 36px circle's geometric center matches wp.coordinates exactly
          const marker = new maplibregl.Marker({ element: nodeEl, anchor: "center" })
            .setLngLat(wp.coordinates)
            .addTo(map);

          htmlMarkersRef.current.push(marker);
        });

        // ─── 2. HIGHLIGHT ACTIVE CURRENT CYCLONE POSITION (LIVE PULSING EYE BEACON) ───
        const currentLon = storm?.current_lon || 85.83;
        const currentLat = storm?.current_lat || 19.805;

        const eyeEl = document.createElement("div");
        eyeEl.className = "flex items-center justify-center select-none cursor-pointer group";
        eyeEl.style.position = "relative";
        eyeEl.style.width = "0px";
        eyeEl.style.height = "0px";
        eyeEl.style.zIndex = "35";

        eyeEl.innerHTML = `
          <!-- Multi-Layer Pulsing Radar Shockwaves -->
          <div style="position: absolute; left: -45px; top: -45px; width: 90px; height: 90px; border-radius: 9999px; background: rgba(239, 68, 68, 0.25); border: 2px solid #ef4444; animation: ping 2.2s cubic-bezier(0, 0, 0.2, 1) infinite; pointer-events: none;"></div>
          <div style="position: absolute; left: -30px; top: -30px; width: 60px; height: 60px; border-radius: 9999px; background: rgba(244, 63, 94, 0.35); border: 2px solid #ffffff; animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; pointer-events: none;"></div>

          <!-- Large Rotating Cyclone Eye Core Badge (48px) -->
          <div style="position: absolute; left: -24px; top: -24px; width: 48px; height: 48px; border-radius: 9999px; background: radial-gradient(circle, #ff0055 0%, #dc2626 70%, #991b1b 100%); border: 3px solid #ffffff; box-shadow: 0 0 25px rgba(255, 0, 85, 0.95), 0 0 50px rgba(239, 68, 68, 0.7); display: flex; align-items: center; justify-content: center; z-index: 25; transition: transform 0.2s;">
            <svg style="position: absolute; inset: -4px; width: 50px; height: 50px; color: #ffffff; animation: spin 2s linear infinite;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8">
              <circle cx="12" cy="12" r="3.5" fill="#ffffff"/>
              <path d="M12 2a10 10 0 0 1 10 10c0 3.3-1.6 6.3-4.1 8.1M12 22a10 10 0 0 1-10-10c0-3.3 1.6-6.3 4.1-8.1"/>
            </svg>
            <span style="position: relative; z-index: 5; color: #ffffff; font-weight: 900; font-size: 11px; text-shadow: 0 2px 4px rgba(0,0,0,0.9); font-family: monospace;">EYE</span>
          </div>

          <!-- Floating Tactical HUD Box Above Current Eye -->
          <div style="position: absolute; left: -115px; bottom: 32px; width: 230px; padding: 6px 10px; background: rgba(15, 23, 42, 0.95); border: 2px solid #ef4444; border-radius: 6px; box-shadow: 0 8px 24px rgba(0,0,0,0.9), 0 0 20px rgba(239, 68, 68, 0.5); text-align: center; backdrop-filter: blur(8px); z-index: 40; pointer-events: auto;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 6px; color: #ef4444; font-weight: 900; font-size: 11px; letter-spacing: 0.05em;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 9999px; background: #ef4444; box-shadow: 0 0 8px #ef4444;" class="animate-ping"></span>
              CURRENT STORM POSITION
            </div>
            <div style="color: #f8fafc; font-weight: 800; font-size: 12px; margin-top: 1px;">
              ${storm?.name || "Active System SYS-91B"}
            </div>
            <div style="display: flex; justify-content: center; gap: 8px; color: #cbd5e1; font-size: 10px; margin-top: 2px; font-weight: 600; font-family: monospace;">
              <span>💨 ${storm?.max_wind_kmh || 186} km/h</span>
              <span>🌊 Surge 3.5m</span>
              <span>📍 ${currentLat.toFixed(2)}°N, ${currentLon.toFixed(2)}°E</span>
            </div>
          </div>
        `;

        eyeEl.addEventListener("click", () => {
          flyToLocation(currentLat, currentLon, 10.5, 55, -20);
        });

        const eyeMarker = new maplibregl.Marker({ element: eyeEl, anchor: "center" })
          .setLngLat([currentLon, currentLat])
          .addTo(map);

        htmlMarkersRef.current.push(eyeMarker);

        // ─── 3. CRITICAL INFRASTRUCTURE ASSET MARKERS ───
        const rawInfra =
          infrastructure && infrastructure.length > 0
            ? infrastructure
            : DEFAULT_INFRASTRUCTURE_ASSETS;
        const rawExposed =
          exposedAssets && exposedAssets.length > 0
            ? exposedAssets
            : DEFAULT_EXPOSED_ASSETS;

        rawInfra.forEach((infra) => {
          const coords = infra.geom_geojson?.coordinates;
          if (!coords || coords.length < 2) return;

          const exposed = rawExposed.find(
            (e) => e.infrastructure_id === infra.id || e.name === infra.name
          );

          let icon = "⚡";
          let bgColor = "#dc2626";
          let borderColor = "#ef4444";
          let textColor = "#fca5a5";

          if (infra.type === "hospital") {
            icon = "🏥";
            bgColor = "#d97706";
            borderColor = "#f59e0b";
            textColor = "#fde68a";
          } else if (infra.type === "shelter") {
            icon = "🏠";
            bgColor = "#059669";
            borderColor = "#10b981";
            textColor = "#a7f3d0";
          } else if (infra.type === "telecom" || infra.type === "telecom_tower") {
            icon = "📡";
            bgColor = "#7c3aed";
            borderColor = "#8b5cf6";
            textColor = "#ddd6fe";
          }

          const assetEl = document.createElement("div");
          assetEl.className =
            "flex flex-col items-center cursor-pointer select-none hover:scale-105 transition-transform";
          assetEl.innerHTML = `
            <div style="position: relative; width: 30px; height: 30px; border-radius: 9999px; background: ${bgColor}; border: 2px solid #ffffff; box-shadow: 0 0 12px ${borderColor}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 13px;">
              ${icon}
            </div>
            <div style="margin-top: 3px; padding: 2px 6px; background: rgba(15, 23, 42, 0.95); border: 1px solid ${borderColor}; border-radius: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.6); font-family: monospace; font-size: 10px; font-weight: 700; color: ${textColor}; white-space: nowrap; backdrop-filter: blur(4px);">
              ${infra.name}
            </div>
          `;

          assetEl.addEventListener("click", (e) => {
            e.stopPropagation();
            if (onSelectAsset) {
              onSelectAsset(infra);
            }
          });

          const marker = new maplibregl.Marker({ element: assetEl })
            .setLngLat([coords[0], coords[1]])
            .addTo(map);

          htmlMarkersRef.current.push(marker);
        });
      },
      [isMarineMode, infrastructure, exposedAssets, onSelectAsset, flyToLocation, storm]
    );

    // Setup AWS Terrarium 3D Terrain & MapLibre Sky
    const setupTerrainAndAtmosphere = useCallback(
      (map: MapLibreMap) => {
        if (!map) return;

        // Terrain DEM source
        if (!map.getSource("terrain-dem")) {
          try {
            map.addSource("terrain-dem", {
              type: "raster-dem",
              tiles: [
                "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
              ],
              encoding: "terrarium",
              tileSize: 256,
              maxzoom: 14,
            });
          } catch (e) {
            console.warn("Terrain source add notice:", e);
          }
        }

        // 3D Exaggeration
        if (is3dTerrain) {
          try {
            map.setTerrain({ source: "terrain-dem", exaggeration: 3.0 });
          } catch (e) {
            console.warn("Terrain set notice:", e);
          }
        } else {
          try {
            map.setTerrain(null as any);
          } catch (_) {}
        }

        // MapLibre Sky & Atmosphere
        try {
          map.setSky({
            "sky-color": "#020617",
            "horizon-color": basemapMode === "satellite" ? "#1e293b" : "#0f172a",
            "fog-color": "#0f172a",
            "fog-ground-blend": 0.5,
            "horizon-fog-blend": 0.8,
            "sky-horizon-blend": 0.8,
            "atmosphere-blend": 0.8,
          });
        } catch (e) {
          console.warn("Atmosphere sky notice:", e);
        }
      },
      [is3dTerrain, basemapMode]
    );

    // Master update and synchronizer for all GeoJSON & Overlay layers
    const updateAllMapLayers = useCallback(() => {
      const map = mapRef.current;
      if (!map || !map.isStyleLoaded()) return;

      // ─── 1. IF IN MARINE MODE: DESTROY / HIDE ALL STORM, CONE, FLOOD, & INFRA LAYERS ───
      if (isMarineMode) {
        ALL_STORM_LAYER_IDS.forEach((id) => {
          if (map.getLayer(id)) {
            map.setLayoutProperty(id, "visibility", "none");
          }
        });
        htmlMarkersRef.current.forEach((m) => m.remove());
        htmlMarkersRef.current = [];
      }

      // ─── 2. NASA GIBS TRUECOLOR CLOUDS FEED (Free, zero keys, zero 400 errors) ───
      const gibsSourceId = "nasa-gibs-clouds-source";
      const gibsLayerId = "nasa-gibs-clouds-layer";
      const gibsDate = getGibsDateString();
      const gibsTileUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${gibsDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
      const isGibsVisible = isMarineMode || isNasaClouds;

      if (!map.getSource(gibsSourceId)) {
        try {
          map.addSource(gibsSourceId, {
            type: "raster",
            tiles: [gibsTileUrl],
            tileSize: 256,
            maxzoom: 9,
            attribution: "&copy; NASA EOSDIS GIBS",
          });
        } catch (e) {
          console.warn("NASA GIBS source notice:", e);
        }
      }

      if (map.getSource(gibsSourceId) && !map.getLayer(gibsLayerId)) {
        try {
          map.addLayer({
            id: gibsLayerId,
            type: "raster",
            source: gibsSourceId,
            layout: {
              visibility: isGibsVisible ? "visible" : "none",
            },
            paint: {
              "raster-opacity": weatherOverlayOpacity * 0.75,
            },
          });
        } catch (e) {
          console.warn("NASA GIBS layer notice:", e);
        }
      } else if (map.getLayer(gibsLayerId)) {
        map.setLayoutProperty(
          gibsLayerId,
          "visibility",
          isGibsVisible ? "visible" : "none"
        );
        map.setPaintProperty(
          gibsLayerId,
          "raster-opacity",
          weatherOverlayOpacity * 0.75
        );
      }

      // ─── 3. LIVE RAINVIEWER WEATHER RADAR FEED (Uses valid timestamp, zero /now/ 400s) ───
      const currentTimestamp =
        radarTimestamps[currentFrameIndex] ||
        radarTimestamps[radarTimestamps.length - 1] ||
        1711368000;
      const radarSourceId = "rainviewer-radar-source";
      const radarLayerId = "rainviewer-radar-layer";
      const radarTileUrl =
        validRainViewerUrl ||
        `https://tilecache.rainviewer.com/v2/radar/${currentTimestamp}/256/{z}/{x}/{y}/2/1_1.png`;
      const isRadarVisible = isMarineMode || isLiveRadar;

      if (!map.getSource(radarSourceId)) {
        try {
          map.addSource(radarSourceId, {
            type: "raster",
            tiles: [radarTileUrl],
            tileSize: 256,
            maxzoom: 12,
            attribution: "&copy; RainViewer Live Weather Radar",
          });
        } catch (e) {
          console.warn("RainViewer source notice:", e);
        }
      }

      if (map.getSource(radarSourceId) && !map.getLayer(radarLayerId)) {
        try {
          map.addLayer({
            id: radarLayerId,
            type: "raster",
            source: radarSourceId,
            layout: {
              visibility: isRadarVisible ? "visible" : "none",
            },
            paint: {
              "raster-opacity": weatherOverlayOpacity * 0.85,
            },
          });
        } catch (e) {
          console.warn("RainViewer layer notice:", e);
        }
      } else if (map.getLayer(radarLayerId)) {
        map.setLayoutProperty(
          radarLayerId,
          "visibility",
          isRadarVisible ? "visible" : "none"
        );
        map.setPaintProperty(
          radarLayerId,
          "raster-opacity",
          weatherOverlayOpacity * 0.85
        );
      }

      // ─── 4. 3D EXTRUDED BUILDINGS LAYER ───
      const buildingsSourceId = "3d-buildings-source";
      const buildingsLayerId = "3d-buildings-extrusion";

      if (!map.getSource(buildingsSourceId)) {
        try {
          map.addSource(buildingsSourceId, {
            type: "geojson",
            data: getPuri3DBuildingsGeoJSON() as any,
          });
        } catch (e) {}
      }

      if (map.getSource(buildingsSourceId) && !map.getLayer(buildingsLayerId)) {
        try {
          map.addLayer({
            id: buildingsLayerId,
            type: "fill-extrusion",
            source: buildingsSourceId,
            layout: {
              visibility: is3dBuildings ? "visible" : "none",
            },
            paint: {
              "fill-extrusion-color": [
                "case",
                ["==", ["get", "building_type"], "hospital_campus"],
                "#f97316",
                ["==", ["get", "building_type"], "substation_grid"],
                "#ef4444",
                ["==", ["get", "building_type"], "hotel_resort"],
                "#06b6d4",
                ["==", ["get", "building_type"], "shelter_civic"],
                "#10b981",
                basemapMode === "satellite" ? "#cbd5e1" : "#1e293b",
              ],
              "fill-extrusion-height": [
                "coalesce",
                ["get", "render_height"],
                ["get", "height"],
                18,
              ],
              "fill-extrusion-base": [
                "coalesce",
                ["get", "render_min_height"],
                0,
              ],
              "fill-extrusion-opacity": 0.85,
            },
          });
        } catch (e) {}
      } else if (map.getLayer(buildingsLayerId)) {
        map.setLayoutProperty(
          buildingsLayerId,
          "visibility",
          is3dBuildings ? "visible" : "none"
        );
      }

      // If in Marine Mode, exit here: no storm trajectory, cone, flood, or pins rendered
      if (isMarineMode) {
        return;
      }

      // ─── 5. DEMO MODE: CYCLONE FANI IMD TRAJECTORY & RED UNCERTAINTY CONE ───
      const isStormVisible = !isMarineMode;
      const faniTrackSourceId = "fani-imd-track-source";
      const currentLon = storm?.current_lon || 85.83;
      const currentLat = storm?.current_lat || 19.805;
      const faniTrackGeoJson = getFaniIMDTrackGeoJSON(currentLon, currentLat);

      if (!map.getSource(faniTrackSourceId)) {
        try {
          map.addSource(faniTrackSourceId, {
            type: "geojson",
            data: faniTrackGeoJson as any,
          });
        } catch (e) {
          console.warn("Fani track source notice:", e);
        }
      } else {
        (map.getSource(faniTrackSourceId) as maplibregl.GeoJSONSource).setData(
          faniTrackGeoJson as any
        );
      }

      // 5a. IMD Red/Crimson Uncertainty Cone Swath (Fill)
      if (map.getSource(faniTrackSourceId) && !map.getLayer("fani-cone-swath-fill")) {
        try {
          map.addLayer({
            id: "fani-cone-swath-fill",
            type: "fill",
            source: faniTrackSourceId,
            filter: ["==", "layer_type", "cone_swath"],
            layout: {
              visibility: isStormVisible ? "visible" : "none",
            },
            paint: {
              "fill-color": "#dc2626",
              "fill-opacity": 0.38,
            },
          });
        } catch (e) {}
      } else if (map.getLayer("fani-cone-swath-fill")) {
        map.setLayoutProperty(
          "fani-cone-swath-fill",
          "visibility",
          isStormVisible ? "visible" : "none"
        );
      }

      // 5b. IMD White Crisp Cone Outline
      if (map.getSource(faniTrackSourceId) && !map.getLayer("fani-cone-swath-outline")) {
        try {
          map.addLayer({
            id: "fani-cone-swath-outline",
            type: "line",
            source: faniTrackSourceId,
            filter: ["==", "layer_type", "cone_swath"],
            layout: {
              visibility: isStormVisible ? "visible" : "none",
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#ffffff",
              "line-width": 2.5,
              "line-opacity": 0.95,
            },
          });
        } catch (e) {}
      } else if (map.getLayer("fani-cone-swath-outline")) {
        map.setLayoutProperty(
          "fani-cone-swath-outline",
          "visibility",
          isStormVisible ? "visible" : "none"
        );
      }

      // 5c. Concentric Range Rings around Active Cyclone Eye
      if (map.getSource(faniTrackSourceId) && !map.getLayer("fani-range-rings-line")) {
        try {
          map.addLayer({
            id: "fani-range-rings-line",
            type: "line",
            source: faniTrackSourceId,
            filter: ["==", "layer_type", "range_ring"],
            layout: {
              visibility: isStormVisible ? "visible" : "none",
            },
            paint: {
              "line-color": "#38bdf8",
              "line-width": 1.8,
              "line-dasharray": [3, 3],
              "line-opacity": 0.65,
            },
          });
        } catch (e) {}
      } else if (map.getLayer("fani-range-rings-line")) {
        map.setLayoutProperty(
          "fani-range-rings-line",
          "visibility",
          isStormVisible ? "visible" : "none"
        );
      }

      // 5d. Continuous Trajectory Line Drop Shadow Glow
      if (map.getSource(faniTrackSourceId) && !map.getLayer("fani-track-line-glow")) {
        try {
          map.addLayer({
            id: "fani-track-line-glow",
            type: "line",
            source: faniTrackSourceId,
            filter: ["==", "layer_type", "trajectory_line"],
            layout: {
              visibility: isStormVisible ? "visible" : "none",
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#000000",
              "line-width": 8,
              "line-blur": 3,
              "line-opacity": 0.75,
            },
          });
        } catch (e) {}
      } else if (map.getLayer("fani-track-line-glow")) {
        map.setLayoutProperty(
          "fani-track-line-glow",
          "visibility",
          isStormVisible ? "visible" : "none"
        );
      }

      // 5e. Solid Observed Past Track Line (Connecting Genesis -> 1st May -> 2nd May -> Current Position)
      if (map.getSource(faniTrackSourceId) && !map.getLayer("fani-past-track-line")) {
        try {
          map.addLayer({
            id: "fani-past-track-line",
            type: "line",
            source: faniTrackSourceId,
            filter: ["==", "layer_type", "past_track_line"],
            layout: {
              visibility: isStormVisible ? "visible" : "none",
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#0f172a",
              "line-width": 4.5,
            },
          });
        } catch (e) {}
      } else if (map.getLayer("fani-past-track-line")) {
        map.setLayoutProperty(
          "fani-past-track-line",
          "visibility",
          isStormVisible ? "visible" : "none"
        );
      }

      // 5f. Dashed Forecast Track Line (Connecting Current Position -> 3rd May -> 4th May -> 5th May)
      if (map.getSource(faniTrackSourceId) && !map.getLayer("fani-forecast-track-line")) {
        try {
          map.addLayer({
            id: "fani-forecast-track-line",
            type: "line",
            source: faniTrackSourceId,
            filter: ["==", "layer_type", "forecast_track_line"],
            layout: {
              visibility: isStormVisible ? "visible" : "none",
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#0f172a",
              "line-width": 4.0,
              "line-dasharray": [3, 2],
            },
          });
        } catch (e) {}
      } else if (map.getLayer("fani-forecast-track-line")) {
        map.setLayoutProperty(
          "fani-forecast-track-line",
          "visibility",
          isStormVisible ? "visible" : "none"
        );
      }

      // 5g. Contrasting Inner Spine Core Thread (Connecting all spiral badge centers)
      if (map.getSource(faniTrackSourceId) && !map.getLayer("fani-track-center-core")) {
        try {
          map.addLayer({
            id: "fani-track-center-core",
            type: "line",
            source: faniTrackSourceId,
            filter: ["==", "layer_type", "trajectory_line"],
            layout: {
              visibility: isStormVisible ? "visible" : "none",
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#ef4444",
              "line-width": 1.5,
            },
          });
        } catch (e) {}
      } else if (map.getLayer("fani-track-center-core")) {
        map.setLayoutProperty(
          "fani-track-center-core",
          "visibility",
          isStormVisible ? "visible" : "none"
        );
      }

      // ─── 6. BLUE HYDRODYNAMIC FLOOD INUNDATION POLYGON ───
      const floodGeoJson =
        simulation?.flood_polygon_geojson &&
        simulation.flood_polygon_geojson.features?.length > 0
          ? simulation.flood_polygon_geojson
          : DEFAULT_PURI_FLOOD_GEOJSON;

      const floodSourceId = "flood-mesh-source";
      const floodFillLayerId = "flood-inundation-fill";
      const floodExtrusionId = "flood-extrusion-3d";
      const floodOutlineId = "flood-outline-line";

      if (!map.getSource(floodSourceId)) {
        try {
          map.addSource(floodSourceId, {
            type: "geojson",
            data: floodGeoJson as any,
          });
        } catch (e) {
          console.warn("Flood mesh source notice:", e);
        }
      } else {
        (map.getSource(floodSourceId) as maplibregl.GeoJSONSource).setData(
          floodGeoJson as any
        );
      }

      if (map.getSource(floodSourceId) && !map.getLayer(floodFillLayerId)) {
        try {
          map.addLayer({
            id: floodFillLayerId,
            type: "fill",
            source: floodSourceId,
            layout: {
              visibility: isStormVisible ? "visible" : "none",
            },
            paint: {
              "fill-color": [
                "step",
                ["coalesce", ["get", "surge_height_m"], ["get", "flood_depth_m"], 3.5],
                "#0284c7", // < 1.5m -> blue
                1.5,
                "#7c3aed", // 1.5m - 2.5m -> violet
                2.5,
                "#e11d48", // > 2.5m -> deep magenta/red-tint
              ],
              "fill-opacity": 0.65,
              "fill-outline-color": [
                "step",
                ["coalesce", ["get", "surge_height_m"], ["get", "flood_depth_m"], 3.5],
                "#38bdf8",
                1.5,
                "#c084fc",
                2.5,
                "#fb7185",
              ],
            },
          });

          map.on("mousemove", floodFillLayerId, (e) => {
            if (e.features && e.features[0]) {
              setHoverTooltip({
                x: e.point.x,
                y: e.point.y,
                data: e.features[0].properties,
                type: "flood",
              });
            }
          });

          map.on("mouseleave", floodFillLayerId, () => {
            setHoverTooltip((prev) => (prev?.type === "flood" ? null : prev));
          });
        } catch (e) {
          console.warn("Flood fill layer notice:", e);
        }
      } else if (map.getLayer(floodFillLayerId)) {
        map.setLayoutProperty(
          floodFillLayerId,
          "visibility",
          isStormVisible ? "visible" : "none"
        );
        map.setPaintProperty(floodFillLayerId, "fill-color", [
          "step",
          ["coalesce", ["get", "surge_height_m"], ["get", "flood_depth_m"], 3.5],
          "#0284c7",
          1.5,
          "#7c3aed",
          2.5,
          "#e11d48",
        ]);
      }

      if (map.getSource(floodSourceId) && !map.getLayer(floodExtrusionId)) {
        try {
          map.addLayer({
            id: floodExtrusionId,
            type: "fill-extrusion",
            source: floodSourceId,
            layout: {
              visibility: isStormVisible ? "visible" : "none",
            },
            paint: {
              "fill-extrusion-color": [
                "step",
                ["coalesce", ["get", "surge_height_m"], ["get", "flood_depth_m"], 3.5],
                "#0284c7",
                1.5,
                "#7c3aed",
                2.5,
                "#e11d48",
              ],
              "fill-extrusion-height": [
                "coalesce",
                ["get", "extrude_height"],
                35,
              ],
              "fill-extrusion-base": 0,
              "fill-extrusion-opacity": 0.45,
            },
          });
        } catch (e) {}
      } else if (map.getLayer(floodExtrusionId)) {
        map.setLayoutProperty(
          floodExtrusionId,
          "visibility",
          isStormVisible ? "visible" : "none"
        );
        map.setPaintProperty(floodExtrusionId, "fill-extrusion-color", [
          "step",
          ["coalesce", ["get", "surge_height_m"], ["get", "flood_depth_m"], 3.5],
          "#0284c7",
          1.5,
          "#7c3aed",
          2.5,
          "#e11d48",
        ]);
      }

      if (map.getSource(floodSourceId) && !map.getLayer(floodOutlineId)) {
        try {
          map.addLayer({
            id: floodOutlineId,
            type: "line",
            source: floodSourceId,
            layout: {
              visibility: isStormVisible ? "visible" : "none",
            },
            paint: {
              "line-color": [
                "step",
                ["coalesce", ["get", "surge_height_m"], ["get", "flood_depth_m"], 3.5],
                "#38bdf8",
                1.5,
                "#c084fc",
                2.5,
                "#fb7185",
              ],
              "line-width": 2,
              "line-opacity": 0.9,
            },
          });
        } catch (e) {}
      } else if (map.getLayer(floodOutlineId)) {
        map.setLayoutProperty(
          floodOutlineId,
          "visibility",
          isStormVisible ? "visible" : "none"
        );
      }

      // ─── 7. CRITICAL INFRASTRUCTURE 3D PINS ───
      const rawInfra =
        infrastructure && infrastructure.length > 0
          ? infrastructure
          : DEFAULT_INFRASTRUCTURE_ASSETS;
      const rawExposed =
        exposedAssets && exposedAssets.length > 0
          ? exposedAssets
          : DEFAULT_EXPOSED_ASSETS;

      const infraFeatures = rawInfra.map((infra) => {
        const exposed = isMarineMode
          ? null
          : rawExposed.find(
              (e) => e.infrastructure_id === infra.id || e.name === infra.name
            );
        const coords = infra.geom_geojson?.coordinates || [85.8312, 19.8049];
        return {
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: coords,
          },
          properties: {
            id: infra.id,
            name: infra.name,
            type: infra.type,
            elevation_m: infra.elevation_m || 3.5,
            district: infra.district || "Puri",
            flood_depth_m: exposed?.flood_depth_m || 0.0,
            risk_level: isMarineMode ? "Safe" : exposed?.risk_level || "Low",
            recommended_action: isMarineMode
              ? "Operational & Nominal."
              : exposed?.recommended_action || "Operational monitoring active.",
          },
        };
      });

      const infraGeoJson = {
        type: "FeatureCollection" as const,
        features: infraFeatures,
      };

      const infraSourceId = "infrastructure-source";
      const infraHaloLayerId = "infra-halo-layer";
      const infraPointsLayerId = "infra-points-layer";

      if (!map.getSource(infraSourceId)) {
        try {
          map.addSource(infraSourceId, {
            type: "geojson",
            data: infraGeoJson as any,
          });
        } catch (e) {
          console.warn("Infra source notice:", e);
        }
      } else {
        (map.getSource(infraSourceId) as maplibregl.GeoJSONSource).setData(
          infraGeoJson as any
        );
      }

      if (map.getSource(infraSourceId) && !map.getLayer(infraHaloLayerId)) {
        try {
          map.addLayer({
            id: infraHaloLayerId,
            type: "circle",
            source: infraSourceId,
            layout: {
              visibility: isMarineMode ? "none" : "visible",
            },
            paint: {
              "circle-radius": [
                "case",
                ["==", ["get", "risk_level"], "Critical"],
                20,
                14,
              ],
              "circle-color": [
                "case",
                ["==", ["get", "risk_level"], "Critical"],
                "#ef4444",
                ["==", ["get", "risk_level"], "High"],
                "#f59e0b",
                "#10b981",
              ],
              "circle-opacity": 0.45,
            },
          });
        } catch (e) {}
      } else if (map.getLayer(infraHaloLayerId)) {
        map.setLayoutProperty(
          infraHaloLayerId,
          "visibility",
          isMarineMode ? "none" : "visible"
        );
      }

      if (map.getSource(infraSourceId) && !map.getLayer(infraPointsLayerId)) {
        try {
          map.addLayer({
            id: infraPointsLayerId,
            type: "circle",
            source: infraSourceId,
            layout: {
              visibility: isMarineMode ? "none" : "visible",
            },
            paint: {
              "circle-radius": [
                "case",
                ["==", ["get", "risk_level"], "Critical"],
                10,
                8,
              ],
              "circle-color": [
                "case",
                ["==", ["get", "risk_level"], "Critical"],
                "#ef4444",
                ["==", ["get", "risk_level"], "High"],
                "#f59e0b",
                "#10b981",
              ],
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": 2.5,
            },
          });

          map.on("mouseenter", infraPointsLayerId, (e) => {
            map.getCanvas().style.cursor = "pointer";
            if (e.features && e.features[0]) {
              setHoverTooltip({
                x: e.point.x,
                y: e.point.y,
                data: e.features[0].properties,
                type: "infrastructure",
              });
            }
          });

          map.on("mouseleave", infraPointsLayerId, () => {
            map.getCanvas().style.cursor = "";
            setHoverTooltip((prev) =>
              prev?.type === "infrastructure" ? null : prev
            );
          });

          map.on("click", infraPointsLayerId, (e) => {
            if (e.features && e.features[0] && onSelectAsset) {
              const props = e.features[0].properties;
              const assetObj = rawInfra.find((i) => i.id === props.id);
              if (assetObj) onSelectAsset(assetObj);
            }
          });
        } catch (e) {
          console.warn("Infra points notice:", e);
        }
      } else if (map.getLayer(infraPointsLayerId)) {
        map.setLayoutProperty(
          infraPointsLayerId,
          "visibility",
          isMarineMode ? "none" : "visible"
        );
      }

      // Re-inject HTML markers in demo mode to keep them in sync with layers
      if (!isMarineMode) {
        injectHTMLMarkers(map, false);
      }
    }, [
      isMarineMode,
      simulation,
      infrastructure,
      exposedAssets,
      basemapMode,
      is3dBuildings,
      isNasaClouds,
      isLiveRadar,
      weatherOverlayOpacity,
      radarTimestamps,
      currentFrameIndex,
      validRainViewerUrl,
      onSelectAsset,
      injectHTMLMarkers,
      storm,
    ]);

    // Initialize MapLibre GL Map with hardcoded camera focus on Bay of Bengal / Puri corridor: [86.8, 19.5], zoom 5.8, pitch 42, bearing -15
    useEffect(() => {
      if (!mapContainerRef.current || mapRef.current) return;

      const initialStyle = SATELLITE_STYLE;

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: initialStyle,
        center: [86.8, 19.5],
        zoom: 5.8,
        pitch: 42,
        bearing: -15,
        maxPitch: 85,
        attributionControl: false,
      });

      mapRef.current = map;

      // Silently ignore 400/404 or tile network errors to keep console pristine
      map.on("error", (e: any) => {
        if (
          e?.error?.status === 404 ||
          e?.error?.status === 400 ||
          e?.tile ||
          e?.status === 400 ||
          e?.status === 404 ||
          (typeof e?.error?.message === "string" &&
            e.error.message.includes("400"))
        ) {
          return;
        }
      });

      map.on("load", () => {
        map.jumpTo({
          center: [86.8, 19.5],
          zoom: 5.8,
          pitch: 42,
          bearing: -15,
        });
        setupTerrainAndAtmosphere(map);
        updateAllMapLayers();
        injectHTMLMarkers(map, isMarineMode);
        setMapLoaded(true);
        map.resize();
      });

      map.on("rotate", () => setBearingVal(Math.round(map.getBearing())));
      map.on("pitch", () => setPitchVal(Math.round(map.getPitch())));

      const resizeObserver = new ResizeObserver(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      });
      if (mapContainerRef.current) {
        resizeObserver.observe(mapContainerRef.current);
      }

      const timer = setTimeout(() => map.resize(), 300);

      return () => {
        clearTimeout(timer);
        resizeObserver.disconnect();
        if (htmlMarkersRef.current) {
          htmlMarkersRef.current.forEach((m) => m.remove());
          htmlMarkersRef.current = [];
        }
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Switch Basemap Styles
    const handleSwitchBasemap = (mode: BasemapMode) => {
      setBasemapMode(mode);
      const map = mapRef.current;
      if (!map) return;

      let newStyle = SATELLITE_STYLE;
      if (mode === "dark") newStyle = DARK_RASTER_STYLE;

      map.setStyle(newStyle);
      map.once("style.load", () => {
        map.jumpTo({
          center: [86.8, 19.5],
          zoom: 5.8,
          pitch: 42,
          bearing: -15,
        });
        setupTerrainAndAtmosphere(map);
        updateAllMapLayers();
        injectHTMLMarkers(map, isMarineMode);
      });
    };

    // Handle Terrain Toggle
    useEffect(() => {
      const map = mapRef.current;
      if (!map || !mapLoaded) return;

      if (is3dTerrain) {
        if (!map.getSource("terrain-dem")) {
          setupTerrainAndAtmosphere(map);
        } else {
          try {
            map.setTerrain({ source: "terrain-dem", exaggeration: 3.0 });
          } catch (_) {}
        }
      } else {
        try {
          map.setTerrain(null as any);
        } catch (_) {}
      }
    }, [is3dTerrain, mapLoaded, setupTerrainAndAtmosphere]);

    // Explicit target coords change handler
    const prevCoordsRef = useRef<string | null>(null);
    useEffect(() => {
      if (!targetCoords || !mapLoaded) return;
      const key = `${targetCoords.lat}_${targetCoords.lon}_${targetCoords.zoom}_${targetCoords.pitch}`;
      if (prevCoordsRef.current === key) return;
      prevCoordsRef.current = key;
      flyToLocation(
        targetCoords.lat,
        targetCoords.lon,
        targetCoords.zoom || 5.8,
        targetCoords.pitch || 42,
        targetCoords.bearing || -15
      );
    }, [targetCoords, mapLoaded, flyToLocation]);

    // Sync GeoJSON & Overlay layers and HTML markers whenever state or props change
    useEffect(() => {
      const map = mapRef.current;
      if (!map || !mapLoaded) return;
      injectHTMLMarkers(map, isMarineMode);
      updateAllMapLayers();
    }, [
      isMarineMode,
      mapLoaded,
      storm,
      infrastructure,
      exposedAssets,
      injectHTMLMarkers,
      updateAllMapLayers,
    ]);

    return (
      <div className="relative w-full h-full min-h-[500px] overflow-hidden bg-slate-950">
        {/* Full-bleed MapLibre WebGL Canvas */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

        {/* Floating Top Radar Playback Control Widget */}
        {showRadarPlayer && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto hidden md:block">
            <LiveRadarPlayback
              isPlaying={isPlayingRadar}
              onTogglePlay={() => setIsPlayingRadar(!isPlayingRadar)}
              radarTimestamps={radarTimestamps}
              currentFrameIndex={currentFrameIndex}
              onSelectFrame={setCurrentFrameIndex}
              overlayOpacity={weatherOverlayOpacity}
              onChangeOpacity={setWeatherOverlayOpacity}
              isRadarActive={isLiveRadar}
              onToggleRadar={() => setIsLiveRadar(!isLiveRadar)}
              isNasaCloudsActive={isNasaClouds}
              onToggleNasaClouds={() => setIsNasaClouds(!isNasaClouds)}
              isCycloneOverlayActive={isCycloneSatelliteOverlay}
              onToggleCycloneOverlay={() =>
                setIsCycloneSatelliteOverlay(!isCycloneSatelliteOverlay)
              }
            />
          </div>
        )}

        {/* Floating Quick Action Button: [ 🎯 Recenter on Storm ] */}
        <div className="absolute top-4 left-[370px] z-20 pointer-events-auto hidden lg:block">
          <button
            onClick={recenterOnStorm}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-red-500/80 text-white font-mono text-xs font-bold shadow-2xl transition-all cursor-pointer hover:border-red-400"
            title="Recenter Camera on Cyclone Fani Threat Corridor"
          >
            <Crosshair className="w-4 h-4 text-red-400 animate-spin" />
            <span>🎯 Recenter on Storm</span>
          </button>
        </div>

        {/* Tactical Floating HUD Controls (Bottom Center) */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 pointer-events-auto max-w-[95vw] overflow-x-auto p-1">
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-2xl flex items-center gap-2 text-xs font-mono text-slate-200 shrink-0">
            {/* Compass / Orientation */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 border-r border-slate-700">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>{bearingVal}°</span>
            </div>

            {/* Pitch Gauge */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 border-r border-slate-700 text-cyan-300">
              <span>PITCH: {pitchVal}°</span>
            </div>

            {/* Basemap Switcher (Satellite / Dark) */}
            <div className="flex items-center gap-1 px-2 border-r border-slate-700">
              <button
                onClick={() => handleSwitchBasemap("satellite")}
                type="button"
                className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  basemapMode === "satellite"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="High-Resolution Satellite Imagery"
              >
                <Globe2 className="w-3 h-3" />
                <span>SATELLITE</span>
              </button>

              <button
                onClick={() => handleSwitchBasemap("dark")}
                type="button"
                className={`px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                  basemapMode === "dark"
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Tactical Dark Map"
              >
                <span>DARK</span>
              </button>
            </div>

            {/* NASA GIBS Clouds Toggle */}
            <button
              onClick={() => setIsNasaClouds(!isNasaClouds)}
              type="button"
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isNasaClouds
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
              title="Toggle NASA GIBS Satellite Clouds"
            >
              <CloudSun className="w-3.5 h-3.5" />
              <span>NASA CLOUDS</span>
            </button>

            {/* Live RainViewer Doppler Radar Toggle */}
            <button
              onClick={() => setIsLiveRadar(!isLiveRadar)}
              type="button"
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isLiveRadar
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
              title="Toggle RainViewer Live Doppler Radar / Universal Satellite"
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>LIVE RADAR</span>
            </button>

            {/* 3D Terrain Toggle */}
            <button
              onClick={onToggle3dTerrain}
              type="button"
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                is3dTerrain
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
              title="AWS Terrarium 3D Elevation Mesh (3.0x Exaggeration)"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3D TERRAIN {is3dTerrain ? "3.0X" : "OFF"}</span>
            </button>

            {/* 3D Buildings Toggle */}
            <button
              onClick={() => setIs3dBuildings(!is3dBuildings)}
              type="button"
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                is3dBuildings
                  ? "bg-indigo-600 text-white font-bold shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
              title="Toggle 3D Extruded Building Footprints"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>3D BUILDINGS</span>
            </button>

            {/* Recenter Button (Mobile & HUD) */}
            <button
              onClick={recenterOnStorm}
              type="button"
              className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-300 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
              title="Recenter on Cyclone Fani Threat Zone"
            >
              <Crosshair className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">RECENTER</span>
            </button>

            {/* Zoom In / Out */}
            <button
              onClick={() => mapRef.current?.zoomIn({ duration: 300 })}
              type="button"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => mapRef.current?.zoomOut({ duration: 300 })}
              type="button"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Hover Tooltip Overlay */}
        {hoverTooltip && hoverTooltip.data && (
          <div
            className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
            style={{ left: hoverTooltip.x, top: hoverTooltip.y }}
          >
            {/* Infrastructure Asset Tooltip */}
            {hoverTooltip.type === "infrastructure" && (
              <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-3.5 shadow-2xl min-w-[280px] text-xs text-slate-200 font-mono">
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                  <div className="flex items-center gap-1.5 font-bold truncate">
                    {hoverTooltip.data.type === "power_substation" && (
                      <Zap className="w-4 h-4 text-red-500" />
                    )}
                    {hoverTooltip.data.type === "hospital" && (
                      <Hospital className="w-4 h-4 text-orange-500" />
                    )}
                    {hoverTooltip.data.type === "shelter" && (
                      <Shield className="w-4 h-4 text-emerald-400" />
                    )}
                    <span className="truncate">{hoverTooltip.data.name}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      hoverTooltip.data.risk_level === "Critical"
                        ? "bg-red-950/80 text-red-400 border border-red-800"
                        : hoverTooltip.data.risk_level === "High"
                        ? "bg-amber-950/80 text-amber-400 border border-amber-800"
                        : "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                    }`}
                  >
                    {hoverTooltip.data.risk_level || "SAFE"}
                  </span>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Surge Inundation:</span>
                    <span className="font-bold text-red-400">
                      {Number(hoverTooltip.data.flood_depth_m || 0).toFixed(2)} m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Elevation Datum:</span>
                    <span>
                      {Number(hoverTooltip.data.elevation_m || 3.5).toFixed(1)} m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">District:</span>
                    <span>{hoverTooltip.data.district || "Puri"}</span>
                  </div>
                </div>

                {hoverTooltip.data.recommended_action && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-cyan-300 font-medium">
                    <span className="font-bold block uppercase text-[10px] text-cyan-400">
                      Directive:
                    </span>
                    {hoverTooltip.data.recommended_action}
                  </div>
                )}
              </div>
            )}

            {/* Forecast Uncertainty Cone Tooltip */}
            {hoverTooltip.type === "cone" && (
              <div className="bg-slate-900/95 backdrop-blur-md border border-red-800/80 rounded-xl p-3 shadow-2xl text-xs text-slate-200 min-w-[220px] font-mono">
                <div className="font-bold text-red-400 mb-1 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                  <span>Forecast Uncertainty Cone</span>
                </div>
                <div className="text-[11px] space-y-1 text-slate-300">
                  <div>
                    Confidence:{" "}
                    <strong className="text-white">
                      90% Statistical Corridor
                    </strong>
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Probability envelope covering landfall corridor.
                  </div>
                </div>
              </div>
            )}

            {/* 3D Flood Inundation Tooltip */}
            {hoverTooltip.type === "flood" && (
              <div className="bg-slate-900/95 backdrop-blur-md border border-cyan-800 rounded-xl p-3 shadow-2xl text-xs text-slate-200 font-mono">
                <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                  <Waves className="w-4 h-4" />
                  <span>3D Hydrodynamic Surge Polygon</span>
                </div>
                <div className="text-[11px] space-y-1">
                  <div>
                    Surge Crest:{" "}
                    <span className="font-bold text-cyan-300">3.50 m MSL</span>
                  </div>
                  <div>
                    Inundation Area:{" "}
                    <span className="font-bold text-white">1,746.5 km²</span>
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    GEE + Delft3D Hydrodynamic Mesh
                  </div>
                </div>
              </div>
            )}

            {/* Cyclone Trajectory Node Tooltip */}
            {hoverTooltip.type === "track" && (
              <div className="bg-slate-900/95 backdrop-blur-md border border-red-800 rounded-xl p-3 shadow-2xl text-xs text-slate-200 min-w-[220px] font-mono">
                <div className="font-bold text-red-400 mb-1 flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Radio className="w-4 h-4" />
                    <span>Track Coordinate</span>
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                      hoverTooltip.data.is_historical
                        ? "bg-red-950 text-red-400 border border-red-800"
                        : "bg-yellow-950 text-yellow-400 border border-yellow-800"
                    }`}
                  >
                    {hoverTooltip.data.is_historical
                      ? "HISTORICAL"
                      : "PROJECTED"}
                  </span>
                </div>
                <div className="text-[11px] space-y-1 mt-1">
                  <div>
                    Stage:{" "}
                    <span className="font-bold text-white">
                      {hoverTooltip.data.stage}
                    </span>
                  </div>
                  <div>
                    Wind Velocity:{" "}
                    <span className="font-bold text-amber-400">
                      {hoverTooltip.data.wind_kmh || 185} km/h
                    </span>
                  </div>
                  <div>
                    Central Pressure:{" "}
                    <span className="font-bold text-cyan-300">
                      {hoverTooltip.data.pressure_hpa || 937} hPa
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

export default memo(MapContainer);
