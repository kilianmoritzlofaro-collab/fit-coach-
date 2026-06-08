const { createClient } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const kv = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });

  try {
    if (req.method === 'GET') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID manquant' });
      const salle = await kv.get('salle:' + id);
      if (!salle) return res.status(404).json({ error: 'Salle non trouvée' });
      return res.status(200).json({ ok: true, salle });
    }

    if (req.method === 'POST') {
      const { id, nom, couleur, email, password, machines } = req.body;
      if (!id || !nom || !email || !password) {
        return res.status(400).json({ error: 'Champs manquants' });
      }
      const salle = { id, nom, couleur: couleur || '#1a1a1a', email, password, machines: machines || [], createdAt: Date.now() };
      await kv.set('salle:' + id, salle);
      return res.status(200).json({ ok: true, salle });
    }

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
