import React from 'react';
import { CloudRain, Sun, CloudSun, Cloud, Snowflake, CloudLightning, Calendar, Droplets } from 'lucide-react';

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

export default function DailyForecastList({ dailyData = [] }) {
  if (!dailyData || dailyData.length === 0) return null;

  return (
    <div className="w-full glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          7-Day Synoptic Outlook
        </h3>
        <span className="text-[11px] text-slate-400">Deterministic Ensemble</span>
      </div>

      <div className="space-y-2.5">
        {dailyData.slice(0, 7).map((day, idx) => {
          const Icon = ICON_MAP[day.codeInfo.icon] || CloudSun;
          const isToday = idx === 0;

          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                isToday
                  ? 'bg-slate-800/80 border-cyan-500/30'
                  : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/50'
              }`}
            >
              {/* Day name & Date */}
              <div className="w-24 sm:w-28">
                <div className={`text-xs sm:text-sm font-semibold ${isToday ? 'text-cyan-300' : 'text-slate-200'}`}>
                  {day.dayName}
                </div>
                <div className="text-[10px] text-slate-400">{day.date}</div>
              </div>

              {/* Weather Condition & Icon */}
              <div className="flex items-center gap-2 flex-1 px-2">
                <Icon className="w-5 h-5 text-cyan-400 shrink-0" />
                <span className="text-xs text-slate-300 font-medium truncate hidden sm:inline">
                  {day.codeInfo.label}
                </span>
              </div>

              {/* Rain Probability */}
              <div className="flex items-center gap-1 w-16 text-right justify-end text-xs text-cyan-400 font-medium">
                {day.precipProb > 0 ? (
                  <>
                    <Droplets className="w-3.5 h-3.5 shrink-0" />
                    <span>{day.precipProb}%</span>
                  </>
                ) : (
                  <span className="text-slate-500 text-[11px]">—</span>
                )}
              </div>

              {/* Temperature Bar Range */}
              <div className="flex items-center gap-2 w-28 sm:w-32 justify-end font-['Outfit']">
                <span className="text-xs text-slate-400">{day.tempMin}°</span>
                <div className="w-14 sm:w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-amber-400 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(20, (day.tempMax - day.tempMin) * 8))}%` }}
                  />
                </div>
                <span className="text-xs sm:text-sm font-bold text-white">{day.tempMax}°</span>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
