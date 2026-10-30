// Accès minimal à Supabase (API REST PostgREST) avec la clé service_role, sans dépendance.
// Si Supabase n'est pas configuré, chaque appel renvoie null et le site continue de fonctionner.
export const dbOn = () => !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function db(path, { method = 'GET', body, prefer } = {}) {
  if (!dbOn()) return null;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    const r = await fetch(`${process.env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${path}`, {
      method,
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'content-type': 'application/json', ...(prefer ? { Prefer: prefer } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const text = await r.text();
    if (!r.ok) { console.error('Supabase', method, path.split('?')[0], r.status, text); return null; }
    return text ? JSON.parse(text) : [];
  } catch (e) {
    console.error('Supabase', e); return null;
  }
}

export const enc = encodeURIComponent;
