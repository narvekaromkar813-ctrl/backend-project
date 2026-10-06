const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Omkar Narvekar" }
 *               email: { type: string, example: "omkar@example.com" }
 *               password: { type: string, minLength: 8, example: "Password123" }
 *               role: { type: string, enum: [user, admin], example: "user" }
 *               installedCapacity: { type: number, example: 5.0 }
 *               electricityTariff: { type: number, example: 7.50 }
 *     responses:
 *       201:
 *         description: Registered successfully
 */
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    validate
  ],
  register
);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login user & get JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "omkar@example.com" }
 *               password: { type: string, example: "Password123" }
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
    validate
  ],
  login
);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile details
 */
router.get("/me", protect, getMe);

/**
 * @openapi
 * /api/auth/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put("/profile", protect, updateProfile);

/**
 * @openapi
 * /api/auth/change-password:
 *   put:
 *     summary: Change user password securely
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Password changed
 */
router.put(
  "/change-password",
  protect,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters"),
    validate
  ],
  changePassword
);

module.exports = router;