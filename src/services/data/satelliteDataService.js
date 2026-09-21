/**
 * satelliteDataService.js
 * 
 * Adapter for Copernicus Sentinel/DEM satellite observations.
 * Provides APIs for change detection (hill cutting) and static terrain analysis.
 * Implements GET /api/v1/change-detection/{id} stub.
 */

export const fetchSatelliteData = async (lat, lng) => {
    // In production, this hits an Earth Engine or Sentinel Hub API
    return {
        terrain: {
            elevation: { value: 1486, unit: 'm' }, // Mock DEM data
            slope: { value: 34, unit: '°' },
            aspect: { value: 'SE' }
        },
        susceptibility: {
            level: "HIGH",
            score: 78
        },
        deformation: {
            surfaceDisturbance: false,
            vegetationLoss: false,
        },
        status: 'STATIC DATA',
        source: 'Copernicus DEM',
        timestamp: Date.now() - (86400000 * 2) // 2 days ago mock
    };
};

export const fetchChangeDetection = async (locationId) => {
    // Stub for GET /api/v1/change-detection/{id}
    return {
        surface_disturbance: true,
        vegetation_loss: true,
        bare_soil_change: "moderate",
        possible_new_hill_cut: true,
        road_proximity: "50m",
        observation_date: new Date(Date.now() - 86400000 * 2).toISOString(),
        confidence: "MODERATE",
        status: "OBSERVED",
        source: "Sentinel-1/2 Derived",
    };
};
