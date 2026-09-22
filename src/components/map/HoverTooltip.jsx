import React, { useState, useEffect, useMemo, useRef } from "react";
import { useMapEvents } from "react-leaflet";
import throttle from "lodash/throttle";
import { fetchPointIntelligence, getCachedOrNull } from "../../services/pointIntelligenceService";
import { predictRisk } from "../../services/data/riskService";
import { createPortal } from "react-dom";

/**
 * Listens to map mousemove (must be a child of MapContainer).
 * Calls onHoverUpdate so the parent can render the status bar OUTSIDE MapContainer
 * (avoids Leaflet pane / overflow clipping at embedded size).
 */
export const MapHoverListener = ({ onHoverUpdate }) => {
  const abortControllerRef = useRef(null);
  const positionRef = useRef(null);

  const handleMouseMove = useMemo(
    () =>
      throttle(
        async (e) => {
          const { lat, lng } = e.latlng;
          const coordKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
          positionRef.current = coordKey;

          const coords = { lat: lat.toFixed(4), lng: lng.toFixed(4) };
          onHoverUpdate?.({ coords, isLoading: true });

          if (abortControllerRef.current) abortControllerRef.current.abort();

          const cachedData = getCachedOrNull(lat, lng, { allowStale: true });
          if (cachedData) {
            if (positionRef.current === coordKey) {
              const risk = await predictRisk(cachedData);
              if (positionRef.current === coordKey) {
                onHoverUpdate?.({
                  coords,
                  hoverData: cachedData,
                  riskPrediction: risk,
                  isLoading: cachedData.freshness === "STALE",
                });
              }
            }
            if (cachedData.freshness === "CACHED") return;
          }

          abortControllerRef.current = new AbortController();
          try {
            const data = await fetchPointIntelligence(
              lat,
              lng,
              abortControllerRef.current.signal
            );
            const risk = await predictRisk(data);
            if (positionRef.current === coordKey) {
              onHoverUpdate?.({
                coords,
                hoverData: data,
                riskPrediction: risk,
                isLoading: false,
              });
            }
          } catch (err) {
            if (err.message !== "Request aborted") {
              onHoverUpdate?.({ coords, isLoading: false });
            }
          }
        },
        180,
        { leading: false, trailing: true }
      ),
    [onHoverUpdate]
  );

  useMapEvents({
    mousemove: handleMouseMove,
    mouseout: () => {
      handleMouseMove.cancel();
      if (abortControllerRef.current) abortControllerRef.current.abort();
      onHoverUpdate?.((prev) =>
        prev ? { ...prev, isLoading: false } : prev
      );
    },
  });

  useEffect(() => {
    return () => {
      handleMouseMove.cancel();
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [handleMouseMove]);

  return null;
};

const val = (v) =>
  v !== undefined && v !== null && v !== "" && v !== "—" ? v : "N/A";

/**
 * Status bar UI — render as sibling of MapContainer inside a position:relative wrapper.
 * Not a child of MapContainer (prevents clipping at default card size).
 */
export const HoverStatusBar = ({ hoverState }) => {
  if (!hoverState?.coords) return null;

  const { coords, hoverData, riskPrediction, isLoading } = hoverState;
  const rain = val(hoverData?.rainfall?.rain24h?.value);
  const wind = val(hoverData?.weather?.windSpeed?.value);
  const soil = val(hoverData?.soil?.moisture?.value);
  const elev = val(hoverData?.terrain?.elevation?.value);
  const risk = riskPrediction?.level ?? "N/A";
  const sus = hoverData?.susceptibility?.level ?? "N/A";
  const fresh = hoverData?.freshness ?? (isLoading ? "…" : "N/A");

  const riskColor =
    risk === "HIGH" || risk === "EXTREME"
      ? "text-red-600"
      : risk === "ELEVATED" || risk === "MODERATE"
      ? "text-amber-600"
      : "text-emerald-600";

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none px-1 pb-1">
      <div className="bg-white/95 border border-[var(--gov-border)] shadow-sm px-2 py-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] sm:text-[11px] text-[var(--gov-text)] max-w-full overflow-hidden">
        <span className="font-mono text-[9px] sm:text-[10px] text-[var(--gov-text-muted)] whitespace-nowrap shrink-0">
          {coords.lat}°N {coords.lng}°E
        </span>
        <span className="text-[var(--gov-border)] hidden sm:inline">|</span>
        <span className="whitespace-nowrap">
          Rain <b className="text-sky-700">{rain}</b>
          <span className="text-[var(--gov-text-muted)]"> mm/24h</span>
        </span>
        <span className="whitespace-nowrap">
          Wind <b className="text-sky-700">{wind}</b>
          <span className="text-[var(--gov-text-muted)]"> km/h</span>
        </span>
        <span className="whitespace-nowrap">
          Soil <b className="text-sky-700">{soil}</b>
          <span className="text-[var(--gov-text-muted)]">%</span>
        </span>
        <span className="whitespace-nowrap hidden sm:inline">
          Elev <b className="text-sky-700">{elev}</b>
          <span className="text-[var(--gov-text-muted)]"> m</span>
        </span>
        <span className="text-[var(--gov-border)] hidden md:inline">|</span>
        <span className="whitespace-nowrap">
          Risk <b className={riskColor}>{risk}</b>
        </span>
        <span className="whitespace-nowrap">
          Susc{" "}
          <b className={sus === "HIGH" ? "text-red-600" : "text-emerald-600"}>
            {sus}
          </b>
        </span>
        <span
          className={`ml-auto text-[9px] font-mono uppercase tracking-wider shrink-0 ${
            fresh === "LIVE" || fresh === "CACHED"
              ? "text-emerald-600"
              : fresh === "STALE"
              ? "text-amber-600"
              : "text-[var(--gov-text-muted)]"
          }`}
        >
          {isLoading ? "…" : fresh}
        </span>
      </div>
    </div>
  );
};

/** @deprecated — use MapHoverListener + HoverStatusBar */
export const HoverTooltip = () => null;