import React, { useEffect, useRef, useState } from 'react';
import { Layers, Check, Compass, Radio, Wind, AlertTriangle } from 'lucide-react';
import L from 'leaflet';

const MAP_LAYERS = [
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
  },
  {
    id: 'osm',
    name: 'Standard Street Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: 'OpenStreetMap'
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
  const [selectedBaseLayer, setSelectedBaseLayer] = useState('satellite');
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
    mapInstanceRef.current.baseLayer = newBase;
  }, [selectedBaseLayer]);

  // Update Radar Overlay
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const { map, radarLayer } = mapInstanceRef.current;
    if (showRadarOverlay) {
      if (!map.hasLayer(radarLayer)) radarLayer.addTo(map);
    } else {
      if (map.hasLayer(radarLayer)) map.removeLayer(radarLayer);
    }
  }, [showRadarOverlay]);

  // Fly/Zoom to Searched Location and update Popup
  useEffect(() => {
    if (!mapInstanceRef.current || !activeLocation) return;
    const { map } = mapInstanceRef.current;

    map.flyTo([activeLocation.lat, activeLocation.lon], 7, {
      duration: 1.4,
      easeLinearity: 0.25
    });

    // Custom HTML Marker matching the screenshot: Dark Pill with "27° C" & mini gradient bar
    const temp = weatherData?.current?.temperature ?? 27;
    const customIcon = L.divIcon({
      className: 'custom-weather-pin',
      html: `
        <div class="relative flex flex-col items-center group cursor-pointer -translate-x-1/2 -translate-y-1/2">
          <div class="px-4 py-2 rounded-2xl bg-slate-950/90 border border-white/20 backdrop-blur-md shadow-2xl flex flex-col items-center">
            <span class="text-base font-extrabold text-white tracking-tight font-['Outfit']">${temp}° C</span>
            <div class="w-10 h-1 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 mt-1"></div>
          </div>
          <div class="w-2.5 h-2.5 bg-slate-950 border-2 border-white/30 rounded-full mt-0.5 shadow-md"></div>
        </div>
      `,
      iconSize: [80, 50],
      iconAnchor: [40, 25]
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([activeLocation.lat, activeLocation.lon]);
      markerRef.current.setIcon(customIcon);
    } else {
      markerRef.current = L.marker([activeLocation.lat, activeLocation.lon], { icon: customIcon }).addTo(map);
    }

  }, [activeLocation, weatherData]);

  const conditionText = weatherData?.current?.condition || 'Mainly Clear';

  return (
    <div className="relative w-full h-[380px] sm:h-[420px] rounded-2xl overflow-hidden border-2 border-cyan-500/80 shadow-[0_0_25px_rgba(6,182,212,0.15)] bg-slate-950">
      
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Floating Bottom Left Layers Toggle Button & Menu */}
      <div className="absolute bottom-4 left-4 z-20">
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className="p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-white/20 backdrop-blur-xl text-white shadow-2xl transition-all flex items-center justify-center hover:scale-105 active:scale-95"
          title="Map Layers & Overlays"
        >
          <Layers className="w-5 h-5 text-slate-200" />
        </button>

        {showLayerMenu && (
          <div className="absolute bottom-14 left-0 w-56 p-2 rounded-2xl bg-slate-950/95 border border-white/20 backdrop-blur-2xl shadow-2xl space-y-1 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">
              Base Map Layers
            </div>
            {MAP_LAYERS.map((layer) => (
              <button
                key={layer.id}
                onClick={() => {
                  setSelectedBaseLayer(layer.id);
                  setShowLayerMenu(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-all ${
                  selectedBaseLayer === layer.id
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span>{layer.name}</span>
                {selectedBaseLayer === layer.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
            ))}

            <div className="pt-2 border-t border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">
              Live GIS Radar Overlays
            </div>

            <button
              onClick={() => setShowRadarOverlay(!showRadarOverlay)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-all ${
                showRadarOverlay ? 'text-cyan-300 font-medium' : 'text-slate-400'
              }`}
            >
              <span>Doppler Precipitation</span>
              <div className={`w-3 h-3 rounded-full border ${showRadarOverlay ? 'bg-cyan-500 border-cyan-400' : 'border-slate-600'}`} />
            </button>

            <button
              onClick={onOpenRadarModal}
              className="w-full text-center py-1.5 mt-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold transition-all"
            >
              Open Full GIS Radar View
            </button>
          </div>
        )}
      </div>

      {/* Bottom Weather Condition Heading - Dynamically updates according to weather */}
      <div className="absolute bottom-4 right-4 sm:right-6 z-10 pointer-events-none">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] font-['Outfit']">
          {conditionText}
        </h2>
      </div>

    </div>
  );
}
