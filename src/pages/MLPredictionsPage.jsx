import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { MLPredictionCenter } from "../components/ml/MLPredictionCenter";
import { MLHistoryChart } from "../components/ml/MLHistoryChart";

import { BrainCircuit, Sliders, RefreshCw, Cpu } from "lucide-react";

export const MLPredictionsPage = () => {
  const { thresholds, addToast } = useApp();

  // Interactive Scenario Simulator State
  const [simValues, setSimValues] = useState({
    soilMoisture: 78,
    rainfall: 42.6,
    waterLevel: 1.8,
    pm25: 82,
    aqi: 78,
  });

  // simRisk is dynamically computed from sandbox inputs
  const calculateSimRisk = (vals) => {
    const { soilMoisture, rainfall, waterLevel, pm25 } = vals;
    
    const landslideScore = Math.min(100, Math.round((soilMoisture * 0.5) + (rainfall * 0.8)));
    const floodScore = Math.min(100, Math.round((rainfall * 0.4) + (waterLevel * 20)));
    const airQualityScore = Math.min(100, Math.round((pm25 / 250) * 100));
    const overallScore = Math.round((landslideScore * 0.5) + (floodScore * 0.3) + (airQualityScore * 0.2));
    
    const getLevel = (score) => score >= 75 ? "EXTREME" : score >= 60 ? "HIGH" : score >= 40 ? "MODERATE" : "LOW";
    
    return {
      overallScore,
      landslideScore,
      floodScore,
      airQualityScore,
      overallLevel: getLevel(overallScore),
      landslideLevel: getLevel(landslideScore),
      floodLevel: getLevel(floodScore),
      airQualityLevel: getLevel(airQualityScore),
    };
  };

  const simRisk = calculateSimRisk(simValues);

  return (
    <div className="space-y-6 pb-12 h-full flex flex-col">
      {/* Page Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface-primary)] p-5 rounded border border-[var(--color-border)] shadow-sm shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-blue-600" />
            Risk Simulation & Forecast Models
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium">
            Real-time Predictive Analytics, Feature Weights & Scenario Simulation Sandbox
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            Model v1.2 Active
          </span>
        </div>
      </div>

      {/* Main ML Center */}
      <MLPredictionCenter />

      {/* Interactive Scenario Sandbox Simulator */}
      <div className="p-6 rounded bg-white border border-[var(--color-border)] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)] tracking-tight">
                Scenario Simulation Sandbox
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] font-medium">
                Adjust telemetry inputs to test instant risk score inference logic
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSimValues({ soilMoisture: 40, rainfall: 10, waterLevel: 1.0, pm25: 30, aqi: 45 });
              addToast("Sandbox Reset", "Reset sensor values to baseline normal levels", "info");
            }}
            className="px-3 py-1.5 rounded bg-white border border-[var(--color-border)] hover:bg-slate-50 text-[var(--color-text-primary)] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            RESET TO BASELINE
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded bg-slate-50 border border-slate-200 text-xs">
          {/* Soil Moisture Slider */}
          <div className="space-y-2">
            <div className="flex justify-between font-bold text-[var(--color-text-primary)]">
              <span>Soil Moisture (AWS-1)</span>
              <span className="text-blue-700 font-mono">{simValues.soilMoisture} %</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={simValues.soilMoisture}
              onChange={(e) => setSimValues({ ...simValues, soilMoisture: Number(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Rainfall Intensity Slider */}
          <div className="space-y-2">
            <div className="flex justify-between font-bold text-[var(--color-text-primary)]">
              <span>Rainfall (AWS-1)</span>
              <span className="text-indigo-700 font-mono">{simValues.rainfall} mm/h</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={simValues.rainfall}
              onChange={(e) => setSimValues({ ...simValues, rainfall: Number(e.target.value) })}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Water Level Slider */}
          <div className="space-y-2">
            <div className="flex justify-between font-bold text-[var(--color-text-primary)]">
              <span>River Level (Station Alpha)</span>
              <span className="text-cyan-700 font-mono">{simValues.waterLevel} m</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={5.0}
              step={0.1}
              value={simValues.waterLevel}
              onChange={(e) => setSimValues({ ...simValues, waterLevel: Number(e.target.value) })}
              className="w-full accent-cyan-600"
            />
          </div>

          {/* PM2.5 Air Slider */}
          <div className="space-y-2">
            <div className="flex justify-between font-bold text-[var(--color-text-primary)]">
              <span>PM2.5 (Station Alpha)</span>
              <span className="text-emerald-700 font-mono">{simValues.pm25} µg/m³</span>
            </div>
            <input
              type="range"
              min={10}
              max={250}
              value={simValues.pm25}
              onChange={(e) => setSimValues({ ...simValues, pm25: Number(e.target.value) })}
              className="w-full accent-emerald-600"
            />
          </div>
        </div>

        {/* Real-time Recalculated Simulated Output Display */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-center">
          <div className="p-3 rounded bg-white border border-slate-200 shadow-sm">
            <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase block mb-1">Simulated Score</span>
            <span className="text-2xl font-black text-[var(--color-text-primary)]">{simRisk.overallScore} <span className="text-xs text-[var(--color-text-muted)]">/ 100</span></span>
            <span className="text-[10px] text-blue-700 font-bold block uppercase mt-1 px-2 py-0.5 bg-blue-50 rounded inline-block">{simRisk.overallLevel}</span>
          </div>

          <div className="p-3 rounded bg-white border border-slate-200 shadow-sm">
            <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase block mb-1">Landslide Risk</span>
            <span className="text-2xl font-black text-red-600">{simRisk.landslideScore} <span className="text-xs text-[var(--color-text-muted)]">/ 100</span></span>
            <span className="text-[10px] text-red-700 font-bold block uppercase mt-1 px-2 py-0.5 bg-red-50 rounded inline-block">{simRisk.landslideLevel}</span>
          </div>

          <div className="p-3 rounded bg-white border border-slate-200 shadow-sm">
            <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase block mb-1">Flood Risk</span>
            <span className="text-2xl font-black text-cyan-600">{simRisk.floodScore} <span className="text-xs text-[var(--color-text-muted)]">/ 100</span></span>
            <span className="text-[10px] text-cyan-700 font-bold block uppercase mt-1 px-2 py-0.5 bg-cyan-50 rounded inline-block">{simRisk.floodLevel}</span>
          </div>

          <div className="p-3 rounded bg-white border border-slate-200 shadow-sm">
            <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase block mb-1">Air Quality Risk</span>
            <span className="text-2xl font-black text-emerald-600">{simRisk.airQualityScore} <span className="text-xs text-[var(--color-text-muted)]">/ 100</span></span>
            <span className="text-[10px] text-emerald-700 font-bold block uppercase mt-1 px-2 py-0.5 bg-emerald-50 rounded inline-block">{simRisk.airQualityLevel}</span>
          </div>
        </div>
      </div>

      {/* History Chart */}
      <MLHistoryChart />
    </div>
  );
};
