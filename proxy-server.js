const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
// Parse JSON bodies
app.use(express.json());
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

const TARGET_SERVER = 'http://180.232.188.157:8082';

// Proxy middleware
app.use('/api', async (req, res) => {
  try {
    const targetUrl = `${TARGET_SERVER}${req.originalUrl.replace('/api', '')}`;
    
    console.log('Proxying request:', req.method, targetUrl);
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);

    const config = {
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        ...req.headers,
        host: new URL(TARGET_SERVER).host,
        origin: TARGET_SERVER,
        referer: TARGET_SERVER,
      },
      timeout: 10000
    };

    // Remove the proxy-specific headers
    delete config.headers['content-length'];

    const response = await axios(config);
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    
    if (error.response) {
      // The server responded with an error status
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      res.status(500).json({ error: 'No response from server' });
    } else {
      // Something happened in setting up the request
      res.status(500).json({ error: error.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying requests to: ${TARGET_SERVER}`);
});