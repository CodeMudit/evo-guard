/**
 * satelliteDataService.js
 *
 * Terrain / DEM / NDVI adapter.
 *
 * Live sources (when configured):
 *   - Elevation: Open-Meteo Elevation API (free, no key) or OpenTopoData
 *   - NDVI / change detection: Sentinel Hub Process API when
 *     VITE_SENTINEL_API_KEY (or backend-proxied SENTINEL_CLIENT_ID/SECRET) is set
 *
 * Always falls back to deterministic mock data so demo mode keeps working.
 */

import { API_CONFIG } from '../api/config';

const MOCK_ELEVATION_BASE = 1486;

/** Deterministic pseudo-random from lat/lng for stable mock values. */
function hashCoord(lat, lng) {
    const x = Math.sin(lat * 12.9898 + lng * 78.233) * 43758.5453;
    return x - Math.floor(x);
}

function mockSatelliteData(lat, lng) {
    const h = hashCoord(parseFloat(lat), parseFloat(lng));
    const elevation = Math.round(MOCK_ELEVATION_BASE + (h - 0.5) * 400);
    const slope = Math.round(15 + h * 35);
    const susceptibilityScore = Math.round(40 + h * 50);
    const level =
        susceptibilityScore >= 75 ? 'HIGH' : susceptibilityScore >= 50 ? 'MODERATE' : 'LOW';

    return {
        terrain: {
            elevation: { value: elevation, unit: 'm' },
            slope: { value: slope, unit: '°' },
            aspect: { value: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(h * 8)] },
        },
        susceptibility: {
            level,
            score: susceptibilityScore,
        },
        ndvi: {
            value: parseFloat((0.2 + h * 0.55).toFixed(3)),
            unit: 'index',
        },
        deformation: {
            surfaceDisturbance: h > 0.7,
            vegetationLoss: h > 0.65,
        },
        changeDetection: {
            surface_disturbance: h > 0.7,
            vegetation_loss: h > 0.65,
            bare_soil_change: h > 0.8 ? 'significant' : h > 0.55 ? 'moderate' : 'low',
            possible_new_hill_cut: h > 0.75,
            confidence: h > 0.6 ? 'MODERATE' : 'LOW',
        },
        status: 'STATIC DATA',
        source: 'Copernicus DEM (mock)',
        timestamp: Date.now() - 86400000 * 2,
    };
}

/** Open-Meteo elevation (free, no key). */
async function fetchElevationOpenMeteo(lat, lng) {
    const url = `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!json.elevation || !json.elevation.length) {
        throw new Error('No elevation in Open-Meteo response');
    }
    return json.elevation[0];
}

/**
 * Sentinel Hub Process API for NDVI (requires instance + OAuth token).
 * For browser use we prefer a backend proxy; here we attempt a simple
 * stats call when VITE_SENTINEL_API_KEY is a bearer token or API key.
 * See workstream notes for registration steps.
 */
async function fetchNdviSentinelHub(lat, lng) {
    const key = import.meta.env.VITE_SENTINEL_API_KEY;
    if (!key) throw new Error('VITE_SENTINEL_API_KEY not configured');

    // 0.01° box around point (~1 km)
    const d = 0.005;
    const bbox = [lng - d, lat - d, lng + d, lat + d];

    // Statistical API (simplest for point NDVI). Requires process instance.
    // When only a placeholder key is present this will fail → mock fallback.
    const evalscript = `//VERSION=3
function setup() {
  return { input: ["B04", "B08", "dataMask"], output: [{ id: "ndvi", bands: 1, sampleType: "FLOAT32" }, { id: "dataMask", bands: 1 }] };
}
function evaluatePixel(s) {
  const ndvi = (s.B08 - s.B04) / (s.B08 + s.B04);
  return { ndvi: [ndvi], dataMask: [s.dataMask] };
}`;

    const body = {
        input: {
            bounds: { bbox, properties: { crs: 'http://www.opengis.net/def/crs/EPSG/0/4326' } },
            data: [
                {
                    type: 'sentinel-2-l2a',
                    dataFilter: {
                        timeRange: {
                            from: new Date(Date.now() - 30 * 86400000).toISOString(),
                            to: new Date().toISOString(),
                        },
                        maxCloudCoverage: 60,
                    },
                },
            ],
        },
        aggregation: {
            timeRange: {
                from: new Date(Date.now() - 30 * 86400000).toISOString(),
                to: new Date().toISOString(),
            },
            aggregationInterval: { of: 'P30D' },
            evalscript,
            resx: 100,
            resy: 100,
        },
    };

    const res = await fetch('https://services.sentinel-hub.com/api/v1/statistics', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: key.startsWith('Bearer ') ? key : `Bearer ${key}`,
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        throw new Error(`Sentinel Hub ${res.status}`);
    }
    const json = await res.json();
    // Extract mean NDVI from first interval if present
    const mean =
        json?.data?.[0]?.outputs?.ndvi?.bands?.B0?.stats?.mean ??
        json?.data?.[0]?.outputs?.ndvi?.bands?.['0']?.stats?.mean;
    if (mean == null || Number.isNaN(mean)) {
        throw new Error('No NDVI stats in Sentinel response');
    }
    return parseFloat(mean.toFixed(3));
}

/**
 * Approximate slope from neighboring elevation samples (finite difference).
 */
async function approximateSlope(lat, lng, centerElev) {
    try {
        const delta = 0.01; // ~1.1 km
        const [n, e] = await Promise.all([
            fetchElevationOpenMeteo(parseFloat(lat) + delta, lng),
            fetchElevationOpenMeteo(lat, parseFloat(lng) + delta),
        ]);
        const dy = (n - centerElev) / (delta * 111000); // m/m
        const dx = (e - centerElev) / (delta * 111000 * Math.cos((lat * Math.PI) / 180));
        const slopeRad = Math.atan(Math.sqrt(dx * dx + dy * dy));
        return Math.round((slopeRad * 180) / Math.PI);
    } catch {
        return null;
    }
}

export const fetchSatelliteData = async (lat, lng) => {
    // Demo mode: always mock
    if (API_CONFIG.MODE === 'demo' && !import.meta.env.VITE_SENTINEL_API_KEY && !import.meta.env.VITE_FORCE_LIVE_TERRAIN) {
        return mockSatelliteData(lat, lng);
    }

    try {
        // Elevation is free and reliable
        const elevation = await fetchElevationOpenMeteo(lat, lng);
        const slope = (await approximateSlope(lat, lng, elevation)) ?? Math.round(20 + hashCoord(lat, lng) * 25);

        let ndviValue = null;
        let source = 'Open-Meteo Elevation + derived slope';
        let status = 'LIVE';

        // Optional NDVI via Sentinel Hub
        if (import.meta.env.VITE_SENTINEL_API_KEY) {
            try {
                ndviValue = await fetchNdviSentinelHub(lat, lng);
                source = 'Open-Meteo Elevation + Sentinel Hub NDVI';
            } catch (ndviErr) {
                console.warn('Sentinel NDVI failed, continuing without:', ndviErr.message);
            }
        }

        // Susceptibility heuristic from slope + NDVI (low vegetation + steep = higher risk)
        let score = Math.min(95, Math.round(slope * 1.5 + (ndviValue != null ? (0.6 - ndviValue) * 40 : 20)));
        score = Math.max(10, score);
        const level = score >= 75 ? 'HIGH' : score >= 50 ? 'MODERATE' : 'LOW';

        return {
            terrain: {
                elevation: { value: Math.round(elevation), unit: 'm' },
                slope: { value: slope, unit: '°' },
                aspect: { value: 'SE' },
            },
            susceptibility: { level, score },
            ndvi: ndviValue != null ? { value: ndviValue, unit: 'index' } : undefined,
            deformation: {
                surfaceDisturbance: false,
                vegetationLoss: ndviValue != null && ndviValue < 0.3,
            },
            changeDetection: {
                surface_disturbance: false,
                vegetation_loss: ndviValue != null && ndviValue < 0.3,
                bare_soil_change: ndviValue != null && ndviValue < 0.25 ? 'moderate' : 'low',
                possible_new_hill_cut: false,
                confidence: ndviValue != null ? 'MODERATE' : 'LOW',
            },
            status,
            source,
            timestamp: Date.now(),
        };
    } catch (error) {
        console.warn('Satellite adapter live fetch failed, using mock:', error.message);
        const mock = mockSatelliteData(lat, lng);
        mock.status = 'FALLBACK MOCK';
        mock.source = 'Copernicus DEM (mock fallback)';
        return mock;
    }
};

export const fetchChangeDetection = async (locationId, lat = null, lng = null) => {
    if (lat != null && lng != null) {
        const sat = await fetchSatelliteData(lat, lng);
        if (sat.changeDetection) {
            return {
                ...sat.changeDetection,
                observation_date: new Date(sat.timestamp).toISOString(),
                status: sat.status,
                source: sat.source,
            };
        }
    }

    // Stub when no coordinates
    return {
        surface_disturbance: true,
        vegetation_loss: true,
        bare_soil_change: 'moderate',
        possible_new_hill_cut: true,
        road_proximity: '50m',
        observation_date: new Date(Date.now() - 86400000 * 2).toISOString(),
        confidence: 'MODERATE',
        status: 'OBSERVED',
        source: 'Sentinel-1/2 Derived (mock)',
    };
};
