const express = require("express");
const router = express.Router();
const {
  getBatteryOptimization,
  getEVScheduler,
  getCarbonSavings,
  getIncentives,
  createIncentiveClaim
} = require("../controllers/advancedController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

/**
 * @openapi
 * /api/advanced/battery:
 *   get:
 *     summary: Battery storage optimization and peak shaving schedule
 *     tags: [Advanced]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Battery optimization recommendations
 */
router.get("/battery", getBatteryOptimization);

/**
 * @openapi
 * /api/advanced/ev-scheduler:
 *   get:
 *     summary: Smart EV charging schedule aligned with peak solar generation
 *     tags: [Advanced]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: EV charging schedule
 */
router.get("/ev-scheduler", getEVScheduler);

/**
 * @openapi
 * /api/advanced/carbon-savings:
 *   get:
 *     summary: Carbon emissions offset and environmental impact tracker
 *     tags: [Advanced]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Carbon savings metrics
 */
router.get("/carbon-savings", getCarbonSavings);

/**
 * @openapi
 * /api/advanced/incentives:
 *   get:
 *     summary: Retrieve government solar subsidies and net metering incentives
 *     tags: [Advanced]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Solar incentive claims and schemes
 *   post:
 *     summary: Submit a new solar subsidy incentive claim
 *     tags: [Advanced]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Incentive claim submitted
 */
router.route("/incentives").get(getIncentives).post(createIncentiveClaim);

module.exports = router;
