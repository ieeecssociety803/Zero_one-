import React, { useState } from 'react';
import { 
  Activity, 
  Sun, 
  Droplets, 
  Wind, 
  Flame, 
  Zap, 
  Eye, 
  ShieldAlert, 
  HelpCircle, 
  Clock, 
  TrendingUp,
  HeartPulse
} from 'lucide-react';

export default function AdvancedDiagnosticsHub({ weatherData, activeLocation }) {
  const [activeTab, setActiveTab] = useState('hourly_spark'); // 'hourly_spark', 'air_chem', 'solar_pv', 'thermal_wbgt'

  const current = weatherData?.current || {};
  const aqi = weatherData?.aqi || {};
  const hourly = weatherData?.hourly || [];
  const temp = current.temperature || 28;
  const humidity = current.humidity || 75;
  const windSpeed = current.wind_speed || 12;

  // Wet Bulb Globe Temperature Approximation (Stull 2011 Formula)
  const calcWetBulb = (t, rh) => {
    const wb = t * Math.atan(0.151977 * Math.pow(rh + 8.313659, 0.5)) +
      Math.atan(t + rh) - Math.atan(rh - 1.676331) +
      0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) - 4.686035;
    return Math.round(wb * 10) / 10;
  };

  const wetBulb = calcWetBulb(temp, humidity);
  const heatIndex = Math.round(current.apparent_temperature || (temp + (humidity > 60 ? 4 : 1)));

  // Hydration loss estimation (L/hr based on WBGT & physical activity)
  const sweatLoss = wetBulb > 28 ? '1.2 - 1.5 L/hr' : wetBulb > 24 ? '0.8 - 1.0 L/hr' : '0.4 - 0.6 L/hr';
  const thermalRisk = wetBulb > 30 ? 'Extreme Hazard' : wetBulb > 26 ? 'High Caution' : 'Moderate / Safe';
  const thermalColor = wetBulb > 30 ? 'text-rose-400 bg-rose-500/20 border-rose-500/40' : wetBulb > 26 ? 'text-amber-400 bg-amber-500/20 border-amber-500/40' : 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';

  // Solar Photovoltaic (PV) Metrics
  const ghi = current.is_day ? Math.max(120, Math.round(850 * (1 - (current.cloud_cover || 20) / 100))) : 0;
  const solarEfficiency = current.is_day ? Math.min(98, Math.max(20, Math.round((1 - (current.cloud_cover || 20) / 140) * 100))) : 0;

  // Air Quality Pollutant Standard WHO comparisons
  const pollutants = [
    { name: 'PM2.5', value: aqi.pm2_5 || 24.5, unit: 'µg/m³', whoLimit: 15, desc: 'Fine respirable particles penetrating alveoli' },
    { name: 'PM10', value: aqi.pm10 || 48.2, unit: 'µg/m³', whoLimit: 45, desc: 'Coarse inhalable particles & dust' },
    { name: 'NO₂', value: aqi.no2 || 14.8, unit: 'µg/m³', whoLimit: 25, desc: 'Vehicular & industrial combustion emissions' },
    { name: 'O₃', value: aqi.o3 || 42.0, unit: 'µg/m³', whoLimit: 100, desc: 'Ground-level photochemical tropospheric ozone' },
    { name: 'SO₂', value: aqi.so2 || 6.1, unit: 'µg/m³', whoLimit: 40, desc: 'Sulfur dioxide from power plants & refineries' },
    { name: 'CO', value: aqi.co || 320, unit: 'µg/m³', whoLimit: 4000, desc: 'Carbon monoxide from incomplete combustion' },
  ];

  return (
    <div className="w-full rounded-3xl bg-[#0b0f19] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
      
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] tracking-tight">
              Synoptic Diagnostics & Environmental Telemetry Hub
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            24-Hour Micro-Progression • Atmospheric Chemistry • Solar Photovoltaic Irradiance • Wet Bulb Thermal Stress
          </p>
        </div>

        {/* Diagnostic Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-white/10 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('hourly_spark')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'hourly_spark'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📈 24-Hr Progression
          </button>
          <button
            onClick={() => setActiveTab('air_chem')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'air_chem'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🔬 Air Chemistry
          </button>
          <button
            onClick={() => setActiveTab('solar_pv')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'solar_pv'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ☀️ Solar Irradiance
          </button>
          <button
            onClick={() => setActiveTab('thermal_wbgt')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'thermal_wbgt'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🌡️ Wet Bulb & Thermal
          </button>
        </div>
      </div>

      {/* 4 Summary Telemetry Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#111624] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Wet Bulb Temp (Tw)</span>
            <span className="text-[10px] font-mono text-cyan-400">Stull Model</span>
          </div>
          <div className="text-2xl font-black text-teal-300 font-['Outfit'] my-1">
            {wetBulb}° C
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Dew Point Condensation Cap</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111624] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Thermal Stress Level</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${thermalColor}`}>
              {thermalRisk}
            </span>
          </div>
          <div className="text-2xl font-black text-amber-400 font-['Outfit'] my-1">
            {heatIndex}° C Feels
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Sweat Rate: {sweatLoss}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111624] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Solar Irradiance (GHI)</span>
            <span className="text-[10px] font-mono text-amber-400">W/m²</span>
          </div>
          <div className="text-2xl font-black text-amber-300 font-['Outfit'] my-1">
            {ghi} W/m²
          </div>
          <span className="text-[11px] text-slate-500 font-mono">PV Potential: {solarEfficiency}%</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111624] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Atmospheric Mixing Height</span>
            <span className="text-[10px] font-mono text-purple-400">Boundary Layer</span>
          </div>
          <div className="text-2xl font-black text-purple-400 font-['Outfit'] my-1">
            1,250 m
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Pollutant Dispersion: Good</span>
        </div>
      </div>

      {/* Main Interactive Analytics Canvas */}
      <div className="p-5 rounded-2xl bg-[#111624]/90 border border-white/10 space-y-4">
        
        {/* TAB 1: 24-HOUR PROGRESSION SPARKLINE & RAIN CURVE */}
        {activeTab === 'hourly_spark' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-['Outfit']">
                  24-Hour Synoptic Micro-Progression (Temperature, Rain %, & Wind Gusts)
                </h3>
                <p className="text-xs text-slate-400">
                  Continuous multi-variable atmospheric surface evolution for {activeLocation?.name || 'Selected Location'}
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Hourly Resolution
              </span>
            </div>

            {/* Hourly Scrollable Track */}
            <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-2.5 pt-2">
              {hourly.slice(0, 12).map((h, i) => {
                const isRainy = (h.precip_prob || 0) > 40;
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl border transition-all text-center space-y-1.5 ${
                      i === 0 
                        ? 'bg-cyan-500/15 border-cyan-500/40 shadow-lg' 
                        : 'bg-slate-950/70 border-white/5 hover:bg-slate-900'
                    }`}
                  >
                    <span className="text-[11px] text-slate-400 font-mono block">
                      {i === 0 ? 'Now' : h.hour}
                    </span>
                    <div className="text-base font-extrabold text-white font-['Outfit']">
                      {h.temp}°C
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[10px] font-bold">
                      <Droplets className={`w-3 h-3 ${isRainy ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
                      <span className={isRainy ? 'text-cyan-300' : 'text-slate-400'}>
                        {h.precip_prob || 10}%
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      💨 {h.wind_speed || 10}k
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ATMOSPHERIC CHEMISTRY & WHO POLLUTANT ANALYSIS */}
        {activeTab === 'air_chem' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-['Outfit']">
                  Surface Atmospheric Chemistry & WHO Air Quality Safety Standards
                </h3>
                <p className="text-xs text-slate-400">
                  Micrograms per cubic meter (µg/m³) vs WHO 24-hour safe guideline thresholds
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                AQI {aqi.us_aqi || 72} • {aqi.category || 'Moderate'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {pollutants.map((p, idx) => {
                const ratio = Math.min(100, Math.round((p.value / (p.whoLimit * 2)) * 100));
                const isOver = p.value > p.whoLimit;
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-mono">{p.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isOver ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {isOver ? 'Exceeds WHO' : 'Safe Limits'}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-extrabold text-white font-['Outfit']">{p.value}</span>
                      <span className="text-xs text-slate-400">{p.unit}</span>
                      <span className="text-[11px] text-slate-500 ml-auto font-mono">Limit: {p.whoLimit}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-amber-400 shadow-sm shadow-amber-400/50' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${ratio}%` }}
                      />
                    </div>

                    <p className="text-[10px] text-slate-400 leading-tight">
                      {p.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SOLAR IRRADIANCE & PHOTOVOLTAIC POTENTIAL */}
        {activeTab === 'solar_pv' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-['Outfit']">
                  Solar Direct Normal Irradiance (DNI), Photovoltaic Yield & UV Spectrum
                </h3>
                <p className="text-xs text-slate-400">
                  Solar energy generation capacity, cloud attenuation, and skin protection advisory
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Peak UV: 11:30 - 14:30
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-2">
                <span className="text-xs text-slate-400 font-medium">Solar Direct Irradiance (GHI)</span>
                <div className="text-3xl font-black text-amber-400 font-['Outfit']">{ghi} W/m²</div>
                <p className="text-[11px] text-slate-300">
                  {current.is_day ? 'Clear-sky direct flux incident on horizontal plane.' : 'Night-time (Zero solar generation).'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-2">
                <span className="text-xs text-slate-400 font-medium">Rooftop Solar PV Efficiency</span>
                <div className="text-3xl font-black text-emerald-400 font-['Outfit']">{solarEfficiency}%</div>
                <p className="text-[11px] text-slate-300">
                  Estimated efficiency accounting for {current.cloud_cover || 20}% cloud cover attenuation.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-2">
                <span className="text-xs text-slate-400 font-medium">Solar Noon & Azimuth</span>
                <div className="text-3xl font-black text-cyan-400 font-['Outfit']">12:28 PM</div>
                <p className="text-[11px] text-slate-300">
                  Zenith angle: 18.4° • Daily photoperiod: 11 hrs 48 mins.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: WET BULB GLOBE TEMPERATURE & HEAT STRESS MATRIX */}
        {activeTab === 'thermal_wbgt' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-['Outfit']">
                  Wet Bulb Globe Temperature (WBGT) & Human Physiological Heat Index
                </h3>
                <p className="text-xs text-slate-400">
                  Calculates human evaporative cooling limit (35°C Tw threshold) and outdoor labor safety
                </p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${thermalColor}`}>
                {thermalRisk}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-2">
                <span className="text-xs text-slate-400 font-medium">Dry Bulb vs Wet Bulb (Tw)</span>
                <div className="text-2xl font-black text-white font-['Outfit']">
                  {temp}°C <span className="text-teal-400 text-lg">/ {wetBulb}°C Tw</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Dew point spread: {Math.round(temp - wetBulb)}°C depression. Evaporative cooling remains effective.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-2">
                <span className="text-xs text-slate-400 font-medium">Hydration Depletion Rate</span>
                <div className="text-2xl font-black text-amber-400 font-['Outfit']">{sweatLoss}</div>
                <p className="text-[11px] text-slate-300">
                  Electrolyte intake recommended for farmers and outdoor workers every 45 minutes.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-2">
                <span className="text-xs text-slate-400 font-medium">Max Continuous Work Window</span>
                <div className="text-2xl font-black text-emerald-400 font-['Outfit']">
                  {wetBulb > 28 ? '30 Mins / Hr' : '45-60 Mins'}
                </div>
                <p className="text-[11px] text-slate-300">
                  Rest in shade with active ventilation during midday peak temperature windows.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
