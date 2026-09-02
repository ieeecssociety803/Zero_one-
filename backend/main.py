"""
WeatherGPT FastAPI Backend Server
Integrates meteorological datasets, NWP models, GKMS Agriculture, METAR aviation,
INCOIS Marine, ERA5 climate analytics, CAP disaster early warnings, and conversational NLP.
"""

import asyncio
import json
from typing import Optional, List
from fastapi import FastAPI, Query, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.weather_service import search_locations, fetch_comprehensive_weather, POPULAR_LOCATIONS
from services.nwp_service import fetch_nwp_comparison
from services.agri_service import generate_agri_advisory
from services.aviation_service import generate_aviation_briefing, MAJOR_AIRPORTS
from services.marine_service import generate_marine_advisory
from services.climate_service import fetch_historical_climate_analytics
from services.disaster_service import get_active_disaster_alerts
from services.nlp_engine import process_nlp_query

app = FastAPI(
    title="WeatherGPT Meteorological Intelligence API",
    description="AI-powered conversational weather, NWP forecasting, and multi-hazard decision support API",
    version="2.0.0"
)

# Enable CORS for frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class ChatQueryRequest(BaseModel):
    query: str
    lat: float
    lon: float
    location_name: str = "Selected Location"
    current_weather: Optional[dict] = None
    lang: str = "en"
    api_key: Optional[str] = ""
    provider: Optional[str] = "builtin"

# ----------------- REST API ROUTES ----------------- #

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "WeatherGPT Python Backend",
        "nwp_models": ["NOAA GFS 0.25°", "ECMWF IFS", "DWD ICON", "IMD WRF"],
        "version": "2.0.0"
    }

@app.get("/api/locations")
async def get_locations(q: Optional[str] = Query(None, description="Search query for city or station")):
    if not q:
        return POPULAR_LOCATIONS
    return await search_locations(q)

@app.get("/api/weather")
async def get_weather(
    lat: float = Query(28.6139, description="Latitude"),
    lon: float = Query(77.2090, description="Longitude"),
    name: str = Query("New Delhi, Delhi", description="Location name")
):
    return await fetch_comprehensive_weather(lat, lon, name)

@app.post("/api/chat")
async def post_chat_query(req: ChatQueryRequest):
    weather = req.current_weather
    if not weather:
        weather = await fetch_comprehensive_weather(req.lat, req.lon, req.location_name)

    response = await process_nlp_query(
        query=req.query,
        current_weather=weather,
        location_name=req.location_name,
        lat=req.lat,
        lon=req.lon,
        lang=req.lang,
        api_key=req.api_key or "",
        provider=req.provider or "builtin"
    )
    return response

@app.get("/api/nwp")
async def get_nwp_comparison(
    lat: float = Query(28.6139, description="Latitude"),
    lon: float = Query(77.2090, description="Longitude")
):
    return await fetch_nwp_comparison(lat, lon)

@app.get("/api/advisory/agri")
async def get_agri_advisory(
    lat: float = Query(28.6139, description="Latitude"),
    lon: float = Query(77.2090, description="Longitude"),
    name: str = Query("Selected Area")
):
    weather = await fetch_comprehensive_weather(lat, lon, name)
    return generate_agri_advisory(weather)

@app.get("/api/advisory/aviation")
async def get_aviation_advisory(
    icao: str = Query("VIDP", description="Airport ICAO code"),
    lat: float = Query(28.5562),
    lon: float = Query(77.1000)
):
    weather = await fetch_comprehensive_weather(lat, lon, icao)
    return generate_aviation_briefing(icao, weather)

@app.get("/api/advisory/marine")
async def get_marine_advisory(
    lat: float = Query(17.6868, description="Coastal Latitude"),
    lon: float = Query(83.2185, description="Coastal Longitude"),
    name: str = Query("Bay of Bengal Coastal Zone")
):
    weather = await fetch_comprehensive_weather(lat, lon, name)
    return generate_marine_advisory(lat, lon, weather)

@app.get("/api/climate")
def get_climate_analytics(
    lat: float = Query(28.6139),
    lon: float = Query(77.2090),
    name: str = Query("Selected Location")
):
    return fetch_historical_climate_analytics(lat, lon, name)

@app.get("/api/disaster/alerts")
def get_disaster_alerts():
    return get_active_disaster_alerts()

# ----------------- WEBSOCKET REAL-TIME WIS 2.0 / MQTT STREAM ----------------- #

@app.websocket("/ws/stream")
async def websocket_telemetry_stream(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Send periodic live telemetry heartbeat with active CAP count
            alerts = get_active_disaster_alerts()
            payload = {
                "type": "WIS2_HEARTBEAT",
                "active_cap_alerts": len(alerts),
                "top_hazard": alerts[0]["event"] if alerts else "None",
                "status": "ONLINE"
            }
            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(15)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
