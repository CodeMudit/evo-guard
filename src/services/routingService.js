/**
 * routingService.js
 *
 * Implements Risk-Aware Alternate Routing logic against OpenRouteService.
 * Falls back to mock geometry when VITE_ORS_API_KEY is absent.
 */

/** Build a simple offset polyline as mock alternate route around a blockage. */
const buildMockAlternateGeometry = (origin, destination, blockedReports = []) => {
    const start = [origin.lat, origin.lng];
    const end = [destination.lat, destination.lng];
    const midLat = (start[0] + end[0]) / 2;
    const midLng = (start[1] + end[1]) / 2;
    // Offset perpendicular to the corridor so the alternate is visibly distinct
    const offset = 0.04;
    const waypoints = [
        start,
        [midLat + offset, midLng - offset * 0.5],
        [midLat + offset * 0.6, midLng + offset * 0.3],
        end,
    ];
    // If we have a blocked report, ensure the path arcs around its coordinates
    if (blockedReports.length > 0) {
        const b = blockedReports[0];
        const blat = Array.isArray(b.coordinates) ? b.coordinates[0] : b.lat;
        const blng = Array.isArray(b.coordinates) ? b.coordinates[1] : b.lng;
        if (blat != null && blng != null) {
            waypoints.splice(1, 0, [blat + offset, blng - offset]);
        }
    }
    return waypoints;
};

const getMockResponse = (origin, destination, blockedReports = []) => {
    const hasCoords = origin && destination && origin.lat != null && destination.lat != null;
    const geometry = hasCoords
        ? buildMockAlternateGeometry(origin, destination, blockedReports)
        : [];

    // Approximate distance from haversine-ish delta for display
    let distance_km = 56.2;
    if (hasCoords) {
        const dlat = Math.abs(destination.lat - origin.lat);
        const dlng = Math.abs(destination.lng - origin.lng);
        distance_km = Math.max(5, Math.round((Math.sqrt(dlat * dlat + dlng * dlng) * 111 + 12) * 10) / 10);
    }

    return {
        routes: [
            {
                id: "route-primary",
                type: "Primary",
                distance_km: (distance_km * 0.75).toFixed(1),
                duration_minutes: Math.round(distance_km * 0.75 * 1.5),
                hazard_exposure: 75,
                blocked_segments: blockedReports.map((r) => r.id || "mock"),
                risk_summary: "High exposure to active landslide zones.",
                geometry: hasCoords
                    ? [
                          [origin.lat, origin.lng],
                          [destination.lat, destination.lng],
                      ]
                    : [],
            },
            {
                id: "route-alt-1",
                type: "Risk-Adjusted",
                distance_km: distance_km.toFixed(1),
                duration_minutes: Math.round(distance_km * 1.9),
                hazard_exposure: 20,
                blocked_segments: [],
                risk_summary: "LOWER MODELED HAZARD EXPOSURE",
                geometry,
            },
        ],
        recommended_route_id: "route-alt-1",
        status: "FALLBACK",
    };
};

/**
 * Recommend risk-aware routes that avoid blocked report polygons.
 * @param {{lat:number,lng:number}} origin
 * @param {{lat:number,lng:number}} destination
 * @param {Array} blockedReports - reports with coordinates [lat,lng] and optional id
 * @returns {Promise<{routes:Array, recommended_route_id:string, status:string}>}
 */
export const recommendRoutes = async (origin, destination, blockedReports = []) => {
    const apiKey = import.meta.env.VITE_ORS_API_KEY;
    if (!apiKey || !origin || !destination) {
        if (!apiKey) console.warn("VITE_ORS_API_KEY is missing. Falling back to mock data.");
        return getMockResponse(origin, destination, blockedReports);
    }

    // ORS expects [longitude, latitude]
    const start = [origin.lng, origin.lat];
    const end = [destination.lng, destination.lat];

    const polygons = (blockedReports || [])
        .filter((rep) => {
            const c = rep.coordinates;
            return Array.isArray(c) && c.length >= 2;
        })
        .map((rep) => {
            const lat = rep.coordinates[0];
            const lng = rep.coordinates[1];
            const d = 0.005; // ~500m bounding box
            return [
                [
                    [lng - d, lat - d],
                    [lng + d, lat - d],
                    [lng + d, lat + d],
                    [lng - d, lat + d],
                    [lng - d, lat - d],
                ],
            ];
        });

    const body = {
        coordinates: [start, end],
        options:
            polygons.length > 0
                ? {
                      avoid_polygons: {
                          type: "MultiPolygon",
                          coordinates: polygons,
                      },
                  }
                : undefined,
    };

    try {
        const response = await fetch(
            "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: apiKey,
                },
                body: JSON.stringify(body),
            }
        );

        if (!response.ok) {
            throw new Error(`ORS API Error: ${response.status}`);
        }

        const data = await response.json();
        const feature = data.features[0];
        const distance_km = (feature.properties.summary.distance / 1000).toFixed(1);
        const duration_minutes = Math.round(feature.properties.summary.duration / 60);
        const routeCoordinates = feature.geometry.coordinates.map((coord) => [
            coord[1],
            coord[0],
        ]);

        return {
            routes: [
                {
                    id: "route-primary",
                    type: "Primary",
                    distance_km: (distance_km * 0.9).toFixed(1),
                    duration_minutes: Math.round(duration_minutes * 0.9),
                    hazard_exposure: 75,
                    blocked_segments: blockedReports.map((r) => r.id),
                    risk_summary: "High exposure to active hazard zones.",
                    geometry: [
                        [origin.lat, origin.lng],
                        [destination.lat, destination.lng],
                    ],
                },
                {
                    id: "route-alt-1",
                    type: "Risk-Adjusted",
                    distance_km,
                    duration_minutes,
                    hazard_exposure: 20,
                    blocked_segments: [],
                    risk_summary: "AVOIDS REPORTED BLOCKAGES",
                    geometry: routeCoordinates,
                },
            ],
            recommended_route_id: "route-alt-1",
            status: "LIVE ORS",
        };
    } catch (e) {
        console.error("Routing failed:", e);
        return getMockResponse(origin, destination, blockedReports);
    }
};

/**
 * Derive origin/destination from a clicked road feature LineString and
 * optional user location / blockage point.
 * Road GeoJSON coordinates are [lng, lat].
 */
export const deriveRouteEndpoints = (roadFeature, userLocation = null, blockagePoint = null) => {
    const coords = roadFeature?.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) {
        // Fallback corridor around Shillong / default map center
        return {
            origin: userLocation || { lat: 25.268, lng: 91.738 },
            destination: { lat: 25.3, lng: 91.8 },
        };
    }

    // LineString: first and last vertices
    const first = coords[0];
    const last = coords[coords.length - 1];
    let origin = { lat: first[1], lng: first[0] };
    let destination = { lat: last[1], lng: last[0] };

    // If user location is known, pick the nearer endpoint as origin
    if (userLocation?.lat != null && userLocation?.lng != null) {
        const dFirst =
            Math.hypot(userLocation.lat - origin.lat, userLocation.lng - origin.lng);
        const dLast =
            Math.hypot(userLocation.lat - destination.lat, userLocation.lng - destination.lng);
        if (dLast < dFirst) {
            // Swap so origin is nearer the user
            [origin, destination] = [destination, origin];
        }
    }

    // If a blockage is on the segment, snap destination past the blockage midpoint
    if (blockagePoint?.lat != null && blockagePoint?.lng != null) {
        // Keep endpoints as road ends; ORS avoid_polygons handles the detour
    }

    return { origin, destination };
};

/** Reports that should be treated as road blockages for avoid_polygons. */
export const isBlockedReport = (report) => {
    if (!report) return false;
    const title = (report.title || "").toLowerCase();
    const status = (report.status || "").toLowerCase();
    const severity = (report.severity || "").toUpperCase();
    return (
        title.includes("block") ||
        status.includes("block") ||
        status === "active" && (severity === "CRITICAL" || severity === "HIGH") ||
        severity === "CRITICAL"
    );
};
