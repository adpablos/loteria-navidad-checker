/**
 * Standardized error codes for the application.
 * Each code maps to a specific type of error with its corresponding HTTP status code.
 *
 * @enum {Object}
 */
const ERROR_CODES = Object.freeze({
  // Validation Errors (400)
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    status: 400,
    defaultMessage: "Invalid request parameters",
  },
  INVALID_DRAW_ID: {
    code: "INVALID_DRAW_ID",
    status: 400,
    defaultMessage: "Invalid draw ID format",
  },
  MISSING_REQUIRED_FIELD: {
    code: "MISSING_REQUIRED_FIELD",
    status: 400,
    defaultMessage: "Required field is missing",
  },

  // Authentication Errors (401)
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    status: 401,
    defaultMessage: "Authentication required",
  },
  INVALID_TOKEN: {
    code: "INVALID_TOKEN",
    status: 401,
    defaultMessage: "Invalid or expired token",
  },

  // Authorization Errors (403)
  FORBIDDEN: {
    code: "FORBIDDEN",
    status: 403,
    defaultMessage: "Access forbidden",
  },
  INSUFFICIENT_PERMISSIONS: {
    code: "INSUFFICIENT_PERMISSIONS",
    status: 403,
    defaultMessage: "Insufficient permissions to access resource",
  },

  // Not Found Errors (404)
  NOT_FOUND: {
    code: "NOT_FOUND",
    status: 404,
    defaultMessage: "Resource not found",
  },
  RESOURCE_NOT_FOUND: {
    code: "RESOURCE_NOT_FOUND",
    status: 404,
    defaultMessage: "The requested resource was not found",
  },
  TICKET_NOT_FOUND: {
    code: "TICKET_NOT_FOUND",
    status: 404,
    defaultMessage: "Lottery ticket not found",
  },

  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED: {
    code: "RATE_LIMIT_EXCEEDED",
    status: 429,
    defaultMessage: "Too many requests, please try again later",
  },

  // External API Errors (5xx)
  EXTERNAL_API_ERROR: {
    code: "EXTERNAL_API_ERROR",
    status: 502,
    defaultMessage: "External API request failed",
  },
  EXTERNAL_API_TIMEOUT: {
    code: "EXTERNAL_API_TIMEOUT",
    status: 504,
    defaultMessage: "External API request timed out",
  },

  // Internal Server Errors (500)
  INTERNAL_SERVER_ERROR: {
    code: "INTERNAL_SERVER_ERROR",
    status: 500,
    defaultMessage: "Internal server error occurred",
  },
  DATABASE_ERROR: {
    code: "DATABASE_ERROR",
    status: 500,
    defaultMessage: "Database operation failed",
  },
  CACHE_ERROR: {
    code: "CACHE_ERROR",
    status: 500,
    defaultMessage: "Cache operation failed",
  },
});

/**
 * Helper functions for error code handling
 */
const ErrorCodeUtil = {
  /**
   * Gets the HTTP status code for a given error code
   *
   * @param {string} code - Error code to look up
   * @returns {number} HTTP status code
   */
  getStatus: (code) => ERROR_CODES[code]?.status || 500,

  /**
   * Gets the default message for a given error code
   *
   * @param {string} code - Error code to look up
   * @returns {string} Default error message
   */
  getMessage: (code) =>
    ERROR_CODES[code]?.defaultMessage || "An unexpected error occurred",
};

module.exports = {
  ERROR_CODES,
  ErrorCodeUtil,
};
