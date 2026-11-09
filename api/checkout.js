import crypto from 'node:crypto';
import { db } from '../lib/db.js';
import { site, isEmail } from '../lib/mail.js';
import { price } from '../lib/payments.js';

// Crée une page de paiement SumUp (Hosted Checkout), l'enregistre dans Supabase et renvoie son adresse.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const email = isEmail(req.body?.email) ? req.body.email.trim().toLowerCase() : null;
  const reference = 'boussole-' + crypto.randomUUID();
  try {
    const r = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${(process.env.SUMUP_API_KEY || '').trim()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkout_reference: reference,
        amount: price(),
        currency: 'EUR',
        merchant_code: (process.env.SUMUP_MERCHANT_CODE || '').trim(),
        description: 'Ma Boussole Business by Business Design - accès complet',
        redirect_url: `${site()}/?paiement=ok#bilan`,
        return_url: `${site()}/api/sumup-webhook`,
        hosted_checkout: { enabled: true }
      })
    });
    const d = await r.json();
    if (!r.ok || !d.hosted_checkout_url) {
      console.error('SumUp checkout', r.status, d);
      // Motif renvoyé par SumUp (code et message, aucune clé), pour diagnostiquer sans ouvrir les journaux Vercel.
      const e = Array.isArray(d) ? d[0] || {} : d || {};
      return res.status(502).json({ error: 'Paiement indisponible', sumup: { status: r.status, code: e.error_code || null, message: e.message || null, param: e.param || null } });
    }
    await db('boussole_purchases', { method: 'POST', body: { checkout_id: d.id, reference, email, amount: price(), status: 'PENDING' } });
    return res.status(200).json({ id: d.id, url: d.hosted_checkout_url });
  } catch (e) {
    console.error(e); return res.status(502).json({ error: 'Paiement indisponible' });
  }
}
