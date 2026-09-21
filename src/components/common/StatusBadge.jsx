import React from "react";
import { getRiskColor } from "../../utils/riskCalculator";

export const StatusBadge = ({ type, text }) => {
  if (type === "online") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        {text || "Online"}
      </span>
    );
  }

  if (type === "lora") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase tracking-wider shadow-sm">
        📡 {text || "LoRa Connected"}
      </span>
    );
  }

  if (type === "gsm") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold uppercase tracking-wider shadow-sm">
        📶 {text || "GSM Connected"}
      </span>
    );
  }

  if (type === "api") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold uppercase tracking-wider shadow-sm">
        🌐 {text || "API Connected"}
      </span>
    );
  }

  if (type === "risk") {
    const styling = getRiskColor(text);
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${styling.badge}`}>
        {text} RISK
      </span>
    );
  }

  return (
    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider shadow-sm">
      {text}
    </span>
  );
};
