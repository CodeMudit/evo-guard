import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Settings, Sliders, Moon, Sun, Save } from "lucide-react";

export const SettingsPage = () => {
  const {
    thresholds,
    updateThresholds,
    refreshRateSec,
    setRefreshRateSec,
    theme,
    setTheme,
  } = useApp();

  const [formThresholds, setFormThresholds] = useState(thresholds);

  // Keep form in sync if thresholds are updated externally (e.g. from backend API on mount)
  useEffect(() => {
    setFormThresholds(thresholds);
  }, [thresholds]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateThresholds(formThresholds);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto h-full">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface-primary)] p-5 rounded border border-[var(--color-border)] shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-700" />
            System & Safety Configuration
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium">
            Configure Live Alert Safety Triggers, Display Preferences & Auto-Sync Intervals
          </p>
        </div>
      </div>

      {/* Threshold Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded bg-white border border-[var(--color-border)] space-y-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-4">
          <Sliders className="w-5 h-5 text-slate-700" />
          <div>
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">Critical Alert Safety Thresholds</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">Modifying thresholds dynamically updates alert triggers system-wide</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Soil Moisture */}
          <div className="p-4 rounded bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between font-bold text-[var(--color-text-primary)]">
              <label htmlFor="soil-moisture">Soil Moisture Threshold</label>
              <span className="text-emerald-700 font-mono font-bold">{formThresholds.soilMoisture} %</span>
            </div>
            <input
              id="soil-moisture"
              type="number"
              min={10}
              max={95}
              value={formThresholds.soilMoisture}
              onChange={(e) => setFormThresholds({ ...formThresholds, soilMoisture: Number(e.target.value) })}
              className="w-full bg-white border border-[var(--color-border)] rounded px-3 py-2 text-[var(--color-text-primary)] font-mono text-xs outline-none focus:border-blue-500 shadow-sm"
            />
            <span className="text-[10px] text-[var(--color-text-muted)] font-medium block">Values above this trigger High Soil Saturation alert</span>
          </div>

          {/* Rainfall Intensity */}
          <div className="p-4 rounded bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between font-bold text-[var(--color-text-primary)]">
              <label htmlFor="rainfall-intensity">Rainfall Intensity Threshold</label>
              <span className="text-blue-700 font-mono font-bold">{formThresholds.rainfall} mm/h</span>
            </div>
            <input
              id="rainfall-intensity"
              type="number"
              min={5}
              max={100}
              value={formThresholds.rainfall}
              onChange={(e) => setFormThresholds({ ...formThresholds, rainfall: Number(e.target.value) })}
              className="w-full bg-white border border-[var(--color-border)] rounded px-3 py-2 text-[var(--color-text-primary)] font-mono text-xs outline-none focus:border-blue-500 shadow-sm"
            />
            <span className="text-[10px] text-[var(--color-text-muted)] font-medium block">Torrential downpour warning limit</span>
          </div>

          {/* PM2.5 */}
          <div className="p-4 rounded bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between font-bold text-[var(--color-text-primary)]">
              <label htmlFor="pm25-limit">PM2.5 Air Quality Limit</label>
              <span className="text-purple-700 font-mono font-bold">{formThresholds.pm25} µg/m³</span>
            </div>
            <input
              id="pm25-limit"
              type="number"
              min={15}
              max={250}
              value={formThresholds.pm25}
              onChange={(e) => setFormThresholds({ ...formThresholds, pm25: Number(e.target.value) })}
              className="w-full bg-white border border-[var(--color-border)] rounded px-3 py-2 text-[var(--color-text-primary)] font-mono text-xs outline-none focus:border-blue-500 shadow-sm"
            />
            <span className="text-[10px] text-[var(--color-text-muted)] font-medium block">Unhealthy air particulate threshold</span>
          </div>

          {/* River Water Level */}
          <div className="p-4 rounded bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between font-bold text-[var(--color-text-primary)]">
              <label htmlFor="water-level">River Water Level Limit</label>
              <span className="text-cyan-700 font-mono font-bold">{formThresholds.waterLevel} m</span>
            </div>
            <input
              id="water-level"
              type="number"
              step={0.1}
              min={0.5}
              max={6.0}
              value={formThresholds.waterLevel}
              onChange={(e) => setFormThresholds({ ...formThresholds, waterLevel: Number(e.target.value) })}
              className="w-full bg-white border border-[var(--color-border)] rounded px-3 py-2 text-[var(--color-text-primary)] font-mono text-xs outline-none focus:border-blue-500 shadow-sm"
            />
            <span className="text-[10px] text-[var(--color-text-muted)] font-medium block">Embankment flood warning line</span>
          </div>
        </div>

        <div className="flex justify-end pt-4 mt-4 border-t border-[var(--color-border)]">
          <button
            type="submit"
            className="px-6 py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors uppercase tracking-wider"
          >
            <Save className="w-4 h-4" />
            SAVE SETTINGS
          </button>
        </div>
      </form>

      {/* Refresh Rate & Display Mode Card */}
      <div className="p-6 rounded bg-white border border-[var(--color-border)] space-y-5 shadow-sm text-xs">
        <h3 className="text-base font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-3">
          Telemetry Refresh & Interface Theme
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[var(--color-text-secondary)] font-bold block uppercase tracking-wider">Live Simulation Tick Rate</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { sec: 10, label: "10s" },
                { sec: 30, label: "30s" },
                { sec: 60, label: "1m" },
                { sec: 300, label: "5m" },
              ].map((item) => (
                <button
                  key={item.sec}
                  type="button"
                  onClick={() => setRefreshRateSec(item.sec)}
                  className={`py-2 rounded font-bold transition-all border ${
                    refreshRateSec === item.sec
                      ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[var(--color-text-secondary)] font-bold block uppercase tracking-wider">Theme Preference</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`py-2 px-3 rounded font-bold flex items-center justify-center gap-2 transition-all border ${
                  theme === "dark"
                    ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Moon className="w-4 h-4" />
                DARK
              </button>
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`py-2 px-3 rounded font-bold flex items-center justify-center gap-2 transition-all border ${
                  theme === "light"
                    ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Sun className="w-4 h-4" />
                LIGHT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
