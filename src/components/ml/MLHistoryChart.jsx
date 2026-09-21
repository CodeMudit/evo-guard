import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { generateHistoryData } from "../../data/mockHistory";
import { useApp } from "../../context/AppContext";
import { BrainCircuit, Activity } from "lucide-react";

export const MLHistoryChart = () => {
  const [timeframe, setTimeframe] = useState("24h");

  // Try Firebase history from context; fall back to generated mock data
  const { firebaseHistory } = useApp();
  const mockHistory = generateHistoryData(timeframe);

  // Use Firebase mlRiskHistory if available; otherwise fall back to mock
  const mlRiskHistory =
    firebaseHistory?.mlRiskHistory?.length
      ? firebaseHistory.mlRiskHistory
      : mockHistory.mlRiskHistory;

  return (
    <div className="p-6 rounded bg-white border border-[var(--color-border)] shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--color-text-primary)] tracking-tight">Risk Projection Trajectory</h3>
            <p className="text-xs text-[var(--color-text-secondary)] font-medium">Historical forecast trajectory (0–100)</p>
          </div>
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded border border-slate-200 text-xs">
          {[
            { id: "1h", label: "Last 1 Hour" },
            { id: "6h", label: "Last 6 Hours" },
            { id: "24h", label: "Last 24 Hours" },
            { id: "7d", label: "Last 7 Days" },
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`px-3 py-1.5 rounded font-bold transition-all uppercase tracking-wider text-[10px] ${
                timeframe === tf.id
                  ? "bg-white text-blue-700 border border-blue-200 shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-slate-900 hover:bg-slate-100 border border-transparent"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Multi-line Chart */}
      <div className="h-64 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mlRiskHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={11} fontWeight={600} tickLine={false} />
            <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} fontWeight={600} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderColor: "#cbd5e1",
                borderRadius: "4px",
                fontSize: "12px",
                color: "#0f172a",
                fontWeight: 600,
                boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px", fontWeight: 600 }} />
            <Line
              type="monotone"
              dataKey="overallRisk"
              name="Overall Risk"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 2 }}
            />
            <Line
              type="monotone"
              dataKey="landslideRisk"
              name="Landslide Risk"
              stroke="#dc2626"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="floodRisk"
              name="Flood Risk"
              stroke="#0891b2"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="airQualityRisk"
              name="Air Quality Risk"
              stroke="#059669"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
