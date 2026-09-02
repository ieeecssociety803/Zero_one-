"""
AI Meteorological & Conversational NLP Engine (Python)
Provides rural-friendly, natural, personalized weather assistance ("Chandra").
Supports 12 Indian regional languages without markdown clutter, and updates map coordinates when places are mentioned.
"""

import re
from typing import Dict, Any, Optional, Tuple, List
import httpx

from .agri_service import generate_agri_advisory
from .aviation_service import generate_aviation_briefing
from .marine_service import generate_marine_advisory
from .nwp_service import fetch_nwp_comparison
from .climate_service import fetch_historical_climate_analytics
from .disaster_service import get_active_disaster_alerts
from .weather_service import search_locations, fetch_comprehensive_weather, POPULAR_LOCATIONS

LANG_CODES_MAP = {
    "hindi": "hi", "हिंदी": "hi", "हिन्दी": "hi",
    "malayalam": "ml", "മലയാളം": "ml", "malayalam": "ml",
    "tamil": "ta", "தமிழ்": "ta",
    "telugu": "te", "తెలుగు": "te",
    "bengali": "bn", "bangla": "bn", "বাংলা": "bn",
    "marathi": "mr", "मराठी": "mr",
    "gujarati": "gu", "ગુજરાતી": "gu",
    "kannada": "kn", "ಕನ್ನಡ": "kn",
    "punjabi": "pa", "ਪੰਜਾਬੀ": "pa",
    "odia": "or", "oriya": "or", "ଓଡ଼ିଆ": "or",
    "urdu": "ur", "اردو": "ur",
    "english": "en", "अंग्रेजी": "en", "ഇംഗ്ലീഷ്": "en"
}

# Clean language confirmations (Simple, warm, no robotic symbols)
LANG_CONFIRMATIONS = {
    "ml": "തീർച്ചയായും! ഇനി ഞാൻ മലയാളത്തിൽ സംസാരിക്കാം. എന്താണ് അറിയേണ്ടത്?",
    "hi": "हाँ बिल्कुल! अब मैं आपसे हिन्दी में बात करूँगी। आप क्या जानना चाहते हैं?",
    "ta": "நிச்சயமாக! இனி நான் உங்களுடன் தமிழில் பேசுகிறேன். உங்களுக்கு என்ன தகவல் வேண்டும்?",
    "te": "తప్పకుండా! ఇకపై నేను మీతో తెలుగులో మాట్లాడతాను. మీకు ఏ సమాచారం కావాలి?",
    "bn": "অবশ্যই! এখন আমি আপনার সাথে বাংলায় কথা বলব। আপনার কী তথ্য প্রয়োজন?",
    "mr": "नक्कीच! आता मी मराठीत बोलेन. तुम्हाला काय माहिती हवी आहे?",
    "gu": "ચોક્કસ! હવે હું ગુજરાતીમાં વાત કરીશ. તમને શું માહિતી જોઈએ છે?",
    "kn": "ಖಂಡಿತ! ಇನ್ನು ಮುಂದೆ ನಾನು ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡುತ್ತೇನೆ. ನಿಮಗೆ ಯಾವ ಮಾಹಿತಿ ಬೇಕು?",
    "pa": "ਜ਼ਰੂਰ! ਹੁਣ ਮੈਂ ਪੰਜਾਬੀ ਵਿੱਚ ਗੱਲ ਕਰਾਂਗੀ। ਤੁਹਾਨੂੰ ਕੀ ਜਾਣਕਾਰੀ ਚਾਹੀਦੀ ਹੈ?",
    "or": "ନିଶ୍ଚୟ! ଏବେ ମୁଁ ଓଡ଼ିଆରେ କଥା ହେବି। ଆପଣଙ୍କୁ କ’ଣ ସୂଚନା ଦରକାର?",
    "ur": "ضرور! اب میں اردو میں بات کروں گی۔ آپ کو کیا معلومات چاہیے؟",
    "en": "Sure! I am now speaking in English. How can I help you today?"
}

KNOWN_INDIAN_CITIES = {
    "thrissur": {"name": "Thrissur", "state": "Kerala", "lat": 10.5276, "lon": 76.2144},
    "trichur": {"name": "Thrissur", "state": "Kerala", "lat": 10.5276, "lon": 76.2144},
    "kochi": {"name": "Kochi", "state": "Kerala", "lat": 9.9312, "lon": 76.2673},
    "cochin": {"name": "Kochi", "state": "Kerala", "lat": 9.9312, "lon": 76.2673},
    "trivandrum": {"name": "Thiruvananthapuram", "state": "Kerala", "lat": 8.5241, "lon": 76.9366},
    "thiruvananthapuram": {"name": "Thiruvananthapuram", "state": "Kerala", "lat": 8.5241, "lon": 76.9366},
    "calicut": {"name": "Kozhikode", "state": "Kerala", "lat": 11.2588, "lon": 75.7804},
    "kozhikode": {"name": "Kozhikode", "state": "Kerala", "lat": 11.2588, "lon": 75.7804},
    "kollam": {"name": "Kollam", "state": "Kerala", "lat": 8.8932, "lon": 76.6141},
    "palakkad": {"name": "Palakkad", "state": "Kerala", "lat": 10.7867, "lon": 76.6548},
    "kannur": {"name": "Kannur", "state": "Kerala", "lat": 11.8745, "lon": 75.3704},
    "alappuzha": {"name": "Alappuzha", "state": "Kerala", "lat": 9.4981, "lon": 76.3388},
    "alleppey": {"name": "Alappuzha", "state": "Kerala", "lat": 9.4981, "lon": 76.3388},
    "kottayam": {"name": "Kottayam", "state": "Kerala", "lat": 9.5916, "lon": 76.5222},
    "wayanad": {"name": "Wayanad", "state": "Kerala", "lat": 11.6854, "lon": 76.1320},
    "munnar": {"name": "Munnar", "state": "Kerala", "lat": 10.0889, "lon": 77.0595},
    "chennai": {"name": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lon": 80.2707},
    "madurai": {"name": "Madurai", "state": "Tamil Nadu", "lat": 9.9252, "lon": 78.1198},
    "coimbatore": {"name": "Coimbatore", "state": "Tamil Nadu", "lat": 11.0168, "lon": 76.9558},
    "bengaluru": {"name": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lon": 77.5946},
    "bangalore": {"name": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lon": 77.5946},
    "mysuru": {"name": "Mysuru", "state": "Karnataka", "lat": 12.2958, "lon": 76.6394},
    "hyderabad": {"name": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lon": 78.4867},
    "mumbai": {"name": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lon": 72.8777},
    "pune": {"name": "Pune", "state": "Maharashtra", "lat": 18.5204, "lon": 73.8567},
    "delhi": {"name": "New Delhi", "state": "Delhi", "lat": 28.6139, "lon": 77.2090},
    "new delhi": {"name": "New Delhi", "state": "Delhi", "lat": 28.6139, "lon": 77.2090},
    "kolkata": {"name": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lon": 88.3639},
    "jaipur": {"name": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lon": 75.7873},
    "ahmedabad": {"name": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lon": 72.5714},
    "lucknow": {"name": "Lucknow", "state": "Uttar Pradesh", "lat": 26.8467, "lon": 80.9462},
    "patna": {"name": "Patna", "state": "Bihar", "lat": 25.5941, "lon": 85.1376}
}

async def process_nlp_query(
    query: str,
    current_weather: Dict[str, Any],
    location_name: str,
    lat: float,
    lon: float,
    lang: str = "en",
    api_key: str = "",
    provider: str = "builtin"
) -> Dict[str, Any]:
    if not query or not query.strip():
        greeting_text = (
            "നമസ്കാരം! ഞാൻ ചന്ദ്ര. ഇന്നത്തെ കാലാവസ്ഥയെക്കുറിച്ചോ കൃഷിയെക്കുറിച്ചോ എന്താണ് അറിയേണ്ടത്?"
            if lang == "ml" else
            "नमस्ते! मैं चन्द्रा हूँ। आज के मौसम, फसल या यात्रा के बारे में आप क्या जानना चाहते हैं?"
            if lang == "hi" else
            "Hello! I am Chandra. How can I help you with weather, farming, or your daily plans today?"
        )
        return {"type": "greeting", "text": greeting_text}

    clean_q = query.lower().strip()

    # 1. Language Switching Detection
    for lang_name, code in LANG_CODES_MAP.items():
        if (f"to {lang_name}" in clean_q or f"in {lang_name}" in clean_q or 
            f"speak {lang_name}" in clean_q or f"talk {lang_name}" in clean_q or 
            f"switch {lang_name}" in clean_q or f"change {lang_name}" in clean_q or 
            clean_q == lang_name or f"set language {lang_name}" in clean_q):
            
            confirmation = LANG_CONFIRMATIONS.get(code, LANG_CONFIRMATIONS["en"])
            return {
                "type": "language_switch",
                "target_lang": code,
                "text": confirmation
            }

    # 2. Extract Location if mentioned anywhere in the query (e.g. "Thrissur", "how is weather in Delhi")
    new_location = None
    weather = current_weather

    # Check known Indian cities map first
    for city_key, city_info in KNOWN_INDIAN_CITIES.items():
        if re.search(r'\b' + re.escape(city_key) + r'\b', clean_q):
            target_name = city_info["name"]
            if target_name.lower() != location_name.lower().split(",")[0]:
                lat, lon = city_info["lat"], city_info["lon"]
                location_name = f"{city_info['name']}, {city_info['state']}"
                weather = await fetch_comprehensive_weather(lat, lon, location_name)
                new_location = {
                    "name": city_info["name"],
                    "state": city_info["state"],
                    "country": "India",
                    "lat": lat,
                    "lon": lon
                }
            break

    # If no known city matched, try checking search locations for nouns
    if not new_location:
        words = re.findall(r'[a-zA-Z]{3,}', clean_q)
        common_words = {"what", "when", "where", "weather", "today", "tomorrow", "rain", "rainy", "hot", "cold", "temp", "temperature", "will", "need", "should", "wear", "take", "umbrella", "good", "morning", "evening", "tell", "about", "how", "kisan", "crop", "chandra"}
        for w in words:
            if w not in common_words:
                matches = await search_locations(w)
                if matches and matches[0]["name"].lower() == w:
                    t = matches[0]
                    lat, lon = t["lat"], t["lon"]
                    location_name = f"{t['name']}, {t.get('state', t.get('country'))}"
                    weather = await fetch_comprehensive_weather(lat, lon, location_name)
                    new_location = t
                    break

    # 3. External LLM Bridge if configured
    if api_key and provider == "gemini":
        try:
            gemini_res = await call_gemini_llm(query, weather, location_name, lang, api_key)
            if gemini_res:
                if new_location:
                    gemini_res["new_location"] = new_location
                return gemini_res
        except Exception as e:
            print(f"Gemini API invocation error: {e}")

    # 4. Generate Natural, Simple, Personalized Multilingual Response (No raw asterisk markdown clutter!)
    response = generate_personalized_response(clean_q, weather, location_name, lang)
    if new_location:
        response["new_location"] = new_location

    return response

def generate_personalized_response(clean_q: str, weather: Dict[str, Any], location_name: str, lang: str) -> Dict[str, Any]:
    c = weather.get("current", {})
    temp = c.get("temperature", 27)
    feels = c.get("apparent_temperature", 28)
    cond = c.get("condition", "Mainly Clear")
    hum = c.get("humidity", 65)
    wind = c.get("wind_speed", 10)
    daily = weather.get("daily", [])
    aqi = weather.get("aqi", {})
    us_aqi = aqi.get("us_aqi", 50)
    loc = location_name.split(",")[0]

    rain_prob = daily[0].get("precipProb", 10) if daily else 10
    has_rain = rain_prob > 35 or c.get("precipitation", 0) > 0.2 or "Rain" in cond or "Drizzle" in cond

    # INTENT A: Rain & Umbrella
    if any(k in clean_q for k in ["rain", "umbrella", "shower", "barish", "varsa", "mazha", "parasun"]):
        if lang == "ml":
            text = (
                f"{loc}-ൽ ഇന്ന് മഴയ്ക്ക് സാധ്യതയുണ്ട് ({rain_prob}%). പുറത്തിറങ്ങുമ്പോൾ കുട കരുതുന്നത് നല്ലതാണ്."
                if has_rain else
                f"{loc}-ൽ ഇന്ന് മഴയ്ക്ക് സാധ്യത കുറവാണ് ({rain_prob}%). കാലാവസ്ഥ പ്രധാനമായും തെളിഞ്ഞതായിരിക്കും. കുടയുടെ ആവശ്യമില്ല."
            )
        elif lang == "hi":
            text = (
                f"{loc} में आज बारिश की संभावना {rain_prob}% है। बाहर जाते समय छाता साथ रखें।"
                if has_rain else
                f"{loc} में आज बारिश की संभावना बहुत कम ({rain_prob}%) है। मौसम साफ रहेगा, छाते की जरूरत नहीं है।"
            )
        elif lang == "ta":
            text = (
                f"{loc}-ல் இன்று மழை பெய்ய வாய்ப்புள்ளது ({rain_prob}%). குடை எடுத்துச் செல்வது நல்லது."
                if has_rain else
                f"{loc}-ல் இன்று மழைக்கு வாய்ப்பு குறைவு ({rain_prob}%). வானிலை தெளிவாக இருக்கும்."
            )
        else:
            text = (
                f"In {loc} today, there is a good chance of rain ({rain_prob}%). It is best to carry an umbrella with you."
                if has_rain else
                f"In {loc} today, rain is unlikely ({rain_prob}% chance). The skies will remain mostly clear."
            )
        return {"type": "rain_check", "text": text}

    # INTENT B: Clothing & Workout Advice
    if any(k in clean_q for k in ["wear", "cloth", "run", "workout", "outdoor", "cycling", "walk", "kapde"]):
        if lang == "ml":
            text = (
                f"{loc}-ൽ ഇപ്പോൾ {temp}°C ചൂടുണ്ട്. നേർത്ത കോട്ടൺ വസ്ത്രങ്ങൾ ധരിക്കുന്നതാണ് സുഖകരം. ധാരാളം വെള്ളം കുടിക്കുക."
                if temp > 30 else
                f"{loc}-ൽ ഇപ്പോൾ {temp}°C ചൂടോടെ സുഖകരമായ കാലാവസ്ഥയാണ്. സാധാരണ വസ്ത്രങ്ങൾ ധരിക്കാം."
            )
        elif lang == "hi":
            text = (
                f"{loc} में तापमान {temp}°C है। हल्के सूती कपड़े पहनें और पर्याप्त पानी पिएं।"
                if temp > 30 else
                f"{loc} में सुहावना मौसम ({temp}°C) है। बाहर टहलने या कसरत के लिए यह अच्छा समय है।"
            )
        else:
            text = (
                f"The temperature in {loc} is {temp}°C. Wear light, breathable cotton clothes and stay hydrated."
                if temp > 30 else
                f"The weather in {loc} is pleasant at {temp}°C. Standard comfortable clothes are fine."
            )
        return {"type": "lifestyle", "text": text}

    # INTENT C: Kisan & Farming Guidance
    if any(k in clean_q for k in ["kisan", "crop", "wheat", "rice", "paddy", "spray", "pesticide", "fertilizer", "irrigation", "harvest", "krishi", "kheti", "krishi"]):
        agri = generate_agri_advisory(weather)
        irr = agri["irrigation"]["status"]
        spr = agri["spraying"]["status"]
        soil_m = agri["soilMoisture"]

        if lang == "ml":
            text = f"{loc}-ലെ കർഷകർക്കുള്ള നിർദ്ദേശം: നനയ്ക്കുന്നത് ഇപ്പോൾ '{irr}' ആണ്. കീടനാശിനി തളിക്കുന്നത് '{spr}' ആണ്. മണ്ണിന്റെ ഈർപ്പം {soil_m} ആണ്."
        elif lang == "hi":
            text = f"{loc} के किसान भाइयों के लिए सलाह: सिंचाई की स्थिति '{irr}' है। कीटनाशक छिड़काव '{spr}' है। मिट्टी की नमी {soil_m} है।"
        elif lang == "ta":
            text = f"{loc} விவசாயிகளுக்கான ஆலோசனை: பாசன நிலை '{irr}'. மருந்து தெளிப்பது '{spr}'. மண்ணின் ஈரப்பதம் {soil_m}."
        else:
            text = f"Farm advisory for {loc}: Irrigation status is {irr}. Chemical spraying is {spr}. Current soil moisture is {soil_m}."
        return {"type": "agriculture", "text": text}

    # INTENT D: Marine Safety for Fishermen
    if any(k in clean_q for k in ["marine", "sea", "boat", "fish", "wave", "swell", "coast", "samundar", "trawler"]):
        marine = generate_marine_advisory(weather.get("lat", 9.9), weather.get("lon", 76.2), weather)
        flag = marine["alertFlag"]
        if lang == "ml":
            text = f"{loc} തീരദേശത്തെ കടൽ സുരക്ഷാ മുന്നറിയിപ്പ്: {flag}. കടൽ അവസ്ഥ: {marine['seaState']}. തിരമാല ഉയരം: {marine['waveHeight']}. {marine['fishermenWarning']}"
        elif lang == "hi":
            text = f"{loc} तटीय क्षेत्र के लिए समुद्री चेतावनी: {flag}। समुद्र की स्थिति: {marine['seaState']}। {marine['fishermenWarning']}"
        else:
            text = f"Marine status for {loc}: {flag}. Sea condition is {marine['seaState']} with wave height around {marine['waveHeight']}. {marine['fishermenWarning']}"
        return {"type": "marine", "text": text}

    # DEFAULT INTENT: Warm, Simple, Conversational Weather Summary
    if lang == "ml":
        text = f"{loc}-ൽ ഇപ്പോൾ {temp}°C ചൂടും {cond} കാലാവസ്ഥയുമാണ്. കാറ്റിന്റെ വേഗത മണിക്കൂറിൽ {wind} കിലോമീറ്ററാണ്, ഈർപ്പം {hum}% ഉണ്ട്. വായുവിന്റെ ഗുണനിലവാരം സാധാരണ നിലയിലാണ് (AQI {us_aqi})."
    elif lang == "hi":
        text = f"{loc} में अभी तापमान {temp}°C है और मौसम {cond} है। हवा की गति {wind} किमी/घंटा और नमी {hum}% है। वायु गुणवत्ता सामान्य (AQI {us_aqi}) है।"
    elif lang == "ta":
        text = f"{loc}-ல் தற்போது வெப்பநிலை {temp}°C ({cond}). காற்றின் வேகம் மணிக்கு {wind} கி.மீ. காற்று தரம் AQI {us_aqi}."
    elif lang == "te":
        text = f"{loc} లో ప్రస్తుత ఉష్ణోగ్రత {temp}°C ({cond}). గాలి వేగం గంటకు {wind} కి.మీ. గాలి నాణ్యత AQI {us_aqi}."
    elif lang == "bn":
        text = f"{loc}-এ এখন তাপমাত্রা {temp}°C এবং আবহাওয়া {cond}। বাতাসের গতি {wind} কিমি/ঘণ্টা এবং আর্দ্রতা {hum}%।"
    elif lang == "mr":
        text = f"{loc} येथे सध्या तापमान {temp}°C असून हवामान {cond} आहे. वाऱ्याचा वेग ताशी {wind} किमी आहे."
    elif lang == "gu":
        text = f"{loc} માં અત્યારે તાપમાન {temp}°C છે અને હવામાન {cond} છે. પવનની ગતિ {wind} કિમી/કલાક છે."
    elif lang == "kn":
        text = f"{loc} ನಲ್ಲಿ ಈಗಿನ ತಾಪಮಾನ {temp}°C ({cond}). ಗಾಳಿಯ ವೇಗ ಗಂಟೆಗೆ {wind} ಕಿ.ಮೀ."
    elif lang == "pa":
        text = f"{loc} ਵਿੱਚ ਹੁਣ ਤਾਪਮਾਨ {temp}°C ਹੈ ਅਤੇ ਮੌਸਮ {cond} ਹੈ। ਹਵਾ ਦੀ ਰਫ਼ਤਾਰ {wind} ਕਿਲੋਮੀਟਰ/ਘੰਟਾ ਹੈ।"
    elif lang == "or":
        text = f"{loc} ରେ ବର୍ତ୍ତମାନ ତାପମାତ୍ରା {temp}°C ଏବଂ ପାଣିପାଗ {cond} ଅଛି।"
    elif lang == "ur":
        text = f"{loc} میں ابھی درجہ حرارت {temp}°C ہے اور موسم {cond} ہے۔ ہوا کی رفتار {wind} کلومیٹر فی گھنٹہ ہے۔"
    else:
        text = f"In {loc} right now, it is {temp}°C with {cond}. Winds are gentle at {wind} km/h with {hum}% humidity. The air quality is {aqi.get('category', 'Moderate')} (AQI {us_aqi})."

    return {"type": "general", "text": text}

async def call_gemini_llm(prompt: str, weather: Dict[str, Any], location: str, lang: str, api_key: str) -> Optional[Dict[str, Any]]:
    c = weather.get("current", {})
    aqi = weather.get("aqi", {})
    
    sys_prompt = (
        f"You are Chandra, a warm, friendly, concise AI weather assistant for everyday citizens and farmers in India. "
        f"Current conditions in {location}: Temp {c.get('temperature')}°C, Condition: {c.get('condition')}, Humidity: {c.get('humidity')}%, Wind: {c.get('wind_speed')} km/h, AQI: {aqi.get('us_aqi')}. "
        f"CRITICAL RULES: "
        f"1. Respond directly and naturally in language code: {lang}. "
        f"2. DO NOT use markdown asterisks or bullet lists. Speak like a friendly human companion in simple sentences. "
        f"3. Give personalized practical advice (e.g. umbrella, farming, clothing, travel)."
    )

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    async with httpx.AsyncClient(timeout=8.0) as client:
        res = await client.post(
            url,
            json={
                "contents": [{
                    "role": "user",
                    "parts": [{"text": f"{sys_prompt}\n\nUser: {prompt}"}]
                }]
            }
        )
        if res.status_code == 200:
            data = res.json()
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    clean_text = parts[0].get("text", "").replace("*", "").replace("#", "").strip()
                    return {"type": "llm", "text": clean_text}
    return None
