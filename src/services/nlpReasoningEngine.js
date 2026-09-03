// Dynamic API Base URL resolution for both Desktop (localhost) and Mobile (LAN IP / Remote)
export const getApiBase = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // If running via LAN IP (e.g. 192.168.1.53 or 10.x.x.x), use that host on port 8000
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:8000/api`;
    }
  }
  return 'http://127.0.0.1:8000/api';
};

export async function processWeatherGPTQuery({ 
  query, 
  currentWeatherData, 
  activeLocation, 
  activeLanguage = 'en', 
  apiKey = '', 
  provider = 'builtin' 
}) {
  if (!query || !query.trim()) {
    const defaultGreeting = activeLanguage === 'ml' 
      ? 'നമസ്കാരം! ഞാൻ ചന്ദ്ര. ഇന്നത്തെ മഴ, വെയിൽ, തുണി ഉണക്കൽ, യാത്ര അല്ലെങ്കിൽ കൃഷി കാര്യങ്ങളിൽ എന്താണ് അറിയേണ്ടത്?'
      : activeLanguage === 'hi'
      ? 'नमस्ते! मैं चन्द्रा हूँ। आज के मौसम, बारिश, कपड़े सुखाने या यात्रा के बारे में आप क्या जानना चाहते हैं?'
      : 'Hello! I am Chandra. How can I assist you with today\'s weather, farming, or daily plans?';
    return { text: defaultGreeting, type: 'greeting' };
  }

  const cleanQuery = query.trim();
  const apiBase = getApiBase();

  // 1. Attempt call to Python FastAPI Backend (Works across both Desktop and Mobile over LAN)
  try {
    const res = await fetch(`${apiBase}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: cleanQuery,
        lat: activeLocation.lat,
        lon: activeLocation.lon,
        location_name: `${activeLocation.name}, ${activeLocation.state || activeLocation.country || ''}`,
        current_weather: currentWeatherData,
        lang: activeLanguage,
        api_key: apiKey,
        provider: provider
      }),
      signal: AbortSignal.timeout(4000) // 4 second timeout
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Backend chat unreachable from current device, executing client personalized NLP:', err);
  }

  // 2. High-Fidelity Client-Side Personalized NLP Engine (Guarantees deep personalization on Mobile as well!)
  return generateClientPersonalizedResponse(cleanQuery, currentWeatherData, activeLocation, activeLanguage);
}

/**
 * Client-side mirrored Personalized NLP Engine (Exact parity with Python engine)
 * Ensures Mobile never falls back to generic raw data dumps!
 */
function generateClientPersonalizedResponse(query, weatherData, activeLocation, lang) {
  const cleanQ = query.toLowerCase();
  const c = weatherData?.current || {};
  const temp = Math.round(c.temperature || 27);
  const feels = Math.round(c.apparent_temperature || 28);
  const cond = c.condition || 'Mainly Clear';
  const hum = Math.round(c.humidity || 70);
  const wind = Math.round(c.wind_speed || 10);
  const daily = weatherData?.daily || [];
  const rawLoc = activeLocation?.name || 'Kochi';

  const loc_ml = (rawLoc.toLowerCase().includes('current') || rawLoc.toLowerCase().includes('live')) 
    ? 'ഇവിടെ നിങ്ങളുടെ പ്രദേശത്ത്' 
    : `${rawLoc}-ൽ`;
  const loc_hi = (rawLoc.toLowerCase().includes('current') || rawLoc.toLowerCase().includes('live'))
    ? 'यहाँ आपके इलाके में'
    : `${rawLoc} में`;
  const loc_en = (rawLoc.toLowerCase().includes('current') || rawLoc.toLowerCase().includes('live'))
    ? 'here in your area'
    : `in ${rawLoc}`;

  const dailyPrecip = daily[0]?.precipProb || 20;
  const isCloudy = /overcast|cloud|drizzle|rain|shower|thunder/i.test(cond);
  
  let rainProb = dailyPrecip;
  let hasRainThreat = false;

  if (/rain|drizzle|shower|thunder/i.test(cond)) {
    rainProb = Math.max(dailyPrecip, 85);
    hasRainThreat = true;
  } else if (/overcast/i.test(cond)) {
    rainProb = Math.max(dailyPrecip, 65);
    hasRainThreat = true;
  } else if (/cloud/i.test(cond) || hum > 80) {
    rainProb = Math.max(dailyPrecip, 45);
    hasRainThreat = true;
  } else {
    hasRainThreat = rainProb > 35;
  }

  // INTENT 1: DRYING CLOTHES / LAUNDRY
  if (/തുണി|അലക്ക്|ഉണങ്ങാൻ|ഉണക്കാൻ|അലക്കാൻ|thuni|unakkan|unangan|alakk|alakan|कपड़े|सुखाना|sukana|kapde|dry|cloth|laundry|washing/i.test(cleanQ)) {
    if (lang === 'ml') {
      const text = hasRainThreat
        ? `${loc_ml} ഇപ്പോൾ ആകാശം കാർമേഘാവൃതമാണ് (${cond}), ${rainProb}% മഴയ്ക്ക് സാധ്യതയുണ്ട്. അതുകൊണ്ട് തുണികൾ പുറത്ത് ഉണങ്ങാനിടുന്നത് ഒഴിവാക്കുക. തുണികൾ നനഞ്ഞുപോകാൻ സാധ്യതയുള്ളതിനാൽ വീട്ടിനുള്ളിൽ ഉണക്കുന്നതാണ് സുരക്ഷിതം.`
        : `${loc_ml} ഇന്ന് നല്ല വെയിലും തെളിഞ്ഞ ആകാശവുമാണ്, മഴയ്ക്ക് സാധ്യത വളരെ കുറവാണ് (${rainProb}%). തുണികൾ പുറത്തിട്ട് വേഗത്തിൽ ഉണക്കിയെടുക്കാൻ ഇന്ന് വളരെ അനുയോജ്യമായ ദിവസമാണ്.`;
      return { type: 'laundry', text };
    } else if (lang === 'hi') {
      const text = hasRainThreat
        ? `${loc_hi} आज बादल छाए हुए हैं (${cond}) और ${rainProb}% बारिश की संभावना है। कपड़े बाहर सुखाना जोखिम भरा रहेगा, इसलिए उन्हें अंदर ही सुखाएं।`
        : `${loc_hi} आज धूप खिली हुई है और बारिश की संभावना केवल ${rainProb}% है। कपड़े बाहर आसानी से और जल्दी सूख जाएंगे।`;
      return { type: 'laundry', text };
    } else {
      const text = hasRainThreat
        ? `Skies ${loc_en} are currently ${cond.toLowerCase()} with a ${rainProb}% chance of rain. It is not recommended to dry clothes outdoors today. Best to dry them inside.`
        : `The weather ${loc_en} is sunny and clear with low rain chance (${rainProb}%). It is a great day to dry your laundry outside.`;
      return { type: 'laundry', text };
    }
  }

  // INTENT 2: RAIN & UMBRELLA
  if (/മഴ|കുട|ചാറ്റൽമഴ|ഇടിമിന്നൽ|പെയ്യുമോ|പെയ്യും|mazha|peyyumo|peyyum|kuda|बारिश|छाता|barish|chata|rain|umbrella|shower|precip/i.test(cleanQ)) {
    if (lang === 'ml') {
      const text = hasRainThreat
        ? `അതെ, ${loc_ml} ഇന്ന് ${rainProb}% മഴയ്ക്ക് സാധ്യതയുണ്ട്. ആകാശം ${cond} ആയി തുടരുന്നതിനാൽ പുറത്തിറങ്ങുമ്പോൾ തീർച്ചയായും കയ്യിൽ ഒരു കുട കരുതുന്നത് വളരെ നല്ലതാണ്.`
        : `ഇല്ല, ${loc_ml} ഇന്ന് മഴ പെയ്യാൻ സാധ്യത വളരെ കുറവാണ് (${rainProb}%). കാലാവസ്ഥ പ്രധാനമായും തെളിഞ്ഞതായിരിക്കും, കുട കരുതേണ്ട ആവശ്യമില്ല.`;
      return { type: 'rain_check', text };
    } else if (lang === 'hi') {
      const text = hasRainThreat
        ? `हाँ, ${loc_hi} आज ${rainProb}% बारिश की संभावना है (${cond})। बाहर निकलते समय छाता जरूर साथ रखें।`
        : `नहीं, ${loc_hi} आज बारिश की संभावना बहुत कम (${rainProb}%) है। मौसम साफ रहेगा।`;
      return { type: 'rain_check', text };
    } else {
      const text = hasRainThreat
        ? `Yes, there is a ${rainProb}% chance of rain ${loc_en} today with ${cond.toLowerCase()} skies. Make sure to carry an umbrella when heading out.`
        : `No, rain is unlikely ${loc_en} today (${rainProb}% chance). Skies are expected to remain clear.`;
      return { type: 'rain_check', text };
    }
  }

  // INTENT 3: TRAVEL / GOING OUT
  if (/യാത്ര|പുറത്ത്|പോകാൻ|പോകാമോ|yathra|purathu|pokan|pokamo|travel|trip|drive|go out|commute/i.test(cleanQ)) {
    if (lang === 'ml') {
      const text = hasRainThreat
        ? `${loc_ml} യാത്രയ്ക്ക് പോകുമ്പോൾ ശ്രദ്ധിക്കുക. ${cond} കാലാവസ്ഥയും ${rainProb}% മഴ സാധ്യതയും ഉള്ളതിനാൽ റോഡുകളിൽ വഴുക്കലുണ്ടാകാം. കുടയോ റെയിൻകോട്ടോ കയ്യിൽ കരുതുക, ശ്രദ്ധിച്ച് വാഹനം ഓടിക്കുക.`
        : `${loc_ml} യാത്ര ചെയ്യാനും പുറത്തുപോകാനും ഇന്ന് വളരെ അനുയോജ്യമായ സുഖകരമായ കാലാവസ്ഥയാണ്. ചൂടുള്ളതിനാൽ വെള്ളം കയ്യിൽ കരുതാൻ മറക്കരുത്.`;
      return { type: 'travel', text };
    } else {
      const text = hasRainThreat
        ? `Travel advice ${loc_en}: Expect ${cond.toLowerCase()} conditions with ${rainProb}% rain probability. Carry rain gear and drive safely.`
        : `Conditions ${loc_en} are pleasant and suitable for travel and commuting today.`;
      return { type: 'travel', text };
    }
  }

  // INTENT 4: KISAN AGRI & FARMING
  if (/കൃഷി|റബ്ബർ|വെട്ടാൻ|ടാപ്പിംഗ്|തെങ്ങ്|നെല്ല്|krishi|rubber|kisan|crop|spray|irrigation/i.test(cleanQ)) {
    if (lang === 'ml') {
      const text = `${loc_ml} കർഷകർക്കുള്ള നിർദ്ദേശം: നനയ്ക്കൽ 'Withhold Irrigation' ആണ്. മഴസാധ്യത ${rainProb}% ഉള്ളതിനാൽ കീടനാശിനി തളിക്കുന്നത് മഴയ്ക്ക് ശേഷം ക്രമീകരിക്കുക.`;
      return { type: 'agriculture', text };
    } else {
      const text = `Agromet advisory ${loc_en}: Irrigation recommendation is Withhold Irrigation due to ${rainProb}% rain probability.`;
      return { type: 'agriculture', text };
    }
  }

  // DEFAULT CONVERSATIONAL SUMMARY
  if (lang === 'ml') {
    const rainPhrase = hasRainThreat ? `ഇന്ന് മഴയ്ക്ക് ${rainProb}% സാധ്യതയുണ്ട്.` : `ഇന്ന് മഴയ്ക്ക് സാധ്യത കുറവാണ് (${rainProb}%).`;
    const text = `${loc_ml} ഇപ്പോൾ ${temp}°C ചൂടും ${cond} കാലാവസ്ഥയുമാണ് അനുഭവപ്പെടുന്നത്. ഈർപ്പം ${hum}% ഉണ്ട്, കാറ്റ് മണിക്കൂറിൽ ${wind} കി.മീ വേഗത്തിലാണ്. ${rainPhrase} എന്തെങ്കിലും പ്രത്യേക സഹായം വേണമെങ്കിൽ ചോദിക്കൂ!`;
    return { type: 'general', text };
  } else if (lang === 'hi') {
    const rainPhrase = hasRainThreat ? `आज ${rainProb}% बारिश की संभावना है।` : `आज बारिश की संभावना कम (${rainProb}%) है।`;
    const text = `${loc_hi} अभी तापमान ${temp}°C है और मौसम ${cond} बना हुआ है। नमी ${hum}% और हवा ${wind} किमी/घंटा है। ${rainPhrase}`;
    return { type: 'general', text };
  } else {
    const rainPhrase = hasRainThreat ? `Expect a ${rainProb}% chance of rain today.` : `Rain is unlikely today (${rainProb}% chance).`;
    const text = `Right now ${loc_en}, it is ${temp}°C with ${cond.toLowerCase()} skies. Humidity is at ${hum}% with wind speeds of ${wind} km/h. ${rainPhrase} How else can I help your day?`;
    return { type: 'general', text };
  }
}
