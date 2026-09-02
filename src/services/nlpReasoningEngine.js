// NLP Reasoning Engine Bridge to Python FastAPI Backend

const API_BASE = 'http://127.0.0.1:8000/api';

export async function processWeatherGPTQuery({ query, currentWeatherData, activeLocation, activeLanguage = 'en', apiKey = '', provider = 'builtin' }) {
  if (!query || !query.trim()) {
    return {
      text: "Please ask a question regarding weather forecasts, agricultural advisories, aviation METAR, marine safety, NWP models, or climate analytics.",
      type: 'general'
    };
  }

  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        lat: activeLocation.lat,
        lon: activeLocation.lon,
        location_name: `${activeLocation.name}, ${activeLocation.state || activeLocation.country || ''}`,
        current_weather: currentWeatherData,
        lang: activeLanguage,
        api_key: apiKey,
        provider: provider
      })
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Python backend chat endpoint unreachable, using client fallback:', err);
  }

  // Client Fallback
  return {
    type: 'general',
    text: `🌦️ **${activeLocation.name}**\n\n• Current Temp: **${currentWeatherData?.current?.temperature || 26}°C**\n• Condition: **${currentWeatherData?.current?.condition || 'Clear Sky'}**\n• Humidity: ${currentWeatherData?.current?.humidity || 60}% | Wind: ${currentWeatherData?.current?.wind_speed || 12} km/h`
  };
}
