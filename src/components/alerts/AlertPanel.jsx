import React from "react";
import { useApp } from "../../context/AppContext";
import { AlertCard } from "./AlertCard";
import { BellRing, ArrowRight } from "lucide-react";

export const AlertPanel = ({ onSelectAlert }) => {
  const { alerts, setActivePage } = useApp();
  const activeAlerts = alerts.filter((a) => a.status === "Active");

  return (
    <div className="p-4 rounded bg-[var(--color-surface-primary)] border border-[var(--color-border)] shadow-sm space-y-3 h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-red-50 text-red-600 border border-red-100">
            <BellRing className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Active Alerts</h3>
        </div>

        <button
          onClick={() => setActivePage("alerts")}
          className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 uppercase tracking-wider"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
        {activeAlerts.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)] font-medium text-center py-4 bg-slate-50 rounded border border-slate-100">No active critical alerts.</p>
        ) : (
          activeAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onSelectAlert={onSelectAlert} />
          ))
        )}
      </div>
    </div>
  );
};
