const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  recordConsumption,
  getConsumption,
  getConsumptionByPanel,
  seedDemoConsumption
} = require("../controllers/consumptionController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");

router.use(protect);

/**
 * @openapi
 * /api/consumption:
 *   post:
 *     summary: Record electricity consumption reading
 *     tags: [Consumption]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [powerConsumed, energyConsumed]
 *             properties:
 *               panelId: { type: string }
 *               powerConsumed: { type: number, example: 3.2, description: "Instantaneous kW" }
 *               energyConsumed: { type: number, example: 12.0, description: "Energy in kWh" }
 *               applianceCategory: { type: string, example: "HVAC" }
 *     responses:
 *       201:
 *         description: Consumption recorded
 *   get:
 *     summary: Retrieve electricity consumption readings and metrics
 *     tags: [Consumption]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Consumption history and stats
 */
router
  .route("/")
  .post(
    [
      body("powerConsumed").isFloat({ min: 0 }).withMessage("powerConsumed must be a non-negative number in kW"),
      body("energyConsumed").isFloat({ min: 0 }).withMessage("energyConsumed must be a non-negative number in kWh"),
      validate
    ],
    recordConsumption
  )
  .get(getConsumption);

/**
 * @openapi
 * /api/consumption/panel/{id}:
 *   get:
 *     summary: Get consumption readings for a specific panel or subsystem
 *     tags: [Consumption]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Consumption readings for panel
 */
router.get("/panel/:id", getConsumptionByPanel);

/**
 * @openapi
 * /api/consumption/demo:
 *   post:
 *     summary: Seed realistic demo consumption profile for testing
 *     tags: [Consumption]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Seeded demo consumption records
 */
router.post("/demo", seedDemoConsumption);

module.exports = router;
