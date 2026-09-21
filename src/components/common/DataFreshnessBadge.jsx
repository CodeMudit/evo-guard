import React from "react";
import { Clock, RefreshCw, Zap, ServerOff } from "lucide-react";

export const DataFreshnessBadge = ({ status, timestamp, className = "" }) => {
  // status: "LIVE" | "CACHED" | "SIMULATED" | "STALE"
  
  const getBadgeStyle = () => {
    switch (status) {
      case "LIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CACHED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "SIMULATED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "STALE":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "LIVE":
        return <Zap className="w-3 h-3" />;
      case "CACHED":
        return <Clock className="w-3 h-3" />;
      case "SIMULATED":
        return <RefreshCw className="w-3 h-3" />;
      case "STALE":
        return <ServerOff className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${getBadgeStyle()} ${className}`}>
      {getIcon()}
      <span>{status}</span>
      {timestamp && <span className="opacity-70 font-mono ml-1">{timestamp}</span>}
    </div>
  );
};
