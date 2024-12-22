const express = require("express");
const rateLimit = require("express-rate-limit");
const pino = require("pino");
const lotteryService = require("./services/LotteryApiService");
const Config = require("./config");
const { getLotteryDataWithCache, clearCache } = require("./cache");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = process.env.PORT || 3000;

// Trust the X-Forwarded-For header from the first proxy
app.set("trust proxy", true);

// Configure the logger (pino)
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});

// Configure the rate limiter
const limiter = rateLimit({
  windowMs: Config.RATE_LIMIT.WINDOW_MS,
  max: Config.RATE_LIMIT.MAX_REQUESTS,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers["x-real-ip"] || req.ip,
});

// Apply the rate limiter to all requests
app.use(limiter);

// Middleware to add a unique request ID to each request
app.use((req, res, next) => {
  req.requestId = uuidv4();
  next();
});

// Middleware to parse JSON request bodies
app.use(express.json());

// Function to validate the drawId format
function isValidDrawId(drawId) {
  return /^\d{10}$/.test(drawId);
}

// Endpoint to get lottery state
app.get("/api/lottery/state", async (req, res) => {
  const requestId = req.requestId;
  try {
    const data = await lotteryService.getCelebrationState(requestId);
    res.json(data);
  } catch (error) {
    _handleApiError(error, res, requestId, null);
  }
});

// Endpoint to get lottery ticket info
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

// Endpoint to get draw results
app.get("/api/lottery/results", async (req, res) => {
  const { requestId, drawId } = _getRequestParams(req);

  try {
    const { data, remainingTTL } = await getLotteryDataWithCache(
      "results",
      async () => {
        // Fallback logic
        const { statusLNACcelebration } =
          await lotteryService.getCelebrationState(requestId);
        if (statusLNACcelebration) {
          return lotteryService.getRealtimeResults(requestId);
        } else {
          return lotteryService.getDrawResults(drawId, requestId);
        }
      },
      requestId
    );

    // set the cache expiration header
    res.setHeader("X-Cache-Expiration", remainingTTL.toString());

    return res.json(data);
  } catch (error) {
    _handleApiError(error, res, requestId, drawId);
  }
});

function _getRequestParams(req) {
  return {
    requestId: req.requestId,
    drawId: req.query.drawId || process.env.DEFAULT_DRAW_ID || "1259409102",
    clientIp: req.headers["x-real-ip"] || req.ip,
  };
}

async function _processApiRequest(apiCall, requestId, drawId) {
  if (!isValidDrawId(drawId)) {
    logger.warn({ requestId, drawId }, `Invalid drawId: ${drawId}`);
    throw new Error("Invalid drawId. It must be a 10-digit number.");
  }

  return await apiCall();
}

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

// Endpoint to clear the cache
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
