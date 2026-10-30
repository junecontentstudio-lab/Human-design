import crypto from 'node:crypto';

// Jeton d'accès signé : "<id du paiement>.<signature>". Impossible à fabriquer sans TOKEN_SECRET.
const sign = (id) => crypto.createHmac('sha256', process.env.TOKEN_SECRET || '').update(String(id)).digest('base64url');
export const makeToken = (id) => `${id}.${sign(id)}`;
export function checkToken(token) {
  if (!process.env.TOKEN_SECRET || typeof token !== 'string') return false;
  const i = token.lastIndexOf('.');
  if (i < 1) return false;
  const a = Buffer.from(token.slice(i + 1)), b = Buffer.from(sign(token.slice(0, i)));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
