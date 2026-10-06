const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { sendNotification } = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");

router.use(protect);

/**
 * @openapi
 * /api/notifications/send:
 *   post:
 *     summary: Dispatch maintenance alert push notification via Socket.IO and Firebase
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, body]
 *             properties:
 *               title: { type: string, example: "Panel Cleaning Required" }
 *               body: { type: string, example: "Panel #3 underperforming 8%, cleaning due" }
 *               severity: { type: string, enum: [low, medium, high, critical], example: "medium" }
 *               fcmToken: { type: string, description: "Optional FCM device token" }
 *     responses:
 *       200:
 *         description: Notification dispatched
 */
router.post(
  "/send",
  [
    body("title").trim().notEmpty().withMessage("Notification title is required"),
    body("body").trim().notEmpty().withMessage("Notification body is required"),
    validate
  ],
  sendNotification
);

module.exports = router;
