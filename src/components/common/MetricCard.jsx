import React from "react";

export const MetricCard = ({ icon: Icon, title, value, unit, subtitle, status = "normal" }) => {
  let borderColor = "border-[var(--color-border)]";
  let textColor = "text-[var(--color-text-primary)]";
  let iconBg = "bg-slate-100 text-slate-600";
  let outerBg = "bg-white";

  if (status === "warning") {
    borderColor = "border-amber-200";
    textColor = "text-amber-700";
    iconBg = "bg-amber-100 text-amber-700";
    outerBg = "bg-amber-50";
  } else if (status === "critical") {
    borderColor = "border-red-200";
    textColor = "text-red-700";
    iconBg = "bg-red-100 text-red-700";
    outerBg = "bg-red-50";
  }

  return (
    <div
      className={`p-3 rounded ${outerBg} border ${borderColor} flex items-center justify-between gap-3 shadow-sm hover:shadow transition-shadow`}
    >
      <div className="space-y-1 overflow-hidden flex-1">
        <span className="text-[10px] font-bold text-[var(--color-text-secondary)] block truncate uppercase tracking-wider">{title}</span>
        <div className="flex items-baseline gap-1">
          <span className={`text-xl font-bold ${textColor} leading-none`}>{value}</span>
          {unit && <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">{unit}</span>}
        </div>
        {subtitle && <span className="text-[10px] text-[var(--color-text-muted)] font-medium block truncate pt-1">{subtitle}</span>}
      </div>

      {Icon && (
        <div className={`p-2.5 rounded ${iconBg} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};
