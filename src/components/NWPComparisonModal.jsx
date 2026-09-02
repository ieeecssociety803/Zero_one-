import React, { useState, useEffect } from 'react';
import { X, Sparkles, Layers, Activity, AlertCircle, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import { fetchNWPComparison } from '../services/nwpModelService';

export default function NWPComparisonModal({ isOpen, onClose, activeLocation }) {
  const [nwpData, setNwpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('tempMax'); // 'tempMax' or 'rain'

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchNWPComparison(activeLocation.lat, activeLocation.lon).then((data) => {
      setNwpData(data);
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
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                NWP Model Ensemble & Forecast Divergence Matrix
              </h2>
              <p className="text-xs text-slate-400">
                NOAA GFS (0.25°) • ECMWF IFS (HRES) • DWD ICON • IMD WRF (3km) for {activeLocation.name}
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
              <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400">Ingesting global numerical weather prediction grids...</p>
            </div>
          ) : (
            <>
              {/* Synoptic Ensemble Summary Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30">
                <div className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Ensemble Consensus & Instability Indices</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {nwpData.synopticSummary}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                        CAPE: {nwpData.capeIndex} J/kg
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                        Lifted Index: {nwpData.liftedIndex}
                      </span>
                      <span className="text-slate-400">
                        {nwpData.convectiveRisk}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metric Switcher */}
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-200">7-Day Deterministic Model Spread:</h4>
                <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-white/10 text-xs">
                  <button
                    onClick={() => setSelectedMetric('tempMax')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      selectedMetric === 'tempMax'
                        ? 'bg-purple-600 text-white font-semibold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Max Temperature (°C)
                  </button>
                  <button
                    onClick={() => setSelectedMetric('rain')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      selectedMetric === 'rain'
                        ? 'bg-purple-600 text-white font-semibold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Precipitation Sum (mm)
                  </button>
                </div>
              </div>

              {/* Model Comparison Grid Table */}
              <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-900/50">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
                      <tr>
                        <th className="p-3.5">Forecast Date</th>
                        <th className="p-3.5 text-cyan-400">NOAA GFS (0.25°)</th>
                        <th className="p-3.5 text-purple-400">ECMWF IFS (9km)</th>
                        <th className="p-3.5 text-emerald-400">DWD ICON</th>
                        <th className="p-3.5 text-amber-400">IMD WRF (3km)</th>
                        <th className="p-3.5 text-right">Spread / Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {nwpData.days.map((d, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="p-3.5 font-sans font-medium text-slate-200">
                            {d.day} <span className="text-[10px] text-slate-500 font-mono">({d.date})</span>
                          </td>
                          <td className="p-3.5 text-cyan-300 font-bold">
                            {selectedMetric === 'tempMax' ? `${d.gfs.tempMax}°C` : `${d.gfs.rain} mm`}
                          </td>
                          <td className="p-3.5 text-purple-300 font-bold">
                            {selectedMetric === 'tempMax' ? `${d.ecmwf.tempMax}°C` : `${d.ecmwf.rain} mm`}
                          </td>
                          <td className="p-3.5 text-emerald-300 font-bold">
                            {selectedMetric === 'tempMax' ? `${d.icon.tempMax}°C` : `${d.icon.rain} mm`}
                          </td>
                          <td className="p-3.5 text-amber-300 font-bold">
                            {selectedMetric === 'tempMax' ? `${d.wrf.tempMax}°C` : `${d.wrf.rain} mm`}
                          </td>
                          <td className="p-3.5 text-right font-sans">
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
                              ±{d.tempSpread}°C • {d.confidence}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* NWP Model Specs Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {nwpData.models.map((m) => (
                  <div key={m.id} className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                      <h5 className="font-bold text-xs text-white truncate">{m.name}</h5>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-400">
                      <div>Res: <strong className="text-slate-300">{m.resolution}</strong></div>
                      <div>Update: <strong className="text-slate-300">{m.updateFreq}</strong></div>
                      <div className="text-[10px] text-slate-400 italic mt-2 line-clamp-2">
                        {m.specialty}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
