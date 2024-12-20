const pino = require("pino");
const Config = require("../config");

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
