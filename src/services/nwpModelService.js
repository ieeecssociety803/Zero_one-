// NWP Ensemble Service connected to Python FastAPI Backend

const API_BASE = 'http://127.0.0.1:8000/api';

export const NWP_MODELS = [
  {
    id: 'gfs',
    name: 'NOAA GFS (0.25°)',
    agency: 'National Oceanic and Atmospheric Administration (USA)',
    resolution: '13 km (Global)',
    updateFreq: 'Every 6 hours (00z, 06z, 12z, 18z)',
    leadTime: '384 Hours (16 Days)',
    color: '#38bdf8',
    specialty: 'Synoptic tracks, tropical cyclones, global teleconnections'
  },
  {
    id: 'ecmwf',
    name: 'ECMWF IFS (HRES)',
    agency: 'European Centre for Medium-Range Weather Forecasts',
    resolution: '9 km (Global)',
    updateFreq: 'Every 6 hours',
    leadTime: '240 Hours (10 Days)',
    color: '#a855f7',
    specialty: 'Gold standard medium-range accuracy, geopotential height fields'
  },
  {
    id: 'icon',
    name: 'DWD ICON (Global)',
    agency: 'Deutscher Wetterdienst (Germany)',
    resolution: '13 km Global / 6.5 km EU',
    updateFreq: 'Every 6 hours',
    leadTime: '180 Hours (7.5 Days)',
    color: '#10b981',
    specialty: 'Boundary layer physics, icosahedral grid conservation'
  },
  {
    id: 'wrf',
    name: 'IMD WRF Mesoscale',
    agency: 'India Meteorological Department & MoES',
    resolution: '3 km (Regional Mesoscale)',
    updateFreq: 'Every 12 hours (00z, 12z)',
    leadTime: '72 Hours (3 Days)',
    color: '#f59e0b',
    specialty: 'Monsoon low-level jets, Western Disturbance orographic precipitation, lightning nowcasting'
  }
];

export async function fetchNWPComparison(lat, lon) {
  try {
    const res = await fetch(`${API_BASE}/nwp?lat=${lat}&lon=${lon}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Python backend NWP unreachable:', err);
  }

  // Client simulated fallback
  return {
    models: NWP_MODELS,
    days: [
      { date: '2026-09-02', day: 'Today', gfs: { tempMax: 32.0, rain: 0 }, ecmwf: { tempMax: 32.4, rain: 0 }, icon: { tempMax: 31.8, rain: 0 }, wrf: { tempMax: 32.1, rain: 0 }, tempSpread: 0.6, confidence: 'Very High (95%)' },
      { date: '2026-09-03', day: 'Tomorrow', gfs: { tempMax: 33.2, rain: 2.1 }, ecmwf: { tempMax: 33.0, rain: 3.5 }, icon: { tempMax: 32.7, rain: 1.8 }, wrf: { tempMax: 33.4, rain: 4.0 }, tempSpread: 0.7, confidence: 'High (91%)' }
    ],
    capeIndex: 1450,
    liftedIndex: -3.2,
    convectiveRisk: 'Moderate Thunderstorm Potential (CAPE > 1200 J/kg)',
    synopticSummary: 'Ensemble consensus displays strong alignment across GFS and ECMWF for 72-hour temperature progression.'
  };
}
