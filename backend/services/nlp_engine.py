"""
AI Meteorological & Conversational NLP Engine (Python)
Provides deeply personalized, natural weather assistance ("Chandra").
Supports full Malayalam (both Malayalam Script & Manglish), Hindi (Devanagari & Hinglish),
Tamil, Telugu, and English.
"""

import re
from typing import Dict, Any, Optional, List
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
    "malayalam": "ml", "മലയാളം": "ml",
    "tamil": "ta", "தமிழ்": "ta",
    "telugu": "te", "తెలుగు": "te",
    "bengali": "bn", "বাংলা": "bn",
    "marathi": "mr", "मराठी": "mr",
    "gujarati": "gu", "ગુજરાતી": "gu",
    "kannada": "kn", "ಕನ್ನಡ": "kn",
    "punjabi": "pa", "ਪੰਜਾਬੀ": "pa",
    "odia": "or", "ଓଡ଼ିଆ": "or",
    "urdu": "ur", "اردو": "ur",
    "english": "en", "अंग्रेजी": "en", "ഇംഗ്ലീഷ്": "en"
}

LANG_CONFIRMATIONS = {
    "ml": "തീർച്ചയായും! ഇനി ഞാൻ നിങ്ങളോട് മലയാളത്തിൽ സംസാരിക്കാം. ഇന്നത്തെ മഴ, വെയിൽ, തുണി ഉണക്കൽ, യാത്ര അല്ലെങ്കിൽ കൃഷി കാര്യങ്ങളിൽ എന്താണ് അറിയേണ്ടത്?",
    "hi": "हाँ बिल्कुल! अब मैं आपसे हिन्दी में बात करूँगी। आज के मौसम, बारिश, कपड़े सुखाने या यात्रा के बारे में आप क्या जानना चाहते हैं?",
    "ta": "நிச்சயமாக! இனி நான் உங்களுடன் தமிழில் பேசுகிறேன். இன்றைய மழை அல்லது விவசாயம் பற்றி என்ன தகவல் வேண்டும்?",
    "te": "తప్పకుండా! ఇకపై నేను మీతో తెలుగులో మాట్లాడతాను. నేటి వాతావരണ సమాచారం ఏమి కావాలి?",
    "en": "Sure! I am now speaking in English. How can I assist you with today's rain, travel, farming, or daily plans?"
}

KNOWN_INDIAN_CITIES = {
    "thrissur": {"name": "Thrissur", "state": "Kerala", "lat": 10.5276, "lon": 76.2144},
    "trichur": {"name": "Thrissur", "state": "Kerala", "lat": 10.5276, "lon": 76.2144},
    "തൃശ്ശൂർ": {"name": "Thrissur", "state": "Kerala", "lat": 10.5276, "lon": 76.2144},
    "kochi": {"name": "Kochi", "state": "Kerala", "lat": 9.9312, "lon": 76.2673},
    "cochin": {"name": "Kochi", "state": "Kerala", "lat": 9.9312, "lon": 76.2673},
    "കൊച്ചി": {"name": "Kochi", "state": "Kerala", "lat": 9.9312, "lon": 76.2673},
    "trivandrum": {"name": "Thiruvananthapuram", "state": "Kerala", "lat": 8.5241, "lon": 76.9366},
    "തിരുവനന്തപുരം": {"name": "Thiruvananthapuram", "state": "Kerala", "lat": 8.5241, "lon": 76.9366},
    "calicut": {"name": "Kozhikode", "state": "Kerala", "lat": 11.2588, "lon": 75.7804},
    "കോഴിക്കോട്": {"name": "Kozhikode", "state": "Kerala", "lat": 11.2588, "lon": 75.7804},
    "kollam": {"name": "Kollam", "state": "Kerala", "lat": 8.8932, "lon": 76.6141},
    "കൊല്ലം": {"name": "Kollam", "state": "Kerala", "lat": 8.8932, "lon": 76.6141},
    "palakkad": {"name": "Palakkad", "state": "Kerala", "lat": 10.7867, "lon": 76.6548},
    "പാലക്കാട്": {"name": "Palakkad", "state": "Kerala", "lat": 10.7867, "lon": 76.6548},
    "kannur": {"name": "Kannur", "state": "Kerala", "lat": 11.8745, "lon": 75.3704},
    "കണ്ണൂർ": {"name": "Kannur", "state": "Kerala", "lat": 11.8745, "lon": 75.3704},
    "alappuzha": {"name": "Alappuzha", "state": "Kerala", "lat": 9.4981, "lon": 76.3388},
    "ആലപ്പുഴ": {"name": "Alappuzha", "state": "Kerala", "lat": 9.4981, "lon": 76.3388},
    "kottayam": {"name": "Kottayam", "state": "Kerala", "lat": 9.5916, "lon": 76.5222},
    "കോട്ടയം": {"name": "Kottayam", "state": "Kerala", "lat": 9.5916, "lon": 76.5222},
    "wayanad": {"name": "Wayanad", "state": "Kerala", "lat": 11.6854, "lon": 76.1320},
    "വയനാട്": {"name": "Wayanad", "state": "Kerala", "lat": 11.6854, "lon": 76.1320},
    "munnar": {"name": "Munnar", "state": "Kerala", "lat": 10.0889, "lon": 77.0595},
    "മൂന്നാർ": {"name": "Munnar", "state": "Kerala", "lat": 10.0889, "lon": 77.0595},
    "malappuram": {"name": "Malappuram", "state": "Kerala", "lat": 11.0732, "lon": 76.0740},
    "മലപ്പുറം": {"name": "Malappuram", "state": "Kerala", "lat": 11.0732, "lon": 76.0740},
    "kasaragod": {"name": "Kasaragod", "state": "Kerala", "lat": 12.5102, "lon": 74.9852},
    "കാസർഗോഡ്": {"name": "Kasaragod", "state": "Kerala", "lat": 12.5102, "lon": 74.9852},
    "delhi": {"name": "New Delhi", "state": "Delhi", "lat": 28.6139, "lon": 77.2090},
    "ദില്ലി": {"name": "New Delhi", "state": "Delhi", "lat": 28.6139, "lon": 77.2090},
    "mumbai": {"name": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lon": 72.8777},
    "മുംബൈ": {"name": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lon": 72.8777},
    "bengaluru": {"name": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lon": 77.5946},
    "ബാംഗ്ലൂർ": {"name": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lon": 77.5946},
    "chennai": {"name": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lon": 80.2707},
    "ചെന്നൈ": {"name": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lon": 80.2707}
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
            "നമസ്കാരം! ഞാൻ ചന്ദ്ര. ഇന്നത്തെ മഴ, വെയിൽ, തുണി ഉണക്കൽ, കൃഷി അല്ലെങ്കിൽ യാത്രാ കാര്യങ്ങളിൽ എന്താണ് സഹായിക്കേണ്ടത്?"
            if lang == "ml" else
            "नमस्ते! मैं चन्द्रा हूँ। आज के मौसम, बारिश, कपड़े सुखाने या यात्रा के बारे में आप क्या जानना चाहते हैं?"
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
        if city_key in clean_q:
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

    # 4. Generate Deeply Personalized, Empathetic & Accurate Response
    response = generate_personalized_response(clean_q, weather, location_name, lang)
    if new_location:
        response["new_location"] = new_location

    return response

def generate_personalized_response(clean_q: str, weather: Dict[str, Any], location_name: str, lang: str) -> Dict[str, Any]:
    c = weather.get("current", {})
    temp = c.get("temperature", 27)
    feels = c.get("apparent_temperature", 28)
    cond = c.get("condition", "Mainly Clear")
    hum = c.get("humidity", 70)
    wind = c.get("wind_speed", 10)
    daily = weather.get("daily", [])
    aqi = weather.get("aqi", {})
    us_aqi = aqi.get("us_aqi", 50)
    
    # Clean location name for natural vernacular speech
    raw_loc = location_name.split(",")[0].strip()
    if raw_loc.lower() in ["current location", "selected location", "live gps"]:
        loc_ml = "ഇവിടെ നിങ്ങളുടെ പ്രദേശത്ത്"
        loc_hi = "यहाँ आपके इलाके में"
        loc_en = "here in your area"
    else:
        loc_ml = f"{raw_loc}-ൽ"
        loc_hi = f"{raw_loc} में"
        loc_en = f"in {raw_loc}"

    # Live Synoptic Rain Probability from Open-Meteo
    if daily and len(daily) > 0:
        raw_prob = daily[0].get("precipProb", daily[0].get("precip_probability", 0))
    else:
        raw_prob = 0

    precip_val = c.get("precipitation", 0)
    
    # If active precipitation or rain code is occurring right now, probability is at least 85%
    if precip_val > 0.1 or any(k in cond.lower() for k in ["rain", "drizzle", "shower", "thunder"]):
        rain_prob = max(raw_prob, 85)
        has_rain_threat = True
    elif raw_prob > 0:
        rain_prob = raw_prob
        has_rain_threat = rain_prob >= 35
    elif "overcast" in cond.lower():
        rain_prob = 65
        has_rain_threat = True
    elif "cloud" in cond.lower():
        rain_prob = 35
        has_rain_threat = False
    else:
        rain_prob = 10
        has_rain_threat = False

    # ------------------ INTENT 1: DRYING CLOTHES / LAUNDRY ------------------
    # Comprehensive Malayalam (Script + Manglish), Hindi, and English matching
    is_laundry_query = any(k in clean_q for k in [
        "തുണി", "അലക്ക്", "ഉണങ്ങാൻ", "ഉണക്കാൻ", "അലക്കാൻ", "വിരിക്കാൻ",
        "thuni", "unakkan", "unangan", "alakk", "alakan", "virikkan",
        "कपड़े", "सुखाना", "कपड़ा", "धोना", "sukana", "kapde", "dhona",
        "dry", "cloth", "clothes", "laundry", "washing", "hang"
    ])

    if is_laundry_query:
        if lang == "ml":
            if has_rain_threat:
                text = (
                    f"{loc_ml} ഇപ്പോൾ ആകാശം കാർമേഘാവൃതമാണ് ({cond}), {rain_prob}% മഴയ്ക്ക് സാധ്യതയുണ്ട്. "
                    f"അതുകൊണ്ട് തുണികൾ പുറത്ത് ഉണങ്ങാനിടുന്നത് ഒഴിവാക്കുക. തുണികൾ നനഞ്ഞുപോകാൻ സാധ്യതയുള്ളതിനാൽ വീട്ടിനുള്ളിൽ ഉണക്കുന്നതാണ് സുരക്ഷിതം."
                )
            else:
                text = (
                    f"{loc_ml} ഇന്ന് നല്ല വെയിലും തെളിഞ്ഞ ആകാശവുമാണ്, മഴയ്ക്ക് സാധ്യത വളരെ കുറവാണ് ({rain_prob}%). "
                    f"തുണികൾ പുറത്തിട്ട് വേഗത്തിൽ ഉണക്കിയെടുക്കാൻ ഇന്ന് വളരെ അനുയോജ്യമായ ദിവസമാണ്."
                )
        elif lang == "hi":
            if has_rain_threat:
                text = (
                    f"{loc_hi} आज बादल छाए हुए हैं ({cond}) और {rain_prob}% बारिश की संभावना है। "
                    f"कपड़े बाहर सुखाना जोखिम भरा रहेगा, इसलिए उन्हें अंदर ही सुखाएं।"
                )
            else:
                text = (
                    f"{loc_hi} आज धूप खिली हुई है और बारिश की संभावना केवल {rain_prob}% है। "
                    f"कपड़े बाहर आसानी से और जल्दी सूख जाएंगे।"
                )
        else:
            if has_rain_threat:
                text = (
                    f"Skies {loc_en} are currently {cond.lower()} with a {rain_prob}% chance of rain. "
                    f"It is not recommended to dry clothes outdoors today. Best to dry them inside."
                )
            else:
                text = (
                    f"The weather {loc_en} is sunny and clear with low rain chance ({rain_prob}%). "
                    f"It is a great day to dry your laundry outside."
                )
        return {"type": "laundry", "text": text}

    # ------------------ INTENT 2: RAIN & UMBRELLA CHECK ------------------
    is_rain_query = any(k in clean_q for k in [
        "മഴ", "കുട", "ചാറ്റൽമഴ", "ഇടിമിന്നൽ", "പെയ്യുമോ", "പെയ്യും", "നനയും", "മേഘം",
        "mazha", "peyyumo", "peyyum", "kuda", "nanayumo", "chattal", "idiminnel",
        "बारिश", "छाता", "बरसात", "पानी", "barish", "chata", "barsat",
        "rain", "umbrella", "shower", "drizzle", "storm", "precip", "pour"
    ])

    if is_rain_query:
        if lang == "ml":
            if has_rain_threat:
                text = (
                    f"അതെ, {loc_ml} ഇന്ന് {rain_prob}% മഴയ്ക്ക് സാധ്യതയുണ്ട്. ആകാശം {cond} ആയി തുടരുന്നതിനാൽ "
                    f"പുറത്തിറങ്ങുമ്പോൾ തീർച്ചയായും കയ്യിൽ ഒരു കുട കരുതുന്നത് വളരെ നല്ലതാണ്."
                )
            else:
                text = (
                    f"ഇല്ല, {loc_ml} ഇന്ന് മഴ പെയ്യാൻ സാധ്യത വളരെ കുറവാണ് ({rain_prob}%). "
                    f"കാലാവസ്ഥ പ്രധാനമായും തെളിഞ്ഞതായിരിക്കും, കുട കരുതേണ്ട ആവശ്യമില്ല."
                )
        elif lang == "hi":
            if has_rain_threat:
                text = (
                    f"हाँ, {loc_hi} आज {rain_prob}% बारिश की संभावना है ({cond})। "
                    f"बाहर निकलते समय छाता जरूर साथ रखें।"
                )
            else:
                text = (
                    f"नहीं, {loc_hi} आज बारिश की संभावना बहुत कम ({rain_prob}%) है। मौसम साफ रहेगा।"
                )
        else:
            if has_rain_threat:
                text = (
                    f"Yes, there is a {rain_prob}% chance of rain {loc_en} today with {cond.lower()} skies. "
                    f"Make sure to carry an umbrella when heading out."
                )
            else:
                text = (
                    f"No, rain is unlikely {loc_en} today ({rain_prob}% chance). Skies are expected to remain clear."
                )
        return {"type": "rain_check", "text": text}

    # ------------------ INTENT 3: TRAVEL / COMMUTING / GOING OUT ------------------
    is_travel_query = any(k in clean_q for k in [
        "യാത്ര", "പുറത്ത്", "പോകാൻ", "പോകാമോ", "വണ്ടി", "റോഡ്", "ഓഫീസ്", "കോളേജ്", "റൈഡ്",
        "yathra", "purathu", "pokan", "pokamo", "vandi", "office", "college",
        "घूमना", "सफर", "यात्रा", "बाहर", "गाड़ी", "yatra", "safar", "bahar",
        "travel", "trip", "drive", "ride", "go out", "commute", "outside", "traffic"
    ])

    if is_travel_query:
        if lang == "ml":
            if has_rain_threat:
                text = (
                    f"{loc_ml} യാത്രയ്ക്ക് പോകുമ്പോൾ ശ്രദ്ധിക്കുക. {cond} കാലാവസ്ഥയും {rain_prob}% മഴ സാധ്യതയും ഉള്ളതിനാൽ "
                    f"റോഡുകളിൽ വഴുക്കലുണ്ടാകാം. കുടയോ റെയിൻകോട്ടോ കയ്യിൽ കരുതുക, ശ്രദ്ധിച്ച് വാഹനം ഓടിക്കുക."
                )
            else:
                text = (
                    f"{loc_ml} യാത്ര ചെയ്യാനും പുറത്തുപോകാനും ഇന്ന് വളരെ അനുയോജ്യമായ സുഖകരമായ കാലാവസ്ഥയാണ്. "
                    f"ചൂടുള്ളതിനാൽ വെള്ളം കയ്യിൽ കരുതാൻ മറക്കരുത്."
                )
        elif lang == "hi":
            if has_rain_threat:
                text = (
                    f"{loc_hi} बाहर जाते समय सावधानी बरतें। {rain_prob}% बारिश की संभावना है, छाता साथ रखें और संभलकर गाड़ी चलाएं।"
                )
            else:
                text = (
                    f"{loc_hi} आज यात्रा और बाहर घूमने के लिए मौसम बहुत अच्छा और अनुकूल है।"
                )
        else:
            if has_rain_threat:
                text = (
                    f"Travel advice {loc_en}: Expect {cond.lower()} conditions with {rain_prob}% rain probability. Carry rain gear and drive safely."
                )
            else:
                text = (
                    f"Conditions {loc_en} are pleasant and suitable for travel and commuting today."
                )
        return {"type": "travel", "text": text}

    # ------------------ INTENT 4: WORKOUT / RUNNING / SPORTS ------------------
    is_fitness_query = any(k in clean_q for k in [
        "നടത്തം", "വ്യായാമം", "കളിക്കാൻ", "ഓടാൻ", "നടക്കാൻ", "ജിം", "കളി",
        "nadakkan", "vyayamam", "kalikkan", "odan", "walk", "workout", "run", "play", "cricket", "football", "gym", "exercise"
    ])

    if is_fitness_query:
        if lang == "ml":
            if temp > 31 or hum > 80:
                text = (
                    f"{loc_ml} ഇപ്പോൾ {temp}°C ചൂടും {hum}% ഈർപ്പവുമുണ്ട്. നല്ല വിയർപ്പുണ്ടാകാൻ സാധ്യതയുള്ളതിനാൽ "
                    f"രാവിലെ നേരത്തെയോ വൈകുന്നേരമോ വ്യായാമം ചെയ്യുന്നതാണ് ഏറ്റവും ഉത്തമം. ധാരാളം വെള്ളം കുടിക്കുക."
                )
            else:
                text = (
                    f"{loc_ml} ഇപ്പോൾ നടക്കാനും വ്യായാമം ചെയ്യാനും കായികവിനോദങ്ങൾക്കും വളരെ സുഖകരമായ നല്ല കാലാവസ്ഥയാണ്."
                )
        else:
            text = f"Fitness advice {loc_en}: Temperature is {temp}°C with {hum}% humidity. Early morning or evening is optimal for outdoor workouts."
        return {"type": "fitness", "text": text}

    # ------------------ INTENT 5: KISAN AGRI / FARMING / CROPS ------------------
    is_agri_query = any(k in clean_q for k in [
        "കൃഷി", "റബ്ബർ", "വെട്ടാൻ", "ടാപ്പിംഗ്", "തെങ്ങ്", "നെല്ല്", "നനയ്ക്കാൻ", "മരുന്ന്", "തളിക്കാൻ",
        "krishi", "rubber", "tapping", "nellu", "thengu", "kisan", "crop", "spray", "pesticide", "irrigation", "harvest", "kheti"
    ])

    if is_agri_query:
        agri = generate_agri_advisory(weather)
        irr = agri["irrigation"]["status"]
        spr = agri["spraying"]["status"]
        soil_m = agri["soilMoisture"]

        if lang == "ml":
            text = (
                f"{loc_ml} കർഷകർക്കുള്ള നിർദ്ദേശം: നനയ്ക്കൽ '{irr}' ആണ്. കീടനാശിനി തളിക്കാൻ '{spr}' സാഹചര്യമാണ്. "
                f"മണ്ണിലെ ഈർപ്പം {soil_m} അളവിലുണ്ട്. മഴസാധ്യത {rain_prob}% ആയതിനാൽ കാർഷിക ജോലികൾ അതിനനുസരിച്ച് ക്രമീകരിക്കുക."
            )
        elif lang == "hi":
            text = (
                f"{loc_hi} किसान भाइयों के लिए सलाह: सिंचाई की स्थिति '{irr}' है और छिड़काव के लिए '{spr}' है। मिट्टी की नमी {soil_m} है।"
            )
        else:
            text = f"Agromet advisory {loc_en}: Irrigation status is {irr}, spraying window is {spr}, and soil moisture is {soil_m}."
        return {"type": "agriculture", "text": text}

    # ------------------ DEFAULT INTENT: WARM, COMPLETE & NATURAL SUMMARY ------------------
    if lang == "ml":
        rain_phrase = f"ഇന്ന് മഴയ്ക്ക് {rain_prob}% സാധ്യതയുണ്ട്." if has_rain_threat else f"ഇന്ന് മഴയ്ക്ക് സാധ്യത കുറവാണ് ({rain_prob}%)."
        text = (
            f"{loc_ml} ഇപ്പോൾ {temp}°C ചൂടും {cond} കാലാവസ്ഥയുമാണ് അനുഭവപ്പെടുന്നത്. "
            f"ഈർപ്പം {hum}% ഉണ്ട്, കാറ്റ് മണിക്കൂറിൽ {wind} കി.മീ വേഗത്തിലാണ്. {rain_phrase} എന്തെങ്കിലും പ്രത്യേക സഹായം വേണമെങ്കിൽ ചോദിക്കൂ!"
        )
    elif lang == "hi":
        rain_phrase = f"आज {rain_prob}% बारिश की संभावना है।" if has_rain_threat else f"आज बारिश की संभावना कम ({rain_prob}%) है।"
        text = (
            f"{loc_hi} अभी तापमान {temp}°C है और मौसम {cond} बना हुआ है। "
            f"नमी {hum}% और हवा {wind} किमी/घंटा है। {rain_phrase}"
        )
    elif lang == "ta":
        text = f"{loc_en} தற்போது வெப்பநிலை {temp}°C ({cond}). காற்றின் வேகம் மணிக்கு {wind} கி.மீ, ஈரப்பதம் {hum}%."
    else:
        rain_phrase = f"Expect a {rain_prob}% chance of rain today." if has_rain_threat else f"Rain is unlikely today ({rain_prob}% chance)."
        text = (
            f"Right now {loc_en}, it is {temp}°C with {cond.lower()} skies. "
            f"Humidity is at {hum}% with wind speeds of {wind} km/h. {rain_phrase} How else can I help your day?"
        )

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
