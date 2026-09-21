import React from "react";
import { ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";

const getRiskColor = (level) => {
  switch (level?.toUpperCase()) {
    case "CRITICAL":
    case "EXTREME":
      return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
    case "HIGH":
      return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" };
    case "MODERATE":
    case "MEDIUM":
      return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
    case "LOW":
      return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
    default:
      return { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" };
  }
};

export const RiskIndicator = ({ score = 82, level = "HIGH" }) => {
  const styles = getRiskColor(level);

  let Icon = CheckCircle2;
  if (level === "CRITICAL" || level === "HIGH") Icon = ShieldAlert;
  if (level === "MODERATE") Icon = AlertTriangle;

  return (
    <div className={`p-4 rounded border ${styles.border} ${styles.bg} flex flex-col items-center justify-center text-center space-y-2 shadow-sm`}>
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${styles.text}`} />
        <span className={`text-lg font-bold uppercase tracking-wider ${styles.text}`}>
          {level} RISK
        </span>
      </div>

      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-4xl font-black text-[var(--color-text-primary)]">{score}</span>
        <span className="text-xs text-[var(--color-text-muted)] font-bold">/ 100</span>
      </div>

      <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider pt-2 border-t border-black/5 w-full mt-2 inline-block">
        Calculated Prediction Score
      </span>
    </div>
  );
};
