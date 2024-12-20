const pino = require("pino");
const Config = require("../config");

const logger = pino({
  level: Config.LOG.LEVEL,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});

module.exports = logger;
