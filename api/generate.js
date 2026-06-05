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
     let jsonStr = match[0];
// Remplace apostrophes dans les valeurs string seulement
let fixed = '';
let inString = false;
let escaped = false;
for (let i = 0; i < jsonStr.length; i++) {
  const c = jsonStr[i];
  if (escaped) { fixed += c; escaped = false; continue; }
  if (c === '\\') { fixed += c; escaped = true; continue; }
  if (c === '"') { inString = !inString; fixed += c; continue; }
  if (c === "'" && inString) { fixed += '\u2019'; continue; }
  fixed += c;
}
jsonStr = fixed;
      try {
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
