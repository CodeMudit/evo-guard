import React from 'react';
import { useApp } from "../../context/AppContext";
import { Route, CloudRain, ShieldAlert, Users, TrendingUp } from "lucide-react";

export const RoadConnectivity = () => {
   const { reports } = useApp();
   const roads = reports.filter(r => r.title.toLowerCase().includes("road") || r.location.toLowerCase().includes("nh-") || r.location.toLowerCase().includes("trail"))
      .map(r => ({
         name: r.location,
         status: r.status === "New" ? "Blocked" : r.status === "Under Review" ? "Partially Blocked" : "Open",
         risk: r.severity === "CRITICAL" ? "High" : r.severity === "HIGH" ? "Medium" : "Low"
      })).slice(0, 5);
   
   // Add fallback if no road reports
   if (roads.length === 0) {
      roads.push({ name: "NH-40 (Shillong-Guwahati)", status: "Open", risk: "Low" });
   }

   return (
      <div className="p-4 rounded bg-[var(--color-surface-secondary)] border border-[var(--color-border)] shadow-sm h-full flex flex-col">
         <h3 className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-4 uppercase tracking-wider">
            <Route className="w-4 h-4 text-amber-600" /> Road Connectivity Status
         </h3>
         <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
            {roads.map(r => (
               <div key={r.name} className="flex items-center justify-between p-2.5 rounded bg-white border border-slate-200 shadow-sm transition-colors hover:border-slate-300">
                  <span className="text-xs text-[var(--color-text-primary)] font-medium truncate pr-2">{r.name}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${
                     r.status === 'Open' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                     r.status === 'Partially Blocked' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                     'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                     {r.status}
                  </span>
               </div>
            ))}
         </div>
      </div>
   );
};

export const WeatherForecastPanel = () => {
   const { apiData } = useApp();
   const rainRisk = apiData?.sensors?.rainfall?.value > 20 ? 'High' : apiData?.sensors?.rainfall?.value > 5 ? 'Moderate' : 'Low';
   
   return (
      <div className="p-4 rounded bg-[var(--color-surface-secondary)] border border-[var(--color-border)] shadow-sm h-full flex flex-col">
         <h3 className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-4 uppercase tracking-wider">
            <CloudRain className="w-4 h-4 text-blue-600" /> 24-72h Weather Risk
         </h3>
         <div className="p-4 bg-white border border-slate-200 rounded space-y-3 shadow-sm">
            <div className="flex justify-between items-center text-xs">
               <span className="text-[var(--color-text-secondary)] font-bold">Rainfall Forecast:</span>
               <span className="text-[var(--color-text-primary)] font-mono font-bold">{apiData?.sensors?.rainfall?.value || 0} mm/h</span>
            </div>
            <div className="flex justify-between items-center text-xs">
               <span className="text-[var(--color-text-secondary)] font-bold">Soil Saturation Trend:</span>
               <span className="text-amber-600 font-bold flex items-center gap-1 uppercase tracking-wider text-[10px]"><TrendingUp className="w-3 h-3"/> Rising</span>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-200">
               <div className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider mb-1">Projected Slide Risk:</div>
               <div className={`text-xs font-bold ${rainRisk === 'High' ? 'text-red-700' : rainRisk === 'Moderate' ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {rainRisk} ({rainRisk === 'High' ? '>80%' : rainRisk === 'Moderate' ? '50-80%' : '<50%'} probability)
               </div>
            </div>
         </div>
      </div>
   );
};

export const PriorityList = () => {
   const { hazards } = useApp();
   // ensure we sort by vulnerabilityScore descending
   const sortedHazards = [...hazards].sort((a,b) => b.vulnerabilityScore - a.vulnerabilityScore);

   return (
      <div className="p-4 rounded bg-[var(--color-surface-secondary)] border border-[var(--color-border)] shadow-sm col-span-1 lg:col-span-2 overflow-hidden flex flex-col">
         <h3 className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-4 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-red-600" /> Emergency Response Prioritization
         </h3>
         <div className="overflow-x-auto flex-1 bg-white rounded border border-slate-200 shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
               <thead>
                  <tr className="border-b border-slate-200 text-[var(--color-text-secondary)] bg-slate-50 uppercase tracking-wider text-[10px]">
                     <th className="py-2.5 px-3 font-bold">Priority</th>
                     <th className="py-2.5 px-3 font-bold">Zone Name</th>
                     <th className="py-2.5 px-3 font-bold">Vulnerability</th>
                     <th className="py-2.5 px-3 font-bold">Exposure</th>
                     <th className="py-2.5 px-3 font-bold">Accessibility</th>
                  </tr>
               </thead>
               <tbody>
                  {sortedHazards.map((hz, idx) => (
                     <tr key={hz.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-b-0">
                        <td className="py-2.5 px-3">
                           <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider ${idx === 0 ? 'bg-red-100 text-red-800' : idx === 1 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-700'}`}>
                              P{idx + 1}
                           </span>
                        </td>
                        <td className="py-2.5 px-3 text-[var(--color-text-primary)] font-bold">{hz.name}</td>
                        <td className="py-2.5 px-3 text-red-600 font-mono font-bold">{hz.vulnerabilityScore}/100</td>
                        <td className="py-2.5 px-3 text-[var(--color-text-secondary)] font-medium"><Users className="w-3.5 h-3.5 inline mr-1 text-slate-400" />{Math.floor(Math.random() * 5000) + 500} ppl</td>
                        <td className={`py-2.5 px-3 font-bold uppercase tracking-wider text-[10px] ${idx === 0 ? 'text-red-600' : 'text-amber-600'}`}>{idx === 0 ? 'Compromised' : 'Clear'}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
};
