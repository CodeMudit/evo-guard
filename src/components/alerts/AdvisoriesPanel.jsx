import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { ShieldAlert, Filter } from "lucide-react";

export const AdvisoriesPanel = () => {
  const { alerts } = useApp();
  const [filterType, setFilterType] = useState("All");

  const advisoryTypes = ["All", "Flood", "Landslide", "Lightning", "Thunderstorm", "Road Blockage"];

  // Map alert to advisory
  const advisories = alerts.map(a => {
     let type = "General";
     if (a.title.toLowerCase().includes("landslide") || a.title.toLowerCase().includes("soil")) type = "Landslide";
     else if (a.title.toLowerCase().includes("water") || a.title.toLowerCase().includes("rain") || a.title.toLowerCase().includes("flood")) type = "Flood";
     else if (a.title.toLowerCase().includes("air")) type = "Lightning";
     else if (a.title.toLowerCase().includes("block")) type = "Road Blockage";

     return { ...a, type };
  });

  const filteredAdvisories = advisories.filter(a => filterType === "All" || a.type === filterType);

  const getSeverityStyle = (severity) => {
     if (severity === "CRITICAL" || severity === "HIGH") return "bg-red-50 border-red-200";
     if (severity === "MEDIUM") return "bg-amber-50 border-amber-200";
     return "bg-yellow-50 border-yellow-200"; 
  };

  const getPillStyle = (severity) => {
     if (severity === "CRITICAL" || severity === "HIGH") return "bg-red-100 text-red-800 border-red-200";
     if (severity === "MEDIUM") return "bg-amber-100 text-amber-800 border-amber-200";
     return "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  return (
    <div className="flex flex-col border border-[var(--color-border)] bg-white rounded shadow-sm overflow-hidden h-full">
       <div className="bg-slate-50 p-3 border-b border-[var(--color-border)] flex flex-wrap gap-2 items-center justify-between">
         <div className="flex items-center gap-2">
           <div className="p-1.5 rounded bg-orange-100 text-orange-700">
             <ShieldAlert className="w-3.5 h-3.5" />
           </div>
           <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Advisories</h3>
         </div>
         <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
           <Filter className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
           <select 
             value={filterType} 
             onChange={(e) => setFilterType(e.target.value)}
             className="bg-transparent text-[var(--color-text-primary)] font-bold text-[10px] outline-none uppercase tracking-wider cursor-pointer"
           >
             {advisoryTypes.map(t => <option key={t} value={t}>{t}</option>)}
           </select>
         </div>
       </div>
       <div className="overflow-y-auto flex-1 p-3 space-y-3 custom-scrollbar max-h-96">
         {filteredAdvisories.map(adv => (
            <div key={adv.id} className={`p-4 rounded border shadow-sm ${getSeverityStyle(adv.severity)}`}>
               <div className="flex justify-between items-start mb-3 border-b border-black/5 pb-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getPillStyle(adv.severity)}`}>
                     Severity: {adv.severity === "CRITICAL" || adv.severity === "HIGH" ? "Red" : adv.severity === "MEDIUM" ? "Orange" : "Yellow"}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-secondary)] font-mono font-bold bg-white/50 px-1.5 py-0.5 rounded">{new Date(adv.timestamp).toLocaleDateString()}</span>
               </div>
               <div className="text-xs text-[var(--color-text-secondary)] mb-1.5 leading-relaxed">
                  <strong className="text-[var(--color-text-primary)]">Affected Areas:</strong> {adv.location}
               </div>
               <div className="text-xs text-[var(--color-text-secondary)] mb-3 leading-relaxed">
                  <strong className="text-[var(--color-text-primary)]">Warning:</strong> {adv.message}
               </div>
               <div className="text-[9px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider mt-2 border-t border-black/5 pt-2">
                  Issued in Public Interest — ASDMA / NESAC
               </div>
            </div>
         ))}
         {filteredAdvisories.length === 0 && (
             <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] text-center py-8">No advisories for selected category.</div>
         )}
       </div>
    </div>
  );
};
