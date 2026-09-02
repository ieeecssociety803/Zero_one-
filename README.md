# 🌦️ WeatherGPT — AI Meteorological Intelligence & Multi-Hazard Decision Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20Python%203.12-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
[![Leaflet](https://img.shields.io/badge/GIS-Leaflet%20Doppler%20Radar-199900?logo=leaflet&logoColor=white)](https://leafletjs.com)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS%20Glassmorphism-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Smart India Hackathon 2026** | **Problem Statement ID:** 26068  
> **Team:** ZeroOne (ID: 21) | **Theme:** Conversational AI for Weather Forecasts & Decision Support

---

## 📖 Overview

**WeatherGPT** is an intelligent conversational meteorological intelligence platform that integrates real-time weather datasets, Numerical Weather Prediction (NWP) models (NOAA GFS, ECMWF IFS, DWD ICON, IMD WRF), interactive GIS Doppler Radar mapping, disaster early warnings (WMO CAP v1.2), and personalized voice assistance (**"Chandra"**) supporting 12+ Indian regional languages.

---

## 🌟 Key Features

1. **Autonomous Conversational Weather AI ("Chandra")**:
   * Multilingual voice-enabled assistant supporting 12 Indian languages: *English, Hindi, Malayalam, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Punjabi, Odia, Urdu*.
   * Provides personalized lifestyle advice (rain/umbrella checks, workouts, clothing) and farming guidance.
   * Voice input Speech-to-Text (STT) and neural Text-to-Speech (TTS) audio narration.

2. **Interactive Weather Map with Dynamic Layers**:
   * Interactive Leaflet GIS map with auto-fly zoom into searched cities and districts.
   * Floating live temperature badge (`27° C`) and dynamic weather condition indicator (`Mainly Clear`, `Rain Showers`, etc.).
   * Switchable map layers: *Satellite Hybrid (ESRI)*, *Carto Dark*, *Streets*, and *RainViewer Live Doppler Precipitation Radar*.

3. **3x3 Minimalist Telemetry Grid & Expandable Advisories**:
   * Real-time metrics: Air Quality (AQI), Soil Moisture (%), Wind Velocity, Humidity, Pressure, UV Index, Dew Point, Evapotranspiration ($ET_0$), and $\text{PM}_{2.5}$.
   * Expandable sector intelligence portal for:
     * 🌾 **Kisan Agri:** Gramin Krishi Mausam Sewa (GKMS) crop-weather heuristics, irrigation status, and pest alerts.
     * ✈️ **Aviation:** ICAO METAR/TAF decoders, runway crosswind component trigonometry, and flight categories.
     * ⚓ **Marine Safety:** Beaufort scale sea state, wave heights, and fishermen warning flags.
     * 🚨 **Disaster Early Warnings:** Active Common Alerting Protocol (CAP) cyclone and flood bulletins.

4. **NWP Model Ensemble & Forecast Divergence Matrix**:
   * Side-by-side comparison across **NOAA GFS (0.25°)**, **ECMWF IFS (9km)**, **DWD ICON (13km)**, and **IMD WRF (3km)**.
   * Convective Available Potential Energy (CAPE) and Lifted Index instability metrics.

---

## 🚀 Quick Start (Run Locally in 2 Steps)

### Prerequisites
* **Node.js** (v18 or higher) — [Download Node.js](https://nodejs.org/)
* **Python** (v3.10 or higher) — [Download Python](https://www.python.org/)
* **Git** — [Download Git](https://git-scm.com/)

---

### Step 1: Clone the Repository & Install Dependencies

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/weathergpt.git
cd weathergpt

# Install Frontend dependencies
npm install

# Install Backend dependencies
pip install -r backend/requirements.txt
```

---

### Step 2: Launch Both Servers

#### Option A: One-Command Launcher (Recommended)
```bash
python start_servers.py
```

#### Option B: Run via Windows Batch Script
Double-click `run.bat` or run in terminal:
```bash
run.bat
```

#### Option C: Run Separately in Two Terminals
```bash
# Terminal 1: Run Python FastAPI Backend
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Run React Frontend
npm run dev
```

---

### 🌐 Access Points
* **Frontend Web App:** [`http://localhost:5173/`](http://localhost:5173/) (or `http://localhost:5174/`)
* **Python FastAPI Backend API:** [`http://127.0.0.1:8000`](http://127.0.0.1:8000)
* **Interactive Swagger API Documentation:** [`http://127.0.0.1:8000/docs`](http://127.0.0.1:8000/docs)

---

## 🏛️ System Architecture

```
weathergpt/
├── backend/
│   ├── main.py                     # FastAPI server, REST routes & WebSocket streams
│   ├── requirements.txt            # Python dependencies (FastAPI, uvicorn, httpx, pydantic)
│   └── services/
│       ├── weather_service.py      # Real-time Open-Meteo & Air Quality telemetry ingestion
│       ├── nlp_engine.py           # Conversational NLP engine ("Chandra") in 12 Indian languages
│       ├── nwp_service.py          # NWP Ensemble matrix (GFS, ECMWF, ICON, WRF) & CAPE
│       ├── agri_service.py         # GKMS Kisan crop-weather heuristics & pest models
│       ├── aviation_service.py     # ICAO METAR/TAF generator & runway crosswind calculations
│       ├── marine_service.py       # Beaufort scale & fishermen warning flags
│       ├── climate_service.py      # ERA5 reanalysis 1980–2025 decadal climate trends
│       └── disaster_service.py     # CAP hazard bulletins & cyclone tracking feeds
├── src/
│   ├── components/
│   │   ├── InteractiveWeatherMap.jsx # Leaflet GIS map with fly-to zoom & layer toggle
│   │   ├── MetricsAdvisoriesGrid.jsx # 3x3 minimalist metrics & expandable advisories
│   │   ├── ChandraAIWidget.jsx       # Ethereal glowing orb & in-place multilingual AI
│   │   ├── NWPEnsembleSection.jsx    # 7-day multi-model comparison table & CAPE indices
│   │   ├── Navbar.jsx                # Top bar with geocoding search & GPS button
│   │   ├── DisasterTicker.jsx        # Red alert banner with directions trigger
│   │   ├── TechSpecsModal.jsx        # Full-stack system architecture & tech specs modal
│   │   ├── RadarMapModal.jsx         # Full GIS Doppler radar & cyclone tracker
│   │   └── SectorAdvisoryModal.jsx   # Dedicated Kisan, Aviation, Marine & CAP dashboards
│   ├── services/                     # Frontend API connectors to Python backend
│   ├── App.jsx                       # Main application component
│   └── index.css                     # TailwindCSS & glassmorphism theme
├── start_servers.py                  # Unified Python launcher for both servers
├── run.bat                           # Windows one-click start script
├── package.json
└── vite.config.js
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Backend health check & supported NWP models list |
| `GET` | `/api/weather` | Live surface telemetry, hourly 24h curve, 7-day outlook & AQI |
| `GET` | `/api/locations` | Geocoding search & meteorological stations lookup |
| `POST` | `/api/chat` | AI Conversational NLP engine ("Chandra") in 12 Indian languages |
| `GET` | `/api/nwp` | GFS 0.25° vs ECMWF IFS vs ICON vs WRF comparison & CAPE index |
| `GET` | `/api/advisory/agri` | GKMS Kisan advisories (irrigation, spraying, pest risks) |
| `GET` | `/api/advisory/aviation`| ICAO METAR, TAF, crosswind component & flight categories |
| `GET` | `/api/advisory/marine` | Beaufort sea state, wave height, swell period, and warning flags |
| `GET` | `/api/climate` | Historical ERA5 climate reanalysis (1980–2025) decadal anomaly series |
| `GET` | `/api/disaster/alerts` | Active Common Alerting Protocol (CAP) disaster bulletins |
| `WS` | `/ws/stream` | Real-time simulated WMO WIS 2.0 / MQTT early warning broadcast stream |

---

## 📜 License
This project is open-source and licensed under the [MIT License](LICENSE).
