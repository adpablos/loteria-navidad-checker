/**
 * Configuration class providing static access to all application settings.
 * Supports environment variable overrides for flexible deployment.
 */
class Config {
  /**
   * API-related configuration including endpoints and request headers.
   *
   * @returns {Object} API configuration object
   * @property {string} BASE_URL - Base URL for the lottery API
   * @property {string} PROXY_URL - Railway proxy URL for API requests
   * @property {Object} ENDPOINTS - Map of API endpoint paths
   * @property {Object} HEADERS - HTTP headers for API requests
   */
  static get API() {
    return {
      BASE_URL: process.env.API_BASE_URL || "https://www.loteriasyapuestas.es",
      PROXY_URL:
        process.env.RAILWAY_PROXY_URL ||
        "loteria-navidad-checker-production.up.railway.app",
      ENDPOINTS: {
        CELEBRATION_STATE:
          "/f/loterias/estaticos/json/estadoCelebracionLNAC.json",
        CONFIGURACION_LNAC: "/f/loterias/estaticos/json/configuracionLNAC.json",
        REALTIME_RESULTS: "/servicios/resultados1",
        CHECK_TICKET: "/servicios/premioDecimoWeb",
        DRAW_RESULTS: "/servicios/resultados2",
      },
      HEADERS: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en,es-ES;q=0.9,es;q=0.8",
        referer:
          "https://www.loteriasyapuestas.es/es/resultados/loteria-nacional/comprobar",
        "sec-ch-ua":
          '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "x-requested-with": "XMLHttpRequest",
      },
    };
  }

  /**
   * Rate limiting configuration for API endpoints.
   *
   * @returns {Object} Rate limit settings
   * @property {number} WINDOW_MS - Time window for rate limiting in milliseconds
   * @property {number} MAX_REQUESTS - Maximum requests allowed per window
   */
  static get RATE_LIMIT() {
    return {
      WINDOW_MS: 60 * 1000, // 1 minute
      MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    };
  }

  /**
   * Logging configuration.
   *
   * @returns {Object} Logging settings
   * @property {string} LEVEL - Minimum log level to record
   */
  static get LOG() {
    return {
      LEVEL: process.env.LOG_LEVEL?.toLowerCase() || "info",
      PRETTY: process.env.LOG_PRETTY === "true",
    };
  }

  /**
   * Default application settings.
   *
   * @returns {Object} Default settings
   * @property {number} PORT - Server port number
   * @property {string} DRAW_ID - Default lottery draw ID
   */
  static get DEFAULT() {
    return {
      PORT: parseInt(process.env.PORT, 10) || 3000,
      DRAW_ID: process.env.DEFAULT_DRAW_ID || "1259409102",
    };
  }

  /**
   * Environment configuration.
   *
   * @returns {Object} Environment settings
   * @property {string} NODE_ENV - Current environment (development, production, test)
   * @property {boolean} IS_PRODUCTION - Whether the app is running in production
   * @property {boolean} IS_DEVELOPMENT - Whether the app is running in development
   * @property {boolean} IS_TEST - Whether the app is running in test
   */
  static get ENV() {
    const nodeEnv = process.env.NODE_ENV || "development";

    return {
      NODE_ENV: nodeEnv,
      IS_PRODUCTION: nodeEnv === "production",
      IS_DEVELOPMENT: nodeEnv === "development",
      IS_TEST: nodeEnv === "test",
    };
  }
}

module.exports = Config;
