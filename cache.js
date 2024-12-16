const pino = require('pino');

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
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
async function getLotteryDataWithCache(drawId, fetchDataFromApi) {
    const cachedResponse = cache[drawId];
    if (cachedResponse && (Date.now() - cachedResponse.timestamp < cachedResponse.ttl * 1000)) {
        logger.info(`Returning cached response for drawId: ${drawId}`);
        return cachedResponse.data;
    }

    logger.info(`Fetching data from API for drawId: ${drawId}`);
    const data = await fetchDataFromApi(drawId);

    // Save data to cache
    cache[drawId] = {
        data,
        timestamp: Date.now(),
        ttl: DEFAULT_CACHE_TTL,
    };

    return data;
}

// Function to clear the cache
function clearCache() {
    logger.info('Clearing cache');
    for (const key in cache) {
        delete cache[key];
    }
}

module.exports = { getLotteryDataWithCache, clearCache };