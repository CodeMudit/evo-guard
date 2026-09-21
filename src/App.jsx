import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Sidebar } from "./components/layout/Sidebar";
import { TopHeader } from "./components/layout/TopHeader";
import { OfflineBanner } from "./components/layout/OfflineBanner";
import { ToastContainer } from "./components/common/Toast";

// Pages
import { HomeDashboard } from "./pages/HomeDashboard"; // Overview
import { MLPredictionsPage } from "./pages/MLPredictionsPage";
import { ApiDataPage } from "./pages/ApiDataPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AlertsPage } from "./pages/AlertsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { HazardZonesPage } from "./pages/HazardZonesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { X, Globe2 } from "lucide-react";

const MainContent = () => {
  const { activePage, setActivePage } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case "overview":
        return <HomeDashboard />;
      case "risk-map":
        return <HomeDashboard viewMode="risk-map" />;
      case "watchlist":
        return <HomeDashboard viewMode="watchlist" />;
      case "impact":
        return <HazardZonesPage />;
      case "field-ops":
        return (
          <div className="space-y-8">
            <ReportsPage />
          </div>
        );
      case "alerts":
        return <AlertsPage />;
      case "response":
        // For now, combine response tools
        return (
          <div className="space-y-8">
            <div className="p-4 bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded shadow-sm">
               <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Response Command</h2>
               <p className="text-sm text-[var(--color-text-secondary)]">Manage active events and advisories.</p>
            </div>
            <AlertsPage />
          </div>
        );
      case "analytics":
        return (
          <div className="space-y-8">
            <MLPredictionsPage />
            <AnalyticsPage />
          </div>
        );
      case "sources":
        return <ApiDataPage />;
      case "settings":
        return <SettingsPage />;
      case "home":
      case "ml-predictions":
      case "api-data":
      case "reports":
      case "hazards":
        return <HomeDashboard />;
      default:
        return <HomeDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text-primary)] font-sans app-container transition-colors duration-300">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/40">
          <div className="w-64 bg-white h-full p-4 space-y-4 border-r border-slate-200 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-white font-bold">
                    <Globe2 className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-800 text-base">EcoGuard NER</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1 mt-4">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "risk-map", label: "Risk Map" },
                  { id: "watchlist", label: "Watchlist" },
                  { id: "impact", label: "Impact" },
                  { id: "field-ops", label: "Field Operations" },
                  { id: "alerts", label: "Alerts" },
                  { id: "response", label: "Response" },
                  { id: "analytics", label: "Analytics" },
                  { id: "sources", label: "Data & Sources" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActivePage(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
                      activePage === item.id 
                        ? "bg-slate-800 text-white font-bold" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <OfflineBanner />
        <TopHeader onMobileMenuToggle={() => setMobileMenuOpen(true)} />
        <main className={`flex-1 w-full mx-auto ${
          ['overview', 'risk-map', 'watchlist'].includes(activePage) ? 'p-0 flex flex-col' : 'p-4 md:p-6 lg:p-8 max-w-[1920px]'
        }`}>
          {renderPage()}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
