const rateLimit = require("express-rate-limit");
const Config = require("../../../config");

/**
 * Creates rate limiting middleware.
 * Controls request rate per IP to prevent abuse.
 *
 * @returns {import('express-rate-limit').RateLimit} Configured rate limiter
 */
const createRateLimiter = () =>
  rateLimit({
    // Time window in milliseconds
    windowMs: Config.RATE_LIMIT.WINDOW_MS,

    // Maximum number of requests per window
    max: Config.RATE_LIMIT.MAX_REQUESTS,

    // Error message when limit is exceeded
    message: "Too many requests from this IP, please try again later.",

    // Enable headers for rate limit info
    standardHeaders: true,

    // Disable legacy rate limit headers
    legacyHeaders: false,

    // Use X-Real-IP header if available, fallback to req.ip
    keyGenerator: (req) => req.headers["x-real-ip"] || req.ip,

    // Handler for when rate limit is exceeded
    handler: (req, res) => {
      res.status(429).json({
        status: "error",
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests from this IP, please try again later.",
        requestId: req.requestId,
      });
    },
  });

// Export configured middleware
module.exports = createRateLimiter();
