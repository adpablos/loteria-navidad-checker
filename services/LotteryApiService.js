const fetch = require("node-fetch");
const Config = require("../config");
const logger = require("../utils/logger");
const {
  normalizeResults,
  createApiError,
  logApiResponse,
  handleApiError,
} = require("../utils/lotteryUtils");

class LotteryApiService {
  constructor() {
    this.config = Config.API;
  }

  async getCelebrationState(requestId) {
    const endpoint = this.config.ENDPOINTS.CELEBRATION_STATE;
    return this._makeApiCall(endpoint, requestId, "celebration state");
  }

  async getConfiguracionLNAC(requestId) {
    const endpoint = this.config.ENDPOINTS.CONFIGURACION_LNAC;
    return this._makeApiCall(endpoint, requestId, "LNAC config");
  }

  async getRealtimeResults(requestId) {
    const endpoint = this.config.ENDPOINTS.REALTIME_RESULTS;
    const rawData = await this._makeApiCall(
      endpoint,
      requestId,
      "realtime results"
    );
    return normalizeResults(rawData);
  }

  async getTicketInfo(drawId, requestId) {
    return this._makeApiCall(
      `${this.config.ENDPOINTS.CHECK_TICKET}?idsorteo=${drawId}`,
      requestId,
      "ticket info"
    );
  }

  async getDrawResults(drawId, requestId) {
    const rawData = this._makeApiCall(
      `${this.config.ENDPOINTS.DRAW_RESULTS}?idsorteo=${drawId}`,
      requestId,
      "draw results"
    );
    return normalizeResults(rawData);
  }

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
