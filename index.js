const express = require('express');
const fetch = require('node-fetch');
const pino = require('pino');
const rateLimit = require('express-rate-limit'); // Importamos express-rate-limit

const app = express();
const port = process.env.PORT || 3000;

// Configurar el logger (pino)
const logger = pino({
    level: process.env.LOG_LEVEL || 'info', // Nivel de log: info por defecto, configurable por variable de entorno
    formatters: {
        level: (label) => {
            return { level: label }; // Ajustar el formato del nivel de log
        },
    },
});

// Configurar el limitador de peticiones
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: process.env.RATE_LIMIT_MAX || 100, // Máximo de 100 peticiones por minuto por IP, configurable por variable de entorno
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

// Aplicar el limitador de peticiones a todas las rutas
app.use(limiter);

// Caché en memoria
const cache = {};
const DEFAULT_CACHE_TTL = process.env.CACHE_TTL || 1800; // 30 minutes (1800 seconds) - configurable por variable de entorno

app.use(express.json());

app.get('/api/lottery', async (req, res) => {
    const drawId = req.query.drawId || process.env.DEFAULT_DRAW_ID || '1259409102'; // 2024 Christmas Lottery ID as default, configurable por variable de entorno

    // Validación del drawId
    if (!/^\d{10}$/.test(drawId)) {
        logger.warn(`Invalid drawId: ${drawId}`);
        return res.status(400).json({ error: 'Invalid drawId. It must be a 10-digit number.' });
    }

    // Comprobar caché
    const cachedResponse = cache[drawId];
    if (cachedResponse && (Date.now() - cachedResponse.timestamp < cachedResponse.ttl * 1000)) {
        logger.debug(`Returning cached response for drawId: ${drawId}`);
        return res.json(cachedResponse.data);
    }

    const url = `https://www.loteriasyapuestas.es/servicios/premioDecimoWeb?idsorteo=${drawId}`;

    logger.debug(`Requesting data for drawId: ${drawId}`);

    try {
        const response = await fetch(url, {
            headers: {
                'accept': 'application/json, text/javascript, */*; q=0.01',
                'accept-language': 'en,es-ES;q=0.9,es;q=0.8',
                'referer': 'https://www.loteriasyapuestas.es/es/resultados/loteria-nacional/comprobar',
                'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'x-requested-with': 'XMLHttpRequest'
            }
        });

        logger.debug(`Response status: ${response.status}`);
        logger.debug(`Response headers: ${JSON.stringify(response.headers)}`);

        if (!response.ok) {
            const text = await response.text();
            const truncatedText = text.substring(0, 200);
            logger.error(`HTTP error! status: ${response.status}, text: ${truncatedText}...`);
            return res.status(response.status).json({ error: `HTTP error! status: ${response.status}` });
        }

        const data = await response.json();

        // Guardar en caché
        cache[drawId] = {
            data,
            timestamp: Date.now(),
            ttl: DEFAULT_CACHE_TTL
        };

        res.json(data);

    } catch (error) {
        logger.error({
            message: 'Error retrieving lottery data',
            error: {
                message: error.message,
                stack: error.stack,
                type: error.type,
                code: error.code,
                response: error.response ? {
                    status: error.response.status,
                    headers: error.response.headers,
                    body: error.response.text ? (await error.response.text()).substring(0, 200) + '...' : ''
                } : null
            }
        });
        
        if (error.type === 'invalid-json') {
            return res.status(502).json({ error: 'Invalid JSON response from API' }); // Bad Gateway
        }

        res.status(500).json({ error: 'Error retrieving lottery data' });
    }
});

app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
});