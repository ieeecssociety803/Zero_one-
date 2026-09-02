// Disaster Early Warning & Common Alerting Protocol (CAP) Service connected to Python Backend

const API_BASE = 'http://127.0.0.1:8000/api';

export const ACTIVE_DISASTER_ALERTS = [
  {
    id: 'CAP-IN-IMD-2026-089',
    event: 'Severe Cyclonic Storm "VARUNA" Warning',
    headline: 'IMD Red Bulletin: Cyclone VARUNA over West-Central Bay of Bengal',
    severity: 'Extreme',
    urgency: 'Immediate',
    certainty: 'Observed',
    color: '#ef4444',
    bgGlow: 'rgba(239, 68, 68, 0.25)',
    affectedZones: ['Odisha Coast (Puri, Ganjam, Kendrapara)', 'North Andhra Pradesh (Srikakulam, Visakhapatnam)'],
    windPeak: '110-120 kmph gusting to 135 kmph',
    stormSurge: '1.5 to 2.0 meters above astronomical tide inundating low-lying coastal areas',
    rainfallWarning: 'Extremely heavy rainfall (> 204.4 mm) at isolated places',
    instructions: [
      'Total suspension of fishing operations along Odisha and North Andhra coasts.',
      'Judicious evacuation of vulnerable populations in Kutcha houses to cyclone shelters.',
      'Coastal road and rail traffic regulated with high-risk corridors suspended.',
      'NDRF and SDRF teams prepositioned in coastal headquarters.'
    ],
    timestamp: 'Updated 15 mins ago'
  },
  {
    id: 'CAP-IN-IMD-2026-090',
    event: 'Flash Flood & Cloudburst Alert',
    headline: 'Central Water Commission (CWC) & IMD Flash Flood Guidance (FFG)',
    severity: 'Severe',
    urgency: 'Expected',
    certainty: 'Likely',
    color: '#f97316',
    bgGlow: 'rgba(249, 115, 22, 0.22)',
    affectedZones: ['Himachal Pradesh (Kullu, Mandi, Kangra)', 'Uttarakhand (Chamoli, Rudraprayag, Uttarkashi)'],
    windPeak: '45-55 kmph squally winds',
    stormSurge: 'Runoff index > 85mm/hr in catchment streams',
    rainfallWarning: 'Intense orographic spells with localized cloudburst probability',
    instructions: [
      'Avoid travel along riverbeds, seasonal nullahs, and steep landslide-prone slopes.',
      'Maintain distance from swollen water bodies and hydroelectric dam spillways.',
      'Stay tuned to local district magistrate announcements via emergency radio/SMS.'
    ],
    timestamp: 'Updated 32 mins ago'
  },
  {
    id: 'CAP-IN-IMD-2026-091',
    event: 'Severe Heatwave Alert (Orange Warning)',
    headline: 'Maximum Temperatures Exceeding 45.0°C with Heat Index > 52°C',
    severity: 'Moderate',
    urgency: 'Future',
    certainty: 'High',
    color: '#eab308',
    bgGlow: 'rgba(234, 179, 8, 0.2)',
    affectedZones: ['Western Rajasthan (Churu, Bikaner, Jaisalmer)', 'Vidarbha & Marathwada (Nagpur, Akola)'],
    windPeak: 'Loo winds (Dry thermal winds from Thar desert)',
    stormSurge: 'N/A',
    rainfallWarning: 'Nil rain. Diurnal temperature amplitude > 16°C',
    instructions: [
      'Avoid direct sunlight exposure between 12:00 PM and 4:00 PM.',
      'Drink abundant ORS, buttermilk, and water even if not feeling thirsty.',
      'Provide shaded shelter and fresh water troughs for livestock and stray animals.'
    ],
    timestamp: 'Updated 1 hour ago'
  }
];

export async function fetchLiveDisasterAlerts() {
  try {
    const res = await fetch(`${API_BASE}/disaster/alerts`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Python backend disaster alerts API fallback to static CAP cache:', err);
  }
  return ACTIVE_DISASTER_ALERTS;
}

// Web Audio API emergency alert sound generator
export function playEmergencyTone(type = 'beep') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'siren') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.3);
      osc.frequency.linearRampToValueAtTime(440, now + 0.6);
      osc.frequency.linearRampToValueAtTime(880, now + 0.9);
      osc.frequency.linearRampToValueAtTime(440, now + 1.2);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.2);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.1);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (e) {
    console.warn('AudioContext alert playback bypassed:', e);
  }
}
