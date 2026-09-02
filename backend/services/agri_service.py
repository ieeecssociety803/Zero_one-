"""
Gramin Krishi Mausam Sewa (GKMS) Agriculture Advisory Service
Crop-weather heuristics, irrigation schedules, spraying windows, and pest/disease risk models.
"""

from typing import Dict, Any, List

def generate_agri_advisory(weather_data: Dict[str, Any]) -> Dict[str, Any]:
    current = weather_data.get("current", {})
    temp = current.get("temperature", 25)
    rh = current.get("humidity", 60)
    wind = current.get("wind_speed", 12)
    daily = weather_data.get("daily", [])

    precip_prob = daily[0].get("precipProb", 0) if daily else 0
    rain_next_48h = (daily[0].get("precipSum", 0) if len(daily) > 0 else 0) + (daily[1].get("precipSum", 0) if len(daily) > 1 else 0)

    # Irrigation status
    irrigation_status = "Recommended"
    irrigation_reason = "Optimal soil moisture depletion with dry conditions forecast."
    if rain_next_48h > 5 or precip_prob > 60:
        irrigation_status = "Withhold / Postpone"
        irrigation_reason = f"Rainfall predicted ({rain_next_48h:.1f} mm, {precip_prob}% probability). Conserve water and prevent root waterlogging."
    elif temp > 38:
        irrigation_status = "High Priority Irrigation"
        irrigation_reason = "High ambient temperatures will induce thermal moisture stress. Apply light evening irrigation."

    # Spraying window
    spray_condition = "Safe to Spray"
    spray_details = "Wind speed is under 15 km/h and no immediate rain expected."
    if wind > 18:
        spray_condition = "Unfavourable (High Drift Risk)"
        spray_details = f"Wind speed is {wind} km/h (exceeds safe threshold of 15 km/h). Chemical drift risk to non-target areas."
    elif rain_next_48h > 2 or precip_prob > 45:
        spray_condition = "Postpone Spraying"
        spray_details = "Precipitation will wash away chemical application before systemic absorption."

    # Pest & Disease Risk Matrix
    pest_risks = []
    if rh > 75 and 20 <= temp <= 30:
        pest_risks.append({
            "pest": "Fungal Blast & Sheath Blight",
            "crops": "Paddy, Rice",
            "severity": "High",
            "recommendation": "Monitor crop foliage. Apply Tricyclazole 75 WP @ 0.6 g/L or Azoxystrobin on dry canopy."
        })
    if rh > 70 and temp > 28:
        pest_risks.append({
            "pest": "Sucking Pests (Aphids, Jassids, Whitefly)",
            "crops": "Cotton, Vegetables, Mustard",
            "severity": "Medium",
            "recommendation": "Deploy yellow sticky traps @ 10/acre. Spray Neem oil (1500 ppm) @ 3 ml/L if threshold reached."
        })
    if temp < 12 and rh > 80:
        pest_risks.append({
            "pest": "Yellow Rust / Late Blight",
            "crops": "Wheat, Potato",
            "severity": "High",
            "recommendation": "Scout lower leaves for yellow pustules. Spray Propiconazole 25 EC @ 1 ml/L."
        })
    if not pest_risks:
        pest_risks.append({
            "pest": "General Pathogen Activity",
            "crops": "All Seasonal Crops",
            "severity": "Low",
            "recommendation": "Current microclimate indicates stable, low pathogen pressure. Continue standard crop maintenance."
        })

    agri_metrics = weather_data.get("agriculture", {})

    return {
        "irrigation": {"status": irrigation_status, "reason": irrigation_reason},
        "spraying": {"status": spray_condition, "details": spray_details},
        "pestRisks": pest_risks,
        "soilMoisture": str(agri_metrics.get("soil_moisture", "32%")) + ("%" if not str(agri_metrics.get("soil_moisture", "32%")).endswith("%") else ""),
        "evapotranspiration": f"{agri_metrics.get('evapotranspiration_rate', 4.2)} mm/day",
        "advisoryBulletins": [
            "Ensure proper drainage channels in low-lying fields ahead of convective spells.",
            "Harvest mature Rabi/Kharif crops during clear afternoon hours to preserve grain moisture standard (<12%).",
            "Apply mulch to horticultural trees to retard soil water evaporation during high diurnal heat cycles."
        ]
    }
