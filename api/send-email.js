import crypto from 'node:crypto';
import { checkToken, checkFormToken } from '../lib/token.js';
import { db, enc } from '../lib/db.js';
import { isEmail, upsertContact, sendEmail } from '../lib/mail.js';
import { profileEmail, guideEmail } from '../lib/emails.js';
import { buildGuide } from '../lib/guide.js';

// Envoie le profil gratuit (type « carte », enregistre le prospect dans Supabase) ou le guide complet (type « recap », payant),
// avec le PDF en pièce jointe. Si le PDF ne peut pas être généré, l'e-mail part quand même, sans pièce jointe.
const short = (v, n = 200) => (typeof v === 'string' ? v.slice(0, n) : null);
// Le contenu du profil vient du navigateur : on en retire tout lien, pour qu'il ne puisse pas servir à du hameçonnage.
const LINK = /(?:https?:\/\/|www\.)\S+|\b[\w-]+(?:\.[\w-]+)*\.(?:com|net|org|io|fr|ru|xyz|top|info|biz|co|me|app|link|click|shop|site|online)\b\S*/gi;
const noLinks = v => typeof v === 'string' ? v.replace(LINK, '') : Array.isArray(v) ? v.map(noLinks) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, noLinks(x)])) : v;
// Empreinte de l'adresse IP (jamais l'adresse elle-même), pour limiter les envois par visiteur.
const ipHash = req => { const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim(); return ip ? crypto.createHmac('sha256', process.env.TOKEN_SECRET || 'ip').update('ip:' + ip).digest('base64url').slice(0, 22) : null; };
let hasIpCol; // la colonne ip_hash existe-t-elle ? (migration 20261108_relance.sql)
const ipCol = async () => hasIpCol ??= (await db('boussole_leads?select=ip_hash&limit=0')) !== null;
const recent = new Map(); // secours en mémoire tant que la colonne n'existe pas
const HOUR = 3600 * 1000;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const { type, optin, token, ft, lead = {} } = req.body || {};
  const name = noLinks(req.body?.name);
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!isEmail(email)) return res.status(400).json({ error: 'Adresse invalide' });
  if (!['carte', 'recap'].includes(type)) return res.status(400).json({ error: 'Type invalide' });
  const guide = req.body?.guide;
  const g0 = guide && typeof guide === 'object' && !Array.isArray(guide) && JSON.stringify(guide).length < 150000 ? guide : null;
  if (!g0) return res.status(400).json({ error: 'Contenu invalide' });
  const g = type === 'carte' ? noLinks(g0) : g0;
  if (type === 'recap' && !checkToken(token)) return res.status(402).json({ error: 'Accès complet requis' });

  let optinNow = !!optin;
  // 1. Enregistre le prospect (et freine les envois répétés vers une même adresse)
  if (type === 'carte') {
    // a. La page doit avoir été chargée (jeton délivré par /api/config), et pas à l'instant.
    const f = checkFormToken(ft);
    if (f !== 'ok') return res.status(f === 'stale' ? 409 : 429).json({ error: f === 'stale' ? 'Page ouverte depuis trop longtemps' : 'Envoi refusé', code: f });
    // b. Limites par visiteur (5 adresses différentes par heure) et pour tout le site (plafonds de sécurité).
    const since = new Date(Date.now() - HOUR).toISOString(), ih = ipHash(req), col = await ipCol();
    if (ih) {
      let n = 0;
      if (col) n = ((await db(`boussole_leads?ip_hash=eq.${enc(ih)}&last_email_at=gte.${enc(since)}&email=neq.${enc(email)}&select=email&limit=6`)) || []).length;
      else { const l = (recent.get(ih) || []).filter(([t, e]) => Date.now() - t < HOUR && e !== email); n = l.length; recent.set(ih, [...l, [Date.now(), email]]); if (recent.size > 5000) recent.clear(); }
      if (n >= 5) return res.status(429).json({ error: 'Trop d\'envois depuis cette connexion. Réessaie dans une heure.' });
    }
    const hourMax = Number(process.env.FREE_EMAILS_PER_HOUR || 150), dayMax = Number(process.env.FREE_EMAILS_PER_DAY || 800);
    const lastHour = ((await db(`boussole_leads?last_email_at=gte.${enc(since)}&select=email&limit=${hourMax + 1}`)) || []).length;
    const lastDay = lastHour > hourMax ? 0 : ((await db(`boussole_leads?last_email_at=gte.${enc(new Date(Date.now() - 24 * HOUR).toISOString())}&select=email&limit=${dayMax + 1}`)) || []).length;
    if (lastHour > hourMax || lastDay > dayMax) { console.error('Plafond d\'envois gratuits atteint', lastHour, lastDay); return res.status(429).json({ error: 'Beaucoup de demandes en ce moment. Réessaie un peu plus tard.' }); }
    const prev = (await db(`boussole_leads?email=eq.${enc(email)}&select=emails_sent,last_email_at,optin`))?.[0];
    if (prev?.last_email_at && Date.now() - Date.parse(prev.last_email_at) < 60 * 1000) return res.status(429).json({ error: 'Patiente une minute avant un nouvel envoi' });
    if (prev && prev.emails_sent >= 10) return res.status(429).json({ error: 'Trop d\'envois pour cette adresse' });
    const now = new Date().toISOString();
    optinNow = !!optin || !!prev?.optin;
    await db('boussole_leads?on_conflict=email', {
      method: 'POST', prefer: 'resolution=merge-duplicates',
      body: {
        email, name: short(name, 80), optin: optinNow,
        hd_type: short(lead.hd_type, 40), hd_authority: short(lead.hd_authority, 40), hd_profile: short(lead.hd_profile, 10),
        archetype: short(lead.archetype, 80), top_idea: short(lead.top_idea, 120),
        quiz: lead.quiz && typeof lead.quiz === 'object' ? lead.quiz : null,
        utm: lead.utm && typeof lead.utm === 'object' ? lead.utm : null,
        emails_sent: (prev?.emails_sent || 0) + 1, last_email_at: now, updated_at: now, ...(col && ih ? { ip_hash: ih } : {})
      }
    });
  }

  // 2. Ajoute ou met à jour le contact (Brevo, seulement s'il est configuré)
  const listIds = [];
  // (La liste « prospects » n'est alimentée qu'après confirmation de l'inscription : voir api/confirm.js.)
  if (type === 'recap' && process.env.BREVO_LIST_CLIENTS) listIds.push(Number(process.env.BREVO_LIST_CLIENTS));
  await upsertContact(email, name, listIds);

  // 3. PDF + e-mail
  const nm = typeof name === 'string' ? name.trim().slice(0, 60) : '';
  const file = type === 'carte' ? 'mon-profil-business-design' : 'mon-guide-business-design';
  let attachment;
  try { attachment = { name: `${file}.pdf`, content: (await buildGuide({ ...g, kind: type === 'recap' ? 'guide' : 'profil', name: nm })).toString('base64') }; }
  catch (e) { console.error('PDF', e); }
  const m = type === 'carte'
    ? profileEmail({ name: nm, archetype: g?.archetype, pistes: g?.pistes, attached: !!attachment, optin: !!optin, email })
    : guideEmail({ name: nm, offer: g?.offer, token });
  const ok = await sendEmail({ email, name: nm, subject: m.subject, html: m.html, text: m.text, attachment });
  return ok ? res.status(200).json({ ok: true }) : res.status(502).json({ error: 'Envoi impossible' });
}
// Le PDF est généré à la volée : on laisse quelques secondes à la fonction.
export const config = { maxDuration: 30 };
