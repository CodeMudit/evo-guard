import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { ApiKeyMasker } from "../components/api/ApiKeyMasker";
import { DataFreshnessBadge } from "../components/common/DataFreshnessBadge";
import { exportToCsv } from "../utils/formatters";
import { generateHistoryData } from "../data/mockHistory";
import { CloudSun, Key, Download, CheckCircle2, Database } from "lucide-react";

export const ApiDataPage = () => {
  const { apiData, addToast } = useApp();
  const [timeframe, setTimeframe] = useState("24h");

  const handleExportCsv = () => {
    const { apiHistory } = generateHistoryData(timeframe);
    exportToCsv(`evoguard-api-history-${timeframe}.csv`, apiHistory);
    addToast("Export Started", `Downloaded API history data (${timeframe}) as CSV.`, "success");
  };

  return (
    <div className="space-y-6 pb-12 h-full flex flex-col">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface-primary)] p-5 rounded border border-[var(--color-border)] shadow-sm shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-purple-600" />
            External Data Sources
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium">
            Region-Wide Weather & Environmental API Feeds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm uppercase tracking-wider"
          >
            <Download className="w-4 h-4" />
            EXPORT DATA (CSV)
          </button>
        </div>
      </div>

      {/* API Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded bg-white border border-[var(--color-border)] space-y-1 shadow-sm">
          <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase block">Connection Status</span>
          <span className="text-base font-bold text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-4.5 h-4.5" /> 200 OK — Connected
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)] font-mono block font-bold">LATENCY: {apiData.latency}</span>
        </div>

        <div className="p-4 rounded bg-white border border-[var(--color-border)] space-y-1 shadow-sm">
          <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase block">API Provider</span>
          <span className="text-base font-bold text-[var(--color-text-primary)] block truncate">{apiData.provider}</span>
          <span className="text-[10px] text-purple-600 block font-bold uppercase tracking-wider">Rest API v2 Endpoint</span>
        </div>

        <div className="p-4 rounded bg-white border border-[var(--color-border)] space-y-1 shadow-sm">
          <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase block">Requests Today</span>
          <span className="text-base font-bold text-[var(--color-text-primary)] font-mono">{apiData.requestsToday} reqs</span>
          <span className="text-[10px] text-emerald-600 block font-bold uppercase tracking-wider">0 Errors (100% Reliability)</span>
        </div>

        <div className="p-4 rounded bg-white border border-[var(--color-border)] space-y-1 shadow-sm">
          <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase block">Data Freshness</span>
          <span className="text-base font-bold text-purple-600 mb-1">{apiData.dataFreshness}</span>
          <DataFreshnessBadge status="LIVE" timestamp={apiData.lastUpdate} />
        </div>
      </div>

      {/* API Key & Endpoint Security Card */}
      <div className="p-5 rounded bg-slate-50 border border-slate-200 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] tracking-tight flex items-center gap-2 uppercase">
          <Key className="w-4 h-4 text-purple-600" />
          API Credential & Endpoint Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <ApiKeyMasker apiKey={apiData.apiKeyMasked} />
          <div className="p-2.5 rounded bg-white border border-slate-200 font-mono text-[var(--color-text-primary)] flex items-center justify-between shadow-sm">
            <span className="text-[var(--color-text-muted)] text-[10px] font-bold">ENDPOINT:</span>
            <span className="text-slate-600 text-[11px] truncate font-bold">{apiData.apiEndpoint}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
