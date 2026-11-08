import { db, enc } from '../lib/db.js';
import { isEmail } from '../lib/brevo.js';

// Enregistre le projet décrit par une prospecte (parcours « j'ai déjà un projet ») dans sa fiche Supabase.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const email = String(req.body?.email || '').trim().toLowerCase();
  const project = typeof req.body?.project === 'string' ? req.body.project.trim().slice(0, 1500) : '';
  if (!isEmail(email) || project.length < 10) return res.status(400).json({ error: 'Demande invalide' });
  const lead = (await db(`boussole_leads?email=eq.${enc(email)}&select=quiz`))?.[0];
  if (lead) await db(`boussole_leads?email=eq.${enc(email)}`, { method: 'PATCH', body: { quiz: { ...(lead.quiz || {}), projet: project }, updated_at: new Date().toISOString() } });
  return res.status(200).json({ ok: true });
}
