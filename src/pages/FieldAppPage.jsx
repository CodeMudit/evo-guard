import React from "react";
import { useApp } from "../context/AppContext";
import { Smartphone, WifiOff, UploadCloud, MapPin } from "lucide-react";

export const FieldAppPage = () => {
  const { setActivePage } = useApp();

  return (
    <div className="bg-[var(--gov-page-bg)]">
      <div className="bg-[var(--gov-navy)] text-white px-3 py-1.5">
        <h2 className="text-[14px] font-bold">Field App — Offline Reporting Module</h2>
      </div>

      <div className="max-w-[1600px] mx-auto p-3 space-y-3">
        <div className="bg-white border border-[var(--gov-border)]">
          <div className="bg-[var(--gov-navy)] text-white px-3 py-1.5 font-bold text-[13px]">
            About the Field Reporting PWA
          </div>
          <div className="p-4 text-[13px] text-[var(--gov-text-secondary)] space-y-3 leading-relaxed">
            <p>
              The Field App is an offline-capable progressive web application designed for field officials and citizens.
              Users can capture geo-tagged photos and videos of slope cracks, blocked roads or water surge even when network
              connectivity is unavailable. Reports are queued locally and automatically synchronised when the device comes back online.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="border border-[var(--gov-border)] p-3">
                <MapPin className="w-5 h-5 text-[var(--gov-navy)] mb-1" />
                <h4 className="font-bold text-[var(--gov-navy)] text-[12px]">Geo-tagged Capture</h4>
                <p className="text-[11.5px] mt-1">GPS location is attached automatically or can be set by map pin.</p>
              </div>
              <div className="border border-[var(--gov-border)] p-3">
                <WifiOff className="w-5 h-5 text-[var(--gov-navy)] mb-1" />
                <h4 className="font-bold text-[var(--gov-navy)] text-[12px]">Offline Queue</h4>
                <p className="text-[11.5px] mt-1">Reports are stored in IndexedDB and synced on reconnect.</p>
              </div>
              <div className="border border-[var(--gov-border)] p-3">
                <UploadCloud className="w-5 h-5 text-[var(--gov-navy)] mb-1" />
                <h4 className="font-bold text-[var(--gov-navy)] text-[12px]">Media Compression</h4>
                <p className="text-[11.5px] mt-1">Images are compressed client-side before upload to save bandwidth.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[var(--gov-border)] p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-[var(--gov-navy)] text-[13px]">Launch Field Reporting Form</h3>
            <p className="text-[12px] text-[var(--gov-text-secondary)]">
              Opens the full geo-tagged report submission interface used by field officers.
            </p>
          </div>
          <button
            onClick={() => setActivePage("field-ops")}
            className="px-4 py-2 bg-[var(--gov-green)] text-white text-[12.5px] font-semibold flex items-center gap-2"
          >
            <Smartphone className="w-4 h-4" />
            Open Reporting Form
          </button>
        </div>
      </div>
    </div>
  );
};