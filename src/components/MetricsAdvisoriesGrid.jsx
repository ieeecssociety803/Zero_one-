import React, { useState } from 'react';
import { ChevronRight, Sprout, Plane, Compass, AlertTriangle, ChevronDown } from 'lucide-react';

export default function MetricsAdvisoriesGrid({ weatherData, onOpenAdvisoriesModal, onQuickQuery }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!weatherData || !weatherData.current) return null;

  const current = weatherData.current;
  const aqi = weatherData.aqi || {};
  const agri = weatherData.agriculture || {};

  // Metrics array matching the 3x3 layout in user's design
  const metrics = [
    {
      value: aqi.us_aqi || 76,
      label: 'Air quality',
      status: aqi.category || 'Moderate',
      statusColor: aqi.us_aqi > 150 ? 'bg-red-500/20 text-red-400 border-red-500/30' : aqi.us_aqi > 50 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    },
    {
      value: `${agri.soil_moisture || 33}%`,
      label: 'Soil Moist',
      status: parseFloat(agri.soil_moisture || 33) > 30 ? 'Good' : 'Dry',
      statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    },
    {
      value: current.wind_speed || 76,
      label: 'Wind velocity',
      status: current.wind_speed > 35 ? 'Squally' : 'Normal',
      statusColor: current.wind_speed > 35 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-slate-700/50 text-slate-300 border-white/10'
    },
    {
      value: `${current.humidity || 65}%`,
      label: 'Humidity',
      status: current.humidity > 80 ? 'High' : 'Normal',
      statusColor: current.humidity > 80 ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-slate-700/50 text-slate-300 border-white/10'
    },
    {
      value: current.pressure || 1012,
      label: 'Pressure (hPa)',
      status: 'Stable',
      statusColor: 'bg-slate-700/50 text-slate-300 border-white/10'
    },
    {
      value: weatherData.daily?.[0]?.uvMax || 7.5,
      label: 'UV Index',
      status: (weatherData.daily?.[0]?.uvMax || 7.5) > 8 ? 'Very High' : 'Moderate',
      statusColor: (weatherData.daily?.[0]?.uvMax || 7.5) > 8 ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      value: `${current.dew_point || 21}°C`,
      label: 'Dew Point',
      status: 'Optimal',
      statusColor: 'bg-slate-700/50 text-slate-300 border-white/10'
    },
    {
      value: `${agri.evapotranspiration_rate || 4.2}mm`,
      label: 'Evapotranspiration',
      status: 'Normal',
      statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    },
    {
      value: aqi.pm2_5 || 34.2,
      label: 'PM2.5 (µg/m³)',
      status: (aqi.pm2_5 || 34.2) > 35 ? 'Unhealthy' : 'Moderate',
      statusColor: (aqi.pm2_5 || 34.2) > 35 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    }
  ];

  return (
    <div className="flex flex-col gap-3">
      
      {/* 3x3 Minimalist Metrics Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {metrics.map((item, idx) => (
          <div
            key={idx}
            className="p-3 sm:p-3.5 rounded-2xl bg-[#111622]/90 border border-white/10 hover:border-white/20 transition-all flex flex-col items-center justify-center text-center shadow-md"
          >
            <span className="text-xl sm:text-2xl font-black text-white font-['Outfit'] tracking-tight">
              {item.value}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5 whitespace-nowrap">
              {item.label}
            </span>
            <span className={`mt-1.5 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.statusColor}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>

      {/* Advisories Expandable Card */}
      <div 
        className="p-4 rounded-2xl bg-[#111622]/90 border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer shadow-lg group"
        onClick={() => onOpenAdvisoriesModal()}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit'] mb-1.5 flex items-center gap-2">
              Advisories
            </h3>
            
            {/* 2-Column Sector List */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Kisan Agri
              </span>
              <span className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                Marine & coastal safety
              </span>
              <span className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                Aviation
              </span>
              <span className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                Disaster warning
              </span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-white/5 group-hover:bg-cyan-500/20 text-slate-400 group-hover:text-cyan-300 transition-all shrink-0 ml-2">
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

    </div>
  );
}
