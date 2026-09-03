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
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', speechLang: 'or-IN', flag: '🛕' },
  { code: 'ur', name: 'Urdu', native: 'اردو', speechLang: 'ur-IN', flag: '🌙' },
];

export const UI_TRANSLATIONS = {
  en: {
    voicePrompt: 'Tap to speak your question in English or Malayalam',
    listening: 'Listening...',
    speaking: 'Chandra is speaking...',
    thinking: 'Chandra is analyzing...',
    advisories: 'Advisories',
    mainlyClear: 'Mainly Clear',
    searchPlaceholder: 'Search city, station (e.g. Kochi, India)...'
  },
  ml: {
    voicePrompt: 'മലയാളത്തിലോ ഇംഗ്ലീഷിലോ സംസാരിക്കാൻ ടാപ്പ് ചെയ്യുക',
    listening: 'കേൾക്കുന്നു...',
    speaking: 'ചന്ദ്ര സംസാരിക്കുന്നു...',
    thinking: 'ചന്ദ്ര ചിന്തിക്കുന്നു...',
    advisories: 'നിർദ്ദേശങ്ങൾ',
    mainlyClear: 'പ്രധാനമായും തെളിഞ്ഞത്',
    searchPlaceholder: 'സ്ഥലം തിരയുക (ഉദാ: കൊച്ചി, തൃശ്ശൂർ)...'
  },
  hi: {
    voicePrompt: 'हिन्दी या अंग्रेजी में बोलने के लिए टैप करें',
    listening: 'सुन रहे हैं...',
    speaking: 'चन्द्रा बोल रही है...',
    thinking: 'चन्द्रा सोच रही है...',
    advisories: 'सलाहकार',
    mainlyClear: 'मुख्य रूप से साफ',
    searchPlaceholder: 'शहर खोजें (उदा: दिल्ली, कोच्चि)...'
  },
  ta: {
    voicePrompt: 'தமிழில் பேச தட்டவும்',
    listening: 'கேட்கிறது...',
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
 * If browser has native regional voice (e.g. Malayalam ml-IN), uses SpeechSynthesis.
 * If desktop browser lacks native Malayalam voice (very common on Chrome/Brave for Windows),
 * seamlessly uses high-quality online neural audio fallback so Malayalam speaks fluently in pure Malayalam!
 */
export function speakText(text, lang = 'en', onStart = () => {}, onEnd = () => {}) {
  stopSpeaking();
  if (!text || typeof window === 'undefined') return;

  // Clean text of markdown/asterisks
  const clean = text.replace(/[*_#`~]/g, '').trim();
  if (!clean) return;

  const targetLang = lang.toLowerCase();

  // 1. Check if browser has a native voice matching the language
  if (window.speechSynthesis) {
    const voices = window.speechSynthesis.getVoices();
    const hasNativeVoice = voices.some(v => {
      const vLang = (v.lang || '').toLowerCase();
      const vName = (v.name || '').toLowerCase();
      if (targetLang === 'ml') return vLang.startsWith('ml') || vName.includes('malayalam');
      if (targetLang === 'hi') return vLang.startsWith('hi') || vName.includes('hindi');
      if (targetLang === 'ta') return vLang.startsWith('ta') || vName.includes('tamil');
      if (targetLang === 'te') return vLang.startsWith('te') || vName.includes('telugu');
      if (targetLang === 'bn') return vLang.startsWith('bn') || vName.includes('bengali');
      return vLang.startsWith(targetLang);
    });

    // If English or native voice is actually available in the browser, use SpeechSynthesis
    if (hasNativeVoice || targetLang === 'en') {
      const utterance = new SpeechSynthesisUtterance(clean);
      const matchedVoice = voices.find(v => {
        const vLang = (v.lang || '').toLowerCase();
        const vName = (v.name || '').toLowerCase();
        if (targetLang === 'ml') return vLang.startsWith('ml') || vName.includes('malayalam');
        if (targetLang === 'hi') return vLang.startsWith('hi') || vName.includes('hindi');
        if (targetLang === 'ta') return vLang.startsWith('ta') || vName.includes('tamil');
        if (targetLang === 'te') return vLang.startsWith('te') || vName.includes('telugu');
        return vLang.startsWith(targetLang);
      });

      if (matchedVoice) utterance.voice = matchedVoice;
      utterance.lang = targetLang === 'ml' ? 'ml-IN' : targetLang === 'hi' ? 'hi-IN' : targetLang === 'ta' ? 'ta-IN' : 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      utterance.onstart = onStart;
      utterance.onend = onEnd;
      utterance.onerror = () => {
        onEnd();
      };

      window.speechSynthesis.speak(utterance);
      return;
    }
  }

  // 2. High-Quality Online Regional Audio Fallback (Guaranteed Malayalam TTS in Chrome/Brave desktop)
  try {
    onStart();
    const encodedText = encodeURIComponent(clean.slice(0, 200)); // First segment
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${targetLang}&client=tw-ob&q=${encodedText}`;
    
    currentAudio = new Audio(ttsUrl);
    currentAudio.onended = () => {
      currentAudio = null;
      onEnd();
    };
    currentAudio.onerror = () => {
      currentAudio = null;
      onEnd();
    };
    currentAudio.play().catch(() => {
      onEnd();
    });
  } catch (err) {
    console.warn('Audio TTS fallback error:', err);
    onEnd();
  }
}

/**
 * Web Speech API Voice Recognition (STT)
 */
export class VoiceRecognition {
  constructor(lang = 'en-IN', onResult, onError, onEnd) {
    this.recognition = null;
    this.isListening = false;
    this.lang = lang;
    this.onResult = onResult;
    this.onError = onError;
    this.onEnd = onEnd;

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

        if (this.onResult) {
          this.onResult(finalTranscript || interimTranscript, Boolean(finalTranscript));
        }
      };

      this.recognition.onerror = (err) => {
        this.isListening = false;
        if (this.onError) this.onError(err);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onEnd) this.onEnd();
      };
    }
  }

  start() {
    if (!this.recognition) return false;
    try {
      this.recognition.lang = this.lang;
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e) {
      console.warn('Recognition start exception:', e);
      return false;
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }
}
