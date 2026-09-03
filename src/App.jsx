import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DisasterTicker from './components/DisasterTicker';
import InteractiveWeatherMap from './components/InteractiveWeatherMap';
import MetricsAdvisoriesGrid from './components/MetricsAdvisoriesGrid';
import ChandraAIWidget from './components/ChandraAIWidget';
import NWPEnsembleSection from './components/NWPEnsembleSection';
import ERA5ClimateAnalyticsSection from './components/ERA5ClimateAnalyticsSection';
import AdvancedDiagnosticsHub from './components/AdvancedDiagnosticsHub';
import RadarMapModal from './components/RadarMapModal';
import SectorAdvisoryModal from './components/SectorAdvisoryModal';
import ClimateAnalyticsModal from './components/ClimateAnalyticsModal';
import SettingsModal from './components/SettingsModal';
import TechSpecsModal from './components/TechSpecsModal';
import { fetchComprehensiveWeather, POPULAR_LOCATIONS } from './services/weatherApi';

export default function App() {
  // Default to Kochi, India or New Delhi
  const [activeLocation, setActiveLocation] = useState(
    POPULAR_LOCATIONS.find(l => l.name === 'Kochi') || POPULAR_LOCATIONS[0]
  );
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [accessibilityMode, setAccessibilityMode] = useState('standard'); // 'standard', 'cognitive', 'vision', 'hearing'

  // Modals state
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [isSectorsOpen, setIsSectorsOpen] = useState(false);
  const [isClimateOpen, setIsClimateOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTechSpecsOpen, setIsTechSpecsOpen] = useState(false);

  // Settings
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('weathergpt_api_key') || '');
  const [provider, setProvider] = useState(() => localStorage.getItem('weathergpt_provider') || 'builtin');

  // Query transfer to Chandra AI
  const [externalQuery, setExternalQuery] = useState(null);

  // Fetch telemetry whenever activeLocation changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchComprehensiveWeather(
      activeLocation.lat,
      activeLocation.lon,
      `${activeLocation.name}, ${activeLocation.state || activeLocation.country || ''}`
    )
      .then((data) => {
        if (isMounted) {
          setWeatherData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Weather ingestion error:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeLocation]);

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('weathergpt_api_key', key);
  };

  const handleSaveProvider = (prov) => {
    setProvider(prov);
    localStorage.setItem('weathergpt_provider', prov);
  };

  const handleQuickQuery = (q) => {
    setExternalQuery(q);
  };

  return (
    <div className={`min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 ${
      accessibilityMode === 'vision' ? 'contrast-125 font-semibold text-white' : ''
    }`}>
      
      {/* 1. Top Navbar with Accessibility Dropdown */}
      <Navbar
        activeLocation={activeLocation}
        onSelectLocation={setActiveLocation}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenClimate={() => setIsClimateOpen(true)}
        onOpenRadar={() => setIsRadarOpen(true)}
        onOpenTechSpecs={() => setIsTechSpecsOpen(true)}
        accessibilityMode={accessibilityMode}
        onChangeAccessibilityMode={setAccessibilityMode}
      />

      {/* 2. Red Alert Warning Banner with Visual Accessibility Tags */}
      <DisasterTicker
        onOpenDisasterHub={() => setIsSectorsOpen(true)}
        locationName={activeLocation.name}
      />

      {/* Main Layout Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 flex-1">
        
        {/* Cognitive / Cerebral Incapacitance Mode: Voice First Layout */}
        {accessibilityMode === 'cognitive' ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-4 rounded-3xl bg-amber-950/20 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
              <span>🧠 <strong>Cerebral & Voice-First Mode Active:</strong> Chandra AI voice assistant is in focus with minimal simple weather metrics below.</span>
              <button 
                onClick={() => setAccessibilityMode('standard')} 
                className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold"
              >
                Exit Mode
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Primary Voice Box */}
              <div className="lg:col-span-8">
                <ChandraAIWidget
                  weatherData={weatherData}
                  activeLocation={activeLocation}
                  onSelectLocation={setActiveLocation}
                  activeLanguage={activeLanguage}
                  onChangeLanguage={setActiveLanguage}
                  apiKey={apiKey}
                  provider={provider}
                  externalQuery={externalQuery}
                  onClearExternalQuery={() => setExternalQuery(null)}
                  accessibilityMode={accessibilityMode}
                />
              </div>

              {/* Minimalist Summary Cards */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-6 rounded-3xl bg-[#0e131f] border border-white/15 text-center space-y-2 shadow-xl">
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Current Temperature</div>
                  <div className="text-5xl font-black text-cyan-300 font-['Outfit']">
                    {weatherData?.current?.temperature || 27}° C
                  </div>
                  <div className="text-base font-semibold text-white">
                    {weatherData?.current?.condition || 'Mainly Clear'}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {activeLocation.name}, {activeLocation.state || activeLocation.country}
                  </div>
                </div>

                <MetricsAdvisoriesGrid
                  weatherData={weatherData}
                  onOpenAdvisoriesModal={() => setIsSectorsOpen(true)}
                  onQuickQuery={handleQuickQuery}
                  accessibilityMode={accessibilityMode}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Standard 3-Column Hero Grid matching user's design image */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* Left Column: Interactive Map with India Default, Fly-to Zoom, Temp Pill Popup & Dynamic Condition Text */}
            <div className="lg:col-span-4 flex flex-col">
              <InteractiveWeatherMap
                activeLocation={activeLocation}
                weatherData={weatherData}
                onOpenRadarModal={() => setIsRadarOpen(true)}
              />
            </div>

            {/* Middle Column: 3x3 Minimalist Metrics Grid + Expandable Advisories Card */}
            <div className="lg:col-span-4 flex flex-col">
              <MetricsAdvisoriesGrid
                weatherData={weatherData}
                onOpenAdvisoriesModal={() => setIsSectorsOpen(true)}
                onQuickQuery={handleQuickQuery}
                accessibilityMode={accessibilityMode}
              />
            </div>

            {/* Right Column: "Chandra" Multilingual Personal Weather AI with VoiceOrb */}
            <div className="lg:col-span-4 flex flex-col">
              <ChandraAIWidget
                weatherData={weatherData}
                activeLocation={activeLocation}
                onSelectLocation={setActiveLocation}
                activeLanguage={activeLanguage}
                onChangeLanguage={setActiveLanguage}
                apiKey={apiKey}
                provider={provider}
                externalQuery={externalQuery}
                onClearExternalQuery={() => setExternalQuery(null)}
                accessibilityMode={accessibilityMode}
              />
            </div>

          </div>
        )}

        {/* Section 1: Synoptic Diagnostics & Environmental Telemetry Hub */}
        <AdvancedDiagnosticsHub weatherData={weatherData} activeLocation={activeLocation} />

        {/* Section 2: NWP Model Ensemble & Forecast Divergence Matrix */}
        <NWPEnsembleSection activeLocation={activeLocation} />

        {/* Section 3: Copernicus ERA5 Climate Reanalysis & Interactive Meteorological Charts */}
        <ERA5ClimateAnalyticsSection activeLocation={activeLocation} weatherData={weatherData} />

      </main>

      {/* Modals & Full Views */}
      <TechSpecsModal
        isOpen={isTechSpecsOpen}
        onClose={() => setIsTechSpecsOpen(false)}
      />

      <SectorAdvisoryModal
        isOpen={isSectorsOpen}
        onClose={() => setIsSectorsOpen(false)}
        weatherData={weatherData}
        activeLocation={activeLocation}
      />

      <RadarMapModal
        isOpen={isRadarOpen}
        onClose={() => setIsRadarOpen(false)}
        activeLocation={activeLocation}
      />

      <ClimateAnalyticsModal
        isOpen={isClimateOpen}
        onClose={() => setIsClimateOpen(false)}
        activeLocation={activeLocation}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        provider={provider}
        onSaveProvider={handleSaveProvider}
      />

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050811] py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>WeatherGPT • Autonomous AI Meteorological Decision Platform</span>
          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span>Python FastAPI Backend</span>
            <span>•</span>
            <span>NOAA GFS</span>
            <span>•</span>
            <span>ECMWF IFS</span>
            <span>•</span>
            <span>IMD WRF</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
