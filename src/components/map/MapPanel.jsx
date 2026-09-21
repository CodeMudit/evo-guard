import React, { useState, useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents, GeoJSON, LayerGroup, Rectangle, Polyline } from "react-leaflet";
import { useApp } from "../../context/AppContext";
import { createNodeIcon } from "../../utils/leafletIcons";
import { WindFieldLayer } from "./WindFieldLayer";
import { MapLayerPanel } from "./MapLayerPanel";
import { MapLegend } from "./MapLegend";
import { MapLocationInspector } from "./MapLocationInspector";
import { RoadIntelligenceDrawer } from "./RoadIntelligenceDrawer";
import { HoverTooltip } from "./HoverTooltip";
import { nerStateBoundaries, nerRoadNetwork, nerRiskHeatmapPoints, nerVillages } from "../../data/mockGeoData";
import { historicalLandslides } from "../../data/mockHistoricalLandslides";
import { HeatmapLayer } from "./HeatmapLayer";
import { Maximize2, Minimize2, ShieldAlert } from "lucide-react";

import { prefetchGridIntelligence } from "../../services/pointIntelligenceService";

// Map Re-centering & Resize Controller
const MapController = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (target && target.lat && target.lng) {
      map.flyTo([target.lat, target.lng], target.zoom || 14, {
        duration: 1.5,
      });
    }
  }, [target, map]);

  useEffect(() => {
    const handleMoveEnd = () => {
       prefetchGridIntelligence(map.getBounds());
    };
    map.on('moveend', handleMoveEnd);
    return () => map.off('moveend', handleMoveEnd);
  }, [map]);

  return null;
};

// Click Event Listener
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

export const MapPanel = ({ onSelectHazard, onCreateReport, onOpen3D }) => {
  const { hazards, mapTarget, setSelectedHazardId, reports } = useApp();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  
  const [inspectorLocation, setInspectorLocation] = useState(null);
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [activeAlternateRoute, setActiveAlternateRoute] = useState(null);

  const [activeLayers, setActiveLayers] = useState({
    satellite: false,
    terrain: false,
    dark: true,
    wind: false,
    ndvi: false,
    moisture: false,
    hazards: true,
    historical: false,
    reports: true,
    roads: true,
    villages: true,
  });

  const toggleLayer = (id, isRadio = false) => {
    setActiveLayers(prev => {
        const next = { ...prev };
        if (isRadio) {
            if (id === 'satellite' || id === 'terrain' || id === 'dark') {
                next.satellite = false;
                next.terrain = false;
                next.dark = false;
            }
        }
        next[id] = !prev[id];
        return next;
    });
  };

  const defaultCenter = [25.268, 91.738];
  const defaultZoom = 13;

  const adminStyle = {
    color: "#64748b",
    weight: 2,
    opacity: 0.6,
    fillOpacity: 0.05,
    dashArray: "5, 5"
  };

  const roadStyle = (feature) => {
    return {
      color: feature.properties.status === "Open" ? "#10b981" : feature.properties.status === "Partially Blocked" ? "#f59e0b" : "#ef4444",
      weight: 3,
      opacity: 0.9
    };
  };

  const villageIcon = L.divIcon({
    className: "bg-transparent",
    html: `<div class="w-3 h-3 bg-[var(--color-status-info)] border-[1.5px] border-white rounded-full shadow-sm"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });

  const handleMapClick = (lat, lng) => {
    setInspectorLocation({ lat, lng });
    setSelectedRoad(null);
    setActiveAlternateRoute(null);
  };

  return (
    <div
      className={`relative w-full rounded border border-[var(--color-border)] bg-[var(--color-surface-secondary)] shadow-sm transition-all duration-300 ${
        isFullscreen ? "fixed inset-2 z-[9999] h-[calc(100vh-1rem)]" : "h-full min-h-[520px] lg:min-h-[640px]"
      }`}
    >
      {/* Map Header Controls Bar */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2 pointer-events-auto bg-[var(--color-surface-primary)] p-1 rounded shadow-md border border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => setShowComparison(!showComparison)}
          className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${
            showComparison ? "bg-amber-100 text-amber-800" : "bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-slate-50"
          }`}
        >
          {showComparison ? "Exit Comparison" : "Compare"}
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 rounded bg-[var(--color-surface-secondary)] hover:bg-slate-100 text-[var(--color-text-secondary)] transition-colors border border-transparent hover:border-[var(--color-border)]"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full z-0 font-sans cursor-crosshair"
      >
        <MapController target={mapTarget} />
        <MapClickHandler onMapClick={handleMapClick} />
        
        {/* Debounced Map Hover Intelligence */}
        <HoverTooltip />

        {/* Custom Layer Manager Panel */}
        <MapLayerPanel activeLayers={activeLayers} toggleLayer={toggleLayer} />

        {/* Base Layers */}
        {activeLayers.satellite && (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri &mdash; Sentinel-2/ISRO Bhuvan Proxy"
          />
        )}
        {activeLayers.terrain && (
          <TileLayer
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenTopoMap contributors"
          />
        )}
        {activeLayers.dark && (
          <TileLayer
            url={`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`}
            attribution="&copy; <a href='https://carto.com/'>CARTO</a>"
          />
        )}

        {/* Environment Layers */}
        <WindFieldLayer active={activeLayers.wind} />

        {activeLayers.ndvi && (
          <Rectangle bounds={[[24.5, 89.5], [29.5, 97.5]]} pathOptions={{ color: '#16a34a', weight: 0, fillColor: '#16a34a', fillOpacity: 0.15, className: 'mix-blend-multiply' }} />
        )}
        {activeLayers.moisture && (
          <Rectangle bounds={[[24.5, 89.5], [29.5, 97.5]]} pathOptions={{ color: '#0284c7', weight: 0, fillColor: '#0284c7', fillOpacity: 0.15, className: 'mix-blend-multiply' }} />
        )}

        {/* Overlays always on for context */}
        <GeoJSON data={nerStateBoundaries} style={adminStyle} />

        {/* Infrastructure Layers */}
        {activeLayers.roads && (
          <GeoJSON 
            data={nerRoadNetwork} 
            style={roadStyle} 
            onEachFeature={(feature, layer) => {
              layer.on({
                click: (e) => {
                  L.DomEvent.stopPropagation(e); // Stop map click
                  setSelectedRoad(feature);
                  setInspectorLocation(null);
                  setActiveAlternateRoute(null);
                }
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
                  <Marker key={i} position={[v.geometry.coordinates[1], v.geometry.coordinates[0]]} icon={villageIcon}>
                     <Popup>
                        <div className="p-2 text-xs">
                           <div className="font-bold text-[var(--color-text-primary)]">{v.properties.name}</div>
                           <div className="text-[var(--color-text-secondary)] font-medium">Population: {v.properties.population}</div>
                           <div className={`font-bold mt-1.5 px-2 py-0.5 inline-block rounded ${v.properties.risk === 'High' || v.properties.risk === 'Extreme' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                              Risk: {v.properties.risk}
                           </div>
                        </div>
                     </Popup>
                  </Marker>
               ))}
            </LayerGroup>
        )}

        {activeLayers.hazards && (
          <LayerGroup>
            {hazards.map((hz) => hz.coordinates && (
                <Polygon
                  key={hz.id}
                  positions={hz.coordinates}
                  pathOptions={{
                    color: hz.color,
                    fillColor: hz.color,
                    fillOpacity: 0.25,
                    weight: 2,
                    dashArray: "4, 6",
                  }}
                  eventHandlers={{
                    click: () => {
                      setSelectedHazardId(hz.id);
                      if (onSelectHazard) onSelectHazard(hz);
                    },
                  }}
                >
                  <Popup>
                    <div className="p-2 space-y-1.5 text-xs text-[var(--color-text-secondary)] font-sans">
                      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-1.5">
                        <span className="font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-red-600" />
                          {hz.name}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-[10px] font-bold">
                          {hz.riskLevel}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium leading-relaxed mt-1">{hz.description}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] font-mono font-bold mt-1">VULNERABILITY SCORE: {hz.vulnerabilityScore}/100</p>
                    </div>
                  </Popup>
                </Polygon>
              ))}
            </LayerGroup>
        )}

        {activeLayers.reports && (
          <LayerGroup>
            {reports?.map((rep) => rep.coordinates && (
                <Marker key={rep.id} position={rep.coordinates} icon={createNodeIcon(rep.title, false)}>
                  <Popup>
                     <div className="p-2 space-y-1.5 text-xs font-sans text-[var(--color-text-secondary)]">
                        <div className="font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-1 mb-1">{rep.title}</div>
                        <div className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded inline-block font-bold uppercase">{rep.status}</div>
                        <div className="font-medium mt-1 leading-relaxed">{rep.description}</div>
                        <div className="text-[10px] text-[var(--color-text-muted)] mt-2 font-mono">REPORTER ID: {rep.reportedBy}</div>
                     </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
        )}

        {activeLayers.historical && (
          <LayerGroup>
            {historicalLandslides.map((hist) => (
                <Marker key={hist.id} position={hist.coordinates} icon={createNodeIcon('Historical', false)}>
                  <Popup>
                    <div className="p-2 space-y-1.5 text-xs font-sans text-[var(--color-text-secondary)]">
                      <div className="font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-1 mb-1">{hist.name}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase">Date: {hist.date}</div>
                      <div className="font-medium leading-relaxed">{hist.description}</div>
                      <div className="text-[10px] font-mono mt-1 text-slate-500 font-bold">SEVERITY: {hist.severity}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
        )}
        {/* Alternate Route Polyline */}
        {activeAlternateRoute && activeAlternateRoute.length > 0 && (
          <Polyline 
            positions={activeAlternateRoute}
            pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.9, dashArray: '8, 8' }}
          />
        )}

        {/* Selected Location Marker (drawn on top) */}
        {inspectorLocation && (
          <Marker position={[inspectorLocation.lat, inspectorLocation.lng]} icon={createNodeIcon('Selected', false)}>
            <Popup>
                <div className="text-xs font-bold p-1">Selected Location for Analysis</div>
            </Popup>
          </Marker>
        )}

        {/* Side-by-side comparison simulated using a secondary TileLayer in a rectangle if active */}
        {showComparison && (
          <LayerGroup>
             <Rectangle bounds={[[25.2, 91.7], [25.3, 91.8]]} pathOptions={{ color: '#3b82f6', weight: 2, fillOpacity: 0 }} />
             <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              bounds={[[25.2, 91.7], [25.3, 91.8]]}
              opacity={1}
            />
          </LayerGroup>
        )}
      </MapContainer>

      {/* Overlay Legend */}
      <MapLegend />

      {/* Location Inspector Panel (Point Intelligence) */}
      {inspectorLocation && !selectedRoad && (
        <MapLocationInspector 
          lat={inspectorLocation.lat} 
          lng={inspectorLocation.lng} 
          onClose={() => setInspectorLocation(null)}
          onCreateReport={() => onCreateReport && onCreateReport(inspectorLocation.lat, inspectorLocation.lng)}
          onOpen3D={() => onOpen3D && onOpen3D(inspectorLocation.lat, inspectorLocation.lng)}
        />
      )}
      
      {/* Road Intelligence Drawer */}
      {selectedRoad && (
        <RoadIntelligenceDrawer 
          roadFeature={selectedRoad}
          onClose={() => {
            setSelectedRoad(null);
            setActiveAlternateRoute(null);
          }}
          onRouteCalculated={(geom) => setActiveAlternateRoute(geom)}
        />
      )}
    </div>
  );
};
