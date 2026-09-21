import React, { useState, useEffect } from "react";
import { riskService } from "../../services/data/riskService";
import { ChevronRight, ShieldAlert, Route, AlertTriangle } from "lucide-react";

export const PriorityWatchlist = ({ onSelectLocation }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const data = await riskService.getLocations();
        setLocations(data.locations || []);
      } catch (err) {
        console.error("Failed to load watchlist", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--color-text-muted)] text-sm">
        Loading watchlist...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface-primary)]">
      <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[var(--color-status-critical)]" />
          Priority Watchlist
        </h3>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-1">High-risk corridors requiring monitoring</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {locations.length === 0 ? (
          <div className="text-center text-[var(--color-text-muted)] text-xs py-8">
            No critical locations currently identified.
          </div>
        ) : (
          locations.map((loc) => (
            <div
              key={loc.id}
              onClick={() => onSelectLocation(loc.id)}
              className="border border-[var(--color-border)] rounded shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer bg-white group"
            >
              {/* Header */}
              <div className="p-3 border-b border-[var(--color-border)] flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm text-[var(--color-text-primary)] group-hover:text-blue-600 transition-colors">
                    {loc.name}
                  </h4>
                  <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mt-0.5">
                    {loc.district}, {loc.state}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 font-bold text-[var(--color-status-high)]">
                    <span className="text-sm">{loc.risk.current}%</span>
                    {loc.risk.trend === 'rising' && <span className="text-[10px]">↑</span>}
                  </div>
                  <span className="text-[9px] text-[var(--color-text-muted)] uppercase">24h: {loc.risk.risk_24h}%</span>
                </div>
              </div>

              {/* Impact / Isolation Row */}
              <div className="p-3 bg-slate-50 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                    <Route className="w-3.5 h-3.5" />
                    <span className="font-medium text-[var(--color-status-critical)]">
                      {loc.isolation.toUpperCase()} ISOLATION
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">
                    {loc.impact_summary?.communities} Communities | {loc.impact_summary?.hospital_routes} Hospital Routes
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>

              {/* Action Footer */}
              <div className="px-3 py-2 bg-white border-t border-[var(--color-border)] text-[10px] text-[var(--color-text-secondary)] flex items-center gap-2">
                 <AlertTriangle className="w-3 h-3 text-[var(--color-status-watch)]" />
                 <span className="font-semibold uppercase tracking-wider">Recommended:</span>
                 {loc.recommended_action}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
