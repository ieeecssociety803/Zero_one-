import React from 'react';
import { ChevronRight, HelpCircle } from 'lucide-react';

export default function MetricsAdvisoriesGrid({
  weatherData,
  onOpenAdvisoriesModal,
  onQuickQuery,
  accessibilityMode = 'standard'
}) {
  const c = weatherData?.current || {};
  const aqi = weatherData?.aqi || {};

  const airQuality = aqi.us_aqi || 76;
  const aqiCategory = aqi.category || 'Unhealthy';
  const soilMoist = c.soil_moisture_surface !== undefined ? `${(c.soil_moisture_surface * 100).toFixed(0)}%` : '33%';
  const windSpeed = c.wind_speed !== undefined ? `${Math.round(c.wind_speed)}` : '76';
  const humidity = c.humidity !== undefined ? `${Math.round(c.humidity)}%` : '76%';
  const pressure = c.surface_pressure !== undefined ? `${Math.round(c.surface_pressure)}` : '1012';
  const uvIndex = c.uv_index !== undefined ? `${Number(c.uv_index).toFixed(0)}` : '7';
  const dewPoint = c.dew_point !== undefined ? `${Math.round(c.dew_point)}°` : '22°';
  const et0 = c.evapotranspiration !== undefined ? `${c.evapotranspiration.toFixed(1)}` : '3.8';
  const pm25 = aqi.pm2_5 !== undefined ? `${Math.round(aqi.pm2_5)}` : '76';

  const cards = [
    { 
      val: `${airQuality}`, 
      label: 'Air quality', 
      tag: aqiCategory === 'Good' ? 'Good' : 'Unhealthy', 
      tagColor: aqiCategory === 'Good' ? 'bg-emerald-600/80 text-emerald-100' : 'bg-red-800/80 text-red-100',
      tooltip: 'Air Quality Index (AQI): Overall cleanliness of air. Values under 50 are clean; above 100 can irritate lungs.'
    },
    { 
      val: soilMoist, 
      label: 'Soil Moist', 
      tag: 'Good', 
      tagColor: 'bg-emerald-600/80 text-emerald-100',
      tooltip: 'Soil Moisture: Water percentage in 0-3cm topsoil. 30-50% is optimal for crop growth.'
    },
    { 
      val: windSpeed, 
      label: 'Wind velocity', 
      tag: null,
      tooltip: 'Wind Velocity: Speed of wind at 10m height measured in km/h.'
    },
    { 
      val: humidity, 
      label: 'Humidity', 
      tag: 'Unhealthy', 
      tagColor: 'bg-red-800/80 text-red-100',
      tooltip: 'Relative Humidity (%): Moisture in the air. High humidity (>80%) makes it feel warmer and promotes sweat.'
    },
    { 
      val: `${pressure}`, 
      label: 'Pressure MSL', 
      tag: 'Unhealthy', 
      tagColor: 'bg-red-800/80 text-red-100',
      tooltip: 'Atmospheric Pressure at Sea Level: Low pressure brings clouds & storms; high pressure brings sunny skies.'
    },
    { 
      val: uvIndex, 
      label: 'UV Index', 
      tag: 'Unhealthy', 
      tagColor: 'bg-red-800/80 text-red-100',
      tooltip: 'Ultraviolet Index: Strength of sun rays. 0-2 low, 3-5 moderate, 6-7 high (wear sunscreen).'
    },
    { 
      val: dewPoint, 
      label: 'Dew Point', 
      tag: 'Unhealthy', 
      tagColor: 'bg-red-800/80 text-red-100',
      tooltip: 'Dew Point Temperature: The temperature at which air saturates and dew, fog, or condensation forms.'
    },
    { 
      val: et0, 
      label: 'Evapotransp.', 
      tag: 'Unhealthy', 
      tagColor: 'bg-red-800/80 text-red-100',
      tooltip: 'Evapotranspiration (ET₀): Daily water lost from soil evaporation and plant sweating (mm/day). High values mean plants need water.'
    },
    { 
      val: `${pm25}`, 
      label: 'PM 2.5', 
      tag: 'Unhealthy', 
      tagColor: 'bg-red-800/80 text-red-100',
      tooltip: 'PM2.5: Microscopic dust/smoke particles under 2.5 microns that can enter lungs.'
    },
  ];

  return (
    <div className="flex flex-col justify-between h-full space-y-3 select-none">
      
      {/* 3x3 Minimalist Metric Blocks matching reference screenshot with hover tooltips */}
      <div className="grid grid-cols-3 gap-2.5">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="group relative p-3 rounded-2xl bg-[#161c28] border border-white/5 flex flex-col items-center justify-center text-center shadow-md min-h-[85px] hover:border-cyan-500/30 transition-all cursor-help"
          >
            {/* Tooltip Popup on Hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-xl bg-[#090d16] border border-cyan-500/40 text-[10px] text-slate-200 shadow-2xl backdrop-blur-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 text-center">
              {card.tooltip}
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] tracking-tight">
              {card.val}
            </div>
            
            <div className="text-[11px] text-slate-300 font-semibold mt-0.5">
              {card.label}
            </div>

            {card.tag && (
              <div className={`mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${card.tagColor}`}>
                {card.tag}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Advisories Box matching reference screenshot */}
      <div 
        onClick={onOpenAdvisoriesModal}
        className="p-4 rounded-2xl bg-[#161c28] border border-white/5 shadow-md flex items-center justify-between cursor-pointer hover:border-cyan-500/40 hover:bg-[#1a2232] transition-all"
      >
        <div className="space-y-2 flex-1">
          <div className="text-sm font-bold text-white font-['Outfit']">
            Advisories
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-300 font-medium">
            <div className="hover:text-cyan-300" onClick={(e) => { e.stopPropagation(); onQuickQuery?.('Kisan Agri and crop spraying advisory'); }}>
              Kisan Agri
            </div>
            <div className="hover:text-cyan-300" onClick={(e) => { e.stopPropagation(); onQuickQuery?.('Marine and coastal safety status'); }}>
              Marine & coastal safety
            </div>
            <div className="hover:text-cyan-300" onClick={(e) => { e.stopPropagation(); onQuickQuery?.('Aviation METAR briefing'); }}>
              Aviation
            </div>
            <div className="hover:text-cyan-300" onClick={(e) => { e.stopPropagation(); onQuickQuery?.('Disaster early warning alerts'); }}>
              Disaster warning
            </div>
          </div>
        </div>

        <div className="pl-3">
          <div className="p-2 rounded-xl text-slate-300 hover:text-white transition-colors">
            <ChevronRight className="w-6 h-6 text-slate-400" />
          </div>
        </div>
      </div>

    </div>
  );
}
