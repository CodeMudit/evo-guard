import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Modal } from "../common/Modal";
import { FileText, MapPin, ArrowRight } from "lucide-react";

export const ReportedSections = () => {
  const { reports, setActivePage, focusOnMap } = useApp();
  const [selectedReport, setSelectedReport] = useState(null);

  const getStatusBadge = (status) => {
    switch (status) {
      case "New":
        return <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px] uppercase tracking-wider">New</span>;
      case "Under Review":
        return <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px] uppercase tracking-wider">Under Review</span>;
      case "Resolved":
      default:
        return <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] uppercase tracking-wider">Resolved</span>;
    }
  };

  return (
    <div className="p-4 rounded bg-white border border-[var(--color-border)] shadow-sm space-y-4 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-blue-50 text-blue-700 border border-blue-200">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] tracking-tight">Reported Sections</h3>
        </div>

        <button
          onClick={() => setActivePage("reports")}
          className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {reports.slice(0, 4).map((rep) => (
          <div
            key={rep.id}
            onClick={() => setSelectedReport(rep)}
            className="p-3.5 rounded bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white transition-all cursor-pointer space-y-2 group shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-[var(--color-text-primary)] group-hover:text-blue-700 transition-colors line-clamp-1">
                {rep.title}
              </h4>
              <div className="shrink-0">{getStatusBadge(rep.status)}</div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-secondary)] font-medium">
              <div className="flex items-center gap-1 min-w-0">
                <MapPin className="w-3 h-3 text-[var(--color-text-muted)] shrink-0" />
                <span className="truncate">{rep.location}</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="shrink-0">{rep.timeAgo}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`Reported Incident — ${selectedReport.title}`}
        >
          <div className="space-y-5">
            <div className="p-4 rounded bg-slate-50 border border-[var(--color-border)] flex items-center justify-between text-xs shadow-sm">
              <div>
                <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-wider block">Location</span>
                <span className="font-bold text-[var(--color-text-primary)] mt-1 block">{selectedReport.location}</span>
              </div>
              <div>{getStatusBadge(selectedReport.status)}</div>
            </div>

            <div className="p-4 rounded bg-white border border-[var(--color-border)] space-y-2 text-xs shadow-sm">
              <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider block border-b border-slate-100 pb-2">Reporter Details</span>
              <p className="text-[var(--color-text-secondary)] pt-1">Reported by: <strong className="text-[var(--color-text-primary)]">{selectedReport.reportedBy}</strong></p>
              <p className="text-[var(--color-text-secondary)]">Time: <strong className="text-[var(--color-text-primary)]">{selectedReport.timeAgo}</strong></p>
            </div>

            <div className="p-4 rounded bg-white border border-[var(--color-border)] space-y-2 text-xs shadow-sm">
              <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider block border-b border-slate-100 pb-2">Incident Description</span>
              <p className="text-[var(--color-text-primary)] leading-relaxed pt-1 font-medium">{selectedReport.description}</p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border)]">
              {selectedReport.coordinates && (
                <button
                  onClick={() => {
                    focusOnMap(selectedReport.coordinates[0], selectedReport.coordinates[1], 15);
                    setSelectedReport(null);
                  }}
                  className="px-6 py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm uppercase tracking-wider"
                >
                  FOCUS MAP LOCATION
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
