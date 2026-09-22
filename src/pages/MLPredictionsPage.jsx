import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { MLPredictionCenter } from "../components/ml/MLPredictionCenter";
import { MLHistoryChart } from "../components/ml/MLHistoryChart";
import { Sliders, RefreshCw } from "lucide-react";

/* Normalization ranges for progress bars (D4) */
const RANGES = {
  soilMoisture: { min: 0, max: 100, unit: "%" },
  rainfall: { min: 0, max: 100, unit: "mm/h" },
  waterLevel: { min: 0, max: 5, unit: "m" },
  pm25: { min: 0, max: 250, unit: "µg/m³" },
  aqi: { min: 0, max: 500, unit: "" },
};

const toPercent = (key, value) => {
  const r = RANGES[key];
  if (!r) return 0;
  return Math.min(100, Math.max(0, ((value - r.min) / (r.max - r.min)) * 100));
};

export const MLPredictionsPage = () => {
  const { addToast } = useApp();

  const [simValues, setSimValues] = useState({
    soilMoisture: 78,
    rainfall: 42.6,
    waterLevel: 1.8,
    pm25: 82,
    aqi: 78,
  });

  const calculateSimRisk = (vals) => {
    const { soilMoisture, rainfall, waterLevel, pm25 } = vals;
    const landslideScore = Math.min(100, Math.round(soilMoisture * 0.5 + rainfall * 0.8));
    const floodScore = Math.min(100, Math.round(rainfall * 0.4 + waterLevel * 20));
    const airQualityScore = Math.min(100, Math.round((pm25 / 250) * 100));
    const overallScore = Math.round(
      landslideScore * 0.5 + floodScore * 0.3 + airQualityScore * 0.2
    );
    const getLevel = (s) =>
      s >= 75 ? "EXTREME" : s >= 60 ? "HIGH" : s >= 40 ? "MODERATE" : "LOW";
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

  /* Dynamic rationale from current inputs (A3) */
  const rationale = [];
  if (simValues.soilMoisture >= 70)
    rationale.push(
      `Soil moisture at ${simValues.soilMoisture}% exceeds the 70% saturation threshold.`
    );
  if (simValues.rainfall >= 30)
    rationale.push(
      `Rainfall intensity of ${simValues.rainfall} mm/h is elevated for the sector.`
    );
  if (simValues.waterLevel >= 2.0)
    rationale.push(
      `River water level at ${simValues.waterLevel} m is approaching embankment warning line.`
    );
  if (simValues.pm25 >= 60)
    rationale.push(`PM2.5 at ${simValues.pm25} µg/m³ contributes to air-quality risk.`);
  if (rationale.length === 0)
    rationale.push("All telemetry inputs currently within normal operating bands.");

  return (
    <div className="bg-[var(--gov-page-bg)]">
      <div className="bg-[var(--gov-navy)] text-white px-3 py-1.5 flex items-center justify-between">
        <h2 className="text-[14px] font-bold">
          Resources — Risk Simulation & Forecast Models
        </h2>
        <span className="px-2 py-0.5 bg-white/20 text-[11px] font-semibold">
          Model v1.2 Active
        </span>
      </div>

      <div className="max-w-[1600px] mx-auto p-3 space-y-3">
        <MLPredictionCenter />

        {/* Scenario Sandbox */}
        <div className="bg-white border border-[var(--gov-border)]">
          <div className="bg-[var(--gov-navy)] text-white px-2 py-1.5 font-bold text-[13px] flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sliders className="w-4 h-4" /> Scenario Simulation Sandbox
            </span>
            <button
              onClick={() => {
                setSimValues({
                  soilMoisture: 40,
                  rainfall: 10,
                  waterLevel: 1.0,
                  pm25: 30,
                  aqi: 45,
                });
                addToast("Sandbox Reset", "Reset sensor values to baseline", "info");
              }}
              className="px-2 py-0.5 bg-white/20 hover:bg-white/30 text-[11px] font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> RESET
            </button>
          </div>

          <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-[12px]">
            {[
              { key: "soilMoisture", label: "Soil Moisture (AWS-1)" },
              { key: "rainfall", label: "Rainfall Intensity" },
              { key: "waterLevel", label: "River Water Level" },
              { key: "pm25", label: "PM2.5" },
            ].map((s) => (
              <div key={s.key} className="border border-[var(--gov-border)] p-2">
                <div className="flex justify-between font-bold text-[var(--gov-text)] mb-1">
                  <span>{s.label}</span>
                  <span className="text-[var(--gov-navy)] font-mono">
                    {simValues[s.key]} {RANGES[s.key].unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={RANGES[s.key].min}
                  max={RANGES[s.key].max}
                  step={s.key === "waterLevel" ? 0.1 : 1}
                  value={simValues[s.key]}
                  onChange={(e) =>
                    setSimValues({ ...simValues, [s.key]: Number(e.target.value) })
                  }
                  className="w-full accent-[var(--gov-blue)]"
                />
                {/* Normalized bar (D4) */}
                <div className="mt-1 h-1.5 bg-[var(--gov-page-bg)] rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-[var(--gov-blue)]"
                    style={{ width: `${toPercent(s.key, simValues[s.key])}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Score cards */}
          <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-[var(--gov-border)]">
            {[
              { label: "Simulated Score", score: simRisk.overallScore, level: simRisk.overallLevel },
              { label: "Landslide Risk", score: simRisk.landslideScore, level: simRisk.landslideLevel },
              { label: "Flood Risk", score: simRisk.floodScore, level: simRisk.floodLevel },
              { label: "Air Quality Risk", score: simRisk.airQualityScore, level: simRisk.airQualityLevel },
            ].map((c) => (
              <div key={c.label} className="border border-[var(--gov-border)] p-2 text-center">
                <span className="text-[10px] text-[var(--gov-text-muted)] font-bold uppercase block">
                  {c.label}
                </span>
                <span className="text-[20px] font-bold text-[var(--gov-text)]">{c.score}</span>
                <span className="text-[10px] font-bold block mt-0.5 px-1.5 py-0.5 bg-[var(--gov-page-bg)] text-[var(--gov-text)] inline-block uppercase">
                  {c.level}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Fusion Triggers – populated (A3) */}
        <div className="bg-white border border-[var(--gov-border)]">
          <div className="bg-[var(--gov-navy)] text-white px-2 py-1.5 text-[12px] font-bold">
            FUSION TRIGGERS — Event Rationale
          </div>
          <div className="p-3 text-[12px] text-[var(--gov-text)] space-y-1">
            {rationale.map((line, i) => (
              <p key={i}>• {line}</p>
            ))}
            <p className="text-[var(--gov-text-secondary)] mt-1">
              Composite score is driven by the weighted combination of the factors above.
            </p>
          </div>
        </div>

        <MLHistoryChart />
      </div>
    </div>
  );
};