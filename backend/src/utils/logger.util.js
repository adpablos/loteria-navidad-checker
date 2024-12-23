const pino = require("pino");
const Config = require("../config");

/**
 * Logger utility class for standardized application logging.
 * Uses pino for high-performance logging with custom formatting.
 */
class LoggerUtil {
  /**
   * Pino logger instance
   * @type {import('pino').Logger}
   * @private
   */
  static _logger = pino({
    level: Config.LOG.LEVEL,
    transport: Config.LOG.PRETTY
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            levelFirst: true,
            translateTime: "yyyy-mm-dd HH:MM:ss",
            ignore: "pid,hostname",
            messageFormat: "{msg} - {context}",
          },
        }
      : undefined,
    formatters: {
      level: (label) => ({ level: label.toUpperCase() }),
      bindings: () => ({}),
    },
    base: undefined,
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
    mixin: () => ({
      env: Config.ENV.NODE_ENV,
      service: "lottery-api",
    }),
  });

  /**
   * Creates a child logger with additional context
   *
   * @param {Object} context - Additional context to be added to all logs
   * @returns {import('pino').Logger} Child logger instance
   */
  static child(context) {
    return this._logger.child(context);
  }

  /**
   * Formats the context and message for consistent logging
   *
   * @private
   * @param {Object} context - Log context object
   * @param {string} message - Log message
   * @returns {Object} Formatted log entry
   */
  static _formatLog(context, message) {
    const formattedContext =
      typeof context === "object" ? JSON.stringify(context) : context;

    return {
      msg: message,
      context: formattedContext || "",
    };
  }

  /**
   * Logs a debug level message
   *
   * @param {Object} context - Log context object
   * @param {string} message - Log message
   */
  static debug(context, message) {
    this._logger.debug(this._formatLog(context, message));
  }

  /**
   * Logs an info level message
   *
   * @param {Object} context - Log context object
   * @param {string} message - Log message
   */
  static info(context, message) {
    this._logger.info(this._formatLog(context, message));
  }

  /**
   * Logs a warning level message
   *
   * @param {Object} context - Log context object
   * @param {string} message - Log message
   */
  static warn(context, message) {
    this._logger.warn(this._formatLog(context, message));
  }

  /**
   * Logs an error level message
   *
   * @param {Object} context - Log context object
   * @param {string} message - Log message
   */
  static error(context, message) {
    this._logger.error(this._formatLog(context, message));
  }

  /**
   * Gets the underlying pino logger instance
   *
   * @returns {import('pino').Logger} Pino logger instance
   */
  static getInstance() {
    return this._logger;
  }
}

module.exports = LoggerUtil;
