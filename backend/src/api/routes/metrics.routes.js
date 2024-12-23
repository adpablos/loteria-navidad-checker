const express = require("express");
const MetricsUtil = require("../../utils/metrics.util");

/**
 * @openapi
 * tags:
 *   - name: Monitoring
 *     description: Application monitoring and metrics
 */

/**
 * @openapi
 * /metrics:
 *   get:
 *     summary: Get application metrics
 *     tags: [Monitoring]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Current application metrics
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

// Create router instance
const router = express.Router();

// Define routes
router.get("/metrics", async (req, res, next) => {
  try {
    res.json(MetricsUtil.getMetrics());
  } catch (error) {
    next(error);
  }
});

// Export router
module.exports = router;
