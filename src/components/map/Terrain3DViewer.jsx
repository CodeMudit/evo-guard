import React, { useMemo, useState, useEffect } from 'react';
import Map, { Source, Layer, NavigationControl, Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Mountain, MapPin, Wind, Droplets, ShieldAlert, X } from 'lucide-react';
import { fetchPointIntelligence } from "../../services/pointIntelligenceService";
import { predictRisk } from "../../services/riskService";

export const Terrain3DViewer = ({ centerLat, centerLng, onClose }) => {
  const center = [centerLat || 25.268, centerLng || 91.738]; 

  const [locationData, setLocationData] = useState(null);
  const [riskInfo, setRiskInfo] = useState(null);
  const [exaggeration, setExaggeration] = useState(1.5);

  useEffect(() => {
      let isMounted = true;
      const load = async () => {
          const data = await fetchPointIntelligence(center[0], center[1]);
          if(isMounted) {
              setLocationData(data);
              const risk = await predictRisk(data);
              setRiskInfo(risk);
          }
      };
      load();
      return () => isMounted = false;
  }, [center[0], center[1]]);
  
  // AWS Terrarium DEM tiles for 3D elevation
  const terrainSource = useMemo(() => ({
    type: 'raster-dem',
    tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
    encoding: 'terrarium',
    tileSize: 256,
    maxzoom: 14
  }), []);

  // Standard OpenStreetMap base style
  const mapStyle = {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap'
      },
      terrainSource: terrainSource
    },
    layers: [
      {
        id: 'osm-layer',
        type: 'raster',
        source: 'osm',
        minzoom: 0,
        maxzoom: 19
      }
    ],
    terrain: {
      source: 'terrainSource',
      exaggeration: exaggeration
    }
  };

  return (
    <div className="w-full h-full bg-white rounded border border-[var(--color-border)] flex overflow-hidden shadow-sm">
      {/* 3D Map Area (Left) */}
      <div className="flex-1 relative flex flex-col">
        <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)] flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center gap-4">
              <h3 className="text-[var(--color-text-primary)] font-bold text-sm flex items-center gap-2">
                <Mountain className="w-4 h-4 text-emerald-600" />
                3D Terrain Risk View
              </h3>
              <div className="flex gap-2">
                  <button onClick={() => setExaggeration(1.0)} className={`text-[10px] px-2 py-1 rounded font-bold transition-colors ${exaggeration === 1.0 ? 'bg-slate-800 text-white' : 'bg-white border border-[var(--color-border)] text-slate-600 hover:bg-slate-50'}`}>1.0x</button>
                  <button onClick={() => setExaggeration(1.5)} className={`text-[10px] px-2 py-1 rounded font-bold transition-colors ${exaggeration === 1.5 ? 'bg-slate-800 text-white' : 'bg-white border border-[var(--color-border)] text-slate-600 hover:bg-slate-50'}`}>1.5x</button>
                  <button onClick={() => setExaggeration(2.0)} className={`text-[10px] px-2 py-1 rounded font-bold transition-colors ${exaggeration === 2.0 ? 'bg-slate-800 text-white' : 'bg-white border border-[var(--color-border)] text-slate-600 hover:bg-slate-50'}`}>2.0x</button>
              </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="bg-white border border-[var(--color-border)] hover:bg-slate-50 text-[var(--color-text-primary)] px-3 py-1 rounded text-xs font-bold transition-colors shadow-sm">
                Return to 2D Map
            </button>
          )}
        </div>
        
        <div className="flex-1 relative">
          <Map
            initialViewState={{
              longitude: center[1],
              latitude: center[0],
              zoom: 13,
              pitch: 65,
              bearing: 30
            }}
            mapStyle={mapStyle}
            interactive={true}
          >
            <NavigationControl position="top-right" visualizePitch={true} />
            <Marker longitude={center[1]} latitude={center[0]} anchor="bottom">
                <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-bounce shadow-xl">
                    <ShieldAlert className="w-3 h-3 text-white" />
                </div>
            </Marker>
          </Map>
        </div>
      </div>

      {/* Terrain Risk Explanation (Right) */}
      <div className="w-80 bg-white border-l border-[var(--color-border)] p-4 flex flex-col gap-4 overflow-y-auto">
          <h3 className="text-[var(--color-text-primary)] font-bold text-sm tracking-tight border-b border-[var(--color-border)] pb-2 uppercase">Terrain Analysis</h3>
          
          <div className="space-y-4">
              <div className="space-y-1">
                  <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider block">Terrain & Elevation</span>
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs text-[var(--color-text-primary)] font-medium leading-relaxed">
                      High susceptibility slope zone. Elevated relief creates momentum corridors for debris flows. 
                      Elevation context highlights vulnerability to saturated topsoil failure.
                  </div>
              </div>

              {locationData && (
                  <>
                      <div className="space-y-1">
                          <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider block">Meteorological Forcing</span>
                          <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs text-[var(--color-text-primary)] grid grid-cols-2 gap-2 font-medium">
                              <div>Rain (24h): <span className="font-bold text-blue-700">{locationData.rainfall?.rain24h?.value || 0} mm</span></div>
                              <div>Soil Moist: <span className="font-bold text-blue-700">{locationData.soil?.moisture?.value || 0}%</span></div>
                          </div>
                      </div>
                  </>
              )}

              {riskInfo && (
                  <div className="space-y-1 pt-3 border-t border-[var(--color-border)] mt-2">
                      <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider block mb-2">Risk Fusion Output</span>
                      <div className="flex items-end justify-between bg-slate-50 p-4 rounded border border-slate-200 shadow-sm">
                          <div>
                              <div className="text-3xl font-black text-[var(--color-text-primary)] leading-none">{riskInfo.score}</div>
                              <div className="text-[10px] text-[var(--color-text-muted)] mt-1 font-bold">/ 100</div>
                          </div>
                          <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${riskInfo.level === 'HIGH' || riskInfo.level === 'EXTREME' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                              {riskInfo.level} RISK
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
