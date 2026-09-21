import React from "react";
import { useApp } from "../../context/AppContext";
import { RiskIndicator } from "./RiskIndicator";
import { ModelInputBar } from "./ModelInputBar";
import { BrainCircuit, Cpu } from "lucide-react";
import { computeConfidence } from "../../data/mockPredictions";

export const MLPredictionCenter = ({ onViewAlertModal, onCreateReportModal }) => {
  const {
    currentMLPrediction,
    mlCategory,
    setMlCategory,
    computedRisk,
  } = useApp();

  const activeCategoryData =
    currentMLPrediction.predictions[mlCategory] || currentMLPrediction.predictions.Overall;

  // Use dynamically calculated score from computedRisk
  let currentScore = computedRisk.overallScore;
  let currentLevel = computedRisk.overallLevel;

  if (mlCategory === "Landslide") {
    currentScore = computedRisk.landslideScore;
    currentLevel = computedRisk.landslideLevel;
  } else if (mlCategory === "Flood") {
    currentScore = computedRisk.floodScore;
    currentLevel = computedRisk.floodLevel;
  } else if (mlCategory === "AirQuality") {
    currentScore = computedRisk.airQualityScore;
    currentLevel = computedRisk.airQualityLevel;
  }

  return (
    <div className="p-6 rounded bg-[var(--color-surface-primary)] border border-[var(--color-border)] shadow-sm space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-blue-50 text-blue-700 border border-blue-200">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight flex items-center gap-2">
              Risk Fusion Engine
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
                Active
              </span>
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] font-medium">Data Fusion & Predictive Hazard Assessment</p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 p-1 rounded bg-slate-50 border border-[var(--color-border)] self-start md:self-auto overflow-x-auto">
          {["Overall", "Landslide", "Flood", "AirQuality"].map((cat) => {
            const isActive = mlCategory === cat;
            const labels = {
              Overall: "Overall Risk",
              Landslide: "Landslide",
              Flood: "Flood",
              AirQuality: "Air Quality",
            };
            return (
              <button
                key={cat}
                onClick={() => setMlCategory(cat)}
                className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap border ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:text-slate-900 hover:bg-white border-transparent hover:border-slate-300"
                }`}
              >
                {labels[cat]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Prediction Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Risk score indicator & model specs */}
        <div className="lg:col-span-4 space-y-4">
          <RiskIndicator score={currentScore} level={currentLevel} />

          <div className="p-4 rounded bg-white border border-[var(--color-border)] space-y-2 text-xs shadow-sm">
            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span className="font-medium">Assessed Hazard:</span>
              <span className="text-[var(--color-text-primary)] font-bold">{activeCategoryData.hazard}</span>
            </div>
            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span className="font-medium">Model Confidence:</span>
              <span className="text-blue-700 font-bold">{computeConfidence(computedRisk, mlCategory)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span className="font-medium">Forecast Horizon:</span>
              <span className="text-emerald-700 font-bold">{activeCategoryData.horizon}</span>
            </div>
            <div className="flex justify-between text-[var(--color-text-secondary)] pt-2 border-t border-[var(--color-border)] mt-2">
              <span className="font-medium">Model Version:</span>
              <span className="text-[var(--color-text-muted)] font-mono font-bold">{currentMLPrediction.modelVersion}</span>
            </div>
            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span className="font-medium">Last Compute:</span>
              <span className="text-[var(--color-text-muted)] font-mono font-bold">{currentMLPrediction.lastPredictionTime}</span>
            </div>
          </div>
        </div>

        {/* Right: Model Input Parameters & Influence */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-4 rounded bg-white border border-[var(--color-border)] space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
              <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                Telemetry Inputs & Risk Factors
              </h4>
              <span className="text-[10px] text-[var(--color-text-muted)] font-mono font-bold">Normalized Weights</span>
            </div>

            <div className="space-y-3">
              {activeCategoryData.inputInfluences.map((input, idx) => (
                <ModelInputBar key={idx} {...input} />
              ))}
            </div>
          </div>

          <div className="p-4 rounded bg-white border border-[var(--color-border)] space-y-3 shadow-sm">
             <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4" /> Fusion Triggers
                </h4>
                <span className="text-[10px] text-[var(--color-text-muted)] font-mono font-bold">Event Rationale</span>
             </div>
             <div className="space-y-2 text-xs">
                {Object.values(computedRisk.events || {}).filter(ev => ev.active).length > 0 ? (
                   Object.values(computedRisk.events).filter(ev => ev.active).map((ev, i) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded bg-red-50 border border-red-200">
                         <span className="text-red-700 font-bold">{ev.title}</span>
                         <span className="text-red-800/80 font-medium">{ev.details}</span>
                      </div>
                   ))
                ) : (
                   <div className="p-3 text-center text-[var(--color-text-secondary)] border border-slate-200 border-dashed rounded bg-slate-50 font-medium">
                      No critical thresholds triggered. Risk is within baseline operational parameters.
                   </div>
                )}
                {computedRisk.overallScore > 80 && (
                   <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 font-bold mt-2">
                      Recent Field Reports escalated overall prediction score by up to 15%.
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
