import { makeToken } from '../lib/token.js';

// Vérifie auprès de SumUp que le paiement est bien encaissé, puis délivre le jeton d'accès.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const id = String(req.body?.id || '');
  if (!/^[A-Za-z0-9-]{8,64}$/.test(id)) return res.status(400).json({ error: 'Identifiant invalide' });
  try {
    const r = await fetch(`https://api.sumup.com/v0.1/checkouts/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${process.env.SUMUP_API_KEY}` }
    });
    const d = await r.json();
    if (!r.ok) return res.status(404).json({ error: 'Paiement introuvable' });
    const paid = d.status === 'PAID' && Number(d.amount) >= Number(process.env.PRICE_EUR || 22) && d.merchant_code === process.env.SUMUP_MERCHANT_CODE;
    return res.status(200).json(paid ? { paid: true, token: makeToken(id) } : { paid: false, status: d.status });
  } catch (e) {
    console.error(e); return res.status(502).json({ error: 'Vérification impossible' });
  }
}
