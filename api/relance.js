import { db, dbOn, enc } from '../lib/db.js';
import { sendEmail } from '../lib/mail.js';
import { relanceEmail } from '../lib/emails.js';

// Relance à J+2 : un e-mail aux prospects qui ont accepté de recevoir des conseils et n'ont pas acheté.
// Appelé chaque jour par Vercel Cron (vercel.json), avec l'en-tête « Authorization: Bearer CRON_SECRET ».
// Rien ne part tant que RELANCE_ENABLED n'est pas à 1 (simple décompte des personnes concernées).
const wait = ms => new Promise(r => setTimeout(r, ms));

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: 'Non autorisé' });
  if (!dbOn()) return res.status(200).json({ ok: true, skipped: 'Supabase non configuré' });

  const day = 86400000, now = Date.now();
  const to = new Date(now - 2 * day).toISOString(), from = new Date(now - 14 * day).toISOString();
  const rows = await db(`boussole_leads?optin=eq.true&is_client=eq.false&relance_sent_at=is.null&unsubscribed_at=is.null&created_at=lte.${enc(to)}&created_at=gte.${enc(from)}&select=email,name,archetype,top_idea&order=created_at.asc&limit=40`);
  if (rows === null) return res.status(500).json({ error: 'Lecture impossible : le fichier supabase/migrations/20261108_relance.sql a-t-il été exécuté ?' });
  if (process.env.RELANCE_ENABLED !== '1') return res.status(200).json({ ok: true, envoi: 'désactivé (RELANCE_ENABLED)', personnes_concernees: rows.length });

  let sent = 0, failed = 0;
  for (const r of rows) {
    const m = relanceEmail({ name: r.name, email: r.email, archetype: r.archetype, topIdea: r.top_idea });
    const ok = await sendEmail({ email: r.email, name: r.name, subject: m.subject, html: m.html, text: m.text, headers: m.headers });
    if (ok) { sent++; await db(`boussole_leads?email=eq.${enc(r.email)}`, { method: 'PATCH', body: { relance_sent_at: new Date().toISOString() } }); } else failed++;
    await wait(600);
  }
  return res.status(200).json({ ok: true, envoyes: sent, echecs: failed });
}
export const config = { maxDuration: 60 };
