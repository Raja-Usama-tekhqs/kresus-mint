// pages/api/mintNFT.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const response = await axios.post(
      process.env.NEXT_PUBLIC_BACKEND + 'mintNFT',
      req.body,
      {
        headers: {
          Authorization: req.headers.authorization,
          'Content-Type': 'application/json',
        },
        timeout: 180000,
      }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.response?.data || error.message);
    res
      .status(error.response?.status || 500)
      .json({ error: 'Proxy Error', details: error.response?.data || error.message });
  }
}
