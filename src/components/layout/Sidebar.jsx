import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import {
  Map,
  Eye,
  Activity,
  AlertTriangle,
  ClipboardList,
  Siren,
  ShieldAlert,
  BarChart2,
  Database,
  ChevronLeft,
  ChevronRight,
  Globe2,
} from "lucide-react";

export const Sidebar = () => {
  const { activePage, setActivePage } = useApp();
  const { t, i18n } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: "overview", label: t("Overview"), icon: Activity },
    { id: "risk-map", label: t("Risk Map"), icon: Map },
    { id: "watchlist", label: t("Watchlist"), icon: Eye },
    { id: "impact", label: t("Impact"), icon: AlertTriangle },
    { id: "field-ops", label: t("Field Operations"), icon: ClipboardList },
    { id: "alerts", label: t("Alerts"), icon: Siren },
    { id: "response", label: t("Response"), icon: ShieldAlert },
    { id: "analytics", label: t("Analytics"), icon: BarChart2 },
    { id: "sources", label: t("Data & Sources"), icon: Database },
  ];

  return (
    <aside
      className={`relative flex flex-col justify-between bg-[var(--color-surface-primary)] border-r border-[var(--color-border)] transition-all duration-300 z-30 ${
        collapsed ? "w-20" : "w-64"
      } hidden md:flex min-h-screen shrink-0`}
    >
      {/* Sidebar Header */}
      <div>
        <div className="p-4 flex items-center justify-between border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Globe2 className="w-6 h-6" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <h1 className="font-bold text-base text-[var(--color-text-primary)] leading-tight tracking-tight uppercase">
                  {t("EcoGuard NER")}
                </h1>
                <p className="text-[10px] text-[var(--color-text-muted)] font-medium tracking-wide uppercase truncate">
                  {t("Operational Intelligence")}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded hover:bg-slate-100 text-[var(--color-text-secondary)] transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all duration-200 group ${
                  isActive
                    ? "bg-slate-800 text-white font-medium shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-slate-100"
                }`}
                title={collapsed ? item.label : ""}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-[var(--color-text-muted)]"}`} />
                {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer — Status Indicator */}
      <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
                <span className="text-xs text-[var(--color-text-muted)] font-bold uppercase">Language</span>
                <label htmlFor="language-select" className="sr-only">Select Language</label>
                <select 
                    id="language-select"
                    value={i18n.language} 
                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                    className="bg-white border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] font-bold outline-none cursor-pointer p-1 shadow-sm"
                >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="as">Assamese</option>
                    <option value="brx">Bodo</option>
                    <option value="kha">Khasi</option>
                    <option value="miz">Mizo</option>
                    <option value="mni">Manipuri</option>
                    <option value="nag">Nagamese</option>
                </select>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Globe2 className="w-5 h-5 text-slate-400" />
          </div>
        )}
      </div>
    </aside>
  );
};
