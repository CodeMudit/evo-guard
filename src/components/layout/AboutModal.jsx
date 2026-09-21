import React from 'react';
import { X, Info, Map, ShieldAlert, BrainCircuit, Activity } from 'lucide-react';

export const AboutModal = ({ isOpen, onClose }) => {
   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
         <div className="bg-white border border-[var(--color-border)] rounded w-full max-w-3xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-slate-50">
               <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded text-blue-700">
                     <Info className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-[var(--color-text-primary)]">About EvoGuard</h2>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded text-[var(--color-text-secondary)] transition-colors">
                  <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-[var(--color-text-primary)] font-medium leading-relaxed">
               <div className="space-y-2">
                  <h3 className="text-[var(--color-text-primary)] font-bold text-base border-b border-slate-100 pb-2">Project Context: NER-DRR Portal Extension</h3>
                  <p className="text-[var(--color-text-secondary)]">
                     EvoGuard is a system designed for disaster management in the North Eastern Region (NER).
                     It is designed to be a modern, predictive extension to NESAC's existing NER-DRR (North Eastern Space Applications Centre - Disaster Risk Reduction) geoportal.
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded bg-slate-50 border border-slate-200 space-y-2 shadow-sm">
                     <Map className="w-5 h-5 text-blue-600" />
                     <h4 className="text-[var(--color-text-primary)] font-bold">Government-Grade GIS</h4>
                     <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">Integrated with Bhuvan/ISRO satellite imagery layers and Leaflet to provide real-time situational awareness. <br/><br/><strong className="text-blue-700">Note:</strong> The Live Wind visualization overlay is interpolated from fixed point observations via Open-Meteo, not a raw satellite or model grid.</p>
                  </div>
                  <div className="p-4 rounded bg-slate-50 border border-slate-200 space-y-2 shadow-sm">
                     <BrainCircuit className="w-5 h-5 text-purple-600" />
                     <h4 className="text-[var(--color-text-primary)] font-bold">Predictive AI Engine</h4>
                     <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">Fuses live field sensor data (IoT) with Open-Meteo forecasts to compute compound risk indices for landslides and floods, exposing explainable AI triggers.</p>
                  </div>
                  <div className="p-4 rounded bg-slate-50 border border-slate-200 space-y-2 shadow-sm">
                     <Activity className="w-5 h-5 text-indigo-600" />
                     <h4 className="text-[var(--color-text-primary)] font-bold">Hardware Integration</h4>
                     <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">Designed to ingest high-resolution meteorological data, terrain susceptibility, and satellite telemetry to form operational geospatial intelligence.</p>
                  </div>
                  <div className="p-4 rounded bg-slate-50 border border-slate-200 space-y-2 shadow-sm">
                     <ShieldAlert className="w-5 h-5 text-red-600" />
                     <h4 className="text-[var(--color-text-primary)] font-bold">NOC Dashboard UI</h4>
                     <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">Built with a clean "Network Operations Center" aesthetic, utilizing tabular fonts, dense data visualization (Recharts), and offline PWA capabilities for field officials.</p>
                  </div>
               </div>
            </div>
            
            <div className="p-4 border-t border-[var(--color-border)] bg-slate-50 text-right">
               <button onClick={onClose} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold shadow-sm transition-colors uppercase tracking-wider text-xs">
                  CLOSE
               </button>
            </div>
         </div>
      </div>
   );
};
