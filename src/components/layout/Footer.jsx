import React from "react";
import { MOCK_VISITOR_STATS } from "../../data/mockContent";

export const Footer = () => (
  <footer className="mt-4">
    <div className="bg-white border-t border-[var(--gov-border)] py-3">
      <div className="max-w-[1600px] mx-auto px-3">
        <p className="text-[12px] font-semibold text-[var(--gov-navy)] mb-2">Related resources (placeholders)</p>
        <div className="flex flex-wrap gap-3">
          {["ISRO", "Bhuvan", "MOSDAC", "IMD", "NDMA", "DoNER"].map((name) => (
            <div
              key={name}
              className="w-16 h-12 border border-[var(--gov-border)] rounded-sm flex items-center justify-center text-[10px] font-bold text-[var(--gov-text-muted)] bg-[var(--gov-page-bg)]"
              title="Placeholder – not an official link"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="bg-[var(--gov-navy)] text-white text-[11.5px]">
      <div className="max-w-[1600px] mx-auto px-3 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-3">
          {/* TODO: replace with real project pages when available */}
          <a href="#" className="hover:underline">Privacy Policy</a>
          <span>|</span>
          <a href="#" className="hover:underline">Terms</a>
          <span>|</span>
          <a href="#" className="hover:underline">Disclaimer</a>
          <span>|</span>
          <a href="#" className="hover:underline">Contact</a>
        </div>
        <div className="text-[11px]">
          Visitors (demo): Today {MOCK_VISITOR_STATS.today} · Weekly {MOCK_VISITOR_STATS.weekly} · Total {MOCK_VISITOR_STATS.total}
        </div>
      </div>
      <div className="max-w-[1600px] mx-auto px-3 py-1.5 border-t border-white/20 flex flex-wrap justify-between text-[11px] opacity-90">
        <span>Last updated: 21.09.2026</span>
        <span>© 2026 EcoWatch AI · SIH26001 Team · Prototype — simulated data</span>
      </div>
    </div>
  </footer>
);