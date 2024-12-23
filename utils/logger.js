const pino = require("pino");
const Config = require("../config");

/**
 * Configures and creates a Pino logger instance with custom formatting.
 * Uses pino-pretty for development-friendly log output.
 *
 * @constant {Object} logger
 * @property {string} level - Log level from Config.LOG.LEVEL
 * @property {Object} transport - Pretty-printing configuration
 * @property {Object} formatters - Custom formatters for log entries
 */
const logger = pino({
  level: Config.LOG.LEVEL,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: false,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});

module.exports = logger;
