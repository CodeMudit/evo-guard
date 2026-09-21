import React from "react";

export const MapLegend = () => {
  return (
    <div className="absolute bottom-3 left-3 z-[1000] p-3 rounded bg-white/95 backdrop-blur-md border border-[var(--color-border)] shadow-sm text-[var(--color-text-primary)] font-medium text-xs space-y-2 pointer-events-auto max-w-[200px] sm:max-w-xs">
      <p className="font-bold text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] border-b border-[var(--color-border)] pb-1.5 mb-2">
        Map Legend
      </p>

      <div className="grid grid-cols-1 gap-2 text-[11px]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border border-slate-500 bg-slate-100 flex items-center justify-center">
             <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-ping"></div>
          </div>
          <span>AWS-1 — Hill Sector</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border border-sky-500 bg-sky-100 flex items-center justify-center">
             <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping"></div>
          </div>
          <span>Station Alpha — River Bank</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-600 shadow-sm" />
          <span>Regional API Data</span>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 mt-1">
          <span className="w-3 h-3 rounded bg-red-100 border border-red-500" />
          <span className="text-red-700 font-bold">Critical Hazard Zone</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse shadow-sm" />
          <span className="text-amber-700 font-bold">Active Alert Location</span>
        </div>
      </div>
    </div>
  );
};
