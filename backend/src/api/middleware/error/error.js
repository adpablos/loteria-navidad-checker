const LoggerUtil = require("../../../utils/logger.util");
const { ERROR_CODES } = require("../../../constants/error-codes.constant");

/**
 * Custom API Error class for handling HTTP errors.
 * @extends Error
 */
class ApiError extends Error {
  /**
   * Creates an instance of ApiError.
   *
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {string} code - Error code from ERROR_CODES enum
   * @param {Object} context - Additional error context
   */
  constructor(statusCode, message, code, context = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.context = context;
    this.name = "ApiError";
    this.timestamp = new Date().toISOString();
  }

  /**
   * Converts error to JSON format for response
   * @returns {Object} Formatted error object
   */
  toJSON() {
    return {
      status: "error",
      code: this.code,
      message: this.message,
      timestamp: this.timestamp,
      requestId: this.context.requestId,
      ...(process.env.NODE_ENV === "development" && {
        details: this.context,
      }),
    };
  }
}

/**
 * Logs error information with enhanced context
 *
 * @param {Error} error - Error object to log
 * @param {string} requestId - Request identifier
 * @param {Express.Request} req - Express request object
 */
const logError = (error, requestId, req) => {
  const errorContext = {
    requestId,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
      headers: {
        "user-agent": req.get("user-agent"),
        "x-real-ip": req.get("x-real-ip"),
      },
    },
    error: {
      name: error.name,
      code: error.code || ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      context: error.context,
    },
  };

  if (error.statusCode >= 500) {
    LoggerUtil.error(errorContext, "Server error occurred");
  } else if (error.statusCode === 429) {
    LoggerUtil.warn(errorContext, "Rate limit exceeded");
  } else {
    LoggerUtil.info(errorContext, "Client error occurred");
  }
};

/**
 * Global error handling middleware.
 * Processes all errors and sends structured responses.
 *
 * @param {Error} err - Error object
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 * @param {Express.NextFunction} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  const requestId = req.requestId;

  // Log the error with enhanced context
  logError(err, requestId, req);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle unexpected errors
  const internalError = new ApiError(
    500,
    "Internal server error",
    ERROR_CODES.INTERNAL_SERVER_ERROR,
    {
      requestId,
      originalError:
        process.env.NODE_ENV === "development" ? err.message : undefined,
    }
  );

  res.status(500).json(internalError.toJSON());
};

module.exports = {
  errorHandler,
  ApiError,
  logError,
};
