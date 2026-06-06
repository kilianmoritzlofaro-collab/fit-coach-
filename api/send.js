module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { email, programme, pdfBase64 } = req.body;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+process.env.RESEND_API_KEY
      },
      body: JSON.stringify({
        from: 'FitCoach <onboarding@resend.dev>',
        to: email,
        subject: 'Votre programme personnalise FitCoach',
        html: '<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px;"><h1 style="font-size:22px;font-weight:600;margin-bottom:8px;">Votre programme FitCoach</h1><p style="color:#6b7280;margin-bottom:16px;">Bonjour,<br><br>Votre programme personnalise est en piece jointe.<br><br>Bonne seance !</p><p style="font-size:11px;color:#9ca3af;margin-top:20px;">FitCoach - Donnees supprimees apres envoi</p></div>',
        attachments: [
          {
            filename: 'programme-fitcoach.pdf',
            content: pdfBase64
          }
        ]
      })
    });

    const result = await response.json();
    if(response.ok){
      return res.status(200).json({ ok: true });
    } else {
      return res.status(200).json({ ok: false, error: result.message });
    }

  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
};
