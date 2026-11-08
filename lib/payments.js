import { db, enc } from './db.js';
import { makeToken } from './token.js';
import { sendEmail, upsertContact, wrap, para, button, site, esc } from './mail.js';

export const price = () => Number(process.env.PRICE_EUR || 22);
export const accessLink = (token) => `${site()}/?acces=${enc(token)}#bilan`;

// Interroge SumUp (seule source de vérité), enregistre le paiement et envoie le lien d'accès une seule fois.
export async function confirmCheckout(id) {
  const r = await fetch(`https://api.sumup.com/v0.1/checkouts/${enc(id)}`, { headers: { Authorization: `Bearer ${process.env.SUMUP_API_KEY}` } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) return { found: false };
  const paid = d.status === 'PAID' && Number(d.amount) >= price() && d.merchant_code === process.env.SUMUP_MERCHANT_CODE;
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
  const hello = name ? `${esc(name)}, merci` : 'Merci';
  return sendEmail({
    email, name,
    subject: 'Ton accès complet à Ma Boussole Business',
    html: wrap(
      para(`${hello} pour ta confiance ! Ton accès complet est actif : bilan approfondi, pistes de business classées, idées sur mesure, comité de 6 experts et récap.`) +
      para('Garde précieusement cet e-mail : ce bouton rouvre ton accès sur n\'importe quel appareil (téléphone, ordinateur, tablette).') +
      button(accessLink(token), 'Ouvrir mon accès complet') +
      para('<span style="font-size:13px;color:#7A614B">Ce lien est personnel : ne le partage pas.</span>') +
      (order ? para(`<span style="font-size:13px;color:#7A614B"><b>Confirmation de ta commande</b><br>Ma Boussole Business by Business Design · accès complet (contenu numérique)<br>Montant : ${order.amount.toFixed(2).replace('.', ',')} € TTC, payé par carte via SumUp, le ${new Date(order.date).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}<br>Tu as demandé l'accès immédiat au contenu et renoncé expressément à ton droit de rétractation (article L221-28 13° du Code de la consommation).<br>Conditions générales de vente : <a href="${site()}/cgv.html" style="color:#7B4A26">${site().replace(/^https?:\/\//, '')}/cgv.html</a></span>`) : '')
    )
  });
}
