"""
Marine & Coastal Safety Service
Beaufort scale sea state classification, wave height modeling, swell periods, and fishermen warning flags.
"""

from typing import Dict, Any

def generate_marine_advisory(lat: float, lon: float, weather_data: Dict[str, Any]) -> Dict[str, Any]:
    current = weather_data.get("current", {})
    wind_km = current.get("wind_speed", 15)
    wind_knots = round(wind_km * 0.539957)

    beaufort = 3
    sea_state = "Slight"
    wave_height_m = "0.8 - 1.2 m"
    alert_flag = "Green (Safe)"
    flag_color = "#10b981"
    fishermen_warning = "Sea conditions are normal. Safe for artisanal and mechanized fishing boats."

    if wind_knots > 35:
        beaufort = 8
        sea_state = "Very Rough to High"
        wave_height_m = "3.5 - 5.5 m"
        alert_flag = "RED ALERT (Severe Danger)"
        flag_color = "#ef4444"
        fishermen_warning = "FISHERMEN WARNING: Do NOT venture into deep sea or coastal waters. Total suspension of fishing operations advised."
    elif wind_knots > 24:
        beaufort = 6
        sea_state = "Rough"
        wave_height_m = "2.2 - 3.2 m"
        alert_flag = "ORANGE ALERT (Warning)"
        flag_color = "#f97316"
        fishermen_warning = "Fishermen advised not to venture into deep sea. Small craft and trawlers should return to harbour."
    elif wind_knots > 16:
        beaufort = 4
        sea_state = "Moderate"
        wave_height_m = "1.3 - 2.0 m"
        alert_flag = "YELLOW WATCH"
        flag_color = "#eab308"
        fishermen_warning = "Exercise caution in coastal waters. Moderate swells expected due to squally surface winds."

    return {
        "seaState": sea_state,
        "beaufortScale": f"Force {beaufort}",
        "waveHeight": wave_height_m,
        "swellPeriod": "8 - 11 seconds",
        "windSpeedKnots": f"{wind_knots} KT ({wind_km} km/h)",
        "alertFlag": alert_flag,
        "flagColor": flag_color,
        "fishermenWarning": fishermen_warning,
        "coastalSurge": "Elevated surge 0.5m above astronomical tide" if wind_knots > 25 else "Astronomical Normal",
        "oceanCurrent": "0.6 knots North-Eastward",
        "waterTemp": "28.5 °C"
    }
