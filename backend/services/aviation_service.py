"""
Aviation Meteorological Briefing Service
ICAO METAR & TAF syntax generation, runway crosswind component trigonometry, and flight categories.
"""

import math
import datetime
from typing import Dict, Any, List, Optional

MAJOR_AIRPORTS = [
    {"icao": "VIDP", "iata": "DEL", "name": "Indira Gandhi Int Airport, New Delhi", "runways": ["10/28", "11L/29R", "09/27"], "lat": 28.5562, "lon": 77.1000},
    {"icao": "VABB", "iata": "BOM", "name": "Chhatrapati Shivaji Maharaj Int, Mumbai", "runways": ["09/27", "14/32"], "lat": 19.0896, "lon": 72.8656},
    {"icao": "VOBL", "iata": "BLR", "name": "Kempegowda Int Airport, Bengaluru", "runways": ["09L/27R", "09R/27L"], "lat": 13.1986, "lon": 77.7066},
    {"icao": "VECC", "iata": "CCU", "name": "Netaji Subhash Chandra Bose Int, Kolkata", "runways": ["01R/19L", "01L/19R"], "lat": 22.6547, "lon": 88.4467},
    {"icao": "VOMM", "iata": "MAA", "name": "Chennai International Airport, Chennai", "runways": ["07/25", "12/30"], "lat": 12.9941, "lon": 80.1709},
    {"icao": "VOHS", "iata": "HYD", "name": "Rajiv Gandhi Int Airport, Hyderabad", "runways": ["09L/27R", "09R/27L"], "lat": 17.2403, "lon": 78.4294},
    {"icao": "VOCI", "iata": "COK", "name": "Cochin International Airport, Kochi", "runways": ["09/27"], "lat": 10.1518, "lon": 76.3930}
]

def generate_aviation_briefing(icao_code: str, weather_data: Dict[str, Any]) -> Dict[str, Any]:
    airport = next((a for a in MAJOR_AIRPORTS if a["icao"].upper() == icao_code.upper()), MAJOR_AIRPORTS[0])
    current = weather_data.get("current", {})

    wind_dir = current.get("wind_direction", 280)
    wind_spd_kmh = current.get("wind_speed", 15)
    wind_spd_kt = round(wind_spd_kmh * 0.539957)
    wind_gusts_kt = round(current.get("wind_gusts", wind_spd_kmh * 1.3) * 0.539957)
    temp_c = current.get("temperature", 25)
    dew_c = current.get("dew_point", 18.0)
    qnh = current.get("pressure", 1012)
    cloud_cover = current.get("cloud_cover", 20)
    precip = current.get("precipitation", 0)

    vis_meters = 4500 if cloud_cover > 80 else 3000 if precip > 0 else 9999

    # Flight category
    flight_category = "VFR"
    cat_color = "#10b981"
    if vis_meters < 1500:
        flight_category = "LIFR"
        cat_color = "#a855f7"
    elif vis_meters < 5000:
        flight_category = "IFR"
        cat_color = "#ef4444"
    elif vis_meters < 8000:
        flight_category = "MVFR"
        cat_color = "#f59e0b"

    # Crosswind on runway 28 (Heading 280)
    runway_heading = 280
    angle_rad = math.radians(abs(wind_dir - runway_heading))
    crosswind_kt = abs(round(wind_spd_kt * math.sin(angle_rad)))
    headwind_kt = round(wind_spd_kt * math.cos(angle_rad))

    # UTC METAR
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    utc_day = f"{now_utc.day:02d}"
    utc_hour = f"{now_utc.hour:02d}"
    utc_min = f"{now_utc.minute:02d}"

    gust_str = f"G{wind_gusts_kt}" if wind_gusts_kt > wind_spd_kt + 8 else ""
    wind_str = f"{wind_dir:03d}{wind_spd_kt:02d}{gust_str}KT"
    vis_str = "9999" if vis_meters >= 9999 else f"{vis_meters:04d}M"
    wx_str = "RA" if precip > 0 else "FEW030"
    t_str = f"{temp_c:02d}" if temp_c >= 0 else f"M{abs(temp_c):02d}"
    d_str = f"{int(dew_c):02d}" if dew_c >= 0 else f"M{abs(int(dew_c)):02d}"

    metar_str = f"METAR {airport['icao']} {utc_day}{utc_hour}{utc_min}Z {wind_str} {vis_str} {wx_str} {t_str}/{d_str} Q{qnh} NOSIG"
    taf_str = f"TAF {airport['icao']} {utc_day}1200Z {utc_day}12/{int(utc_day)+1:02d}1800Z {wind_str} 9999 SCT025 BECMG {utc_day}16/{utc_day}18 {(wind_dir+20)%360:03d}08KT CAVOK"

    return {
        "airport": airport,
        "metar": metar_str,
        "taf": taf_str,
        "flightCategory": flight_category,
        "categoryColor": cat_color,
        "metrics": {
            "windDirection": f"{wind_dir}°",
            "windSpeed": f"{wind_spd_kt} KT (Gusts {wind_gusts_kt} KT)",
            "crosswind": f"{crosswind_kt} KT (Runway 28)",
            "headwind": f"{headwind_kt} KT",
            "visibility": "> 10 km (CAVOK)" if vis_meters >= 9999 else f"{vis_meters} meters",
            "qnhAltimeter": f"{qnh} hPa / {qnh * 0.02953:.2f} inHg",
            "tempDewSpread": f"{temp_c - dew_c:.1f} °C",
            "turbulenceRisk": "Moderate Low-Level Turbulence" if wind_gusts_kt > 25 else "Smooth / Light"
        }
    }
