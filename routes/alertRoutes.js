const express = require("express");
const router = express.Router();
const {
  getAlerts,
  checkAlerts,
  getAlertById,
  markAlertRead,
  resolveAlert
} = require("../controllers/alertController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

/**
 * @openapi
 * /api/alerts:
 *   get:
 *     summary: Retrieve system alerts and maintenance notifications
 *     tags: [Alerts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: severity
 *         schema: { type: string, enum: [low, medium, high, critical] }
 *       - in: query
 *         name: isRead
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: List of alerts
 */
router.get("/", getAlerts);

/**
 * @openapi
 * /api/alerts/check:
 *   post:
 *     summary: Trigger automated system diagnostic to identify panel underperformance & anomalies
 *     tags: [Alerts]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Diagnostic results
 */
router.post("/check", checkAlerts);

/**
 * @openapi
 * /api/alerts/{id}:
 *   get:
 *     summary: Get single alert details
 *     tags: [Alerts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Alert details
 */
router.get("/:id", getAlertById);

/**
 * @openapi
 * /api/alerts/{id}/read:
 *   put:
 *     summary: Mark alert as read
 *     tags: [Alerts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Alert marked as read
 */
router.put("/:id/read", markAlertRead);

/**
 * @openapi
 * /api/alerts/{id}/resolve:
 *   put:
 *     summary: Mark alert as resolved
 *     tags: [Alerts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Alert resolved
 */
router.put("/:id/resolve", resolveAlert);

module.exports = router;
