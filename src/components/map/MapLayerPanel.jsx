import React, { useState } from "react";
import { Layers, Map, CloudSun, ShieldAlert, Car, Database, ChevronDown, ChevronUp, Minimize2 } from "lucide-react";

export const MapLayerPanel = ({ activeLayers, toggleLayer }) => {
    const [collapsed, setCollapsed] = useState(false);

    const groups = [
        {
            name: "BASE MAP",
            icon: <Map className="w-3.5 h-3.5" />,
            items: [
                { id: "satellite", label: "Satellite / Sentinel", type: "radio" },
                { id: "terrain", label: "Topographic DEM", type: "radio" },
                { id: "dark", label: "Operations Base", type: "radio" },
            ],
        },
        {
            name: "ENVIRONMENT",
            icon: <CloudSun className="w-3.5 h-3.5" />,
            items: [
                { id: "wind", label: "Wind Vector Field", badge: "LIVE" },
                { id: "ndvi", label: "NDVI Index", badge: "ESTIMATE" },
                { id: "moisture", label: "Soil Moisture", badge: "ESTIMATE" },
            ],
        },
        {
            name: "HAZARDS",
            icon: <ShieldAlert className="w-3.5 h-3.5" />,
            items: [
                { id: "hazards", label: "Risk Heatmap", badge: "DERIVED" },
                { id: "historical", label: "Historical Landslides", badge: "STATIC" },
                { id: "reports", label: "Field Reports", badge: "LIVE" },
            ],
        },
        {
            name: "INFRASTRUCTURE",
            icon: <Car className="w-3.5 h-3.5" />,
            items: [
                { id: "roads", label: "Road Network" },
                { id: "villages", label: "Villages" },
                { id: "sensors", label: "Field Stations", badge: "LIVE" },
            ],
        },
    ];

    return (
        <div className="absolute top-3 left-3 w-64 bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded shadow-md z-[1000] overflow-hidden pointer-events-auto">
            <div className="bg-[var(--color-surface-secondary)] p-2 flex items-center justify-between border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs uppercase tracking-wider">Map Layers</span>
                </div>
                <button
                    type="button"
                    onClick={() => setCollapsed((c) => !c)}
                    className="p-1 rounded hover:bg-slate-200/80 text-[var(--color-text-secondary)] transition-colors"
                    title={collapsed ? "Expand layers" : "Minimize layers"}
                    aria-label={collapsed ? "Expand" : "Minimize"}
                >
                    {collapsed ? (
                        <ChevronDown className="w-4 h-4" />
                    ) : (
                        <Minimize2 className="w-3.5 h-3.5" />
                    )}
                </button>
            </div>

            {!collapsed && (
                <>
                    <div className="max-h-[55vh] overflow-y-auto custom-scrollbar p-2 space-y-2">
                        {groups.map((group) => (
                            <div key={group.name}>
                                <div className="flex items-center gap-1.5 px-1 py-1 text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                                    {group.icon}
                                    {group.name}
                                </div>
                                <div className="space-y-0.5">
                                    {group.items.map((item) => {
                                        const isActive = !!activeLayers[item.id];
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => toggleLayer(item.id, item.type === "radio")}
                                                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors border ${
                                                    isActive
                                                        ? "bg-blue-50 border-blue-200 text-blue-800 font-semibold"
                                                        : "border-transparent text-[var(--color-text-secondary)] hover:bg-slate-50 hover:text-[var(--color-text-primary)] hover:border-slate-200"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center border transition-colors ${
                                                            isActive
                                                                ? "bg-blue-600 border-blue-600"
                                                                : "border-slate-300 bg-white"
                                                        }`}
                                                    >
                                                        {isActive && (
                                                            <div className="w-1.5 h-1.5 bg-white rounded-sm" />
                                                        )}
                                                    </div>
                                                    <span>{item.label}</span>
                                                </div>
                                                {item.badge && (
                                                    <span
                                                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold tracking-tight ${
                                                            item.badge === "LIVE"
                                                                ? "bg-emerald-100 text-emerald-800"
                                                                : item.badge === "ESTIMATE"
                                                                  ? "bg-slate-100 text-slate-600"
                                                                  : item.badge === "DERIVED"
                                                                    ? "bg-amber-100 text-amber-800"
                                                                    : "bg-slate-100 text-slate-500"
                                                        }`}
                                                    >
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-[var(--color-surface-secondary)] p-2 border-t border-[var(--color-border)]">
                        <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] font-medium">
                            <span className="flex items-center gap-1">
                                <Database className="w-3 h-3" /> Data Provenance Active
                            </span>
                        </div>
                    </div>
                </>
            )}

            {collapsed && (
                <div className="px-2 py-1.5 text-[10px] text-[var(--color-text-muted)] font-medium flex items-center gap-1">
                    <ChevronUp className="w-3 h-3" /> Click to expand
                </div>
            )}
        </div>
    );
};
