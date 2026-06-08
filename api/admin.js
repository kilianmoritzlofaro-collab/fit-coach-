const { createClient } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const kv = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });

  try {
    const { action } = req.body;

    if (action === 'register') {
      const { nom, id, email, password } = req.body;
      if (!nom || !id || !email || !password) {
        return res.status(200).json({ ok: false, error: 'Champs manquants' });
      }
      // Check if ID already exists
      const existing = await kv.get('salle:' + id);
      if (existing) {
        return res.status(200).json({ ok: false, error: 'Cet identifiant est deja utilise' });
      }
      const salle = {
        id, nom, email, password,
        couleur: '#1a1a1a',
        machines: [],
        stats_total: 0,
        stats_today: 0,
        createdAt: Date.now()
      };
      await kv.set('salle:' + id, salle);
      // Remove password before returning
      const { password: _, ...sallePublic } = salle;
      return res.status(200).json({ ok: true, salle: sallePublic });
    }

    if (action === 'login') {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(200).json({ ok: false, error: 'Champs manquants' });
      }
      // Search all salles for matching email
      const keys = await kv.keys('salle:*');
      for (const key of keys) {
        const salle = await kv.get(key);
        if (salle && salle.email === email && salle.password === password) {
          const { password: _, ...sallePublic } = salle;
          return res.status(200).json({ ok: true, salle: sallePublic });
        }
      }
      return res.status(200).json({ ok: false, error: 'Email ou mot de passe incorrect' });
    }

    if (action === 'save') {
      const { salle } = req.body;
      if (!salle || !salle.id) {
        return res.status(200).json({ ok: false, error: 'Donnees invalides' });
      }
      // Get existing to preserve password
      const existing = await kv.get('salle:' + salle.id);
      if (!existing) {
        return res.status(200).json({ ok: false, error: 'Salle non trouvee' });
      }
      const updated = { ...existing, ...salle, password: existing.password };
      await kv.set('salle:' + salle.id, updated);
      const { password: _, ...sallePublic } = updated;
      return res.status(200).json({ ok: true, salle: sallePublic });
    }

    return res.status(200).json({ ok: false, error: 'Action inconnue' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
