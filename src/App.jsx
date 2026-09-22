import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { OfflineBanner } from "./components/layout/OfflineBanner";
import { ToastContainer } from "./components/common/Toast";

import { HomeDashboard } from "./pages/HomeDashboard";
import { MLPredictionsPage } from "./pages/MLPredictionsPage";
import { ApiDataPage } from "./pages/ApiDataPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AlertsPage } from "./pages/AlertsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { HazardZonesPage } from "./pages/HazardZonesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ContactPage } from "./pages/ContactPage";
import { FieldAppPage } from "./pages/FieldAppPage";
import { ArchivePage } from "./pages/ArchivePage";

const MainContent = () => {
  const { activePage } = useApp();

  const renderPage = () => {
    switch (activePage) {
      case "overview":
      case "risk-map":
        return <HomeDashboard />;
      case "watchlist":
        return <HomeDashboard viewMode="watchlist" />;
      case "impact":
        return <HazardZonesPage />;
      case "sources":
        return <ApiDataPage />;
      case "field-ops":
        return <ReportsPage />;
      case "analytics":
        return (
          <div className="max-w-[1600px] mx-auto p-3 space-y-4">
            <MLPredictionsPage />
            <AnalyticsPage />
          </div>
        );
      case "alerts":
        return <AlertsPage />;
      case "contact":
        return <ContactPage />;
      case "field-app":
        return <FieldAppPage />;
      case "archive":
        return <ArchivePage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <HomeDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--gov-page-bg)] flex flex-col">
      <Header />
      <OfflineBanner />
      <main id="main" className="flex-1 w-full">
        {renderPage()}
      </main>
      <Footer />
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