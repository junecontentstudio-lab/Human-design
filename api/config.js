import { freeAccess, makeFormToken } from '../lib/token.js';

// Réglages publics lus par la page au chargement.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  // testCharge : montant réellement encaissé quand PRICE_EUR diffère du prix affiché (test de paiement à 1 €).
  const charge = Number(process.env.PRICE_EUR || 46);
  return res.status(200).json({ freeAccess: freeAccess(), ft: makeFormToken(), testCharge: charge !== 46 ? charge : null });
}
