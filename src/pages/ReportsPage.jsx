import React, { useState, useEffect } from "react";
import localforage from "localforage";
import imageCompression from "browser-image-compression";
import { useApp } from "../context/AppContext";
import { exportToCsv } from "../utils/formatters";
import { FileText, Download, Printer, MapPin, Camera, UploadCloud, WifiOff, RefreshCw } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { createNodeIcon } from "../utils/leafletIcons";

const LocationMarker = ({ setForm }) => {
  const [position, setPosition] = useState(null);
  
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setForm(f => ({ ...f, coordinates: [e.latlng.lat, e.latlng.lng], location: `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}` }));
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={createNodeIcon("Selected Location", true)}></Marker>
  );
};

export const ReportsPage = () => {
  const { reports, addReportedSection, updateReportStatus, addToast, alerts } = useApp();

  const [form, setForm] = useState({
    title: "Slope Movement",
    category: "Slope Movement",
    location: "",
    coordinates: null,
    severity: "HIGH",
    reportedBy: "",
    submitterType: "Field Official",
    description: "",
    photo: null
  });

  const [isLocating, setIsLocating] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load queue
    localforage.getItem('offlineReportsQueue').then(queue => {
       if (queue) setOfflineQueue(queue);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineQueue = async () => {
      if (offlineQueue.length === 0) return;
      
      for (const rep of offlineQueue) {
         addReportedSection(rep);
      }
      
      await localforage.setItem('offlineReportsQueue', []);
      setOfflineQueue([]);
      addToast("Offline Sync Complete", `Successfully synced ${offlineQueue.length} reports.`, "success");
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
    exportToCsv("evoguard-environmental-report.csv", reportData);
    addToast("Report Generated", "Exported environmental incident summary CSV file.", "success");
  };

  const handleCaptureGPS = () => {
     setIsLocating(true);
     if ("geolocation" in navigator) {
         navigator.geolocation.getCurrentPosition((pos) => {
             setForm(f => ({ ...f, coordinates: [pos.coords.latitude, pos.coords.longitude], location: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` }));
             setIsLocating(false);
             addToast("GPS Captured", "Device location captured successfully.", "success");
         }, () => {
             setIsLocating(false);
             addToast("GPS Failed", "Could not capture device location. Please enter manually.", "error");
         });
     } else {
         setIsLocating(false);
     }
  };

  const handlePhotoUpload = async (e) => {
      const file = e.target.files[0];
      if (file) {
          try {
              let compressedFile = file;
              // Only compress if it's an image
              if (file.type.startsWith('image/')) {
                  const options = {
                      maxSizeMB: 1,
                      maxWidthOrHeight: 1280,
                      useWebWorker: true
                  };
                  compressedFile = await imageCompression(file, options);
              }
              
              const reader = new FileReader();
              reader.onloadend = () => {
                  setForm(f => ({ ...f, photo: reader.result }));
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
     const reportPayload = {
        title: form.title,
        category: form.category,
        location: form.location,
        coordinates: form.coordinates,
        severity: form.severity,
        reportedBy: form.reportedBy || form.submitterType,
        description: form.description,
        photo: form.photo,
        id: Date.now().toString()
     };

     if (!isOnline) {
         const newQueue = [...offlineQueue, reportPayload];
         await localforage.setItem('offlineReportsQueue', newQueue);
         setOfflineQueue(newQueue);
         addToast("Saved Offline", "You are offline. Report queued for sync.", "warning");
     } else {
         addReportedSection(reportPayload);
         addToast("Report Submitted", "Your field report was successfully submitted.", "success");
     }

     // Reset
     setForm({ title: "Slope Movement", category: "Slope Movement", location: "", coordinates: null, severity: "HIGH", reportedBy: "", submitterType: "Field Official", description: "", photo: null });
  };

  return (
    <div className="space-y-6 pb-12 h-full flex flex-col">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface-primary)] p-5 rounded border border-[var(--color-border)] shadow-sm shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Field Incident Reporting
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium">
            Geo-tagged field submissions & verification queue
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isOnline && (
            <div className="px-3 py-2 rounded bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold flex items-center gap-2 shadow-sm">
              <WifiOff className="w-4 h-4" /> Offline Mode ({offlineQueue.length} queued)
            </div>
          )}
          <button onClick={handleExportCsv} className="px-4 py-2 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm uppercase tracking-wider">
            <Download className="w-4 h-4" /> EXPORT REPORTS (CSV)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
         {/* Form Section */}
         <div className="lg:col-span-5 p-5 rounded bg-[var(--color-surface-secondary)] border border-[var(--color-border)] shadow-sm h-fit">
            <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-4">Submit Field Report</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                 <label htmlFor="report-category" className="text-xs font-bold text-[var(--color-text-secondary)] block mb-1">CATEGORY / TITLE</label>
                 <select id="report-category" required value={form.category} onChange={e => setForm({...form, category: e.target.value, title: e.target.value})} className="w-full bg-white border border-[var(--color-border)] rounded px-3 py-2 text-xs text-[var(--color-text-primary)] font-medium outline-none focus:border-blue-500 shadow-sm">
                    <option>Slope Movement</option>
                    <option>Soil Cracks</option>
                    <option>Blocked Road</option>
                    <option>Fallen Trees</option>
                    <option>Water Surge</option>
                    <option>Other</option>
                 </select>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label htmlFor="submitter-type" className="text-xs font-bold text-[var(--color-text-secondary)] block mb-1">SUBMITTER</label>
                     <select id="submitter-type" value={form.submitterType} onChange={e => setForm({...form, submitterType: e.target.value})} className="w-full bg-white border border-[var(--color-border)] rounded px-3 py-2 text-xs text-[var(--color-text-primary)] font-medium outline-none focus:border-blue-500 shadow-sm">
                        <option>Field Official</option>
                        <option>Citizen</option>
                     </select>
                   </div>
                   <div>
                     <label htmlFor="report-severity" className="text-xs font-bold text-[var(--color-text-secondary)] block mb-1">SEVERITY</label>
                     <select id="report-severity" value={form.severity} onChange={e => setForm({...form, severity: e.target.value})} className="w-full bg-white border border-[var(--color-border)] rounded px-3 py-2 text-xs text-[var(--color-text-primary)] font-medium outline-none focus:border-blue-500 shadow-sm">
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                     </select>
                   </div>
                   <div className="col-span-2">
                     <label htmlFor="reporter-name" className="text-xs font-bold text-[var(--color-text-secondary)] block mb-1">NAME (OPTIONAL)</label>
                     <input id="reporter-name" type="text" value={form.reportedBy} onChange={e => setForm({...form, reportedBy: e.target.value})} className="w-full bg-white border border-[var(--color-border)] rounded px-3 py-2 text-xs text-[var(--color-text-primary)] font-medium outline-none focus:border-blue-500 shadow-sm" />
                   </div>
               </div>

               <div>
                  <label htmlFor="location-desc" className="text-xs font-bold text-[var(--color-text-secondary)] block mb-1">LOCATION / GPS</label>
                  <div className="flex gap-2 mb-2">
                     <input id="location-desc" type="text" required placeholder="Description or coords..." value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="flex-1 bg-white border border-[var(--color-border)] rounded px-3 py-2 text-xs text-[var(--color-text-primary)] font-medium outline-none focus:border-blue-500 shadow-sm" />
                     <button type="button" onClick={handleCaptureGPS} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-xs text-slate-700 font-bold flex items-center gap-1 shrink-0 shadow-sm transition-colors">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" /> {isLocating ? 'LOCATING...' : 'GPS'}
                     </button>
                  </div>
                  <div className="h-32 w-full rounded overflow-hidden border border-[var(--color-border)] relative z-0 shadow-sm">
                     <MapContainer center={[25.268, 91.738]} zoom={11} scrollWheelZoom={false} className="h-full w-full">
                        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                        <LocationMarker setForm={setForm} />
                     </MapContainer>
                     <div className="absolute top-1 left-1 z-[1000] bg-white/90 backdrop-blur px-2 py-1 rounded border border-slate-200 text-[10px] text-[var(--color-text-primary)] font-bold shadow-sm pointer-events-none">Click map to drop pin</div>
                  </div>
               </div>

               <div>
                 <label className="text-xs font-bold text-[var(--color-text-secondary)] block mb-1">EVIDENCE (PHOTO/VIDEO)</label>
                 <div className="flex items-center justify-center w-full">
                    <label htmlFor="media-upload" className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded cursor-pointer bg-white hover:bg-slate-50 transition-colors shadow-sm">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-6 h-6 text-[var(--color-text-muted)] mb-2" />
                            <p className="text-[10px] text-[var(--color-text-secondary)] font-medium">Click to upload file</p>
                        </div>
                        <input id="media-upload" type="file" className="hidden" accept="image/*,video/*" onChange={handlePhotoUpload} />
                    </label>
                 </div>
                 {form.photo && <div className="mt-2 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">File attached.</div>}
               </div>

               <div>
                 <label htmlFor="report-desc" className="text-xs font-bold text-[var(--color-text-secondary)] block mb-1">DESCRIPTION / NOTES</label>
                 <textarea id="report-desc" required rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-white border border-[var(--color-border)] rounded px-3 py-2 text-xs text-[var(--color-text-primary)] font-medium outline-none focus:border-blue-500 shadow-sm"></textarea>
               </div>
               
               <button type="submit" className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm uppercase tracking-wider transition-colors">
                  SUBMIT REPORT
               </button>
            </form>
         </div>

         {/* Queue Section */}
         <div className="lg:col-span-7 flex flex-col space-y-4">
            <h3 className="text-base font-bold text-[var(--color-text-primary)] px-1 border-b border-[var(--color-border)] pb-2 uppercase tracking-wider">Admin Review Queue</h3>
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
               {reports.map((rep) => (
                  <div key={rep.id} className="p-4 rounded bg-white border border-[var(--color-border)] flex flex-col sm:flex-row justify-between gap-4 shadow-sm">
                     <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                           <h4 className="font-bold text-[var(--color-text-primary)] text-sm">{rep.title}</h4>
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${rep.status === 'New' ? 'bg-blue-50 text-blue-700 border border-blue-200' : rep.status === 'Under Review' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                              {rep.status}
                           </span>
                           {rep.photo && <Camera className="w-4 h-4 text-slate-400" title="Media attached" aria-label="Media attached" />}
                        </div>
                        <p className="text-[var(--color-text-muted)] text-[10px] font-mono font-bold">LOC: {rep.location} • REPORTER: {rep.reportedBy.toUpperCase()}</p>
                        <p className="text-[var(--color-text-secondary)] text-xs mt-2 bg-slate-50 p-2.5 rounded border border-slate-200 font-medium leading-relaxed">{rep.description}</p>
                     </div>
                     <div className="flex flex-col gap-2 shrink-0">
                        {rep.status === 'New' && (
                           <button onClick={() => updateReportStatus(rep.id, 'Under Review')} className="px-3 py-1.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-colors shadow-sm">
                              MARK REVIEWING
                           </button>
                        )}
                        {(rep.status === 'New' || rep.status === 'Under Review') && (
                           <button onClick={() => updateReportStatus(rep.id, 'Resolved')} className="px-3 py-1.5 rounded bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm">
                              VERIFY & RESOLVE
                           </button>
                        )}
                     </div>
                  </div>
               ))}
               {reports.length === 0 && <div className="text-center text-[var(--color-text-secondary)] font-medium py-10 bg-slate-50 rounded border border-slate-200 border-dashed">No reports found.</div>}
            </div>
         </div>
      </div>
    </div>
  );
};
