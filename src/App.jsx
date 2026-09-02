import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DisasterTicker from './components/DisasterTicker';
import InteractiveWeatherMap from './components/InteractiveWeatherMap';
import MetricsAdvisoriesGrid from './components/MetricsAdvisoriesGrid';
import ChandraAIWidget from './components/ChandraAIWidget';
import NWPEnsembleSection from './components/NWPEnsembleSection';
import RadarMapModal from './components/RadarMapModal';
import SectorAdvisoryModal from './components/SectorAdvisoryModal';
import ClimateAnalyticsModal from './components/ClimateAnalyticsModal';
import SettingsModal from './components/SettingsModal';
import TechSpecsModal from './components/TechSpecsModal';
import { fetchComprehensiveWeather, POPULAR_LOCATIONS } from './services/weatherApi';

export default function App() {
  // Default to Kochi, India as shown in user's design image or New Delhi
  const [activeLocation, setActiveLocation] = useState(
    POPULAR_LOCATIONS.find(l => l.name === 'Kochi') || POPULAR_LOCATIONS[0]
  );
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLanguage, setActiveLanguage] = useState('en');

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
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* 1. Top Navbar matching design */}
      <Navbar
        activeLocation={activeLocation}
        onSelectLocation={setActiveLocation}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenClimate={() => setIsClimateOpen(true)}
        onOpenRadar={() => setIsRadarOpen(true)}
        onOpenTechSpecs={() => setIsTechSpecsOpen(true)}
      />

      {/* 2. Red Alert Warning Banner */}
      <DisasterTicker
        onOpenDisasterHub={() => setIsSectorsOpen(true)}
        locationName={activeLocation.name}
      />

      {/* Main Layout Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 flex-1">
        
        {/* Top 3-Column Hero Grid matching user's design image */}
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
            />
          </div>

          {/* Right Column: "Chandra" Multilingual Personal Weather AI */}
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
            />
          </div>

        </div>

        {/* Bottom Section: NWP Model Ensemble & Forecast Divergence Matrix matching screenshot */}
        <NWPEnsembleSection activeLocation={activeLocation} />

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
