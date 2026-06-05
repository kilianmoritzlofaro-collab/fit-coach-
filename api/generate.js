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
    const cleanText = text.replace(/\u0060{3}json/g,'').replace(/\u0060{3}/g,'').trim();
    const start = cleanText.indexOf('{');
    const end = cleanText.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      let jsonStr = cleanText.substring(start, end + 1);
      jsonStr = jsonStr.split("'").join(" ").split("\u2018").join(" ").split("\u2019").join(" ").split("\u201C").join('"').split("\u201D").join('"');
      try {
        const programme = JSON.parse(jsonStr);
if(programme.motivation && programme.motivation.match(/[a-z]/i) && !programme.motivation.match(/[àâéèêëîïôùûüç]/i)){
  programme.motivation = 'Excellent travail, continuez comme ca!';
}
(programme.jours||[]).forEach(j=>{
  (j.exercices||[]).forEach(ex=>{
    if(ex.conseil && !ex.conseil.match(/[àâéèêëîïôùûüç]/i)){
      ex.conseil = '';
    }
  });
});
return res.status(200).json({ ok: true, programme });
      } catch(e) {
        return res.status(200).json({ ok: false, raw: text, error: e.message, jsonStr: jsonStr.substring(0, 800) });
      }
    }
    return res.status(200).json({ ok: false, raw: text, debug: 'no braces found', cleanLen: cleanText.length, cleanStart: cleanText.indexOf('{') });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
