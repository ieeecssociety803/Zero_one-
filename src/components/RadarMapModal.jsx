import React, { useEffect, useRef, useState } from 'react';
import { X, Layers, Play, Pause, AlertTriangle, Radio, Navigation, Wind, RefreshCw } from 'lucide-react';
import L from 'leaflet';

const RADAR_STATIONS = [
  { name: 'DWR Delhi (Palam)', lat: 28.5833, lon: 77.0833, rangeKm: 250, type: 'S-Band' },
  { name: 'DWR Mumbai (Colaba)', lat: 18.8950, lon: 72.8150, rangeKm: 250, type: 'S-Band' },
  { name: 'DWR Kolkata', lat: 22.5333, lon: 88.3500, rangeKm: 250, type: 'S-Band' },
  { name: 'DWR Chennai', lat: 13.0800, lon: 80.2900, rangeKm: 250, type: 'S-Band' },
  { name: 'DWR Visakhapatnam (Kailasagiri)', lat: 17.7400, lon: 83.3400, rangeKm: 250, type: 'S-Band' },
  { name: 'DWR Paradip', lat: 20.3000, lon: 86.6000, rangeKm: 250, type: 'S-Band' },
  { name: 'DWR Gopalpur', lat: 19.2600, lon: 84.9100, rangeKm: 250, type: 'S-Band' },
  { name: 'DWR Kochi', lat: 9.9400, lon: 76.2600, rangeKm: 250, type: 'C-Band' }
];

const CYCLONE_VARUNA_TRACK = [
  { lat: 14.5, lon: 86.8, time: '-24h (Deep Depression)', windKmph: 65, pressure: 998 },
  { lat: 16.2, lon: 85.5, time: '-12h (Cyclonic Storm)', windKmph: 85, pressure: 990 },
  { lat: 17.8, lon: 84.6, time: 'Current Eye Position', windKmph: 115, pressure: 978 },
  { lat: 19.4, lon: 84.8, time: '+12h Landfall Forecast (Puri-Gopalpur)', windKmph: 125, pressure: 972 },
  { lat: 21.0, lon: 85.3, time: '+24h Inland Dissipation', windKmph: 70, pressure: 992 }
];

export default function RadarMapModal({ isOpen, onClose, activeLocation }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [radarPlaying, setRadarPlaying] = useState(true);
  const [activeLayer, setActiveLayer] = useState('radar'); // 'radar', 'satellite', 'wind'
  const [showCycloneTrack, setShowCycloneTrack] = useState(true);
  const [showDWRStations, setShowDWRStations] = useState(true);

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet Map
      const map = L.map(mapContainerRef.current, {
        center: [activeLocation.lat || 20.5937, activeLocation.lon || 78.9629],
        zoom: 6,
        zoomControl: true,
        attributionControl: false
      });

      // CartoDB Dark Matter Base Tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      // RainViewer Live Doppler Radar Layer
      const radarLayer = L.tileLayer('https://tilecache.rainviewer.com/v2/radar/nowcast_0/256/{z}/{x}/{y}/2/1_1.png', {
        opacity: 0.65,
        maxZoom: 18
      }).addTo(map);

      mapInstanceRef.current = { map, radarLayer, overlays: [] };
    } else {
      mapInstanceRef.current.map.setView([activeLocation.lat, activeLocation.lon], 6);
    }

    // Clear previous overlays
    const { map, overlays } = mapInstanceRef.current;
    overlays.forEach(layer => map.removeLayer(layer));
    mapInstanceRef.current.overlays = [];

    // Add Cyclone VARUNA Track
    if (showCycloneTrack) {
      const latlngs = CYCLONE_VARUNA_TRACK.map(pt => [pt.lat, pt.lon]);
      
      // Track Polyline
      const trackLine = L.polyline(latlngs, {
        color: '#ef4444',
        weight: 3.5,
        dashArray: '6, 8',
        opacity: 0.9
      }).addTo(map);
      mapInstanceRef.current.overlays.push(trackLine);

      // Add Eye Marker
      const currentEye = CYCLONE_VARUNA_TRACK[2];
      const eyeCircle = L.circleMarker([currentEye.lat, currentEye.lon], {
        radius: 12,
        fillColor: '#ff0000',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map);

      eyeCircle.bindPopup(`
        <div style="font-family:sans-serif; color:#0f172a; padding:4px;">
          <h4 style="margin:0; font-weight:bold; color:#dc2626;">Cyclone VARUNA (Severe)</h4>
          <p style="margin:4px 0 2px; font-size:12px;"><strong>Wind:</strong> ${currentEye.windKmph} km/h (Gusts 135 km/h)</p>
          <p style="margin:2px 0; font-size:12px;"><strong>Central Pressure:</strong> ${currentEye.pressure} hPa</p>
          <p style="margin:2px 0; font-size:11px; color:#64748b;">${currentEye.time}</p>
        </div>
      `);
      mapInstanceRef.current.overlays.push(eyeCircle);

      // Gale Force Wind Radius
      const galeCircle = L.circle([currentEye.lat, currentEye.lon], {
        radius: 180000, // 180 km
        color: '#f97316',
        fillColor: '#f97316',
        fillOpacity: 0.15,
        weight: 1.5
      }).addTo(map);
      mapInstanceRef.current.overlays.push(galeCircle);
    }

    // Add DWR Doppler Radar Stations
    if (showDWRStations) {
      RADAR_STATIONS.forEach(st => {
        const marker = L.circleMarker([st.lat, st.lon], {
          radius: 6,
          fillColor: '#38bdf8',
          color: '#ffffff',
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: 0.8
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family:sans-serif; color:#0f172a; padding:2px;">
            <h4 style="margin:0; font-weight:bold; font-size:13px; color:#0284c7;">${st.name}</h4>
            <p style="margin:2px 0; font-size:11px;">Radar Band: ${st.type} (Range ${st.rangeKm} km)</p>
            <p style="margin:2px 0; font-size:10px; color:#16a34a;">● Live Doppler Surveillance Active</p>
          </div>
        `);
        mapInstanceRef.current.overlays.push(marker);
      });
    }

    // Add current user location pin
    const userPin = L.circleMarker([activeLocation.lat, activeLocation.lon], {
      radius: 8,
      fillColor: '#10b981',
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    }).addTo(map);
    userPin.bindPopup(`<b>${activeLocation.name}</b><br/>Selected Observation Point`);
    mapInstanceRef.current.overlays.push(userPin);

  }, [isOpen, activeLocation, showCycloneTrack, showDWRStations]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[88vh] glass-panel rounded-3xl border border-white/15 flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                Live Doppler Weather Radar & GIS Tracking Hub
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-semibold border border-red-500/30 animate-pulse">
                  CYCLONE TRACK LIVE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Multi-Sensor Ingestion (DWR, INSAT-3D, RainViewer Doppler & GFS/IMD Tracks)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Radar Controls Toolbar */}
        <div className="px-6 py-2.5 bg-slate-950/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCycloneTrack(!showCycloneTrack)}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                showCycloneTrack
                  ? 'bg-red-500/20 text-red-300 border-red-500/40 font-semibold'
                  : 'bg-slate-900 text-slate-400 border-white/5'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>Cyclone Track</span>
            </button>

            <button
              onClick={() => setShowDWRStations(!showDWRStations)}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                showDWRStations
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
                  : 'bg-slate-900 text-slate-400 border-white/5'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>DWR Stations</span>
            </button>
          </div>

          {/* dBZ Reflectivity Scale Legend */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Reflectivity (dBZ):</span>
            <div className="flex items-center rounded-md overflow-hidden h-2.5 w-32 border border-white/10">
              <div className="h-full w-1/5 bg-blue-500" title="10-20 dBZ (Light)"></div>
              <div className="h-full w-1/5 bg-green-500" title="20-35 dBZ (Moderate)"></div>
              <div className="h-full w-1/5 bg-yellow-500" title="35-45 dBZ (Heavy)"></div>
              <div className="h-full w-1/5 bg-orange-500" title="45-55 dBZ (Very Heavy)"></div>
              <div className="h-full w-1/5 bg-red-600" title="55+ dBZ (Hail/Severe)"></div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">10 to 65 dBZ</span>
          </div>

        </div>

        {/* Leaflet Map Canvas Container */}
        <div className="relative flex-1 w-full bg-slate-950">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
        </div>

        {/* Footer Alert Bar */}
        <div className="px-6 py-3 bg-slate-900/90 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span><strong>Active Advisory:</strong> Cyclone VARUNA 115 kmph, storm surge 1.5m, landfall near Puri-Gopalpur</span>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">WIS 2.0 Realtime GIS Sync</span>
        </div>

      </div>
    </div>
  );
}
