import React from "react";

/**
 * Compact legend matching nerdrr.gov.in style.
 * Every marker type and line style on the map has an entry here.
 */
export const MapLegend = () => {
  return (
    <div className="bg-white border border-[var(--gov-border)] shadow-sm text-[var(--gov-text)] text-[11px] w-44">
      <div className="bg-[var(--gov-navy)] text-white px-2 py-1 font-bold text-[10px] uppercase tracking-wider">
        Legend
      </div>
      <div className="p-1.5 space-y-1">
        {/* Markers */}
        <div className="flex items-center gap-1.5">
          <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[9px] border-l-transparent border-r-transparent border-b-red-600" />
          <span>Critical / Extreme Alert</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-orange-600 rotate-45 border border-white shadow-sm" />
          <span>Active Warning / High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white shadow-sm" />
          <span>Field Report</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-white shadow-sm" />
          <span>Sensor / Station</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-slate-500 border border-white shadow-sm" />
          <span>Historical Landslide</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-600 border border-white" />
          <span>Village</span>
        </div>

        {/* Lines / roads */}
        <div className="border-t border-[var(--gov-border)] pt-1 mt-1 space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5 bg-emerald-500 rounded" />
            <span>Road — Open</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5 bg-amber-500 rounded" />
            <span>Road — At Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5 bg-red-500 rounded" />
            <span>Road — Blocked</span>
          </div>
        </div>

        {/* Zones */}
        <div className="border-t border-[var(--gov-border)] pt-1 mt-1 space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-200 border border-red-500" />
            <span className="text-red-700 font-semibold">Critical Hazard Zone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-orange-200 border border-orange-400 border-dashed" />
            <span>Risk Heatmap (derived)</span>
          </div>
        </div>
      </div>
    </div>
  );
};