import React, { useState, useEffect, useCallback } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  useMap,
  useMapEvents,
  GeoJSON,
  LayerGroup,
  Rectangle,
  Polyline,
  ZoomControl,
} from "react-leaflet";
import { useApp } from "../../context/AppContext";
import { createNodeIcon } from "../../utils/leafletIcons";
import { WindFieldLayer } from "./WindFieldLayer";
import { MapLayerPanel } from "./MapLayerPanel";
import { MapLegend } from "./MapLegend";
import { MapLocationInspector } from "./MapLocationInspector";
import { RoadIntelligenceDrawer } from "./RoadIntelligenceDrawer";
import { MapHoverListener, HoverStatusBar } from "./HoverTooltip";
import {
  nerStateBoundaries,
  nerRoadNetwork,
  nerRiskHeatmapPoints,
  nerVillages,
} from "../../data/mockGeoData";
import { historicalLandslides } from "../../data/mockHistoricalLandslides";
import { HeatmapLayer } from "./HeatmapLayer";
import { Maximize2, Minimize2, ShieldAlert, Layers } from "lucide-react";
import { prefetchGridIntelligence } from "../../services/pointIntelligenceService";

const MapController = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 120);
    return () => clearTimeout(t);
  }, [map]);
  useEffect(() => {
    if (target?.lat && target?.lng) {
      map.flyTo([target.lat, target.lng], target.zoom || 14, { duration: 1.4 });
    }
  }, [target, map]);
  useEffect(() => {
    const onMoveEnd = () => prefetchGridIntelligence(map.getBounds());
    map.on("moveend", onMoveEnd);
    return () => map.off("moveend", onMoveEnd);
  }, [map]);
  return null;
};

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const MapPanel = ({
  size = "full",
  onSelectHazard,
  onCreateReport,
  onOpen3D,
}) => {
  const {
    hazards,
    mapTarget,
    setSelectedHazardId,
    reports,
    alerts,
    focusOnMap,
  } = useApp();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [showLayers, setShowLayers] = useState(true);

  const [inspectorLocation, setInspectorLocation] = useState(null);
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [activeRouteOverlay, setActiveRouteOverlay] = useState(null);

  /** Hover readout state — shared by embedded + fullscreen */
  const [hoverState, setHoverState] = useState(null);
  const onHoverUpdate = useCallback((next) => {
    if (typeof next === "function") {
      setHoverState(next);
    } else {
      setHoverState((prev) => ({ ...prev, ...next }));
    }
  }, []);

  const [activeLayers, setActiveLayers] = useState({
    satellite: true,
    terrain: false,
    dark: false,
    wind: false,
    ndvi: false,
    moisture: false,
    hazards: true,
    historical: false,
    reports: true,
    alerts: true,
    roads: true,
    villages: true,
  });

  const toggleLayer = (id, isRadio = false) => {
    setActiveLayers((prev) => {
      const next = { ...prev };
      if (isRadio && (id === "satellite" || id === "terrain" || id === "dark")) {
        next.satellite = false;
        next.terrain = false;
        next.dark = false;
      }
      next[id] = !prev[id];
      return next;
    });
  };

  const defaultCenter = [25.268, 91.738];
  const defaultZoom = size === "compact" ? 11 : 13;

  const adminStyle = {
    color: "#64748b",
    weight: 1.5,
    opacity: 0.5,
    fillOpacity: 0.03,
    dashArray: "4, 4",
  };

  const roadStyle = (feature) => ({
    color:
      feature.properties.status === "Open"
        ? "#10b981"
        : feature.properties.status === "Partially Blocked"
        ? "#f59e0b"
        : "#ef4444",
    weight: 4,
    opacity: 0.9,
    lineCap: "round",
  });

  const handleMapClick = (lat, lng) => {
    setInspectorLocation({ lat, lng });
    setSelectedRoad(null);
    setActiveRouteOverlay(null);
    if (onCreateReport && size === "compact") onCreateReport(lat, lng);
  };

  // No overflow-hidden on the outer shell — it was clipping the status bar.
  // Rounded corners / containment stay on the MapContainer area only if needed.
  const heightClass = isFullscreen
    ? "fixed inset-2 z-[9999] h-[calc(100vh-1rem)]"
    : size === "compact"
    ? "h-40 min-h-[160px]"
    : "h-full min-h-[520px] lg:min-h-[560px]";

  const activeAlerts = (alerts || []).filter((a) => a.status === "Active");

  return (
    <div
      className={`relative w-full border border-[var(--gov-border)] bg-[var(--gov-page-bg)] ${heightClass}`}
    >
      {/* TOP-LEFT controls (below native zoom) */}
      {size === "full" && (
        <div className="absolute top-[76px] left-3 z-20 flex flex-col gap-1 pointer-events-auto">
          <button
            type="button"
            onClick={() => setShowComparison((v) => !v)}
            className={`px-2 py-1 text-[11px] font-bold border border-[var(--gov-border)] shadow-sm ${
              showComparison
                ? "bg-amber-100 text-amber-800"
                : "bg-white text-[var(--gov-text-secondary)] hover:bg-[var(--gov-page-bg)]"
            }`}
          >
            {showComparison ? "Exit Compare" : "Compare"}
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen((v) => !v)}
            className="p-1.5 bg-white border border-[var(--gov-border)] text-[var(--gov-text-secondary)] hover:bg-[var(--gov-page-bg)] shadow-sm"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      )}

      {/* TOP-RIGHT layers */}
      {size === "full" && (
        <div className="absolute top-3 right-3 z-20 pointer-events-auto">
          <button
            type="button"
            onClick={() => setShowLayers((v) => !v)}
            className="mb-1 ml-auto flex items-center gap-1 px-2 py-1 bg-white border border-[var(--gov-border)] text-[11px] font-bold text-[var(--gov-text)] shadow-sm"
          >
            <Layers className="w-3.5 h-3.5" />
            Layers
          </button>
          {showLayers && (
            <MapLayerPanel activeLayers={activeLayers} toggleLayer={toggleLayer} />
          )}
        </div>
      )}

      {/* BOTTOM-LEFT legend */}
      {size === "full" && (
        <div className="absolute bottom-10 left-3 z-20 pointer-events-auto">
          <button
            type="button"
            onClick={() => setShowLegend((v) => !v)}
            className="px-2 py-1 bg-white border border-[var(--gov-border)] text-[11px] font-bold text-[var(--gov-text)] shadow-sm mb-1"
          >
            {showLegend ? "Hide Legend" : "Legend"}
          </button>
          {showLegend && <MapLegend />}
        </div>
      )}

      {/* Wind banner */}
      {size === "full" && activeLayers.wind && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[15] bg-[var(--gov-yellow)] text-[var(--gov-text)] text-[11px] px-3 py-1 font-medium border border-[var(--gov-border)] pointer-events-none whitespace-nowrap">
          Wind: 309° · 4.35 m/s · <span className="font-bold">LIVE</span>
        </div>
      )}

      {/* Map fills the wrapper; status bar overlays bottom */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          scrollWheelZoom={size === "full"}
          zoomControl={false}
          className="w-full h-full font-sans cursor-crosshair"
        >
          {size === "full" && <ZoomControl position="topleft" />}
          <MapController target={mapTarget} />
          <MapClickHandler onMapClick={handleMapClick} />

          {/* Hover listener only — bar is outside MapContainer */}
          <MapHoverListener onHoverUpdate={onHoverUpdate} />

          {activeLayers.satellite && (
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles © Esri"
            />
          )}
          {activeLayers.terrain && (
            <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              attribution="© OpenTopoMap"
            />
          )}
          {activeLayers.dark && (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap"
              maxZoom={19}
            />
          )}

          <WindFieldLayer active={activeLayers.wind} />

          {activeLayers.ndvi && (
            <Rectangle
              bounds={[[24.5, 89.5], [29.5, 97.5]]}
              pathOptions={{
                color: "#16a34a",
                weight: 0,
                fillColor: "#16a34a",
                fillOpacity: 0.12,
              }}
            />
          )}
          {activeLayers.moisture && (
            <Rectangle
              bounds={[[24.5, 89.5], [29.5, 97.5]]}
              pathOptions={{
                color: "#0284c7",
                weight: 0,
                fillColor: "#0284c7",
                fillOpacity: 0.12,
              }}
            />
          )}

          <GeoJSON data={nerStateBoundaries} style={adminStyle} />

          {activeLayers.roads && (
            <GeoJSON
              data={nerRoadNetwork}
              style={roadStyle}
              onEachFeature={(feature, layer) => {
                layer.on({
                  click: (e) => {
                    L.DomEvent.stopPropagation(e);
                    setSelectedRoad(feature);
                    setInspectorLocation(null);
                    setActiveRouteOverlay(null);
                  },
                });
              }}
            />
          )}

          {activeLayers.hazards && (
            <HeatmapLayer points={nerRiskHeatmapPoints} />
          )}

          {activeLayers.villages && (
            <LayerGroup>
              {nerVillages.features.map((v, i) => (
                <Marker
                  key={`v-${i}`}
                  position={[
                    v.geometry.coordinates[1],
                    v.geometry.coordinates[0],
                  ]}
                  icon={createNodeIcon("village")}
                >
                  <Popup>
                    <div className="p-1.5 text-[11px] text-[var(--gov-text)]">
                      <div className="font-bold">{v.properties.name}</div>
                      <div className="text-[var(--gov-text-secondary)]">
                        Pop: {v.properties.population}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          )}

          {activeLayers.hazards && (
            <LayerGroup>
              {hazards?.map(
                (hz) =>
                  hz.coordinates && (
                    <Polygon
                      key={hz.id}
                      positions={hz.coordinates}
                      pathOptions={{
                        color: hz.color,
                        fillColor: hz.color,
                        fillOpacity: 0.22,
                        weight: 2,
                        dashArray: "4, 5",
                      }}
                      eventHandlers={{
                        click: () => {
                          setSelectedHazardId(hz.id);
                          if (onSelectHazard) onSelectHazard(hz);
                        },
                      }}
                    >
                      <Popup>
                        <div className="p-1.5 space-y-1 text-[11px] text-[var(--gov-text-secondary)]">
                          <div className="font-bold text-[var(--gov-text)] flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                            {hz.name}
                          </div>
                          <p className="leading-relaxed">{hz.description}</p>
                        </div>
                      </Popup>
                    </Polygon>
                  )
              )}
            </LayerGroup>
          )}

          {activeLayers.reports && (
            <LayerGroup>
              {reports?.map(
                (rep) =>
                  rep.coordinates && (
                    <Marker
                      key={rep.id}
                      position={rep.coordinates}
                      icon={createNodeIcon("report")}
                    >
                      <Popup>
                        <div className="p-1.5 text-[11px] text-[var(--gov-text-secondary)]">
                          <div className="font-bold text-[var(--gov-text)]">
                            {rep.title}
                          </div>
                          <div className="leading-relaxed">{rep.description}</div>
                        </div>
                      </Popup>
                    </Marker>
                  )
              )}
            </LayerGroup>
          )}

          {activeLayers.alerts && (
            <LayerGroup>
              {activeAlerts.map(
                (a) =>
                  a.lat &&
                  a.lng && (
                    <Marker
                      key={`alert-${a.id}`}
                      position={[a.lat, a.lng]}
                      icon={createNodeIcon(
                        a.severity === "CRITICAL" || a.severity === "EXTREME"
                          ? "critical"
                          : "alert"
                      )}
                      eventHandlers={{
                        click: () => focusOnMap(a.lat, a.lng, 15),
                      }}
                    >
                      <Popup>
                        <div className="p-1.5 text-[11px] text-[var(--gov-text-secondary)]">
                          <div className="font-bold text-[var(--gov-text)]">
                            {a.title}
                          </div>
                          <p className="leading-relaxed">{a.message}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )
              )}
            </LayerGroup>
          )}

          {activeLayers.historical && (
            <LayerGroup>
              {historicalLandslides.map((hist) => (
                <Marker
                  key={hist.id}
                  position={hist.coordinates}
                  icon={createNodeIcon("historical")}
                >
                  <Popup>
                    <div className="p-1.5 text-[11px] text-[var(--gov-text-secondary)]">
                      <div className="font-bold text-[var(--gov-text)]">
                        {hist.name}
                      </div>
                      <div className="text-[10px] text-[var(--gov-text-muted)]">
                        Date: {hist.date}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          )}

          {activeRouteOverlay?.primary?.length > 0 && (
            <Polyline
              positions={activeRouteOverlay.primary}
              pathOptions={{
                color: "#ef4444",
                weight: 4,
                dashArray: "6, 6",
                opacity: 0.9,
              }}
            />
          )}
          {activeRouteOverlay?.alternate?.length > 0 && (
            <Polyline
              positions={activeRouteOverlay.alternate}
              pathOptions={{ color: "#10b981", weight: 4, opacity: 0.9 }}
            />
          )}
        </MapContainer>
      </div>

      {/* Status bar — sibling of map, relative to this card (works at default size) */}
      {size === "full" && <HoverStatusBar hoverState={hoverState} />}

      {inspectorLocation && size === "full" && (
        <MapLocationInspector
          location={inspectorLocation}
          onClose={() => setInspectorLocation(null)}
        />
      )}
      {selectedRoad && size === "full" && (
        <RoadIntelligenceDrawer
          road={selectedRoad}
          onClose={() => setSelectedRoad(null)}
          onShowRoute={setActiveRouteOverlay}
        />
      )}
    </div>
  );
};