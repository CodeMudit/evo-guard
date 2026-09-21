import React from "react";

export const SensorGauge = ({
  title,
  value,
  unit,
  min = 0,
  max = 100,
  warningThreshold,
  criticalThreshold,
  safeRange,
  status = "normal", // normal | warning | critical
}) => {
  const numericVal = Number(value) || 0;
  const rangeMin = Array.isArray(safeRange) ? safeRange[0] : min;
  const rangeMax = Array.isArray(safeRange) ? safeRange[1] : max;
  const effectiveMin = Math.min(rangeMin, rangeMax);
  const effectiveMax = Math.max(rangeMin, rangeMax);
  const rangeSpan = Math.max(effectiveMax - effectiveMin, 1);
  const percentage = Math.min(100, Math.max(0, ((numericVal - effectiveMin) / rangeSpan) * 100));

  // Arc math: 0 to 180 degrees arc length = Math.PI * radius = Math.PI * 36 = ~113.1
  const radius = 36;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  const lowerBoundary = Array.isArray(safeRange) ? safeRange[0] : min;
  const upperBoundary = Array.isArray(safeRange) ? safeRange[1] : max;
  const warningLimit = typeof warningThreshold === "number" ? warningThreshold : upperBoundary;
  const criticalLimit = typeof criticalThreshold === "number" ? criticalThreshold : upperBoundary;

  let strokeColor = "#10b981"; // emerald-500

  if (status === "warning" || numericVal >= warningLimit || numericVal <= lowerBoundary) {
    strokeColor = "#f59e0b"; // amber-500
  }
  if (status === "critical" || numericVal > criticalLimit || numericVal < lowerBoundary * 0.85) {
    strokeColor = "#ef4444"; // red-500
  }

  if (Array.isArray(safeRange)) {
    const isInsideSafeRange = numericVal >= lowerBoundary && numericVal <= upperBoundary;
    if (isInsideSafeRange) {
      strokeColor = "#10b981";
    } else if (numericVal > upperBoundary) {
      strokeColor = numericVal >= criticalLimit || numericVal >= upperBoundary * 1.15 ? "#ef4444" : "#f59e0b";
    } else if (numericVal < lowerBoundary) {
      strokeColor = numericVal <= lowerBoundary * 0.85 ? "#ef4444" : "#f59e0b";
    }
  }

  return (
    <div className="flex flex-col items-center justify-between p-2.5 sm:p-3 rounded bg-[var(--color-surface-secondary)] border border-[var(--color-border)] shadow-sm min-w-0 w-full overflow-hidden transition-all hover:border-slate-300">
      <div className="relative w-full max-w-[90px] aspect-[100/62] flex flex-col items-center justify-end mx-auto">
        <svg viewBox="0 0 100 60" className="w-full h-full overflow-visible">
          {/* Background Arc */}
          <path
            d="M 14 50 A 36 36 0 0 1 86 50"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* Active Value Arc */}
          <path
            d="M 14 50 A 36 36 0 0 1 86 50"
            fill="none"
            stroke={strokeColor}
            strokeWidth="7.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Text Overlay */}
        <div className="absolute bottom-0 flex flex-col items-center justify-center leading-none text-center">
          <span className="text-sm sm:text-base font-black text-[var(--color-text-primary)] tracking-tight">
            {numericVal}
          </span>
          <span className="text-[9px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider mt-0.5">
            {unit}
          </span>
        </div>
      </div>

      <span className="text-[10px] font-bold text-[var(--color-text-secondary)] mt-2 text-center truncate w-full px-1 uppercase tracking-wider">
        {title}
      </span>
    </div>
  );
};
