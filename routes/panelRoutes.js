const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  createPanel,
  getPanels,
  getPanelById,
  updatePanel,
  deletePanel
} = require("../controllers/panelController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");

// All panel routes are protected
router.use(protect);

/**
 * @openapi
 * /api/panels:
 *   post:
 *     summary: Register a new solar panel
 *     tags: [Panels]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, capacity]
 *             properties:
 *               name: { type: string, example: "Rooftop Array 1" }
 *               capacity: { type: number, example: 5.0, description: "Capacity in kW" }
 *               location: { type: string, example: "Main Terrace North-East" }
 *               panelType: { type: string, example: "Monocrystalline" }
 *               cost: { type: number, example: 250000 }
 *               efficiency: { type: number, example: 21.5 }
 *     responses:
 *       201:
 *         description: Panel created successfully
 *   get:
 *     summary: Get all solar panels for the user
 *     tags: [Panels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of panels
 */
router
  .route("/")
  .post(
    [
      body("name").trim().notEmpty().withMessage("Panel name is required"),
      body("capacity").isFloat({ min: 0.1 }).withMessage("Capacity must be at least 0.1 kW"),
      validate
    ],
    createPanel
  )
  .get(getPanels);

/**
 * @openapi
 * /api/panels/{id}:
 *   get:
 *     summary: Get single panel details by ID
 *     tags: [Panels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Panel details
 *   put:
 *     summary: Update a solar panel
 *     tags: [Panels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Panel updated successfully
 *   delete:
 *     summary: Delete a solar panel
 *     tags: [Panels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Panel deleted successfully
 */
router
  .route("/:id")
  .get(getPanelById)
  .put(updatePanel)
  .delete(deletePanel);

module.exports = router;
