import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { AlertPanel } from "../components/alerts/AlertPanel";
import { PriorityWatchlist } from "../components/map/PriorityWatchlist";
import { MapPanel } from "../components/map/MapPanel";
import { Terrain3DViewer } from "../components/map/Terrain3DViewer";
import { LocationIntelligenceDrawer } from "../components/map/LocationIntelligenceDrawer";
import { AlertDetailModal } from "../components/alerts/AlertDetailModal";
import { Modal } from "../components/common/Modal";
import { FilePlus, ShieldAlert, Activity, CheckCircle2, CloudSun } from "lucide-react";

export const HomeDashboard = ({ viewMode = "overview" }) => {
  const {
    addReportedSection,
    setActivePage,
    alerts,
    computedRisk,
    apiData,
  } = useApp();

  const [selectedAlertForModal, setSelectedAlertForModal] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [mapMode, setMapMode] = useState("2D");
  const [terrainTarget, setTerrainTarget] = useState(null);

  const [reportForm, setReportForm] = useState({
    title: "",
    location: "Hill Sector NH-13",
    severity: "HIGH",
    reportedBy: "Operator Station",
    description: "",
  });

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportForm.title || !reportForm.description) return;
    addReportedSection(reportForm);
    setIsReportModalOpen(false);
    setReportForm({
      title: "",
      location: "Hill Sector NH-13",
      severity: "HIGH",
      reportedBy: "Operator Station",
      description: "",
    });
  };

  // 1. RISK MAP VIEW (Focus on Map & Drawer)
  if (viewMode === "risk-map") {
    return (
      <div className="flex flex-col h-[calc(100vh-60px)]">
        {mapMode === "2D" ? (
          <MapPanel
            onCreateReport={(lat, lng) => {
                setReportForm({
                    ...reportForm,
                    location: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`
                });
                setIsReportModalOpen(true);
            }}
            onOpen3D={(lat, lng) => {
                setTerrainTarget({ lat, lng });
                setMapMode("3D");
            }}
          />
        ) : (
          <Terrain3DViewer 
            centerLat={terrainTarget?.lat} 
            centerLng={terrainTarget?.lng}
            onClose={() => setMapMode("2D")}
          />
        )}
      </div>
    );
  }

  // 2. WATCHLIST VIEW (Focus on Prioritized Locations)
  if (viewMode === "watchlist") {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-[1920px] w-full mx-auto space-y-6 flex gap-6">
        <div className="flex-1">
          <PriorityWatchlist onSelectLocation={(id) => setSelectedLocationId(id)} />
        </div>
        {selectedLocationId && (
          <div className="w-[400px] shrink-0 border border-[var(--color-border)] rounded shadow-xl bg-white overflow-hidden relative">
            <LocationIntelligenceDrawer 
              locationId={selectedLocationId} 
              onClose={() => setSelectedLocationId(null)} 
            />
          </div>
        )}
      </div>
    );
  }

  // 3. OVERVIEW VIEW (Command Center)
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1920px] w-full mx-auto space-y-6 pb-12">
      {/* COMPACT OPERATIONAL STATUS STRIP */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--color-surface-primary)] border border-[var(--color-border)] p-3 rounded shadow-sm">
        <div className="flex gap-4">
            <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-text-secondary)] font-medium">Regional Risk:</span>
            <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${computedRisk.overallLevel === 'HIGH' || computedRisk.overallLevel === 'EXTREME' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                {computedRisk.overallLevel}
            </span>
            </div>
            <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-text-secondary)] font-medium">Active Alerts:</span>
            <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded">
                {alerts.filter(a => a.status === 'Active').length} ZONES
            </span>
            </div>
        </div>
        
        <div className="flex gap-4">
            <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-text-secondary)] font-medium">Telemetry:</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> ONLINE
            </span>
            </div>
            <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-text-secondary)] font-medium">Weather API:</span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
                <CloudSun className="w-3.5 h-3.5" /> LIVE
            </span>
            </div>
        </div>
      </div>

      {/* Grid: Map + Priorities + Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-[700px]">
        {/* Main Map Area */}
        <div className="xl:col-span-3 flex flex-col relative h-full">
          {mapMode === "2D" ? (
            <MapPanel
              onCreateReport={(lat, lng) => {
                  setReportForm({
                      ...reportForm,
                      location: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`
                  });
                  setIsReportModalOpen(true);
              }}
              onOpen3D={(lat, lng) => {
                  setTerrainTarget({ lat, lng });
                  setMapMode("3D");
              }}
            />
          ) : (
            <Terrain3DViewer 
              centerLat={terrainTarget?.lat} 
              centerLng={terrainTarget?.lng}
              onClose={() => setMapMode("2D")}
            />
          )}
        </div>

        {/* Side Panel Area */}
        <div className="xl:col-span-1 flex flex-col space-y-6 overflow-hidden">
          {selectedLocationId ? (
            <div className="h-full border border-[var(--color-border)] rounded shadow-xl bg-white overflow-hidden relative">
              <LocationIntelligenceDrawer 
                locationId={selectedLocationId} 
                onClose={() => setSelectedLocationId(null)} 
              />
            </div>
          ) : (
            <>
              <div className="flex-1 bg-white border border-[var(--color-border)] rounded shadow-sm overflow-hidden shrink-0 min-h-[350px]">
                 <PriorityWatchlist onSelectLocation={(id) => setSelectedLocationId(id)} />
              </div>
              
              <div className="flex-1 min-h-[300px] overflow-hidden">
                 <AlertPanel onSelectAlert={(a) => setSelectedAlertForModal(a)} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Alert Details Modal */}
      {selectedAlertForModal && (
        <AlertDetailModal
          isOpen={!!selectedAlertForModal}
          onClose={() => setSelectedAlertForModal(null)}
          alert={selectedAlertForModal}
        />
      )}

      {/* Create Incident Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Log Incident Report — Field Patrol"
      >
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1">Incident Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Landslide Debris, Water Surge, Rockfall"
              value={reportForm.title}
              onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
              className="w-full bg-white border border-[var(--color-border)] rounded px-3 py-2 text-xs text-[var(--color-text-primary)] outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1">Location / Sector</label>
              <input
                type="text"
                value={reportForm.location}
                onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                className="w-full bg-white border border-[var(--color-border)] rounded px-3 py-2 text-xs text-[var(--color-text-primary)] outline-none focus:border-blue-500 shadow-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1">Severity</label>
              <select
                value={reportForm.severity}
                onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value })}
                className="w-full bg-white border border-[var(--color-border)] rounded px-3 py-2 text-xs text-[var(--color-text-primary)] outline-none focus:border-blue-500 shadow-sm"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1">Description & Field Notes</label>
            <textarea
              rows={3}
              required
              placeholder="Describe observations, affected road lanes, or structural stress..."
              value={reportForm.description}
              onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
              className="w-full bg-white border border-[var(--color-border)] rounded px-3 py-2 text-xs text-[var(--color-text-primary)] outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="px-4 py-2 rounded bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-slate-900 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <FilePlus className="w-4 h-4" />
              Submit Incident Report
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
