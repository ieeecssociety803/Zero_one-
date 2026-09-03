"""
AI Meteorological & Conversational NLP Engine (Python)
Provides rural-friendly, deeply personalized, natural weather assistance ("Chandra").
Supports rich vernacular knowledge in Malayalam, Hindi, Tamil, Telugu, and English.
"""

import re
import random
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

LANG_CONFIRMATIONS = {
    "ml": "തീർച്ചയായും! ഇനി ഞാൻ നിങ്ങളോട് മലയാളത്തിൽ സംസാരിക്കാം. ഇന്നത്തെ മഴ, കൃഷി, അല്ലെങ്കിൽ യാത്രയെക്കുറിച്ച് എന്താണ് അറിയേണ്ടത്?",
    "hi": "हाँ बिल्कुल! अब मैं आपसे हिन्दी में बात करूँगी। आज के मौसम, बारिश, खेती या यात्रा के बारे में आप क्या जानना चाहते हैं?",
    "ta": "நிச்சயமாக! இனி நான் உங்களுடன் தமிழில் பேசுகிறேன். இன்றைய மழை அல்லது விவசாயம் பற்றி என்ன தகவல் வேண்டும்?",
    "te": "తప్పకుండా! ఇకపై నేను మీతో తెలుగులో మాట్లాడతాను. నేటి వాతావరణం లేదా వ్యవసాయం గురించి ఏమి తెలుసుకోవాలి?",
    "bn": "অবশ্যই! এখন আমি আপনার সাথে বাংলায় কথা বলব। আজকের আবহাওয়া বা কৃষি সম্পর্কে কী জানতে চান?",
    "mr": "नक्कीच! आता मी मराठीत बोलेन. तुम्हाला आजच्या हवामानाबद्दल काय माहिती हवी आहे?",
    "gu": "ચોક્કસ! હવે હું ગુજરાતીમાં વાત કરીશ. તમને આજના હવામાન વિશે શું જાણવું છે?",
    "kn": "ಖಂಡಿತ! ಇನ್ನು ಮುಂದೆ ನಾನು ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡುತ್ತೇನೆ. ನಿಮಗೆ ಏನು ಮಾಹಿತಿ ಬೇಕು?",
    "pa": "ਜ਼ਰੂਰ! ਹੁਣ ਮੈਂ ਪੰਜਾਬੀ ਵਿੱਚ ਗੱਲ ਕਰਾਂਗੀ। ਤੁਹਾਨੂੰ ਕੀ ਜਾਣਕਾਰੀ ਚਾਹੀਦੀ ਹੈ?",
    "or": "ନିଶ୍ଚୟ! ଏବେ ମୁଁ ଓଡ଼ିଆରେ କଥା ହେବି। ଆପଣଙ୍କୁ କ’ଣ ସୂଚନା ଦରକାର?",
    "ur": "ضرور! اب میں اردو میں بات کروں گی۔ آپ کو کیا معلومات چاہیے؟",
    "en": "Sure! I have switched to English. How can I assist you with the weather, travel, or farming today?"
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
            "നമസ്കാരം! ഞാൻ ചന്ദ്ര. ഇന്നത്തെ മഴ, കാറ്റ്, കൃഷി അല്ലെങ്കിൽ യാത്രാ കാര്യങ്ങളിൽ എന്താണ് സഹായിക്കേണ്ടത്?"
            if lang == "ml" else
            "नमस्ते! मैं चन्द्रा हूँ। आज के मौसम, बारिश, खेती या यात्रा के बारे में आप क्या जानना चाहते हैं?"
            if lang == "hi" else
            "Hello! I am Chandra. How can I assist you with your day, weather, or plans today?"
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

    # 2. Extract Location if mentioned
    new_location = None
    weather = current_weather

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

    if not new_location:
        words = re.findall(r'[a-zA-Z]{3,}', clean_q)
        common_words = {"what", "when", "where", "weather", "today", "tomorrow", "rain", "rainy", "hot", "cold", "temp", "temperature", "will", "need", "should", "wear", "take", "umbrella", "good", "morning", "evening", "tell", "about", "how", "kisan", "crop", "chandra", "cloth", "dry", "travel", "drive", "outside"}
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

    # 4. Generate Highly Personalized & Empathetic Response
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

    rain_prob = daily[0].get("precipProb", 15) if daily else 15
    has_rain = rain_prob > 35 or c.get("precipitation", 0) > 0.2 or "Rain" in cond or "Drizzle" in cond or "Shower" in cond

    # INTENT 1: Clothes Drying / Laundry outdoors
    if any(k in clean_q for k in ["dry", "cloth", "laundry", "thuni", "alarakk"]):
        if lang == "ml":
            if has_rain:
                text = f"{loc}-ൽ ഇന്ന് ഇടയ്ക്കിടെ മഴ പെയ്യാൻ {rain_prob}% സാധ്യതയുണ്ട്. അതുകൊണ്ട് തുണികൾ പുറത്ത് ഉണങ്ങാനിടുന്നത് ഒഴിവാക്കുന്നതാണ് നല്ലത്."
            else:
                text = f"{loc}-ൽ ഇന്ന് നല്ല വെയിലും തെളിഞ്ഞ ആകാശവുമാണ്. തുണികൾ പുറത്തിട്ട് വേഗത്തിൽ ഉണക്കിയെടുക്കാം."
        elif lang == "hi":
            if has_rain:
                text = f"{loc} में आज बारिश की संभावना {rain_prob}% है। कपड़े बाहर सुखाना जोखिम भरा हो सकता है, अंदर ही सुखाएं।"
            else:
                text = f"{loc} में मौसम साफ और धूप वाला है। कपड़े बाहर आसानी से सूख जाएंगे।"
        else:
            text = f"In {loc}, rain probability is {rain_prob}%. " + ("Best to dry clothes indoors to avoid getting wet." if has_rain else "Great day to dry laundry outdoors!")
        return {"type": "laundry", "text": text}

    # INTENT 2: Going Out / Travel / Commute / Driving
    if any(k in clean_q for k in ["go out", "travel", "drive", "trip", "ride", "office", "college", "yathra", "povan"]):
        if lang == "ml":
            if has_rain:
                text = f"{loc}-ൽ പുറത്തിറങ്ങുമ്പോൾ തീർച്ചയായും കുടയോ റെയിൻകോട്ടോ കരുതുക. മഴയുള്ളതിനാൽ റോഡിൽ വഴുക്കലുണ്ടാകാം, പതുക്കെ ശ്രദ്ധിച്ച് യാത്ര ചെയ്യുക."
            else:
                text = f"{loc}-ൽ യാത്രയ്ക്കും പുറത്തുപോകാനും ഇന്ന് വളരെ അനുയോജ്യമായ കാലാവസ്ഥയാണ്. ചൂട് കൂടുതലായതിനാൽ വെള്ളം കരുതാൻ മറക്കരുത്."
        elif lang == "hi":
            if has_rain:
                text = f"{loc} में बाहर निकलते समय छाता या रेनकोट साथ रखें। बारिश के कारण संभलकर गाड़ी चलाएं।"
            else:
                text = f"{loc} में आज बाहर घूमने या यात्रा के लिए बेहतरीन सुहावना मौसम है।"
        else:
            text = f"Travel advice for {loc}: " + ("Carry an umbrella or raincoat and drive carefully due to wet roads." if has_rain else "Pleasant conditions for travel and daily commute.")
        return {"type": "travel", "text": text}

    # INTENT 3: Rain & Umbrella Specific Checks
    if any(k in clean_q for k in ["rain", "umbrella", "shower", "barish", "varsa", "mazha", "parasun", "kuda"]):
        if lang == "ml":
            if has_rain:
                text = f"അതെ, {loc}-ൽ ഇന്ന് മഴ പെയ്യാൻ {rain_prob}% സാധ്യതയുണ്ട്. പുറത്തിറങ്ങുമ്പോൾ കയ്യിൽ ഒരു കുട കരുതുന്നത് വളരെ നല്ലതാണ്."
            else:
                text = f"ഇല്ല, {loc}-ൽ ഇന്ന് മഴയ്ക്ക് സാധ്യത വളരെ കുറവാണ് ({rain_prob}%). ആകാശം തെളിഞ്ഞതായിരിക്കും, കുടയുടെ ആവശ്യമില്ല."
        elif lang == "hi":
            if has_rain:
                text = f"हाँ, {loc} में आज बारिश की संभावना {rain_prob}% है। बाहर निकलते समय छाता जरूर साथ रखें।"
            else:
                text = f"नहीं, {loc} में आज बारिश की संभावना बहुत कम ({rain_prob}%) है। मौसम साफ रहेगा।"
        elif lang == "ta":
            if has_rain:
                text = f"ஆம், {loc}-ல் இன்று மழை பெய்ய {rain_prob}% வாய்ப்புள்ளது. குடை எடுத்துச் செல்வது நல்லது."
            else:
                text = f"இல்லை, {loc}-ல் இன்று மழைக்கு வாய்ப்பு குறைவு ({rain_prob}%). குடை தேவையில்லை."
        else:
            if has_rain:
                text = f"Yes, there is a {rain_prob}% chance of rain in {loc} today. Carrying an umbrella is recommended."
            else:
                text = f"No, rain is unlikely in {loc} today ({rain_prob}% chance). Skies will remain clear."
        return {"type": "rain_check", "text": text}

    # INTENT 4: Workout / Running / Sports
    if any(k in clean_q for k in ["workout", "run", "exercise", "walk", "jog", "play", "cricket", "football"]):
        if lang == "ml":
            if temp > 31 or hum > 80:
                text = f"{loc}-ൽ ഇപ്പോൾ {temp}°C ചൂടും {hum}% ഈർപ്പവും ഉള്ളതിനാൽ നല്ല വിയർപ്പുണ്ടാകും. രാവിലെ നേരത്തെയോ വൈകുന്നേരമോ വ്യായാമം ചെയ്യുന്നതാണ് ഉത്തമം. ധാരാളം വെള്ളം കുടിക്കുക."
            else:
                text = f"{loc}-ൽ ഇപ്പോൾ വ്യായാമത്തിനും നടത്തത്തിനും കായികവിനോദങ്ങൾക്കും വളരെ നല്ല സുഖകരമായ കാലാവസ്ഥയാണ്."
        elif lang == "hi":
            text = f"{loc} में तापमान {temp}°C और नमी {hum}% है। सुबह या शाम के समय कसरत या सैर करना सबसे अच्छा रहेगा।"
        else:
            text = f"Fitness guidance for {loc}: Temperature is {temp}°C with {hum}% humidity. Early mornings or evenings are best for workouts."
        return {"type": "fitness", "text": text}

    # INTENT 5: Kisan / Farming / Rubber Tapping / Crops
    if any(k in clean_q for k in ["kisan", "crop", "rubber", "paddy", "coconut", "pepper", "spray", "pesticide", "fertilizer", "irrigation", "harvest", "krishi", "kheti", "nannakkal"]):
        agri = generate_agri_advisory(weather)
        irr = agri["irrigation"]["status"]
        spr = agri["spraying"]["status"]
        soil_m = agri["soilMoisture"]

        if lang == "ml":
            text = f"{loc}-ലെ കർഷകർക്കുള്ള പ്രത്യേക നിർദ്ദേശം: നനയ്ക്കൽ '{irr}' ആണ്. കീടനാശിനി തളിക്കാൻ '{spr}' അവസ്ഥയാണ്. മണ്ണിന്റെ ഈർപ്പം {soil_m} നിലവാരത്തിലാണ്."
        elif lang == "hi":
            text = f"{loc} के किसान भाइयों के लिए सलाह: सिंचाई की स्थिति '{irr}' है। कीटनाशक छिड़काव के लिए '{spr}' है। मिट्टी की नमी {soil_m} है।"
        elif lang == "ta":
            text = f"{loc} விவசாயிகளுக்கான ஆலோசனை: பாசன நிலை '{irr}'. மருந்து தெளிப்பது '{spr}'. மண்ணின் ஈரப்பதம் {soil_m}."
        else:
            text = f"Agromet advisory for {loc}: Irrigation recommendation is {irr}. Spraying window is {spr}. Current soil moisture is {soil_m}."
        return {"type": "agriculture", "text": text}

    # DEFAULT INTENT: Warm, Natural, Comprehensive Weather Summary
    if lang == "ml":
        text = f"{loc}-ൽ ഇപ്പോൾ {temp}°C ചൂടും {cond} കാലാവസ്ഥയുമാണ് അനുഭവപ്പെടുന്നത്. കാറ്റ് മണിക്കൂറിൽ {wind} കി.മീ വേഗത്തിൽ വീശുന്നുണ്ട്, ഈർപ്പം {hum}% ആണ്. വായുവിന്റെ ഗുണനിലവാരം സാധാരണ നിലയിലാണ്."
    elif lang == "hi":
        text = f"{loc} में अभी तापमान {temp}°C है और मौसम {cond} बना हुआ है। हवा {wind} किमी/घंटा और नमी {hum}% है। वायु गुणवत्ता सामान्य है।"
    elif lang == "ta":
        text = f"{loc}-ல் தற்போது வெப்பநிலை {temp}°C ({cond}). காற்றின் வேகம் மணிக்கு {wind} கி.மீ, ஈரப்பதம் {hum}%. காற்று தரம் நன்று."
    elif lang == "te":
        text = f"{loc} లో ప్రస్తుత ఉష్ణోగ్రత {temp}°C ({cond}). గాలి వేగం గంటకు {wind} కి.మీ, తేమ {hum}%."
    else:
        text = f"In {loc} right now, it is {temp}°C with {cond}. Winds are blowing gently at {wind} km/h with {hum}% humidity. Air quality is good."

    return {"type": "general", "text": text}

async def call_gemini_llm(prompt: str, weather: Dict[str, Any], location: str, lang: str, api_key: str) -> Optional[Dict[str, Any]]:
    c = weather.get("current", {})
    aqi = weather.get("aqi", {})
    
    sys_prompt = (
        f"You are Chandra, a warm, caring, highly intelligent personal AI weather assistant for citizens and farmers in India. "
        f"Location: {location}. Temp: {c.get('temperature')}°C ({c.get('condition')}), Humidity: {c.get('humidity')}%, Wind: {c.get('wind_speed')} km/h, Rain prob: {weather.get('daily', [{}])[0].get('precipProb', 15)}%. "
        f"CRITICAL RULES: "
        f"1. Respond directly and naturally in language code: {lang} (if ml, use pure fluent Malayalam). "
        f"2. DO NOT use markdown asterisks or bullet lists. Speak like a caring human companion in 2-3 natural sentences. "
        f"3. Provide personalized daily advice (e.g. umbrella, laundry, travel, farming)."
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
