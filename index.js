const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/lottery', async (req, res) => {
  const drawId = req.query.drawId || '1259409102'; // 2024 Christmas Lottery ID as default
  const url = `https://www.loteriasyapuestas.es/servicios/premioDecimoWeb?idsorteo=${drawId}`;

  try {
    const response = await fetch(url);
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