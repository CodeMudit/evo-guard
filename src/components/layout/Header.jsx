import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import { NER_LANGUAGES } from "../../i18n";
import {
  Home,
  Info,
  LayoutDashboard,
  Layers,
  FileText,
  FolderOpen,
  Phone,
  Smartphone,
  Archive,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { AboutModal } from "./AboutModal";

export const Header = () => {
  const { activePage, setActivePage, alerts } = useApp();
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const activeCount = (alerts || []).filter((a) => a.status === "Active").length;

  const navItems = [
    { id: "overview", labelKey: "nav_home", icon: Home },
    { id: "about", labelKey: "nav_about", icon: Info },
    { id: "risk-map", labelKey: "nav_dashboard", icon: LayoutDashboard },
    { id: "sources", labelKey: "nav_geoweb", icon: Layers },
    { id: "field-ops", labelKey: "nav_reports", icon: FileText },
    { id: "analytics", labelKey: "nav_resources", icon: FolderOpen },
    { id: "contact", labelKey: "nav_contact", icon: Phone },
    { id: "field-app", labelKey: "nav_fieldApp", icon: Smartphone },
    { id: "archive", labelKey: "nav_archive", icon: Archive },
  ];

  const handleNav = (id) => {
    if (id === "about") {
      setShowAbout(true);
    } else {
      setActivePage(id);
    }
    setMobileOpen(false);
  };

  return (
    <>
      {/* Utility bar */}
      <div className="bg-[var(--gov-sky)] text-[var(--gov-text)] text-[12px] px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--gov-border)]">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-semibold tracking-wide">
            {t("appName")} · SIH26001
          </span>
          <span className="opacity-50">|</span>
          <a href="#main" className="hover:underline text-[var(--gov-primary)]">
            Skip to main content
          </a>
          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[11px] font-semibold rounded">
            {t("prototypeBadge")}
          </span>
        </div>
        <select
          value={i18n.language?.startsWith("en") ? "en" : i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          className="bg-white border border-[var(--gov-border)] text-[12px] rounded px-2 py-1 outline-none text-[var(--gov-text)] max-w-[160px] focus:ring-1 focus:ring-[var(--gov-primary)]"
          aria-label="Language"
        >
          {NER_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.native}
            </option>
          ))}
        </select>
      </div>

      {/* Brand header – full bleed */}
      <div className="bg-white border-b border-[var(--gov-border)] px-4 py-3">
        <div className="w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-[var(--gov-primary)] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
              EG
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-[var(--gov-primary)] leading-tight tracking-tight">
                {t("appName")}
              </h1>
              <p className="text-[13px] text-[var(--gov-text-secondary)] font-medium leading-tight">
                {t("appTagline")}
              </p>
              <p className="text-[12px] text-[var(--gov-text-muted)]">
                {t("sihLabel")}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="lg:hidden p-2 rounded hover:bg-slate-100"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-[var(--gov-primary)]" />
          </button>
        </div>
      </div>

      {/* Nav – full bleed */}
      <nav className="bg-[var(--gov-nav)] text-white sticky top-0 z-40 shadow-sm">
        <div className="w-full">
          <div className="hidden lg:flex items-center justify-between px-2">
            <div className="flex items-stretch">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNav(item.id)}
                    className={`flex flex-col items-center justify-center px-3.5 py-2.5 text-[12px] font-medium border-b-[3px] transition-colors ${
                      isActive
                        ? "bg-[var(--gov-nav-hover)] border-[var(--gov-accent)]"
                        : "border-transparent hover:bg-[var(--gov-nav-hover)]"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5 mb-0.5" />
                    <span>{t(item.labelKey)}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 pr-4 text-[12px]">
              {activeCount > 0 && (
                <span className="bg-[var(--gov-danger)] px-2.5 py-1 rounded font-semibold flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" /> {activeCount} {t("activeAlerts")}
                </span>
              )}
              <span className="bg-[var(--gov-primary)] px-2.5 py-1 rounded font-medium">
                {t("systemOnline")}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl">
            <div className="bg-[var(--gov-primary)] text-white p-4 flex justify-between items-center">
              <span className="font-semibold text-sm">Menu</span>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-md text-sm transition-colors ${
                      isActive
                        ? "bg-[var(--gov-primary)] text-white font-medium"
                        : "text-[var(--gov-primary)] hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    {t(item.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
};