import { db, enc } from './db.js';
import { makeToken } from './token.js';
import { sendEmail, upsertContact, site } from './mail.js';
import { accessEmail, accessLink } from './emails.js';

export const price = () => Number(process.env.PRICE_EUR || 46);
export { accessLink };

// Interroge SumUp (seule source de vérité), enregistre le paiement et envoie le lien d'accès une seule fois.
export async function confirmCheckout(id) {
  const r = await fetch(`https://api.sumup.com/v0.1/checkouts/${enc(id)}`, { headers: { Authorization: `Bearer ${(process.env.SUMUP_API_KEY || '').trim()}` } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) return { found: false };
  const paid = d.status === 'PAID' && Number(d.amount) >= price() && d.merchant_code === (process.env.SUMUP_MERCHANT_CODE || '').trim();
  if (!paid) {
    if (d.status && d.status !== 'PENDING') await db(`boussole_purchases?checkout_id=eq.${enc(id)}&status=neq.PAID`, { method: 'PATCH', body: { status: d.status, updated_at: new Date().toISOString() } });
    return { found: true, paid: false, status: d.status };
  }
  const token = makeToken(id);
  const tx = (d.transactions || []).find(t => t.status === 'SUCCESSFUL') || {};
  // Ne passe à PAID qu'une fois : la ligne renvoyée indique que c'est la première confirmation.
  const now = new Date().toISOString();
  const rows = await db(`boussole_purchases?checkout_id=eq.${enc(id)}&status=neq.PAID`, {
    method: 'PATCH', prefer: 'return=representation',
    body: { status: 'PAID', paid_at: now, updated_at: now, transaction_id: tx.id || tx.transaction_code || null, amount: Number(d.amount) }
  });
  const row = rows?.[0];
  if (row?.email) {
    await db(`boussole_leads?email=eq.${enc(row.email)}`, { method: 'PATCH', body: { is_client: true, updated_at: now } });
    const lead = (await db(`boussole_leads?email=eq.${enc(row.email)}&select=name`))?.[0];
    if (process.env.BREVO_LIST_CLIENTS) await upsertContact(row.email, lead?.name, [Number(process.env.BREVO_LIST_CLIENTS)]);
    await sendAccessEmail(row.email, lead?.name, token, { amount: Number(d.amount), date: now });
    await db(`boussole_purchases?checkout_id=eq.${enc(id)}`, { method: 'PATCH', body: { access_sent_at: now } });
  }
  return { found: true, paid: true, token };
}

// `order` (premier envoi seulement) ajoute la confirmation de commande exigée par le Code de la consommation (support durable).
export function sendAccessEmail(email, name, token, order) {
  const m = accessEmail({ name, token, order });
  return sendEmail({ email, name, subject: m.subject, html: m.html, text: m.text });
}
