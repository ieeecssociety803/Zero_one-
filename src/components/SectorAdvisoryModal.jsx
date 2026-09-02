import React, { useState } from 'react';
import { 
  X, Sprout, Plane, Compass, AlertTriangle, Droplets, Wind, ShieldAlert, 
  CheckCircle, AlertCircle, Info, ChevronRight, ExternalLink 
} from 'lucide-react';
import { generateAgriAdvisory, generateAviationBriefing, generateMarineAdvisory, MAJOR_AIRPORTS } from '../services/sectorAdvisoryService';
import { ACTIVE_DISASTER_ALERTS } from '../services/disasterAlerts';

export default function SectorAdvisoryModal({ isOpen, onClose, weatherData, activeLocation }) {
  const [activeTab, setActiveTab] = useState('agri'); // 'agri', 'aviation', 'marine', 'disaster'
  const [selectedAirportCode, setSelectedAirportCode] = useState('VIDP');

  if (!isOpen || !weatherData) return null;

  const agri = generateAgriAdvisory(weatherData);
  const aviation = generateAviationBriefing(selectedAirportCode, weatherData);
  const marine = generateMarineAdvisory(weatherData.lat, weatherData.lon, weatherData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[88vh] glass-panel rounded-3xl border border-white/15 flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/80">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
              Decision-Support Sector Intelligence Hub
            </h2>
            <p className="text-xs text-slate-400">
              Gramin Krishi Mausam Sewa • ICAO Aviation METAR • INCOIS Marine • NDMA CAP Warnings
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 py-3 bg-slate-950/90 border-b border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none">
          
          <button
            onClick={() => setActiveTab('agri')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'agri'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sprout className="w-4 h-4 text-emerald-400" />
            <span>🌾 Kisan Agri Advisory</span>
          </button>

          <button
            onClick={() => setActiveTab('aviation')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'aviation'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Plane className="w-4 h-4 text-blue-400" />
            <span>✈️ Aviation METAR / TAF</span>
          </button>

          <button
            onClick={() => setActiveTab('marine')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'marine'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>⚓ Marine & Coastal Safety</span>
          </button>

          <button
            onClick={() => setActiveTab('disaster')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'disaster'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-lg shadow-red-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>🚨 Disaster Warnings (CAP)</span>
          </button>

        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: AGRICULTURE */}
          {activeTab === 'agri' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Irrigation Recommendation */}
                <div className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Irrigation Scheduling</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {agri.irrigation.status}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {agri.irrigation.reason}
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-3">
                    <span>Soil Moisture: <strong className="text-emerald-300">{agri.soilMoisture}</strong></span>
                    <span>ET₀: <strong className="text-emerald-300">{agri.evapotranspiration}</strong></span>
                  </div>
                </div>

                {/* Spraying Window */}
                <div className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Chemical Spraying Window</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {agri.spraying.status}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {agri.spraying.details}
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400">
                    Threshold: Safe when wind &lt; 15 km/h and dry canopy
                  </div>
                </div>

              </div>

              {/* Pest & Disease Vulnerability Matrix */}
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Crop Pest & Pathogen Early Warning Matrix
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {agri.pestRisks.map((p, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{p.pest}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                          p.severity === 'High' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          Risk: {p.severity}
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-400 font-medium">Target Crops: {p.crops}</div>
                      <div className="text-xs text-slate-300 leading-snug">{p.recommendation}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Bulletins */}
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">GKMS Agronomic Directives</h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {agri.advisoryBulletins.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: AVIATION */}
          {activeTab === 'aviation' && (
            <div className="space-y-6">
              
              {/* Airport Selector Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Select Aerodrome:</span>
                {MAJOR_AIRPORTS.map((apt) => (
                  <button
                    key={apt.icao}
                    onClick={() => setSelectedAirportCode(apt.icao)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedAirportCode === apt.icao
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {apt.iata} ({apt.icao})
                  </button>
                ))}
              </div>

              {/* Flight Rules & Decoded METAR Box */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">{aviation.airport.name}</h3>
                    <p className="text-xs text-slate-400">ICAO: {aviation.airport.icao} • Runways: {aviation.airport.runways.join(', ')}</p>
                  </div>
                  <div 
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border"
                    style={{ backgroundColor: `${aviation.categoryColor}20`, borderColor: `${aviation.categoryColor}50`, color: aviation.categoryColor }}
                  >
                    Category: {aviation.flightCategory}
                  </div>
                </div>

                {/* Raw METAR */}
                <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-xs text-cyan-300 border border-white/5">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Raw ICAO METAR String:</div>
                  <div>{aviation.metar}</div>
                </div>

                {/* Raw TAF */}
                <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-xs text-purple-300 border border-white/5">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Terminal Aerodrome Forecast (TAF):</div>
                  <div>{aviation.taf}</div>
                </div>
              </div>

              {/* Aerodrome Vectors Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5">
                  <div className="text-[11px] text-slate-400">Wind Direction</div>
                  <div className="text-base font-bold text-white font-mono">{aviation.metrics.windDirection}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5">
                  <div className="text-[11px] text-slate-400">Wind Speed (Knots)</div>
                  <div className="text-base font-bold text-white font-mono">{aviation.metrics.windSpeed}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5">
                  <div className="text-[11px] text-slate-400">Crosswind Component</div>
                  <div className="text-base font-bold text-cyan-300 font-mono">{aviation.metrics.crosswind}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5">
                  <div className="text-[11px] text-slate-400">Altimeter (QNH)</div>
                  <div className="text-base font-bold text-white font-mono">{aviation.metrics.qnhAltimeter}</div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: MARINE */}
          {activeTab === 'marine' && (
            <div className="space-y-6">
              
              {/* Alert Status Banner */}
              <div 
                className="p-5 rounded-2xl border flex items-start gap-4"
                style={{ backgroundColor: `${marine.flagColor}15`, borderColor: `${marine.flagColor}40` }}
              >
                <Compass className="w-6 h-6 shrink-0" style={{ color: marine.flagColor }} />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    Marine Advisory: {marine.alertFlag}
                  </h3>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                    {marine.fishermenWarning}
                  </p>
                </div>
              </div>

              {/* Sea State Parameters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                  <div className="text-[11px] text-slate-400">Sea State</div>
                  <div className="text-sm sm:text-base font-bold text-white">{marine.seaState}</div>
                  <div className="text-[10px] text-slate-500">{marine.beaufortScale}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                  <div className="text-[11px] text-slate-400">Wave Height</div>
                  <div className="text-sm sm:text-base font-bold text-cyan-300">{marine.waveHeight}</div>
                  <div className="text-[10px] text-slate-500">Swell Period: {marine.swellPeriod}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                  <div className="text-[11px] text-slate-400">Surface Wind (Knots)</div>
                  <div className="text-sm sm:text-base font-bold text-white">{marine.windSpeedKnots}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                  <div className="text-[11px] text-slate-400">Storm Surge Hazard</div>
                  <div className="text-sm sm:text-base font-bold text-amber-300">{marine.coastalSurge}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                  <div className="text-[11px] text-slate-400">Ocean Current Drift</div>
                  <div className="text-sm sm:text-base font-bold text-white">{marine.oceanCurrent}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                  <div className="text-[11px] text-slate-400">Sea Surface Temp</div>
                  <div className="text-sm sm:text-base font-bold text-emerald-300">{marine.waterTemp}</div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: DISASTER ALERTS */}
          {activeTab === 'disaster' && (
            <div className="space-y-4">
              {ACTIVE_DISASTER_ALERTS.map((alert) => (
                <div 
                  key={alert.id}
                  className="p-5 rounded-2xl border transition-all"
                  style={{ backgroundColor: alert.bgGlow, borderColor: alert.color }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full animate-ping" style={{ backgroundColor: alert.color }} />
                      <h3 className="text-sm sm:text-base font-bold text-white font-['Outfit']">{alert.event}</h3>
                    </div>
                    <span 
                      className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white"
                      style={{ backgroundColor: alert.color }}
                    >
                      {alert.severity} ({alert.urgency})
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 font-semibold mb-2">{alert.headline}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 mb-3">
                    <div>• <strong>Affected:</strong> {alert.affectedZones.join(', ')}</div>
                    <div>• <strong>Peak Winds:</strong> {alert.windPeak}</div>
                    <div>• <strong>Rain Hazard:</strong> {alert.rainfallWarning}</div>
                    <div>• <strong>Surge Hazard:</strong> {alert.stormSurge}</div>
                  </div>

                  {/* Safety Directives */}
                  <div className="pt-2 border-t border-white/10">
                    <div className="text-[11px] font-bold text-white mb-1">Disaster Mitigation Directives:</div>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {alert.instructions.map((inst, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">✓</span>
                          <span>{inst}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
