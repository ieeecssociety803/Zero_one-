import React, { useState, useEffect, useRef } from 'react';
import { Search, Navigation, Settings, Globe, Cpu, Accessibility, Eye, Volume2, Sparkles } from 'lucide-react';
import { searchLocations, POPULAR_LOCATIONS } from '../services/weatherApi';

export default function Navbar({
  activeLocation,
  onSelectLocation,
  onOpenSettings,
  onOpenClimate,
  onOpenRadar,
  onOpenTechSpecs,
  accessibilityMode,
  onChangeAccessibilityMode
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccessMenuOpen, setIsAccessMenuOpen] = useState(false);
  
  const searchRef = useRef(null);
  const accessRef = useRef(null);

  // Search logic
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults(POPULAR_LOCATIONS.slice(0, 6));
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (accessRef.current && !accessRef.current.contains(e.target)) {
        setIsAccessMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onSelectLocation({
            name: 'Current Location',
            state: 'Live GPS',
            country: 'India',
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          });
          setIsSearchOpen(false);
        },
        () => {
          alert('GPS location permission denied. You can search any city in the search bar.');
        }
      );
    }
  };

  const getAccessibilityLabel = () => {
    switch (accessibilityMode) {
      case 'cognitive': return '🧠 Voice-First Mode';
      case 'vision': return '👁️ High Contrast';
      case 'hearing': return '🦻 Visual Alert Mode';
      default: return '♿ Accessibility';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-b from-[#030712] via-[#030712]/85 to-transparent backdrop-blur-md px-4 sm:px-6 lg:px-8 pt-3 pb-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Brand Name matching screenshot: "WeatherGPT" */}
        <div 
          className="cursor-pointer select-none flex items-center gap-2 shrink-0"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
            WeatherGPT
          </span>
        </div>

        {/* Search Bar matching screenshot */}
        <div className="relative flex-1 max-w-xl mx-auto" ref={searchRef}>
          <div 
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#111622] border border-white/15 hover:border-cyan-500/50 transition-all shadow-inner"
            onClick={() => setIsSearchOpen(true)}
          >
            <input
              type="text"
              placeholder="Search city, station (e.g. Kochi, India)..."
              value={searchQuery || (isSearchOpen ? '' : `${activeLocation.name}${activeLocation.state ? `, ${activeLocation.state}` : ''}`)}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-slate-400 outline-none"
            />
            
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUseCurrentLocation();
              }}
              title="Use GPS Location"
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-cyan-400 transition-colors shrink-0"
            >
              <Navigation className="w-5 h-5" />
            </button>
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute left-0 right-0 top-14 mt-1 p-2 rounded-2xl bg-[#0e131f] border border-white/20 backdrop-blur-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[11px] font-bold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                {searchQuery ? 'Search Locations' : 'Popular Meteorological Stations'}
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1">
                {searchResults.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectLocation(loc);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-slate-200 hover:bg-slate-800 hover:text-cyan-300 transition-all text-left"
                  >
                    <span className="font-semibold">{loc.name}, <span className="text-slate-400 font-normal">{loc.state || loc.country}</span></span>
                    <span className="text-[10px] text-slate-500 font-mono">{loc.lat.toFixed(2)}°, {loc.lon.toFixed(2)}°</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Accessibility Mode Selector Dropdown */}
          <div className="relative" ref={accessRef}>
            <button
              onClick={() => setIsAccessMenuOpen(!isAccessMenuOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                accessibilityMode !== 'standard' 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
              }`}
              title="Select Accessibility Mode (Cerebral/Cognitive, Vision, Hearing)"
            >
              <Accessibility className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">{getAccessibilityLabel()}</span>
            </button>

            {isAccessMenuOpen && (
              <div className="absolute right-0 top-12 w-64 p-2 rounded-2xl bg-slate-900 border border-white/20 backdrop-blur-3xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 px-2.5 py-1 uppercase tracking-wider">
                  Accessibility Preferences
                </div>

                <button
                  onClick={() => {
                    onChangeAccessibilityMode('standard');
                    setIsAccessMenuOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                    accessibilityMode === 'standard' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-semibold">Standard Dashboard</div>
                    <div className="text-[10px] text-slate-400">Full meteorological GIS & matrix</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onChangeAccessibilityMode('cognitive');
                    setIsAccessMenuOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                    accessibilityMode === 'cognitive' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-amber-300">🧠 Cerebral / Voice-First</div>
                    <div className="text-[10px] text-slate-400">Primary voice interaction, minimal cards</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onChangeAccessibilityMode('vision');
                    setIsAccessMenuOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                    accessibilityMode === 'vision' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-emerald-300">👁️ High Contrast & TTS</div>
                    <div className="text-[10px] text-slate-400">Bold contrast with auto audio readouts</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onChangeAccessibilityMode('hearing');
                    setIsAccessMenuOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                    accessibilityMode === 'hearing' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-rose-300">🦻 Visual Alert Mode</div>
                    <div className="text-[10px] text-slate-400">Visual hazard badges & captions</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Tech Specs & Architecture Button */}
          <button
            onClick={onOpenTechSpecs}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-xs font-bold text-cyan-300 shadow-sm transition-all"
            title="View Languages, Frameworks, APIs, Algorithms & LLM Engine Specifications"
          >
            <Cpu className="w-4 h-4" />
            <span className="hidden sm:inline">Tech Stack</span>
          </button>

          <button
            onClick={onOpenSettings}
            title="Model & API Settings"
            className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

      </div>
    </header>
  );
}
