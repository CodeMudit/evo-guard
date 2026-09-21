import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useApp } from "../../context/AppContext";
import { isFirebaseConfigured } from "../../firebase";
import { CloudSun } from "lucide-react";

export const SensorHistoryChart = ({ title, type = "api" }) => {
  const [timeframe, setTimeframe] = useState("24h");

  // Try Firebase history from context; fall back to generated mock data
  const { firebaseHistory, isFirebaseLoading, apiData } = useApp();
  
  // Active line toggles
  const [visibleLines, setVisibleLines] = useState({
    p1: true,
    p2: true,
    p3: true,
    p4: true,
  });

  const toggleLine = (key) => {
    setVisibleLines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const historyLimit = { "1h": 12, "6h": 36, "24h": 144, "7d": 1008 }[timeframe];
  
  const selectLatest = (history) => {
    if (!history?.length) {
      if (!apiData) return [];
      
      const pt = {
        time: "Latest",
        temperature: apiData.sensors.temperature.value,
        aqi: apiData.sensors.aqi.value,
        rainfall: apiData.sensors.rainfall.value,
        pm25: apiData.sensors.pm25.value,
      };
      
      // Return 2 points so the LineChart can draw a flat line
      return [{ ...pt, time: "-5m" }, pt];
    }

    return history.slice(-historyLimit);
  };

  const { apiHistory } = firebaseHistory || {};
  let data = selectLatest(apiHistory);
  
  let lineConfigs = [
    { key: "temperature", name: "Temp (°C)", color: "#dc2626", paramKey: "p1" },
    { key: "aqi", name: "AQI", color: "#d97706", paramKey: "p2" },
    { key: "pm25", name: "PM2.5", color: "#9333ea", paramKey: "p3" },
    { key: "rainfall", name: "Rain (mm)", color: "#2563eb", paramKey: "p4" },
  ];

  return (
    <div className="p-5 rounded bg-white border border-[var(--color-border)] shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border)] pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-slate-100 text-slate-700">
            <CloudSun className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[var(--color-text-primary)] tracking-tight">{title}</h4>
        </div>

        {/* Time selector */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded border border-slate-200 text-[11px]">
          {["1h", "6h", "24h", "7d"].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded font-bold transition-all uppercase tracking-wider text-[10px] ${
                timeframe === tf ? "bg-white text-blue-700 border border-blue-200 shadow-sm" : "text-slate-500 hover:text-slate-900 border border-transparent hover:bg-slate-100"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Parameter Toggles */}
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        {lineConfigs.map((cfg) => {
          const isVisible = visibleLines[cfg.paramKey];
          return (
            <button
              key={cfg.key}
              onClick={() => toggleLine(cfg.paramKey)}
              className={`px-3 py-1.5 rounded border font-bold flex items-center gap-2 transition-all uppercase tracking-wider text-[10px] ${
                isVisible
                  ? "bg-slate-50 border-slate-300 text-slate-800"
                  : "bg-white border-slate-200 text-slate-400 line-through opacity-70"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
              <span>{cfg.name}</span>
            </button>
          );
        })}
      </div>

      {/* Recharts Area */}
      <div className="h-48 w-full pt-4">
        {isFirebaseLoading && isFirebaseConfigured ? (
          <div className="h-full flex items-center justify-center text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
            Loading Firebase history...
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
            No history available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} fontWeight={600} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} fontWeight={600} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#cbd5e1",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#0f172a",
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              {lineConfigs.map(
                (cfg) =>
                  visibleLines[cfg.paramKey] && (
                    <Line
                      key={cfg.key}
                      type="monotone"
                      dataKey={cfg.key}
                      name={cfg.name}
                      stroke={cfg.color}
                      strokeWidth={2}
                      dot={false}
                    />
                  )
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
