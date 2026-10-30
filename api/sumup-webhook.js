import { confirmCheckout } from '../lib/payments.js';

// Notification SumUp (return_url du checkout) : { event_type: 'CHECKOUT_STATUS_CHANGED', id }.
// Le contenu n'est jamais cru sur parole : on relit le paiement directement chez SumUp.
// Ainsi le paiement est confirmé et le lien d'accès envoyé même si la cliente ferme la page avant le retour.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const id = String(req.body?.id || '');
  if (!/^[A-Za-z0-9-]{8,64}$/.test(id)) return res.status(200).json({ ok: true });
  try { await confirmCheckout(id); } catch (e) { console.error('Webhook SumUp', e); return res.status(500).json({ error: 'Réessayer' }); }
  return res.status(200).json({ ok: true });
}
