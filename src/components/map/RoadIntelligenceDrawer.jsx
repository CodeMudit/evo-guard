import React, { useState, useEffect, useRef } from "react";
import { X, Route, ShieldAlert, Users, Activity, CheckCircle2 } from "lucide-react";
import { simulateRoadClosure } from "../../services/isolationService";
import {
    recommendRoutes,
    deriveRouteEndpoints,
    isBlockedReport,
} from "../../services/routingService";
import { useApp } from "../../context/AppContext";

/**
 * Derive a blockage coordinate from the road feature center or nearest blocked report.
 * Road LineString coordinates are [lng, lat].
 */
const getRoadMidpoint = (roadFeature) => {
    const coords = roadFeature?.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length === 0) return null;
    const mid = coords[Math.floor(coords.length / 2)];
    return { lat: mid[1], lng: mid[0] };
};

export const RoadIntelligenceDrawer = ({
    roadFeature,
    onClose,
    onRouteCalculated,
    userLocation = null,
}) => {
    const { reports } = useApp();
    const [simulation, setSimulation] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [routes, setRoutes] = useState(null);
    const [isRouting, setIsRouting] = useState(false);
    const lastBlockedCountRef = useRef(0);
    const autoRerouteTriggered = useRef(false);

    if (!roadFeature) return null;

    const { properties } = roadFeature;
    const roadIsBlocked =
        properties?.status === "Blocked" ||
        properties?.status === "Partially Blocked" ||
        (properties?.status || "").toLowerCase().includes("block");

    const blockedReports = (reports || []).filter(isBlockedReport);

    const runReroute = async () => {
        setIsRouting(true);
        try {
            const mid = getRoadMidpoint(roadFeature);
            const { origin, destination } = deriveRouteEndpoints(
                roadFeature,
                userLocation,
                mid
            );
            const result = await recommendRoutes(origin, destination, blockedReports);
            setRoutes(result);
            if (onRouteCalculated && result.routes) {
                const altRoute = result.routes.find(
                    (r) => r.id === result.recommended_route_id
                );
                const primary = result.routes.find((r) => r.id === "route-primary");
                onRouteCalculated({
                    alternate: altRoute?.geometry || null,
                    primary: primary?.geometry || null,
                    status: result.status,
                });
            }
        } catch (e) {
            console.error(e);
        }
        setIsRouting(false);
    };

    const handleSimulate = async () => {
        setIsSimulating(true);
        try {
            const result = await simulateRoadClosure(properties.id || properties.name || "road-1");
            setSimulation(result);
        } catch (e) {
            console.error(e);
        }
        setIsSimulating(false);
    };

    // Auto-reroute when opening a blocked road, or when blockage count increases
    useEffect(() => {
        autoRerouteTriggered.current = false;
        lastBlockedCountRef.current = blockedReports.length;
        if (roadIsBlocked || blockedReports.length > 0) {
            autoRerouteTriggered.current = true;
            runReroute();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roadFeature]);

    useEffect(() => {
        if (blockedReports.length > lastBlockedCountRef.current) {
            lastBlockedCountRef.current = blockedReports.length;
            runReroute();
        } else {
            lastBlockedCountRef.current = blockedReports.length;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reports]);

    return (
        <div className="absolute right-3 top-3 bottom-3 w-80 bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded shadow-xl z-[1001] flex flex-col overflow-hidden pointer-events-auto transform transition-transform">
            <div className="bg-[var(--color-surface-secondary)] p-3 flex items-center justify-between border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
                    <Route className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-sm uppercase tracking-wider text-[var(--color-text-primary)]">
                        Road Intel
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-slate-100 rounded text-[var(--color-text-secondary)] hover:text-slate-900 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[var(--color-page-bg)]">
                {/* Status Block */}
                <div className="bg-white p-3 border border-[var(--color-border)] rounded shadow-sm">
                    <div className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">
                        Segment Details
                    </div>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-[var(--color-text-secondary)] font-medium">
                                Name
                            </span>
                            <span className="font-bold text-[var(--color-text-primary)]">
                                {properties.name || "Unnamed segment"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[var(--color-text-secondary)] font-medium">
                                Status
                            </span>
                            <span
                                className={`font-bold px-2 py-0.5 rounded ${
                                    properties.status === "Open"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-red-50 text-red-700"
                                }`}
                            >
                                {properties.status}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[var(--color-text-secondary)] font-medium">
                                Hazard Risk
                            </span>
                            <span className="font-bold text-red-600">HIGH EXPOSURE</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[var(--color-text-secondary)] font-medium">
                                Criticality
                            </span>
                            <span className="font-bold text-[var(--color-text-primary)]">
                                Level 1 (Primary)
                            </span>
                        </div>
                        {blockedReports.length > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-[var(--color-text-secondary)] font-medium">
                                    Active Blockages
                                </span>
                                <span className="font-bold text-amber-700">
                                    {blockedReports.length}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Network Isolation Simulation */}
                {!simulation ? (
                    <button
                        onClick={handleSimulate}
                        disabled={isSimulating}
                        className="w-full py-3 bg-white hover:bg-slate-50 text-blue-600 text-[11px] font-bold rounded flex items-center justify-center gap-2 transition-colors border border-blue-200 shadow-sm uppercase tracking-wider disabled:opacity-50"
                    >
                        {isSimulating ? (
                            <Activity className="w-4 h-4 animate-pulse" />
                        ) : (
                            <ShieldAlert className="w-4 h-4" />
                        )}
                        {isSimulating ? "Simulating..." : "Simulate Road Closure"}
                    </button>
                ) : (
                    <div className="bg-white border border-[var(--color-border)] rounded shadow-sm overflow-hidden">
                        <div className="bg-red-50 p-2.5 border-b border-red-100 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5" /> CLOSURE IMPACT
                            </span>
                            <span className="text-[8px] bg-red-100 text-red-800 px-1 rounded font-mono font-bold tracking-tight">
                                PREDICTIVE
                            </span>
                        </div>
                        <div className="p-3 space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <div className="bg-slate-50 p-2 rounded border border-slate-100 text-center">
                                    <Users className="w-4 h-4 text-[var(--color-text-secondary)] mx-auto mb-1" />
                                    <div className="font-black text-[var(--color-text-primary)] text-sm">
                                        {simulation.total_population_exposed.toLocaleString()}
                                    </div>
                                    <div className="text-[9px] text-[var(--color-text-muted)] font-bold uppercase mt-0.5">
                                        Pop. Exposed
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-2 rounded border border-slate-100 text-center">
                                    <Route className="w-4 h-4 text-[var(--color-text-secondary)] mx-auto mb-1" />
                                    <div className="font-black text-red-600 text-sm">
                                        +{simulation.travel_time_penalty_minutes} min
                                    </div>
                                    <div className="text-[9px] text-[var(--color-text-muted)] font-bold uppercase mt-0.5">
                                        Travel Penalty
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[9px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">
                                    Affected Communities
                                </span>
                                {simulation.affected_communities.map((c, i) => (
                                    <div
                                        key={i}
                                        className="flex justify-between items-center text-[10px] border-b border-slate-50 pb-1"
                                    >
                                        <span className="font-medium text-[var(--color-text-primary)]">
                                            {c.name}
                                        </span>
                                        <span className="text-[var(--color-text-muted)] font-mono">
                                            {c.population} people
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between text-[11px] bg-amber-50 p-2 rounded border border-amber-100 mt-2">
                                <span className="font-bold text-amber-800">Hospital Access</span>
                                <span className="font-bold text-red-600 uppercase tracking-wider">
                                    {simulation.hospital_accessibility}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Routing Simulation */}
                {!routes ? (
                    <button
                        onClick={runReroute}
                        disabled={isRouting}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded flex items-center justify-center gap-2 transition-colors shadow-sm uppercase tracking-wider disabled:opacity-50"
                    >
                        {isRouting ? (
                            <Activity className="w-4 h-4 animate-pulse" />
                        ) : (
                            <Route className="w-4 h-4" />
                        )}
                        {isRouting ? "Calculating routes..." : "Find Risk-Adjusted Route"}
                    </button>
                ) : (
                    <div className="bg-white border border-[var(--color-border)] rounded shadow-sm overflow-hidden">
                        <div className="bg-emerald-50 p-2.5 border-b border-emerald-100 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" /> RECOMMENDED ROUTE
                            </span>
                            <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 rounded font-mono font-bold tracking-tight uppercase">
                                {routes.status === "LIVE ORS" ? "LIVE ORS" : "RISK-ADJUSTED"}
                            </span>
                        </div>
                        <div className="p-3 space-y-3">
                            {routes.routes.map((r) => {
                                const isRecommended = r.id === routes.recommended_route_id;
                                return (
                                    <div
                                        key={r.id}
                                        className={`p-2 rounded border ${
                                            isRecommended
                                                ? "bg-blue-50 border-blue-200"
                                                : "bg-slate-50 border-slate-200"
                                        }`}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span
                                                className={`font-bold text-[11px] uppercase tracking-wider ${
                                                    isRecommended
                                                        ? "text-blue-800"
                                                        : "text-slate-600"
                                                }`}
                                            >
                                                {r.type} Route
                                            </span>
                                            <span className="font-mono text-[10px] font-bold text-slate-500">
                                                {r.distance_km} km
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-[var(--color-text-secondary)]">
                                            <span>Est. Time: {r.duration_minutes} min</span>
                                            <span
                                                className={
                                                    r.hazard_exposure > 50
                                                        ? "text-red-600 font-bold"
                                                        : "text-emerald-600 font-bold"
                                                }
                                            >
                                                Hazard Exp: {r.hazard_exposure}%
                                            </span>
                                        </div>
                                        {isRecommended && (
                                            <div className="mt-1.5 pt-1.5 border-t border-blue-100 text-[9px] text-blue-700 font-bold uppercase tracking-wider flex items-center justify-center">
                                                ★ {r.risk_summary}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <button
                                onClick={runReroute}
                                disabled={isRouting}
                                className="w-full py-2 text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:bg-blue-50 rounded border border-blue-100 disabled:opacity-50"
                            >
                                {isRouting ? "Recalculating..." : "Recalculate"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
