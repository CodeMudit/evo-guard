import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import { riskService } from "../../services/data/riskService";
import {
  Menu,
  Activity,
  Database,
  BrainCircuit,
  Search,
  Bell,
  RefreshCw,
  Sun,
  Moon,
  Globe,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { AboutModal } from "./AboutModal";

export const TopHeader = ({ onMobileMenuToggle }) => {
  const {
    alerts,
    lastRefreshedAt,
    refreshAllData,
    theme,
    setTheme,
    fontSize,
    setFontSize,
    contrast,
    setContrast,
    setActivePage,
    addToast,
    focusOnMap
  } = useApp();

  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    // Fetch system status from API abstraction
    const fetchStatus = async () => {
      try {
        const status = await riskService.getSystemStatus();
        setSystemStatus(status);
      } catch (err) {
        console.error("Failed to fetch system status", err);
      }
    };
    fetchStatus();
  }, []);

  const activeAlerts = alerts.filter((a) => a.status === "Active");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();

    if (q.includes("hill") || q.includes("shillong")) {
      focusOnMap(25.578, 91.893, 15);
      addToast("Navigated to Map", "Focused on Shillong", "info");
    } else if (q.includes("cherrapunji")) {
      focusOnMap(25.268, 91.738, 15);
      addToast("Navigated to Map", "Focused on Cherrapunji", "info");
    } else {
      addToast("Search Result", `Searching area matching: "${searchQuery}"`, "info");
    }
  };

  return (
    <div className="flex flex-col w-full z-20 sticky top-0 shadow-sm border-b border-[var(--color-border)] bg-[var(--color-surface-primary)]">
      {/* Govt Accessibility Bar */}
      <div className="bg-slate-100 text-slate-600 px-4 py-1.5 flex justify-end items-center text-[10px] sm:text-xs gap-4 border-b border-slate-200 hidden md:flex">
         <div className="flex items-center gap-3">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px] mr-1">Text Size</span>
            <button onClick={() => setFontSize('14px')} className={`transition-colors ${fontSize === '14px' ? 'text-blue-700 font-bold' : 'hover:text-slate-900'}`}>A-</button>
            <button onClick={() => setFontSize('16px')} className={`transition-colors ${fontSize === '16px' ? 'text-blue-700 font-bold' : 'hover:text-slate-900'}`}>A</button>
            <button onClick={() => setFontSize('18px')} className={`transition-colors ${fontSize === '18px' ? 'text-blue-700 font-bold' : 'hover:text-slate-900'}`}>A+</button>
         </div>
         <div className="h-3 w-px bg-slate-300"></div>
         <button onClick={() => setContrast(c => c === 1 ? 1.25 : 1)} className={`flex items-center gap-1.5 transition-colors ${contrast > 1 ? 'text-blue-700 font-bold' : 'hover:text-slate-900 font-medium'}`}>
            <Sun className="w-3.5 h-3.5" /> High Contrast
         </button>
      </div>

      <header className="px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Mobile Menu Toggle & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-1.5 rounded hover:bg-slate-100 text-[var(--color-text-secondary)]"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="hidden lg:block">
            <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
              {t("EcoWatch NER")}
            </h2>
            <p className="text-[11px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider">
              {t("Command Center")}
            </p>
          </div>
        </div>

        {/* Operational Status Modules & Global Tools */}
        <div className="flex flex-wrap items-center justify-end flex-1 gap-2 md:gap-3 shrink-0 text-xs">
          
          {/* System State (Future ML aware) */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
            <Activity className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
            {systemStatus ? (
              <span className={`font-bold ${systemStatus.status === 'healthy' ? 'text-[var(--color-status-stable)]' : 'text-[var(--color-status-warning)]'}`}>
                {systemStatus.status === 'healthy' ? 'SYS HEALTHY' : 'SYS DEGRADED'}
              </span>
            ) : (
              <span className="text-[var(--color-text-muted)]">Connecting...</span>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
            <BrainCircuit className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
            <span className="font-bold text-[var(--color-text-muted)] bg-slate-200 px-1.5 rounded text-[9px] uppercase">
              {systemStatus?.last_model_update || "MODEL NOT DEPLOYED"}
            </span>
          </div>

          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded bg-[var(--color-surface-secondary)] border border-[var(--color-border)] mr-2">
            <Database className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
            {systemStatus ? (
              <span className="text-[var(--color-text-secondary)]">
                {Object.values(systemStatus.data_sources).filter(s => s === 'fresh').length}/{Object.keys(systemStatus.data_sources).length} FEEDS
              </span>
            ) : (
              <span className="text-[var(--color-text-muted)]">...</span>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative hidden lg:block w-48">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] focus:border-blue-500 rounded px-3 py-1.5 pl-8 text-xs text-[var(--color-text-primary)] outline-none transition-all"
            />
            <Search className="w-3.5 h-3.5 text-[var(--color-text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
          </form>

          {/* Global Refresh Button */}
          <button
            onClick={() => refreshAllData(false)}
            className="p-1.5 rounded bg-[var(--color-surface-secondary)] hover:bg-slate-100 text-[var(--color-text-secondary)] hover:text-blue-600 border border-[var(--color-border)] transition-all flex items-center gap-1.5 text-xs font-medium"
            title="Refresh System Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 rounded bg-[var(--color-surface-secondary)] hover:bg-slate-100 text-[var(--color-text-secondary)] border border-[var(--color-border)] transition-colors"
            >
              <Bell className="w-4 h-4" />
              {activeAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-bounce shadow">
                  {activeAlerts.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Modal */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-[var(--color-border)] rounded shadow-xl z-50 overflow-hidden">
                <div className="p-2.5 bg-slate-50 border-b border-[var(--color-border)] flex justify-between items-center">
                  <span className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Active Alerts</span>
                  <button
                    onClick={() => {
                      setActivePage("alerts");
                      setShowNotifications(false);
                    }}
                    className="text-[10px] font-bold text-blue-600 hover:underline uppercase"
                  >
                    View All ({alerts.length})
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 p-1">
                  {activeAlerts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[var(--color-text-muted)] flex flex-col items-center gap-1">
                      <CheckCircle2 className="w-5 h-5 text-[var(--color-status-stable)]" />
                      <span>No active alerts.</span>
                    </div>
                  ) : (
                    activeAlerts.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => {
                          focusOnMap(a.lat, a.lng, 15);
                          setShowNotifications(false);
                        }}
                        className="p-2 hover:bg-slate-50 rounded cursor-pointer transition-colors space-y-0.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-[var(--color-status-high)]" />
                            {a.title}
                          </span>
                          <span className="text-[9px] text-[var(--color-text-muted)] font-medium">{a.timeAgo}</span>
                        </div>
                        <p className="text-[10px] text-[var(--color-text-secondary)] line-clamp-1">{a.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mode Indicator & Sync Info */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[var(--color-border)]">
            <span className="text-[var(--color-text-muted)] font-mono text-[9px] uppercase tracking-wider">
              Sync: {lastRefreshedAt}
            </span>
          </div>

        </div>
      </header>
      
      <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />
    </div>
  );
};
