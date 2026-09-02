import React from 'react';
import { CloudRain, Droplets, Wind, Sun, CloudSun, Cloud, Snowflake, CloudLightning } from 'lucide-react';

const ICON_MAP = {
  Sun: Sun,
  SunMedium: Sun,
  CloudSun: CloudSun,
  Cloud: Cloud,
  CloudRain: CloudRain,
  CloudRainWind: CloudRain,
  CloudLightning: CloudLightning,
  Snowflake: Snowflake
};

export default function HourlyTimeline({ hourlyData = [] }) {
  if (!hourlyData || hourlyData.length === 0) return null;

  return (
    <div className="w-full glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          24-Hour Synoptic Progression
        </h3>
        <span className="text-[11px] text-slate-400">Hourly Surface Ingestion</span>
      </div>

      {/* Horizontal Scroll Track */}
      <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin">
        {hourlyData.slice(0, 24).map((hour, idx) => {
          const Icon = ICON_MAP[hour.codeInfo.icon] || CloudSun;
          const isNow = idx === 0;

          return (
            <div
              key={idx}
              className={`flex-shrink-0 w-24 p-3 rounded-2xl flex flex-col items-center text-center transition-all ${
                isNow
                  ? 'bg-cyan-500/20 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/40 border border-white/5 hover:bg-slate-800/60'
              }`}
            >
              <span className={`text-xs font-semibold ${isNow ? 'text-cyan-300' : 'text-slate-300'}`}>
                {isNow ? 'Now' : hour.hour}
              </span>

              <div className="my-2.5">
                <Icon className={`w-7 h-7 ${isNow ? 'text-cyan-300' : 'text-slate-300'}`} />
              </div>

              <span className="text-base font-bold text-white font-['Outfit']">
                {hour.temp}°
              </span>

              {/* Rain Probability / Precipitation */}
              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-cyan-400 font-medium">
                <Droplets className="w-3 h-3" />
                <span>{hour.precip_prob}%</span>
              </div>

              {/* Wind */}
              <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                <Wind className="w-2.5 h-2.5" />
                <span>{hour.wind_speed}k</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
