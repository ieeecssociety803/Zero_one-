import React, { useEffect, useRef, useState } from 'react';
import { Layers, Check, Compass, Radio, Wind, AlertTriangle, Info } from 'lucide-react';
import L from 'leaflet';

const MAP_LAYERS = [
  {
    id: 'osm',
    name: 'Standard Street Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: 'OpenStreetMap'
  },
  {
    id: 'satellite',
    name: 'Satellite Hybrid (ESRI)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri'
  },
  {
    id: 'carto_dark',
    name: 'Carto Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: 'CartoDB'
  }
];

export default function InteractiveWeatherMap({
  activeLocation,
  weatherData,
  onOpenRadarModal
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedBaseLayer, setSelectedBaseLayer] = useState('osm'); // DEFAULT TO STANDARD MAP AS REQUESTED
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showRadarOverlay, setShowRadarOverlay] = useState(true);
  const [showCycloneTrack, setShowCycloneTrack] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create map instance centered on India
      const map = L.map(mapContainerRef.current, {
        center: [activeLocation.lat || 20.5937, activeLocation.lon || 78.9629],
        zoom: activeLocation.lat === 20.5937 ? 4.5 : 7,
        zoomControl: false,
        attributionControl: false
      });

      // Zoom Control on top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Base tile layer
      const baseLayer = L.tileLayer(
        MAP_LAYERS.find(l => l.id === selectedBaseLayer).url,
        { maxZoom: 18 }
      ).addTo(map);

      // RainViewer Doppler Radar overlay
      const radarLayer = L.tileLayer(
        'https://tilecache.rainviewer.com/v2/radar/nowcast_0/256/{z}/{x}/{y}/2/1_1.png',
        { opacity: 0.55, maxZoom: 18 }
      );
      if (showRadarOverlay) {
        radarLayer.addTo(map);
      }

      mapInstanceRef.current = { map, baseLayer, radarLayer, overlays: [] };
    }
  }, []);

  // Update Base Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const { map, baseLayer } = mapInstanceRef.current;
    
    map.removeLayer(baseLayer);
    const newBase = L.tileLayer(
      MAP_LAYERS.find(l => l.id === selectedBaseLayer).url,
      { maxZoom: 18 }
    ).addTo(map);
    newBase.bringToBack();
    mapInstanceRef.current.baseLayer = newBase;
  }, [selectedBaseLayer]);

  // Update Doppler Radar Toggle
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const { map, radarLayer } = mapInstanceRef.current;
    if (showRadarOverlay) {
      if (!map.hasLayer(radarLayer)) radarLayer.addTo(map);
    } else {
      if (map.hasLayer(radarLayer)) map.removeLayer(radarLayer);
    }
  }, [showRadarOverlay]);

  // Smooth Fly-to Zoom when Location Changes & Render Floating Temp Pill
  useEffect(() => {
    if (!mapInstanceRef.current || !activeLocation) return;
    const { map } = mapInstanceRef.current;

    // Fly to new coordinates smoothly
    map.flyTo([activeLocation.lat, activeLocation.lon], 8.5, {
      animate: true,
      duration: 1.5
    });

    // Remove existing marker
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    const currentTemp = weatherData?.current?.temperature || 27;

    // Create Dark Pill Marker with Mini Gradient Bar matching screenshot
    const customIcon = L.divIcon({
      className: 'custom-weather-pin',
      html: `
        <div class="relative flex flex-col items-center select-none pointer-events-auto">
          <div class="px-3.5 py-1.5 rounded-2xl bg-[#090d16]/95 border border-white/25 shadow-2xl backdrop-blur-md flex flex-col items-center">
            <span class="text-white text-xs sm:text-sm font-black font-['Outfit'] tracking-tight">
              ${currentTemp}' C
            </span>
            <div class="w-10 h-1 mt-1 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 shadow-sm"></div>
          </div>
          <div class="w-2.5 h-2.5 bg-[#090d16] border-r border-b border-white/25 transform rotate-45 -mt-1.5 shadow-md"></div>
        </div>
      `,
      iconSize: [80, 45],
      iconAnchor: [40, 45]
    });

    markerRef.current = L.marker([activeLocation.lat, activeLocation.lon], { icon: customIcon }).addTo(map);
  }, [activeLocation, weatherData]);

  const conditionLabel = weatherData?.current?.condition || 'Mainly Clear';

  return (
    <div className="relative w-full h-[380px] sm:h-[420px] rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#0b0f19] flex flex-col justify-between">
      
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full" />

      {/* Top Gradient Overlay */}
      <div className="relative z-10 p-4 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 border border-white/10 text-xs font-semibold text-white shadow-lg backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{activeLocation.name}, {activeLocation.state || activeLocation.country}</span>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative z-10 p-4 flex items-end justify-between pointer-events-none">
        
        {/* Left Bottom: Layers Selector Button matching screenshot */}
        <div className="relative pointer-events-auto">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="p-3 rounded-2xl bg-[#0e131f]/90 hover:bg-slate-900 border border-white/20 text-white shadow-2xl backdrop-blur-xl transition-all flex items-center gap-2 group"
            title="Switch Map Layers (Standard Map, Satellite, Doppler Radar)"
          >
            <Layers className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
          </button>

          {/* Layer Options Drawer */}
          {showLayerMenu && (
            <div className="absolute left-0 bottom-14 w-56 p-2 rounded-2xl bg-[#090d16]/95 border border-white/20 backdrop-blur-2xl shadow-2xl z-50 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                Map Projection
              </div>

              {MAP_LAYERS.map(layer => (
                <button
                  key={layer.id}
                  onClick={() => {
                    setSelectedBaseLayer(layer.id);
                    setShowLayerMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                    selectedBaseLayer === layer.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{layer.name}</span>
                  {selectedBaseLayer === layer.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}

              <div className="pt-1.5 border-t border-white/10 space-y-1">
                <button
                  onClick={() => setShowRadarOverlay(!showRadarOverlay)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-all ${
                    showRadarOverlay ? 'text-emerald-300 font-bold bg-emerald-500/10' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span>Doppler Radar Overlay</span>
                  <span className={`w-2 h-2 rounded-full ${showRadarOverlay ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Right / Center: Dynamic Weather Condition Title matching screenshot */}
        <div className="pointer-events-auto flex items-center gap-2 bg-[#090d16]/85 px-4 py-2 rounded-2xl border border-white/15 backdrop-blur-md shadow-xl">
          <span className="text-base sm:text-lg font-extrabold text-white font-['Outfit'] tracking-tight">
            {conditionLabel}
          </span>
        </div>

      </div>

    </div>
  );
}
