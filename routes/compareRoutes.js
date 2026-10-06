const express = require("express");
const router = express.Router();
const { compareNeighbors } = require("../controllers/compareController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

/**
 * @openapi
 * /api/compare/neighbors:
 *   get:
 *     summary: Compare solar generation performance anonymously against nearby installations
 *     tags: [Comparison]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Anonymous neighborhood comparison
 */
router.get("/neighbors", compareNeighbors);

module.exports = router;
