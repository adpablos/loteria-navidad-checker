const { validationResult } = require("express-validator");
const rules = require("./rules");
const { ValidationError } = require("../../../errors");
const LoggerUtil = require("../../../utils/logger.util");

/**
 * Validates request data using express-validator.
 * Throws ValidationError if validation fails.
 *
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 * @param {Express.NextFunction} next - Express next middleware function
 */
const validateRequest = (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const validationErrors = errors.array();

      LoggerUtil.warn(
        {
          requestId: req.requestId,
          path: req.path,
          method: req.method,
          errors: validationErrors,
        },
        "Request validation failed"
      );

      return next(
        new ValidationError("Invalid request parameters", {
          errors: validationErrors,
          path: req.path,
          method: req.method,
          requestId: req.requestId,
        })
      );
    }

    next();
  } catch (error) {
    LoggerUtil.error(
      {
        requestId: req.requestId,
        error: error.message,
      },
      "Validation processing error"
    );
    next(error);
  }
};

/**
 * Creates validation chain for drawId parameter
 * @returns {Array} Array of validation middleware
 */
const validateDrawId = () => [...rules.drawId, validateRequest];

// Export named functions directly
module.exports = {
  validateRequest,
  validateDrawId,
};
