import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Calendar, AlertTriangle, CloudRain, Sun, Info } from 'lucide-react';
import { fetchHistoricalClimateAnalytics } from '../services/climateService';

export default function ClimateAnalyticsModal({ isOpen, onClose, activeLocation }) {
  const [climateData, setClimateData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchHistoricalClimateAnalytics(activeLocation.lat, activeLocation.lon, activeLocation.name).then((data) => {
      setClimateData(data);
      setLoading(false);
    });
  }, [isOpen, activeLocation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] glass-panel rounded-3xl border border-white/15 flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                Historical Climate Trend & ERA5 Reanalysis Hub
              </h2>
              <p className="text-xs text-slate-400">
                1980–2025 Long-Term Temperature Anomalies & Monsoon Deviation for {activeLocation.name}
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400">Analyzing 45-year ERA5 reanalysis datasets...</p>
            </div>
          ) : (
            <>
              {/* Climate KPI Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10">
                  <div className="text-[11px] text-slate-400">Net Warming Since 1980</div>
                  <div className="text-2xl font-extrabold text-amber-400 font-['Outfit']">{climateData.totalWarmingSince1980}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Rate: +0.28°C / decade</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10">
                  <div className="text-[11px] text-slate-400">Köppen Climate Classification</div>
                  <div className="text-lg font-bold text-cyan-300 font-['Outfit']">{climateData.koppenClass}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Zonal Agro-Ecological Category</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10">
                  <div className="text-[11px] text-slate-400">Baseline Comparison Period</div>
                  <div className="text-sm font-semibold text-white mt-1">{climateData.baselinePeriod}</div>
                  <div className="text-[10px] text-slate-400 mt-1">WMO Standard Climatology</div>
                </div>
              </div>

              {/* Decadal Shift Matrix Table */}
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  Decadal Climate Shift & Extreme Event Frequencies
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
                      <tr>
                        <th className="p-3">Decade Span</th>
                        <th className="p-3">Mean Surface Temp</th>
                        <th className="p-3 text-amber-400">Temperature Anomaly</th>
                        <th className="p-3 text-red-400">Avg Heatwave Days/Yr</th>
                        <th className="p-3 text-cyan-400">Extreme Rain Days/Yr (&gt;65mm)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {climateData.decades.map((dec, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 font-sans font-medium text-slate-200">{dec.decade}</td>
                          <td className="p-3 text-white font-bold">{dec.avgTemp}°C</td>
                          <td className="p-3 font-bold text-amber-400">{dec.avgAnomaly > 0 ? `+${dec.avgAnomaly}` : dec.avgAnomaly}°C</td>
                          <td className="p-3 text-red-300 font-bold">{dec.avgHeatwaves} Days</td>
                          <td className="p-3 text-cyan-300 font-bold">{dec.avgExtremeRain} Days</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent 15 Years Anomaly Bar Chart Representation */}
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  Annual Temperature Anomaly Deviations (2010–2024)
                </h4>

                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-15 gap-2 pt-2">
                  {climateData.years.map((y) => {
                    const isPositive = y.anomaly >= 0;
                    const heightPercent = Math.min(100, Math.abs(y.anomaly) * 70);

                    return (
                      <div key={y.year} className="flex flex-col items-center gap-1.5">
                        <div className="text-[10px] text-amber-400 font-mono font-bold">
                          +{y.anomaly}°
                        </div>
                        <div className="h-24 w-full bg-slate-950 rounded-lg flex items-end justify-center p-1 border border-white/5">
                          <div 
                            className="w-full rounded-md bg-gradient-to-t from-amber-600 to-red-500 transition-all"
                            style={{ height: `${Math.max(15, heightPercent)}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{y.year}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary Narrative */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs text-slate-300 leading-relaxed">
                <strong className="text-amber-400">Climatological Finding:</strong> {climateData.monsoonTrend}
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
