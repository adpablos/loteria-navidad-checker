const LoggerUtil = require("./logger.util");

/**
 * Utility class for lottery data processing and validation.
 */
class LotteryUtil {
  /**
   * Validates the format of a lottery draw ID.
   *
   * @param {string} drawId - The draw ID to validate
   * @returns {boolean} True if the draw ID is valid
   */
  static isValidDrawId(drawId) {
    return /^\d{10}$/.test(drawId);
  }

  /**
   * Converts a raw prize item into a normalized format with display values.
   *
   * @param {Object} item - The raw prize item
   * @param {number} item.prize - Prize amount in cents
   * @param {string} item.prizeType - Type of prize (R, 1, etc.)
   * @returns {Object} Normalized prize item with display values
   * @private
   */
  static _unifyItem(item) {
    let displayPrize = item.prize || 0;
    let isReintegro = false;

    if (item.prizeType === "R" && item.prize === 2000) {
      displayPrize = 20;
      isReintegro = true;
    } else if (item.prizeType === "1" && item.prize === 600) {
      displayPrize = 6;
      isReintegro = true;
    } else {
      displayPrize = Math.round(item.prize / 100);
    }

    return {
      ...item,
      displayPrize,
      isReintegro,
    };
  }

  /**
   * Processes a single prize array with error handling.
   *
   * @param {Object} rawData - Raw lottery data
   * @param {string} field - Field name containing prize array
   * @param {string} type - Default prize type if not specified
   * @param {string} requestId - Request identifier for logging
   * @returns {Array} Array of normalized prize items
   * @private
   */
  static _processPrizeArray(rawData, field, type, requestId) {
    try {
      if (!Array.isArray(rawData[field])) return [];
      return rawData[field].map((prize) =>
        this._unifyItem({
          ...prize,
          prizeType: prize.prizeType || type,
        })
      );
    } catch (e) {
      LoggerUtil.warn(
        { error: e, field, requestId },
        `Error processing ${field}`
      );
      return [];
    }
  }

  /**
   * Processes main prizes (primer y segundo premio).
   *
   * @param {Object} rawData - Raw lottery data
   * @param {string} requestId - Request identifier for logging
   * @returns {Array} Array of normalized main prizes
   * @private
   */
  static _processMainPrizes(rawData, requestId) {
    const mainPrizes = [];
    try {
      if (rawData.primerPremio?.decimo) {
        mainPrizes.push(
          this._unifyItem({
            ...rawData.primerPremio,
            prizeType: rawData.primerPremio.prizeType || "G",
          })
        );
      }
      if (rawData.segundoPremio?.decimo) {
        mainPrizes.push(
          this._unifyItem({
            ...rawData.segundoPremio,
            prizeType: rawData.segundoPremio.prizeType || "Z",
          })
        );
      }
    } catch (e) {
      LoggerUtil.warn({ error: e, requestId }, "Error processing main prizes");
    }
    return mainPrizes;
  }

  /**
   * Normalizes lottery results into a unified format.
   *
   * @param {Object} rawData - Raw lottery data from API
   * @param {string} requestId - Request identifier for logging
   * @returns {Object} Normalized lottery data with unified prize format
   */
  static normalizeResults(rawData, requestId) {
    try {
      if (!rawData) return rawData;

      LoggerUtil.debug(
        {
          requestId,
          availableFields: Object.keys(rawData),
          hasPrimerPremio: !!rawData.primerPremio,
          hasSegundoPremio: !!rawData.segundoPremio,
        },
        "Normalizing results"
      );

      const normalizedItems = [
        ...this._processMainPrizes(rawData, requestId),
        ...this._processPrizeArray(rawData, "tercerosPremios", "T", requestId),
        ...this._processPrizeArray(rawData, "cuartosPremios", "Q4", requestId),
        ...this._processPrizeArray(rawData, "quintosPremios", "Q5", requestId),
        ...this._processPrizeArray(rawData, "reintegros", "1", requestId),
        ...this._processPrizeArray(
          rawData,
          "extraccionesDeDosCifras",
          "2C",
          requestId
        ),
        ...this._processPrizeArray(
          rawData,
          "extraccionesDeTresCifras",
          "3C",
          requestId
        ),
        ...this._processPrizeArray(
          rawData,
          "extraccionesDeCuatroCifras",
          "4C",
          requestId
        ),
        ...this._processPrizeArray(
          rawData,
          "extraccionesDeCincoCifras",
          "5C",
          requestId
        ),
      ];

      LoggerUtil.debug(
        {
          requestId,
          normalizedItemsCount: normalizedItems.length,
          prizeTypes: [
            ...new Set(normalizedItems.map((item) => item.prizeType)),
          ],
        },
        "Results normalized"
      );

      return {
        ...rawData,
        normalizedItems,
      };
    } catch (error) {
      LoggerUtil.error(
        {
          error,
          requestId,
          rawDataStructure: rawData ? Object.keys(rawData) : null,
        },
        "Error normalizing results"
      );
      throw error;
    }
  }
}

module.exports = LotteryUtil;
