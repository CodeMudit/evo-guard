import React from "react";
import { useApp } from "../../context/AppContext";
import { ShieldAlert, ArrowRight, MapPin } from "lucide-react";

export const HazardZones = ({ onSelectHazard }) => {
  const { hazards, setSelectedHazardId, focusOnMap, setActivePage } = useApp();

  return (
    <div className="p-4 rounded bg-white border border-[var(--color-border)] shadow-sm space-y-4 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-orange-50 text-orange-700 border border-orange-200">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] tracking-tight">Critical Hazard Zones</h3>
        </div>

        <button
          onClick={() => setActivePage("hazards")}
          className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {hazards.map((hz) => {
          let badgeBg = "bg-red-50 text-red-700 border-red-200";
          if (hz.riskLevel === "MEDIUM") {
            badgeBg = "bg-amber-50 text-amber-700 border-amber-200";
          }

          return (
            <div
              key={hz.id}
              onClick={() => {
                setSelectedHazardId(hz.id);
                if (hz.center) focusOnMap(hz.center[0], hz.center[1], 14);
                if (onSelectHazard) onSelectHazard(hz);
              }}
              className="p-3.5 rounded bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white transition-all cursor-pointer space-y-1.5 group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[var(--color-text-primary)] group-hover:text-blue-700 transition-colors">
                  {hz.name}
                </h4>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${badgeBg}`}>
                  {hz.riskLevel}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[var(--color-text-secondary)]">
                <span className="font-bold text-[var(--color-text-primary)] uppercase tracking-wider text-[10px]">{hz.type}</span>
                <span className="text-blue-600 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider text-[9px]">
                  Map Zone <MapPin className="w-3 h-3" />
                </span>
              </div>
              <p className="text-[10px] text-[var(--color-text-secondary)] font-medium line-clamp-1 leading-relaxed">{hz.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
