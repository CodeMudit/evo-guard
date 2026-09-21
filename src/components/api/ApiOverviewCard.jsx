import React from "react";
import { useApp } from "../../context/AppContext";
import { StatusBadge } from "../common/StatusBadge";
import { MetricCard } from "../common/MetricCard";
import {
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Gauge,
  Eye,
  Activity,
  ArrowRight,
} from "lucide-react";

export const ApiOverviewCard = ({ onViewApiHistory }) => {
  const { apiData, setActivePage } = useApp();

  return (
    <div className="p-5 rounded bg-white border border-[var(--color-border)] hover:border-slate-300 transition-all duration-300 shadow-sm space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)] tracking-tight">{apiData.name}</h3>
              <p className="text-xs text-[var(--color-text-secondary)] font-medium mt-0.5">{apiData.subtitle}</p>
            </div>
          </div>

          <StatusBadge type="api" text={apiData.status} />
        </div>
      </div>

      {/* Environmental Metric Cards Grid */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider border-b border-[var(--color-border)] pb-2">Region-wide Telemetry</h4>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={Thermometer}
            title="Temperature"
            value={`${apiData.sensors.temperature.value} °C`}
          />
          <MetricCard
            icon={Droplets}
            title="Humidity"
            value={`${apiData.sensors.humidity.value} %`}
          />
          <MetricCard
            icon={Activity}
            title="Air Quality (AQI)"
            value={apiData.sensors.aqi.value}
            subtitle={apiData.sensors.aqi.label}
            status="warning"
          />
          <MetricCard
            icon={Wind}
            title="PM2.5"
            value={`${apiData.sensors.pm25.value} µg/m³`}
          />
          <MetricCard
            icon={CloudRain}
            title="Rainfall"
            value={`${apiData.sensors.rainfall.value} mm/h`}
          />
          <MetricCard
            icon={Wind}
            title="Wind Speed"
            value={`${apiData.sensors.windSpeed.value} km/h`}
            subtitle={apiData.sensors.windDirection}
          />
          <MetricCard
            icon={Gauge}
            title="Pressure"
            value={`${apiData.sensors.pressure.value} hPa`}
          />
          <MetricCard
            icon={Eye}
            title="Visibility"
            value={`${apiData.sensors.visibility.value} km`}
          />
        </div>
      </div>

      {/* Button Action */}
      <div className="pt-3 border-t border-[var(--color-border)]">
        <button
          onClick={() => {
            if (onViewApiHistory) onViewApiHistory();
            else setActivePage("api-data");
          }}
          className="w-full py-2.5 px-4 rounded bg-slate-50 hover:bg-slate-100 text-[var(--color-text-primary)] border border-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 uppercase tracking-wider shadow-sm"
        >
          <span>View API History & Data Diagnostics</span>
          <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)]" />
        </button>
      </div>
    </div>
  );
};
