// Comprehensive Multilingual Voice Assistant & Speech Synthesis / Recognition Service

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', speechLang: 'en-IN', flag: '🌐' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', speechLang: 'ml-IN', flag: '🌴' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', speechLang: 'hi-IN', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', speechLang: 'ta-IN', flag: '🛕' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', speechLang: 'te-IN', flag: '🏛️' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', speechLang: 'bn-IN', flag: '🐅' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', speechLang: 'mr-IN', flag: '🚩' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', speechLang: 'gu-IN', flag: '🦁' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', speechLang: 'kn-IN', flag: '🐘' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', speechLang: 'pa-IN', flag: '🌾' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ിଆ', speechLang: 'or-IN', flag: '🛕' },
  { code: 'ur', name: 'Urdu', native: 'اردو', speechLang: 'ur-IN', flag: '🌙' },
];

export const UI_TRANSLATIONS = {
  en: {
    voicePrompt: 'Tap to speak your question in English or Malayalam',
    listening: 'Listening... Speak into microphone',
    speaking: 'Chandra is speaking...',
    thinking: 'Chandra is analyzing...',
    advisories: 'Advisories',
    mainlyClear: 'Mainly Clear',
    searchPlaceholder: 'Search city, station (e.g. Kochi, India)...'
  },
  ml: {
    voicePrompt: 'സംസാരിക്കാൻ ടാപ്പ് ചെയ്യുക (മലയാളം / English)',
    listening: 'കേൾക്കുന്നു... ചോദിക്കൂ...',
    speaking: 'ചന്ദ്ര സംസാരിക്കുന്നു...',
    thinking: 'ചന്ദ്ര ചിന്തിക്കുന്നു...',
    advisories: 'നിർദ്ദേശങ്ങൾ',
    mainlyClear: 'പ്രധാനമായും തെളിഞ്ഞത്',
    searchPlaceholder: 'സ്ഥലം തിരയുക (ഉദാ: കൊച്ചി, തൃശ്ശൂർ)...'
  },
  hi: {
    voicePrompt: 'बोलने के लिए टैप करें (हिन्दी / English)',
    listening: 'सुन रहे हैं... बोलिए...',
    speaking: 'चन्द्रा बोल रही है...',
    thinking: 'चन्द्रा सोच रही है...',
    advisories: 'सलाहकार',
    mainlyClear: 'मुख्य रूप से साफ',
    searchPlaceholder: 'शहर खोजें (उदा: दिल्ली, कोच्चि)...'
  },
  ta: {
    voicePrompt: 'பேச தட்டவும் (தமிழ் / English)',
    listening: 'கேட்கிறது... பேசுங்கள்...',
    speaking: 'சந்திரா பேசுகிறார்...',
    thinking: 'சந்திரா சிந்திக்கிறார்...',
    advisories: 'ஆலோசனைகள்',
    mainlyClear: 'பெரும்பாலும் தெளிவானது',
    searchPlaceholder: 'நகரத்தைத் தேடுங்கள்...'
  }
};

let currentAudio = null;

export function stopSpeaking() {
  if (typeof window !== 'undefined') {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (e) {}
      currentAudio = null;
    }
  }
}

/**
 * Foolproof Multilingual Text-To-Speech
 * Uses backend gTTS audio stream for instant, 100% natural pronunciation in Malayalam/Hindi/Tamil
 */
export function speakText(text, lang = 'en', onStart = () => {}, onEnd = () => {}) {
  stopSpeaking();
  if (!text || typeof window === 'undefined') return;

  const clean = text.replace(/[*_#`~]/g, '').trim();
  if (!clean) return;

  const targetLang = lang.toLowerCase();

  const host = window.location.hostname || '127.0.0.1';
  const backendHost = (host !== 'localhost' && host !== '127.0.0.1') ? host : '127.0.0.1';

  if (targetLang !== 'en') {
    try {
      const audioUrl = `http://${backendHost}:8000/api/tts?text=${encodeURIComponent(clean)}&lang=${targetLang}`;
      currentAudio = new Audio(audioUrl);
      
      currentAudio.onplay = () => {
        onStart();
      };
      
      currentAudio.onended = () => {
        currentAudio = null;
        onEnd();
      };
      
      currentAudio.onerror = () => {
        fallbackSpeechSynthesis(clean, targetLang, onStart, onEnd);
      };

      const playPromise = currentAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          fallbackSpeechSynthesis(clean, targetLang, onStart, onEnd);
        });
      }
      return;
    } catch (e) {
      console.warn('Backend TTS error:', e);
    }
  }

  fallbackSpeechSynthesis(clean, targetLang, onStart, onEnd);
}

function fallbackSpeechSynthesis(cleanText, targetLang, onStart, onEnd) {
  if (!window.speechSynthesis) {
    onEnd();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const voices = window.speechSynthesis.getVoices() || [];
  
  const matchedVoice = voices.find(v => {
    const vLang = (v.lang || '').toLowerCase();
    const vName = (v.name || '').toLowerCase();
    if (targetLang === 'ml') return vLang.startsWith('ml') || vName.includes('malayalam');
    if (targetLang === 'hi') return vLang.startsWith('hi') || vName.includes('hindi');
    if (targetLang === 'ta') return vLang.startsWith('ta') || vName.includes('tamil');
    return vLang.startsWith(targetLang);
  });

  if (matchedVoice) utterance.voice = matchedVoice;
  utterance.lang = targetLang === 'ml' ? 'ml-IN' : targetLang === 'hi' ? 'hi-IN' : targetLang === 'ta' ? 'ta-IN' : 'en-IN';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  utterance.onstart = onStart;
  utterance.onend = onEnd;
  utterance.onerror = () => onEnd();

  window.speechSynthesis.speak(utterance);
}

/**
 * Robust Speech Recognition with Active Session Window (STT)
 * Keeps listening stably for up to 8 seconds so desktop & mobile do not abruptly stop after 1 second
 */
export class VoiceRecognition {
  constructor(lang = 'en-IN', onResult, onError, onEnd) {
    this.recognition = null;
    this.isListening = false;
    this.lang = lang;
    this.onResult = onResult;
    this.onError = onError;
    this.onEnd = onEnd;
    this.sessionEndTime = 0;
    this.collectedTranscript = '';
    this.autoStopTimer = null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = lang;

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = (finalTranscript || interimTranscript).trim();
        if (currentText) {
          this.collectedTranscript = currentText;
          if (this.onResult) {
            this.onResult(currentText, Boolean(finalTranscript));
          }
        }
      };

      this.recognition.onerror = (err) => {
        console.warn('Speech recognition event:', err.error);
        // Do not crash session on no-speech
      };

      this.recognition.onend = () => {
        const now = Date.now();
        // If user is still in active listening session (< 8s) and hasn't produced a final speech, keep session alive
        if (this.isListening && now < this.sessionEndTime && !this.collectedTranscript) {
          try {
            this.recognition.start();
            return;
          } catch (e) {}
        }

        // If we collected a transcript or session timed out, complete cleanly
        this.isListening = false;
        if (this.autoStopTimer) clearTimeout(this.autoStopTimer);
        if (this.onEnd) this.onEnd();
      };
    }
  }

  start() {
    if (!this.recognition) return false;
    this.collectedTranscript = '';
    this.isListening = true;
    this.sessionEndTime = Date.now() + 8000; // 8-second listening window

    try {
      this.recognition.lang = this.lang;
      this.recognition.start();
      
      // Auto-stop after 8 seconds of listening
      if (this.autoStopTimer) clearTimeout(this.autoStopTimer);
      this.autoStopTimer = setTimeout(() => {
        if (this.isListening) {
          this.stop();
        }
      }, 8000);

      return true;
    } catch (e) {
      if (e.name === 'InvalidStateError') {
        this.isListening = true;
        return true;
      }
      console.warn('Recognition start error:', e);
      this.isListening = false;
      return false;
    }
  }

  stop() {
    this.sessionEndTime = 0;
    if (this.autoStopTimer) clearTimeout(this.autoStopTimer);
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
  }
}
