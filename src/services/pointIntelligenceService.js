import { fetchImdData } from './data/imdDataService';
import { fetchSatelliteData } from './data/satelliteDataService';
import { API_URL } from '../config';

/**
 * pointIntelligenceService.js
 * 
 * Provides unified, normalized geographic point intelligence for hover and click events.
 * Implements GET /api/v1/map/point-intelligence?lat={lat}&lng={lng}
 */

const spatialCache = new Map();
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 mins

// Helper to create a spatial grid key (~1.1km resolution at equator for 2 decimal places)
const getGridKey = (lat, lng) => {
    return `${parseFloat(lat).toFixed(2)},${parseFloat(lng).toFixed(2)}`;
};

export const getCachedOrNull = (lat, lng) => {
    const gridKey = getGridKey(lat, lng);
    const now = Date.now();
    
    if (spatialCache.has(gridKey)) {
        const cached = spatialCache.get(gridKey);
        if (now - cached.timestamp < CACHE_DURATION_MS) {
            return {
                ...cached.data,
                coordinates: { lat: parseFloat(lat).toFixed(4), lng: parseFloat(lng).toFixed(4) },
                freshness: 'CACHED'
            };
        }
    }
    return null;
};

export const fetchPointIntelligence = async (lat, lng, signal = null) => {
    const cachedData = getCachedOrNull(lat, lng);
    if (cachedData) {
        return cachedData;
    }

    const gridKey = getGridKey(lat, lng);
    const now = Date.now();

    try {
        const [imdData, satelliteData] = await Promise.all([
            fetchImdData(lat, lng),
            fetchSatelliteData(lat, lng)
        ]);
        
        if (signal && signal.aborted) {
            throw new Error("Request aborted");
        }

        const pointData = {
            coordinates: { lat: parseFloat(lat).toFixed(4), lng: parseFloat(lng).toFixed(4) },
            weather: imdData.weather || null,
            rainfall: imdData.rainfall || null,
            soil: imdData.soil || null,
            terrain: satelliteData.terrain || null,
            susceptibility: satelliteData.susceptibility || null,
            freshness: 'LIVE',
            sources: {
                weather: imdData.source,
                terrain: satelliteData.source,
            },
            timestamp: new Date().toISOString()
        };

        spatialCache.set(gridKey, { timestamp: now, data: pointData });
        return pointData;
    } catch (error) {
        if (error.message === "Request aborted") throw error;
        
        console.warn("Point Intelligence Fetch Failed:", error);
        
        if (spatialCache.has(gridKey)) {
            return { 
                ...spatialCache.get(gridKey).data, 
                coordinates: { lat: parseFloat(lat).toFixed(4), lng: parseFloat(lng).toFixed(4) },
                freshness: 'STALE' 
            };
        }

        return {
            coordinates: { lat: parseFloat(lat).toFixed(4), lng: parseFloat(lng).toFixed(4) },
            weather: null,
            rainfall: null,
            soil: null,
            terrain: null,
            susceptibility: null,
            freshness: 'ERROR',
            sources: {},
            timestamp: new Date().toISOString()
        };
    }
};

/**
 * Prefetch a bounded grid of points to eliminate perceived latency on hover.
 * Works in two modes:
 *   1. With backend API_URL set: batch-fetches via GET /api/map/point-intelligence-grid
 *   2. Without backend (default): directly calls fetchImdData + fetchSatelliteData
 *      for each uncached grid cell, rate-limited to avoid hammering Open-Meteo.
 *
 * Grid resolution matches getGridKey (~0.01° ≈ 1.1 km) but we step at 0.02°
 * to balance coverage vs. request count.  At zoom-13 the viewport is ~0.15° × 0.25°,
 * yielding ~8×13 = 104 cells, of which many will already be cached.
 */

let prefetchDebounceTimer = null;
let prefetchAbortController = null;   // lets a new moveend cancel an in-flight prefetch
const GRID_STEP = 0.01;              // matches getGridKey toFixed(2) resolution (~1.1 km)
const MAX_CONCURRENT = 6;            // parallel Open-Meteo requests at once
const MAX_AREA_DEG = 0.35;           // skip prefetch if viewport > 0.35° in either axis

export const prefetchGridIntelligence = (bounds) => {
    const south = bounds.getSouthWest().lat;
    const west  = bounds.getSouthWest().lng;
    const north = bounds.getNorthEast().lat;
    const east  = bounds.getNorthEast().lng;

    // Don't prefetch if zoomed too far out — too many points
    if (Math.abs(north - south) > MAX_AREA_DEG || Math.abs(east - west) > MAX_AREA_DEG) {
        return;
    }

    // Debounce: rapid pan/zoom should only trigger one prefetch
    if (prefetchDebounceTimer) clearTimeout(prefetchDebounceTimer);

    prefetchDebounceTimer = setTimeout(async () => {
        // Cancel any previous in-flight prefetch
        if (prefetchAbortController) prefetchAbortController.abort();
        prefetchAbortController = new AbortController();
        const { signal } = prefetchAbortController;

        // --- Mode 1: backend batch endpoint ---
        if (API_URL) {
            try {
                const response = await fetch(
                    `${API_URL}/api/map/point-intelligence-grid?south=${south}&west=${west}&north=${north}&east=${east}`,
                    { signal }
                );
                const json = await response.json();
                if (json.success && json.data) {
                    const now = Date.now();
                    for (const [key, value] of Object.entries(json.data)) {
                        const [lat, lng] = key.split(',');
                        const satelliteData = await fetchSatelliteData(lat, lng);
                        const pointData = {
                            coordinates: { lat: parseFloat(lat).toFixed(4), lng: parseFloat(lng).toFixed(4) },
                            weather: value.weather || null,
                            rainfall: value.rainfall || null,
                            soil: value.soil || null,
                            terrain: satelliteData.terrain || null,
                            susceptibility: satelliteData.susceptibility || null,
                            freshness: 'CACHED',
                            sources: { weather: 'Open-Meteo Proxy', terrain: satelliteData.source },
                            timestamp: new Date().toISOString()
                        };
                        spatialCache.set(key, { timestamp: now, data: pointData });
                    }
                }
            } catch (err) {
                if (err.name !== 'AbortError') console.warn('Prefetch (backend) failed:', err.message);
            }
            return;
        }

        // --- Mode 2: direct client-side grid fetch (no backend) ---
        // Build list of grid keys that are NOT already cached
        const uncachedPoints = [];
        for (let lat = south; lat <= north; lat += GRID_STEP) {
            for (let lng = west; lng <= east; lng += GRID_STEP) {
                const key = getGridKey(lat, lng);
                if (!spatialCache.has(key) || (Date.now() - spatialCache.get(key).timestamp) > CACHE_DURATION_MS) {
                    uncachedPoints.push({ lat: parseFloat(lat.toFixed(4)), lng: parseFloat(lng.toFixed(4)), key });
                }
            }
        }

        if (uncachedPoints.length === 0) return;

        // Process in batches of MAX_CONCURRENT to avoid flooding the network
        for (let i = 0; i < uncachedPoints.length; i += MAX_CONCURRENT) {
            if (signal.aborted) return;

            const batch = uncachedPoints.slice(i, i + MAX_CONCURRENT);
            const now = Date.now();

            const results = await Promise.allSettled(
                batch.map(async ({ lat, lng, key }) => {
                    const [imdData, satelliteData] = await Promise.all([
                        fetchImdData(lat, lng),
                        fetchSatelliteData(lat, lng)
                    ]);
                    if (signal.aborted) return;

                    const pointData = {
                        coordinates: { lat: lat.toFixed(4), lng: lng.toFixed(4) },
                        weather: imdData.weather || null,
                        rainfall: imdData.rainfall || null,
                        soil: imdData.soil || null,
                        terrain: satelliteData.terrain || null,
                        susceptibility: satelliteData.susceptibility || null,
                        freshness: 'CACHED',
                        sources: { weather: imdData.source, terrain: satelliteData.source },
                        timestamp: new Date().toISOString()
                    };
                    spatialCache.set(key, { timestamp: now, data: pointData });
                })
            );

            // Log any failures silently
            results.forEach((r, idx) => {
                if (r.status === 'rejected' && r.reason?.name !== 'AbortError') {
                    console.warn(`Prefetch cell ${batch[idx].key} failed:`, r.reason?.message);
                }
            });
        }
    }, 600); // 600ms trailing debounce — slightly longer to let rapid panning settle
};
