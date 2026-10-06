const axios = require("axios");

// Simple in-memory cache for weather results (15-minute TTL)
const weatherCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * Fetch weather and solar irradiance for given coordinates
 * @param {number} [latitude=19.076] 
 * @param {number} [longitude=72.8777] 
 * @param {string} [city="Mumbai"]
 */
async function fetchWeather(latitude = 19.076, longitude = 72.8777, city = "Mumbai") {
  const cacheKey = `${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { ...cached.data, cached: true };
  }

  try {
    // Open-Meteo provides solar radiation and weather without requiring an API key
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,wind_speed_10m,direct_normal_irradiance,shortwave_radiation&hourly=temperature_2m,cloud_cover,direct_normal_irradiance&forecast_days=2&timezone=auto`;

    const response = await axios.get(url, { timeout: 4000 });
    const current = response.data.current || {};
    const hourly = response.data.hourly || {};

    const temp = current.temperature_2m !== undefined ? current.temperature_2m : 28;
    const cloudCover = current.cloud_cover !== undefined ? current.cloud_cover : 15;
    const irradiance = current.direct_normal_irradiance !== undefined
      ? current.direct_normal_irradiance
      : (current.shortwave_radiation || 800);

    const weatherData = {
      source: "live_api (Open-Meteo)",
      city,
      coordinates: { latitude, longitude },
      temperature: temp,
      relativeHumidity: current.relative_humidity_2m || 55,
      cloudCover: cloudCover,
      isDay: current.is_day === 1,
      solarIrradianceWPerM2: Math.round(irradiance),
      hourlyForecast: (hourly.time || []).slice(0, 12).map((time, idx) => ({
        time,
        temperature: hourly.temperature_2m ? hourly.temperature_2m[idx] : 28,
        cloudCover: hourly.cloud_cover ? hourly.cloud_cover[idx] : 20,
        solarIrradiance: hourly.direct_normal_irradiance ? hourly.direct_normal_irradiance[idx] : 750
      })),
      fetchedAt: new Date().toISOString()
    };

    weatherCache.set(cacheKey, { timestamp: Date.now(), data: weatherData });
    return { ...weatherData, cached: false };
  } catch (error) {
    console.warn(`[WeatherService] External weather fetch failed (${error.message}). Using resilient fallback.`);

    // High-quality deterministic fallback data
    const hour = new Date().getHours();
    const isDayTime = hour >= 6 && hour <= 18;
    const mockIrradiance = isDayTime ? Math.max(150, Math.sin(((hour - 6) / 12) * Math.PI) * 900) : 0;

    return {
      source: "fallback_simulation",
      city,
      coordinates: { latitude, longitude },
      temperature: 29.5,
      relativeHumidity: 60,
      cloudCover: 18,
      isDay: isDayTime,
      solarIrradianceWPerM2: Math.round(mockIrradiance),
      hourlyForecast: Array.from({ length: 12 }, (_, i) => {
        const h = (hour + i) % 24;
        const sun = h >= 6 && h <= 18 ? Math.max(0, Math.sin(((h - 6) / 12) * Math.PI) * 850) : 0;
        return {
          time: new Date(Date.now() + i * 3600000).toISOString(),
          temperature: 28 + (h >= 12 && h <= 15 ? 4 : 0),
          cloudCover: 20,
          solarIrradiance: Math.round(sun)
        };
      }),
      cached: false,
      fetchedAt: new Date().toISOString()
    };
  }
}

/**
 * Compute solar performance impact rating from environmental variables
 * Standard Test Conditions (STC): 1000 W/m², 25°C cell temp.
 * @param {object} weatherData 
 * @param {number} [systemCapacityKW=5.0]
 */
function calculateWeatherImpact(weatherData, systemCapacityKW = 5.0) {
  const irradiance = weatherData.solarIrradianceWPerM2 || 0;
  const temp = weatherData.temperature || 25;
  const cloudCover = weatherData.cloudCover || 0;

  // 1. Irradiance efficiency ratio (1000 W/m² = 100%)
  const irradianceRatio = Math.min(1.0, irradiance / 1000);

  // 2. Temperature degradation: -0.4% per degree above 25°C
  const tempDelta = Math.max(0, temp - 25);
  const tempDeratingFactor = Math.max(0.7, 1 - (tempDelta * 0.004));

  // 3. Cloud attenuation factor: 100% clouds reduce direct beam by up to 75%
  const cloudFactor = Math.max(0.2, 1 - (cloudCover / 100) * 0.75);

  // Overall impact factor (0 - 100%)
  const overallEfficiencyFactor = irradiance > 0
    ? Math.min(100, Math.round(irradianceRatio * tempDeratingFactor * cloudFactor * 100))
    : 0;

  // Estimated instantaneous generation (kW)
  const estimatedGenerationKW = parseFloat(
    ((systemCapacityKW * (overallEfficiencyFactor / 100))).toFixed(2)
  );

  let conditionSummary = "Optimal";
  if (cloudCover > 60) conditionSummary = "Heavy Cloud Cover — Lower Generation Expected";
  else if (cloudCover > 30) conditionSummary = "Moderate Cloud Cover — Slight Attenuation";
  else if (temp > 35) conditionSummary = "High Ambient Heat — Mild Thermal Derating";
  else if (irradiance < 200 && weatherData.isDay) conditionSummary = "Low Solar Radiation";
  else if (!weatherData.isDay) conditionSummary = "Nighttime — Zero Solar Radiation";

  return {
    conditionSummary,
    overallEfficiencyPercentage: overallEfficiencyFactor,
    factors: {
      irradianceWPerM2: irradiance,
      irradianceEfficiency: parseFloat((irradianceRatio * 100).toFixed(1)),
      temperatureC: temp,
      thermalLossPercentage: parseFloat((tempDelta * 0.4).toFixed(1)),
      cloudCoverPercentage: cloudCover,
      cloudLossPercentage: parseFloat(((1 - cloudFactor) * 100).toFixed(1))
    },
    systemCapacityKW,
    estimatedInstantaneousGenerationKW: estimatedGenerationKW,
    calculationNote:
      "Estimates calculated using PV standard test conditions (1000 W/m² STC baseline, -0.4%/°C thermal coefficient above 25°C, and cloud attenuation curve)."
  };
}

module.exports = {
  fetchWeather,
  calculateWeatherImpact
};
