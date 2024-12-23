const express = require("express");
const Config = require("./config");
const LoggerUtil = require("./utils/logger.util");
const ProcessErrorUtil = require("./utils/process-error.util");
const { requestMiddleware } = require("./api/middleware/application/request");
const rateLimiter = require("./api/middleware/application/rate-limit");
const { errorHandler } = require("./api/middleware/error/error");
const routes = require("./api/routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

/**
 * Creates and configures an Express application
 * @returns {express.Application} Configured Express app
 */
const createApp = () => {
  const app = express();

  // Initialize process error handlers
  ProcessErrorUtil.initialize();
  LoggerUtil.info("Initializing Express application...");

  // Configure middleware
  app.use(requestMiddleware);
  app.use(rateLimiter);
  app.use(express.json());

  // Configure routes
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/api", routes);

  // Configure error handling
  app.use(errorHandler);

  LoggerUtil.info("Express application initialized successfully");
  return app;
};

/**
 * Starts the Express server
 * @param {express.Application} app - Express application
 * @returns {Promise<http.Server>} Running server instance
 */
const startServer = async (app) => {
  const port = Config.DEFAULT.PORT;

  try {
    const server = await new Promise((resolve) => {
      const serverInstance = app.listen(port, () => {
        LoggerUtil.info(`Server is running on port ${port}`);
        resolve(serverInstance);
      });
    });
    return server;
  } catch (error) {
    LoggerUtil.error({ error }, "Failed to start server");
    throw error;
  }
};

/**
 * Stops the Express server
 * @param {http.Server} server - Server instance to stop
 * @returns {Promise<void>}
 */
const stopServer = async (server) => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) {
          LoggerUtil.error({ error: err }, "Error while stopping server");
          reject(err);
          return;
        }
        LoggerUtil.info("Server stopped successfully");
        resolve();
      });
    });
  }
};

module.exports = {
  createApp,
  startServer,
  stopServer,
};
