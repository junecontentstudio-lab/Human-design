import { checkToken } from '../lib/token.js';
import { confirmCheckout } from '../lib/payments.js';

// Au retour de SumUp : vérifie le paiement et délivre le jeton d'accès.
// Avec un lien d'accès reçu par e-mail : vérifie simplement le jeton.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const { id: rawId, token } = req.body || {};
  if (token !== undefined) return res.status(200).json(checkToken(token) ? { paid: true, token } : { paid: false });
  const id = String(rawId || '');
  if (!/^[A-Za-z0-9-]{8,64}$/.test(id)) return res.status(400).json({ error: 'Identifiant invalide' });
  try {
    const r = await confirmCheckout(id);
    if (!r.found) return res.status(404).json({ error: 'Paiement introuvable' });
    return res.status(200).json(r.paid ? { paid: true, token: r.token } : { paid: false, status: r.status });
  } catch (e) {
    console.error(e); return res.status(502).json({ error: 'Vérification impossible' });
  }
}
