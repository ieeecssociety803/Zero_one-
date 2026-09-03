import React, { useState, useEffect } from 'react';
import { Info, HelpCircle } from 'lucide-react';
import { fetchNWPComparison } from '../services/nwpModelService';

export default function NWPEnsembleSection({ activeLocation }) {
  const [nwpData, setNwpData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeLocation) return;
    setLoading(true);
    fetchNWPComparison(activeLocation.lat, activeLocation.lon).then((data) => {
      setNwpData(data);
      setLoading(false);
    });
  }, [activeLocation]);

  if (loading || !nwpData) {
    return (
      <div className="w-full rounded-2xl bg-[#111622]/90 border border-white/10 p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>Ingesting NWP Model Ensemble Matrix...</span>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full rounded-3xl bg-[#0b0f19]/95 border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
      
      {/* Big Bold Main Header matching user's design */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
        NWP Model Ensemble & Forecast Divergence Matrix
      </h2>

      {/* Ensemble Consensus & Instability Indices Card */}
      <div className="p-5 rounded-2xl bg-[#151b2a]/90 border border-white/10 space-y-3 shadow-inner">
        <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
          <span>Ensemble Consensus & Instability Indices</span>
        </h3>
        
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          {nwpData.synopticSummary || "Ensemble consensus displays strong alignment across GFS and ECMWF for 72-hour temperature progression with minor convective rainfall spread on Day 4."}
        </p>

        {/* Instability Index Badges with Interactive Explanatory Hover Tooltips */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          
          {/* CAPE Tooltip */}
          <div className="group relative">
            <span className="px-4 py-1.5 rounded-xl bg-[#3730a3] hover:bg-[#4338ca] text-indigo-100 text-xs font-bold font-mono shadow-md border border-indigo-400/30 flex items-center gap-1.5 cursor-help transition-colors">
              <span>CAPE: {nwpData.capeIndex || 1450} J/kg</span>
              <HelpCircle className="w-3.5 h-3.5 opacity-70" />
            </span>
            
            {/* Tooltip Popup */}
            <div className="absolute bottom-full left-0 mb-2 w-64 p-2.5 rounded-2xl bg-[#090d16] border border-indigo-500/40 text-xs text-slate-200 shadow-2xl backdrop-blur-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
              <strong className="text-indigo-300 block mb-0.5">CAPE (Convective Energy):</strong>
              Measures buoyant energy available to accelerate storm clouds. Values over 1000 J/kg indicate strong potential for thunderstorms and lightning.
            </div>
          </div>

          {/* Lifted Index Tooltip */}
          <div className="group relative">
            <span className="px-4 py-1.5 rounded-xl bg-[#3730a3] hover:bg-[#4338ca] text-indigo-100 text-xs font-bold font-mono shadow-md border border-indigo-400/30 flex items-center gap-1.5 cursor-help transition-colors">
              <span>Lifted index {nwpData.liftedIndex || -3.2}</span>
              <HelpCircle className="w-3.5 h-3.5 opacity-70" />
            </span>

            {/* Tooltip Popup */}
            <div className="absolute bottom-full left-0 mb-2 w-64 p-2.5 rounded-2xl bg-[#090d16] border border-indigo-500/40 text-xs text-slate-200 shadow-2xl backdrop-blur-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
              <strong className="text-indigo-300 block mb-0.5">Lifted Index (Air Stability):</strong>
              Measures atmospheric stability. Negative values (below 0, such as -3.2) indicate unstable air likely to trigger sudden rains and showers.
            </div>
          </div>

        </div>
      </div>

      {/* 7-Day Deterministic Model Spread Table Section */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white font-['Outfit']">
          7-Day Deterministic Model Spread:
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0d121f]">
          <table className="w-full text-left text-xs sm:text-sm text-slate-200">
            <thead className="bg-[#151b2a] text-slate-300 uppercase text-[11px] font-bold tracking-wider border-b border-white/10">
              <tr>
                <th className="px-4 py-3 font-mono">Forecast Date</th>
                
                {/* GFS Header with Tooltip */}
                <th className="px-4 py-3 group relative cursor-help">
                  <span className="border-b border-dotted border-slate-400">NOAA GFS (0.25°)</span>
                  <div className="absolute bottom-full left-4 mb-2 hidden group-hover:block w-56 p-2 rounded-xl bg-slate-950 border border-white/20 text-[11px] text-slate-300 normal-case shadow-xl z-50">
                    <strong>NOAA GFS:</strong> Global Forecast System (USA), 13km resolution, updated 4x daily.
                  </div>
                </th>

                {/* ECMWF Header with Tooltip */}
                <th className="px-4 py-3 group relative cursor-help">
                  <span className="border-b border-dotted border-slate-400">ECMWF IFS (9km)</span>
                  <div className="absolute bottom-full left-4 mb-2 hidden group-hover:block w-56 p-2 rounded-xl bg-slate-950 border border-white/20 text-[11px] text-slate-300 normal-case shadow-xl z-50">
                    <strong>ECMWF IFS:</strong> European gold-standard 9km high-resolution global forecast.
                  </div>
                </th>

                {/* ICON / WRF Header with Tooltip */}
                <th className="px-4 py-3 group relative cursor-help">
                  <span className="border-b border-dotted border-slate-400">DWD ICON / IMD WRF (3km)</span>
                  <div className="absolute bottom-full left-4 mb-2 hidden group-hover:block w-56 p-2 rounded-xl bg-slate-950 border border-white/20 text-[11px] text-slate-300 normal-case shadow-xl z-50">
                    <strong>DWD ICON & IMD WRF:</strong> High-resolution regional mesoscale models for Indian monsoon and convective tracking.
                  </div>
                </th>

                {/* Spread Confidence Header */}
                <th className="px-4 py-3 group relative cursor-help">
                  <span className="border-b border-dotted border-slate-400">Spread / Confidence</span>
                  <div className="absolute bottom-full right-4 mb-2 hidden group-hover:block w-56 p-2 rounded-xl bg-slate-950 border border-white/20 text-[11px] text-slate-300 normal-case shadow-xl z-50">
                    <strong>Ensemble Spread:</strong> Difference between models. Lower spread indicates high forecast confidence.
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {nwpData.table?.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">{row.date}</td>
                  <td className="px-4 py-3 text-cyan-300">{row.gfs}</td>
                  <td className="px-4 py-3 text-emerald-300">{row.ecmwf}</td>
                  <td className="px-4 py-3 text-indigo-300">{row.wrf}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      row.confidence === 'High' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : row.confidence === 'Moderate'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {row.spread} ({row.confidence})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4 Model Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {nwpData.models?.map((model) => (
          <div key={model.id} className="p-4 rounded-2xl bg-[#141926] border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs sm:text-sm font-['Outfit']">{model.name}</span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {model.resolution}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">{model.specialty}</p>
          </div>
        ))}
      </div>

    </section>
  );
}
