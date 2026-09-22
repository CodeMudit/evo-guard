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
      <div className="bg-[var(--gov-sky)] text-[var(--gov-text)] text-[11.5px] px-3 py-1 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--gov-border)]">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-semibold">
            {t("appName")} · SIH26001
          </span>
          <span className="opacity-60">|</span>
          <a href="#main" className="hover:underline">
            Skip to main content
          </a>
          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-sm">
            {t("prototypeBadge")}
          </span>
        </div>
        <select
          value={i18n.language?.startsWith("en") ? "en" : i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          className="bg-white border border-[var(--gov-border)] text-[11.5px] rounded-sm px-2 py-0.5 outline-none text-[var(--gov-text)] max-w-[150px]"
          aria-label="Language"
        >
          {NER_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.native}
            </option>
          ))}
        </select>
      </div>

      {/* Brand header */}
      <div className="bg-white border-b border-[var(--gov-border)] px-4 py-2.5">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--gov-navy)] flex items-center justify-center text-white font-bold text-sm shrink-0">
              EW
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-[var(--gov-navy)] leading-tight">
                {t("appName")}
              </h1>
              <p className="text-[12px] text-[var(--gov-text-secondary)] font-medium leading-tight">
                {t("appTagline")}
              </p>
              <p className="text-[11px] text-[var(--gov-text-muted)]">
                {t("sihLabel")}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="lg:hidden p-2"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-[var(--gov-navy)]" />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="bg-[var(--gov-blue)] text-white sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto">
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-stretch">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNav(item.id)}
                    className={`flex flex-col items-center justify-center px-3.5 py-2 text-[11px] font-medium border-b-[3px] transition-colors ${
                      isActive
                        ? "bg-[var(--gov-blue-hover)] border-[var(--gov-orange)]"
                        : "border-transparent hover:bg-[var(--gov-blue-hover)]"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5 mb-0.5" />
                    <span>{t(item.labelKey)}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 pr-3 text-[11px]">
              {activeCount > 0 && (
                <span className="bg-red-600 px-2 py-0.5 rounded-sm font-semibold flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5" /> {activeCount} {t("activeAlerts")}
                </span>
              )}
              <span className="bg-[var(--gov-navy)] px-2 py-0.5 rounded-sm">
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
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-lg">
            <div className="bg-[var(--gov-navy)] text-white p-3 flex justify-between items-center">
              <span className="font-bold text-sm">Menu</span>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNav(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-[var(--gov-navy)] hover:bg-[var(--gov-page-bg)] text-sm"
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