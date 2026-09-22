import React from "react";
import { useApp } from "../context/AppContext";
import { Smartphone, WifiOff, UploadCloud, MapPin } from "lucide-react";

export const FieldAppPage = () => {
  const { setActivePage } = useApp();

  return (
    <div className="bg-transparent relative z-10">
      <div className="bg-[var(--gov-primary)] text-white px-4 py-2">
        <h2 className="text-[15px] font-semibold tracking-wide">
          Field Toolkit — Offline Reporting Module
        </h2>
      </div>

      <div className="w-full px-3 md:px-4 lg:px-5 py-4 space-y-3">
        <div className="bg-white/95 backdrop-blur-sm border border-[var(--gov-border)] rounded-[var(--panel-radius)] shadow-sm overflow-hidden">
          <div className="bg-[var(--gov-primary)] text-white px-4 py-2 font-semibold text-[13px]">
            About the Field Reporting PWA
          </div>
          <div className="p-4 text-[13px] text-[var(--gov-text-secondary)] space-y-4 leading-relaxed">
            <p>
              The Field Toolkit is an offline-capable progressive web application designed for field officials and citizens.
              Users can capture geo-tagged photos and videos of slope cracks, blocked roads or water surge even when network
              connectivity is unavailable. Reports are queued locally and automatically synchronised when the device comes back online.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="border border-[var(--gov-border)] rounded-md p-3 bg-slate-50/50">
                <MapPin className="w-5 h-5 text-[var(--gov-primary)] mb-1.5" />
                <h4 className="font-semibold text-[var(--gov-primary)] text-[13px]">Geo-tagged Capture</h4>
                <p className="text-[12px] mt-1">GPS location is attached automatically or can be set by map pin.</p>
              </div>
              <div className="border border-[var(--gov-border)] rounded-md p-3 bg-slate-50/50">
                <WifiOff className="w-5 h-5 text-[var(--gov-primary)] mb-1.5" />
                <h4 className="font-semibold text-[var(--gov-primary)] text-[13px]">Offline Queue</h4>
                <p className="text-[12px] mt-1">Reports are stored in IndexedDB and synced on reconnect.</p>
              </div>
              <div className="border border-[var(--gov-border)] rounded-md p-3 bg-slate-50/50">
                <UploadCloud className="w-5 h-5 text-[var(--gov-primary)] mb-1.5" />
                <h4 className="font-semibold text-[var(--gov-primary)] text-[13px]">Media Compression</h4>
                <p className="text-[12px] mt-1">Images are compressed client-side before upload to save bandwidth.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm border border-[var(--gov-border)] rounded-[var(--panel-radius)] p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div>
            <h3 className="font-semibold text-[var(--gov-primary)] text-[14px]">Launch Field Reporting Form</h3>
            <p className="text-[13px] text-[var(--gov-text-secondary)]">
              Opens the full geo-tagged report submission interface used by field officers.
            </p>
          </div>
          <button
            onClick={() => setActivePage("field-ops")}
            className="px-4 py-2.5 bg-[var(--gov-success)] text-white text-[13px] font-semibold flex items-center gap-2 rounded-md hover:opacity-90 transition-opacity"
          >
            <Smartphone className="w-4 h-4" />
            Open Reporting Form
          </button>
        </div>
      </div>
    </div>
  );
};