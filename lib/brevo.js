// Envoi d'e-mails et gestion des contacts avec Brevo.
const BREVO = 'https://api.brevo.com/v3';
const headers = () => ({ 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' });
export const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const site = () => (process.env.SITE_URL || '').replace(/\/$/, '');
export const isEmail = v => typeof v === 'string' && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export async function upsertContact(email, name, listIds = []) {
  try {
    await fetch(`${BREVO}/contacts`, { method: 'POST', headers: headers(), body: JSON.stringify({ email, attributes: name ? { PRENOM: name } : {}, listIds, updateEnabled: true }) });
  } catch (e) { console.error('Brevo contact', e); }
}

export async function sendEmail({ email, name, subject, html, attachment }) {
  try {
    const r = await fetch(`${BREVO}/smtp/email`, {
      method: 'POST', headers: headers(),
      body: JSON.stringify({
        sender: { name: process.env.BREVO_SENDER_NAME || 'Ma Boussole Business by Business Design', email: process.env.BREVO_SENDER_EMAIL },
        to: [{ email, ...(name ? { name } : {}) }],
        subject, htmlContent: html,
        ...(attachment ? { attachment: [attachment] } : {})
      })
    });
    if (!r.ok) { console.error('Brevo email', r.status, await r.text()); return false; }
    return true;
  } catch (e) {
    console.error('Brevo email', e); return false;
  }
}

const P = 'font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#3A2819';
export const para = html => `<p style="${P}">${html}</p>`;
export const button = (href, label) => `<p style="margin:22px 0"><a href="${href}" style="display:inline-block;background:#8A5A35;color:#FBF7F1;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;text-decoration:none;padding:12px 22px;border-radius:999px">${label}</a></p>`;
export const wrap = inner => `<div style="background:#F4EDE1;padding:28px 16px"><div style="max-width:560px;margin:0 auto;background:#FBF7F1;border:1px solid #D8C6AC;border-radius:16px;padding:28px">${inner}<p style="font-family:Arial,sans-serif;font-size:12px;color:#7A614B;margin-top:26px">Ma Boussole Business by Business Design · <a href="${site()}" style="color:#8A5A35">${site().replace(/^https?:\/\//, '')}</a></p></div></div>`;
