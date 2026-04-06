// Vercel Serverless Function — Speechmatics JWT Token
// SPEECHMATICS_API_KEY set in Vercel environment variables

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const apiKey = process.env.SPEECHMATICS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'SPEECHMATICS_API_KEY not configured' });
  }

  try {
    const r = await fetch('https://mp.speechmatics.com/v1/api_keys?type=rt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ ttl: 3600 }),
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error('Speechmatics token error:', r.status, errText);
      return res.status(r.status).json({ error: errText });
    }

    const data = await r.json();
    return res.json({ jwt: data.key_value });
  } catch (err) {
    console.error('Token fetch error:', err);
    return res.status(500).json({ error: err.message });
  }
};
