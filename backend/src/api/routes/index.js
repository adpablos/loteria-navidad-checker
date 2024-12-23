const express = require("express");
const lotteryRoutes = require("./lottery.routes");
const metricsRoutes = require("./metrics.routes");

// Create main router
const router = express.Router();

// Mount routes
router.use("/lottery", lotteryRoutes);
router.use("/", metricsRoutes);

// Export configured router
module.exports = router;
