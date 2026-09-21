import React from "react";
import { Modal } from "../common/Modal";
import { useApp } from "../../context/AppContext";
import { AlertTriangle, MapPin, CheckCircle2, Radio, CloudSun } from "lucide-react";

export const AlertDetailModal = ({ isOpen, onClose, alert }) => {
  const { acknowledgeAlert, resolveAlert, focusOnMap } = useApp();

  if (!alert) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Alert Detail — ${alert.title}`}>
      <div className="space-y-5">
        {/* Severity Banner */}
        <div className="p-4 rounded bg-red-50 border border-red-200 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-red-100 text-red-700">
              <AlertTriangle className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-900">{alert.title}</h4>
              <p className="text-xs font-medium text-red-700 mt-0.5">{alert.location}</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded bg-red-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm">
            {alert.severity}
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded bg-slate-50 border border-[var(--color-border)] text-xs shadow-sm">
          <div>
            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-wider block">Source</span>
            <span className="font-bold text-[var(--color-text-primary)] flex items-center gap-1.5 mt-1">
              {alert.sourceType === "node" ? <Radio className="w-3.5 h-3.5 text-blue-600" /> : <CloudSun className="w-3.5 h-3.5 text-purple-600" />}
              {alert.source}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-wider block">Triggered Sensor Value</span>
            <span className="font-bold text-amber-700 font-mono mt-1 block bg-amber-50 inline-block px-1.5 py-0.5 rounded border border-amber-200">{alert.sensorValue}</span>
          </div>

          <div>
            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-wider block">ML Risk Score</span>
            <span className="font-bold text-red-700 mt-1 block">{alert.mlRiskScore} / 100</span>
          </div>

          <div>
            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-wider block">Status</span>
            <span className={`font-bold mt-1 block uppercase tracking-wider ${alert.status === 'Resolved' ? 'text-emerald-700' : 'text-amber-700'}`}>{alert.status}</span>
          </div>
        </div>

        {/* Alert Description */}
        <div className="p-4 rounded bg-white border border-[var(--color-border)] space-y-2 shadow-sm">
          <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider block border-b border-slate-100 pb-2">Trigger Narrative</span>
          <p className="text-sm font-medium text-[var(--color-text-primary)] leading-relaxed pt-1">{alert.message}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--color-border)]">
          <button
            onClick={() => {
              focusOnMap(alert.lat, alert.lng, 15);
              onClose();
            }}
            className="px-4 py-2.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-slate-300 shadow-sm transition-colors"
          >
            <MapPin className="w-4 h-4 text-blue-600" />
            FOCUS MAP
          </button>

          <div className="flex flex-wrap items-center gap-3">
            {alert.status === "Active" && (
              <button
                onClick={() => {
                  acknowledgeAlert(alert.id);
                  onClose();
                }}
                className="px-4 py-2.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 shadow-sm text-xs font-bold uppercase tracking-wider transition-colors"
              >
                ACKNOWLEDGE
              </button>
            )}

            {alert.status !== "Resolved" && (
              <button
                onClick={() => {
                  resolveAlert(alert.id);
                  onClose();
                }}
                className="px-4 py-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                RESOLVE ALERT
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
