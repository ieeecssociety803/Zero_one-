import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Mic, MicOff, Volume2, VolumeX, Sparkles, Bot, User, 
  Trash2, RefreshCw, Sprout, Plane, Compass, TrendingUp, AlertCircle, Copy, Check
} from 'lucide-react';
import { UI_TRANSLATIONS, VoiceRecognition, speakText, stopSpeaking, SUPPORTED_LANGUAGES } from '../services/voiceService';
import { processWeatherGPTQuery } from '../services/nlpReasoningEngine';

export default function ChatInterface({ 
  currentWeatherData, 
  activeLocation, 
  activeLanguage = 'en',
  apiKey = '',
  provider = 'builtin',
  externalQuery = null,
  onClearExternalQuery = () => {}
}) {
  const t = UI_TRANSLATIONS[activeLanguage] || UI_TRANSLATIONS.en;
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === activeLanguage) || SUPPORTED_LANGUAGES[0];

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: activeLanguage === 'hi'
        ? `नमस्ते! मैं **वेदरजीपीटी (WeatherGPT)** हूँ — आपका एआई मौसम विज्ञान एवं निर्णय सहायता मंच। आप मुझसे मौसम पूर्वानुमान, कृषि किसान सलाह, विमानन रिपोर्ट (METAR), समुद्री सुरक्षा या चक्रवात चेतावनी के बारे में पूछ सकते हैं। बोलकर पूछने के लिए माइक बटन दबाएं!`
        : `Greetings! I am **WeatherGPT** — your AI Meteorological Intelligence and Multi-Hazard Decision Platform. You can query me for synoptic forecasts, Kisan agricultural advisories, aviation METAR/TAF, marine coastal safety, or NWP ensemble comparisons (GFS/ECMWF). Try asking by voice or text below!`,
      type: 'general',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimVoiceText, setInterimVoiceText] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const voiceRecRef = useRef(null);

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
      (error) => {
        console.warn('STT Error:', error);
        setIsListening(false);
        setInterimVoiceText('');
      },
      () => {
        setIsListening(false);
      }
    );

    return () => {
      stopSpeaking();
      if (voiceRecRef.current) voiceRecRef.current.stop();
    };
  }, [activeLanguage]);

  // Handle external queries passed from hero card or buttons
  useEffect(() => {
    if (externalQuery) {
      handleSendMessage(externalQuery);
      onClearExternalQuery();
    }
  }, [externalQuery]);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, interimVoiceText]);

  // Voice toggle
  const toggleListening = () => {
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
        alert('Voice input is not enabled in this browser. Please check microphone permissions.');
      }
    }
  };

  // Text-to-speech audio toggle for response
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

  // Copy text to clipboard
  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Send message handler
  const handleSendMessage = async (queryText = inputQuery) => {
    const textToSend = queryText.trim();
    if (!textToSend || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await processWeatherGPTQuery({
        query: textToSend,
        currentWeatherData,
        activeLocation,
        activeLanguage,
        apiKey,
        provider
      });

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.text,
        type: response.type,
        data: response.data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-read response if user spoke by voice
      if (isListening) {
        handleToggleSpeak(assistantMessage.id, response.text);
      }
    } catch (err) {
      console.error('NLP Query Error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ An error occurred while processing your query. Please retry with another question.',
          type: 'error',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    stopSpeaking();
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: activeLanguage === 'hi'
          ? `वार्तालाप साफ़ कर दिया गया है। नया सवाल पूछें!`
          : `Conversation reset. Ready for your meteorological queries!`,
        type: 'general',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="w-full glass-panel rounded-3xl border border-white/10 flex flex-col h-[640px] sm:h-[700px] shadow-2xl overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white font-['Outfit']">
                WeatherGPT Conversational Core
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">
              Natural Language & Voice Reasoning Engine ({currentLangObj.native})
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          title={t.clearChat}
          className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Topic Chips */}
      <div className="px-6 py-2.5 bg-slate-950/40 border-b border-white/5 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" /> Prompts:
        </span>
        {t.suggestedChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="text-xs whitespace-nowrap px-3 py-1 rounded-full bg-slate-800/70 hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/5 hover:border-cyan-500/30 text-slate-300 transition-all"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSpeaking = speakingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white ${
                  isUser
                    ? 'bg-gradient-to-tr from-cyan-600 to-blue-600'
                    : 'bg-slate-800 border border-white/10 text-cyan-400'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-tr from-cyan-600 to-blue-700 text-white shadow-lg shadow-cyan-600/10'
                    : 'bg-slate-900/85 border border-white/10 text-slate-200 backdrop-blur-md'
                }`}
              >
                {/* Content formatted with markdown line breaks */}
                <div className="whitespace-pre-line space-y-1.5 font-sans">
                  {msg.content}
                </div>

                {/* Footer with Timestamp and Action Buttons */}
                <div className={`mt-3 pt-2 border-t flex items-center justify-between text-[10px] ${isUser ? 'border-white/20 text-white/70' : 'border-white/5 text-slate-400'}`}>
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSpeak(msg.id, msg.content)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors ${
                          isSpeaking ? 'bg-cyan-500 text-white animate-pulse' : 'hover:bg-slate-800 text-slate-300'
                        }`}
                        title={isSpeaking ? t.stopAudio : t.readAloud}
                      >
                        {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                        <span>{isSpeaking ? 'Playing' : 'Listen'}</span>
                      </button>

                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-800 text-slate-300 transition-colors"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-cyan-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center gap-2 text-xs text-cyan-300">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-slate-400">Synthesizing meteorological models...</span>
            </div>
          </div>
        )}

        {/* Listening Wave Bubble */}
        {isListening && (
          <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center gap-3 animate-pulse">
            <div className="p-2 rounded-xl bg-cyan-500 text-white">
              <Mic className="w-4 h-4 animate-bounce" />
            </div>
            <div className="flex-1 text-xs text-cyan-200">
              <div className="font-semibold">{t.listening}</div>
              <div className="text-[11px] text-cyan-300/80 italic">
                {interimVoiceText || 'Speak clearly in your chosen language...'}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-slate-900/90 border-t border-white/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-2xl border transition-all flex items-center justify-center shrink-0 ${
              isListening
                ? 'bg-red-500 text-white border-red-400 animate-pulse shadow-lg shadow-red-500/30'
                : 'bg-slate-800/90 border-white/10 hover:border-cyan-500/50 text-cyan-400 hover:bg-slate-700'
            }`}
            title={isListening ? t.stopSpeak : t.speak}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={t.placeholder}
            disabled={isLoading}
            className="flex-1 bg-slate-950/80 border border-white/10 focus:border-cyan-500/60 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 outline-none transition-all shadow-inner"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-cyan-500/20 transition-all shrink-0"
            title="Send query"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

    </div>
  );
}
