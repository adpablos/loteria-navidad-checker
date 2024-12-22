const pino = require("pino");

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});

// In-memory cache
const cache = {};
const DEFAULT_CACHE_TTL = process.env.CACHE_TTL || 1800; // 30 minutes (1800 seconds)

// Function to get data from cache or API
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
      data: cachedItem.data,
      remainingTTL,
    };
  }

  // No cached data, fetch from API
  const data = await fetchDataFromApi(drawId, requestId);

  // Decide TTL
  let ttl = DEFAULT_CACHE_TTL; // 30 min
  // If the raffle is in progress, set a lower TTL
  if (key === "results" && data.estadoCelebracionLNAC === true) {
    ttl = 30;
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

// Function to clear the cache
function clearCache(requestId) {
  logger.info({ requestId }, "Clearing cache");
  for (const key in cache) {
    delete cache[key];
  }
}

module.exports = { getLotteryDataWithCache, clearCache };
