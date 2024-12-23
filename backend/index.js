require("dotenv").config();
const { createApp, startServer, stopServer } = require("./src/app");
const LoggerUtil = require("./src/utils/logger.util");
const Config = require("./src/config");

let server;

/**
 * Initializes and starts the application
 * @returns {Promise<void>}
 */
const startApplication = async () => {
  try {
    // Verificar que las variables de entorno se han cargado correctamente
    LoggerUtil.info(
      {
        LOG_LEVEL: process.env.LOG_LEVEL,
        NODE_ENV: process.env.NODE_ENV,
        LOG_PRETTY: process.env.LOG_PRETTY,
      },
      "Environment variables loaded"
    );

    // Log initial configuration
    LoggerUtil.debug(
      {
        env: Config.ENV.NODE_ENV,
        port: Config.DEFAULT.PORT,
        logLevel: Config.LOG.LEVEL,
        nodeEnv: process.env.NODE_ENV,
      },
      "Starting application with configuration"
    );

    const app = createApp();
    server = await startServer(app);
    registerShutdownHandlers();

    LoggerUtil.info("Application started successfully");
  } catch (error) {
    LoggerUtil.error({ error }, "Failed to start application");
    process.exit(1);
  }
};

/**
 * Gracefully stops the application
 * @returns {Promise<void>}
 */
const stopApplication = async () => {
  try {
    LoggerUtil.info("Stopping application...");
    await stopServer(server);
    LoggerUtil.info("Application stopped successfully");
  } catch (error) {
    LoggerUtil.error({ error }, "Error while stopping application");
    process.exit(1);
  }
};

/**
 * Registers handlers for graceful shutdown
 */
const registerShutdownHandlers = () => {
  const handleShutdown = async (signal) => {
    LoggerUtil.info({ signal }, "Received shutdown signal");
    await stopApplication();
    process.exit(0);
  };

  process.on("SIGTERM", handleShutdown);
  process.on("SIGINT", handleShutdown);
};

// Start the application if this is the main module
if (require.main === module) {
  startApplication();
}

module.exports = {
  startApplication,
  stopApplication,
};
