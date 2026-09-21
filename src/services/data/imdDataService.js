/**
 * imdDataService.js
 * 
 * Adapter for Indian Meteorological Department (IMD) / Open-Meteo weather APIs.
 * Normalizes responses into a consistent format.
 */

export const fetchImdData = async (lat, lng) => {
    try {
        // Prototype fallback to Open-Meteo as IMD requires enterprise auth
        const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure,visibility&hourly=precipitation,soil_moisture_3_to_9cm`;
        
        const response = await fetch(meteoUrl);
        const data = await response.json();

        if (!data || !data.current) throw new Error("Invalid Meteo response");

        const current = data.current;
        const hourly = data.hourly;
        
        const now = new Date();
        const currentHourIso = now.toISOString().substring(0, 14) + "00";
        const hIndex = hourly.time.findIndex(t => t.startsWith(currentHourIso)) || hourly.time.length - 72;
        const validIndex = hIndex >= 0 ? hIndex : hourly.time.length - 72;

        const rain1h = hourly.precipitation[validIndex] || 0;
        const rain6h = hourly.precipitation.slice(Math.max(0, validIndex - 6), validIndex).reduce((a, b) => a + (b || 0), 0);
        const rain24h = hourly.precipitation.slice(Math.max(0, validIndex - 24), validIndex).reduce((a, b) => a + (b || 0), 0);
        const soilMoisture = hourly.soil_moisture_3_to_9cm[validIndex] || 0.3;

        return {
            weather: {
                temperature: { value: current.temperature_2m, unit: '°C' },
                humidity: { value: current.relative_humidity_2m, unit: '%' },
                windSpeed: { value: current.wind_speed_10m, unit: 'km/h' },
                windDirection: { value: current.wind_direction_10m, unit: '°' },
            },
            rainfall: {
                current: { value: current.precipitation, unit: 'mm/h' },
                rain1h: { value: rain1h.toFixed(1), unit: 'mm' },
                rain6h: { value: rain6h.toFixed(1), unit: 'mm' },
                rain24h: { value: rain24h.toFixed(1), unit: 'mm' }
            },
            soil: {
                moisture: { value: (soilMoisture * 100).toFixed(1), unit: '%' }
            },
            status: 'LIVE',
            source: 'IMD / Open-Meteo Proxy',
            timestamp: Date.now()
        };
    } catch (error) {
        console.warn("IMD Adapter fetch failed:", error);
        return {
            status: 'UNAVAILABLE',
            source: 'IMD / Open-Meteo Proxy',
            timestamp: Date.now()
        };
    }
};
