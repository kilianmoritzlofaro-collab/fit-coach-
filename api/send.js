module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { email, programme } = req.body;

    let html = '<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px;">';
    html += '<h1 style="font-size:24px;font-weight:600;margin-bottom:4px;">Votre programme FitCoach</h1>';
    html += '<p style="color:#6b7280;margin-bottom:20px;">'+programme.duree_programme+' - '+programme.organisation+'</p>';
    html += '<div style="background:#f9fafb;border-left:3px solid #1a1a1a;padding:12px 16px;margin-bottom:20px;font-style:italic;color:#374151;">'+programme.motivation+'</div>';

    (programme.jours||[]).forEach(function(j){
      html += '<div style="margin-bottom:20px;">';
      html += '<div style="background:#1a1a1a;color:#fff;border-radius:99px;padding:3px 12px;font-size:12px;display:inline-block;margin-bottom:10px;">'+j.label+'</div>';
      (j.exercices||[]).forEach(function(ex){
        html += '<div style="padding:8px 0;border-bottom:1px solid #f3f4f6;">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;">';
        html += '<span style="font-weight:500;">'+ex.num+'. '+ex.nom+'</span>';
        html += '<span style="color:#6b7280;font-size:12px;">'+ex.series+'x'+ex.reps+' - '+ex.repos+'</span>';
        html += '</div>';
        if(ex.conseil){
          html += '<div style="font-size:12px;color:#6b7280;font-style:italic;margin-top:3px;">'+ex.conseil+'</div>';
        }
        html += '</div>';
      });
      html += '</div>';
    });

    html += '<p style="font-size:11px;color:#9ca3af;text-align:center;margin-top:20px;">FitCoach - Donnees supprimees apres envoi</p>';
    html += '</div>';

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
        html: html
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
