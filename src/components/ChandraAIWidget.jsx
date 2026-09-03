import React, { useState, useEffect, useRef } from 'react';
import { Languages, Send, Volume2, VolumeX, Sparkles, User, Bot, Trash2, Mic, MicOff } from 'lucide-react';
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS, VoiceRecognition, speakText, stopSpeaking } from '../services/voiceService';
import { processWeatherGPTQuery } from '../services/nlpReasoningEngine';
import VoiceOrb from './VoiceOrb';

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

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === activeLanguage) || SUPPORTED_LANGUAGES[0];

  const getInitialGreeting = (lang) => {
    switch(lang) {
      case 'ml':
        return 'നമസ്കാരം! ഞാൻ ചന്ദ്ര. ഇന്നത്തെ മഴ, വെയിൽ, കാറ്റ്, യാത്ര അല്ലെങ്കിൽ കൃഷി കാര്യങ്ങൾ എന്തും ചോദിക്കൂ, പറഞ്ഞുതരാം!';
      case 'hi':
        return 'नमस्ते! मैं चन्द्रा हूँ। आज के मौसम, बारिश, खेती या यात्रा के बारे में बेझिझक पूछें!';
      case 'ta':
        return 'வணக்கம்! நான் சந்திரா. இன்றைய வானிலை, மழை, விவசாயம் அல்லது பயண ஆலோசனைகளுக்கு என்னிடம் கேளுங்கள்!';
      case 'te':
        return 'నమస్కారం! నేను చంద్ర. నేటి వాతావరణం, వర్షం లేదా వ్యవసాయ సలహాల కోసం నన్ను అడగండి!';
      default:
        return 'Hi! I am Chandra, your personal weather companion. Ask me anything about today\'s rain, clothing, workout, farming, or travel!';
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
  const messagesEndRef = useRef(null);
  const dropdownRef = useRef(null);

  // Re-initialize Speech Recognition when language changes
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

  // Auto-scroll messages inside the rectangle
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

      // Location Update (e.g. if user asked about Thrissur, sync map & metrics)
      if (response.new_location && onSelectLocation) {
        onSelectLocation(response.new_location);
      }

      // Clean text of any accidental asterisks
      const cleanContent = response.text ? response.text.replace(/\*\*/g, '').replace(/\*/g, '').trim() : '';

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: cleanContent,
        type: response.type,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);

      // If user spoke by voice or in cognitive/vision accessibility mode, automatically speak aloud
      if (isListening || accessibilityMode === 'cognitive' || accessibilityMode === 'vision') {
        handleToggleSpeak(assistantMsg.id, cleanContent);
      }
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
  };

  const hasMultipleMessages = messages.length > 2;

  return (
    <div className={`relative w-full rounded-2xl bg-[#0e131f]/95 border border-white/10 p-4 flex flex-col justify-between shadow-2xl overflow-hidden transition-all ${
      accessibilityMode === 'cognitive' ? 'h-[460px]' : 'h-[380px] sm:h-[420px]'
    }`}>
      
      {/* Header with High Z-Index */}
      <div className="relative z-30 flex items-start justify-between pb-2 border-b border-white/5">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] tracking-tight flex items-center gap-2">
            Chandra
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">Personal weather AI</p>
        </div>

        <div className="flex items-center gap-1.5" ref={dropdownRef}>
          {hasMultipleMessages && (
            <button
              onClick={handleClearChat}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
              title="Reset Chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Multilingual Selector Button with Clean Floating Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-white/10 text-slate-200 transition-all flex items-center gap-1.5 text-xs shadow-md"
              title="Select Language (12 Indian Languages)"
            >
              <Languages className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-bold uppercase">{currentLangObj.code}</span>
            </button>

            {showLanguageDropdown && (
              <div className="absolute right-0 top-10 w-48 p-1.5 rounded-2xl bg-slate-900 border border-white/20 backdrop-blur-3xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[9px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  12 Indian Languages
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
                      <span className="truncate">{lang.native} ({lang.name})</span>
                      <span className="text-[10px] ml-1">{lang.flag}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle Content Area: VoiceOrb + In-Place Conversation Stream */}
      <div className="relative z-10 flex-1 overflow-y-auto my-2 space-y-3 pr-1 scrollbar-thin flex flex-col">
        
        {/* Interactive VoiceOrb with Minimalist Voice Bar */}
        <VoiceOrb
          isListening={isListening}
          isSpeaking={speakingMessageId !== null}
          onToggleListen={toggleVoiceListening}
          language={activeLanguage}
          transcriptPreview={interimVoiceText}
          hasSpeechSupport={true}
        />

        {/* In-Place Message Stream */}
        <div className="space-y-2 text-xs pt-1">
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
                  className={`max-w-[85%] rounded-2xl p-2.5 leading-relaxed ${
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

          {/* Thinking Status */}
          {isLoading && (
            <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 p-2 bg-slate-900/70 rounded-xl border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-slate-400">Chandra is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

      </div>

      {/* Bottom Input Bar */}
      <div className="relative z-20 pt-1">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/90 border border-white/15 focus-within:border-cyan-500/60 transition-all shadow-inner"
        >
          <input
            type="text"
            placeholder={isListening ? "Listening... Speak now" : "Ask about rain, farming, workouts..."}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 outline-none px-1"
          />

          {inputQuery.trim() ? (
            <button
              type="submit"
              className="p-1.5 rounded-full bg-cyan-500 text-white hover:bg-cyan-400 transition-colors shadow"
              title="Send query"
            >
              <Send className="w-3 h-3" />
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleVoiceListening}
              className={`p-1.5 rounded-full transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-bounce shadow-lg shadow-rose-500/50'
                  : 'text-slate-400 hover:text-cyan-400 hover:bg-white/5'
              }`}
              title={isListening ? "Stop listening" : "Speak to Chandra"}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
          )}
        </form>
      </div>

    </div>
  );
}
