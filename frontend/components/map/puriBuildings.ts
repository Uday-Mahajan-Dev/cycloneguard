// GeoJSON FeatureCollection containing 3D building footprints for the Puri coastal corridor
// Each feature includes render_height, render_min_height, building_type, and name for 3D extrusion rendering.

export interface BuildingFeature {
  type: "Feature";
  properties: {
    id: string;
    name: string;
    height: number;
    render_height: number;
    render_min_height: number;
    building_type: string;
    color?: string;
  };
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

// Generate realistic building blocks around key Puri coordinates
function generateBuildingGrid(
  centerLon: number,
  centerLat: number,
  rows: number,
  cols: number,
  spacing: number,
  baseHeight: number,
  heightVar: number,
  type: string,
  prefix: string
): BuildingFeature[] {
  const features: BuildingFeature[] = [];
  const bSize = spacing * 0.65;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lon = centerLon + (c - cols / 2) * spacing;
      const lat = centerLat + (r - rows / 2) * spacing;
      const h = baseHeight + ((r * 7 + c * 13) % heightVar);

      features.push({
        type: "Feature",
        properties: {
          id: `${prefix}_${r}_${c}`,
          name: `${type} Block ${r + 1}-${c + 1}`,
          height: h,
          render_height: h,
          render_min_height: 0,
          building_type: type,
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [lon - bSize / 2, lat - bSize / 2],
              [lon + bSize / 2, lat - bSize / 2],
              [lon + bSize / 2, lat + bSize / 2],
              [lon - bSize / 2, lat + bSize / 2],
              [lon - bSize / 2, lat - bSize / 2],
            ],
          ],
        },
      });
    }
  }
  return features;
}

export function getPuri3DBuildingsGeoJSON(): {
  type: "FeatureCollection";
  features: BuildingFeature[];
} {
  const allFeatures: BuildingFeature[] = [
    // 1. Swargadwar Coastal Beachfront Resort Towers (18m - 42m)
    ...generateBuildingGrid(85.819, 19.791, 5, 8, 0.0012, 22, 20, "hotel_resort", "swargadwar"),

    // 2. Puri District HQ Hospital Medical Complex (18m - 28m)
    ...generateBuildingGrid(85.828, 19.805, 4, 5, 0.0014, 18, 10, "hospital_campus", "hq_hospital"),

    // 3. Puri Grand Road Administrative & Commercial District (15m - 35m)
    ...generateBuildingGrid(85.833, 19.808, 6, 7, 0.0011, 20, 15, "commercial", "grand_road"),

    // 4. Talabania Multi-Purpose Sector & Stadium Grounds (14m - 26m)
    ...generateBuildingGrid(85.849, 19.818, 4, 6, 0.0013, 16, 12, "shelter_civic", "talabania"),

    // 5. Marine Drive East Waterfront Blocks (12m - 30m)
    ...generateBuildingGrid(85.842, 19.799, 4, 9, 0.0012, 18, 14, "waterfront", "marine_drive"),

    // 6. Puri Town 33kV Substation Industrial Structures (10m - 18m)
    ...generateBuildingGrid(85.845, 19.825, 3, 4, 0.0015, 12, 8, "substation_grid", "puri_substation"),

    // 7. Mangalahat Western Highway Corridor (12m - 24m)
    ...generateBuildingGrid(85.811, 19.812, 4, 6, 0.0013, 15, 10, "highway_corridor", "mangalahat"),

    // 8. Balighai Coastal Cluster (10m - 20m)
    ...generateBuildingGrid(85.905, 19.845, 3, 5, 0.0014, 12, 8, "coastal_cluster", "balighai"),
  ];

  return {
    type: "FeatureCollection",
    features: allFeatures,
  };
}
