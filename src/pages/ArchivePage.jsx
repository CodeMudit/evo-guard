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

  return (
    <div className="bg-[var(--gov-page-bg)]">
      <div className="bg-[var(--gov-navy)] text-white px-3 py-1.5">
        <h2 className="text-[14px] font-bold">
          Archive Portal — Historical Reports & Resolved Alerts
        </h2>
      </div>

      <div className="max-w-[1600px] mx-auto p-3 space-y-3">
        {/* Filters – high contrast (C1) */}
        <div className="bg-white border border-[var(--gov-border)] p-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[var(--gov-text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-[var(--gov-border)] rounded-sm pl-8 pr-3 py-1.5 text-[12.5px] text-[var(--gov-text)] outline-none"
            />
          </div>
          <div className="flex items-center gap-2 text-[12px]">
            <Filter className="w-4 h-4 text-[var(--gov-text-muted)]" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-[var(--gov-border)] rounded-sm px-2 py-1.5 text-[var(--gov-text)] bg-white"
            >
              <option value="ALL">All Categories</option>
              <option value="Alert">Resolved Alerts</option>
              <option value="Field Report">Field Reports</option>
            </select>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border border-[var(--gov-border)] rounded-sm px-2 py-1.5 text-[var(--gov-text)] bg-white"
            >
              <option value="ALL">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
          <span className="text-[12px] font-semibold text-[var(--gov-navy)]">
            Results: {filtered.length}
          </span>
        </div>

        {/* Cards – visible severity chip (A6) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filtered.length === 0 ? (
            <div className="col-span-full bg-white border border-[var(--gov-border)] p-8 text-center text-[13px] text-[var(--gov-text-muted)]">
              No archive records match the current filters.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[var(--gov-border)] p-3 flex flex-col"
              >
                <h3 className="font-bold text-[var(--gov-navy)] text-[13px] leading-tight">
                  {item.title}
                </h3>
                <p className="text-[11.5px] text-[var(--gov-text-secondary)] mt-1">
                  {item.type} · {item.location}
                </p>
                <p className="text-[11px] text-[var(--gov-text-muted)] mt-0.5">
                  {item.date}
                </p>
                <div className="mt-auto pt-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[var(--gov-navy)] text-white uppercase">
                    {item.severity || item.status}
                  </span>
                  <button className="text-[11px] font-semibold text-[var(--gov-blue)] hover:underline">
                    Read More
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};