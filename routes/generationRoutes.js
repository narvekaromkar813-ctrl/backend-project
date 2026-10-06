const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  recordGeneration,
  getGeneration,
  getGenerationByPanel,
  seedDemoGeneration
} = require("../controllers/generationController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");

router.use(protect);

/**
 * @openapi
 * /api/generation:
 *   post:
 *     summary: Record solar generation reading
 *     tags: [Generation]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [panelId, powerOutput, energyGenerated]
 *             properties:
 *               panelId: { type: string }
 *               powerOutput: { type: number, example: 4.8, description: "Instantaneous kW" }
 *               energyGenerated: { type: number, example: 18.2, description: "Energy generated in kWh" }
 *               temperature: { type: number, example: 32 }
 *               irradiance: { type: number, example: 850 }
 *     responses:
 *       201:
 *         description: Generation recorded successfully
 *   get:
 *     summary: Retrieve generation readings and summary statistics
 *     tags: [Generation]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Generation statistics and readings
 */
router
  .route("/")
  .post(
    [
      body("panelId").notEmpty().withMessage("panelId is required"),
      body("powerOutput").isFloat({ min: 0 }).withMessage("powerOutput must be a non-negative number in kW"),
      body("energyGenerated").isFloat({ min: 0 }).withMessage("energyGenerated must be a non-negative number in kWh"),
      validate
    ],
    recordGeneration
  )
  .get(getGeneration);

/**
 * @openapi
 * /api/generation/panel/{id}:
 *   get:
 *     summary: Get generation readings for a specific solar panel
 *     tags: [Generation]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Panel generation records
 */
router.get("/panel/:id", getGenerationByPanel);

/**
 * @openapi
 * /api/generation/demo:
 *   post:
 *     summary: Seed realistic demo telemetry for instant testing
 *     tags: [Generation]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Seeded demo generation telemetry
 */
router.post("/demo", seedDemoGeneration);

module.exports = router;
