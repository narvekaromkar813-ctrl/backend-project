const express = require("express");
const router = express.Router();
const { getWeatherImpact, getWeatherForecast } = require("../controllers/weatherController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

/**
 * @openapi
 * /api/weather/impact:
 *   get:
 *     summary: Analyze weather and environmental impact on solar efficiency
 *     tags: [Weather]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema: { type: number, example: 19.076 }
 *       - in: query
 *         name: lon
 *         schema: { type: number, example: 72.8777 }
 *       - in: query
 *         name: city
 *         schema: { type: string, example: "Mumbai" }
 *     responses:
 *       200:
 *         description: Weather impact analytics
 */
router.get("/impact", getWeatherImpact);

/**
 * @openapi
 * /api/weather/forecast:
 *   get:
 *     summary: Retrieve hourly solar generation weather forecast
 *     tags: [Weather]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: city
 *         schema: { type: string, example: "Mumbai" }
 *     responses:
 *       200:
 *         description: Solar generation forecast
 */
router.get("/forecast", getWeatherForecast);

module.exports = router;
