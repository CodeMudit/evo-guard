import React, { Suspense, lazy } from "react";
import { useApp } from "../context/AppContext";
import { ShieldAlert, MapPin } from "lucide-react";

const Terrain3DViewer = lazy(() => import("../components/map/Terrain3DViewer").then(module => ({ default: module.Terrain3DViewer })));

export const HazardZonesPage = () => {
  const { hazards, focusOnMap } = useApp();

  return (
    <div className="space-y-6 pb-12 h-full flex flex-col">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface-primary)] p-5 rounded border border-[var(--color-border)] shadow-sm shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-orange-600" />
            Vulnerability & Impact Zones
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium">
            Geographic Risk Polygons & Terrain Assessment
          </p>
        </div>

        <span className="px-3 py-1.5 rounded bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider">
          3 Active High-Risk Sectors
        </span>
      </div>

      {/* Hazard Zones Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hazards.map((hz) => (
          <div
            key={hz.id}
            className="p-5 rounded bg-white border border-[var(--color-border)] space-y-4 shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2 mb-2">
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">{hz.name}</h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    hz.riskLevel === "HIGH" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {hz.riskLevel}
                </span>
              </div>

              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">{hz.type}</span>
              <p className="text-xs text-[var(--color-text-secondary)] font-medium leading-relaxed">{hz.description}</p>

              <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-2 text-xs text-[var(--color-text-secondary)] font-medium mt-3">
                <div className="flex justify-between">
                  <span>Vulnerability Score:</span>
                  <strong className="text-[var(--color-text-primary)]">{hz.vulnerabilityScore}/100</strong>
                </div>
                <div>
                  <span className="block mb-0.5">Primary Risk Drivers:</span>
                  <span className="text-[var(--color-text-primary)] font-bold">{hz.primaryFactors}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => hz.center && focusOnMap(hz.center[0], hz.center[1], 15)}
              className="w-full py-2 px-4 rounded bg-white border border-[var(--color-border)] hover:bg-slate-50 text-[var(--color-text-primary)] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm mt-2"
            >
              <MapPin className="w-4 h-4 text-blue-600" />
              CENTER ON MAP
            </button>
          </div>
        ))}
      </div>

      {/* Terrain 3D Viewer Section */}
      <div className="grid grid-cols-1 gap-6 flex-1 min-h-[400px]">
        {hazards && hazards.length > 0 ? (
            <Suspense fallback={<div className="flex items-center justify-center bg-slate-100 rounded border border-slate-200 h-full text-slate-500 font-bold animate-pulse">Loading 3D Terrain...</div>}>
                <Terrain3DViewer hazardZone={hazards[0]} />
            </Suspense>
        ) : (
            <div className="flex items-center justify-center bg-slate-50 rounded border border-slate-200 h-full text-slate-400 font-medium">
                No active hazard zones to display in 3D.
            </div>
        )}
      </div>
    </div>
  );
};
