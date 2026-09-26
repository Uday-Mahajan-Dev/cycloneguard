"use client";

import { useState, useEffect } from "react";

export interface RainViewerFrame {
  time: number;
  path: string;
}

export interface RainViewerData {
  host: string;
  radar: {
    past: RainViewerFrame[];
    nowcast?: RainViewerFrame[];
  };
}

export function useRainViewerTiles() {
  const [tileUrl, setTileUrl] = useState<string | null>(null);
  const [timestamps, setTimestamps] = useState<number[]>([]);
  const [paths, setPaths] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchMaps = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: RainViewerData = await res.json();

        if (!isMounted) return;

        const host = data.host || "https://tilecache.rainviewer.com";
        const past = data?.radar?.past;
        if (Array.isArray(past) && past.length > 0) {
          const validPast = past.filter((f) => f && (f.path || f.time));
          const lastFrame = validPast[validPast.length - 1];
          const pathOrTime = lastFrame.path || lastFrame.time;

          setTileUrl(`${host}/v2/radar/${pathOrTime}/256/{z}/{x}/{y}/2/1_1.png`);
          setTimestamps(validPast.map((f) => f.time));
          setPaths(validPast.map((f) => f.path || String(f.time)));
        }
      } catch {
        // Graceful degradation: no console spam, return null
        if (isMounted) {
          setTileUrl(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMaps();
    const interval = setInterval(fetchMaps, 10 * 60 * 1000); // 10 minutes auto-refresh

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { tileUrl, timestamps, paths, isLoading };
}
