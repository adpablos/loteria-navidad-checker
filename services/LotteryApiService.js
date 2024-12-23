const fetch = require("node-fetch");
const Config = require("../config");
const logger = require("../utils/logger");
const {
  normalizeResults,
  createApiError,
  logApiResponse,
  handleApiError,
} = require("../utils/lotteryUtils");

/**
 * Service class for interacting with the lottery API endpoints.
 * Handles all API communication and data normalization.
 */
class LotteryApiService {
  /**
   * Initializes the service with API configuration from Config.
   */
  constructor() {
    this.config = Config.API;
  }

  /**
   * Retrieves the current celebration state of the lottery.
   * Used to determine if the draw is in progress.
   *
   * @param {string} requestId - Unique identifier for this request.
   * @returns {Promise<Object>} - The celebration state data.
   */
  async getCelebrationState(requestId) {
    const endpoint = this.config.ENDPOINTS.CELEBRATION_STATE;
    return this._makeApiCall(endpoint, requestId, "celebration state");
  }

  /**
   * Fetches the LNAC (Lotería Nacional de Navidad) configuration.
   * Contains settings and parameters for the current draw.
   *
   * @param {string} requestId - Unique identifier for this request.
   * @returns {Promise<Object>} - The LNAC configuration data.
   */
  async getConfiguracionLNAC(requestId) {
    const endpoint = this.config.ENDPOINTS.CONFIGURACION_LNAC;
    return this._makeApiCall(endpoint, requestId, "LNAC config");
  }

  /**
   * Gets real-time results during the lottery draw.
   * Returns normalized data with unified prize structure.
   *
   * @param {string} requestId - Unique identifier for this request.
   * @returns {Promise<Object>} - Normalized lottery results.
   */
  async getRealtimeResults(requestId) {
    const endpoint = this.config.ENDPOINTS.REALTIME_RESULTS;
    const rawData = await this._makeApiCall(
      endpoint,
      requestId,
      "realtime results"
    );
    return normalizeResults(rawData);
  }

  /**
   * Retrieves information for a specific lottery ticket.
   * Used to check if a ticket has won any prizes.
   *
   * @param {string} drawId - The ID of the lottery draw.
   * @param {string} requestId - Unique identifier for this request.
   * @returns {Promise<Object>} - The ticket information and any prizes won.
   */
  async getTicketInfo(drawId, requestId) {
    return this._makeApiCall(
      `${this.config.ENDPOINTS.CHECK_TICKET}?idsorteo=${drawId}`,
      requestId,
      "ticket info"
    );
  }

  /**
   * Gets the complete results for a specific draw.
   * Returns normalized data with unified prize structure.
   *
   * @param {string} drawId - The ID of the lottery draw.
   * @param {string} requestId - Unique identifier for this request.
   * @returns {Promise<Object>} - Normalized draw results.
   */
  async getDrawResults(drawId, requestId) {
    const rawData = await this._makeApiCall(
      `${this.config.ENDPOINTS.DRAW_RESULTS}?idsorteo=${drawId}`,
      requestId,
      "draw results"
    );
    return normalizeResults(rawData);
  }

  /**
   * Makes an HTTP request to the lottery API with error handling and logging.
   * Internal method used by all public API methods.
   *
   * @param {string} endpoint - The API endpoint to call.
   * @param {string} requestId - Unique identifier for this request.
   * @param {string} operationType - Description of the operation for logging.
   * @returns {Promise<Object>} - The parsed JSON response from the API.
   * @throws {Error} - If the API request fails or returns an error status.
   * @private
   */
  async _makeApiCall(endpoint, requestId, operationType) {
    const url = `${this.config.BASE_URL}${endpoint}`;

    try {
      logger.info(
        {
          requestId,
          endpoint,
          url,
        },
        `Requesting ${operationType} from API`
      );

      const response = await fetch(url, { headers: this.config.HEADERS });
      const responseText = await response.text();

      if (!response.ok) {
        logger.error(
          {
            requestId,
            status: response.status,
            response: responseText.substring(0, 200),
          },
          `API error response`
        );
        throw createApiError(response.status, responseText);
      }

      logger.info(
        {
          requestId,
          status: response.status,
          responseLength: responseText.length,
        },
        `Successfully retrieved ${operationType}`
      );

      return JSON.parse(responseText);
    } catch (error) {
      handleApiError(logger, error, requestId, operationType);
      throw error;
    }
  }
}

module.exports = new LotteryApiService();
