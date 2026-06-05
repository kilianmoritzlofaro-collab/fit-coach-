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
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    
    if (start !== -1 && end !== -1) {
      let jsonStr = text.substring(start, end + 1);
jsonStr = jsonStr.replace(/'/g, ' ').replace(/[\u2018\u2019]/g, ' ').replace(/[\u201C\u201D]/g, '"');      try {
        const programme = JSON.parse(jsonStr);
        return res.status(200).json({ ok: true, programme });
      } catch(e) {
        return res.status(200).json({ ok: false, raw: text, error: e.message });
      }
    }
    return res.status(200).json({ ok: false, raw: text });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
