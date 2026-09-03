import React, { useState, useEffect, useRef } from 'react';
import { Languages, Mic, MicOff, Send, Volume2, VolumeX, MessageSquare, X, Trash2, Bot, User } from 'lucide-react';
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS, VoiceRecognition, speakText, stopSpeaking } from '../services/voiceService';
import { processWeatherGPTQuery } from '../services/nlpReasoningEngine';

export default function ChandraAIWidget({
  weatherData,
  activeLocation,
  onSelectLocation,
  activeLanguage,
  onChangeLanguage,
  apiKey,
  provider,
  externalQuery,
  onClearExternalQuery,
  accessibilityMode = 'standard'
}) {
  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimVoiceText, setInterimVoiceText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState(false);

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === activeLanguage) || SUPPORTED_LANGUAGES[0];

  const getInitialGreeting = (lang) => {
    switch(lang) {
      case 'ml':
        return 'നമസ്കാരം! ഞാൻ ചന്ദ്ര. ഇന്നത്തെ മഴ, വെയിൽ, കാറ്റ്, യാത്ര അല്ലെങ്കിൽ കൃഷി കാര്യങ്ങൾ എന്തും ചോദിക്കൂ!';
      case 'hi':
        return 'नमस्ते! मैं चन्द्रा हूँ। आज के मौसम, बारिश, खेती या यात्रा के बारे में बेझिझक पूछें!';
      case 'ta':
        return 'வணக்கம்! நான் சந்திரா. இன்றைய வானிலை, மழை அல்லது விவசாய ஆலோசனைகளுக்கு என்னிடம் கேளுங்கள்!';
      default:
        return 'Hi! I am Chandra, your personal weather AI. Ask me about today\'s rain, farming, workout, or plans!';
    }
  };

  const [messages, setMessages] = useState([
    {
      id: 'init',
      role: 'assistant',
      content: getInitialGreeting(activeLanguage),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const voiceRecRef = useRef(null);
  const chatScrollRef = useRef(null);
  const dropdownRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    voiceRecRef.current = new VoiceRecognition(
      currentLangObj.speechLang,
      (transcript, isFinal) => {
        setInterimVoiceText(transcript);
        if (isFinal && transcript.trim()) {
          setInputQuery(transcript);
          handleSendMessage(transcript);
          setIsListening(false);
          setInterimVoiceText('');
        }
      },
      (err) => {
        console.warn('Voice STT error:', err);
        setIsListening(false);
      },
      () => setIsListening(false)
    );

    return () => {
      stopSpeaking();
      if (voiceRecRef.current) voiceRecRef.current.stop();
    };
  }, [activeLanguage]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowLanguageDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle external query
  useEffect(() => {
    if (externalQuery) {
      handleSendMessage(externalQuery);
      onClearExternalQuery();
    }
  }, [externalQuery]);

  // Internal widget auto-scroll only (does NOT scroll the parent window!)
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, interimVoiceText]);

  const toggleVoiceListening = () => {
    if (isListening) {
      voiceRecRef.current?.stop();
      setIsListening(false);
      setInterimVoiceText('');
    } else {
      stopSpeaking();
      const started = voiceRecRef.current?.start();
      if (started) {
        setIsListening(true);
      } else {
        alert('Microphone access is not enabled. Please check permissions.');
      }
    }
  };

  const handleToggleSpeak = (msgId, text) => {
    if (speakingMessageId === msgId) {
      stopSpeaking();
      setSpeakingMessageId(null);
    } else {
      stopSpeaking();
      setSpeakingMessageId(msgId);
      speakText(
        text,
        activeLanguage,
        () => setSpeakingMessageId(msgId),
        () => setSpeakingMessageId(null)
      );
    }
  };

  const handleSendMessage = async (textToSend = inputQuery) => {
    const q = textToSend.trim();
    if (!q || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);
    setShowTranscriptDrawer(true);

    try {
      const response = await processWeatherGPTQuery({
        query: q,
        currentWeatherData: weatherData,
        activeLocation,
        activeLanguage,
        apiKey,
        provider
      });

      // Language Switch Intent
      if (response.type === 'language_switch' && response.target_lang) {
        onChangeLanguage(response.target_lang);
      }

      // Location Update (sync map & metrics)
      if (response.new_location && onSelectLocation) {
        onSelectLocation(response.new_location);
      }

      // Clean text of asterisks/markdown
      const cleanContent = response.text ? response.text.replace(/\*\*/g, '').replace(/\*/g, '').trim() : '';

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: cleanContent,
        type: response.type,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Automatically speak the response
      handleToggleSpeak(assistantMsg.id, cleanContent);
    } catch (e) {
      console.error('Chandra AI Error:', e);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: activeLanguage === 'ml' ? 'ക്ഷമിക്കണം, ഒരു തടസ്സം നേരിട്ടു. ദയവായി വീണ്ടും ചോദിക്കൂ.' : 'I ran into an issue processing that. Please try asking again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    stopSpeaking();
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: getInitialGreeting(activeLanguage),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setShowTranscriptDrawer(false);
  };

  const latestMessage = messages[messages.length - 1];

  return (
    <div className="relative w-full h-[380px] sm:h-[420px] rounded-3xl bg-[#0d121d] border border-white/10 p-5 flex flex-col justify-between shadow-2xl overflow-hidden select-none">
      
      {/* 1. Header (Matching Reference Image Exactly: Chandra + subtitle + language icon) */}
      <div className="relative z-30 flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white font-['Outfit'] tracking-tight">
            Chandra
          </h3>
          <p className="text-xs text-slate-400 font-medium">Personal weather AI</p>
        </div>

        <div className="flex items-center gap-1.5" ref={dropdownRef}>
          {messages.length > 1 && (
            <button
              onClick={() => setShowTranscriptDrawer(!showTranscriptDrawer)}
              className={`p-2 rounded-xl border transition-all ${
                showTranscriptDrawer 
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-white/10'
              }`}
              title="Toggle Conversation Transcript"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}

          {/* Multilingual Selector Button with Clean Floating Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-slate-200 transition-all flex items-center gap-1 shadow-md"
              title="Select Language (12 Indian Languages)"
            >
              <Languages className="w-4 h-4 text-cyan-400" />
            </button>

            {showLanguageDropdown && (
              <div className="absolute right-0 top-11 w-48 p-1.5 rounded-2xl bg-[#090d16] border border-white/20 backdrop-blur-3xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[10px] font-bold text-slate-400 px-2.5 py-1 uppercase tracking-wider">
                  Select Language
                </div>
                <div className="max-h-52 overflow-y-auto space-y-0.5 scrollbar-thin">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onChangeLanguage(lang.code);
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-all ${
                        activeLanguage === lang.code
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{lang.native}</span>
                      <span className="text-[11px] ml-1">{lang.flag}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Center Orb View (Exact Glowing Orb from the User's Image) */}
      {!showTranscriptDrawer ? (
        <div className="relative flex-1 flex flex-col items-center justify-center my-auto">
          
          {/* Interactive Glowing Orb */}
          <div 
            onClick={toggleVoiceListening}
            className="relative cursor-pointer group flex items-center justify-center transition-transform active:scale-95"
            title={isListening ? "Listening... Tap to stop" : "Tap to speak to Chandra"}
          >
            {/* Ambient Radial Blue/Purple Glow */}
            <div className={`absolute w-44 h-44 rounded-full bg-gradient-to-tr from-blue-600/30 via-indigo-600/30 to-purple-600/35 blur-3xl transition-all duration-700 ${
              isListening ? 'scale-125 opacity-100 animate-ping duration-1000' : speakingMessageId ? 'scale-115 opacity-90 animate-pulse' : 'scale-100 opacity-60'
            }`} />

            {/* Dark Sphere with Glowing Neon Spectral Waves */}
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-[#02040a] border border-blue-500/40 shadow-[0_0_40px_rgba(59,130,246,0.5),inset_0_0_30px_rgba(147,51,234,0.4)] overflow-hidden flex items-center justify-center">
              
              {/* Outer Neon Blue Edge Rim */}
              <div className="absolute inset-0 rounded-full border-2 border-blue-400/60 shadow-[0_0_15px_#38bdf8]" />

              {/* Internal Swirling Wave Filaments matching user's exact photo */}
              <div className={`absolute inset-0 bg-gradient-to-tr from-blue-600/50 via-purple-600/40 to-transparent rounded-full animate-spin [animation-duration:12s] ${
                isListening ? '[animation-duration:3s]' : speakingMessageId ? '[animation-duration:6s]' : ''
              }`} />
              
              <div className={`absolute -inset-2 bg-gradient-to-bl from-indigo-500/40 via-pink-600/30 to-transparent rounded-full animate-spin [animation-duration:9s] [animation-direction:reverse] opacity-80 mix-blend-screen ${
                isListening ? '[animation-duration:2.5s]' : ''
              }`} />

              {/* Spectral S-Curve Holographic Light Ribbon */}
              <div className="absolute w-28 h-28 rounded-full border-t-2 border-r-2 border-cyan-300/85 blur-[0.6px] rotate-45 animate-pulse" />
              <div className="absolute w-24 h-24 rounded-full border-b-2 border-l-2 border-purple-400/80 blur-[0.6px] -rotate-12 animate-pulse [animation-delay:0.4s]" />
              <div className="absolute w-16 h-16 rounded-full border-t-2 border-l border-pink-400/70 blur-[0.4px] rotate-90" />

              {/* Core Pulsating Sparkle */}
              <div className={`absolute w-5 h-5 rounded-full bg-cyan-300/90 blur-sm ${
                isListening ? 'animate-ping duration-700' : 'animate-pulse'
              }`} />

              {/* Subtle Voice Status Icon inside the Core */}
              <div className="relative z-10 p-3 rounded-full bg-black/40 backdrop-blur-md text-white">
                {isListening ? (
                  <Mic className="w-6 h-6 text-rose-400 animate-bounce" />
                ) : speakingMessageId ? (
                  <Volume2 className="w-6 h-6 text-emerald-400 animate-pulse" />
                ) : (
                  <Mic className="w-6 h-6 text-cyan-300 group-hover:scale-110 transition-transform" />
                )}
              </div>

            </div>
          </div>

          {/* Voice Heard Preview / Response Live Snippet */}
          {interimVoiceText ? (
            <div className="mt-3 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-xs text-cyan-200 text-center animate-pulse max-w-[90%] truncate">
              Listening: "{interimVoiceText}"
            </div>
          ) : latestMessage && latestMessage.role === 'assistant' ? (
            <div 
              onClick={() => setShowTranscriptDrawer(true)}
              className="mt-3 px-4 py-2 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-slate-200 text-center line-clamp-2 cursor-pointer hover:border-cyan-500/40 hover:bg-slate-900 transition-all max-w-[95%]"
              title="Click to view full conversation"
            >
              {latestMessage.content}
            </div>
          ) : null}

        </div>
      ) : (
        /* 3. In-Place Transcript Drawer (Does NOT affect window scroll!) */
        <div 
          ref={chatScrollRef}
          className="relative z-10 flex-1 overflow-y-auto my-3 space-y-2.5 pr-1 scrollbar-thin flex flex-col"
        >
          <div className="flex items-center justify-between pb-1 text-[11px] text-slate-400 border-b border-white/5">
            <span>Conversation with Chandra</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleClearChat}
                className="hover:text-rose-400 flex items-center gap-1"
                title="Clear Chat"
              >
                <Trash2 className="w-3 h-3" />
                <span>Reset</span>
              </button>
              <button 
                onClick={() => setShowTranscriptDrawer(false)}
                className="hover:text-white"
                title="Return to Orb"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSpeaking = speakingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-1.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-white text-[10px] ${
                    isUser ? 'bg-cyan-600' : 'bg-indigo-600'
                  }`}
                >
                  {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-2.5 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-slate-900/90 border border-white/10 text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-line font-sans">{msg.content}</div>

                  {!isUser && (
                    <div className="mt-1.5 pt-1 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => handleToggleSpeak(msg.id, msg.content)}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
                          isSpeaking ? 'bg-cyan-500 text-white animate-pulse' : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        {isSpeaking ? <VolumeX className="w-2.5 h-2.5" /> : <Volume2 className="w-2.5 h-2.5" />}
                        <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 p-2 bg-slate-900/70 rounded-xl border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-slate-400">Chandra is thinking...</span>
            </div>
          )}
        </div>
      )}

      {/* 4. Bottom Input Bar (Matching Reference Image: [ Plan cultivation, marine proj...  🎤 ]) */}
      <div className="relative z-20 pt-1">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#111624] border border-white/15 focus-within:border-cyan-500/60 transition-all shadow-inner"
        >
          <input
            type="text"
            placeholder={isListening ? "Listening... Speak now" : activeLanguage === 'ml' ? "ചോദിക്കൂ (ഉദാ: മഴ പെയ്യുമോ?)..." : "Plan cultivation, marine proj..."}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 outline-none"
          />

          {inputQuery.trim() ? (
            <button
              type="submit"
              className="p-1.5 rounded-full bg-cyan-500 text-white hover:bg-cyan-400 transition-colors shadow"
              title="Send query"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleVoiceListening}
              className={`p-1.5 rounded-full transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-bounce shadow-lg shadow-rose-500/50'
                  : 'text-slate-400 hover:text-cyan-400'
              }`}
              title={isListening ? "Stop listening" : "Speak to Chandra"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
        </form>
      </div>

    </div>
  );
}
