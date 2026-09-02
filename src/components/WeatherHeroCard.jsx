import React from 'react';
import { 
  Sun, SunMedium, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, 
  CloudLightning, Snowflake, Wind, Droplets, Compass, Gauge, 
  Eye, Sprout, Plane, ShieldAlert, Sparkles, TrendingUp
} from 'lucide-react';

const ICON_MAP = {
  Sun: Sun,
  SunMedium: SunMedium,
  CloudSun: CloudSun,
  Cloud: Cloud,
  CloudFog: CloudFog,
  CloudDrizzle: CloudDrizzle,
  CloudRain: CloudRain,
  CloudRainWind: CloudRain,
  CloudLightning: CloudLightning,
  Snowflake: Snowflake
};

export default function WeatherHeroCard({ 
  weatherData, 
  onQuickQuery,
  onOpenRadar,
  onOpenNWP,
  onOpenSectors,
  onOpenClimate 
}) {
  if (!weatherData || !weatherData.current) return null;

  const current = weatherData.current;
  const IconComponent = ICON_MAP[current.icon] || CloudSun;
  const aqi = weatherData.aqi;
  const agri = weatherData.agriculture;

  return (
    <div className="relative w-full rounded-3xl p-6 sm:p-8 glass-panel border border-white/10 overflow-hidden shadow-2xl">
      
      {/* Background glow according to condition */}
      <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gradient-to-br ${current.gradient} opacity-20 blur-3xl pointer-events-none`} />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Main Temperature & Condition Summary */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Live Synoptic Observation
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Elevation: {weatherData.elevation}m
            </span>
          </div>

          <div className="flex items-baseline gap-4 mt-1">
            <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight text-white font-['Outfit']">
              {current.temperature}°<span className="text-3xl sm:text-4xl text-slate-400 font-normal">C</span>
            </h1>
            <div className="space-y-0.5">
              <p className="text-lg sm:text-xl font-semibold text-slate-100 flex items-center gap-2">
                {current.condition}
              </p>
              <p className="text-xs sm:text-sm text-slate-400">
                Feels like <span className="text-slate-200 font-medium">{current.apparent_temperature}°C</span> • Dew Point <span className="text-slate-200 font-medium">{current.dew_point}°C</span>
              </p>
            </div>
          </div>

          {/* AQI & Disaster Status Pill */}
          <div className="flex flex-wrap items-center gap-2.5 mt-4">
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium backdrop-blur-md"
              style={{ backgroundColor: `${aqi.color}15`, borderColor: `${aqi.color}40`, color: aqi.color }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: aqi.color }}></span>
              <span>Air Quality: <strong>AQI {aqi.us_aqi}</strong> ({aqi.category})</span>
              <span className="text-[10px] opacity-75">PM2.5: {aqi.pm2_5}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-white/10 text-xs font-medium text-slate-300">
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
              <span>Soil Moisture: <strong className="text-emerald-300">{agri?.soil_moisture || 32}%</strong></span>
            </div>
          </div>
        </div>

        {/* Dynamic Animated Icon Hero Graphic */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm self-center lg:self-auto">
          <div className="relative">
            <IconComponent className="w-20 h-20 sm:w-24 sm:h-24 text-cyan-300 drop-shadow-[0_0_25px_rgba(56,189,248,0.5)] animate-float" />
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-2">WMO Code: {current.weather_code}</span>
        </div>

      </div>

      {/* Atmospheric Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/10">
        
        {/* Humidity */}
        <div className="p-3 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Humidity</div>
            <div className="text-sm sm:text-base font-bold text-white">{current.humidity}%</div>
          </div>
        </div>

        {/* Wind Vector */}
        <div className="p-3 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Wind Velocity</div>
            <div className="text-sm sm:text-base font-bold text-white">
              {current.wind_speed} <span className="text-xs font-normal text-slate-400">km/h</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Dir {current.wind_direction}°</div>
          </div>
        </div>

        {/* Pressure */}
        <div className="p-3 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Pressure MSL</div>
            <div className="text-sm sm:text-base font-bold text-white">
              {current.pressure} <span className="text-xs font-normal text-slate-400">hPa</span>
            </div>
          </div>
        </div>

        {/* Cloud Cover */}
        <div className="p-3 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-500/10 text-slate-300">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Cloud Cover</div>
            <div className="text-sm sm:text-base font-bold text-white">{current.cloud_cover}%</div>
          </div>
        </div>

        {/* UV Index */}
        <div className="p-3 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Max UV Index</div>
            <div className="text-sm sm:text-base font-bold text-amber-300">
              {weatherData.daily?.[0]?.uvMax || 7.5}
            </div>
          </div>
        </div>

        {/* Evapotranspiration */}
        <div className="p-3 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Sprout className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">ET₀ Rate</div>
            <div className="text-sm sm:text-base font-bold text-emerald-300">
              {agri?.evapotranspiration_rate || 4.5} <span className="text-xs font-normal text-slate-400">mm</span>
            </div>
          </div>
        </div>

      </div>

      {/* Domain Sector Shortcuts Bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-white/5">
        <span className="text-xs text-slate-400 font-medium">Domain Intelligence Portals:</span>
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            onClick={() => onQuickQuery("What is the agricultural Kisan advisory for crops in my area?")}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Kisan Advisory</span>
          </button>

          <button
            onClick={() => onQuickQuery("Show aviation METAR briefing and crosswind calculations for the nearest airport")}
            className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Aviation METAR</span>
          </button>

          <button
            onClick={() => onQuickQuery("What is the marine and sea state condition for fishermen today?")}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Marine Safety</span>
          </button>

          <button
            onClick={onOpenNWP}
            className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>NWP Ensemble</span>
          </button>

          <button
            onClick={onOpenClimate}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Climate Trends</span>
          </button>

        </div>
      </div>

    </div>
  );
}
