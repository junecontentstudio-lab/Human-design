import { checkToken, tokenId, isTestToken } from '../lib/token.js';
import { db, dbOn } from '../lib/db.js';

// Relais vers l'API Claude : la clé reste secrète côté serveur, et seuls les clients qui ont payé y ont accès.
function parseJSON(text) {
  try { return JSON.parse(text); } catch (e) { }
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch (e) { } }
  const s = text.search(/[\[{]/), e = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
  if (s > -1 && e > s) { try { return JSON.parse(text.slice(s, e + 1)); } catch (err) { } }
  return undefined;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const { prompt, token } = req.body || {};
  if (!checkToken(token)) return res.status(402).json({ error: 'Accès complet requis' });
  if (typeof prompt !== 'string' || prompt.length < 20 || prompt.length > 60000) return res.status(400).json({ error: 'Demande invalide' });
  // Plafond d'appels IA par achat (comité complet = 6 appels), pour protéger le budget API.
  // Les accès de test n'ont pas de ligne d'achat : ils restent hors des statistiques de ventes.
  if (dbOn() && !isTestToken(token)) {
    const ok = await db('rpc/boussole_use_ai', { method: 'POST', body: { p_checkout: tokenId(token), p_limit: Number(process.env.AI_CALLS_LIMIT || 60) } });
    if (ok === false) return res.status(429).json({ error: 'Limite atteinte', code: 'quota' });
  }
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt + '\n\nTa réponse sera lue par un programme : renvoie uniquement le JSON demandé, sans texte autour.' }]
      })
    });
    if (r.status === 429) return res.status(429).json({ error: 'Trop de demandes' });
    const d = await r.json();
    if (!r.ok) { console.error('Anthropic', r.status, d); return res.status(502).json({ error: 'IA indisponible' }); }
    const text = (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    const data = parseJSON(text);
    if (data === undefined) return res.status(502).json({ error: 'Réponse illisible' });
    return res.status(200).json({ data });
  } catch (e) {
    console.error(e); return res.status(502).json({ error: 'IA indisponible' });
  }
}
// Le comité d'experts peut prendre jusqu'à une minute par expert.
export const config = { maxDuration: 60 };
