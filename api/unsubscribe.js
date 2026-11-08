import { db, enc } from '../lib/db.js';
import { checkUnsub } from '../lib/token.js';
import { site } from '../lib/mail.js';

// Désinscription des conseils par e-mail. GET : page de confirmation (évite qu'un anti-virus ne désinscrive tout seul).
// POST : désinscription effective (bouton de la page, ou « un clic » de la messagerie via l'en-tête List-Unsubscribe).
const page = (title, msg, form = '') => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{margin:0;background:#FBF8F2;color:#21170F;font:16px/1.6 -apple-system,'Segoe UI',Helvetica,Arial,sans-serif;display:grid;place-items:center;min-height:100vh;padding:20px}main{max-width:460px;background:#FFFEFB;border:1px solid #E2D6C4;border-radius:16px;padding:32px;text-align:center}h1{font:400 24px/1.3 Georgia,serif;margin:0 0 12px}p{margin:0 0 18px;color:#5E4A3A}button,a.b{display:inline-block;background:#7B4A26;color:#FFFEFB;border:0;border-radius:999px;padding:13px 26px;font:600 15px/1 inherit;text-decoration:none;cursor:pointer}</style></head><body><main><h1>${title}</h1><p>${msg}</p>${form}</main></body></html>`;

export default async function handler(req, res) {
  const email = String(req.query?.e || '').trim().toLowerCase(), t = String(req.query?.t || '');
  res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Cache-Control', 'no-store');
  if (!email || !checkUnsub(email, t)) return res.status(400).send(page('Lien invalide', 'Ce lien de désinscription n\'est pas valide. Écris-nous et nous te désinscrivons à la main.', `<a class="b" href="${site()}">Retour au site</a>`));
  if (req.method === 'POST') {
    await db(`boussole_leads?email=eq.${enc(email)}`, { method: 'PATCH', body: { optin: false, unsubscribed_at: new Date().toISOString() } });
    return res.status(200).send(page('C\'est fait', 'Tu ne recevras plus nos conseils par e-mail. Tes e-mails liés à ton profil ou à ton achat continueront d\'arriver si tu en demandes.', `<a class="b" href="${site()}">Retour au site</a>`));
  }
  return res.status(200).send(page('Se désinscrire', `Tu ne recevras plus nos conseils sur <b>${email.replace(/[<>&"]/g, '')}</b>.`, `<form method="post"><button type="submit">Confirmer la désinscription</button></form>`));
}
