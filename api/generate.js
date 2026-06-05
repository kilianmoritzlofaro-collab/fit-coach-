module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    const text = data?.content?.[0]?.text || '';
    const match = text.match(/\{[\s\S]*\}/);
    
    if (match) {
      try {
        const programme = JSON.parse(match[0]);
        return res.status(200).json({ ok: true, programme });
      } catch(e) {
        // Nettoyer et réessayer
        const clean = match[0]
          .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
          .replace(/"([^"\\]*(\\.[^"\\]*)*)"|(')/g, (m, g1, g2, apos) => {
            return apos ? '\u2019' : m;
          });
        try {
          const programme = JSON.parse(clean);
          return res.status(200).json({ ok: true, programme });
        } catch(e2) {
          return res.status(200).json({ ok: false, raw: text, parseError: e2.message });
        }
      }
    }
    return res.status(200).json({ ok: false, raw: text });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
