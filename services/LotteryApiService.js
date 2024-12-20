const fetch = require("node-fetch");
const Config = require("../config");
const logger = require("../utils/logger");

class LotteryApiService {
  constructor() {
    this.config = Config.API;
  }

  async getTicketInfo(drawId, requestId) {
    return this._makeApiCall(
      `${this.config.ENDPOINTS.CHECK_TICKET}?idsorteo=${drawId}`,
      requestId,
      "ticket info"
    );
  }

  async getDrawResults(drawId, requestId) {
    return this._makeApiCall(
      `${this.config.ENDPOINTS.DRAW_RESULTS}?idsorteo=${drawId}`,
      requestId,
      "draw results"
    );
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
        throw this._createApiError(response.status, responseText);
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
      this._handleApiError(error, requestId, operationType);
      throw error;
    }
  }

  _createApiError(status, text) {
    const error = new Error(`HTTP error! status: ${status}`);
    error.status = status;
    error.responseText = text.substring(0, 200);
    return error;
  }

  _logApiResponse(requestId, response, responseText) {
    logger.debug(
      {
        requestId,
        responseHeaders: JSON.stringify(response.headers),
        responseBodyTruncated: responseText.substring(0, 200),
      },
      "API Response received"
    );
  }

  _handleApiError(error, requestId, operationType) {
    logger.error({
      requestId,
      message: `Error retrieving ${operationType}`,
      error: {
        message: error.message,
        stack: error.stack,
        status: error.status,
        responseText: error.responseText,
      },
    });
  }
}

module.exports = new LotteryApiService();
