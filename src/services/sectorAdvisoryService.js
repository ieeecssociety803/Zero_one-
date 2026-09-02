// Sector-Specific Advisory Service for Agriculture, Aviation, Marine & Disaster Management

export const MAJOR_AIRPORTS = [
  { icao: 'VIDP', iata: 'DEL', name: 'Indira Gandhi Int Airport, New Delhi', runways: ['10/28', '11L/29R', '09/27'], lat: 28.5562, lon: 77.1000 },
  { icao: 'VABB', iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj Int, Mumbai', runways: ['09/27', '14/32'], lat: 19.0896, lon: 72.8656 },
  { icao: 'VOBL', iata: 'BLR', name: 'Kempegowda Int Airport, Bengaluru', runways: ['09L/27R', '09R/27L'], lat: 13.1986, lon: 77.7066 },
  { icao: 'VECC', iata: 'CCU', name: 'Netaji Subhash Chandra Bose Int, Kolkata', runways: ['01R/19L', '01L/19R'], lat: 22.6547, lon: 88.4467 },
  { icao: 'VOMM', iata: 'MAA', name: 'Chennai International Airport, Chennai', runways: ['07/25', '12/30'], lat: 12.9941, lon: 80.1709 },
  { icao: 'VOHS', iata: 'HYD', name: 'Rajiv Gandhi Int Airport, Hyderabad', runways: ['09L/27R', '09R/27L'], lat: 17.2403, lon: 78.4294 },
  { icao: 'VOCI', iata: 'COK', name: 'Cochin International Airport, Kochi', runways: ['09/27'], lat: 10.1518, lon: 76.3930 }
];

export function generateAgriAdvisory(weatherData) {
  const current = weatherData.current;
  const temp = current.temperature;
  const rh = current.humidity;
  const wind = current.wind_speed;
  const precipProb = weatherData.daily?.[0]?.precipProb || 0;
  const rainNext48h = (weatherData.daily?.[0]?.precipSum || 0) + (weatherData.daily?.[1]?.precipSum || 0);

  // Irrigation decision
  let irrigationStatus = 'Recommended';
  let irrigationReason = 'Optimal soil moisture depletion with dry conditions forecast.';
  if (rainNext48h > 5 || precipProb > 60) {
    irrigationStatus = 'Withhold / Postpone';
    irrigationReason = `Rainfall predicted (${rainNext48h.toFixed(1)} mm, ${precipProb}% probability). Conserve water and prevent root waterlogging.`;
  } else if (temp > 38) {
    irrigationStatus = 'High Priority Irrigation';
    irrigationReason = 'High ambient temperatures will induce thermal moisture stress. Apply light evening irrigation.';
  }

  // Spraying conditions (Pesticide/Fertilizer)
  let sprayCondition = 'Safe to Spray';
  let sprayDetails = 'Wind speed is under 15 km/h and no immediate rain expected.';
  if (wind > 18) {
    sprayCondition = 'Unfavourable (High Drift Risk)';
    sprayDetails = `Wind speed is ${wind} km/h (exceeds safe threshold of 15 km/h). Chemical drift risk to non-target areas.`;
  } else if (rainNext48h > 2 || precipProb > 45) {
    sprayCondition = 'Postpone Spraying';
    sprayDetails = 'Precipitation will wash away chemical application before systemic absorption.';
  }

  // Pest & Disease Risk Matrix
  const pestRisks = [];
  if (rh > 75 && temp >= 20 && temp <= 30) {
    pestRisks.push({
      pest: 'Fungal Blast & Sheath Blight',
      crops: 'Paddy, Rice',
      severity: 'High',
      recommendation: 'Monitor crop foliage. Apply Tricyclazole 75 WP @ 0.6 g/L or Azoxystrobin on dry canopy.'
    });
  }
  if (rh > 70 && temp > 28) {
    pestRisks.push({
      pest: 'Sucking Pests (Aphids, Jassids, Whitefly)',
      crops: 'Cotton, Vegetables, Mustard',
      severity: 'Medium',
      recommendation: 'Deploy yellow sticky traps @ 10/acre. Spray Neem oil (1500 ppm) @ 3 ml/L if threshold reached.'
    });
  }
  if (temp < 12 && rh > 80) {
    pestRisks.push({
      pest: 'Yellow Rust / Late Blight',
      crops: 'Wheat, Potato',
      severity: 'High',
      recommendation: 'Scout lower leaves for yellow pustules. Spray Propiconazole 25 EC @ 1 ml/L.'
    });
  }
  if (pestRisks.length === 0) {
    pestRisks.push({
      pest: 'General Pathogen Activity',
      crops: 'All Seasonal Crops',
      severity: 'Low',
      recommendation: 'Current microclimate indicates stable, low pathogen pressure. Continue standard crop maintenance.'
    });
  }

  return {
    irrigation: { status: irrigationStatus, reason: irrigationReason },
    spraying: { status: sprayCondition, details: sprayDetails },
    pestRisks,
    soilMoisture: weatherData.agriculture?.soil_moisture || '32%',
    evapotranspiration: `${weatherData.agriculture?.evapotranspiration_rate || 4.2} mm/day`,
    advisoryBulletins: [
      'Ensure proper drainage channels in low-lying fields ahead of convective spells.',
      'Harvest mature Rabi/Kharif crops during clear afternoon hours to preserve grain moisture standard (<12%).',
      'Apply mulch to horticultural trees to retard soil water evaporation during high diurnal heat cycles.'
    ]
  };
}

export function generateAviationBriefing(icaoCode, weatherData) {
  const airport = MAJOR_AIRPORTS.find(a => a.icao.toUpperCase() === icaoCode.toUpperCase()) || MAJOR_AIRPORTS[0];
  const current = weatherData.current;
  const windDir = current.wind_direction;
  const windSpd = Math.round(current.wind_speed * 0.539957); // convert km/h to knots
  const windGusts = Math.round((current.wind_gusts || current.wind_speed * 1.3) * 0.539957);
  const tempC = current.temperature;
  const dewC = current.dew_point;
  const qnh = current.pressure;
  const visMeters = current.cloud_cover > 80 ? 4500 : current.precipitation > 0 ? 3000 : 9999;

  // Flight category
  let flightCategory = 'VFR'; // Visual Flight Rules
  let categoryColor = '#10b981';
  if (visMeters < 1500) {
    flightCategory = 'LIFR'; // Low IFR
    categoryColor = '#a855f7';
  } else if (visMeters < 5000) {
    flightCategory = 'IFR'; // Instrument Flight Rules
    categoryColor = '#ef4444';
  } else if (visMeters < 8000) {
    flightCategory = 'MVFR'; // Marginal VFR
    categoryColor = '#f59e0b';
  }

  // Calculate Crosswind for primary runway (assume heading 280 for '10/28')
  const runwayHeading = 280;
  const angleDiff = Math.abs(windDir - runwayHeading) * (Math.PI / 180);
  const crosswindKnots = Math.abs(Math.round(windSpd * Math.sin(angleDiff)));
  const headwindKnots = Math.round(windSpd * Math.cos(angleDiff));

  // Generate synthetic compliant ICAO METAR string
  const dateObj = new Date();
  const utcDay = String(dateObj.getUTCDate()).padStart(2, '0');
  const utcHour = String(dateObj.getUTCHours()).padStart(2, '0');
  const utcMin = String(dateObj.getUTCMinutes()).padStart(2, '0');
  const windString = `${String(windDir).padStart(3, '0')}${String(windSpd).padStart(2, '0')}${windGusts > windSpd + 8 ? `G${windGusts}` : ''}KT`;
  const metarString = `METAR ${airport.icao} ${utcDay}${utcHour}${utcMin}Z ${windString} ${visMeters > 9000 ? '9999' : `${visMeters}M`} ${current.weather_code > 50 ? 'RA' : 'FEW030'} ${tempC >= 0 ? String(tempC).padStart(2, '0') : `M${Math.abs(tempC)}`}/${dewC >= 0 ? String(dewC).padStart(2, '0') : `M${Math.abs(dewC)}`} Q${qnh} NOSIG`;

  const tafString = `TAF ${airport.icao} ${utcDay}1200Z ${utcDay}12/${parseInt(utcDay)+1}1800Z ${windString} 9999 SCT025 BECMG ${utcDay}16/${utcDay}18 ${windDir+20}08KT CAVOK`;

  return {
    airport,
    metar: metarString,
    taf: tafString,
    flightCategory,
    categoryColor,
    metrics: {
      windDirection: `${windDir}°`,
      windSpeed: `${windSpd} KT (Gusts ${windGusts} KT)`,
      crosswind: `${crosswindKnots} KT (Runway 28)`,
      headwind: `${headwindKnots} KT`,
      visibility: visMeters >= 9999 ? '> 10 km (CAVOK)' : `${visMeters} meters`,
      qnhAltimeter: `${qnh} hPa / ${(qnh * 0.02953).toFixed(2)} inHg`,
      tempDewSpread: `${(tempC - dewC).toFixed(1)} °C`,
      turbulenceRisk: windGusts > 25 ? 'Moderate Low-Level Turbulence' : 'Smooth / Light'
    }
  };
}

export function generateMarineAdvisory(lat, lon, weatherData) {
  const current = weatherData.current;
  const windKm = current.wind_speed;
  const windKnots = Math.round(windKm * 0.539957);

  // Sea state classification based on Beaufort Scale
  let beaufort = 3;
  let seaState = 'Slight';
  let waveHeightM = '0.8 - 1.2 m';
  let alertFlag = 'Green (Safe)';
  let flagColor = '#10b981';
  let fishermenWarning = 'Sea conditions are normal. Safe for artisanal and mechanized fishing boats.';

  if (windKnots > 35) {
    beaufort = 8;
    seaState = 'Very Rough to High';
    waveHeightM = '3.5 - 5.5 m';
    alertFlag = 'RED ALERT (Severe Danger)';
    flagColor = '#ef4444';
    fishermenWarning = 'FISHERMEN WARNING: Do NOT venture into deep sea or coastal waters. Total suspension of fishing operations advised.';
  } else if (windKnots > 24) {
    beaufort = 6;
    seaState = 'Rough';
    waveHeightM = '2.2 - 3.2 m';
    alertFlag = 'ORANGE ALERT (Warning)';
    flagColor = '#f97316';
    fishermenWarning = 'Fishermen advised not to venture into deep sea. Small craft and trawlers should return to harbour.';
  } else if (windKnots > 16) {
    beaufort = 4;
    seaState = 'Moderate';
    waveHeightM = '1.3 - 2.0 m';
    alertFlag = 'YELLOW WATCH';
    flagColor = '#eab308';
    fishermenWarning = 'Exercise caution in coastal waters. Moderate swells expected due to squally surface winds.';
  }

  return {
    seaState,
    beaufortScale: `Force ${beaufort}`,
    waveHeight: waveHeightM,
    swellPeriod: '8 - 11 seconds',
    windSpeedKnots: `${windKnots} KT (${windKm} km/h)`,
    alertFlag,
    flagColor,
    fishermenWarning,
    coastalSurge: windKnots > 25 ? 'Elevated surge 0.5m above astronomical tide' : 'Astronomical Normal',
    oceanCurrent: '0.6 knots North-Eastward',
    waterTemp: '28.5 °C'
  };
}
