import React from "react";
import { useApp } from "../../context/AppContext";
import { Activity } from "lucide-react";

export const EventsPanel = () => {
  const { alerts } = useApp();

  return (
    <div className="flex flex-col border border-[var(--color-border)] bg-white rounded shadow-sm overflow-hidden h-full">
      <div className="bg-slate-50 p-3 border-b border-[var(--color-border)] flex items-center justify-between">
         <div className="flex items-center gap-2">
           <div className="p-1.5 rounded bg-blue-100 text-blue-700">
             <Activity className="w-3.5 h-3.5" />
           </div>
           <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Events Bulletin</h3>
         </div>
         <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-50 border border-red-100">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-[9px] text-red-700 font-bold tracking-widest uppercase">Live</span>
         </div>
      </div>
      <div className="overflow-y-auto flex-1 p-0 custom-scrollbar max-h-96">
        {alerts.map((item, idx) => {
          const isReviewed = item.status !== "Active";
          return (
            <div key={item.id} className={`p-3 text-[10px] font-mono border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-slate-100 transition-colors`}>
               <div className="text-[var(--color-text-secondary)] leading-relaxed">
                 <span className={`px-1.5 py-0.5 rounded mr-2 uppercase tracking-wider text-[9px] ${isReviewed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                    {isReviewed ? "Reviewed" : "Provisional"}
                 </span>
                 <span className="text-[var(--color-text-muted)] font-bold">TYPE:</span> <span className="text-[var(--color-text-primary)] font-bold">{item.title}</span>,
                 <span className="text-[var(--color-text-muted)] font-bold ml-1">VAL:</span> <span className="text-blue-700 font-bold">{item.sensorValue}</span>,
                 <span className="text-[var(--color-text-muted)] font-bold ml-1">LOC:</span> <span className="text-[var(--color-text-primary)] font-bold">{item.location}</span>,
                 <span className="text-[var(--color-text-muted)] font-bold ml-1">TIME:</span> <span className="text-[var(--color-text-primary)]">{new Date(item.timestamp).toLocaleString()}</span>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
