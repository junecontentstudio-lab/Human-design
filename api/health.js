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
  // Vérifie auprès de SumUp que la clé est valide et que le code marchand est bien celui de ce compte.
  const sumupCheck = async () => {
    const key = (process.env.SUMUP_API_KEY || '').trim(), code = process.env.SUMUP_MERCHANT_CODE || '';
    if (!key || !code) return 'manquant';
    try {
      const r = await fetch('https://api.sumup.com/v0.1/me', { headers: { Authorization: `Bearer ${key}` } });
      if (!r.ok) return `clé API refusée par SumUp (${r.status})`;
      const me = await r.json(), real = me?.merchant_profile?.merchant_code || '';
      if (!real) return 'clé ok, code marchand du compte introuvable';
      if (code !== code.trim()) return `code marchand avec un espace ou un retour à la ligne en trop (corrigé automatiquement) ; ${real === code.trim() ? 'valeur ok' : 'valeur différente du compte'}`;
      return real === code ? 'ok (clé et code marchand vérifiés)' : `code marchand différent de celui du compte de la clé (le bon commence par ${real.slice(0, 2)}… et finit par …${real.slice(-2)}, ${real.length} caractères)`;
    } catch (e) { return 'SumUp injoignable'; }
  };
  const out = {
    site_url: process.env.SITE_URL || 'manquant',
    mode: freeAccess() ? 'test (version complète offerte)' : 'payant',
    prix_encaisse: `${Number(process.env.PRICE_EUR || 46)} €`,
    token_secret: process.env.TOKEN_SECRET ? 'ok' : 'manquant',
    sumup: await sumupCheck(),
    ia_claude: process.env.ANTHROPIC_API_KEY ? 'ok' : 'manquant',
    emails: mailProvider() ? `ok (${mailProvider()}${process.env.SENDER_EMAIL ? ', depuis ' + process.env.SENDER_EMAIL : ''})` : 'manquant',
    relance_j2: {
      colonnes_sql: dbOn() ? ((await db('boussole_leads?select=relance_sent_at,unsubscribed_at,optin_confirmed_at,ip_hash&limit=0')) === null ? 'manquantes (exécuter 20261108_relance.sql)' : 'ok') : 'non configuré',
      cron_secret: process.env.CRON_SECRET ? 'ok' : 'manquant',
      envoi: process.env.RELANCE_ENABLED === '1' ? 'actif' : 'désactivé (RELANCE_ENABLED)'
    },
    supabase: {
      boussole_leads: await table('boussole_leads'),
      boussole_purchases: await table('boussole_purchases'),
      boussole_stats: await table('boussole_stats')
    }
  };
  return res.status(200).json(out);
}
