const LoggerUtil = require("./logger.util");
const { ERROR_CODES } = require("../constants/error-codes.constant");

/**
 * Process error handling utility class.
 * Manages uncaught exceptions and unhandled rejections.
 */
class ProcessErrorUtil {
  /**
   * Initializes all process error handlers
   */
  static initialize() {
    process.on("uncaughtException", this._handleUncaughtException);
    process.on("unhandledRejection", this._handleUnhandledRejection);
    process.on("SIGTERM", this._handleGracefulShutdown);
    process.on("SIGINT", this._handleGracefulShutdown);

    LoggerUtil.info("Process error handlers initialized");
  }

  /**
   * Handles uncaught exceptions in the process
   *
   * @param {Error} error - The uncaught error
   * @private
   */
  static _handleUncaughtException(error) {
    LoggerUtil.fatal(
      {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: ERROR_CODES.INTERNAL_SERVER_ERROR.code,
        },
        timestamp: new Date().toISOString(),
      },
      "Uncaught Exception detected"
    );

    // Give time for logging before exiting
    ProcessErrorUtil._exitGracefully(1);
  }

  /**
   * Handles unhandled promise rejections
   *
   * @param {Error} reason - The rejection reason
   * @param {Promise} promise - The rejected promise
   * @private
   */
  static _handleUnhandledRejection(reason, promise) {
    LoggerUtil.error(
      {
        error: {
          name: reason.name,
          message: reason.message,
          stack: reason.stack,
          code: ERROR_CODES.INTERNAL_SERVER_ERROR.code,
        },
        timestamp: new Date().toISOString(),
        promise,
      },
      "Unhandled Promise Rejection detected"
    );
  }

  /**
   * Handles graceful shutdown on SIGTERM/SIGINT
   *
   * @param {string} signal - The signal received (SIGTERM/SIGINT)
   * @private
   */
  static _handleGracefulShutdown(signal) {
    LoggerUtil.info(`${signal} received. Starting graceful shutdown...`);

    // Add any cleanup logic here (close database connections, etc.)

    ProcessErrorUtil._exitGracefully(0);
  }

  /**
   * Exits the process gracefully after ensuring logs are written
   *
   * @param {number} code - Exit code
   * @private
   */
  static _exitGracefully(code) {
    setTimeout(() => {
      LoggerUtil.info(`Process exiting with code ${code}`);
      process.exit(code);
    }, 1000);
  }
}

module.exports = ProcessErrorUtil;
