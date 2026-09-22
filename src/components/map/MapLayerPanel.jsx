import React, { useState } from "react";
import { Layers, ChevronDown, Minimize2 } from "lucide-react";

/**
 * Compact layer panel matching nerdrr.gov.in density.
 * Positioned by parent (MapPanel) – this component is pure content.
 */
export const MapLayerPanel = ({ activeLayers, toggleLayer }) => {
  const [collapsed, setCollapsed] = useState(false);

  const groups = [
    {
      name: "BASE MAP",
      items: [
        { id: "satellite", label: "Satellite / Sentinel", type: "radio" },
        { id: "terrain", label: "Topographic DEM", type: "radio" },
        { id: "dark", label: "Operations Base", type: "radio" },
      ],
    },
    {
      name: "ENVIRONMENT",
      items: [
        { id: "wind", label: "Wind Vector Field", badge: "LIVE" },
        { id: "ndvi", label: "NDVI Index", badge: "EST." },
        { id: "moisture", label: "Soil Moisture", badge: "EST." },
      ],
    },
    {
      name: "HAZARDS",
      items: [
        { id: "hazards", label: "Risk Heatmap", badge: "DERIVED" },
        { id: "alerts", label: "Active Alerts", badge: "LIVE" },
        { id: "historical", label: "Historical Landslides", badge: "STATIC" },
        { id: "reports", label: "Field Reports", badge: "LIVE" },
      ],
    },
    {
      name: "INFRASTRUCTURE",
      items: [
        { id: "roads", label: "Road Network" },
        { id: "villages", label: "Villages" },
      ],
    },
  ];

  return (
    <div className="w-52 bg-white border border-[var(--gov-border)] shadow-sm overflow-hidden text-[var(--gov-text)]">
      {/* Header */}
      <div className="bg-[var(--gov-navy)] text-white px-2 py-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          <span className="font-bold text-[11px] uppercase tracking-wide">Map Layers</span>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="p-0.5 hover:bg-white/20"
          aria-label={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <Minimize2 className="w-3 h-3" />}
        </button>
      </div>

      {!collapsed && (
        <div className="max-h-[50vh] overflow-y-auto py-1">
          {groups.map((group) => (
            <div key={group.name} className="px-1.5 pb-1">
              <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--gov-text-muted)] px-1 py-0.5 border-b border-[var(--gov-border)] mb-0.5">
                {group.name}
              </div>
              <div className="space-y-0">
                {group.items.map((item) => {
                  const isActive = !!activeLayers[item.id];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleLayer(item.id, item.type === "radio")}
                      className={`w-full flex items-center justify-between px-1.5 py-[3px] text-[11px] transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-800 font-semibold"
                          : "text-[var(--gov-text-secondary)] hover:bg-[var(--gov-page-bg)]"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-3 h-3 rounded-sm flex items-center justify-center border shrink-0 ${
                            isActive
                              ? "bg-blue-600 border-blue-600"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isActive && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                        </div>
                        <span className="leading-tight">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[8px] px-1 py-0 font-mono font-bold ${
                            item.badge === "LIVE"
                              ? "text-emerald-700"
                              : item.badge === "EST."
                              ? "text-slate-500"
                              : item.badge === "DERIVED"
                              ? "text-amber-700"
                              : "text-slate-500"
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
      )}
    </div>
  );
};