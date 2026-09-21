// Mock GeoJSON data for Administrative Boundaries and Road Networks

export const nerStateBoundaries = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Meghalaya", type: "State" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [89.8, 26.1],
            [92.8, 26.1],
            [92.8, 25.0],
            [89.8, 25.0],
            [89.8, 26.1]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Assam", type: "State" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [89.8, 27.5],
            [96.0, 27.5],
            [96.0, 26.1],
            [89.8, 26.1],
            [89.8, 27.5]
          ]
        ]
      }
    }
  ]
};

export const nerRoadNetwork = {
  type: "FeatureCollection",
  features: [
    {
      // Green — open corridor through the default map view
      type: "Feature",
      properties: { name: "NH-40", status: "Open", id: "road-nh40" },
      geometry: {
        type: "LineString",
        coordinates: [
          [91.70, 25.30],
          [91.72, 25.285],
          [91.74, 25.27],
          [91.76, 25.26],
          [91.78, 25.25]
        ]
      }
    },
    {
      // RED — fully blocked (click this for Road Intel + alternate route)
      type: "Feature",
      properties: { name: "SH-12 / Bypass", status: "Blocked", id: "road-sh12" },
      geometry: {
        type: "LineString",
        coordinates: [
          [91.72, 25.255],
          [91.735, 25.268],
          [91.75, 25.28],
          [91.765, 25.29]
        ]
      }
    },
    {
      // Amber — partially blocked
      type: "Feature",
      properties: { name: "Link Road East", status: "Partially Blocked", id: "road-link-e" },
      geometry: {
        type: "LineString",
        coordinates: [
          [91.755, 25.25],
          [91.77, 25.265],
          [91.79, 25.28]
        ]
      }
    }
  ]
};

// Heatmap points: [lat, lng, intensity]
export const nerRiskHeatmapPoints = [
  [25.268, 91.738, 0.9],
  [25.269, 91.737, 0.8],
  [25.270, 91.739, 0.95],
  [25.265, 91.740, 0.7],
  [25.266, 91.735, 0.85],
  [25.280, 91.750, 0.5],
  [25.282, 91.755, 0.6],
  [25.285, 91.760, 0.55],
  [25.300, 91.700, 0.88],
  [25.302, 91.705, 0.75],
];

export const nerVillages = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Mawphlang Village", population: 1500, risk: "High" },
      geometry: { type: "Point", coordinates: [91.738, 25.268] }
    },
    {
      type: "Feature",
      properties: { name: "Nongthymmai", population: 3200, risk: "Moderate" },
      geometry: { type: "Point", coordinates: [91.750, 25.280] }
    },
    {
      type: "Feature",
      properties: { name: "Cherrapunji Sub-hub", population: 5000, risk: "Extreme" },
      geometry: { type: "Point", coordinates: [91.700, 25.300] }
    }
  ]
};