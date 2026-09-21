import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Server-side cache for Open-Meteo responses (shared by grid + single-point)
const gridCache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

const cacheKey = (lat, lng) =>
    `${(Math.round(parseFloat(lat) * 50) / 50).toFixed(2)},${(Math.round(parseFloat(lng) * 50) / 50).toFixed(2)}`;

async function fetchOpenMeteoPoint(lat, lng) {
    const key = cacheKey(lat, lng);
    const now = Date.now();
    if (gridCache.has(key)) {
        const cached = gridCache.get(key);
        if (now - cached.timestamp < CACHE_TTL) {
            return { data: cached.data, fromCache: true };
        }
    }

    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
        `&current=temperature_2m,relative_humidity_2m,precipitation,surface_pressure,wind_speed_10m,wind_direction_10m` +
        `&hourly=precipitation,soil_moisture_3_to_9cm&forecast_days=3&past_days=3&timezone=auto`;

    const response = await fetch(url);
    const data = await response.json();
    if (!data || !data.current) {
        throw new Error('Invalid Open-Meteo response');
    }

    const currentRain = data.current.precipitation || 0;
    const hIndex =
        data.hourly?.time?.findIndex((t) =>
            t.startsWith(data.current.time?.substring(0, 13))
        ) || 0;
    const validIndex = hIndex >= 0 ? hIndex : (data.hourly?.time?.length || 1) - 72;

    const rain24h = (data.hourly?.precipitation || [])
        .slice(Math.max(0, validIndex - 24), validIndex)
        .reduce((a, b) => a + (b || 0), 0);

    const pData = {
        weather: {
            temperature: data.current.temperature_2m,
            humidity: data.current.relative_humidity_2m,
            windSpeed: data.current.wind_speed_10m,
            windDirection: data.current.wind_direction_10m,
            pressure: data.current.surface_pressure,
        },
        rainfall: {
            current: currentRain,
            accumulation24h: rain24h,
            accumulation72h: rain24h * 2, // approximate
        },
        soil: {
            moisture: (data.hourly?.soil_moisture_3_to_9cm?.[validIndex] || 0.3) * 100,
            saturationIndex: 'NORMAL',
        },
    };

    gridCache.set(key, { timestamp: now, data: pData });
    return { data: pData, fromCache: false };
}

/** Single-point proxy — used by client for hover cache misses. */
router.get('/point-intelligence', async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ success: false, error: 'Missing lat/lng' });
        }
        const { data, fromCache } = await fetchOpenMeteoPoint(lat, lng);
        res.json({
            success: true,
            data,
            meta: { fromCache, cacheKey: cacheKey(lat, lng) },
        });
    } catch (err) {
        console.error('Point intelligence failed:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/** Viewport grid prefetch — denser 5×5 sampling within bounds. */
router.get('/point-intelligence-grid', async (req, res) => {
    try {
        const { south, west, north, east } = req.query;
        if (!south || !west || !north || !east) {
            return res.status(400).json({ success: false, error: 'Missing bounds parameters' });
        }

        const s = parseFloat(south);
        const w = parseFloat(west);
        const n = parseFloat(north);
        const e = parseFloat(east);

        // 5×5 grid (25 points) — denser than previous 3×3, still bounded
        const steps = 4;
        const latStep = (n - s) / steps;
        const lngStep = (e - w) / steps;
        const points = [];

        for (let i = 0; i <= steps; i++) {
            for (let j = 0; j <= steps; j++) {
                points.push({
                    lat: (s + i * latStep).toFixed(4),
                    lng: (w + j * lngStep).toFixed(4),
                });
            }
        }

        const results = {};
        await Promise.all(
            points.map(async (pt) => {
                try {
                    const { data } = await fetchOpenMeteoPoint(pt.lat, pt.lng);
                    results[cacheKey(pt.lat, pt.lng)] = data;
                } catch (err) {
                    console.warn(`Grid fetch failed for ${pt.lat}, ${pt.lng}:`, err.message);
                }
            })
        );

        res.json({ success: true, data: results });
    } catch (err) {
        console.error('Grid prefetch failed:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
