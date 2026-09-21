import React from "react";
import { useApp } from "../../context/AppContext";
import { AlertTriangle, Radio, CloudSun, ArrowUpRight } from "lucide-react";

export const AlertCard = ({ alert, onSelectAlert }) => {
  const { focusOnMap } = useApp();

  const isNode = alert.sourceType === "node";
  let severityBg = "bg-amber-50 border-amber-200";
  let badgeColor = "bg-amber-100 text-amber-800 font-bold";
  let iconColor = "text-amber-600";

  if (alert.severity === "HIGH" || alert.severity === "CRITICAL") {
    severityBg = "bg-red-50 border-red-200";
    badgeColor = "bg-red-100 text-red-800 font-bold";
    iconColor = "text-red-600";
  }

  return (
    <div
      onClick={() => {
        focusOnMap(alert.lat, alert.lng, 15);
        if (onSelectAlert) onSelectAlert(alert);
      }}
      className={`p-3 rounded border ${severityBg} hover:shadow-md transition-all cursor-pointer shadow-sm space-y-2 group`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-4 h-4 ${iconColor} shrink-0 group-hover:scale-110 transition-transform`} />
          <h4 className="text-xs font-bold text-[var(--color-text-primary)] tracking-tight">{alert.title}</h4>
        </div>
        <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider ${badgeColor}`}>
          {alert.severity}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)] font-mono font-bold">
        {isNode ? <Radio className="w-3 h-3 text-blue-600" /> : <CloudSun className="w-3 h-3 text-purple-600" />}
        <span className="text-[var(--color-text-secondary)]">{alert.source.toUpperCase()}</span>
        <span>•</span>
        <span>{alert.timeAgo}</span>
      </div>

      <p className="text-[11px] text-[var(--color-text-secondary)] font-medium line-clamp-2 leading-relaxed">{alert.message}</p>

      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] text-[var(--color-text-muted)] font-mono">
        <span>VAL: <strong className="text-slate-800">{alert.sensorValue}</strong></span>
        <span className="text-blue-600 font-bold flex items-center gap-0.5 group-hover:underline">
          MAP <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
