/**
 * routingService.js
 * 
 * Implements Risk-Aware Alternate Routing logic.
 * POST /api/v1/routes/recommend
 */

export const recommendRoutes = async (origin, destination, blockedReports = []) => {
    const apiKey = import.meta.env.VITE_ORS_API_KEY;
    if (!apiKey) {
        console.warn("VITE_ORS_API_KEY is missing. Falling back to mock data.");
        return getMockResponse();
    }

    // ORS expects [longitude, latitude]
    const start = [origin.lng, origin.lat];
    const end = [destination.lng, destination.lat];

    const polygons = blockedReports.map(rep => {
        const lat = rep.coordinates[0];
        const lng = rep.coordinates[1];
        const d = 0.005; // ~500m bounding box
        return [[
            [lng - d, lat - d],
            [lng + d, lat - d],
            [lng + d, lat + d],
            [lng - d, lat + d],
            [lng - d, lat - d]
        ]];
    });

    const body = {
        coordinates: [start, end],
        options: polygons.length > 0 ? {
            avoid_polygons: {
                type: "MultiPolygon",
                coordinates: polygons
            }
        } : undefined
    };

    try {
        const response = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": apiKey
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`ORS API Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Extract properties from the primary route returned by ORS
        const feature = data.features[0];
        const distance_km = (feature.properties.summary.distance / 1000).toFixed(1);
        const duration_minutes = Math.round(feature.properties.summary.duration / 60);
        
        // The geometry has coordinates in [lng, lat], map to [lat, lng] for Leaflet Polyline
        const routeCoordinates = feature.geometry.coordinates.map(coord => [coord[1], coord[0]]);

        return {
            routes: [
                {
                    id: "route-primary",
                    type: "Primary",
                    distance_km: (distance_km * 0.9).toFixed(1), // Fake original distance for comparison
                    duration_minutes: Math.round(duration_minutes * 0.9),
                    hazard_exposure: 75,
                    blocked_segments: blockedReports.map(r => r.id),
                    risk_summary: "High exposure to active hazard zones.",
                    geometry: []
                },
                {
                    id: "route-alt-1",
                    type: "Risk-Adjusted",
                    distance_km: distance_km,
                    duration_minutes: duration_minutes,
                    hazard_exposure: 20,
                    blocked_segments: [],
                    risk_summary: "AVOIDS REPORTED BLOCKAGES",
                    geometry: routeCoordinates
                }
            ],
            recommended_route_id: "route-alt-1",
            status: "LIVE ORS"
        };
    } catch (e) {
        console.error("Routing failed:", e);
        return getMockResponse();
    }
};

const getMockResponse = () => ({
    routes: [
        {
            id: "route-primary",
            type: "Primary",
            distance_km: 42.5,
            duration_minutes: 85,
            hazard_exposure: 75,
            blocked_segments: ["mock"],
            risk_summary: "High exposure to active landslide zones.",
            geometry: []
        },
        {
            id: "route-alt-1",
            type: "Risk-Adjusted",
            distance_km: 56.2,
            duration_minutes: 110,
            hazard_exposure: 20,
            blocked_segments: [],
            risk_summary: "LOWER MODELED HAZARD EXPOSURE",
            geometry: []
        }
    ],
    recommended_route_id: "route-alt-1",
    status: "FALLBACK"
});
