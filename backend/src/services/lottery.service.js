const fetch = require("node-fetch");
const Config = require("../config");
const LoggerUtil = require("../utils/logger.util");
const { ExternalApiError, ValidationError } = require("../errors");
const LotteryUtil = require("../utils/lottery.util");
const CacheUtil = require("../utils/cache.util");

/**
 * Service class for interacting with the lottery API endpoints.
 * Handles all API communication and data normalization.
 */
class LotteryApiService {
  /**
   * Initializes the service with API configuration.
   */
  constructor() {
    this.config = Config.API;
  }

  /**
   * Retrieves the current celebration state of the lottery.
   *
   * @param {string} requestId - Unique identifier for this request
   * @returns {Promise<Object>} The celebration state data
   */
  async getCelebrationState(requestId) {
    return this._makeApiCall(
      this.config.ENDPOINTS.CELEBRATION_STATE,
      requestId,
      "celebration-state"
    );
  }

  /**
   * Fetches the LNAC configuration data.
   *
   * @param {string} requestId - Unique identifier for this request
   * @returns {Promise<Object>} The LNAC configuration
   */
  async getConfiguracionLNAC(requestId) {
    return this._makeApiCall(
      this.config.ENDPOINTS.CONFIGURACION_LNAC,
      requestId,
      "lnac-config"
    );
  }

  /**
   * Gets real-time results during the lottery draw.
   *
   * @param {string} requestId - Unique identifier for this request
   * @returns {Promise<{data: Object, remainingTTL: number}>} Normalized lottery results and cache TTL
   */
  async getRealtimeResults(requestId) {
    const { data, remainingTTL } = await CacheUtil.getData(
      "realtime-results",
      () =>
        this._makeApiCall(
          this.config.ENDPOINTS.REALTIME_RESULTS,
          requestId,
          "realtime-results"
        ),
      requestId
    );
    return {
      data: LotteryUtil.normalizeResults(data, requestId),
      remainingTTL,
    };
  }

  /**
   * Retrieves information for a specific lottery ticket.
   *
   * @param {string} drawId - The lottery draw identifier
   * @param {string} requestId - Unique identifier for this request
   * @returns {Promise<Object>} The ticket information
   */
  async getTicketInfo(drawId, requestId) {
    return this._makeApiCall(
      `${this.config.ENDPOINTS.CHECK_TICKET}?idsorteo=${drawId}`,
      requestId,
      "ticket-info"
    );
  }

  /**
   * Gets the complete results for a specific draw.
   *
   * @param {string} drawId - The lottery draw identifier
   * @param {string} requestId - Unique identifier for this request
   * @returns {Promise<{data: Object, remainingTTL: number}>} Draw results and cache TTL
   */
  async getDrawResults(drawId, requestId) {
    return CacheUtil.getData(
      `results-${drawId}`,
      () =>
        this._makeApiCall(
          `${this.config.ENDPOINTS.DRAW_RESULTS}?idsorteo=${drawId}`,
          requestId,
          "draw-results"
        ),
      requestId
    );
  }

  /**
   * Checks if a given decimo has a prize in the specified draw.
   *
   * @param {string} drawId - The lottery draw identifier (10 digits)
   * @param {string} ticketNumber - The ticket number (5 digits)
   * @param {string} requestId - Unique identifier for this request
   * @returns {Promise<Object>} An object describing the ticket result
   */
  async checkTicketNumber(drawId, ticketNumber, requestId) {
    // 1. Fetch the raw data from the official endpoint
    const rawData = await this.getTicketInfo(drawId, requestId);

    // Safety check
    if (!rawData || !Array.isArray(rawData.compruebe)) {
      return {
        data: {
          decimo: ticketNumber,
          isPremiado: false,
          prizeEuros: 0,
          prizeType: null,
          message: "Data not found or invalid format",
        },
      };
    }

    // 2. Search for the ticket number
    // Add leading zero to match the API format
    const paddedTicketNumber = ticketNumber.padStart(6, "0");

    LoggerUtil.debug(
      {
        requestId,
        originalNumber: ticketNumber,
        paddedNumber: paddedTicketNumber,
        availableNumbers: rawData.compruebe
          .map((item) => item.decimo)
          .slice(0, 5), // Log first 5 numbers for debugging
      },
      "Checking ticket number"
    );

    const found = rawData.compruebe.find(
      (item) => item.decimo === paddedTicketNumber
    );

    if (!found) {
      // Not found -> no prize
      return {
        data: {
          decimo: ticketNumber, // Return original format
          isPremiado: false,
          prizeEuros: 0,
          prizeType: null,
          message: "No prize",
        },
      };
    }

    // 3. Parse the prize (the official data uses a big integer like 40000000 => 400.000€)
    //    Typically, item.prize = X means "X / 100" in euros (p.ej. 40000000 => 400000.00).
    const euros = found.prize ? found.prize / 100 : 0;

    let message = "";
    switch ((found.prizeType || "").trim()) {
      case "G":
        message = "El Gordo!";
        break;
      case "Z":
        message = "Segundo Premio";
        break;
      case "H":
        message = "Premio Especial";
        break;
      case "R":
        message = "Reintegro";
        break;
      default:
        message = "Premio encontrado";
        break;
    }

    // 4. Return a simplified object
    return {
      data: {
        decimo: ticketNumber,
        isPremiado: true,
        prizeEuros: euros,
        prizeType: found.prizeType?.trim() || null,
        message,
      },
    };
  }

  /**
   * Makes an HTTP request to the lottery API with error handling and logging.
   *
   * @param {string} endpoint - The API endpoint to call
   * @param {string} requestId - Unique identifier for this request
   * @param {string} operation - Description of the operation for logging
   * @returns {Promise<Object>} The parsed JSON response
   * @throws {Error} If the API request fails or returns invalid data
   * @private
   */
  async _makeApiCall(endpoint, requestId, operation) {
    const url = `${this.config.BASE_URL}${endpoint}`;

    try {
      LoggerUtil.debug({ requestId, operation, url }, "Making API request");

      const response = await fetch(url, {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "accept-language": "es-ES,es;q=0.9,en;q=0.8",
          "user-agent": "Mozilla/5.0 (compatible; LotteriaNavidadAPI/1.0)",
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "none",
        },
      });

      const responseText = await response.text();

      // Debug log con detalles truncados
      LoggerUtil.debug(
        {
          requestId,
          operation,
          statusCode: response.status,
          responsePreview:
            responseText.length > 100
              ? `${responseText.substring(0, 100)}...`
              : responseText,
        },
        "API response received"
      );

      if (!response.ok) {
        throw new ExternalApiError(`External API error: ${responseText}`, {
          operation,
          endpoint,
          requestId,
          url,
          statusCode: response.status,
        });
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new ExternalApiError("Invalid JSON response from external API", {
          operation,
          endpoint,
          requestId,
          url,
          originalError: e.message,
        });
      }

      // Info log para operación exitosa
      LoggerUtil.info(
        {
          requestId,
          operation,
          status: response.status,
        },
        `API request completed successfully: ${operation}`
      );

      return data;
    } catch (error) {
      if (error instanceof ExternalApiError) {
        if (error.context.statusCode === 403) {
          LoggerUtil.warn(
            {
              requestId,
              operation,
              statusCode: 403,
            },
            "Access denied by external API"
          );
          error.statusCode = 502;
        }
        throw error;
      }
      throw new ExternalApiError(error.message, {
        operation,
        endpoint,
        requestId,
        url,
        originalError: error.message,
      });
    }
  }

  /**
   * Clears all cached data.
   *
   * @param {string} requestId - Unique identifier for this request
   * @returns {boolean} True if cache was cleared, false if already empty
   */
  clearCache(requestId) {
    return CacheUtil.clear(requestId);
  }
}

module.exports = LotteryApiService;
