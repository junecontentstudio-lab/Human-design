import { checkToken } from '../lib/token.js';
import { db, enc } from '../lib/db.js';
import { esc, site, isEmail, upsertContact, sendEmail, para, button } from '../lib/mail.js';

// Envoie le profil gratuit (type « carte », enregistre le prospect dans Supabase) ou le récap complet (type « recap », payant).
const short = (v, n = 200) => (typeof v === 'string' ? v.slice(0, n) : null);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const { type, name, html, optin, token, lead = {} } = req.body || {};
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!isEmail(email)) return res.status(400).json({ error: 'Adresse invalide' });
  if (!['carte', 'recap'].includes(type)) return res.status(400).json({ error: 'Type invalide' });
  if (typeof html !== 'string' || html.length > 300000 || !html.includes('Ma Boussole Business')) return res.status(400).json({ error: 'Contenu invalide' });
  if (type === 'recap' && !checkToken(token)) return res.status(402).json({ error: 'Accès complet requis' });

  // 1. Enregistre le prospect (et freine les envois répétés vers une même adresse)
  if (type === 'carte') {
    const prev = (await db(`boussole_leads?email=eq.${enc(email)}&select=emails_sent,last_email_at,optin`))?.[0];
    if (prev?.last_email_at && Date.now() - Date.parse(prev.last_email_at) < 60 * 1000) return res.status(429).json({ error: 'Patiente une minute avant un nouvel envoi' });
    if (prev && prev.emails_sent >= 10) return res.status(429).json({ error: 'Trop d\'envois pour cette adresse' });
    const now = new Date().toISOString();
    await db('boussole_leads?on_conflict=email', {
      method: 'POST', prefer: 'resolution=merge-duplicates',
      body: {
        email, name: short(name, 80), optin: !!optin || !!prev?.optin,
        hd_type: short(lead.hd_type, 40), hd_authority: short(lead.hd_authority, 40), hd_profile: short(lead.hd_profile, 10),
        archetype: short(lead.archetype, 80), top_idea: short(lead.top_idea, 120),
        quiz: lead.quiz && typeof lead.quiz === 'object' ? lead.quiz : null,
        utm: lead.utm && typeof lead.utm === 'object' ? lead.utm : null,
        emails_sent: (prev?.emails_sent || 0) + 1, last_email_at: now, updated_at: now
      }
    });
  }

  // 2. Ajoute ou met à jour le contact dans Brevo
  const listIds = [];
  if (type === 'carte' && optin && process.env.BREVO_LIST_PROSPECTS) listIds.push(Number(process.env.BREVO_LIST_PROSPECTS));
  if (type === 'recap' && process.env.BREVO_LIST_CLIENTS) listIds.push(Number(process.env.BREVO_LIST_CLIENTS));
  await upsertContact(email, name, listIds);

  // 3. Envoie l'e-mail
  const hello = name ? `${esc(name)}, voici` : 'Voici';
  const subject = type === 'carte' ? 'Ton profil d\'entrepreneur·e Human Design' : 'Ton récap business passion';
  const intro = type === 'carte'
    ? para(`${hello} ton profil d'entrepreneur·e : ton archétype, ta charte Human Design et tes 3 pistes de business. Tu le retrouves aussi en pièce jointe, à ouvrir dans ton navigateur pour l'imprimer ou le garder en PDF.`) +
      para('Envie d\'aller plus loin ? La version complète ajoute des idées sur mesure par IA, un bilan approfondi, un comité de 6 experts, ton offre et ton plan d\'action sur 30 jours.') +
      button(`${site()}/#offre`, 'Découvrir la version complète')
    : para(`${hello} ton récap complet : ta vision, ton offre et ta feuille de route. Il est aussi en pièce jointe, à ouvrir dans ton navigateur pour l'imprimer ou le garder en PDF.`);
  const ok = await sendEmail({
    email, name, subject,
    html: html.replace('<main class="doc">', `<main class="doc">${intro}`),
    attachment: { name: type === 'carte' ? 'profil-boussole-business.html' : 'recap-business-passion.html', content: Buffer.from(html).toString('base64') }
  });
  return ok ? res.status(200).json({ ok: true }) : res.status(502).json({ error: 'Envoi impossible' });
}
