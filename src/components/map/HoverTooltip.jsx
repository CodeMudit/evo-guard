import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useMapEvents } from 'react-leaflet';
import throttle from 'lodash/throttle';
import { fetchPointIntelligence, getCachedOrNull } from '../../services/pointIntelligenceService';
import { predictRisk } from '../../services/data/riskService';

/**
 * Fixed compact intelligence strip — updates as the cursor moves,
 * but stays in one place on the map (bottom center) instead of a large floating tooltip.
 */
const useMapHoverData = (throttleMs = 180) => {
    const [hoverData, setHoverData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [riskPrediction, setRiskPrediction] = useState(null);
    const [coords, setCoords] = useState(null);
    const abortControllerRef = useRef(null);
    const positionRef = useRef(null);

    const handleMouseMove = useMemo(
        () =>
            throttle(
                async (e) => {
                    const { lat, lng } = e.latlng;
                    positionRef.current = {
                        lat: lat.toFixed(4),
                        lng: lng.toFixed(4),
                    };
                    setCoords({ lat: lat.toFixed(4), lng: lng.toFixed(4) });

                    if (abortControllerRef.current) abortControllerRef.current.abort();

                    const cachedData = getCachedOrNull(lat, lng, { allowStale: true });
                    if (cachedData) {
                        if (positionRef.current.lat === lat.toFixed(4)) {
                            setHoverData(cachedData);
                            predictRisk(cachedData).then((risk) => {
                                if (positionRef.current.lat === lat.toFixed(4)) {
                                    setRiskPrediction(risk);
                                }
                            });
                            setIsLoading(cachedData.freshness === 'STALE');
                        }
                        if (cachedData.freshness === 'CACHED') return;
                    } else {
                        setIsLoading(true);
                    }

                    abortControllerRef.current = new AbortController();
                    try {
                        const data = await fetchPointIntelligence(
                            lat,
                            lng,
                            abortControllerRef.current.signal
                        );
                        const risk = await predictRisk(data);
                        if (positionRef.current.lat === lat.toFixed(4)) {
                            setHoverData(data);
                            setRiskPrediction(risk);
                            setIsLoading(false);
                        }
                    } catch (err) {
                        if (err.message !== 'Request aborted') setIsLoading(false);
                    }
                },
                throttleMs,
                { leading: false, trailing: true }
            ),
        [throttleMs]
    );

    useMapEvents({
        mousemove: handleMouseMove,
        mouseout: () => {
            handleMouseMove.cancel();
            if (abortControllerRef.current) abortControllerRef.current.abort();
            // Keep last reading visible; clear only loading state
            setIsLoading(false);
        },
    });

    useEffect(() => {
        return () => {
            handleMouseMove.cancel();
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, [handleMouseMove]);

    return { hoverData, riskPrediction, isLoading, coords };
};

export const HoverTooltip = () => {
    const { hoverData, riskPrediction, isLoading, coords } = useMapHoverData(180);

    // Always show the bar once the user has moved over the map at least once
    if (!coords && !hoverData) return null;

    const rain = hoverData?.rainfall?.rain24h?.value ?? '—';
    const wind = hoverData?.weather?.windSpeed?.value ?? '—';
    const soil = hoverData?.soil?.moisture?.value ?? '—';
    const elev = hoverData?.terrain?.elevation?.value ?? '—';
    const risk = riskPrediction?.level ?? '—';
    const sus = hoverData?.susceptibility?.level ?? '—';
    const fresh = hoverData?.freshness ?? (isLoading ? '…' : '—');

    const riskColor =
        risk === 'HIGH' || risk === 'EXTREME'
            ? 'text-red-600'
            : risk === 'ELEVATED' || risk === 'MODERATE'
              ? 'text-amber-600'
              : 'text-emerald-600';

    return (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1100] pointer-events-none w-[min(92%,720px)]">
            <div className="bg-[var(--color-surface-primary)]/95 backdrop-blur-sm border border-[var(--color-border)] rounded-lg shadow-lg px-3 py-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--color-text-primary)]">
                <span className="font-mono text-[10px] text-[var(--color-text-muted)] whitespace-nowrap">
                    {coords ? `${coords.lat}°N ${coords.lng}°E` : '—'}
                </span>
                <span className="text-[var(--color-border)] hidden sm:inline">|</span>
                <span className="whitespace-nowrap">
                    Rain <b className="text-sky-700">{rain}</b>
                    <span className="text-[var(--color-text-muted)]"> mm/24h</span>
                </span>
                <span className="whitespace-nowrap">
                    Wind <b className="text-sky-700">{wind}</b>
                    <span className="text-[var(--color-text-muted)]"> km/h</span>
                </span>
                <span className="whitespace-nowrap">
                    Soil <b className="text-sky-700">{soil}</b>
                    <span className="text-[var(--color-text-muted)]">%</span>
                </span>
                <span className="whitespace-nowrap">
                    Elev <b className="text-sky-700">{elev}</b>
                    <span className="text-[var(--color-text-muted)]"> m</span>
                </span>
                <span className="text-[var(--color-border)] hidden sm:inline">|</span>
                <span className="whitespace-nowrap">
                    Risk <b className={riskColor}>{risk}</b>
                </span>
                <span className="whitespace-nowrap">
                    Susc <b className={sus === 'HIGH' ? 'text-red-600' : 'text-emerald-600'}>{sus}</b>
                </span>
                <span
                    className={`ml-auto text-[9px] font-mono uppercase tracking-wider ${
                        fresh === 'LIVE' || fresh === 'CACHED'
                            ? 'text-emerald-600'
                            : fresh === 'STALE'
                              ? 'text-amber-600'
                              : 'text-[var(--color-text-muted)]'
                    }`}
                >
                    {isLoading ? '…' : fresh}
                </span>
            </div>
        </div>
    );
};
