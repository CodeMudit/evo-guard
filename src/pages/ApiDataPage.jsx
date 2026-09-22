import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { ApiKeyMasker } from "../components/api/ApiKeyMasker";
import { DataFreshnessBadge } from "../components/common/DataFreshnessBadge";
import { exportToCsv } from "../utils/formatters";
import { generateHistoryData } from "../data/mockHistory";
import { Download, Key } from "lucide-react";

export const ApiDataPage = () => {
  const { apiData, addToast } = useApp();
  const [timeframe, setTimeframe] = useState("24h");

  const handleExportCsv = () => {
    const { apiHistory } = generateHistoryData(timeframe);
    exportToCsv(`evoguard-api-history-${timeframe}.csv`, apiHistory);
    addToast("Export Started", `Downloaded API history data (${timeframe}) as CSV.`, "success");
  };

  return (
    <div className="bg-transparent relative z-10">
      <div className="bg-[var(--gov-primary)] text-white px-4 py-2 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold tracking-wide">
          Spatial Layers — External Data Sources
        </h2>
        <button
          onClick={handleExportCsv}
          className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-[12px] font-medium flex items-center gap-1.5 rounded transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      <div className="w-full px-3 md:px-4 lg:px-5 py-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Connection Status", value: "200 OK — Connected", sub: `LATENCY: ${apiData?.latency || "—"}`, color: "text-emerald-700" },
            { label: "API Provider", value: apiData?.provider || "—", sub: "REST API v2 Endpoint", color: "text-[var(--gov-text)]" },
            { label: "Requests Today", value: `${apiData?.requestsToday || 0} reqs`, sub: "0 Errors (100% Reliability)", color: "text-[var(--gov-text)]" },
            { label: "Data Freshness", value: apiData?.dataFreshness || "—", sub: null, color: "text-[var(--gov-primary)]" },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white/95 backdrop-blur-sm border border-[var(--gov-border)] rounded-[var(--panel-radius)] shadow-sm overflow-hidden"
            >
              <div className="bg-[var(--gov-primary)] text-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide">
                {card.label}
              </div>
              <div className="p-3">
                <p className={`text-[14px] font-semibold ${card.color}`}>{card.value}</p>
                {card.sub && (
                  <p className="text-[12px] text-[var(--gov-text-muted)] mt-0.5">{card.sub}</p>
                )}
                {card.label === "Data Freshness" && (
                  <div className="mt-1.5">
                    <DataFreshnessBadge status="LIVE" timestamp={apiData?.lastUpdate} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/95 backdrop-blur-sm border border-[var(--gov-border)] rounded-[var(--panel-radius)] shadow-sm overflow-hidden">
          <div className="bg-[var(--gov-primary)] text-white px-3 py-2 font-semibold text-[13px] flex items-center gap-2">
            <Key className="w-4 h-4" /> API Credential & Endpoint Configuration
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px]">
            <ApiKeyMasker apiKey={apiData?.apiKeyMasked} />
            <div className="border border-[var(--gov-border)] rounded-md p-3 font-mono flex items-center justify-between bg-slate-50">
              <span className="text-[var(--gov-text-muted)] text-[11px] font-semibold">ENDPOINT:</span>
              <span className="text-[var(--gov-text)] text-[12px] truncate font-medium">
                {apiData?.apiEndpoint || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};