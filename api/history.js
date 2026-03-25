export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Accept credentials under either naming convention
  const url =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN;

  // Degrade gracefully when KV is not configured
  if (!url || !token) {
    if (req.method === 'GET') return res.json({ messages: [] });
    return res.json({ ok: true });
  }

  // Use Upstash pipeline endpoint — unambiguously stores/retrieves Redis strings
  async function kv(commands) {
    const r = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commands),
    });
    return r.json();
  }

  if (req.method === 'GET') {
    const { characterId } = req.query;
    if (!characterId) return res.status(400).json({ error: 'characterId required' });

    const [{ result }] = await kv([['GET', `char:${characterId}:messages`]]);
    let messages = [];
    if (result) {
      try { messages = JSON.parse(result); } catch { /* corrupted value — start fresh */ }
    }
    return res.json({ messages });
  }

  if (req.method === 'POST') {
    const { characterId, messages } = req.body;
    if (!characterId) return res.status(400).json({ error: 'characterId required' });

    await kv([['SET', `char:${characterId}:messages`, JSON.stringify(messages)]]);
    return res.json({ ok: true });
  }

  res.status(405).end();
}
