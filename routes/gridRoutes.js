const express = require("express");
const router = express.Router();
const { getGridExport, getGridImport } = require("../controllers/gridController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

/**
 * @openapi
 * /api/grid/export:
 *   get:
 *     summary: Retrieve net electricity exported to grid
 *     tags: [Grid]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Grid export statistics
 */
router.get("/export", getGridExport);

/**
 * @openapi
 * /api/grid/import:
 *   get:
 *     summary: Retrieve electricity imported from grid
 *     tags: [Grid]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Grid import statistics
 */
router.get("/import", getGridImport);

module.exports = router;
