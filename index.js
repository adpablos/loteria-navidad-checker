const express = require("express");
const rateLimit = require("express-rate-limit");
const pino = require("pino");
const lotteryService = require("./services/LotteryApiService");
const Config = require("./config");
const { getLotteryDataWithCache, clearCache } = require("./cache");
const { v4: uuidv4 } = require("uuid");

/**
 * Express application instance.
 * @type {Express}
 */
const app = express();
const port = process.env.PORT || 3000;

// Trust the X-Forwarded-For header from the first proxy
app.set("trust proxy", true);

/**
 * Application logger instance.
 */
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});

/**
 * Rate limiter middleware configuration.
 * Protects API endpoints from abuse.
 */
const limiter = rateLimit({
  windowMs: Config.RATE_LIMIT.WINDOW_MS,
  max: Config.RATE_LIMIT.MAX_REQUESTS,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers["x-real-ip"] || req.ip,
});

// Apply middlewares
app.use(limiter);
app.use((req, res, next) => {
  req.requestId = uuidv4();
  next();
});
app.use(express.json());

/**
 * Validates the format of a lottery draw ID.
 *
 * @param {string} drawId - The draw ID to validate
 * @returns {boolean} True if the draw ID is valid
 */
function isValidDrawId(drawId) {
  return /^\d{10}$/.test(drawId);
}

/**
 * Endpoint to get the current lottery celebration state.
 * GET /api/lottery/state
 */
app.get("/api/lottery/state", async (req, res) => {
  const requestId = req.requestId;
  try {
    const data = await lotteryService.getCelebrationState(requestId);
    res.json(data);
  } catch (error) {
    _handleApiError(error, res, requestId, null);
  }
});

/**
 * Endpoint to check specific lottery ticket information.
 * GET /api/lottery/ticket
 */
app.get("/api/lottery/ticket", async (req, res) => {
  const { requestId, drawId } = _getRequestParams(req);

  try {
    const data = await _processApiRequest(
      () => lotteryService.getTicketInfo(drawId, requestId),
      requestId,
      drawId
    );
    res.json(data);
  } catch (error) {
    _handleApiError(error, res, requestId, drawId);
  }
});

/**
 * Endpoint to get lottery draw results.
 * Implements caching and automatic fallback between realtime and final results.
 * GET /api/lottery/results
 */
app.get("/api/lottery/results", async (req, res) => {
  const { requestId, drawId } = _getRequestParams(req);

  try {
    const { data, remainingTTL } = await getLotteryDataWithCache(
      "results",
      async () => {
        const { statusLNACcelebration } =
          await lotteryService.getCelebrationState(requestId);
        return statusLNACcelebration
          ? lotteryService.getRealtimeResults(requestId)
          : lotteryService.getDrawResults(drawId, requestId);
      },
      requestId
    );

    res.setHeader("X-Cache-Expiration", remainingTTL.toString());
    return res.json(data);
  } catch (error) {
    _handleApiError(error, res, requestId, drawId);
  }
});

/**
 * Extracts and normalizes request parameters.
 *
 * @param {Express.Request} req - The Express request object
 * @returns {Object} Normalized request parameters
 */
function _getRequestParams(req) {
  return {
    requestId: req.requestId,
    drawId: req.query.drawId || process.env.DEFAULT_DRAW_ID || "1259409102",
    clientIp: req.headers["x-real-ip"] || req.ip,
  };
}

/**
 * Processes an API request with validation and error handling.
 *
 * @param {Function} apiCall - The API function to call
 * @param {string} requestId - Request identifier
 * @param {string} drawId - Draw identifier
 * @returns {Promise<*>} API response data
 */
async function _processApiRequest(apiCall, requestId, drawId) {
  if (!isValidDrawId(drawId)) {
    logger.warn({ requestId, drawId }, `Invalid drawId: ${drawId}`);
    throw new Error("Invalid drawId. It must be a 10-digit number.");
  }
  return await apiCall();
}

/**
 * Handles API errors and sends appropriate responses.
 *
 * @param {Error} error - The error object
 * @param {Express.Response} res - The Express response object
 * @param {string} requestId - Request identifier
 * @param {string} drawId - Draw identifier
 */
function _handleApiError(error, res, requestId, drawId) {
  logger.error(
    {
      requestId,
      drawId,
      error: error.message,
      stack: error.stack,
    },
    `Error processing request`
  );

  if (error.message.includes("Invalid drawId")) {
    return res.status(400).json({ error: error.message });
  }

  if (error.status) {
    return res.status(error.status).json({ error: error.message });
  }

  res.status(500).json({ error: "Internal server error" });
}

/**
 * Endpoint to manually clear the cache.
 * GET /api/lottery/clearcache
 */
app.get("/api/lottery/clearcache", async (req, res) => {
  const requestId = req.requestId;
  logger.info({ requestId }, `Clearing cache`);
  clearCache(requestId);
  res.json({ message: "Cache cleared" });
});

// Start the server
app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
