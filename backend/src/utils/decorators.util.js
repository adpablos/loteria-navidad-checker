const LoggerUtil = require("./logger.util");

/**
 * Higher-order function to add standardized logging and response handling to controller methods
 * @param {Function} method - The controller method to wrap
 * @param {string} operationName - Name of the operation being performed
 * @returns {Function} Wrapped method with automatic logging and response handling
 */
const withControllerLogging =
  (method, operationName) => async (req, res, next) => {
    const { requestId } = req;
    const params = {
      ...req.params,
      ...req.query,
    };

    LoggerUtil.debug(
      { requestId, operation: operationName, params },
      `Starting ${operationName}`
    );

    try {
      const result = await method(req, res);

      // If the result has remainingTTL, add it as a header
      if (result?.remainingTTL !== undefined) {
        res.setHeader("X-Cache-TTL", result.remainingTTL);
        res.json(result.data);
      } else {
        // If the result does not have TTL, send the result directly
        res.json(result);
      }

      LoggerUtil.info(
        { requestId, operation: operationName },
        `${operationName} completed successfully`
      );
    } catch (error) {
      LoggerUtil.error(
        { requestId, operation: operationName, error },
        `${operationName} failed`
      );
      next(error);
    }
  };

module.exports = {
  withControllerLogging,
};
