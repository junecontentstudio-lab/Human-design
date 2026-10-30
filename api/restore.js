import { db, enc } from '../lib/db.js';
import { isEmail } from '../lib/brevo.js';
import { makeToken } from '../lib/token.js';
import { sendAccessEmail } from '../lib/payments.js';

// « Retrouver mon accès » : renvoie le lien d'accès à l'adresse utilisée lors de l'achat.
// Répond toujours la même chose, pour ne pas révéler qui est client.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!isEmail(email)) return res.status(400).json({ error: 'Adresse invalide' });
  const p = (await db(`boussole_purchases?email=eq.${enc(email)}&status=eq.PAID&select=checkout_id,access_sent_at&order=paid_at.desc&limit=1`))?.[0];
  if (p && (!p.access_sent_at || Date.now() - Date.parse(p.access_sent_at) > 2 * 60 * 1000)) {
    const lead = (await db(`boussole_leads?email=eq.${enc(email)}&select=name`))?.[0];
    await sendAccessEmail(email, lead?.name, makeToken(p.checkout_id));
    await db(`boussole_purchases?checkout_id=eq.${enc(p.checkout_id)}`, { method: 'PATCH', body: { access_sent_at: new Date().toISOString() } });
  }
  return res.status(200).json({ ok: true });
}
