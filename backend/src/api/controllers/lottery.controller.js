const LotteryService = require("../../services/lottery.service");
const { withControllerLogging } = require("../../utils/decorators.util");

/**
 * Controller handling lottery-related operations
 */
class LotteryController {
  /**
   * Creates an instance of LotteryController.
   * @param {LotteryService} lotteryService - Service for lottery operations
   */
  constructor(lotteryService = new LotteryService()) {
    this.lotteryService = lotteryService;
    this.getCelebrationState = withControllerLogging(
      this.getCelebrationState.bind(this),
      "Get celebration state"
    );
    this.getTicketInfo = withControllerLogging(
      this.getTicketInfo.bind(this),
      "Get ticket info"
    );
    this.getResults = withControllerLogging(
      this.getResults.bind(this),
      "Get draw results"
    );
    this.clearCache = withControllerLogging(
      this.clearCache.bind(this),
      "Clear cache"
    );
  }

  /**
   * Get current lottery celebration state.
   *
   * @param {express.Request} req - Express request object
   * @param {express.Response} res - Express response object
   * @returns {Promise<{data: Object, remainingTTL: number}>} Response data and cache TTL
   */
  async getCelebrationState(req, res) {
    return this.lotteryService.getCelebrationState(req.requestId);
  }

  /**
   * Get information for a specific lottery ticket.
   *
   * @param {express.Request} req - Express request object
   * @param {express.Response} res - Express response object
   * @returns {Promise<{data: Object, remainingTTL: number}>} Response data and cache TTL
   */
  async getTicketInfo(req, res) {
    const { drawId } = req.params;
    return this.lotteryService.getTicketInfo(drawId, req.requestId);
  }

  /**
   * Get complete results for a specific lottery draw.
   *
   * @param {express.Request} req - Express request object
   * @param {express.Response} res - Express response object
   * @returns {Promise<{data: Object, remainingTTL: number}>} Response data and cache TTL
   */
  async getResults(req, res) {
    const { drawId } = req.params;
    return this.lotteryService.getDrawResults(drawId, req.requestId);
  }

  /**
   * Clear the API cache.
   *
   * @param {express.Request} req - Express request object
   * @param {express.Response} res - Express response object
   * @returns {Promise<{message: string, cleared: boolean}>}
   */
  async clearCache(req, res) {
    const cleared = await this.lotteryService.clearCache(req.requestId);
    return {
      data: {
        message: "Cache cleared successfully",
        cleared,
      },
    };
  }
}

module.exports = LotteryController;
