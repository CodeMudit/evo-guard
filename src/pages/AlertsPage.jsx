import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { AlertDetailModal } from "../components/alerts/AlertDetailModal";
import { BellRing, Filter, Search, CheckCircle2, MapPin, Send } from "lucide-react";
import { sendAlert } from "../services/alerts";

export const AlertsPage = () => {
  const { alerts, acknowledgeAlert, resolveAlert, focusOnMap, addToast } = useApp();

  const [tab, setTab] = useState("Active"); // Active, Acknowledged, Resolved
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedAlertForModal, setSelectedAlertForModal] = useState(null);

  const filteredAlerts = alerts.filter((a) => {
    if (a.status !== tab) return false;
    if (severityFilter !== "ALL" && a.severity !== severityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q) ||
        a.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 h-full flex flex-col">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface-primary)] p-5 rounded border border-[var(--color-border)] shadow-sm shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight flex items-center gap-2">
            <BellRing className="w-6 h-6 text-red-600" />
            Alert Management Command
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium">
            Operational Logs, Severity Filtering & Field Dispatch Acknowledgement
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["Active", "Acknowledged", "Resolved"].map((t) => {
            const count = alerts.filter((a) => a.status === t).length;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all border ${
                  tab === t
                    ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                    : "bg-white text-[var(--color-text-secondary)] hover:text-slate-900 border-[var(--color-border)]"
                }`}
              >
                {t} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded bg-[var(--color-surface-primary)] border border-[var(--color-border)] text-xs shadow-sm shrink-0">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search alerts by title or node..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[var(--color-border)] rounded px-3.5 py-2 pl-9 text-[var(--color-text-primary)] placeholder-slate-400 outline-none focus:border-blue-500 shadow-sm transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <label htmlFor="severity-filter" className="text-[var(--color-text-secondary)] font-semibold">Severity:</label>
          <select
            id="severity-filter"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-white border border-[var(--color-border)] rounded px-3 py-1.5 text-[var(--color-text-primary)] outline-none focus:border-blue-500 shadow-sm font-medium"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* Alerts Table/List View */}
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded border border-[var(--color-border)] space-y-2 shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-[var(--color-text-secondary)]">No alerts matching "{tab}" filter.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 rounded bg-white border border-[var(--color-border)] hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      alert.severity === "CRITICAL"
                        ? "bg-red-100 text-red-800"
                        : alert.severity === "HIGH" 
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)]">{alert.title}</h3>
                  <span className="text-xs text-[var(--color-text-muted)] font-mono">• {alert.timeAgo}</span>
                </div>

                <p className="text-xs text-[var(--color-text-secondary)] font-medium leading-relaxed">{alert.message}</p>

                <div className="flex items-center gap-4 text-[11px] text-[var(--color-text-muted)] pt-1 font-mono font-medium">
                  <span>SOURCE: <strong className="text-slate-700">{alert.source.toUpperCase()}</strong></span>
                  <span>SENSOR: <strong className="text-amber-700">{alert.sensorValue}</strong></span>
                  <span>ML RISK: <strong className="text-red-600">{alert.mlRiskScore}/100</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => focusOnMap(alert.lat, alert.lng, 15)}
                  className="px-3 py-1.5 rounded bg-white border border-[var(--color-border)] hover:bg-slate-50 text-[var(--color-text-primary)] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  View Map
                </button>

                <button
                  aria-label={`Notify simulated SMS dispatch for ${alert.title}`}
                  onClick={() => {
                    sendAlert({ alertId: alert.id }).then(log => addToast("Alert Dispatched", `Simulated SMS dispatch successful! ${log.message}`, "success"));
                  }}
                  className="px-3 py-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Send className="w-3 h-3" aria-hidden="true" /> Notify
                </button>

                {alert.status === "Active" && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="px-3 py-1.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold transition-colors shadow-sm"
                  >
                    Acknowledge
                  </button>
                )}

                {alert.status !== "Resolved" && (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolve
                  </button>
                )}

                <button
                  onClick={() => setSelectedAlertForModal(alert)}
                  className="px-3 py-1.5 rounded bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-slate-900 text-xs font-semibold shadow-sm transition-colors"
                >
                  Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedAlertForModal && (
        <AlertDetailModal
          isOpen={!!selectedAlertForModal}
          onClose={() => setSelectedAlertForModal(null)}
          alert={selectedAlertForModal}
        />
      )}
    </div>
  );
};
