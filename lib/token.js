import crypto from 'node:crypto';

// Jeton d'accès signé : "<id du paiement>.<signature>". Impossible à fabriquer sans TOKEN_SECRET.
const sign = (id) => crypto.createHmac('sha256', process.env.TOKEN_SECRET || '').update(String(id)).digest('base64url');
export const makeToken = (id) => `${id}.${sign(id)}`;
export const tokenId = (token) => token.slice(0, token.lastIndexOf('.'));

// Accès de test sans paiement : le jeton porte l'empreinte du code ACCESS_CODE en vigueur.
// Changer ou supprimer ACCESS_CODE dans Vercel révoque tous les accès de test, sans toucher aux clients.
const codeTag = () => crypto.createHash('sha256').update(process.env.ACCESS_CODE || '').digest('hex').slice(0, 12);
export const isCodeToken = (token) => tokenId(token).startsWith('code-');
export function checkCode(code) {
  const want = process.env.ACCESS_CODE;
  if (!want || typeof code !== 'string') return false;
  const a = crypto.createHash('sha256').update(code.trim().toLowerCase()).digest(), b = crypto.createHash('sha256').update(want.trim().toLowerCase()).digest();
  return crypto.timingSafeEqual(a, b);
}
export const makeCodeToken = () => makeToken(`code-${codeTag()}-${crypto.randomUUID()}`);

export function checkToken(token) {
  if (!process.env.TOKEN_SECRET || typeof token !== 'string') return false;
  const i = token.lastIndexOf('.');
  if (i < 1) return false;
  const a = Buffer.from(token.slice(i + 1)), b = Buffer.from(sign(token.slice(0, i)));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  if (isCodeToken(token)) return !!process.env.ACCESS_CODE && tokenId(token).split('-')[1] === codeTag();
  return true;
}
