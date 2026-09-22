import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Search, Filter } from "lucide-react";

export const ArchivePage = () => {
  const { reports, alerts } = useApp();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [year, setYear] = useState("ALL");

  const archiveItems = [
    ...alerts
      .filter((a) => a.status === "Resolved")
      .map((a) => ({
        id: a.id,
        title: a.title,
        type: "Alert",
        severity: a.severity,
        location: a.source || "—",
        date: a.timestamp || a.timeAgo,
        status: a.status,
      })),
    ...reports.map((r) => ({
      id: r.id,
      title: r.title,
      type: "Field Report",
      severity: r.severity,
      location: r.location,
      date: r.timestamp || r.timeAgo,
      status: r.status || "Submitted",
    })),
  ];

  const filtered = archiveItems.filter((item) => {
    if (category !== "ALL" && item.type !== category) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.title?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const severityColor = (sev) => {
    switch (sev) {
      case "EXTREME":
      case "CRITICAL":
        return "bg-[var(--gov-danger)] text-white";
      case "HIGH":
        return "bg-[var(--gov-accent)] text-white";
      case "MODERATE":
        return "bg-[var(--gov-warning)] text-white";
      default:
        return "bg-slate-200 text-[var(--gov-text)]";
    }
  };

  return (
    <div className="bg-transparent relative z-10">
      <div className="bg-[var(--gov-primary)] text-white px-4 py-2">
        <h2 className="text-[15px] font-semibold tracking-wide">
          Records Archive — Historical Reports & Resolved Alerts
        </h2>
      </div>

      <div className="w-full px-3 md:px-4 lg:px-5 py-4 space-y-3">
        <div className="bg-white/95 backdrop-blur-sm border border-[var(--gov-border)] rounded-[var(--panel-radius)] p-3 flex flex-wrap items-center gap-3 shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[var(--gov-text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-[var(--gov-border)] rounded-md pl-8 pr-3 py-2 text-[13px] text-[var(--gov-text)] outline-none focus:ring-1 focus:ring-[var(--gov-primary)]"
            />
          </div>
          <div className="flex items-center gap-2 text-[13px]">
            <Filter className="w-4 h-4 text-[var(--gov-text-muted)]" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-[var(--gov-border)] rounded-md px-2.5 py-2 text-[var(--gov-text)] bg-white"
            >
              <option value="ALL">All Categories</option>
              <option value="Alert">Resolved Alerts</option>
              <option value="Field Report">Field Reports</option>
            </select>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border border-[var(--gov-border)] rounded-md px-2.5 py-2 text-[var(--gov-text)] bg-white"
            >
              <option value="ALL">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
          <span className="text-[13px] font-semibold text-[var(--gov-primary)]">
            Results: {filtered.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.length === 0 ? (
            <div className="col-span-full bg-white/95 backdrop-blur-sm border border-[var(--gov-border)] rounded-[var(--panel-radius)] p-10 text-center text-[14px] text-[var(--gov-text-muted)]">
              No archive records match the current filters.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white/95 backdrop-blur-sm border border-[var(--gov-border)] rounded-[var(--panel-radius)] p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-[14px] text-[var(--gov-text)] leading-snug">
                    {item.title}
                  </h3>
                  <span
                    className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${severityColor(
                      item.severity
                    )}`}
                  >
                    {item.severity || "—"}
                  </span>
                </div>
                <p className="text-[12px] text-[var(--gov-text-secondary)] mb-1">
                  {item.type} · {item.location}
                </p>
                <p className="text-[12px] text-[var(--gov-text-muted)]">
                  {item.date} · {item.status}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};