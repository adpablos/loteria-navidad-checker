const {
  ERROR_CODES,
  ErrorCodeUtil,
} = require("../constants/error-codes.constant");

/**
 * Base API Error class that extends from Error
 * @extends Error
 */
class ApiError extends Error {
  /**
   * Creates an instance of ApiError
   *
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {string} code - Error code from ERROR_CODES
   * @param {Object} context - Additional error context
   */
  constructor(statusCode, message, code, context = {}) {
    super(message || ErrorCodeUtil.getMessage(code));
    this.statusCode = statusCode || ErrorCodeUtil.getStatus(code);
    this.code = code;
    this.context = context;
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Converts error to JSON format for response
   * @returns {Object} Formatted error object
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      statusCode: this.statusCode,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Validation error class (400 Bad Request)
 * @extends ApiError
 */
class ValidationError extends ApiError {
  /**
   * Creates a validation error instance
   *
   * @param {string} message - Error message
   * @param {Object} context - Additional error context
   */
  constructor(message, context = {}) {
    super(
      ERROR_CODES.VALIDATION_ERROR.status,
      message || ERROR_CODES.VALIDATION_ERROR.defaultMessage,
      ERROR_CODES.VALIDATION_ERROR.code,
      context
    );
  }
}

/**
 * Not found error class (404)
 * @extends ApiError
 */
class NotFoundError extends ApiError {
  /**
   * Creates a not found error instance
   *
   * @param {string} message - Error message
   * @param {Object} context - Additional error context
   */
  constructor(message, context = {}) {
    super(
      ERROR_CODES.RESOURCE_NOT_FOUND.status,
      message || ERROR_CODES.RESOURCE_NOT_FOUND.defaultMessage,
      ERROR_CODES.RESOURCE_NOT_FOUND.code,
      context
    );
  }
}

/**
 * External API error class (502)
 * @extends ApiError
 */
class ExternalApiError extends ApiError {
  /**
   * Creates an external API error instance
   *
   * @param {string} message - Error message
   * @param {Object} context - Additional error context
   */
  constructor(message, context = {}) {
    super(
      ERROR_CODES.EXTERNAL_API_ERROR.status,
      message || ERROR_CODES.EXTERNAL_API_ERROR.defaultMessage,
      ERROR_CODES.EXTERNAL_API_ERROR.code,
      context
    );
  }
}

/**
 * Unauthorized error class (401)
 * @extends ApiError
 */
class UnauthorizedError extends ApiError {
  /**
   * Creates an unauthorized error instance
   *
   * @param {string} message - Error message
   * @param {Object} context - Additional error context
   */
  constructor(message, context = {}) {
    super(
      ERROR_CODES.UNAUTHORIZED.status,
      message || ERROR_CODES.UNAUTHORIZED.defaultMessage,
      ERROR_CODES.UNAUTHORIZED.code,
      context
    );
  }
}

/**
 * Forbidden error class (403)
 * @extends ApiError
 */
class ForbiddenError extends ApiError {
  /**
   * Creates a forbidden error instance
   *
   * @param {string} message - Error message
   * @param {Object} context - Additional error context
   */
  constructor(message, context = {}) {
    super(
      ERROR_CODES.FORBIDDEN.status,
      message || ERROR_CODES.FORBIDDEN.defaultMessage,
      ERROR_CODES.FORBIDDEN.code,
      context
    );
  }
}

/**
 * Rate limit error class (429)
 * @extends ApiError
 */
class RateLimitError extends ApiError {
  /**
   * Creates a rate limit error instance
   *
   * @param {string} message - Error message
   * @param {Object} context - Additional error context
   */
  constructor(message, context = {}) {
    super(
      ERROR_CODES.RATE_LIMIT_EXCEEDED.status,
      message || ERROR_CODES.RATE_LIMIT_EXCEEDED.defaultMessage,
      ERROR_CODES.RATE_LIMIT_EXCEEDED.code,
      context
    );
  }
}

module.exports = {
  ApiError,
  ValidationError,
  NotFoundError,
  ExternalApiError,
  UnauthorizedError,
  ForbiddenError,
  RateLimitError,
};
