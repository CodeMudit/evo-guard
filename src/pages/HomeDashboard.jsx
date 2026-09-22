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
      {/* Title bar */}
      <div className="bg-[var(--gov-navy)] text-white px-3 py-1.5 flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-[14px] font-bold tracking-wide">
          {t("disasterMonitoringDashboard")}
        </h2>
        <div className="flex items-center gap-3 text-[11.5px]">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            {t("telemetryOnline")}
          </span>
          <span className="flex items-center gap-1">
            <CloudSun className="w-3.5 h-3.5 text-sky-200" />
            {t("weatherLive")}
          </span>
          <span
            className={`px-2 py-0.5 font-bold text-[11px] ${
              ["HIGH", "EXTREME", "CRITICAL"].includes(riskLevel)
                ? "bg-red-600"
                : "bg-[var(--gov-orange)]"
            }`}
          >
            {t("regionalRisk")}: {riskLabel}
          </span>
        </div>
      </div>

      {/* Three-column row */}
      <div className="max-w-[1600px] mx-auto p-2 grid grid-cols-1 xl:grid-cols-12 gap-2">
        {/* Map */}
        <div
          className="xl:col-span-8 bg-white border border-[var(--gov-border)] relative"
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
          className="xl:col-span-2 bg-white border border-[var(--gov-border)] flex flex-col"
          style={{ height: "560px" }}
        >
          <div className="bg-[var(--gov-orange)] text-white px-2 py-1.5 font-bold text-[13px] flex justify-between items-center">
            <span>{t("advisories")}</span>
            <select className="bg-[#d35400] text-white text-[11px] border-0 outline-none px-1 py-0.5">
              <option>All</option>
              <option>Landslide</option>
              <option>Heavy Rain</option>
              <option>Flood</option>
            </select>
          </div>
          <div className="p-2 space-y-2 overflow-y-auto flex-1">
            {(activeAlerts.length > 0 ? activeAlerts : MOCK_ADVISORIES)
              .slice(0, 6)
              .map((a, i) => (
                <div
                  key={a.id || i}
                  onClick={() => a.id && setSelectedAlert(a)}
                  className="border border-[var(--gov-border)] p-2 cursor-pointer hover:bg-[var(--gov-page-bg)]"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="bg-[var(--gov-yellow)] text-[var(--gov-text)] text-[10px] font-bold px-1.5 py-0.5 uppercase">
                      {a.type || a.severity || "LANDSLIDE"}
                    </span>
                    <span className="text-[10px] text-[var(--gov-text-muted)]">
                      {a.timeAgo || a.timeframe?.split("–")[0]}
                    </span>
                  </div>
                  <p className="text-[12px] font-semibold text-[var(--gov-text)] leading-tight">
                    {a.title ||
                      (a.warning ? a.warning.slice(0, 80) + "…" : "Advisory")}
                  </p>
                  {a.areas && (
                    <p className="text-[11px] text-[var(--gov-text-secondary)] mt-0.5">
                      {t("affectedAreas")}: {a.areas}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Events */}
        <div
          className="xl:col-span-2 bg-white border border-[var(--gov-border)] flex flex-col"
          style={{ height: "560px" }}
        >
          <div className="bg-[var(--gov-navy)] text-white px-2 py-1.5 font-bold text-[13px]">
            {t("events")}
          </div>
          <div className="p-2 space-y-1.5 overflow-y-auto flex-1 text-[11.5px] text-[var(--gov-text)]">
            {eventFeed.length === 0 ? (
              <p className="text-center text-[var(--gov-text-muted)] py-8">
                {t("noEventsYet")}
              </p>
            ) : (
              eventFeed.map((ev, i) => (
                <div
                  key={i}
                  className="border-b border-[var(--gov-border)] pb-1.5 last:border-0"
                >
                  {ev.text}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Highlights ticker */}
      <div className="max-w-[1600px] mx-auto mt-2 bg-[var(--gov-orange)] text-white flex items-center border border-[var(--gov-border)] overflow-hidden">
        <div className="bg-[#d35400] px-3 py-1.5 font-bold text-[12px] shrink-0">
          {t("highlights")}
        </div>
        <div className="flex-1 overflow-hidden py-1.5">
          <div className="marquee-track text-[12px]">
            {[...eventFeed, ...eventFeed].map((ev, i) => (
              <span key={i} className="mx-6 whitespace-nowrap">
                {ev.text}
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="bg-[var(--gov-navy)] px-3 py-1.5 text-[11px] font-semibold shrink-0 hover:bg-[var(--gov-navy-mid)]"
        >
          {t("viewAll")}
        </button>
      </div>

      {/* Services */}
      <div className="bg-[var(--gov-navy)] text-white mt-3">
        <div className="max-w-[1600px] mx-auto px-3 py-3">
          <h3 className="text-center text-[14px] font-bold mb-3">
            {t("drrServices")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {MOCK_SERVICES.map((s) => {
              const Icon = SERVICE_ICON_MAP[s.title] || Mountain;
              const labelKey = SERVICE_LABEL_KEYS[s.title];
              return (
                <div key={s.title} className="bg-white text-[var(--gov-text)]">
                  <div className="h-20 bg-[var(--gov-page-bg)] flex items-center justify-center">
                    <Icon className="w-10 h-10 text-[var(--gov-navy)] opacity-70" />
                  </div>
                  <div className="bg-[var(--gov-orange)] text-white text-center py-1 font-bold text-[12px]">
                    {labelKey ? t(labelKey) : s.title}
                  </div>
                  <p className="text-[11px] text-center p-1.5 text-[var(--gov-text-secondary)]">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* News + Social */}
      <div className="max-w-[1600px] mx-auto p-2 grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
        <div className="bg-white border border-[var(--gov-border)]">
          <div className="bg-[var(--gov-navy)] text-white px-2 py-1.5 font-bold text-[13px]">
            {t("newsFeeds")}
          </div>
          <div className="p-2 space-y-1.5 max-h-48 overflow-y-auto text-[12px] text-[var(--gov-text)]">
            {MOCK_NEWS.map((n, i) => (
              <div
                key={i}
                className="border-b border-[var(--gov-border)] pb-1 last:border-0"
              >
                <span className="text-[10.5px] text-[var(--gov-text-muted)]">
                  {n.ts}
                </span>
                <p className="font-medium">{n.headline}</p>
                <span className="text-[10.5px] text-[var(--gov-text-secondary)]">
                  {n.source}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-[var(--gov-border)]">
          <div className="bg-[var(--gov-navy)] text-white px-2 py-1.5 font-bold text-[13px] flex justify-between items-center flex-wrap gap-1">
            <span>{t("socialUpdates")}</span>
            <div className="flex gap-1 flex-wrap">
              {["All", "Landslide", "Heavy Rain", "Flood"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSocialFilter(f)}
                  className={`text-[10px] px-1.5 py-0.5 rounded-sm ${
                    socialFilter === f ? "bg-[var(--gov-orange)]" : "bg-white/20"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="p-2 space-y-2 max-h-48 overflow-y-auto text-[12px] text-[var(--gov-text)]">
            {filteredSocial.map((p, i) => (
              <div
                key={i}
                className="border-b border-[var(--gov-border)] pb-1.5 last:border-0"
              >
                <div className="flex justify-between">
                  <span className="font-semibold text-[var(--gov-navy)]">
                    {p.handle}
                  </span>
                  <span className="text-[10.5px] text-[var(--gov-text-muted)]">
                    {p.time}
                  </span>
                </div>
                <p className="text-[var(--gov-text-secondary)] mt-0.5">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <Modal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title={t("submitFieldReport")}
      >
        <form onSubmit={handleReport} className="space-y-3">
          <div>
            <label className="text-[12px] font-semibold block mb-1 text-[var(--gov-text)]">
              {t("category")}
            </label>
            <input
              required
              value={reportForm.title}
              onChange={(e) =>
                setReportForm({ ...reportForm, title: e.target.value })
              }
              className="w-full border border-[var(--gov-border)] rounded-sm px-2.5 py-1.5 text-[13px] text-[var(--gov-text)]"
              placeholder="e.g. Slope crack observed, Road blocked..."
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[12px] font-semibold block mb-1 text-[var(--gov-text)]">
                {t("locationGps")}
              </label>
              <input
                value={reportForm.location}
                onChange={(e) =>
                  setReportForm({ ...reportForm, location: e.target.value })
                }
                className="w-full border border-[var(--gov-border)] rounded-sm px-2.5 py-1.5 text-[13px] text-[var(--gov-text)]"
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold block mb-1 text-[var(--gov-text)]">
                {t("severity")}
              </label>
              <select
                required
                value={reportForm.severity}
                onChange={(e) =>
                  setReportForm({ ...reportForm, severity: e.target.value })
                }
                className="w-full border border-[var(--gov-border)] rounded-sm px-2.5 py-1.5 text-[13px] text-[var(--gov-text)]"
              >
                <option value="">{t("selectSeverity")}</option>
                <option value="LOW">{t("LOW")}</option>
                <option value="MEDIUM">{t("MODERATE")}</option>
                <option value="HIGH">{t("HIGH")}</option>
                <option value="CRITICAL">{t("CRITICAL")}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[12px] font-semibold block mb-1 text-[var(--gov-text)]">
              {t("description")}
            </label>
            <textarea
              required
              rows={3}
              value={reportForm.description}
              onChange={(e) =>
                setReportForm({ ...reportForm, description: e.target.value })
              }
              className="w-full border border-[var(--gov-border)] rounded-sm px-2.5 py-1.5 text-[13px] text-[var(--gov-text)]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsReportOpen(false)}
              className="px-3 py-1.5 border border-[var(--gov-border)] text-[12.5px] text-[var(--gov-text)]"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-[var(--gov-green)] text-white text-[12.5px] font-semibold flex items-center gap-1.5"
            >
              <FilePlus className="w-3.5 h-3.5" /> {t("submitReport")}
            </button>
          </div>
        </form>
      </Modal>

      {selectedAlert && (
        <AlertDetailModal
          isOpen={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          alert={selectedAlert}
        />
      )}
    </div>
  );
};