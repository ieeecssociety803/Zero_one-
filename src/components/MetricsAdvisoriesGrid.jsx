import React, { useState } from 'react';
import { 
  Wind, Droplets, Gauge, Sun, Compass, Sprout, 
  Plane, ChevronRight, Activity, ShieldAlert, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';

export default function MetricsAdvisoriesGrid({
  weatherData,
  onOpenAdvisoriesModal,
  onQuickQuery,
  accessibilityMode = 'standard'
}) {
  const [isAdvisoryExpanded, setIsAdvisoryExpanded] = useState(false);

  const c = weatherData?.current || {};
  const aqi = weatherData?.aqi || {};

  // Extract or fallback metrics with clean formatting
  const airQuality = aqi.us_aqi || 57;
  const aqiStatus = aqi.category || 'Moderate';
  const soilMoist = c.soil_moisture_surface !== undefined ? `${(c.soil_moisture_surface * 100).toFixed(0)}%` : '38%';
  const windSpeed = c.wind_speed !== undefined ? `${Math.round(c.wind_speed)} km/h` : '12 km/h';
  const windDir = c.wind_direction !== undefined ? `${c.wind_direction}°` : 'NW';
  const humidity = c.humidity !== undefined ? `${Math.round(c.humidity)}%` : '68%';
  const pressure = c.surface_pressure !== undefined ? `${Math.round(c.surface_pressure)} hPa` : '1012 hPa';
  const uvIndex = c.uv_index !== undefined ? Number(c.uv_index).toFixed(1) : '4.5';
  const dewPoint = c.dew_point !== undefined ? `${Math.round(c.dew_point)}°` : '22°';
  const et0 = c.evapotranspiration !== undefined ? `${c.evapotranspiration.toFixed(1)} mm` : '3.8 mm';
  const pm25 = aqi.pm2_5 !== undefined ? `${aqi.pm2_5.toFixed(1)}` : '18.4';

  const metrics = [
    { label: 'Air Quality', val: `${airQuality}`, sub: aqiStatus, color: 'text-emerald-400', badge: 'AQI' },
    { label: 'Soil Moisture', val: soilMoist, sub: 'Optimal', color: 'text-cyan-400', badge: '0-3cm' },
    { label: 'Wind Velocity', val: windSpeed, sub: windDir, color: 'text-blue-400', badge: '10m' },
    { label: 'Humidity', val: humidity, sub: 'Normal', color: 'text-sky-300', badge: 'RH' },
    { label: 'Pressure', val: pressure, sub: 'Stable', color: 'text-indigo-400', badge: 'MSL' },
    { label: 'UV Index', val: uvIndex, sub: 'Moderate', color: 'text-amber-400', badge: 'UV' },
    { label: 'Dew Point', val: dewPoint, sub: 'Comfort', color: 'text-teal-400', badge: 'Td' },
    { label: 'Evapotranspiration', val: et0, sub: 'Daily ET₀', color: 'text-emerald-400', badge: 'ET₀' },
    { label: 'PM 2.5', val: `${pm25}`, sub: 'µg/m³', color: 'text-purple-400', badge: 'Fine' },
  ];

  return (
    <div className="flex flex-col justify-between h-full space-y-4">
      
      {/* 3x3 Minimalist Metrics Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="group relative p-3 rounded-2xl bg-[#0e131f]/90 border border-white/10 hover:border-cyan-500/40 hover:bg-[#131b2e] transition-all flex flex-col justify-between shadow-sm cursor-default"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-medium text-slate-400 truncate group-hover:text-slate-200 transition-colors">
                {m.label}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 shrink-0">
                {m.badge}
              </span>
            </div>

            <div className="my-1">
              <span className={`text-lg sm:text-xl font-bold tracking-tight ${m.color}`}>
                {m.val}
              </span>
            </div>

            <div className="text-[10px] text-slate-400 font-medium truncate">
              {m.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Expandable Advisories Card */}
      <div className="p-3.5 rounded-2xl bg-[#0e131f]/95 border border-white/10 shadow-md">
        
        <div 
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setIsAdvisoryExpanded(!isAdvisoryExpanded)}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white font-['Outfit']">
              Advisories
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30">
              4 Active
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenAdvisoriesModal();
              }}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
            >
              <span>Full View</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="p-1 rounded-lg hover:bg-white/10 text-slate-400">
              {isAdvisoryExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Advisory List Items */}
        <div className="mt-3 space-y-1.5">
          
          <div 
            onClick={() => onQuickQuery?.('Give me Kisan crop and spraying advisory')}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-white/5 hover:border-emerald-500/30 text-xs text-slate-200 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">Kisan Agri & Crop Spraying</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">Suitable Window</span>
          </div>

          <div 
            onClick={() => onQuickQuery?.('What is the marine and coastal safety status?')}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-white/5 hover:border-blue-500/30 text-xs text-slate-200 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="font-medium">Marine & Coastal Safety</span>
            </div>
            <span className="text-[10px] text-blue-400 font-semibold">Moderate Swell</span>
          </div>

          <div 
            onClick={() => onQuickQuery?.('Aviation METAR briefing for nearest airport')}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-white/5 hover:border-purple-500/30 text-xs text-slate-200 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="font-medium">Aviation METAR Briefing</span>
            </div>
            <span className="text-[10px] text-purple-400 font-semibold">VFR Normal</span>
          </div>

          {/* Expanded detailed drawer */}
          {isAdvisoryExpanded && (
            <div className="pt-2 mt-2 border-t border-white/10 space-y-2 animate-in fade-in duration-200">
              <div 
                onClick={() => onQuickQuery?.('Are there any active disaster or cyclone warnings?')}
                className="flex items-center justify-between p-2 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-200 cursor-pointer hover:bg-red-950/50 transition-all"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="font-medium">Disaster Early Warning (CAP)</span>
                </div>
                <span className="text-[10px] text-red-400 font-semibold">Watch Active</span>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
