import React, { useState } from 'react';
import { 
  X, Cpu, Code2, Database, Layers, Network, Sparkles, BookOpen, 
  Terminal, ShieldCheck, CheckCircle2, Server, Globe2, Compass, Activity
} from 'lucide-react';

export default function TechSpecsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('stack'); // 'stack', 'algorithms', 'apis', 'ai_llm', 'mechanisms'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[90vh] rounded-3xl bg-[#0b0f19] border border-white/20 flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                WeatherGPT Technical Architecture & Engineering Specifications
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                  SIH-26068
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Full-Stack Tech Stack • Algorithms • Meteorological Models • APIs • AI/LLM Mechanisms
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

        {/* Tab Navigation */}
        <div className="px-6 py-3 bg-slate-950/90 border-b border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none">
          
          <button
            onClick={() => setActiveTab('stack')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'stack'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>1. Languages & Frameworks</span>
          </button>

          <button
            onClick={() => setActiveTab('apis')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'apis'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Network className="w-4 h-4 text-purple-400" />
            <span>2. APIs & Data Sources</span>
          </button>

          <button
            onClick={() => setActiveTab('algorithms')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'algorithms'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>3. Mathematical Algorithms</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_llm')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'ai_llm'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>4. AI, LLM & Chandra Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('mechanisms')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'mechanisms'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-4 h-4 text-blue-400" />
            <span>5. End-to-End Workflow</span>
          </button>

        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: TECH STACK */}
          {activeTab === 'stack' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Backend Box */}
                <div className="p-5 rounded-2xl bg-[#111622] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2.5 text-sm font-bold text-cyan-400">
                    <Server className="w-5 h-5" />
                    <span>Backend Architecture (Python)</span>
                  </div>
                  
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-white/5">
                      <span className="font-semibold text-white">Language:</span>
                      <span className="font-mono text-cyan-300">Python 3.12 (Asynchronous)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-white/5">
                      <span className="font-semibold text-white">Web Framework:</span>
                      <span className="font-mono text-cyan-300">FastAPI & Uvicorn (ASGI)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-white/5">
                      <span className="font-semibold text-white">HTTP Client:</span>
                      <span className="font-mono text-cyan-300">HTTPX (Async connection pooling)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-white/5">
                      <span className="font-semibold text-white">Data Validation:</span>
                      <span className="font-mono text-cyan-300">Pydantic v2 Models</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-white/5">
                      <span className="font-semibold text-white">Stream Protocol:</span>
                      <span className="font-mono text-cyan-300">WebSockets (WIS 2.0 / MQTT Simulator)</span>
                    </div>
                  </div>
                </div>

                {/* Frontend Box */}
                <div className="p-5 rounded-2xl bg-[#111622] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2.5 text-sm font-bold text-purple-400">
                    <Code2 className="w-5 h-5" />
                    <span>Frontend & UI Architecture</span>
                  </div>
                  
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-white/5">
                      <span className="font-semibold text-white">Core Framework:</span>
                      <span className="font-mono text-purple-300">React 18 & Vite 6 (ESM)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-white/5">
                      <span className="font-semibold text-white">Styling System:</span>
                      <span className="font-mono text-purple-300">TailwindCSS + Custom Glassmorphism</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-white/5">
                      <span className="font-semibold text-white">GIS Mapping Engine:</span>
                      <span className="font-mono text-purple-300">Leaflet 1.9.4 (Vector & Doppler Radar Tiles)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-white/5">
                      <span className="font-semibold text-white">Iconography:</span>
                      <span className="font-mono text-purple-300">Lucide React Icons</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-white/5">
                      <span className="font-semibold text-white">Voice & Audio:</span>
                      <span className="font-mono text-purple-300">Web Speech API (STT) + SpeechSynthesis (TTS)</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Protocol & Containerization */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-[#111622] to-purple-950/30 border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Deployment & Protocol Compatibility</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-slate-300">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">✓ WMO WIS 2.0 Nodes</div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">✓ CAP v1.2 Protocol</div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">✓ Docker & K8s Ready</div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">✓ PWA Offline Cache</div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: APIS & DATA SOURCES */}
          {activeTab === 'apis' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                
                <div className="p-4 rounded-2xl bg-[#111622] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-cyan-300 font-['Outfit']">1. Open-Meteo Synoptic API</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Live Ingestion</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Provides temperature, surface pressure MSL, relative humidity, wind vectors at 10m, precipitation sum, soil temperature (0cm, 6cm), soil moisture (0-3cm), and FAO-56 evapotranspiration.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#111622] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-purple-300 font-['Outfit']">2. Copernicus ERA5 Reanalysis</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">1980–2025 Climatology</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Historical atmospheric reanalysis dataset used to calculate 45-year decadal temperature warming rates (+0.28°C/decade) and Indian Monsoon LPA rainfall anomalies.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#111622] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-emerald-300 font-['Outfit']">3. RainViewer Live Doppler Radar</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">GIS Radar Tiles</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Tilecache Doppler radar reflectivity stream (10 to 65+ dBZ scale) layered seamlessly onto Leaflet GIS for nowcasting heavy convective rain cells.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#111622] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-amber-300 font-['Outfit']">4. WMO CAP v1.2 Disaster Feeds</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Emergency Protocol</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Common Alerting Protocol standard alerts from IMD & NDMA for Tropical Cyclones, Flash Flood Guidance (FFG), Heatwave Orange/Red warnings, and lightning nowcasts.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#111622] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-blue-300 font-['Outfit']">5. Multi-Model NWP Grids</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">NWP Matrix</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Direct integration with NOAA GFS 0.25°, ECMWF IFS HRES 9km, DWD ICON 13km, and IMD WRF Mesoscale 3km models for ensemble spread calculation.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#111622] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-pink-300 font-['Outfit']">6. Air Quality & Chemistry API</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">Atmospheric Chemistry</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Real-time European AQI & US AQI monitoring with PM2.5, PM10, Nitrogen Dioxide (NO₂), Ozone (O₃), Carbon Monoxide (CO), and Sulphur Dioxide (SO₂).
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: MATHEMATICAL ALGORITHMS */}
          {activeTab === 'algorithms' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              <div className="p-4 rounded-2xl bg-[#111622] border border-white/10 space-y-2">
                <h4 className="text-sm font-bold text-cyan-300">1. Runway Crosswind & Headwind Vector Trigonometry</h4>
                <p className="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded-xl border border-white/5">
                  Crosswind (KT) = WindSpeed_KT × |sin(θ_wind - θ_runway)|<br />
                  Headwind (KT) = WindSpeed_KT × cos(θ_wind - θ_runway)
                </p>
                <p className="text-[11px] text-slate-400">
                  Calculates crosswind limits for ICAO aerodrome runways (e.g. VIDP RWY 28) and assigns flight rules (VFR / MVFR / IFR / LIFR) based on visibility and cloud base ceilings.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#111622] border border-white/10 space-y-2">
                <h4 className="text-sm font-bold text-purple-300">2. Magnus-Tetens Dew Point & Relative Humidity Formulation</h4>
                <p className="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded-xl border border-white/5">
                  T_dew ≈ T - ((100 - RH) / 5) &nbsp;|&nbsp; e_s(T) = 6.112 × exp((17.67 × T) / (T + 243.5))
                </p>
                <p className="text-[11px] text-slate-400">
                  Used in computing atmospheric condensation levels, fog probability, and transpiration moisture deficits.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#111622] border border-white/10 space-y-2">
                <h4 className="text-sm font-bold text-emerald-300">3. Convective Instability & Thunderstorm Risk (CAPE & Lifted Index)</h4>
                <p className="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded-xl border border-white/5">
                  CAPE = ∫_LFC^EL g × ((T_v,parcel - T_v,env) / T_v,env) dz &nbsp;|&nbsp; LI = T_env(500hPa) - T_parcel(500hPa)
                </p>
                <p className="text-[11px] text-slate-400">
                  Quantifies buoyant energy (J/kg) available to accelerate vertical air parcels for lightning and hail nowcasting.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#111622] border border-white/10 space-y-2">
                <h4 className="text-sm font-bold text-amber-300">4. FAO-56 Penman-Monteith Evapotranspiration (ET₀) & Agri Water Deficit</h4>
                <p className="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded-xl border border-white/5">
                  ET₀ = (0.408Δ(R_n - G) + γ(900/(T+273))u_2(e_s - e_a)) / (Δ + γ(1 + 0.34u_2))
                </p>
                <p className="text-[11px] text-slate-400">
                  Governs GKMS irrigation advisories: triggers "Withhold Irrigation" when predicted rainfall (mm) &gt; daily ET₀ depletion.
                </p>
              </div>

            </div>
          )}

          {/* TAB 4: AI & CHANDRA LLM ENGINE */}
          {activeTab === 'ai_llm' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Autonomous Engine */}
                <div className="p-5 rounded-2xl bg-[#111622] border border-white/10 space-y-2.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-cyan-400">
                    <Sparkles className="w-5 h-5" />
                    <span>Autonomous Meteorological Engine</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A deterministic, zero-latency rule and physics engine implementing WMO heuristics, GKMS agriculture matrices, Beaufort sea state scales, and ICAO aviation rules without requiring external API credits.
                  </p>
                  <div className="pt-1 text-[11px] text-slate-400">
                    ✓ Zero latency • 100% offline availability • Rigorous domain compliance
                  </div>
                </div>

                {/* Gemini Bridge */}
                <div className="p-5 rounded-2xl bg-[#111622] border border-white/10 space-y-2.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-purple-400">
                    <Cpu className="w-5 h-5" />
                    <span>Google Gemini 1.5 Flash Bridge</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Integrated LLM bridge allowing users to provide custom Gemini API keys for conversational reasoning, cross-lingual synthesis, and complex multi-intent meteorological inquiries.
                  </p>
                  <div className="pt-1 text-[11px] text-slate-400">
                    ✓ High-context reasoning • Grounded by real-time synoptic telemetry injection
                  </div>
                </div>

              </div>

              {/* 12 Indian Languages Voice Engine */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">12 Indian Vernacular Speech Recognition (STT) & Synthesis (TTS)</h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs text-center font-medium">
                  <div className="p-2 rounded-xl bg-slate-950 border border-white/5 text-slate-200">English (en-IN)</div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-white/5 text-cyan-300">हिन्दी (hi-IN)</div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-white/5 text-purple-300">বাংলা (bn-IN)</div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-white/5 text-emerald-300">தமிழ் (ta-IN)</div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-white/5 text-amber-300">తెలుగు (te-IN)</div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-white/5 text-blue-300">मराठी (mr-IN)</div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-white/5 text-pink-300">ગુજરાતી (gu-IN)</div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-white/5 text-indigo-300">ಕನ್ನಡ (kn-IN)</div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-white/5 text-teal-300">മലയാളം (ml-IN)</div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-white/5 text-orange-300">ਪੰਜਾਬੀ (pa-IN)</div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-white/5 text-lime-300">ଓଡ଼ିଆ (or-IN)</div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-white/5 text-rose-300">اردو (ur-IN)</div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: END TO END PIPELINE */}
          {activeTab === 'mechanisms' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              <div className="p-5 rounded-2xl bg-[#111622] border border-white/10 space-y-3 text-xs text-slate-300 leading-relaxed">
                <h4 className="text-sm font-bold text-white font-['Outfit']">End-to-End System Pipeline</h4>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-white/5">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0">1</span>
                    <div>
                      <strong className="text-white">Spatial Query & Geocoding:</strong> User types a location or taps GPS locator. Open-Meteo Geocoding translates place names to exact Lat/Lon & Elevation coordinates.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-white/5">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center shrink-0">2</span>
                    <div>
                      <strong className="text-white">Multi-Source Telemetry Ingestion:</strong> Python FastAPI backend asynchronously pulls live surface metrics, atmospheric chemistry AQI, and multi-model NWP grids in parallel via HTTPX.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-white/5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">3</span>
                    <div>
                      <strong className="text-white">Deterministic & Domain Advisory Modeling:</strong> The Python engine computes dew point spreads, crosswind vectors for runways, Beaufort sea state ratings, CAPE instability, and GKMS crop spraying/irrigation advisories.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-white/5">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">4</span>
                    <div>
                      <strong className="text-white">Conversational Voice Synthesis ("Chandra"):</strong> When the user asks by voice or text in any of the 12 Indian languages, the NLP engine classifies intent, injects current telemetry, generates localized markdown, and speaks the answer using neural SpeechSynthesis.
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-900/90 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Smart India Hackathon 2026 • Problem Statement ID: 26068</span>
          <span className="font-mono text-cyan-300 font-semibold">Team ZeroOne (ID: 21)</span>
        </div>

      </div>
    </div>
  );
}
