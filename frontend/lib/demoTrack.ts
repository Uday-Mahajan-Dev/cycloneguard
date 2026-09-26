/**
 * Cyclone Fani Official IMD Track & Uncertainty Swath Geometry
 * Faithful replica of the IMD Cyclone Fani Path (1st May 11:30am -> 5th May 11:30am)
 */

export interface FaniWaypoint {
  id: string;
  coordinates: [number, number]; // [lon, lat]
  timeLabel: string;
  stageCode: "ESCS" | "VSCS" | "SCS" | "CS" | "D";
  stageName: string;
  windKmh: number;
  pressureHpa: number;
  isLandfall?: boolean;
  isCurrentPosition?: boolean;
}

// 8 Official IMD Timeline Waypoints from Southern Bay of Bengal to Northeast India
export const FANI_TRACK_WAYPOINTS: FaniWaypoint[] = [
  {
    id: "fani-wp-1",
    coordinates: [84.6, 14.1],
    timeLabel: "1st May, 11:30am",
    stageCode: "ESCS",
    stageName: "Extremely Severe Cyclonic Storm",
    windKmh: 175,
    pressureHpa: 960,
  },
  {
    id: "fani-wp-2",
    coordinates: [84.9, 16.0],
    timeLabel: "2nd May, 11:30am",
    stageCode: "ESCS",
    stageName: "Extremely Severe Cyclonic Storm",
    windKmh: 195,
    pressureHpa: 945,
  },
  {
    id: "fani-wp-3",
    coordinates: [85.3, 17.8],
    timeLabel: "2nd May, 11:30pm",
    stageCode: "ESCS",
    stageName: "Extremely Severe Cyclonic Storm",
    windKmh: 205,
    pressureHpa: 937,
  },
  {
    id: "fani-wp-4",
    coordinates: [85.83, 19.805],
    timeLabel: "3rd May, 11:30am",
    stageCode: "ESCS",
    stageName: "Extremely Severe Cyclonic Storm (Landfall)",
    windKmh: 185,
    pressureHpa: 937,
    isLandfall: true,
    isCurrentPosition: true, // Active storm simulation anchor point
  },
  {
    id: "fani-wp-5",
    coordinates: [86.5, 20.8],
    timeLabel: "3rd May, 11:30pm",
    stageCode: "VSCS",
    stageName: "Very Severe Cyclonic Storm",
    windKmh: 140,
    pressureHpa: 965,
  },
  {
    id: "fani-wp-6",
    coordinates: [87.4, 22.0],
    timeLabel: "4th May, 11:30am",
    stageCode: "SCS",
    stageName: "Severe Cyclonic Storm",
    windKmh: 100,
    pressureHpa: 985,
  },
  {
    id: "fani-wp-7",
    coordinates: [88.8, 23.4],
    timeLabel: "4th May, 11:30pm",
    stageCode: "CS",
    stageName: "Cyclonic Storm",
    windKmh: 70,
    pressureHpa: 994,
  },
  {
    id: "fani-wp-8",
    coordinates: [90.5, 24.8],
    timeLabel: "5th May, 11:30am",
    stageCode: "D",
    stageName: "Depression",
    windKmh: 45,
    pressureHpa: 1000,
  },
];

// Full raw control points including early genesis approach
export const FANI_RAW_CONTROL_POINTS: [number, number][] = [
  [85.6, 11.5], // Deep South Bay Genesis Approach
  [85.1, 12.8],
  [84.6, 14.1], // 1st May, 11:30am (WP 1)
  [84.9, 16.0], // 2nd May, 11:30am (WP 2)
  [85.3, 17.8], // 2nd May, 11:30pm (WP 3)
  [85.83, 19.805], // 3rd May, 11:30am (WP 4 - Landfall Puri / Current Position)
  [86.5, 20.8], // 3rd May, 11:30pm (WP 5)
  [87.4, 22.0], // 4th May, 11:30am (WP 6)
  [88.8, 23.4], // 4th May, 11:30pm (WP 7)
  [90.5, 24.8], // 5th May, 11:30am (WP 8)
];

/**
 * Catmull-Rom spline interpolation strictly passing through all given control points
 */
export function interpolateCatmullRom(
  points: [number, number][],
  subdivisions = 15
): [number, number][] {
  if (points.length < 2) return points;
  const result: [number, number][] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    for (let s = 0; s < subdivisions; s++) {
      const t = s / subdivisions;
      const t2 = t * t;
      const t3 = t2 * t;

      // Catmull-Rom basis formula
      const x =
        0.5 *
        (2 * p1[0] +
          (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);

      const y =
        0.5 *
        (2 * p1[1] +
          (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);

      result.push([Number(x.toFixed(6)), Number(y.toFixed(6))]);
    }
  }

  // Push the final exact point
  result.push(points[points.length - 1]);
  return result;
}

// Precomputed high-density smooth track lines
export const FANI_FULL_TRACK_LINE = interpolateCatmullRom(FANI_RAW_CONTROL_POINTS, 16);

// Observed track: Genesis -> 1st May -> 2nd May -> 3rd May 11:30am (Current Live Position)
export const FANI_PAST_OBSERVED_POINTS: [number, number][] = [
  [85.6, 11.5],
  [85.1, 12.8],
  [84.6, 14.1],
  [84.9, 16.0],
  [85.3, 17.8],
  [85.83, 19.805],
];
export const FANI_PAST_TRACK_LINE = interpolateCatmullRom(FANI_PAST_OBSERVED_POINTS, 16);

// Forecast track: 3rd May 11:30am (Current Live Position) -> 3rd May 11:30pm -> 4th May -> 5th May
export const FANI_FORECAST_POINTS: [number, number][] = [
  [85.83, 19.805],
  [86.5, 20.8],
  [87.4, 22.0],
  [88.8, 23.4],
  [90.5, 24.8],
];
export const FANI_FORECAST_TRACK_LINE = interpolateCatmullRom(FANI_FORECAST_POINTS, 16);

/**
 * Generates concentric circular range rings around the current cyclone eye
 */
export function generateRangeRingCoordinates(
  centerLon: number,
  centerLat: number,
  radiusKm: number,
  steps = 64
): [number, number][] {
  const coords: [number, number][] = [];
  const latRad = (centerLat * Math.PI) / 180;
  const rLat = radiusKm / 111.32;
  const rLon = radiusKm / (111.32 * Math.cos(latRad));

  for (let i = 0; i <= steps; i++) {
    const angle = (i * 2 * Math.PI) / steps;
    coords.push([
      Number((centerLon + rLon * Math.cos(angle)).toFixed(6)),
      Number((centerLat + rLat * Math.sin(angle)).toFixed(6)),
    ]);
  }
  return coords;
}

/**
 * Generates the official IMD Cyclone Fani curved uncertainty cone / swath polygon.
 * Smooth envelope with rounded start and end caps, mirroring the IMD forecast graphics.
 */
export function generateFaniConePolygon(): [number, number][] {
  const waypoints = FANI_TRACK_WAYPOINTS.map((w) => w.coordinates);
  // Widths (km) at each waypoint from 1st May to 5th May
  const widthsKm = [70, 75, 80, 85, 105, 125, 145, 165];

  const leftBank: [number, number][] = [];
  const rightBank: [number, number][] = [];

  for (let i = 0; i < waypoints.length; i++) {
    const curr = waypoints[i];
    const prev = waypoints[Math.max(0, i - 1)];
    const next = waypoints[Math.min(waypoints.length - 1, i + 1)];

    let dx = next[0] - prev[0];
    let dy = next[1] - prev[1];
    if (i === 0) {
      dx = next[0] - curr[0];
      dy = next[1] - curr[1];
    } else if (i === waypoints.length - 1) {
      dx = curr[0] - prev[0];
      dy = curr[1] - prev[1];
    }

    const len = Math.hypot(dx, dy) || 1e-6;
    const nx = -dy / len;
    const ny = dx / len;

    const widthKm = widthsKm[i];
    const latRad = (curr[1] * Math.PI) / 180;
    const rLat = widthKm / 111.32;
    const rLon = widthKm / (111.32 * Math.cos(latRad));

    leftBank.push([
      Number((curr[0] + nx * rLon).toFixed(6)),
      Number((curr[1] + ny * rLat).toFixed(6)),
    ]);
    rightBank.push([
      Number((curr[0] - nx * rLon).toFixed(6)),
      Number((curr[1] - ny * rLat).toFixed(6)),
    ]);
  }

  // 1. Rounded cap at end point (5th May - Top Northeast)
  const topPoint = waypoints[waypoints.length - 1];
  const topLatRad = (topPoint[1] * Math.PI) / 180;
  const topRadiusKm = widthsKm[widthsKm.length - 1];
  const topCapRadiusLat = topRadiusKm / 111.32;
  const topCapRadiusLon = topRadiusKm / (111.32 * Math.cos(topLatRad));

  const startAngleTop = Math.atan2(
    leftBank[leftBank.length - 1][1] - topPoint[1],
    leftBank[leftBank.length - 1][0] - topPoint[0]
  );
  const endAngleTop = Math.atan2(
    rightBank[rightBank.length - 1][1] - topPoint[1],
    rightBank[rightBank.length - 1][0] - topPoint[0]
  );

  const topCapSteps = 12;
  const topCapPoints: [number, number][] = [];
  let diffTop = endAngleTop - startAngleTop;
  while (diffTop < 0) diffTop += 2 * Math.PI;

  for (let s = 1; s < topCapSteps; s++) {
    const angle = startAngleTop + (diffTop * s) / topCapSteps;
    topCapPoints.push([
      Number((topPoint[0] + topCapRadiusLon * Math.cos(angle)).toFixed(6)),
      Number((topPoint[1] + topCapRadiusLat * Math.sin(angle)).toFixed(6)),
    ]);
  }

  // 2. Rounded cap at start point (1st May - Bottom Southwest)
  const botPoint = waypoints[0];
  const botLatRad = (botPoint[1] * Math.PI) / 180;
  const botRadiusKm = widthsKm[0];
  const botCapRadiusLat = botRadiusKm / 111.32;
  const botCapRadiusLon = botRadiusKm / (111.32 * Math.cos(botLatRad));

  const startAngleBot = Math.atan2(
    rightBank[0][1] - botPoint[1],
    rightBank[0][0] - botPoint[0]
  );
  const endAngleBot = Math.atan2(
    leftBank[0][1] - botPoint[1],
    leftBank[0][0] - botPoint[0]
  );

  const botCapSteps = 12;
  const botCapPoints: [number, number][] = [];
  let diffBot = endAngleBot - startAngleBot;
  while (diffBot < 0) diffBot += 2 * Math.PI;

  for (let s = 1; s < botCapSteps; s++) {
    const angle = startAngleBot + (diffBot * s) / botCapSteps;
    botCapPoints.push([
      Number((botPoint[0] + botCapRadiusLon * Math.cos(angle)).toFixed(6)),
      Number((botPoint[1] + botCapRadiusLat * Math.sin(angle)).toFixed(6)),
    ]);
  }

  return [
    ...leftBank,
    ...topCapPoints,
    ...rightBank.reverse(),
    ...botCapPoints,
    leftBank[0], // Close loop
  ];
}

/**
 * Returns full GeoJSON for the Fani IMD Track, Uncertainty Cone, Past vs Forecast Lines, and Range Rings
 */
export function getFaniIMDTrackGeoJSON(currentLon = 85.83, currentLat = 19.805) {
  const conePolygon = generateFaniConePolygon();

  const ring50km = generateRangeRingCoordinates(currentLon, currentLat, 50);
  const ring100km = generateRangeRingCoordinates(currentLon, currentLat, 100);
  const ring150km = generateRangeRingCoordinates(currentLon, currentLat, 150);
  const ring200km = generateRangeRingCoordinates(currentLon, currentLat, 200);

  return {
    type: "FeatureCollection" as const,
    features: [
      // 1. Uncertainty Cone Swath Polygon
      {
        type: "Feature" as const,
        id: "fani-cone-swath-polygon",
        geometry: {
          type: "Polygon" as const,
          coordinates: [conePolygon],
        },
        properties: {
          layer_type: "cone_swath",
          name: "Cyclone Fani Forecast Uncertainty Corridor",
        },
      },
      // 2. Continuous Full Centerline Track (High Density Smooth Curve)
      {
        type: "Feature" as const,
        id: "fani-full-trajectory-line",
        geometry: {
          type: "LineString" as const,
          coordinates: FANI_FULL_TRACK_LINE,
        },
        properties: {
          layer_type: "trajectory_line",
          name: "Cyclone Fani Continuous Trajectory Track",
        },
      },
      // 3. Past / Observed Track (Genesis -> Current Live Position)
      {
        type: "Feature" as const,
        id: "fani-past-track-line-feature",
        geometry: {
          type: "LineString" as const,
          coordinates: FANI_PAST_TRACK_LINE,
        },
        properties: {
          layer_type: "past_track_line",
          name: "Observed Historical Track",
        },
      },
      // 4. Projected Forecast Track (Current Live Position -> Bangladesh)
      {
        type: "Feature" as const,
        id: "fani-forecast-track-line-feature",
        geometry: {
          type: "LineString" as const,
          coordinates: FANI_FORECAST_TRACK_LINE,
        },
        properties: {
          layer_type: "forecast_track_line",
          name: "Projected Forecast Trajectory",
        },
      },
      // 5. Eye Range Rings (Concentric circles around current position)
      {
        type: "Feature" as const,
        id: "fani-ring-50km",
        geometry: {
          type: "LineString" as const,
          coordinates: ring50km,
        },
        properties: {
          layer_type: "range_ring",
          radius_km: 50,
          label: "50 km Impact Core",
        },
      },
      {
        type: "Feature" as const,
        id: "fani-ring-100km",
        geometry: {
          type: "LineString" as const,
          coordinates: ring100km,
        },
        properties: {
          layer_type: "range_ring",
          radius_km: 100,
          label: "100 km Gale Force Zone",
        },
      },
      {
        type: "Feature" as const,
        id: "fani-ring-150km",
        geometry: {
          type: "LineString" as const,
          coordinates: ring150km,
        },
        properties: {
          layer_type: "range_ring",
          radius_km: 150,
          label: "150 km Storm Surge Zone",
        },
      },
      {
        type: "Feature" as const,
        id: "fani-ring-200km",
        geometry: {
          type: "LineString" as const,
          coordinates: ring200km,
        },
        properties: {
          layer_type: "range_ring",
          radius_km: 200,
          label: "200 km Outer Rainband",
        },
      },
      // 6. Waypoint Points for MapLibre Node Rendering
      ...FANI_TRACK_WAYPOINTS.map((wp) => ({
        type: "Feature" as const,
        id: `fani-node-${wp.id}`,
        geometry: {
          type: "Point" as const,
          coordinates: wp.coordinates,
        },
        properties: {
          layer_type: "stage_node",
          stageCode: wp.stageCode,
          stageName: wp.stageName,
          timeLabel: wp.timeLabel,
          windKmh: wp.windKmh,
          pressureHpa: wp.pressureHpa,
          isLandfall: wp.isLandfall || false,
          isCurrentPosition: wp.isCurrentPosition || false,
        },
      })),
    ],
  };
}
