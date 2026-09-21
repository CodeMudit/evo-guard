/**
 * isolationService.js
 * 
 * Separates LANDSLIDE PROBABILITY from NETWORK ISOLATION RISK.
 * Implements POST /api/v1/scenarios/road-closure
 */

export const simulateRoadClosure = async (roadSegmentId) => {
    // Simulate backend computation graph
    await new Promise(res => setTimeout(res, 800));

    // Dynamic generation based on segment ID string length/chars to make it deterministic but varied
    const baseHash = Array.from(String(roadSegmentId || "default")).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const penalty = (baseHash % 90) + 15;
    const popExposed = (baseHash % 100) * 125 + 500;
    const hasAlt = baseHash % 2 === 0;

    return {
        road_segment_id: roadSegmentId,
        disconnected_components: (baseHash % 4) + 1,
        affected_communities: [
            { name: "Sector Alpha", population: Math.floor(popExposed * 0.6) },
            { name: "Sector Beta", population: Math.floor(popExposed * 0.4) }
        ],
        total_population_exposed: popExposed,
        affected_facilities: {
            hospitals: baseHash % 3,
            schools: (baseHash % 5) + 1,
            bridges: (baseHash % 2) + 1
        },
        alternative_routes_available: hasAlt,
        travel_time_penalty_minutes: penalty,
        hospital_accessibility: hasAlt ? "DELAYED" : "COMPROMISED",
        response_impact: penalty > 60 ? "CRITICAL" : penalty > 30 ? "HIGH" : "MODERATE",
        status: "DYNAMIC SIMULATION"
    };
};
