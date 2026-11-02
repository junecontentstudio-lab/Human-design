import { freeAccess } from '../lib/token.js';

// Réglages publics lus par la page au chargement.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ freeAccess: freeAccess() });
}
