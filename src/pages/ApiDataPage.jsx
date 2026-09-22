import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { ApiKeyMasker } from "../components/api/ApiKeyMasker";
import { DataFreshnessBadge } from "../components/common/DataFreshnessBadge";
import { exportToCsv } from "../utils/formatters";
import { generateHistoryData } from "../data/mockHistory";
import { Download, CheckCircle2, Database, Key } from "lucide-react";

export const ApiDataPage = () => {
  const { apiData, addToast } = useApp();
  const [timeframe, setTimeframe] = useState("24h");

  const handleExportCsv = () => {
    const { apiHistory } = generateHistoryData(timeframe);
    exportToCsv(`ecowatch-api-history-${timeframe}.csv`, apiHistory);
    addToast("Export Started", `Downloaded API history data (${timeframe}) as CSV.`, "success");
  };

  return (
    <div className="bg-[var(--gov-page-bg)]">
      <div className="bg-[var(--gov-navy)] text-white px-3 py-1.5 flex items-center justify-between">
        <h2 className="text-[14px] font-bold">GeoWeb Products — External Data Sources</h2>
        <button
          onClick={handleExportCsv}
          className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-[11.5px] font-semibold flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" /> EXPORT CSV
        </button>
      </div>

      <div className="max-w-[1600px] mx-auto p-3 space-y-3">
        {/* Status cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { label: "Connection Status", value: "200 OK — Connected", sub: `LATENCY: ${apiData?.latency || "—"}`, color: "text-emerald-700" },
            { label: "API Provider", value: apiData?.provider || "—", sub: "REST API v2 Endpoint", color: "text-[var(--gov-text)]" },
            { label: "Requests Today", value: `${apiData?.requestsToday || 0} reqs`, sub: "0 Errors (100% Reliability)", color: "text-[var(--gov-text)]" },
            { label: "Data Freshness", value: apiData?.dataFreshness || "—", sub: null, color: "text-[var(--gov-navy)]" },
          ].map((card) => (
            <div key={card.label} className="bg-white border border-[var(--gov-border)]">
              <div className="bg-[var(--gov-navy)] text-white px-2 py-1 text-[11px] font-bold uppercase">{card.label}</div>
              <div className="p-2.5">
                <p className={`text-[14px] font-bold ${card.color}`}>{card.value}</p>
                {card.sub && <p className="text-[11px] text-[var(--gov-text-muted)] mt-0.5">{card.sub}</p>}
                {card.label === "Data Freshness" && (
                  <div className="mt-1">
                    <DataFreshnessBadge status="LIVE" timestamp={apiData?.lastUpdate} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Credentials */}
        <div className="bg-white border border-[var(--gov-border)]">
          <div className="bg-[var(--gov-navy)] text-white px-2 py-1.5 font-bold text-[13px] flex items-center gap-2">
            <Key className="w-4 h-4" /> API Credential & Endpoint Configuration
          </div>
          <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px]">
            <ApiKeyMasker apiKey={apiData?.apiKeyMasked} />
            <div className="border border-[var(--gov-border)] p-2 font-mono flex items-center justify-between">
              <span className="text-[var(--gov-text-muted)] text-[10px] font-bold">ENDPOINT:</span>
              <span className="text-[var(--gov-text)] text-[11px] truncate font-bold">{apiData?.apiEndpoint || "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};