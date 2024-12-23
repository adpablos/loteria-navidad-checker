/**
 * Converts the raw prize into a more readable display (in euros),
 * and sets isReintegro to true if it matches a known reintegro pattern.
 *
 * @param {Object} item - A prize object from the official JSON.
 * @returns {Object} - The same object plus { displayPrize, isReintegro }.
 */
function unifyItem(item) {
  let displayPrize = item.prize || 0;
  let isReintegro = false;

  // Known patterns for "reintegro" in different draws
  // 1) Christmas draw: item.prizeType === "R" and prize = 2000 -> 20€
  if (item.prizeType === "R" && item.prize === 2000) {
    displayPrize = 20;
    isReintegro = true;
  }
  // 2) Standard draws: item.prizeType === "1" and prize = 600 -> 6€
  else if (item.prizeType === "1" && item.prize === 600) {
    displayPrize = 6;
    isReintegro = true;
  }
  // Otherwise, convert from "cents" or base units to euros (if needed).
  // For example, a prize=1200 would be 12€, 3000 -> 30€, 15000 -> 150€, etc.
  // This approach assumes that prizes are consistently 100x actual euros
  // except for recognized "reintegros" above.
  else {
    displayPrize = Math.round(item.prize / 100);
  }

  return {
    ...item,
    displayPrize,
    isReintegro,
  };
}

/**
 * Unifies the raw structure of various fields into a single array "normalizedItems".
 * Each item will have a uniform shape: { decimo, prize, displayPrize, isReintegro, prizeType, ... }
 *
 * @param {Object} rawData - The original JSON returned by the official endpoint.
 * @returns {Object} - The original data plus a new property "normalizedItems" as an array.
 */
function normalizeResults(rawData) {
  if (!rawData) return rawData;

  // The final array that unifies all relevant prize entries
  let normalizedItems = [];

  // 1) "compruebe" is typically used in Christmas draws
  //    If present, each entry includes { decimo, prize, prizeType, ... }
  if (Array.isArray(rawData.compruebe)) {
    normalizedItems = normalizedItems.concat(rawData.compruebe.map(unifyItem));
  }

  // 2) "primerPremio", "segundoPremio", "tercerosPremios", etc. often appear in standard draws
  //    If any of these properties exist, convert them into the unified item format.
  if (rawData.primerPremio && rawData.primerPremio.decimo) {
    normalizedItems.push(
      unifyItem({
        ...rawData.primerPremio,
        // We can override or define a prizeType if needed
        prizeType: rawData.primerPremio.prizeType || "G",
      })
    );
  }

  if (rawData.segundoPremio && rawData.segundoPremio.decimo) {
    normalizedItems.push(
      unifyItem({
        ...rawData.segundoPremio,
        prizeType: rawData.segundoPremio.prizeType || "Z",
      })
    );
  }

  if (Array.isArray(rawData.tercerosPremios)) {
    normalizedItems = normalizedItems.concat(
      rawData.tercerosPremios.map((pr) =>
        unifyItem({
          ...pr,
          // If the official JSON doesn't specify a unique type, define your own
          prizeType: pr.prizeType || "T",
        })
      )
    );
  }

  if (Array.isArray(rawData.cuartosPremios)) {
    normalizedItems = normalizedItems.concat(
      rawData.cuartosPremios.map((pr) =>
        unifyItem({
          ...pr,
          prizeType: pr.prizeType || "Q4",
        })
      )
    );
  }

  if (Array.isArray(rawData.quintosPremios)) {
    normalizedItems = normalizedItems.concat(
      rawData.quintosPremios.map((pr) =>
        unifyItem({
          ...pr,
          prizeType: pr.prizeType || "Q5",
        })
      )
    );
  }

  // 3) "reintegros" might appear as a separate array in some standard draws.
  //    If so, unify them as well.
  if (Array.isArray(rawData.reintegros)) {
    normalizedItems = normalizedItems.concat(rawData.reintegros.map(unifyItem));
  }

  // 4) "extraccionesDeDosCifras", "extraccionesDeTresCifras", etc.
  //    If these arrays exist, unify them too. The official JSON usually includes
  //    a "decimo" field (e.g. "05", "086") and a "prize" (e.g. 1200 means 12€).
  if (Array.isArray(rawData.extraccionesDeDosCifras)) {
    normalizedItems = normalizedItems.concat(
      rawData.extraccionesDeDosCifras.map((ex) =>
        unifyItem({
          ...ex,
          prizeType: ex.prizeType || "2C",
        })
      )
    );
  }

  if (Array.isArray(rawData.extraccionesDeTresCifras)) {
    normalizedItems = normalizedItems.concat(
      rawData.extraccionesDeTresCifras.map((ex) =>
        unifyItem({
          ...ex,
          prizeType: ex.prizeType || "3C",
        })
      )
    );
  }

  if (Array.isArray(rawData.extraccionesDeCuatroCifras)) {
    normalizedItems = normalizedItems.concat(
      rawData.extraccionesDeCuatroCifras.map((ex) =>
        unifyItem({
          ...ex,
          prizeType: ex.prizeType || "4C",
        })
      )
    );
  }

  if (Array.isArray(rawData.extraccionesDeCincoCifras)) {
    normalizedItems = normalizedItems.concat(
      rawData.extraccionesDeCincoCifras.map((ex) =>
        unifyItem({
          ...ex,
          prizeType: ex.prizeType || "5C",
        })
      )
    );
  }

  // Return the original object plus "normalizedItems"
  return {
    ...rawData,
    normalizedItems,
  };
}

/**
 * Creates a standardized error object for API-related errors.
 * Includes the HTTP status and a truncated version of the response text.
 *
 * @param {number} status - The HTTP status code of the error.
 * @param {string} text - The full response text from the API.
 * @returns {Error} - An error object with additional properties { status, responseText }.
 */
function createApiError(status, text) {
  const error = new Error(`HTTP error! status: ${status}`);
  error.status = status;
  error.responseText = text.substring(0, 200);
  return error;
}

/**
 * Logs API response details using the provided logger instance.
 * Includes request ID, headers, and a truncated version of the response body.
 *
 * @param {Object} logger - The logger instance to use.
 * @param {string} requestId - The unique identifier for this request.
 * @param {Object} response - The raw response object from the API.
 * @param {string} responseText - The full response text.
 */
function logApiResponse(logger, requestId, response, responseText) {
  logger.debug(
    {
      requestId,
      responseHeaders: JSON.stringify(response.headers),
      responseBodyTruncated: responseText.substring(0, 200),
    },
    "API Response received"
  );
}

/**
 * Handles API errors in a standardized way across the application.
 * Logs error details including the operation type, stack trace, and response text.
 *
 * @param {Object} logger - The logger instance to use.
 * @param {Error} error - The error object caught during the API call.
 * @param {string} requestId - The unique identifier for this request.
 * @param {string} operationType - The type of operation that failed (e.g., "get results", "check ticket").
 */
function handleApiError(logger, error, requestId, operationType) {
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

module.exports = {
  unifyItem,
  normalizeResults,
  createApiError,
  logApiResponse,
  handleApiError,
};
