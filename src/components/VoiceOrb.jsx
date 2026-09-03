import React from 'react';
import { Mic, Volume2, StopCircle, Sparkles } from 'lucide-react';
import { UI_TRANSLATIONS } from '../services/voiceService';

export const VoiceOrb = ({
  isListening,
  isSpeaking,
  onToggleListen,
  language = 'en',
  transcriptPreview = '',
  hasSpeechSupport = true,
}) => {
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  const getLanguageLabel = (lang) => {
    switch(lang) {
      case 'ml': return 'മലയാളം';
      case 'hi': return 'हिन्दी';
      case 'ta': return 'தமிழ்';
      case 'te': return 'తెలుగు';
      case 'bn': return 'বাংলা';
      default: return lang.toUpperCase();
    }
  };

  return (
    <div className="flex flex-col gap-2.5 w-full select-none">
      
      {/* Interactive Glowing Orb Container matching reference */}
      <div className="relative flex items-center justify-center py-2">
        <div 
          onClick={onToggleListen}
          className="relative group cursor-pointer flex items-center justify-center"
          title={isListening ? "Tap to stop listening" : "Tap to speak to Chandra"}
        >
          {/* Ambient Multi-Hue Pulsating Aura */}
          <div className={`absolute w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600/35 via-purple-600/30 to-pink-600/35 blur-2xl transition-all duration-700 ${
            isListening ? 'scale-125 opacity-100 animate-ping duration-1000' : isSpeaking ? 'scale-115 opacity-90 animate-pulse' : 'scale-100 opacity-60'
          }`} />

          {/* Dark Sphere with Neon Filaments */}
          <div className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#040814] border border-blue-500/50 shadow-[0_0_35px_rgba(59,130,246,0.45),inset_0_0_25px_rgba(147,51,234,0.45)] overflow-hidden flex items-center justify-center transition-transform active:scale-95 group-hover:border-cyan-400/80`}>
            
            {/* Spectral Wave Strands */}
            <div className={`absolute inset-0 bg-gradient-to-tr from-blue-500/40 via-purple-500/30 to-transparent rounded-full animate-spin [animation-duration:10s] ${isListening ? '[animation-duration:3s]' : ''}`} />
            <div className={`absolute -inset-1 bg-gradient-to-bl from-indigo-500/45 via-pink-500/30 to-transparent rounded-full animate-spin [animation-duration:8s] [animation-direction:reverse] opacity-80 mix-blend-screen ${isListening ? '[animation-duration:2.5s]' : ''}`} />
            
            {/* Central Holographic Ribbons */}
            <div className={`relative w-20 h-20 rounded-full border-t-2 border-r-2 border-cyan-300/80 blur-[0.5px] rotate-45 ${isSpeaking || isListening ? 'animate-pulse' : ''}`} />
            <div className="absolute w-16 h-16 rounded-full border-b-2 border-l-2 border-purple-400/80 blur-[0.5px] -rotate-12 animate-pulse [animation-delay:0.5s]" />
            <div className="absolute w-12 h-12 rounded-full border-t border-l border-pink-400/60 blur-[0.3px] rotate-90" />

            {/* Glowing Core Pulse */}
            <div className={`absolute w-4 h-4 rounded-full bg-cyan-300 blur-sm ${isListening ? 'animate-ping duration-700' : isSpeaking ? 'animate-pulse' : 'opacity-70'}`} />

            {/* Central Icon Indicator */}
            <div className="relative z-10 p-2.5 rounded-full bg-slate-950/70 border border-white/20 text-white shadow-lg backdrop-blur-md">
              {isListening ? (
                <StopCircle className="w-5 h-5 text-rose-400 animate-pulse" />
              ) : isSpeaking ? (
                <Volume2 className="w-5 h-5 text-emerald-400 animate-bounce" />
              ) : (
                <Mic className="w-5 h-5 text-cyan-300 group-hover:scale-110 transition-transform" />
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Minimalist Voice Bar matching the user's provided component */}
      <div
        onClick={onToggleListen}
        role="button"
        tabIndex={0}
        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer select-none ${
          isListening 
            ? 'bg-rose-950/40 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.3)]' 
            : isSpeaking
            ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
            : 'bg-[#111728]/90 border-white/10 hover:border-cyan-500/40 hover:bg-[#151c30]'
        }`}
      >
        <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
          isListening 
            ? 'bg-rose-500 text-white animate-pulse' 
            : isSpeaking 
            ? 'bg-emerald-500 text-white animate-bounce' 
            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
        }`}>
          {isListening ? (
            <StopCircle className="w-4 h-4" />
          ) : isSpeaking ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-xs sm:text-sm font-bold truncate ${
            isListening ? 'text-rose-400' : isSpeaking ? 'text-emerald-400' : 'text-white'
          }`}>
            {isListening 
              ? `Listening (${getLanguageLabel(language)})...` 
              : isSpeaking 
              ? 'Chandra is speaking...' 
              : 'Tap to speak your question'}
          </p>
          <p className="text-[10px] text-slate-400 truncate">
            {isListening 
              ? 'Tap again to stop and process' 
              : language === 'ml' 
              ? 'മലയാളത്തിലോ ഇംഗ്ലീഷിലോ ചോദിക്കൂ' 
              : 'Ask in English, Malayalam, Hindi, Tamil...'}
          </p>
        </div>
      </div>

      {/* Transcript Preview Box */}
      {transcriptPreview && (
        <div className="px-3.5 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
          <span className="text-[10px] text-cyan-400 font-extrabold uppercase mr-1.5 tracking-wider">
            Heard:
          </span>
          <span className="italic font-medium text-slate-200">"{transcriptPreview}"</span>
        </div>
      )}

    </div>
  );
};

export default VoiceOrb;
