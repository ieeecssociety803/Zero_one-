import React, { useEffect, useRef, useState } from 'react';
import { Layers, Check, Compass, Radio, Wind, AlertTriangle, Sun, Cloud, CloudSun, CloudRain, CloudLightning, CloudFog } from 'lucide-react';
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
    url: 'https://{s}.tile.openstreetmap.org/{z}/{y}.png',
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
  const [selectedBaseLayer, setSelectedBaseLayer] = useState('satellite'); // DEFAULT SATELLITE
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showRadarOverlay, setShowRadarOverlay] = useState(true);

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

      // Base tile layer (Default Satellite)
      const baseLayer = L.tileLayer(
        MAP_LAYERS.find(l => l.id === 'satellite').url,
        { maxZoom: 18 }
      ).addTo(map);

      mapInstanceRef.current = { map, baseLayer, radarLayer: null };
    }
  }, []);

  // Update Base Layer
  useEffect(() => {
    if (mapInstanceRef.current) {
      const { map, baseLayer } = mapInstanceRef.current;
      if (baseLayer) {
        map.removeLayer(baseLayer);
      }
      const newLayerDef = MAP_LAYERS.find(l => l.id === selectedBaseLayer) || MAP_LAYERS[0];
      const newLayer = L.tileLayer(newLayerDef.url, { maxZoom: 18 }).addTo(map);
      mapInstanceRef.current.baseLayer = newLayer;
    }
  }, [selectedBaseLayer]);

  // Update Pin Marker & Fly-To when activeLocation or weatherData changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const { map } = mapInstanceRef.current;

    const lat = activeLocation.lat || 9.9312;
    const lon = activeLocation.lon || 76.2673;
    const temp = weatherData?.current?.temperature !== undefined ? `${Math.round(weatherData.current.temperature)}° C` : '27° C';

    // Smooth fly to location
    map.flyTo([lat, lon], 8, { duration: 1.5 });

    // Remove previous marker
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    // Custom Dark floating pill popup with mini gradient bar
    const customIcon = L.divIcon({
      className: 'custom-weather-pin',
      html: `
        <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-full cursor-pointer transition-transform hover:scale-110">
          <div class="px-3 py-1.5 rounded-2xl bg-[#090d16]/95 text-white text-xs font-black shadow-2xl border border-white/20 backdrop-blur-md flex flex-col items-center gap-0.5">
            <span class="tracking-tight text-sm font-['Outfit']">${temp}</span>
            <div class="w-7 h-1 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500"></div>
          </div>
          <div class="w-2 h-2 rotate-45 bg-[#090d16] border-r border-b border-white/20 -mt-1 shadow-sm"></div>
        </div>
      `,
      iconSize: [60, 40],
      iconAnchor: [30, 40]
    });

    const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
    markerRef.current = marker;

  }, [activeLocation, weatherData]);

  // Get dynamic weather condition icon & emoji
  const conditionText = weatherData?.current?.condition || 'Mainly Clear';
  
  const getWeatherVisual = (cond) => {
    const c = cond.toLowerCase();
    if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
      return { emoji: '🌧️', icon: <CloudRain className="w-6 h-6 text-blue-400 shrink-0" /> };
    }
    if (c.includes('thunder') || c.includes('storm') || c.includes('lightning')) {
      return { emoji: '⛈️', icon: <CloudLightning className="w-6 h-6 text-amber-400 shrink-0" /> };
    }
    if (c.includes('fog') || c.includes('mist')) {
      return { emoji: '🌫️', icon: <CloudFog className="w-6 h-6 text-slate-300 shrink-0" /> };
    }
    if (c.includes('overcast')) {
      return { emoji: '☁️', icon: <Cloud className="w-6 h-6 text-slate-300 shrink-0" /> };
    }
    if (c.includes('partly') || c.includes('cloud')) {
      return { emoji: '⛅', icon: <CloudSun className="w-6 h-6 text-amber-300 shrink-0" /> };
    }
    return { emoji: '☀️', icon: <Sun className="w-6 h-6 text-amber-400 shrink-0" /> };
  };

  const visual = getWeatherVisual(conditionText);

  return (
    <div className="relative w-full h-[380px] sm:h-[420px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group bg-[#070b14]">
      
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Smooth Dark Gradient Shadow from Bottom Stretching Up */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#070b14] via-[#070b14]/75 to-transparent z-10 pointer-events-none" />

      {/* Content Positioned Above the Bottom Gradient Shadow */}
      <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between pointer-events-auto">
        
        {/* Floating Bottom Left Layers Toggle Button & Menu */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="p-3 rounded-2xl bg-[#0e1322]/90 hover:bg-[#151c30] border border-white/20 backdrop-blur-xl text-white shadow-2xl transition-all flex items-center justify-center hover:scale-105 active:scale-95"
            title="Map Layers & Satellite Switcher"
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

              <button
                onClick={onOpenRadarModal}
                className="w-full text-center py-1.5 mt-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold transition-all"
              >
                Open Full GIS Radar View
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Weather Condition with Clean Graphic Icon & Emoji */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center">
            {visual.icon}
          </div>

          <div className="flex items-center gap-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Outfit']">
              {conditionText}
            </h2>
            <span className="text-xl">{visual.emoji}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
