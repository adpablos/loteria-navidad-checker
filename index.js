const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/lottery', async (req, res) => {
  const drawId = req.query.drawId || '1259409102'; // 2024 Christmas Lottery ID as default
  const url = `https://www.loteriasyapuestas.es/servicios/premioDecimoWeb?idsorteo=${drawId}`;

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

    // Check for HTTP error status
    if (!response.ok) {
      const text = await response.text(); // Try to get the text response in case of error
      console.error(`HTTP error! status: ${response.status}, text: ${text}`);
      return res.status(response.status).json({ error: `HTTP error! status: ${response.status}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving lottery data' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});