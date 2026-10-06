const express = require("express");
const router = express.Router();
const { getROI, calculateCustomROI } = require("../controllers/roiController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

/**
 * @openapi
 * /api/roi:
 *   get:
 *     summary: Get return on investment and payback duration for installed solar system
 *     tags: [ROI]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: System ROI and payback estimate
 */
router.get("/", getROI);

/**
 * @openapi
 * /api/roi/calculate:
 *   get:
 *     summary: Interactive ROI calculator with custom scenario parameters
 *     tags: [ROI]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: systemCost
 *         schema: { type: number, example: 250000 }
 *       - in: query
 *         name: systemCapacityKW
 *         schema: { type: number, example: 5.0 }
 *       - in: query
 *         name: tariffPerKWh
 *         schema: { type: number, example: 7.50 }
 *     responses:
 *       200:
 *         description: Scenario ROI analysis
 */
router.get("/calculate", calculateCustomROI);

module.exports = router;
