import React, { useState, useEffect } from "react";
import { riskService } from "../../services/data/riskService";
import { 
  X, AlertTriangle, TrendingUp, HelpCircle, Users, Activity, 
  MapPin, CheckSquare, Clock, Database, Route
} from "lucide-react";
import { EvidenceAgreement } from "../ml/EvidenceAgreement";

export const LocationIntelligenceDrawer = ({ locationId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const intelligence = await riskService.getLocationIntelligence(locationId);
        setData(intelligence);
      } catch (err) {
        console.error("Failed to load location intelligence", err);
      } finally {
        setLoading(false);
      }
    };
    if (locationId) fetchData();
  }, [locationId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col p-6 items-center justify-center text-[var(--color-text-muted)] space-y-4">
        <Activity className="w-8 h-8 animate-pulse" />
        <span className="text-sm">Compiling Location Intelligence...</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col h-full bg-[var(--color-page-bg)] overflow-hidden">
      
      {/* HEADER */}
      <div className="flex items-start justify-between p-4 bg-[var(--color-surface-primary)] border-b border-[var(--color-border)] shrink-0">
        <div>
          <h2 className="text-base font-bold text-[var(--color-text-primary)]">{data.location.name}</h2>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] mt-1 uppercase tracking-wider">
            <MapPin className="w-3 h-3" />
            {data.location.district}, {data.location.state}
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-100 text-[var(--color-text-secondary)]">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-5">
          
          {/* 1. CURRENT RISK */}
          <section className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded shadow-sm p-4 relative overflow-hidden">
             {data.risk.source === 'simulation' && (
               <div className="absolute top-0 right-0 bg-[var(--color-status-watch)] text-[10px] font-bold text-white px-2 py-0.5 rounded-bl uppercase">System Data</div>
             )}
             <div className="flex justify-between items-end mb-4">
                <div>
                   <h3 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Landslide Risk</h3>
                   <div className="text-3xl font-bold text-[var(--color-status-high)] flex items-center gap-2">
                     {data.risk.current}% 
                     {data.risk.trend === 'rising' && <TrendingUp className="w-5 h-5" />}
                   </div>
                </div>
                <div className="text-right">
                   <div className="text-[10px] text-[var(--color-text-muted)] uppercase">Next 24h</div>
                   <div className="text-sm font-bold text-[var(--color-text-primary)]">{data.risk.risk_24h}%</div>
                </div>
             </div>
             <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-status-high)]" style={{ width: `${data.risk.current}%` }} />
             </div>
          </section>

          {/* 2. RISK TRAJECTORY */}
          <section>
             <h3 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
               <Activity className="w-3.5 h-3.5" /> Risk Trajectory
             </h3>
             <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded shadow-sm flex items-center justify-between p-3">
                {data.trajectory.historical.map((point, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="text-[10px] text-[var(--color-text-muted)]">{point.label}</span>
                    <span className={`text-sm font-bold ${point.label === 'Now' ? 'text-[var(--color-status-high)]' : 'text-[var(--color-text-primary)]'}`}>
                      {point.risk}%
                    </span>
                  </div>
                ))}
             </div>
          </section>

          {/* 3. WHY */}
          <section>
             <h3 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
               <HelpCircle className="w-3.5 h-3.5" /> Why is this location at risk?
             </h3>
             <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded shadow-sm p-3 space-y-2">
                {data.drivers.map((driver, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                     <span className="text-[var(--color-text-secondary)]">{driver.label}</span>
                     <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-[var(--color-status-info)]" style={{ width: `${driver.contribution}%` }} />
                        </div>
                        <span className="text-[10px] font-medium text-[var(--color-text-primary)] w-6 text-right">+{driver.contribution}%</span>
                     </div>
                  </div>
                ))}
                {data.risk.status === 'model_not_deployed' && (
                  <div className="mt-3 pt-3 border-t border-[var(--color-border)] text-[10px] text-[var(--color-text-muted)] italic text-center">
                    Awaiting Sensor Deployment
                  </div>
                )}
             </div>
          </section>

          {/* 4 & 5. IMPACT & ISOLATION RISK */}
          <div className="grid grid-cols-2 gap-3">
             <section className="bg-[var(--color-surface-primary)] border border-[var(--color-status-high)]/30 rounded shadow-sm p-3 relative">
                <h3 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Impact</h3>
                <div className="space-y-2 text-xs">
                   <div className="flex justify-between border-b border-slate-50 pb-1">
                     <span className="text-[var(--color-text-secondary)]">Exposed Road</span>
                     <span className="font-bold">{data.impact.roads_km} km</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-50 pb-1">
                     <span className="text-[var(--color-text-secondary)]">Villages</span>
                     <span className="font-bold">{data.impact.villages}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-[var(--color-text-secondary)]">Population</span>
                     <span className="font-bold">{data.impact.population_exposed}</span>
                   </div>
                </div>
             </section>

             <section className="bg-red-50 border border-red-200 rounded shadow-sm p-3 flex flex-col justify-center text-center">
                <Route className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <div className="text-[10px] font-bold text-red-600/70 uppercase tracking-wider mb-0.5">Isolation Risk</div>
                <div className="text-lg font-black text-red-600">{data.isolation.severity}</div>
                <div className="text-[9px] text-red-800/80 mt-1 leading-tight">{data.isolation.reason}</div>
             </section>
          </div>

          {/* 6. RECOMMENDED ACTION */}
          <section>
             <h3 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
               <CheckSquare className="w-3.5 h-3.5" /> Recommended Response
             </h3>
             <div className="space-y-2">
                {data.recommended_actions.map(action => (
                   <div key={action.id} className="bg-white border border-[var(--color-border)] rounded shadow-sm p-3 border-l-2 border-l-[var(--color-status-elevated)]">
                      <div className="font-bold text-sm text-[var(--color-text-primary)]">{action.title}</div>
                      <div className="text-xs text-[var(--color-text-secondary)] mt-1">{action.reason}</div>
                   </div>
                ))}
             </div>
          </section>

          {/* 7. EVIDENCE TIMELINE & AGREEMENT */}
          <section>
             <h3 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
               <Clock className="w-3.5 h-3.5" /> Evidence Fusion
             </h3>
             <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded shadow-sm p-3">
                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                   {data.evidence.map((ev, idx) => (
                      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                         <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-slate-300 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                         </div>
                         <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-slate-50 p-2 rounded border border-[var(--color-border)] shadow-sm">
                            <div className="flex items-center justify-between">
                               <span className="text-[11px] font-bold text-[var(--color-text-primary)]">{ev.event}</span>
                               <span className="text-[9px] text-[var(--color-text-muted)]">{ev.time}</span>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
             
             {/* Dynamic Evidence Agreement Component */}
             <EvidenceAgreement data={{ 
                 rainfall: { rain24h: { value: data.drivers.find(d => d.label.includes('Rain'))?.contribution * 2 || 0 } }, 
                 soil: { moisture: { value: data.drivers.find(d => d.label.includes('Soil'))?.contribution * 3 || 0 } },
                 susceptibility: { level: 'HIGH' } // Mocking for demo data wrapper
             }} />
          </section>

          {/* 8. DATA FRESHNESS */}
          <section className="pb-6">
             <h3 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
               <Database className="w-3.5 h-3.5" /> Source Data Quality
             </h3>
             <div className="grid grid-cols-2 gap-2 text-[10px]">
                {Object.entries(data.data_freshness).map(([key, info]) => (
                   <div key={key} className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded p-2 flex justify-between items-center">
                      <span className="capitalize text-[var(--color-text-secondary)]">{key}</span>
                      <span className={`font-medium ${info.status === 'fresh' ? 'text-[var(--color-status-stable)]' : 'text-[var(--color-text-muted)]'}`}>
                         {info.text}
                      </span>
                   </div>
                ))}
             </div>
          </section>

        </div>
      </div>
    </div>
  );
};
