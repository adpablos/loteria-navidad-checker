const express = require('express');
const rateLimit = require('express-rate-limit');
const pino = require('pino');
const { getLotteryDataFromApi } = require('./lotteryApi');
const { getLotteryDataWithCache, clearCache } = require('./cache');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;

// Trust the X-Forwarded-For header from the first proxy
app.set('trust proxy', true);

// Configure the logger (pino)
const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    formatters: {
        level: (label) => {
            return { level: label };
        },
    },
});

// Configure the rate limiter
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: process.env.RATE_LIMIT_MAX || 100, // Max 100 requests per minute per IP
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req, res) => req.headers['x-real-ip'] || req.ip, // Use x-real-ip header or connection IP
});

// Apply the rate limiter to all requests
app.use(limiter);

// Middleware to add a unique request ID to each request
app.use((req, res, next) => {
    req.requestId = uuidv4();
    next();
});

// Middleware to parse JSON request bodies
app.use(express.json());

// Function to validate the drawId format
function isValidDrawId(drawId) {
    return /^\d{10}$/.test(drawId);
}

// Endpoint to get lottery data
app.get('/api/lottery', async (req, res) => {
    const requestId = req.requestId;
    const clientIp = req.headers['x-real-ip'] || req.ip;
    const drawId = req.query.drawId || process.env.DEFAULT_DRAW_ID || '1259409102';

    // Validate the drawId
    if (!isValidDrawId(drawId)) {
        logger.warn({ requestId, clientIp, drawId }, `Invalid drawId: ${drawId}`);
        return res.status(400).json({ error: 'Invalid drawId. It must be a 10-digit number.' });
    }

    logger.info({ requestId, clientIp, drawId }, `Received request for drawId: ${drawId}`);

    try {
        const data = await getLotteryDataWithCache(drawId, getLotteryDataFromApi, requestId);
        if (data) {
            res.json(data);
        }
    } catch (error) {
        logger.error({ requestId, clientIp, drawId, error: error.message, stack: error.stack }, `Error processing request for drawId: ${drawId}`);
        if (error.message === 'Invalid JSON response from API') {
            return res.status(502).json({ error: error.message });
        } else if (error.message.startsWith('HTTP error!')) {
            return res.status(parseInt(error.message.split(' ')[2])).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to clear the cache
app.get('/api/lottery/clearcache', async (req, res) => {
    const requestId = req.requestId;
    logger.info({ requestId }, `Clearing cache`);
    clearCache(requestId);
    res.json({ message: 'Cache cleared' });
});

// Start the server
app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
});