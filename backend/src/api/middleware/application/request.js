const { v4: uuidv4 } = require("uuid");
const { isValidDrawId } = require("../../../utils/lottery.util");
const MetricsUtil = require("../../../utils/metrics.util");
const { ValidationError } = require("../../../errors");
const LoggerUtil = require("../../../utils/logger.util");

/**
 * Extracts and normalizes common request parameters.
 *
 * @param {Express.Request} req - The Express request object
 * @returns {Object} Normalized request parameters
 */
const getRequestParams = (req) => ({
  requestId: req.requestId || uuidv4(),
  drawId: req.params.drawId || req.query.drawId,
  clientIp: req.headers["x-real-ip"] || req.ip,
});

/**
 * Validates request parameters and processes API requests.
 *
 * @param {Function} apiCall - The API function to call
 * @param {string} requestId - Request identifier
 * @param {string} drawId - Draw identifier
 * @returns {Promise<*>} API response data
 * @throws {ValidationError} When drawId is invalid
 */
const processApiRequest = async (apiCall, requestId, drawId) => {
  if (drawId && !isValidDrawId(drawId)) {
    LoggerUtil.warn({ requestId, drawId }, `Invalid drawId: ${drawId}`);
    throw new ValidationError("Invalid drawId. It must be a 10-digit number.", {
      drawId,
      requestId,
    });
  }
  return await apiCall();
};

/**
 * Middleware to process incoming requests.
 * Adds request ID and validates parameters.
 *
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 * @param {Express.NextFunction} next - Express next middleware function
 */
const requestMiddleware = (req, res, next) => {
  const start = Date.now();

  try {
    // Generate and set request ID
    req.requestId = uuidv4();
    res.setHeader("X-Request-ID", req.requestId);

    // Add debug log to track request
    LoggerUtil.debug(
      {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        params: req.params,
        query: req.query,
      },
      "Incoming request"
    );

    // Extract and validate parameters
    req.requestParams = getRequestParams(req);

    if (req.requestParams.drawId && !isValidDrawId(req.requestParams.drawId)) {
      throw new ValidationError(
        "Invalid drawId. It must be a 10-digit number.",
        {
          drawId: req.requestParams.drawId,
          requestId: req.requestId,
        }
      );
    }

    // Add response finish handler
    res.on("finish", () => {
      const duration = Date.now() - start;
      MetricsUtil.trackRequest(req.path, res.statusCode, duration);

      // Add debug log for response
      LoggerUtil.debug(
        {
          requestId: req.requestId,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
        },
        "Request completed"
      );
    });

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestMiddleware,
  processApiRequest,
  getRequestParams,
};
