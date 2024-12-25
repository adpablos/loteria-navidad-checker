const LoggerUtil = require("./logger.util");
const MetricsUtil = require("./metrics.util");

/**
 * Cache utility class for managing in-memory data storage.
 */
class CacheUtil {
  /**
   * In-memory cache storage.
   * @type {Object.<string, {data: *, timestamp: number, ttl: number}>}
   * @private
   */
  static _cache = {};

  /**
   * Default time-to-live for cached items in seconds.
   * @type {number}
   * @private
   */
  static _DEFAULT_TTL = process.env.CACHE_TTL || 1800; // 30 minutes

  /**
   * Retrieves data from cache or fetches it from the API if not cached/expired.
   * Implements a flexible TTL system based on the data type and state.
   *
   * @param {string} key - Cache key
   * @param {Function} fetchDataFn - Async function to fetch data if cache miss
   * @param {string} requestId - Unique identifier for this request
   * @returns {Promise<{data: *, remainingTTL: number}>} Cached data and its remaining TTL
   */
  static async getData(key, fetchDataFn, requestId) {
    const cachedResponse = this._cache[key];

    if (this._isValidCacheEntry(cachedResponse)) {
      MetricsUtil.trackCacheOperation(true); // Cache hit
      const remainingTTL = this._calculateRemainingTTL(cachedResponse);

      LoggerUtil.info(
        { requestId, key, cacheTTLRemaining: remainingTTL },
        `Returning cached response for key: ${key}`
      );

      return {
        data: cachedResponse.data,
        remainingTTL,
      };
    }

    MetricsUtil.trackCacheOperation(false); // Cache miss
    const data = await fetchDataFn();

    // Decide TTL based on data type and state
    const ttl = this._determineTTL(key, data);

    // Save data to cache
    this._cache[key] = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    LoggerUtil.info({ requestId, key, ttl }, "Stored new data in cache");

    return {
      data,
      remainingTTL: ttl,
    };
  }

  /**
   * Clears all entries from the cache.
   *
   * @param {string} requestId - Unique identifier for this request
   * @returns {boolean} True if cache was cleared, false if already empty
   */
  static clear(requestId) {
    const hadEntries = Object.keys(this._cache).length > 0;

    if (hadEntries) {
      LoggerUtil.info({ requestId }, "Clearing cache");
      this._cache = {};
    }

    return hadEntries;
  }

  /**
   * Checks if a cache entry is valid and not expired.
   *
   * @param {Object} cacheEntry - Cache entry to validate
   * @returns {boolean} True if entry is valid and not expired
   * @private
   */
  static _isValidCacheEntry(cacheEntry) {
    return (
      cacheEntry && Date.now() - cacheEntry.timestamp < cacheEntry.ttl * 1000
    );
  }

  /**
   * Calculates remaining TTL for a cache entry in seconds.
   *
   * @param {Object} cacheEntry - Cache entry to calculate TTL for
   * @returns {number} Remaining TTL in seconds
   * @private
   */
  static _calculateRemainingTTL(cacheEntry) {
    return Math.round(
      (cacheEntry.ttl * 1000 - (Date.now() - cacheEntry.timestamp)) / 1000
    );
  }

  /**
   * Determines appropriate TTL based on data type and state.
   *
   * @param {string} key - Cache key
   * @param {Object} data - Data to be cached
   * @returns {number} TTL in seconds
   * @private
   */
  static _determineTTL(key, data) {
    if (key === "results" && data.estadoCelebracionLNAC === true) {
      return 30; // Short TTL during active draw
    }
    if (key.startsWith("ticket-")) {
      return 300; // 5 minutes for ticket results
    }
    return this._DEFAULT_TTL;
  }
}

module.exports = CacheUtil;
