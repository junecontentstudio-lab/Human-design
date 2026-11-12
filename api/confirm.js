import { db, enc } from '../lib/db.js';
import { checkOptin } from '../lib/token.js';
import { site, upsertContact } from '../lib/mail.js';

// Confirmation de l'inscription aux conseils (double consentement), depuis le bouton de l'e-mail du profil.
// GET : page avec un bouton (évite qu'un anti-virus qui ouvre les liens ne confirme tout seul). POST : confirmation effective.
const page = (title, msg, form = '') => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title><style>body{margin:0;background:#FBF8F2;color:#21170F;font:16px/1.6 -apple-system,'Segoe UI',Helvetica,Arial,sans-serif;display:grid;place-items:center;min-height:100vh;padding:20px}main{max-width:460px;background:#FFFEFB;border:1px solid #E2D6C4;border-radius:16px;padding:32px;text-align:center}h1{font:400 24px/1.3 Georgia,serif;margin:0 0 12px}p{margin:0 0 18px;color:#5E4A3A}button,a.b{display:inline-block;background:#7B4A26;color:#FFFEFB;border:0;border-radius:999px;padding:13px 26px;font:600 15px/1 inherit;text-decoration:none;cursor:pointer}</style></head><body><main><h1>${title}</h1><p>${msg}</p>${form}</main></body></html>`;

export default async function handler(req, res) {
  const email = String(req.query?.e || '').trim().toLowerCase(), t = String(req.query?.t || '');
  res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Cache-Control', 'no-store');
  const back = `<a class="b" href="${site()}">Retour au site</a>`;
  if (!email || !checkOptin(email, t)) return res.status(400).send(page('Lien invalide', 'Ce lien de confirmation n\'est pas valide. Refais une demande de profil sur le site en cochant la case des conseils.', back));
  if (req.method === 'POST') {
    const now = new Date().toISOString();
    const rows = await db(`boussole_leads?email=eq.${enc(email)}`, { method: 'PATCH', prefer: 'return=representation', body: { optin: true, optin_confirmed_at: now, unsubscribed_at: null, updated_at: now } });
    if (!rows?.length) return res.status(503).send(page('Un instant', 'Ta confirmation n\'a pas pu être enregistrée pour le moment. Réessaie dans quelques minutes.', back));
    if (process.env.BREVO_LIST_PROSPECTS) await upsertContact(email, rows[0].name, [Number(process.env.BREVO_LIST_PROSPECTS)]);
    return res.status(200).send(page('C\'est confirmé', 'Tu recevras nos conseils pour lancer ton activité. Tu pourras te désinscrire à tout moment depuis chaque e-mail.', back));
  }
  return res.status(200).send(page('Recevoir nos conseils', `Confirme que tu veux recevoir les conseils de Ma Boussole Business sur <b>${email.replace(/[<>&"]/g, '')}</b>.`, `<form method="post"><button type="submit">Oui, je confirme</button></form>`));
}
