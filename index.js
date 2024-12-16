const express = require('express');
const fetch = require('node-fetch');
const pino = require('pino'); 

const app = express();
const port = process.env.PORT || 3000;

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label }; 
    },
  },
});

app.use(express.json());

app.get('/api/lottery', async (req, res) => {
  const drawId = req.query.drawId || '1259409102'; // 2024 Christmas Lottery ID as default
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
      logger.error(`HTTP error! status: ${response.status}, text: ${text.substring(0, 200)}...`); 
      return res.status(response.status).json({ error: `HTTP error! status: ${response.status}` });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    logger.error({
      message: 'Error retrieving lottery data',
      error: {
        message: error.message,
        stack: error.stack,
        response: error.response ? {
          status: error.response.status,
          headers: error.response.headers,
          body: error.response.text ? (await error.response.text()).substring(0, 200) + '...' : ''
        } : null
      }
    });

    res.status(500).json({ error: 'Error retrieving lottery data' });
  }
});

app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
