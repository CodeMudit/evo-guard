import React, { useEffect, useState } from "react";
import { fetchPointIntelligence } from "../../services/pointIntelligenceService";
import { predictRisk, fetchAdaptiveThreshold } from "../../services/riskService";
import { X, MapPin, CloudSun, Droplets, Activity, FilePlus, Mountain, AlertTriangle, Route } from "lucide-react";

export const MapLocationInspector = ({ lat, lng, onClose, onCreateReport, onOpen3D }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [riskInfo, setRiskInfo] = useState(null);
    const [thresholdInfo, setThresholdInfo] = useState(null);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const fetchData = async () => {
            try {
                const result = await fetchPointIntelligence(lat, lng);
                if (isMounted) {
                    setData(result);
                    
                    // Call the Risk Service API
                    const risk = await predictRisk(result);
                    setRiskInfo(risk);
                    
                    // Call the Threshold Service API
                    const rain24h = parseFloat(result.rainfall?.rain24h?.value || 0);
                    const threshold = await fetchAdaptiveThreshold("loc-1", rain24h);
                    setThresholdInfo(threshold);
                    
                    setLoading(false);
                }
            } catch (e) {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [lat, lng]);

    if (!lat || !lng) return null;

    return (
        <div className="absolute right-3 top-3 bottom-3 w-80 bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded shadow-xl z-[1001] flex flex-col overflow-hidden pointer-events-auto transform transition-transform">
            <div className="bg-[var(--color-surface-secondary)] p-3 flex items-center justify-between border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-sm uppercase tracking-wider text-[var(--color-text-primary)]">Location Intel</span>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded text-[var(--color-text-secondary)] hover:text-slate-900 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar bg-[var(--color-page-bg)]">
                {/* LOCATION */}
                <div className="space-y-1 bg-white p-3 border border-[var(--color-border)] rounded">
                    <div className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider mb-1">LOCATION</div>
                    <div className="flex justify-between items-center text-xs text-[var(--color-text-primary)]">
                        <span>Lat: <span className="font-mono font-medium">{lat.toFixed(4)}° N</span></span>
                        <span>Lng: <span className="font-mono font-medium">{lng.toFixed(4)}° E</span></span>
                    </div>
                </div>

                {loading ? (
                    <div className="py-10 flex flex-col items-center justify-center text-[var(--color-text-secondary)] space-y-2">
                        <Activity className="w-6 h-6 animate-pulse" />
                        <span className="text-xs uppercase tracking-widest font-bold">Fetching Live Data...</span>
                    </div>
                ) : data && data.weather ? (
                    <>
                        {/* RISK */}
                        {riskInfo && (
                            <div className="p-3 bg-white rounded border border-[var(--color-border)] shadow-sm space-y-3">
                                <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-2">
                                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> RISK</span>
                                    <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-mono font-bold tracking-tight uppercase">MODEL-DERIVED ESTIMATE</span>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-3xl font-black text-[var(--color-text-primary)] leading-none">{riskInfo.score}</div>
                                        <div className="text-[10px] text-[var(--color-text-muted)] mt-1 font-bold">/ 100 BASE RISK</div>
                                    </div>
                                    <div className={`text-sm font-bold uppercase tracking-wider px-2 py-1 rounded ${riskInfo.level === 'HIGH' || riskInfo.level === 'EXTREME' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                                        {riskInfo.level}
                                    </div>
                                </div>
                                
                                <div className="space-y-1.5 pt-2 border-t border-[var(--color-border)]">
                                    <span className="text-[9px] text-[var(--color-text-secondary)] uppercase tracking-wider font-bold">Primary Risk Factors</span>
                                    {riskInfo.factors.map((f, i) => (
                                        <div key={i} className="flex justify-between items-center text-[11px]">
                                            <span className="text-[var(--color-text-primary)] font-medium">{f.name}</span>
                                            <span className="text-[var(--color-text-muted)] font-mono">{f.contribution}</span>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* MODEL STATUS */}
                                <div className="pt-2 flex justify-between items-center border-t border-[var(--color-border)]">
                                    <span className="text-[9px] text-[var(--color-text-secondary)] font-bold uppercase">Model Status</span>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">{riskInfo.status}</span>
                                </div>
                            </div>
                        )}

                        {/* WHY: Thresholds & Evidence */}
                        {thresholdInfo && (
                            <div className="space-y-2 bg-white p-3 border border-[var(--color-border)] rounded">
                                <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-2 mb-2">
                                     <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase">WHY (Evidence Agreement)</span>
                                </div>
                                
                                <div className="flex justify-between text-[11px]">
                                     <span className="font-medium text-[var(--color-text-secondary)]">24h rainfall:</span>
                                     <span className="font-bold text-[var(--color-text-primary)] font-mono">{thresholdInfo.current_rainfall} mm</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                     <span className="font-medium text-[var(--color-text-secondary)]">Estimated trigger threshold:</span>
                                     <span className="font-bold text-[var(--color-text-primary)] font-mono">{thresholdInfo.threshold_value} mm</span>
                                </div>
                                
                                <div className={`text-[10px] font-bold uppercase tracking-wider mt-2 p-1.5 rounded ${thresholdInfo.threshold_exceeded ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                                     Threshold: {thresholdInfo.threshold_exceeded ? `EXCEEDED BY ${thresholdInfo.exceedance_margin.toFixed(1)} mm` : 'NOT EXCEEDED'}
                                </div>
                                <div className="text-[9px] text-[var(--color-text-muted)] font-mono mt-1 text-right">{thresholdInfo.threshold_type}</div>
                            </div>
                        )}

                        {/* Environmental Data (Weather / Soil) */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-1">
                                <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <CloudSun className="w-3.5 h-3.5 text-blue-500" /> Environmental Context
                                </span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${data.freshness === 'LIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                    {data.freshness}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--color-text-secondary)]">
                                <div className="bg-white p-2 rounded border border-[var(--color-border)]">Temp: <span className="font-bold text-[var(--color-text-primary)]">{data.weather.temperature.value}{data.weather.temperature.unit}</span></div>
                                <div className="bg-white p-2 rounded border border-[var(--color-border)]">Hum: <span className="font-bold text-[var(--color-text-primary)]">{data.weather.humidity.value}{data.weather.humidity.unit}</span></div>
                                <div className="bg-white p-2 rounded border border-[var(--color-border)]">Wind: <span className="font-bold text-[var(--color-text-primary)]">{data.weather.windSpeed.value} {data.weather.windSpeed.unit}</span></div>
                                <div className="bg-white p-2 rounded border border-[var(--color-border)]">Elev: <span className="font-bold text-[var(--color-text-primary)]">{data.terrain.elevation.value} {data.terrain.elevation.unit}</span></div>
                                <div className="bg-white p-2 rounded border border-[var(--color-border)]">Soil Moist: <span className="font-bold text-cyan-700">{data.soil.moisture.value}{data.soil.moisture.unit}</span></div>
                                <div className="bg-white p-2 rounded border border-[var(--color-border)]">Rain (1h): <span className="font-bold text-cyan-700">{data.rainfall.rain1h.value} mm</span></div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded border border-red-200">Failed to fetch point data.</div>
                )}
            </div>

            {/* ACTION & DATA FRESHNESS */}
            <div className="bg-[var(--color-surface-secondary)] p-3 border-t border-[var(--color-border)] flex flex-col gap-3 shrink-0">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={onOpen3D}
                        className="w-full py-2 bg-white hover:bg-slate-50 text-[var(--color-text-primary)] text-[10px] font-bold rounded flex flex-col items-center justify-center gap-1 transition-colors border border-[var(--color-border)] shadow-sm"
                    >
                        <Mountain className="w-4 h-4 text-emerald-600" />
                        3D TERRAIN
                    </button>
                    <button
                        onClick={onCreateReport}
                        className="w-full py-2 bg-white hover:bg-slate-50 text-[var(--color-text-primary)] text-[10px] font-bold rounded flex flex-col items-center justify-center gap-1 transition-colors border border-[var(--color-border)] shadow-sm"
                    >
                        <FilePlus className="w-4 h-4 text-blue-600" />
                        REPORT
                    </button>
                </div>
                <div className="flex flex-col gap-1 text-[9px] text-[var(--color-text-muted)] font-mono font-bold">
                    <div className="flex justify-between items-center">
                        <span>W-SRC: {data?.sources?.weather || 'OPEN-METEO'}</span>
                        <span>{data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : '--'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                         <span>T-SRC: {data?.sources?.terrain || 'ESTIMATE'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
