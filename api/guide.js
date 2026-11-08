import { checkToken } from '../lib/token.js';
import { buildGuide } from '../lib/guide.js';

// Télécharger son guide en PDF (réservé aux détenteurs d'un accès complet).
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const { token, guide } = req.body || {};
  if (!checkToken(token)) return res.status(402).json({ error: 'Accès complet requis' });
  if (!guide || typeof guide !== 'object' || Array.isArray(guide) || JSON.stringify(guide).length > 150000) return res.status(400).json({ error: 'Demande invalide' });
  try {
    const pdf = await buildGuide({ ...guide, kind: 'guide' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="mon-guide-business-design.pdf"');
    res.setHeader('Cache-Control', 'no-store');
    res.statusCode = 200;
    return res.end(pdf);
  } catch (e) {
    console.error('PDF', e); return res.status(500).json({ error: 'Génération impossible' });
  }
}
export const config = { maxDuration: 30 };
