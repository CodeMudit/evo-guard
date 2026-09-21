import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useMapEvents } from 'react-leaflet';
import throttle from 'lodash/throttle';
import { fetchPointIntelligence, getCachedOrNull } from '../../services/pointIntelligenceService';
import { predictRisk } from '../../services/data/riskService';

// Custom hook to handle map hover and point intelligence fetching
const useMapHoverData = (throttleMs = 250) => {
    const [hoverData, setHoverData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [riskPrediction, setRiskPrediction] = useState(null);
    const abortControllerRef = useRef(null);
    const positionRef = useRef(null);

    const handleMouseMove = useMemo(
        () => throttle(async (e) => {
            const { lat, lng } = e.latlng;
            const { clientX, clientY } = e.originalEvent;
            
            positionRef.current = { x: clientX, y: clientY, lat: lat.toFixed(4), lng: lng.toFixed(4) };

            if (abortControllerRef.current) abortControllerRef.current.abort();
            
            // Check cache synchronously first to prevent loading flash
            const cachedData = getCachedOrNull(lat, lng);
            if (cachedData) {
                if (positionRef.current.lat === lat.toFixed(4)) {
                    setHoverData({ ...cachedData, x: clientX, y: clientY });
                    // Predict risk is mostly synchronous but mocked with small delay.
                    predictRisk(cachedData).then(risk => {
                        if (positionRef.current.lat === lat.toFixed(4)) {
                            setRiskPrediction(risk);
                        }
                    });
                    setIsLoading(false);
                }
                return;
            }

            abortControllerRef.current = new AbortController();
            setIsLoading(true);
            try {
                const data = await fetchPointIntelligence(lat, lng, abortControllerRef.current.signal);
                const risk = await predictRisk(data);

                if (positionRef.current.lat === lat.toFixed(4)) {
                    setHoverData({ ...data, x: positionRef.current.x, y: positionRef.current.y });
                    setRiskPrediction(risk);
                    setIsLoading(false);
                }
            } catch (err) {
                if (err.message !== "Request aborted") setIsLoading(false);
            }
        }, throttleMs, { leading: false, trailing: true }),
        [throttleMs]
    );

    useMapEvents({
        mousemove: handleMouseMove,
        mouseout: () => {
            handleMouseMove.cancel();
            if (abortControllerRef.current) abortControllerRef.current.abort();
            setHoverData(null);
            setRiskPrediction(null);
            setIsLoading(false);
        }
    });

    useEffect(() => {
        return () => {
            handleMouseMove.cancel();
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, [handleMouseMove]);

    return { hoverData, riskPrediction, isLoading, position: positionRef.current };
};

export const HoverTooltip = () => {
    const { hoverData, riskPrediction, isLoading, position } = useMapHoverData(250); 
    const tooltipRef = useRef(null);

    if (!hoverData && !isLoading) return null;

    const activePosition = hoverData || position;
    if (!activePosition) return null;

    return (
        <div
            ref={tooltipRef}
            className="fixed pointer-events-none z-[2000] rounded shadow-2xl transition-opacity duration-100 flex flex-col min-w-[280px]"
            style={{
                left: `${activePosition.x + 15}px`,
                top: `${activePosition.y + 15}px`,
                transform: 'translate(0, 0)',
                background: 'rgba(10, 15, 20, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(4px)',
                fontFamily: 'system-ui, sans-serif'
            }}
        >
            <div className="px-3 py-1.5 flex justify-between items-center bg-white/5 border-b border-white/10 rounded-t">
                <span className="text-[10px] text-white/70 font-mono tracking-wider">
                    {activePosition.lat}° N, {activePosition.lng}° E
                </span>
                {isLoading && !hoverData && (
                    <span className="text-[9px] text-yellow-400 font-bold uppercase tracking-wider animate-pulse">Loading...</span>
                )}
            </div>
            
            {hoverData && (
                <div className="p-3 space-y-2">
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-white/90 leading-tight">
                        <span>Rain: <span className="font-bold text-yellow-400">{hoverData.rainfall?.rain24h?.value || 0} mm/24h</span></span>
                        <span>Wind: <span className="font-bold text-yellow-400">{hoverData.weather?.windSpeed?.value || 0} km/h</span></span>
                        <span>Soil: <span className="font-bold text-yellow-400">{hoverData.soil?.moisture?.value || 0}%</span></span>
                        <span>Elev: <span className="font-bold text-yellow-400">{hoverData.terrain?.elevation?.value || 0}m</span></span>
                    </div>

                    {riskPrediction && (
                        <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                            <div className="text-[10px] font-bold tracking-wider text-white">
                                RISK: <span className={`${riskPrediction.level === 'HIGH' || riskPrediction.level === 'EXTREME' ? 'text-red-400' : 'text-orange-400'}`}>{riskPrediction.level}</span>
                            </div>
                            <div className="text-[10px] font-bold tracking-wider text-white border-l border-white/20 pl-3">
                                SUSCEPTIBILITY: <span className={`${hoverData.susceptibility?.level === 'HIGH' ? 'text-red-400' : 'text-emerald-400'}`}>{hoverData.susceptibility?.level || 'LOW'}</span>
                            </div>
                        </div>
                    )}

                    <div className="pt-2 flex justify-between items-end text-[9px] text-white/50 font-mono uppercase">
                        <div>
                            Source: IMD / DEM / EcoGuard<br/>
                            Updated: {new Date(hoverData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <span className={`${hoverData.freshness === 'LIVE' || hoverData.freshness === 'CACHED' ? 'text-emerald-400/80' : 'text-red-400/80'}`}>
                            {hoverData.freshness}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
