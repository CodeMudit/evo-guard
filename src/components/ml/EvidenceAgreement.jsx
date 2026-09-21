import React from "react";
import { AlertTriangle, CheckCircle2, Info, Search } from "lucide-react";

export const EvidenceAgreement = ({ data }) => {
    if (!data) return null;

    // Confluence logic for mock evidence agreement
    const rain = parseFloat(data.rainfall?.rain24h?.value || 0);
    const soil = parseFloat(data.soil?.moisture?.value || 0);
    const susceptibility = data.susceptibility?.level || "LOW";

    let agreement = "INSUFFICIENT EVIDENCE";
    let colorClass = "bg-slate-50 border-slate-200 text-slate-700";
    let Icon = Info;

    if (rain > 50 && soil > 50 && (susceptibility === "HIGH" || susceptibility === "EXTREME")) {
        agreement = "HIGH AGREEMENT";
        colorClass = "bg-red-50 border-red-200 text-red-800";
        Icon = AlertTriangle;
    } else if ((rain > 30 || soil > 60) && (susceptibility === "MODERATE" || susceptibility === "HIGH")) {
        agreement = "MODERATE AGREEMENT";
        colorClass = "bg-amber-50 border-amber-200 text-amber-800";
        Icon = Search;
    } else if (rain > 0 || soil > 30) {
        agreement = "LOW AGREEMENT";
        colorClass = "bg-emerald-50 border-emerald-200 text-emerald-800";
        Icon = CheckCircle2;
    }

    return (
        <div className="bg-white border border-[var(--color-border)] rounded shadow-sm overflow-hidden mt-4">
            <div className="px-3 py-2 bg-[var(--color-surface-secondary)] border-b border-[var(--color-border)] flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-primary)]">Evidence Agreement</span>
                <span className="text-[9px] text-[var(--color-text-muted)] font-mono">CONFLUENCE</span>
            </div>
            <div className="p-3">
                <div className={`p-3 rounded border flex items-center gap-3 ${colorClass}`}>
                    <Icon className="w-5 h-5 shrink-0" />
                    <div>
                        <div className="text-[11px] font-black uppercase tracking-wider">{agreement}</div>
                        <div className="text-[10px] opacity-90 mt-0.5 leading-relaxed">
                            {agreement === "HIGH AGREEMENT" && "Strong correlation between heavy rainfall, saturated soil, and high terrain susceptibility."}
                            {agreement === "MODERATE AGREEMENT" && "Partial alignment of environmental triggers and terrain susceptibility."}
                            {agreement === "LOW AGREEMENT" && "Current environmental factors do not align with critical failure thresholds."}
                            {agreement === "INSUFFICIENT EVIDENCE" && "Not enough high-quality data to form a confluence model."}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
