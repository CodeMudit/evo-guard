import { fetchImdData } from './data/imdDataService';
import { fetchSatelliteData } from './data/satelliteDataService';
import { API_URL } from '../config';

/**
 * pointIntelligenceService.js
 *
 * Unified geographic point intelligence for hover/click.
 * Spatial grid cache + viewport prefetch + stale-while-revalidate.
 */

const spatialCache = new Map();
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 mins
const STALE_DURATION_MS = 45 * 60 * 1000; // serve stale up to 45 mins while revalidating

// Coarser grid (~2.2 km) reduces distinct fetches per viewport
const getGridKey = (lat, lng) => {
    return `${(Math.round(parseFloat(lat) * 50) / 50).toFixed(2)},${(Math.round(parseFloat(lng) * 50) / 50).toFixed(2)}`;
};

const mark = (name) => {
    try {
        if (typeof performance !== 'undefined' && performance.mark) {
            performance.mark(name);
        }
    } catch (_) { /* ignore */ }
};

const measure = (name, start, end) => {
    try {
        if (typeof performance !== 'undefined' && performance.measure) {
            performance.measure(name, start, end);
            const entries = performance.getEntriesByName(name);
            const last = entries[entries.length - 1];
            if (last) {
                console.debug(`[perf] ${name}: ${last.duration.toFixed(1)}ms`);
            }
        }
    } catch (_) { /* ignore */ }
};

export const getCachedOrNull = (lat, lng, { allowStale = false } = {}) => {
    const gridKey = getGridKey(lat, lng);
    const now = Date.now();

    if (spatialCache.has(gridKey)) {
        const cached = spatialCache.get(gridKey);
        const age = now - cached.timestamp;
        if (age < CACHE_DURATION_MS) {
            return {
                ...cached.data,
                coordinates: { lat: parseFloat(lat).toFixed(4), lng: parseFloat(lng).toFixed(4) },
                freshness: 'CACHED',
            };
        }
        if (allowStale && age < STALE_DURATION_MS) {
            return {
                ...cached.data,
                coordinates: { lat: parseFloat(lat).toFixed(4), lng: parseFloat(lng).toFixed(4) },
                freshness: 'STALE',
            };
        }
    }
    return null;
};

const buildPointData = (lat, lng, imdData, satelliteData, freshness = 'LIVE') => ({
    coordinates: { lat: parseFloat(lat).toFixed(4), lng: parseFloat(lng).toFixed(4) },
    weather: imdData.weather || null,
    rainfall: imdData.rainfall || null,
    soil: imdData.soil || null,
    terrain: satelliteData.terrain || null,
    susceptibility: satelliteData.susceptibility || null,
    ndvi: satelliteData.ndvi || null,
    changeDetection: satelliteData.changeDetection || null,
    freshness,
    sources: {
        weather: imdData.source,
        terrain: satelliteData.source,
    },
    timestamp: new Date().toISOString(),
});

export const fetchPointIntelligence = async (lat, lng, signal = null) => {
    mark('point-intel-start');

    // Stale-while-revalidate: return stale immediately if present
    const stale = getCachedOrNull(lat, lng, { allowStale: true });
    const gridKey = getGridKey(lat, lng);
    const now = Date.now();

    // Fresh hit
    const fresh = getCachedOrNull(lat, lng, { allowStale: false });
    if (fresh) {
        mark('point-intel-end');
        measure('point-intelligence', 'point-intel-start', 'point-intel-end');
        return fresh;
    }

    // Prefer backend single-point proxy when available
    if (API_URL) {
        try {
            const response = await fetch(
                `${API_URL}/api/map/point-intelligence?lat=${lat}&lng=${lng}`,
                { signal }
            );
            const json = await response.json();
            if (json.success && json.data) {
                const satelliteData = await fetchSatelliteData(lat, lng);
                // Normalize backend weather shape to client shape if needed
                const imdLike = normalizeBackendWeather(json.data);
                const pointData = buildPointData(lat, lng, imdLike, satelliteData, 'LIVE');
                spatialCache.set(gridKey, { timestamp: now, data: pointData });
                mark('point-intel-end');
                measure('point-intelligence', 'point-intel-start', 'point-intel-end');
                return pointData;
            }
        } catch (err) {
            if (err.name === 'AbortError' || err.message === 'Request aborted') throw err;
            console.warn('Backend point-intelligence failed, falling back to direct:', err.message);
        }
    }

    try {
        const [imdData, satelliteData] = await Promise.all([
            fetchImdData(lat, lng),
            fetchSatelliteData(lat, lng),
        ]);

        if (signal && signal.aborted) {
            throw new Error('Request aborted');
        }

        const pointData = buildPointData(lat, lng, imdData, satelliteData, 'LIVE');
        spatialCache.set(gridKey, { timestamp: now, data: pointData });
        mark('point-intel-end');
        measure('point-intelligence', 'point-intel-start', 'point-intel-end');
        return pointData;
    } catch (error) {
        if (error.message === 'Request aborted') throw error;

        console.warn('Point Intelligence Fetch Failed:', error);

        if (stale) {
            return stale;
        }
        if (spatialCache.has(gridKey)) {
            return {
                ...spatialCache.get(gridKey).data,
                coordinates: { lat: parseFloat(lat).toFixed(4), lng: parseFloat(lng).toFixed(4) },
                freshness: 'STALE',
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
            timestamp: new Date().toISOString(),
        };
    }
};

/** Normalize backend grid/point payload into the client IMD shape. */
function normalizeBackendWeather(value) {
    if (value.weather?.temperature?.value != null || value.rainfall?.rain24h) {
        return value; // already client-shaped
    }
    const w = value.weather || {};
    const r = value.rainfall || {};
    const s = value.soil || {};
    return {
        weather: {
            temperature: { value: w.temperature ?? 0, unit: '°C' },
            humidity: { value: w.humidity ?? 0, unit: '%' },
            windSpeed: { value: w.windSpeed ?? 0, unit: 'km/h' },
            windDirection: { value: w.windDirection ?? 0, unit: '°' },
        },
        rainfall: {
            current: { value: r.current ?? 0, unit: 'mm/h' },
            rain1h: { value: (r.current ?? 0).toFixed?.(1) ?? '0', unit: 'mm' },
            rain6h: { value: ((r.accumulation24h ?? 0) / 4).toFixed?.(1) ?? '0', unit: 'mm' },
            rain24h: { value: (r.accumulation24h ?? r.current * 24 ?? 0).toFixed?.(1) ?? '0', unit: 'mm' },
        },
        soil: {
            moisture: { value: (typeof s.moisture === 'number' ? s.moisture : 30).toFixed?.(1) ?? '30', unit: '%' },
        },
        source: 'Open-Meteo Proxy',
    };
}

/**
 * Prefetch a bounded grid of points to eliminate perceived latency on hover.
 * Backend batch preferred; otherwise client-side with higher concurrency and
 * coarser step.
 */

let prefetchDebounceTimer = null;
let prefetchAbortController = null;
const GRID_STEP = 0.02; // coarser than cache key → fewer parallel requests
const MAX_CONCURRENT = 8;
const MAX_AREA_DEG = 0.4;
const PREFETCH_DEBOUNCE_MS = 350; // more aggressive than 600ms

export const prefetchGridIntelligence = (bounds) => {
    const south = bounds.getSouthWest().lat;
    const west = bounds.getSouthWest().lng;
    const north = bounds.getNorthEast().lat;
    const east = bounds.getNorthEast().lng;

    if (Math.abs(north - south) > MAX_AREA_DEG || Math.abs(east - west) > MAX_AREA_DEG) {
        return;
    }

    if (prefetchDebounceTimer) clearTimeout(prefetchDebounceTimer);

    prefetchDebounceTimer = setTimeout(async () => {
        mark('prefetch-start');
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
                        const imdLike = normalizeBackendWeather(value);
                        const pointData = buildPointData(lat, lng, imdLike, satelliteData, 'CACHED');
                        spatialCache.set(key, { timestamp: now, data: pointData });
                    }
                }
            } catch (err) {
                if (err.name !== 'AbortError') console.warn('Prefetch (backend) failed:', err.message);
            }
            mark('prefetch-end');
            measure('viewport-prefetch', 'prefetch-start', 'prefetch-end');
            return;
        }

        // --- Mode 2: direct client-side grid fetch ---
        const uncachedPoints = [];
        for (let lat = south; lat <= north; lat += GRID_STEP) {
            for (let lng = west; lng <= east; lng += GRID_STEP) {
                const key = getGridKey(lat, lng);
                if (
                    !spatialCache.has(key) ||
                    Date.now() - spatialCache.get(key).timestamp > CACHE_DURATION_MS
                ) {
                    uncachedPoints.push({
                        lat: parseFloat(lat.toFixed(4)),
                        lng: parseFloat(lng.toFixed(4)),
                        key,
                    });
                }
            }
        }

        if (uncachedPoints.length === 0) {
            mark('prefetch-end');
            measure('viewport-prefetch', 'prefetch-start', 'prefetch-end');
            return;
        }

        for (let i = 0; i < uncachedPoints.length; i += MAX_CONCURRENT) {
            if (signal.aborted) return;

            const batch = uncachedPoints.slice(i, i + MAX_CONCURRENT);
            const now = Date.now();

            const results = await Promise.allSettled(
                batch.map(async ({ lat, lng, key }) => {
                    const [imdData, satelliteData] = await Promise.all([
                        fetchImdData(lat, lng),
                        fetchSatelliteData(lat, lng),
                    ]);
                    if (signal.aborted) return;

                    const pointData = buildPointData(lat, lng, imdData, satelliteData, 'CACHED');
                    spatialCache.set(key, { timestamp: now, data: pointData });
                })
            );

            results.forEach((r, idx) => {
                if (r.status === 'rejected' && r.reason?.name !== 'AbortError') {
                    console.warn(`Prefetch cell ${batch[idx].key} failed:`, r.reason?.message);
                }
            });
        }
        mark('prefetch-end');
        measure('viewport-prefetch', 'prefetch-start', 'prefetch-end');
    }, PREFETCH_DEBOUNCE_MS);
};
