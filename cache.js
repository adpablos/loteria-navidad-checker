const pino = require("pino");

/**
 * Logger instance for cache-related operations.
 */
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});

/**
 * In-memory cache storage.
 * @type {Object.<string, {data: *, timestamp: number, ttl: number}>}
 */
const cache = {};

/**
 * Default time-to-live for cached items in seconds.
 * @type {number}
 */
const DEFAULT_CACHE_TTL = process.env.CACHE_TTL || 1800; // 30 minutes

/**
 * Retrieves data from cache or fetches it from the API if not cached/expired.
 * Implements a flexible TTL system based on the data type and state.
 *
 * @param {string} drawId - The lottery draw identifier
 * @param {Function} fetchDataFromApi - Async function to fetch data if cache miss
 * @param {string} requestId - Unique identifier for this request
 * @returns {Promise<{data: *, remainingTTL: number}>} Cached data and its remaining TTL
 */
async function getLotteryDataWithCache(drawId, fetchDataFromApi, requestId) {
  const cachedResponse = cache[drawId];
  if (
    cachedResponse &&
    Date.now() - cachedResponse.timestamp < cachedResponse.ttl * 1000
  ) {
    const remainingTTL = Math.round(
      (cachedResponse.ttl * 1000 - (Date.now() - cachedResponse.timestamp)) /
        1000
    );
    logger.info(
      { requestId, drawId, cacheTTLRemaining: remainingTTL },
      `Returning cached response for drawId: ${drawId}`
    );
    return {
      data: cachedResponse.data,
      remainingTTL,
    };
  }

  // No cached data, fetch from API
  const data = await fetchDataFromApi(drawId, requestId);

  // Decide TTL based on data type and state
  let ttl = DEFAULT_CACHE_TTL;
  if (key === "results" && data.estadoCelebracionLNAC === true) {
    ttl = 30; // Short TTL during active draw
  }

  // Save data to cache
  cache[drawId] = {
    data,
    timestamp: Date.now(),
    ttl: ttl,
  };
  logger.info({ requestId, drawId, ttl }, "Stored new data in cache");

  return {
    data: data,
    remainingTTL: ttl,
  };
}

/**
 * Clears all entries from the cache.
 *
 * @param {string} requestId - Unique identifier for this request
 */
function clearCache(requestId) {
  logger.info({ requestId }, "Clearing cache");
  for (const key in cache) {
    delete cache[key];
  }
}

module.exports = { getLotteryDataWithCache, clearCache };
