import React from "react";

export const ModelInputBar = ({ parameter, value, influence, weight, status }) => {
  let barColor = "bg-emerald-500";
  let textColor = "text-[var(--color-text-secondary)]";

  if (influence === "High" || status === "critical") {
    barColor = "bg-red-500";
    textColor = "text-red-700 font-bold";
  } else if (influence === "Medium" || status === "warning") {
    barColor = "bg-amber-500";
    textColor = "text-amber-700 font-bold";
  }

  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex justify-between items-center text-[var(--color-text-primary)]">
        <span className="truncate font-bold uppercase tracking-wider text-[10px]">{parameter}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[var(--color-text-primary)] font-bold">{value}</span>
          <span className={`text-[9px] px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 border border-slate-200 ${textColor}`}>
            {influence} Infl.
          </span>
        </div>
      </div>

      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-500 rounded-full`}
          style={{ width: `${Math.min(100, Math.max(10, weight))}%` }}
        />
      </div>
    </div>
  );
};
