import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Server-side cache for grid prefetching to avoid spamming Open-Meteo
const gridCache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

router.get('/point-intelligence-grid', async (req, res) => {
    try {
        const { south, west, north, east } = req.query;
        if (!south || !west || !north || !east) {
            return res.status(400).json({ success: false, error: "Missing bounds parameters" });
        }

        const s = parseFloat(south);
        const w = parseFloat(west);
        const n = parseFloat(north);
        const e = parseFloat(east);

        // Generate a coarse 3x3 grid for prefetching within the bounds
        const latStep = (n - s) / 2;
        const lngStep = (e - w) / 2;
        const points = [];

        for (let i = 0; i <= 2; i++) {
            for (let j = 0; j <= 2; j++) {
                points.push({
                    lat: (s + i * latStep).toFixed(4),
                    lng: (w + j * lngStep).toFixed(4)
                });
            }
        }

        const results = {};
        const now = Date.now();

        // Fetch data for each point, using server-side cache
        const fetchPromises = points.map(async (pt) => {
            // Use 2 decimal places for cache key (~1.1km resolution)
            const cacheKey = `${parseFloat(pt.lat).toFixed(2)},${parseFloat(pt.lng).toFixed(2)}`;
            
            if (gridCache.has(cacheKey)) {
                const cached = gridCache.get(cacheKey);
                if (now - cached.timestamp < CACHE_TTL) {
                    results[cacheKey] = cached.data;
                    return;
                }
            }

            try {
                // Fetch from Open-Meteo
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${pt.lat}&longitude=${pt.lng}&current=temperature_2m,relative_humidity_2m,precipitation,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=precipitation,soil_moisture_3_to_9cm&forecast_days=3&past_days=3&timezone=auto`;
                const response = await fetch(url);
                const data = await response.json();
                
                if (data && data.current) {
                    // Pre-calculate rainfall and soil for the client
                    const currentRain = data.current.precipitation || 0;
                    const hIndex = data.hourly?.time?.findIndex(t => t.startsWith(data.current.time?.substring(0, 13))) || 0;
                    const validIndex = hIndex >= 0 ? hIndex : data.hourly?.time?.length - 72;
                    
                    const pData = {
                        weather: {
                            temperature: data.current.temperature_2m,
                            humidity: data.current.relative_humidity_2m,
                            windSpeed: data.current.wind_speed_10m,
                            windDirection: data.current.wind_direction_10m,
                            pressure: data.current.surface_pressure
                        },
                        rainfall: {
                            current: currentRain,
                            accumulation24h: currentRain * 24, // simplified mock
                            accumulation72h: currentRain * 72
                        },
                        soil: {
                            moisture: (data.hourly?.soil_moisture_3_to_9cm?.[validIndex] || 0.3) * 100,
                            saturationIndex: "NORMAL"
                        }
                    };
                    
                    gridCache.set(cacheKey, { timestamp: now, data: pData });
                    results[cacheKey] = pData;
                }
            } catch (err) {
                console.warn(`Grid fetch failed for ${pt.lat}, ${pt.lng}:`, err.message);
                // Don't fail the whole batch if one point fails
            }
        });

        await Promise.all(fetchPromises);

        res.json({ success: true, data: results });
    } catch (err) {
        console.error("Grid prefetch failed:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
