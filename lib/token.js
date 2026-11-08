import crypto from 'node:crypto';

// Jeton d'accès signé : "<id du paiement>.<signature>". Impossible à fabriquer sans TOKEN_SECRET.
const sign = (id) => crypto.createHmac('sha256', process.env.TOKEN_SECRET || '').update(String(id)).digest('base64url');
export const makeToken = (id) => `${id}.${sign(id)}`;
export const tokenId = (token) => token.slice(0, token.lastIndexOf('.'));

// Mode test ouvert (FREE_ACCESS=1 dans Vercel) : la version complète est offerte, sans paiement.
// Les testeuses gardent leur accès après le test (FREE_ACCESS=0). Pour le leur retirer : REVOKE_TEST_ACCESS=1.
// Les jetons des clientes ne sont jamais concernés.
export const freeAccess = () => process.env.FREE_ACCESS === '1';
export const isTestToken = (token) => tokenId(token).startsWith('test-');
export const makeTestToken = () => makeToken(`test-${crypto.randomUUID()}`);

export function checkToken(token) {
  if (!process.env.TOKEN_SECRET || typeof token !== 'string') return false;
  const i = token.lastIndexOf('.');
  if (i < 1) return false;
  const a = Buffer.from(token.slice(i + 1)), b = Buffer.from(sign(token.slice(0, i)));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  return isTestToken(token) ? process.env.REVOKE_TEST_ACCESS !== '1' : true;
}

// Lien de désinscription : signature de l'adresse, impossible à deviner sans TOKEN_SECRET.
export const unsubToken = email => crypto.createHmac('sha256', process.env.TOKEN_SECRET || '').update('unsub:' + String(email).toLowerCase()).digest('base64url').slice(0, 32);
export function checkUnsub(email, t) {
  if (!process.env.TOKEN_SECRET || typeof t !== 'string' || typeof email !== 'string') return false;
  const a = Buffer.from(t), b = Buffer.from(unsubToken(email));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
