import React from "react";
import { useApp } from "../context/AppContext";
import { LineChart, BarChart2 } from "lucide-react";
import { RoadConnectivity, WeatherForecastPanel, PriorityList } from "../components/dashboard/DashboardExtensions";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

export const AnalyticsPage = () => {
  const { computedRisk } = useApp();

  const healthScore = Math.max(10, 100 - computedRisk.overallScore);

  const correlationData = [
    { factor: "Soil vs Rain", correlation: "+0.88", strength: "Very Strong", status: "Critical Impact" },
    { factor: "Water vs Rain", correlation: "+0.74", strength: "Strong", status: "Elevated Risk" },
    { factor: "PM2.5 vs Wind", correlation: "-0.62", strength: "Inverse", status: "Dispersion" },
    { factor: "Temp vs Humidity", correlation: "-0.78", strength: "Inverse", status: "Normal" },
  ];

  const accuracyData = [
    { epoch: "E1", accuracy: 82, precision: 80, recall: 84 },
    { epoch: "E2", accuracy: 85, precision: 83, recall: 86 },
    { epoch: "E3", accuracy: 87, precision: 86, recall: 88 },
    { epoch: "E4", accuracy: 91, precision: 89, recall: 92 },
  ];

  return (
    <div className="space-y-6 pb-12 h-full flex flex-col">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface-primary)] p-5 rounded border border-[var(--color-border)] shadow-sm shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight flex items-center gap-2">
            <LineChart className="w-6 h-6 text-blue-600" />
            Environmental Analytics & AI Performance
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium">
            System Health Index, Node vs API Correlation & ML Model Confusion Metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded bg-emerald-50 border border-emerald-200 text-center shadow-sm">
            <span className="text-[10px] text-emerald-700 font-bold uppercase block tracking-wider">Health Index</span>
            <span className="text-lg font-black text-emerald-600">{healthScore} <span className="text-xs">/ 100</span></span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ML Confusion / Accuracy Chart */}
        <div className="p-5 rounded bg-white border border-[var(--color-border)] space-y-3 shadow-sm">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] tracking-tight flex items-center justify-between uppercase w-full">
            <span className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              Model Accuracy Trend (%)
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded tracking-wider border border-slate-200">
              HISTORICAL BASELINE
            </span>
          </h3>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="epoch" stroke="#64748b" fontSize={11} fontWeight={600} />
                <YAxis domain={[70, 100]} stroke="#64748b" fontSize={11} fontWeight={600} />
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
                <Bar dataKey="accuracy" name="Accuracy %" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="precision" name="Precision %" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recall" name="Recall %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Correlation Matrix Table */}
        <div className="p-5 rounded bg-white border border-[var(--color-border)] space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] tracking-tight mb-4 uppercase">
              Environmental Factor Correlation Matrix
            </h3>

            <div className="divide-y divide-slate-200 border border-slate-200 rounded bg-slate-50 overflow-hidden text-xs">
              {correlationData.map((row, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-100 transition-colors">
                  <div>
                    <span className="font-bold text-[var(--color-text-primary)] block">{row.factor}</span>
                    <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">{row.strength} Correlation</span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-blue-600 block">{row.correlation}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">{row.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-[var(--color-text-secondary)] font-medium leading-relaxed bg-blue-50 p-3 rounded border border-blue-100 text-blue-800">
            <strong className="font-bold">Note:</strong> High positive correlation between Soil Moisture & Rainfall intensity (+0.88) represents the primary statistical driver behind Landslide Risk prediction alerts.
          </p>
        </div>
      </div>

      {/* Extensions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="lg:col-span-1"><RoadConnectivity /></div>
         <div className="lg:col-span-1"><WeatherForecastPanel /></div>
         <div className="lg:col-span-2"><PriorityList /></div>
      </div>
    </div>
  );
};
