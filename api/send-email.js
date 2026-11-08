import { checkToken } from '../lib/token.js';
import { db, enc } from '../lib/db.js';
import { isEmail, upsertContact, sendEmail } from '../lib/mail.js';
import { profileEmail, guideEmail } from '../lib/emails.js';
import { buildGuide } from '../lib/guide.js';

// Envoie le profil gratuit (type « carte », enregistre le prospect dans Supabase) ou le guide complet (type « recap », payant),
// avec le PDF en pièce jointe. Si le PDF ne peut pas être généré, l'e-mail part quand même, sans pièce jointe.
const short = (v, n = 200) => (typeof v === 'string' ? v.slice(0, n) : null);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const { type, name, html, guide, optin, token, lead = {} } = req.body || {};
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!isEmail(email)) return res.status(400).json({ error: 'Adresse invalide' });
  if (!['carte', 'recap'].includes(type)) return res.status(400).json({ error: 'Type invalide' });
  const g = guide && typeof guide === 'object' && !Array.isArray(guide) && JSON.stringify(guide).length < 150000 ? guide : null;
  const legacy = !g && typeof html === 'string' && html.length < 300000 && html.includes('Ma Boussole Business'); // anciens onglets restés ouverts
  if (!g && !legacy) return res.status(400).json({ error: 'Contenu invalide' });
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

  // 2. Ajoute ou met à jour le contact (Brevo, seulement s'il est configuré)
  const listIds = [];
  if (type === 'carte' && optin && process.env.BREVO_LIST_PROSPECTS) listIds.push(Number(process.env.BREVO_LIST_PROSPECTS));
  if (type === 'recap' && process.env.BREVO_LIST_CLIENTS) listIds.push(Number(process.env.BREVO_LIST_CLIENTS));
  await upsertContact(email, name, listIds);

  // 3. PDF + e-mail
  const nm = typeof name === 'string' ? name.trim().slice(0, 60) : '';
  const file = type === 'carte' ? 'mon-profil-business-design' : 'mon-guide-business-design';
  let attachment;
  if (g) {
    try { attachment = { name: `${file}.pdf`, content: (await buildGuide({ ...g, kind: type === 'recap' ? 'guide' : 'profil', name: nm })).toString('base64') }; }
    catch (e) { console.error('PDF', e); }
  } else attachment = { name: `${file}.html`, content: Buffer.from(html).toString('base64') };
  const m = type === 'carte'
    ? profileEmail({ name: nm, archetype: g?.archetype, pistes: g?.pistes, attached: !!attachment })
    : guideEmail({ name: nm, offer: g?.offer, token });
  const ok = await sendEmail({ email, name: nm, subject: m.subject, html: m.html, text: m.text, attachment });
  return ok ? res.status(200).json({ ok: true }) : res.status(502).json({ error: 'Envoi impossible' });
}
// Le PDF est généré à la volée : on laisse quelques secondes à la fonction.
export const config = { maxDuration: 30 };
