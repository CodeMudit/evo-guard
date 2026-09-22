import React, { useEffect } from "react";

export const AboutModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white border border-[var(--gov-border)] w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[var(--gov-navy)] text-white px-3 py-2 flex justify-between items-center">
          <h2 className="text-[14px] font-bold">About EcoWatch AI</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center bg-white/20 hover:bg-white/30 text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-4 overflow-y-auto text-[13px] text-[var(--gov-text-secondary)] leading-relaxed space-y-3">
          <p>
            EcoWatch AI is a prototype early-warning and monitoring platform developed for the Smart India Hackathon (SIH26001).
            It demonstrates real-time landslide and slope-failure risk monitoring for the North Eastern Region using simulated
            rainfall, soil-moisture, satellite and field-report data.
          </p>
          <p>
            This is a student/hackathon prototype. All telemetry, alerts and risk scores currently shown are simulated for demonstration purposes and must not be treated as operational or official advisories.
          </p>
          <p className="text-[12px] text-[var(--gov-text-muted)]">
            NER-DRR Prototype · SIH26001 · Simulated data only
          </p>
        </div>

        <div className="p-3 border-t border-[var(--gov-border)] bg-[var(--gov-page-bg)] text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[var(--gov-navy)] text-white text-[12.5px] font-semibold hover:bg-[var(--gov-navy-mid)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};