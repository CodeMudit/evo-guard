import React, { useState, useEffect } from "react";
import localforage from "localforage";
import imageCompression from "browser-image-compression";
import { useApp } from "../context/AppContext";
import { exportToCsv } from "../utils/formatters";
import {
  FileText,
  Download,
  MapPin,
  UploadCloud,
  WifiOff,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { createNodeIcon } from "../utils/leafletIcons";

const LocationMarker = ({ setForm }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setForm((f) => ({
        ...f,
        coordinates: [e.latlng.lat, e.latlng.lng],
        location: `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`,
      }));
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={createNodeIcon("Selected Location", true)} />
  );
};

export const ReportsPage = () => {
  const { reports, addReportedSection, updateReportStatus, addToast, alerts } =
    useApp();

  const [form, setForm] = useState({
    title: "Slope Movement",
    category: "Slope Movement",
    location: "",
    coordinates: null,
    severity: "", // D3 – no default High
    reportedBy: "",
    submitterType: "Field Official",
    description: "",
    photo: null,
  });

  const [isLocating, setIsLocating] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    localforage.getItem("offlineReportsQueue").then((queue) => {
      if (queue) setOfflineQueue(queue);
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const syncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;
    for (const rep of offlineQueue) {
      addReportedSection(rep);
    }
    await localforage.setItem("offlineReportsQueue", []);
    setOfflineQueue([]);
    addToast(
      "Offline Sync Complete",
      `Successfully synced ${offlineQueue.length} reports.`,
      "success"
    );
  };

  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      syncOfflineQueue();
    }
  }, [isOnline]);

  const handleExportCsv = () => {
    const reportData = alerts.map((a) => ({
      ID: a.id,
      Title: a.title,
      Source: a.source,
      Severity: a.severity,
      Status: a.status,
      Timestamp: a.timestamp,
      SensorValue: a.sensorValue,
      MLRiskScore: a.mlRiskScore,
      Message: a.message,
    }));
    exportToCsv("ecowatch-environmental-report.csv", reportData);
    addToast(
      "Report Generated",
      "Exported environmental incident summary CSV file.",
      "success"
    );
  };

  const handleCaptureGPS = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((f) => ({
            ...f,
            coordinates: [pos.coords.latitude, pos.coords.longitude],
            location: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
          }));
          setIsLocating(false);
          addToast("GPS Captured", "Device location captured successfully.", "success");
        },
        () => {
          setIsLocating(false);
          addToast(
            "GPS Failed",
            "Could not capture device location. Please enter manually.",
            "error"
          );
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        let compressedFile = file;
        if (file.type.startsWith("image/")) {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1280,
            useWebWorker: true,
          };
          compressedFile = await imageCompression(file, options);
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setForm((f) => ({ ...f, photo: reader.result }));
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Compression error:", error);
        addToast("Upload Failed", "Failed to compress media file.", "error");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.severity) {
      addToast("Validation", "Please select a severity level.", "warning");
      return;
    }

    const reportPayload = {
      title: form.title,
      category: form.category,
      location: form.location,
      coordinates: form.coordinates,
      severity: form.severity,
      reportedBy: form.reportedBy || form.submitterType,
      description: form.description,
      photo: form.photo,
      id: Date.now().toString(),
    };

    if (!isOnline) {
      const newQueue = [...offlineQueue, reportPayload];
      await localforage.setItem("offlineReportsQueue", newQueue);
      setOfflineQueue(newQueue);
      addToast("Saved Offline", "You are offline. Report queued for sync.", "warning");
    } else {
      addReportedSection(reportPayload);
      addToast("Report Submitted", "Your field report was successfully submitted.", "success");
    }

    setForm({
      title: "Slope Movement",
      category: "Slope Movement",
      location: "",
      coordinates: null,
      severity: "",
      reportedBy: "",
      submitterType: "Field Official",
      description: "",
      photo: null,
    });
  };

  return (
    <div className="bg-[var(--gov-page-bg)]">
      {/* Navy title bar */}
      <div className="bg-[var(--gov-navy)] text-white px-3 py-1.5 flex items-center justify-between">
        <h2 className="text-[14px] font-bold flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Field Incident Reporting
        </h2>
        <div className="flex items-center gap-2">
          {!isOnline && (
            <div className="px-2 py-0.5 bg-amber-500 text-white text-[11px] font-bold flex items-center gap-1">
              <WifiOff className="w-3.5 h-3.5" /> Offline ({offlineQueue.length} queued)
            </div>
          )}
          <button
            onClick={handleExportCsv}
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" /> EXPORT CSV
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Form */}
          <div className="lg:col-span-5 bg-white border border-[var(--gov-border)]">
            <div className="bg-[var(--gov-navy)] text-white px-2 py-1.5 font-bold text-[13px]">
              Submit Field Report
            </div>
            <form onSubmit={handleSubmit} className="p-3 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[var(--gov-text)] block mb-1">
                  CATEGORY / TITLE
                </label>
                <select
                  required
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value, title: e.target.value })
                  }
                  className="w-full bg-white border border-[var(--gov-border)] rounded-sm px-2.5 py-1.5 text-[12px] text-[var(--gov-text)] outline-none"
                >
                  <option>Slope Movement</option>
                  <option>Soil Cracks</option>
                  <option>Blocked Road</option>
                  <option>Fallen Trees</option>
                  <option>Water Surge</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[var(--gov-text)] block mb-1">
                    SUBMITTER
                  </label>
                  <select
                    value={form.submitterType}
                    onChange={(e) => setForm({ ...form, submitterType: e.target.value })}
                    className="w-full bg-white border border-[var(--gov-border)] rounded-sm px-2.5 py-1.5 text-[12px] text-[var(--gov-text)] outline-none"
                  >
                    <option>Field Official</option>
                    <option>Citizen</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--gov-text)] block mb-1">
                    SEVERITY
                  </label>
                  <select
                    required
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                    className="w-full bg-white border border-[var(--gov-border)] rounded-sm px-2.5 py-1.5 text-[12px] text-[var(--gov-text)] outline-none"
                  >
                    <option value="">Select severity</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--gov-text)] block mb-1">
                  NAME (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={form.reportedBy}
                  onChange={(e) => setForm({ ...form, reportedBy: e.target.value })}
                  className="w-full bg-white border border-[var(--gov-border)] rounded-sm px-2.5 py-1.5 text-[12px] text-[var(--gov-text)] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--gov-text)] block mb-1">
                  LOCATION / GPS
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    required
                    placeholder="Description or coords..."
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="flex-1 bg-white border border-[var(--gov-border)] rounded-sm px-2.5 py-1.5 text-[12px] text-[var(--gov-text)] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCaptureGPS}
                    className="px-2.5 py-1.5 bg-[var(--gov-page-bg)] border border-[var(--gov-border)] text-[11px] text-[var(--gov-text)] font-bold flex items-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {isLocating ? "…" : "GPS"}
                  </button>
                </div>

                {/* Compact map – tooltip moved to top-center (D2) */}
                <div className="h-36 w-full border border-[var(--gov-border)] relative z-0">
                  <MapContainer
                    center={[25.268, 91.738]}
                    zoom={11}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                  >
                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                    <LocationMarker setForm={setForm} />
                  </MapContainer>
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-[1000] bg-white border border-[var(--gov-border)] px-2 py-0.5 text-[10px] text-[var(--gov-text)] font-bold shadow-sm pointer-events-none">
                    Click map to drop pin
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--gov-text)] block mb-1">
                  EVIDENCE (PHOTO/VIDEO)
                </label>
                <label
                  htmlFor="media-upload"
                  className="flex flex-col items-center justify-center w-full h-20 border border-dashed border-[var(--gov-border)] cursor-pointer bg-[var(--gov-page-bg)] hover:bg-white"
                >
                  <UploadCloud className="w-5 h-5 text-[var(--gov-text-muted)] mb-1" />
                  <p className="text-[10px] text-[var(--gov-text-secondary)]">Click to upload</p>
                  <input
                    id="media-upload"
                    type="file"
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={handlePhotoUpload}
                  />
                </label>
                {form.photo && (
                  <div className="mt-1 text-[10px] text-emerald-700 font-bold">File attached.</div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--gov-text)] block mb-1">
                  DESCRIPTION
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-white border border-[var(--gov-border)] rounded-sm px-2.5 py-1.5 text-[12px] text-[var(--gov-text)] outline-none"
                  placeholder="Describe observations, affected road lanes, structural stress..."
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[var(--gov-green)] text-white text-[12px] font-semibold"
                >
                  SUBMIT REPORT
                </button>
              </div>
            </form>
          </div>

          {/* Admin Review Queue */}
          <div className="lg:col-span-7 bg-white border border-[var(--gov-border)] flex flex-col">
            <div className="bg-[var(--gov-navy)] text-white px-2 py-1.5 font-bold text-[13px]">
              Admin Review Queue
            </div>
            <div className="p-2 space-y-2 overflow-y-auto flex-1 max-h-[640px]">
              {reports.length === 0 ? (
                <p className="text-center text-[12px] text-[var(--gov-text-muted)] py-10">
                  No field reports yet.
                </p>
              ) : (
                reports.map((r) => (
                  <div
                    key={r.id}
                    className="border border-[var(--gov-border)] p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 uppercase ${
                            r.status === "New" || !r.status
                              ? "bg-blue-100 text-blue-800"
                              : r.status === "Under Review"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {r.status || "NEW"}
                        </span>
                        <span className="text-[10px] text-[var(--gov-text-muted)]">
                          {r.timeAgo || "Just now"}
                        </span>
                      </div>
                      <h4 className="font-bold text-[13px] text-[var(--gov-text)]">{r.title}</h4>
                      <p className="text-[11px] text-[var(--gov-text-secondary)]">
                        {r.location} · {r.reportedBy}
                      </p>
                      <p className="text-[11px] text-[var(--gov-text-secondary)] mt-0.5 line-clamp-2">
                        {r.description}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {r.status !== "Under Review" && r.status !== "Resolved" && (
                        <button
                          onClick={() => updateReportStatus(r.id, "Under Review")}
                          className="px-2 py-1 text-[10px] font-bold border border-[var(--gov-border)] text-[var(--gov-text)] hover:bg-[var(--gov-page-bg)]"
                        >
                          Review
                        </button>
                      )}
                      {r.status !== "Resolved" && (
                        <button
                          onClick={() => updateReportStatus(r.id, "Resolved")}
                          className="px-2 py-1 text-[10px] font-bold bg-emerald-600 text-white"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};