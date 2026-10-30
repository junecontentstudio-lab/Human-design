import { checkToken } from '../lib/token.js';

// Envoie la carte Human Design (gratuite) ou le récap complet (payant) avec Brevo.
const BREVO = 'https://api.brevo.com/v3';
const headers = () => ({ 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' });
const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const { type, email, name, html, optin, token } = req.body || {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) return res.status(400).json({ error: 'Adresse invalide' });
  if (!['carte', 'recap'].includes(type)) return res.status(400).json({ error: 'Type invalide' });
  if (typeof html !== 'string' || html.length > 300000 || !html.includes('Ma Boussole Business')) return res.status(400).json({ error: 'Contenu invalide' });
  if (type === 'recap' && !checkToken(token)) return res.status(402).json({ error: 'Accès complet requis' });

  // 1. Ajoute ou met à jour le contact dans Brevo
  const listIds = [];
  if (type === 'carte' && optin && process.env.BREVO_LIST_PROSPECTS) listIds.push(Number(process.env.BREVO_LIST_PROSPECTS));
  if (type === 'recap' && process.env.BREVO_LIST_CLIENTS) listIds.push(Number(process.env.BREVO_LIST_CLIENTS));
  try {
    await fetch(`${BREVO}/contacts`, { method: 'POST', headers: headers(), body: JSON.stringify({ email, attributes: name ? { PRENOM: name } : {}, listIds, updateEnabled: true }) });
  } catch (e) { console.error('Brevo contact', e); }

  // 2. Envoie l'e-mail
  const hello = name ? `${esc(name)}, voici` : 'Voici';
  const subject = type === 'carte' ? 'Ta carte Human Design' : 'Ton récap business passion';
  const intro = type === 'carte'
    ? `<p style="font-family:Arial,sans-serif;font-size:15px;color:#3A2819">${hello} ta carte Human Design. Tu la retrouves aussi en pièce jointe, à ouvrir dans ton navigateur pour l'imprimer ou la garder en PDF.</p><p style="font-family:Arial,sans-serif;font-size:15px;color:#3A2819">Prochaine étape : <a href="${process.env.SITE_URL}/#bilan" style="color:#8A5A35">passe ton bilan</a> pour découvrir tes pistes de business.</p>`
    : `<p style="font-family:Arial,sans-serif;font-size:15px;color:#3A2819">${hello} ton récap complet : ta vision, ton offre et ta feuille de route. Il est aussi en pièce jointe, à ouvrir dans ton navigateur pour l'imprimer ou le garder en PDF.</p>`;
  const body = html.replace('<main class="doc">', `<main class="doc">${intro}`);
  try {
    const r = await fetch(`${BREVO}/smtp/email`, {
      method: 'POST', headers: headers(),
      body: JSON.stringify({
        sender: { name: process.env.BREVO_SENDER_NAME || 'Ma Boussole Business', email: process.env.BREVO_SENDER_EMAIL },
        to: [{ email, ...(name ? { name } : {}) }],
        subject, htmlContent: body,
        attachment: [{ name: type === 'carte' ? 'carte-human-design.html' : 'recap-business-passion.html', content: Buffer.from(html).toString('base64') }]
      })
    });
    if (!r.ok) { console.error('Brevo email', r.status, await r.text()); return res.status(502).json({ error: 'Envoi impossible' }); }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e); return res.status(502).json({ error: 'Envoi impossible' });
  }
}
