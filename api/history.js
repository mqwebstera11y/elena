export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { KV_REST_API_URL, KV_REST_API_TOKEN } = process.env;

  // If KV is not configured, degrade gracefully
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    if (req.method === 'GET') return res.json({ messages: [] });
    return res.json({ ok: true });
  }

  const authHeaders = {
    Authorization: `Bearer ${KV_REST_API_TOKEN}`,
    'Content-Type': 'application/json',
  };

  if (req.method === 'GET') {
    const { characterId } = req.query;
    if (!characterId) return res.status(400).json({ error: 'characterId required' });

    const key = `char:${characterId}:messages`;
    const r = await fetch(`${KV_REST_API_URL}/get/${key}`, { headers: authHeaders });
    const { result } = await r.json();
    return res.json({ messages: result ?? [] });
  }

  if (req.method === 'POST') {
    const { characterId, messages } = req.body;
    if (!characterId) return res.status(400).json({ error: 'characterId required' });

    const key = `char:${characterId}:messages`;
    await fetch(`${KV_REST_API_URL}/set/${key}`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(messages),
    });
    return res.json({ ok: true });
  }

  res.status(405).end();
}
