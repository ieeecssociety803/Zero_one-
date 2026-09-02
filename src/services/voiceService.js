// Multilingual Voice Assistant & Speech Synthesis / Recognition Service

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', speechLang: 'en-IN', flag: '🌐' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', speechLang: 'hi-IN', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', speechLang: 'bn-IN', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', speechLang: 'ta-IN', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', speechLang: 'te-IN', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', speechLang: 'mr-IN', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', speechLang: 'gu-IN', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', speechLang: 'kn-IN', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', speechLang: 'ml-IN', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', speechLang: 'pa-IN', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', speechLang: 'or-IN', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', native: 'اردو', speechLang: 'ur-IN', flag: '🇮🇳' }
];

export const UI_TRANSLATIONS = {
  en: {
    appTitle: 'WeatherGPT',
    tagline: 'AI Meteorological Intelligence & Decision Platform',
    placeholder: 'Ask about forecasts, Kisan advisory, aviation METAR, marine alerts, or NWP models...',
    listening: 'Listening to your voice... Speak now',
    speak: 'Voice Query',
    stopSpeak: 'Stop Listening',
    readAloud: 'Read Aloud',
    stopAudio: 'Stop Audio',
    searchPlaceholder: 'Search city, taluk, or airport...',
    currentWeather: 'Current Atmospheric Conditions',
    temperature: 'Temperature',
    feelsLike: 'Feels Like',
    humidity: 'Humidity',
    windSpeed: 'Wind Speed',
    pressure: 'Pressure',
    aqi: 'Air Quality (AQI)',
    hourlyForecast: '24-Hour Timeline',
    weeklyForecast: '7-Day Synoptic Outlook',
    nwpTitle: 'NWP Model Comparator (GFS vs ECMWF vs WRF)',
    radarTitle: 'Live Doppler Radar & GIS Satellite Map',
    agriTitle: 'Kisan Krishi Advisory (Agriculture)',
    aviationTitle: 'Aviation METAR / TAF Briefing',
    marineTitle: 'Marine & Fishermen Coastal Safety',
    disasterTitle: 'Disaster Early Warnings (CAP Broadcast)',
    climateTitle: 'Historical ERA5 Climate Analytics',
    clearChat: 'Clear Conversation',
    suggestedChips: [
      '🌾 Will it rain this week? Is it safe to harvest wheat?',
      '✈️ METAR & crosswinds for Delhi Airport (VIDP)',
      '⚓ Marine safety alert for Bay of Bengal fishermen',
      '📊 Compare GFS vs ECMWF rainfall forecasts',
      '🌡️ How much has temperature risen here since 1980?'
    ]
  },
  hi: {
    appTitle: 'वेदरजीपीटी (WeatherGPT)',
    tagline: 'एआई मौसम विज्ञान एवं निर्णय सहायता मंच',
    placeholder: 'मौसम पूर्वानुमान, किसान सलाह, विमानन रिपोर्ट या चक्रवात चेतावनी के बारे में पूछें...',
    listening: 'आपकी आवाज़ सुन रहे हैं... अभी बोलें',
    speak: 'बोलकर पूछें',
    stopSpeak: 'सुनना बंद करें',
    readAloud: 'ऑडियो सुनें',
    stopAudio: 'आवाज रोकें',
    searchPlaceholder: 'शहर, तालुका या हवाई अड्डा खोजें...',
    currentWeather: 'वर्तमान वायुमंडलीय स्थिति',
    temperature: 'तापमान',
    feelsLike: 'महसूस तापमान',
    humidity: 'आर्द्रता (नमी)',
    windSpeed: 'हवा की गति',
    pressure: 'वायुदाब',
    aqi: 'वायु गुणवत्ता (AQI)',
    hourlyForecast: '24 घंटे का पूर्वानुमान',
    weeklyForecast: '7 दिनों का मौसम दृश्य',
    nwpTitle: 'एनडब्ल्यूपी मॉडल तुलना (GFS बनाम ECMWF)',
    radarTitle: 'लाइव डॉपलर रडार और उपग्रह मानचित्र',
    agriTitle: 'किसान मौसम सलाह (कृषि)',
    aviationTitle: 'विमानन मौसम ब्रीफिंग (METAR)',
    marineTitle: 'समुद्री एवं मछुआरा तटीय सुरक्षा',
    disasterTitle: 'आपदा पूर्व चेतावनी (CAP बुलेटिन)',
    climateTitle: 'ऐतिहासिक जलवायु परिवर्तन विश्लेषण',
    clearChat: 'बातचीत साफ़ करें',
    suggestedChips: [
      '🌾 क्या इस सप्ताह बारिश होगी? क्या गेहूं की कटाई सुरक्षित है?',
      '✈️ दिल्ली एयरपोर्ट (VIDP) के लिए मौसम व हवा की स्थिति',
      '⚓ बंगाल की खाड़ी के मछुआरों के लिए समुद्री चेतावनी',
      '📊 GFS और ECMWF मॉडल की बारिश तुलना दिखाएं',
      '🌡️ 1980 से अब तक यहाँ तापमान कितना बढ़ा है?'
    ]
  },
  bn: {
    appTitle: 'ওয়েদারজিপিটি (WeatherGPT)',
    tagline: 'এআই আবহাওয়া ও দুর্যোগ পূর্বাভাস প্ল্যাটফর্ম',
    placeholder: 'আবহাওয়ার পূর্বাভাস, কৃষি পরামর্শ, বা ঘূর্ণিঝড় সতর্কবার্তা সম্পর্কে জিজ্ঞাসা করুন...',
    listening: 'আপনার কথা শুনছি... এখন বলুন',
    speak: 'কণ্ঠস্বরে জিজ্ঞাসা করুন',
    stopSpeak: 'শোনা বন্ধ করুন',
    readAloud: 'পড়ে শোনান',
    stopAudio: 'অডিও থামান',
    searchPlaceholder: 'শহর বা জেলা খুঁজুন...',
    currentWeather: 'বর্তমান আবহাওয়া',
    temperature: 'তাপমাত্রা',
    feelsLike: 'অনুভূত তাপমাত্রা',
    humidity: 'আর্দ্রতা',
    windSpeed: 'বাতাসের গতি',
    pressure: 'বায়ুচাপ',
    aqi: 'বায়ু মান (AQI)',
    hourlyForecast: '২৪ ঘণ্টার পূর্বাভাস',
    weeklyForecast: '৭ দিনের পূর্বাভাস',
    nwpTitle: 'এনডব্লিউপি মডেল তুলনা (GFS বনাম ECMWF)',
    radarTitle: 'লাইভ ডপলার রাডার ও উপগ্রহ মানচিত্র',
    agriTitle: 'কৃষক আবহাওয়া পরামর্শ',
    aviationTitle: 'বিমান চলাচল পূর্বাভাস (METAR)',
    marineTitle: 'সমুদ্র ও মৎস্যজীবী সুরক্ষা',
    disasterTitle: 'দুর্যোগ পূর্ব সতর্কবার্তা (CAP)',
    climateTitle: 'জলবায়ু পরিবর্তন বিশ্লেষণ',
    clearChat: 'চ্যাট পরিষ্কার করুন',
    suggestedChips: [
      '🌾 এই সপ্তাহে বৃষ্টি হবে কি? ধান কাটার উপযুক্ত সময়?',
      '⚓ বঙ্গোপসাগরের মৎস্যজীবীদের জন্য সতর্কবার্তা',
      '📊 বৃষ্টিপাতের পূর্বাভাসে GFS বনাম ECMWF তুলনা',
      '🌡️ ১৯৮০ সাল থেকে তাপমাত্রা কতটা বৃদ্ধি পেয়েছে?'
    ]
  },
  ta: {
    appTitle: 'வெதர்ஜிபிடி (WeatherGPT)',
    tagline: 'வானிலை நுண்ணறிவு மற்றும் பேரிடர் எச்சரிக்கை தளம்',
    placeholder: 'வானிலை முன்னறிவிப்பு, உழவர் ஆலோசனை அல்லது கடல் எச்சரிக்கை பற்றி கேளுங்கள்...',
    listening: 'பேசுங்கள், கேட்கிறோம்...',
    speak: 'குரல் வழி கேள்வி',
    stopSpeak: 'நிறுத்து',
    readAloud: 'ஒலி வடிவில் கேள்',
    stopAudio: 'ஒலியை நிறுத்து',
    searchPlaceholder: 'நகரம் அல்லது மாவட்டம் தேடுக...',
    currentWeather: 'தற்போதைய வானிலை',
    temperature: 'வெப்பநிலை',
    feelsLike: 'உணரும் வெப்பம்',
    humidity: 'ஈரப்பதம்',
    windSpeed: 'காற்றின் வேகம்',
    pressure: 'காற்றழுத்தம்',
    aqi: 'காற்று தரம் (AQI)',
    hourlyForecast: '24 மணி நேர முன்னறிவிப்பு',
    weeklyForecast: '7 நாள் வானிலை',
    nwpTitle: 'NWP மாதிரி ஒப்பீடு (GFS vs ECMWF)',
    radarTitle: 'நேரலை ரேடார் வரைபடம்',
    agriTitle: 'விவசாயிகள் வானிலை ஆலோசனை',
    aviationTitle: 'விமான நிலைய வானிலை (METAR)',
    marineTitle: 'மீனவர்கள் கடல் பாதுகாப்பு எச்சரிக்கை',
    disasterTitle: 'பேரிடர் முன்னெச்சரிக்கை',
    climateTitle: 'காலநிலை மாற்ற ஆய்வு',
    clearChat: 'அழித்து புதிதாக தொடங்கு',
    suggestedChips: [
      '🌾 இந்த வாரம் மழை பெய்யுமா? நெல் அறுவடைக்கு ஏற்றதா?',
      '⚓ வங்காள விரிகுடா மீனவர்களுக்கான கடல் பாதுகாப்பு எச்சரிக்கை',
      '📊 சென்னை விமான நிலைய வானிலை (VOMM METAR)'
    ]
  },
  te: {
    appTitle: 'వెదర్‌జిపిటి (WeatherGPT)',
    tagline: 'వాతావరణ ముందస్తు హెచ్చరికల వేదిక',
    placeholder: 'వాతావరణం, రైతు సలహాలు, విమాన లేదా సముద్ర హెచ్చరికల గురించి అడగండి...',
    listening: 'మీ మాట వింటున్నాము... మాట్లాడండి',
    speak: 'వాయిస్ ప్రశ్న',
    stopSpeak: 'ఆపు',
    readAloud: 'వినండి',
    stopAudio: 'ఆడియో ఆపు',
    searchPlaceholder: 'నగరం లేదా జిల్లా వెతకండి...',
    currentWeather: 'ప్రస్తుత వాతావరణం',
    temperature: 'ఉష్ణోగ్రత',
    feelsLike: 'అనిపించే ఉష్ణోగ్రత',
    humidity: 'తేమ శాతం',
    windSpeed: 'గాలి వేగం',
    pressure: 'పీడనం',
    aqi: 'గాలి నాణ్యత (AQI)',
    hourlyForecast: '24 గంటల సూచన',
    weeklyForecast: '7 రోజుల వాతావరణం',
    nwpTitle: 'NWP మోడల్స్ పోలిక (GFS vs ECMWF)',
    radarTitle: 'డాప్లర్ రాడార్ మ్యాప్',
    agriTitle: 'రైతు సమాచారం మరియు పంట సలహాలు',
    aviationTitle: 'విమానయాన సూచనలు (METAR)',
    marineTitle: 'మత్స్యకారుల సముద్ర భద్రత',
    disasterTitle: 'విపత్తు ముందస్తు హెచ్చరికలు',
    climateTitle: 'వాతావరణ మార్పుల విశ్లేషణ',
    clearChat: 'చాట్ క్లియర్ చేయండి',
    suggestedChips: [
      '🌾 ఈ వారం వర్షం పడుతుందా? పైరు కోతకు అనుకూలమా?',
      '⚓ బంగాళాఖాతంలో మత్స్యకారులకు హెచ్చరికలు ఏమిటి?',
      '📊 హైదరాబాద్ వాతావరణం ఎలా ఉంటుంది?'
    ]
  },
  mr: {
    appTitle: 'वेदरजीपीटी (WeatherGPT)',
    tagline: 'हवामान अंदाज व आपत्ती पूर्वसूचना व्यासपीठ',
    placeholder: 'हवामानाचा अंदाज, शेती सल्ला किंवा चक्रीवादळाच्या इशाऱ्याबद्दल विचारा...',
    listening: 'ऐकत आहे... बोला',
    speak: 'आवाजाद्वारे विचारा',
    stopSpeak: 'थांबवा',
    readAloud: 'ऐका',
    stopAudio: 'ऑडिओ थांबवा',
    searchPlaceholder: 'शहर किंवा तालुका शोधा...',
    currentWeather: 'सध्याचे हवामान',
    temperature: 'तापमान',
    feelsLike: 'जाणवणारे तापमान',
    humidity: 'आर्द्रता',
    windSpeed: 'वाऱ्याचा वेग',
    pressure: 'हवेचा दाब',
    aqi: 'हवेची गुणवत्ता (AQI)',
    hourlyForecast: '२४ तासांचा अंदाज',
    weeklyForecast: '७ दिवसांचा अंदाज',
    nwpTitle: 'NWP मॉडेल तुलना (GFS वि ECMWF)',
    radarTitle: 'थेट डॉप्लर रडार',
    agriTitle: 'शेतकरी कृषी सल्ला',
    aviationTitle: 'विमानतळ हवामान (METAR)',
    marineTitle: 'मच्छीमार व सागरी सुरक्षा',
    disasterTitle: 'आपत्ती पूर्वसूचना (CAP)',
    climateTitle: 'हवामान बदल अभ्यास',
    clearChat: 'चॅट साफ करा',
    suggestedChips: [
      '🌾 या आठवड्यात पाऊस पडेल का? पिकांची काढणी करावी का?',
      '⚓ अरबी समुद्रातील मच्छिमारांसाठी इशारा काय आहे?',
      '📊 मुंबई विमानतळ (VABB) हवामान ब्रीफिंग'
    ]
  }
};

// Fallback for other languages to English with localized title
['gu', 'kn', 'ml', 'pa', 'or', 'ur'].forEach(langCode => {
  if (!UI_TRANSLATIONS[langCode]) {
    UI_TRANSLATIONS[langCode] = {
      ...UI_TRANSLATIONS.en,
      appTitle: 'WeatherGPT',
      placeholder: 'Ask about weather forecasts, agriculture advisories, marine warnings...'
    };
  }
});

// Speech Recognition Wrapper
export class VoiceRecognition {
  constructor(lang = 'en-IN', onResult = () => {}, onError = () => {}, onEnd = () => {}) {
    this.lang = lang;
    this.onResult = onResult;
    this.onError = onError;
    this.onEnd = onEnd;
    this.recognition = null;
    this.isListening = false;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = lang;

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        this.onResult(transcript, event.results[0].isFinal);
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        this.isListening = false;
        this.onError(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.onEnd();
      };
    }
  }

  start() {
    if (!this.recognition) {
      this.onError('Speech recognition not supported in this browser');
      return false;
    }
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
      this.recognition.stop();
      this.isListening = false;
    }
  }

  setLang(newLang) {
    this.lang = newLang;
    if (this.recognition) {
      this.recognition.lang = newLang;
    }
  }
}

// Text to Speech Synthesizer Wrapper
export function speakText(text, langCode = 'en', onStart = () => {}, onEnd = () => {}) {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis not supported');
    return;
  }

  window.speechSynthesis.cancel(); // cancel any previous utterance

  // Clean markdown tags, emojis, and special chars for smooth voice
  const cleanText = text
    .replace(/[#*_`~[\]()><]/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const langObj = SUPPORTED_LANGUAGES.find(l => l.code === langCode) || SUPPORTED_LANGUAGES[0];
  utterance.lang = langObj.speechLang || 'en-IN';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Try to find matching regional voice
  const voices = window.speechSynthesis.getVoices();
  const regionalVoice = voices.find(v => v.lang === utterance.lang || v.lang.startsWith(langCode));
  if (regionalVoice) {
    utterance.voice = regionalVoice;
  }

  utterance.onstart = onStart;
  utterance.onend = onEnd;
  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
