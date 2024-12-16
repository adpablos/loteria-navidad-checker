const fetch = require('node-fetch');
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});

// Constants for the API
const API_BASE_URL = 'https://www.loteriasyapuestas.es/servicios/premioDecimoWeb';
const DEFAULT_HEADERS = {
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
};

// Function to fetch lottery data from the API
async function getLotteryDataFromApi(drawId, requestId) {
  const url = `${API_BASE_URL}?idsorteo=${drawId}`;
  logger.info({ requestId, drawId }, `Requesting data from API for drawId: ${drawId}`);

  try {
    const response = await fetch(url, { headers: DEFAULT_HEADERS });

    logger.debug({ requestId, drawId, responseHeaders: JSON.stringify(response.headers) }, `Response headers for drawId: ${drawId}`);

    if (!response.ok) {
      const text = await response.text();
      const truncatedText = text.substring(0, 200);
      logger.warn({ requestId, drawId, responseStatus: response.status, responseText: truncatedText }, `API returned an error for drawId: ${drawId}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error({
      requestId,
      drawId,
      message: 'Error retrieving lottery data',
      error: {
        message: error.message,
        stack: error.stack,
        type: error.type,
        code: error.code,
        response: error.response
          ? {
              status: error.response.status,
              headers: error.response.headers,
              body: error.response.text ? (await error.response.text()).substring(0, 200) + '...' : '',
            }
          : null,
      },
    }, `Error retrieving lottery data for drawId: ${drawId}`);

    if (error.type === 'invalid-json') {
      throw new Error('Invalid JSON response from API');
    }

    throw new Error('Error retrieving lottery data');
  }
}

module.exports = { getLotteryDataFromApi };