import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import { MapPanel } from "../components/map/MapPanel";
import { AlertDetailModal } from "../components/alerts/AlertDetailModal";
import { Modal } from "../components/common/Modal";
import {
  FilePlus,
  CheckCircle2,
  CloudSun,
  Mountain,
  Droplets,
  CloudRain,
  ClipboardList,
} from "lucide-react";
import {
  MOCK_ADVISORIES,
  MOCK_EVENTS,
  MOCK_NEWS,
  MOCK_SOCIAL,
  MOCK_SERVICES,
} from "../data/mockContent";

const SERVICE_ICON_MAP = {
  "Landslide Monitoring": Mountain,
  "Hydrological Services": Droplets,
  "Meteorological Risk": CloudRain,
  "Field Reporting": ClipboardList,
};

const SERVICE_LABEL_KEYS = {
  "Landslide Monitoring": "service_landslide",
  "Hydrological Services": "service_hydro",
  "Meteorological Risk": "service_meteo",
  "Field Reporting": "service_field",
};

export const HomeDashboard = ({ viewMode = "overview" }) => {
  const { t } = useTranslation();
  const { alerts, computedRisk, addReportedSection } = useApp();
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: "",
    location: "",
    severity: "",
    reportedBy: "Field Officer",
    description: "",
  });
  const [socialFilter, setSocialFilter] = useState("All");

  const handleReport = (e) => {
    e.preventDefault();
    if (!reportForm.title || !reportForm.severity) return;
    addReportedSection(reportForm);
    setIsReportOpen(false);
    setReportForm({
      title: "",
      location: "",
      severity: "",
      reportedBy: "Field Officer",
      description: "",
    });
  };

  const activeAlerts = (alerts || []).filter((a) => a.status === "Active");
  const eventFeed =
    activeAlerts.length > 0
      ? activeAlerts.map((a) => ({
          text: `Reviewed ***Risk Level: ${a.severity}, Location: ${a.source || a.title}, Date&Time: ${a.timeAgo || a.timestamp}`,
        }))
      : MOCK_EVENTS;

  const filteredSocial =
    socialFilter === "All"
      ? MOCK_SOCIAL
      : MOCK_SOCIAL.filter((p) => p.tags.includes(socialFilter));

  const riskLevel = computedRisk?.overallLevel || "MODERATE";
  const riskLabel = t(riskLevel) !== riskLevel ? t(riskLevel) : riskLevel;

  return (
    <div className="bg-[var(--gov-page-bg)]">
      {/* Title bar – full width */}
      <div className="bg-[var(--gov-primary)] text-white px-4 py-2 flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-[15px] font-semibold tracking-wide">
          {t("disasterMonitoringDashboard")}
        </h2>
        <div className="flex items-center gap-4 text-[12.5px]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            {t("telemetryOnline")}
          </span>
          <span className="flex items-center gap-1.5">
            <CloudSun className="w-3.5 h-3.5 text-sky-200" />
            {t("weatherLive")}
          </span>
          <span
            className={`px-2.5 py-0.5 font-semibold text-[12px] rounded ${
              ["HIGH", "EXTREME", "CRITICAL"].includes(riskLevel)
                ? "bg-[var(--gov-danger)]"
                : "bg-[var(--gov-accent)]"
            }`}
          >
            {t("regionalRisk")}: {riskLabel}
          </span>
        </div>
      </div>

      {/* Main grid – full bleed with padding */}
      <div className="w-full px-3 md:px-4 lg:px-5 py-3 grid grid-cols-1 xl:grid-cols-12 gap-3">
        {/* Map */}
        <div
          className="xl:col-span-8 bg-white border border-[var(--gov-border)] rounded-[var(--panel-radius)] overflow-hidden shadow-sm relative"
          style={{ height: "560px" }}
        >
          <MapPanel
            size="full"
            onCreateReport={(lat, lng) => {
              setReportForm((f) => ({
                ...f,
                location: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
              }));
              setIsReportOpen(true);
            }}
          />
        </div>

        {/* Advisories */}
        <div
          className="xl:col-span-2 bg-white border border-[var(--gov-border)] rounded-[var(--panel-radius)] flex flex-col shadow-sm overflow-hidden"
          style={{ height: "560px" }}
        >
          <div className="bg-[var(--gov-accent)] text-white px-3 py-2 font-semibold text-[13px] flex justify-between items-center">
            <span>{t("advisories")}</span>
            <select className="bg-[var(--gov-accent-dark)] text-white text-[11px] border-0 outline-none px-1.5 py-0.5 rounded">
              <option>All</option>
              <option>Landslide</option>
              <option>Heavy Rain</option>
              <option>Flood</option>
            </select>
          </div>
          <div className="p-2.5 space-y-2 overflow-y-auto flex-1">
            {(activeAlerts.length > 0 ? activeAlerts : MOCK_ADVISORIES)
              .slice(0, 6)
              .map((a, i) => (
                <div
                  key={a.id || i}
                  onClick={() => a.id && setSelectedAlert(a)}
                  className="border border-[var(--gov-border)] rounded-md p-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="bg-[var(--gov-yellow)] text-[var(--gov-text)] text-[10px] font-bold px-1.5 py-0.5 uppercase rounded">
                      {a.type || a.severity || "LANDSLIDE"}
                    </span>
                    <span className="text-[11px] text-[var(--gov-text-muted)]">
                      {a.timeAgo || a.timeframe?.split("–")[0]}
                    </span>
                  </div>
                  <p className="text-[13px] font-medium text-[var(--gov-text)] leading-snug">
                    {a.title ||
                      (a.warning ? a.warning.slice(0, 80) + "…" : "Advisory")}
                  </p>
                  {a.areas && (
                    <p className="text-[12px] text-[var(--gov-text-secondary)] mt-0.5">
                      {t("affectedAreas")}: {a.areas}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Events */}
        <div
          className="xl:col-span-2 bg-white border border-[var(--gov-border)] rounded-[var(--panel-radius)] flex flex-col shadow-sm overflow-hidden"
          style={{ height: "560px" }}
        >
          <div className="bg-[var(--gov-primary)] text-white px-3 py-2 font-semibold text-[13px]">
            {t("events")}
          </div>
          <div className="p-2.5 space-y-2 overflow-y-auto flex-1 text-[12.5px] text-[var(--gov-text)]">
            {eventFeed.length === 0 ? (
              <p className="text-center text-[var(--gov-text-muted)] py-8">
                {t("noEventsYet")}
              </p>
            ) : (
              eventFeed.map((ev, i) => (
                <div
                  key={i}
                  className="border-b border-[var(--gov-border)] pb-2 last:border-0"
                >
                  {ev.text}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Highlights ticker – full width */}
      <div className="w-full px-3 md:px-4 lg:px-5">
        <div className="bg-[var(--gov-accent)] text-white flex items-center rounded-[var(--panel-radius)] overflow-hidden shadow-sm">
          <div className="bg-[var(--gov-accent-dark)] px-4 py-2 font-semibold text-[13px] shrink-0">
            {t("highlights")}
          </div>
          <div className="flex-1 overflow-hidden py-2">
            <div className="marquee-track text-[13px]">
              {[...eventFeed, ...eventFeed].map((ev, i) => (
                <span key={i} className="mx-6 whitespace-nowrap">
                  {ev.text}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="bg-[var(--gov-primary)] px-4 py-2 text-[12px] font-semibold shrink-0 hover:bg-[var(--gov-primary-mid)] transition-colors"
          >
            {t("viewAll")}
          </button>
        </div>
      </div>

      {/* Services band */}
      <div className="bg-[var(--gov-primary)] text-white mt-4">
        <div className="w-full px-4 py-5">
          <h3 className="text-center text-[15px] font-semibold mb-4 tracking-wide">
            {t("drrServices")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MOCK_SERVICES.map((s) => {
              const Icon = SERVICE_ICON_MAP[s.title] || Mountain;
              const labelKey = SERVICE_LABEL_KEYS[s.title];
              return (
                <div
                  key={s.title}
                  className="bg-white text-[var(--gov-text)] rounded-[var(--panel-radius)] overflow-hidden shadow-sm"
                >
                  <div className="h-20 bg-slate-100 flex items-center justify-center">
                    <Icon className="w-9 h-9 text-[var(--gov-primary)] opacity-80" />
                  </div>
                  <div className="bg-[var(--gov-accent)] text-white text-center py-1.5 font-semibold text-[13px]">
                    {labelKey ? t(labelKey) : s.title}
                  </div>
                  <p className="text-[12px] text-center p-2 text-[var(--gov-text-secondary)] leading-snug">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Remaining lower sections keep existing structure but use full-bleed padding */}
      <div className="w-full px-3 md:px-4 lg:px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* News / Social placeholders – kept for completeness */}
        <div className="bg-white border border-[var(--gov-border)] rounded-[var(--panel-radius)] p-4 shadow-sm">
          <h3 className="font-semibold text-[14px] text-[var(--gov-primary)] mb-3">Latest Advisories & News</h3>
          <div className="space-y-2 text-[13px]">
            {(MOCK_NEWS || []).slice(0, 4).map((n, i) => (
              <div key={i} className="border-b border-[var(--gov-border)] pb-2 last:border-0">
                <p className="font-medium">{n.title || n.text}</p>
                <p className="text-[12px] text-[var(--gov-text-muted)]">{n.date || n.source}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-[var(--gov-border)] rounded-[var(--panel-radius)] p-4 shadow-sm">
          <h3 className="font-semibold text-[14px] text-[var(--gov-primary)] mb-3">Field Signals</h3>
          <div className="space-y-2 text-[13px]">
            {filteredSocial.slice(0, 4).map((p, i) => (
              <div key={i} className="border-b border-[var(--gov-border)] pb-2 last:border-0">
                <p>{p.text || p.content}</p>
                <p className="text-[12px] text-[var(--gov-text-muted)]">{p.source} · {p.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AlertDetailModal
        alert={selectedAlert}
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
      />

      <Modal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="Submit Field Report"
      >
        <form onSubmit={handleReport} className="space-y-3">
          <input
            className="w-full border border-[var(--gov-border)] rounded px-3 py-2 text-sm"
            placeholder="Title"
            value={reportForm.title}
            onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
            required
          />
          <input
            className="w-full border border-[var(--gov-border)] rounded px-3 py-2 text-sm"
            placeholder="Location"
            value={reportForm.location}
            onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
          />
          <select
            className="w-full border border-[var(--gov-border)] rounded px-3 py-2 text-sm"
            value={reportForm.severity}
            onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value })}
            required
          >
            <option value="">Severity</option>
            <option value="LOW">Low</option>
            <option value="MODERATE">Moderate</option>
            <option value="HIGH">High</option>
            <option value="EXTREME">Extreme</option>
          </select>
          <textarea
            className="w-full border border-[var(--gov-border)] rounded px-3 py-2 text-sm"
            rows={3}
            placeholder="Description"
            value={reportForm.description}
            onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
          />
          <button
            type="submit"
            className="w-full bg-[var(--gov-primary)] text-white py-2 rounded font-medium hover:bg-[var(--gov-primary-mid)]"
          >
            Submit Report
          </button>
        </form>
      </Modal>
    </div>
  );
};