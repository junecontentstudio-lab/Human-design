import crypto from 'node:crypto';

// Crée une page de paiement SumUp (Hosted Checkout) et renvoie son adresse.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const site = (process.env.SITE_URL || '').replace(/\/$/, '');
  try {
    const r = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.SUMUP_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkout_reference: 'boussole-' + crypto.randomUUID(),
        amount: Number(process.env.PRICE_EUR || 22),
        currency: 'EUR',
        merchant_code: process.env.SUMUP_MERCHANT_CODE,
        description: 'Ma Boussole Business - accès complet',
        redirect_url: `${site}/?paiement=ok#pistes`,
        hosted_checkout: { enabled: true }
      })
    });
    const d = await r.json();
    if (!r.ok || !d.hosted_checkout_url) { console.error('SumUp checkout', r.status, d); return res.status(502).json({ error: 'Paiement indisponible' }); }
    return res.status(200).json({ id: d.id, url: d.hosted_checkout_url });
  } catch (e) {
    console.error(e); return res.status(502).json({ error: 'Paiement indisponible' });
  }
}
