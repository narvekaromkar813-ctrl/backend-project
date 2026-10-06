const { fetchWeather, calculateWeatherImpact } = require("../services/weatherService");
const Panel = require("../models/Panel");

// GET /api/weather/impact - Weather impact analysis on solar efficiency
const getWeatherImpact = async (req, res) => {
  try {
    const lat = req.query.lat ? Number(req.query.lat) : (req.user.location?.latitude || 19.076);
    const lon = req.query.lon ? Number(req.query.lon) : (req.user.location?.longitude || 72.8777);
    const city = req.query.city || req.user.location?.city || "Mumbai";

    const panels = await Panel.find({ user: req.user._id, status: "active" });
    const capacityKW = panels.reduce((sum, p) => sum + (p.capacity || 0), 0) || req.user.installedCapacity || 5.0;

    const weatherData = await fetchWeather(lat, lon, city);
    const impact = calculateWeatherImpact(weatherData, capacityKW);

    res.json({
      success: true,
      location: {
        city: weatherData.city,
        coordinates: weatherData.coordinates
      },
      currentWeather: {
        source: weatherData.source,
        temperatureC: weatherData.temperature,
        relativeHumidity: weatherData.relativeHumidity,
        cloudCoverPercentage: weatherData.cloudCover,
        solarIrradianceWPerM2: weatherData.solarIrradianceWPerM2,
        isDay: weatherData.isDay
      },
      impactAnalysis: impact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error analyzing weather impact: " + error.message
    });
  }
};

// GET /api/weather/forecast - Hourly solar generation forecast
const getWeatherForecast = async (req, res) => {
  try {
    const lat = req.query.lat ? Number(req.query.lat) : (req.user.location?.latitude || 19.076);
    const lon = req.query.lon ? Number(req.query.lon) : (req.user.location?.longitude || 72.8777);
    const city = req.query.city || req.user.location?.city || "Mumbai";

    const weatherData = await fetchWeather(lat, lon, city);

    const panels = await Panel.find({ user: req.user._id, status: "active" });
    const capacityKW = panels.reduce((sum, p) => sum + (p.capacity || 0), 0) || req.user.installedCapacity || 5.0;

    const forecastHours = (weatherData.hourlyForecast || []).map((h) => {
      const singleHourImpact = calculateWeatherImpact(
        {
          solarIrradianceWPerM2: h.solarIrradiance,
          temperature: h.temperature,
          cloudCover: h.cloudCover,
          isDay: h.solarIrradiance > 0
        },
        capacityKW
      );

      return {
        time: h.time,
        temperatureC: h.temperature,
        cloudCoverPercentage: h.cloudCover,
        solarIrradianceWPerM2: h.solarIrradiance,
        expectedGenerationKW: singleHourImpact.estimatedInstantaneousGenerationKW,
        efficiencyPercentage: singleHourImpact.overallEfficiencyPercentage
      };
    });

    const expectedTotalKWh = parseFloat(
      forecastHours.reduce((sum, h) => sum + (h.expectedGenerationKW || 0), 0).toFixed(1)
    );

    res.json({
      success: true,
      city: weatherData.city,
      systemCapacityKW: capacityKW,
      forecastDurationHours: forecastHours.length,
      projectedDayGenerationKWh: expectedTotalKWh,
      hourlyForecast: forecastHours
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching solar weather forecast: " + error.message
    });
  }
};

module.exports = {
  getWeatherImpact,
  getWeatherForecast
};
