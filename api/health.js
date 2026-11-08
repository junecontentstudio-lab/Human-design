import { db, dbOn } from '../lib/db.js';
import { mailProvider } from '../lib/mail.js';
import { freeAccess } from '../lib/token.js';

// Diagnostic de mise en ligne : SITE_URL/api/health. N'affiche que des états (oui/non), jamais de clé.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const table = async (t) => {
    if (!dbOn()) return 'non configuré';
    const r = await db(`${t}?select=*&limit=0`);
    return r === null ? 'introuvable (exécuter le fichier SQL dans ce projet Supabase)' : 'ok';
  };
  const out = {
    site_url: process.env.SITE_URL || 'manquant',
    mode: freeAccess() ? 'test (version complète offerte)' : 'payant',
    prix_encaisse: `${Number(process.env.PRICE_EUR || 22)} €`,
    token_secret: process.env.TOKEN_SECRET ? 'ok' : 'manquant',
    sumup: process.env.SUMUP_API_KEY && process.env.SUMUP_MERCHANT_CODE ? 'ok' : 'manquant',
    ia_claude: process.env.ANTHROPIC_API_KEY ? 'ok' : 'manquant',
    emails: mailProvider() ? `ok (${mailProvider()}${process.env.SENDER_EMAIL ? ', depuis ' + process.env.SENDER_EMAIL : ''})` : 'manquant',
    supabase: {
      boussole_leads: await table('boussole_leads'),
      boussole_purchases: await table('boussole_purchases'),
      boussole_stats: await table('boussole_stats')
    }
  };
  return res.status(200).json(out);
}
