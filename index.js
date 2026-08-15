import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const NVCF_API_KEY = process.env.NVCF_API_KEY; 
const NIM_BASE_URL = process.env.NIM_BASE_URL || 'https://integrate.api.nvidia.com/v1';

app.post('/v1/chat/completions', async (req, res) => {
  if (!NVCF_API_KEY) {
    return res.status(500).json({ error: 'NVIDIA API Key not configured on server.' });
  }

  try {
    const nimResponse = await fetch(`${NIM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVCF_API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });

    if (req.body.stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      nimResponse.body.pipe(res);
      return;
    }

    const data = await nimResponse.json();
    return res.status(nimResponse.status).json(data);

  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ error: 'Failed to connect to NVIDIA NIM endpoint.' });
  }
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`NVIDIA NIM Proxy listening on port ${PORT}`);
});
