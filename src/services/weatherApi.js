const getApiBase = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:8000/api`;
    }
  }
  return 'http://127.0.0.1:8000/api';
};

const API_BASE = getApiBase();

export const WMO_WEATHER_CODES = {
  0: { label: 'Clear Sky', icon: 'Sun', severity: 'low', gradient: 'from-amber-400 to-orange-500' },
  1: { label: 'Mainly Clear', icon: 'SunMedium', severity: 'low', gradient: 'from-amber-300 to-sky-400' },
  2: { label: 'Partly Cloudy', icon: 'CloudSun', severity: 'low', gradient: 'from-sky-400 to-slate-400' },
  3: { label: 'Overcast', icon: 'Cloud', severity: 'low', gradient: 'from-slate-400 to-slate-600' },
  45: { label: 'Foggy', icon: 'CloudFog', severity: 'medium', gradient: 'from-slate-500 to-zinc-600' },
  48: { label: 'Depositing Rime Fog', icon: 'CloudFog', severity: 'medium', gradient: 'from-slate-600 to-zinc-700' },
  51: { label: 'Light Drizzle', icon: 'CloudDrizzle', severity: 'low', gradient: 'from-sky-500 to-blue-600' },
  53: { label: 'Moderate Drizzle', icon: 'CloudDrizzle', severity: 'medium', gradient: 'from-blue-500 to-indigo-600' },
  55: { label: 'Dense Drizzle', icon: 'CloudRain', severity: 'medium', gradient: 'from-blue-600 to-indigo-700' },
  61: { label: 'Slight Rain', icon: 'CloudRain', severity: 'low', gradient: 'from-sky-500 to-blue-600' },
  63: { label: 'Moderate Rain', icon: 'CloudRain', severity: 'medium', gradient: 'from-blue-600 to-cyan-700' },
  65: { label: 'Heavy Rain', icon: 'CloudRainWind', severity: 'high', gradient: 'from-blue-700 to-slate-900' },
  71: { label: 'Slight Snow Fall', icon: 'Snowflake', severity: 'medium', gradient: 'from-cyan-200 to-blue-400' },
  73: { label: 'Moderate Snow Fall', icon: 'Snowflake', severity: 'medium', gradient: 'from-cyan-300 to-blue-500' },
  75: { label: 'Heavy Snow Fall', icon: 'Snowflake', severity: 'high', gradient: 'from-blue-300 to-indigo-600' },
  80: { label: 'Slight Rain Showers', icon: 'CloudRain', severity: 'low', gradient: 'from-sky-400 to-blue-600' },
  81: { label: 'Moderate Rain Showers', icon: 'CloudRainWind', severity: 'medium', gradient: 'from-blue-500 to-indigo-700' },
  82: { label: 'Violent Rain Showers', icon: 'CloudLightning', severity: 'high', gradient: 'from-purple-800 to-slate-950' },
  95: { label: 'Thunderstorm', icon: 'CloudLightning', severity: 'high', gradient: 'from-violet-700 to-slate-900' },
  96: { label: 'Thunderstorm with Slight Hail', icon: 'CloudLightning', severity: 'high', gradient: 'from-purple-700 to-red-900' },
  99: { label: 'Severe Thunderstorm with Heavy Hail', icon: 'CloudLightning', severity: 'emergency', gradient: 'from-red-700 to-slate-950' }
};

export const POPULAR_LOCATIONS = [
  { name: 'New Delhi', state: 'Delhi', country: 'India', lat: 28.6139, lon: 77.2090, elevation: 216 },
  { name: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.0760, lon: 72.8777, elevation: 14 },
  { name: 'Bengaluru', state: 'Karnataka', country: 'India', lat: 12.9716, lon: 77.5946, elevation: 920 },
  { name: 'Kolkata', state: 'West Bengal', country: 'India', lat: 22.5726, lon: 88.3639, elevation: 9 },
  { name: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lon: 80.2707, elevation: 6 },
  { name: 'Hyderabad', state: 'Telangana', country: 'India', lat: 17.3850, lon: 78.4867, elevation: 505 },
  { name: 'Ahmedabad', state: 'Gujarat', country: 'India', lat: 23.0225, lon: 72.5714, elevation: 53 },
  { name: 'Jaipur', state: 'Rajasthan', country: 'India', lat: 26.9124, lon: 75.7873, elevation: 431 },
  { name: 'Lucknow', state: 'Uttar Pradesh', country: 'India', lat: 26.8467, lon: 80.9462, elevation: 123 },
  { name: 'Patna', state: 'Bihar', country: 'India', lat: 25.5941, lon: 85.1376, elevation: 53 },
  { name: 'Guwahati', state: 'Assam', country: 'India', lat: 26.1445, lon: 91.7362, elevation: 55 },
  { name: 'Bhubaneswar', state: 'Odisha', country: 'India', lat: 20.2961, lon: 85.8245, elevation: 45 },
  { name: 'Srinagar', state: 'Jammu and Kashmir', country: 'India', lat: 34.0837, lon: 74.7973, elevation: 1585 },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', lat: 17.6868, lon: 83.2185, elevation: 45 },
  { name: 'Kochi', state: 'Kerala', country: 'India', lat: 9.9312, lon: 76.2673, elevation: 5 }
];

export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return POPULAR_LOCATIONS.slice(0, 5);
  
  try {
    const res = await fetch(`${API_BASE}/locations?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Python backend location search unreachable, using client search:', err);
  }

  // Client fallback
  const cleanQ = query.toLowerCase().trim();
  return POPULAR_LOCATIONS.filter(l => 
    l.name.toLowerCase().includes(cleanQ) || 
    l.state.toLowerCase().includes(cleanQ)
  );
}

export async function fetchComprehensiveWeather(lat, lon, locationName = 'Selected Location') {
  try {
    const res = await fetch(`${API_BASE}/weather?lat=${lat}&lon=${lon}&name=${encodeURIComponent(locationName)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Python backend weather unreachable, attempting direct fallback:', err);
  }

  // Direct client fallback
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
    const wRes = await fetch(weatherUrl);
    const data = await wRes.json();
    return formatClientWeatherData(data, locationName, lat, lon);
  } catch (e) {
    return generateClientFallbackWeather(lat, lon, locationName);
  }
}

function formatClientWeatherData(weather, locationName, lat, lon) {
  const current = weather.current || {};
  const code = current.weather_code || 0;
  const codeInfo = WMO_WEATHER_CODES[code] || WMO_WEATHER_CODES[0];

  return {
    location: locationName,
    lat,
    lon,
    elevation: 150,
    timezone: 'Asia/Kolkata',
    current: {
      temperature: Math.round(current.temperature_2m || 25),
      apparent_temperature: Math.round(current.apparent_temperature || 26),
      humidity: current.relative_humidity_2m || 60,
      dew_point: 18.5,
      pressure: Math.round(current.pressure_msl || 1013),
      wind_speed: Math.round(current.wind_speed_10m || 12),
      wind_direction: current.wind_direction_10m || 210,
      wind_gusts: 18,
      cloud_cover: current.cloud_cover || 20,
      precipitation: current.precipitation || 0,
      is_day: current.is_day === 1,
      weather_code: code,
      condition: codeInfo.label,
      severity: codeInfo.severity,
      gradient: codeInfo.gradient,
      icon: codeInfo.icon,
      timestamp: current.time || new Date().toISOString()
    },
    aqi: {
      us_aqi: 72,
      category: 'Moderate',
      color: '#eab308',
      pm2_5: 22.4,
      pm10: 48.1,
      no2: 12.5,
      so2: 5.2,
      o3: 38.0,
      co: 280
    },
    agriculture: {
      soil_temp_0cm: 24.5,
      soil_temp_6cm: 23.8,
      soil_moisture: '32.4',
      evapotranspiration_rate: 4.5
    },
    hourly: (weather.hourly?.time || []).slice(0, 24).map((t, idx) => ({
      time: t,
      hour: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temp: Math.round(weather.hourly.temperature_2m[idx] || 25),
      feels_like: Math.round(weather.hourly.apparent_temperature?.[idx] || 26),
      humidity: weather.hourly.relative_humidity_2m?.[idx] || 60,
      precip_prob: weather.hourly.precipitation_probability?.[idx] || 10,
      weather_code: weather.hourly.weather_code?.[idx] || 0,
      codeInfo: WMO_WEATHER_CODES[weather.hourly.weather_code?.[idx] || 0] || WMO_WEATHER_CODES[0],
      wind_speed: Math.round(weather.hourly.wind_speed_10m?.[idx] || 10)
    })),
    daily: (weather.daily?.time || []).slice(0, 7).map((t, idx) => ({
      date: t,
      dayName: idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : new Date(t).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
      code: weather.daily.weather_code?.[idx] || 0,
      codeInfo: WMO_WEATHER_CODES[weather.daily.weather_code?.[idx] || 0] || WMO_WEATHER_CODES[0],
      tempMax: Math.round(weather.daily.temperature_2m_max?.[idx] || 32),
      tempMin: Math.round(weather.daily.temperature_2m_min?.[idx] || 22),
      precipProb: weather.daily.precipitation_probability_max?.[idx] || 15
    }))
  };
}

function generateClientFallbackWeather(lat, lon, locationName) {
  return {
    location: locationName,
    lat,
    lon,
    elevation: 216,
    timezone: 'Asia/Kolkata',
    current: {
      temperature: 28,
      apparent_temperature: 30,
      humidity: 58,
      dew_point: 19.5,
      pressure: 1012,
      wind_speed: 14,
      wind_direction: 230,
      wind_gusts: 20,
      cloud_cover: 25,
      precipitation: 0,
      is_day: true,
      weather_code: 1,
      condition: 'Mainly Clear',
      severity: 'low',
      gradient: 'from-amber-300 to-sky-400',
      icon: 'Sun',
      timestamp: new Date().toISOString()
    },
    aqi: { us_aqi: 68, category: 'Moderate', color: '#eab308', pm2_5: 20.5, pm10: 45.0, no2: 12.0, so2: 5.0, o3: 35.0, co: 260 },
    agriculture: { soil_temp_0cm: 26.0, soil_temp_6cm: 24.5, soil_moisture: '34.0', evapotranspiration_rate: 4.6 },
    hourly: [],
    daily: []
  };
}
