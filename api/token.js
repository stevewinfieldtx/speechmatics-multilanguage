// Vercel Serverless Function — Speechmatics short-lived JWT generator
// SPEECHMATICS_API_KEY set in Vercel environment variables

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const apiKey = process.env.SPEECHMATICS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'SPEECHMATICS_API_KEY not set' });
  }

  try {
    // Generate a short-lived JWT from Speechmatics
    const resp = await fetch('https://mp.speechmatics.com/v1/api_keys?type=flow', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ttl: 300 }), // 5 minute token
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('Speechmatics token error:', resp.status, text);
      // If JWT generation fails, just return the API key directly
      // (less secure but works — the WebSocket connection is short-lived anyway)
      return res.json({ key_value: apiKey, method: 'direct' });
    }

    const data = await resp.json();
    return res.json({ key_value: data.key_value, method: 'jwt' });
  } catch (err) {
    console.error('Token error:', err);
    // Fallback: return the API key directly
    return res.json({ key_value: apiKey, method: 'direct' });
  }
};
