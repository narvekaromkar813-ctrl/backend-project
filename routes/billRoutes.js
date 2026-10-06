const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  getBills,
  predictBill,
  getMonthlyBills,
  createBill
} = require("../controllers/billController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");

router.use(protect);

/**
 * @openapi
 * /api/bills:
 *   get:
 *     summary: Retrieve electricity bills and monthly savings summary
 *     tags: [Bills]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Bill history and financial savings
 *   post:
 *     summary: Record or update an electricity bill
 *     tags: [Bills]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [billingMonth, totalConsumedKWh, totalGeneratedKWh]
 *             properties:
 *               billingMonth: { type: string, example: "2026-09" }
 *               totalConsumedKWh: { type: number, example: 360 }
 *               totalGeneratedKWh: { type: number, example: 540 }
 *               tariffPerKWh: { type: number, example: 7.50 }
 *     responses:
 *       201:
 *         description: Bill created or updated successfully
 */
router
  .route("/")
  .get(getBills)
  .post(
    [
      body("billingMonth").matches(/^\d{4}-(0[1-9]|1[0-2])$/).withMessage("billingMonth must follow YYYY-MM format"),
      body("totalConsumedKWh").isFloat({ min: 0 }).withMessage("totalConsumedKWh must be non-negative"),
      body("totalGeneratedKWh").isFloat({ min: 0 }).withMessage("totalGeneratedKWh must be non-negative"),
      validate
    ],
    createBill
  );

/**
 * @openapi
 * /api/bills/predict:
 *   get:
 *     summary: Predict upcoming electricity bill for current billing cycle
 *     tags: [Bills]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Bill projection and estimated savings
 */
router.get("/predict", predictBill);

/**
 * @openapi
 * /api/bills/monthly:
 *   get:
 *     summary: Retrieve monthly savings breakdown
 *     tags: [Bills]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema: { type: integer, example: 2026 }
 *     responses:
 *       200:
 *         description: Monthly electricity and savings history
 */
router.get("/monthly", getMonthlyBills);

module.exports = router;
