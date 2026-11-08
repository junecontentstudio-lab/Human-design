import nodemailer from 'nodemailer';

// Envoi des e-mails, par ordre de priorité selon ce qui est configuré dans Vercel :
// 1. Resend (RESEND_API_KEY + SENDER_EMAIL sur ton domaine vérifié dans Resend)
// 2. Gmail (GMAIL_USER + GMAIL_APP_PASSWORD)
// 3. Brevo (BREVO_API_KEY + BREVO_SENDER_EMAIL)
// Les listes de contacts Brevo ne servent que si Brevo est configuré ; dans tous les cas, les prospects sont dans Supabase.
export const resendOn = () => !!(process.env.RESEND_API_KEY && process.env.SENDER_EMAIL);
export const gmailOn = () => !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
export const mailProvider = () => resendOn() ? 'resend' : gmailOn() ? 'gmail' : process.env.BREVO_API_KEY ? 'brevo' : null;
const senderName = () => process.env.SENDER_NAME || process.env.BREVO_SENDER_NAME || 'Ma Boussole Business by Business Design';
let transport = null;
const gmail = () => transport ||= nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, '') } });
const BREVO = 'https://api.brevo.com/v3';
const headers = () => ({ 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' });
export const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const site = () => (process.env.SITE_URL || '').replace(/\/$/, '');
export const isEmail = v => typeof v === 'string' && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export async function upsertContact(email, name, listIds = []) {
  if (!process.env.BREVO_API_KEY) return;
  try {
    await fetch(`${BREVO}/contacts`, { method: 'POST', headers: headers(), body: JSON.stringify({ email, attributes: name ? { PRENOM: name } : {}, listIds, updateEnabled: true }) });
  } catch (e) { console.error('Brevo contact', e); }
}

const mime = f => (/\.pdf$/i.test(f) ? 'application/pdf' : 'text/html');
export async function sendEmail({ email, name, subject, html, text, attachment, headers: extra }) {
  if (resendOn()) {
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          from: `${senderName().replace(/[<>"]/g, '')} <${process.env.SENDER_EMAIL}>`,
          to: [email], subject, html, ...(text ? { text } : {}), ...(extra ? { headers: extra } : {}),
          ...(process.env.REPLY_TO ? { reply_to: process.env.REPLY_TO } : {}),
          ...(attachment ? { attachments: [{ filename: attachment.name, content: attachment.content }] } : {})
        })
      });
      if (!r.ok) { console.error('Resend', r.status, await r.text()); return false; }
      return true;
    } catch (e) { console.error('Resend', e.message); return false; }
  }
  if (gmailOn()) {
    try {
      await gmail().sendMail({
        from: { name: senderName(), address: process.env.GMAIL_USER },
        to: name ? { name, address: email } : email,
        subject, html, ...(text ? { text } : {}), ...(extra ? { headers: extra } : {}),
        ...(attachment ? { attachments: [{ filename: attachment.name, content: attachment.content, encoding: 'base64', contentType: mime(attachment.name) }] } : {})
      });
      return true;
    } catch (e) { console.error('Gmail', e.message); return false; }
  }
  try {
    const r = await fetch(`${BREVO}/smtp/email`, {
      method: 'POST', headers: headers(),
      body: JSON.stringify({
        sender: { name: senderName(), email: process.env.BREVO_SENDER_EMAIL },
        to: [{ email, ...(name ? { name } : {}) }],
        subject, htmlContent: html, ...(text ? { textContent: text } : {}),
        ...(attachment ? { attachment: [attachment] } : {})
      })
    });
    if (!r.ok) { console.error('Brevo email', r.status, await r.text()); return false; }
    return true;
  } catch (e) {
    console.error('Brevo email', e); return false;
  }
}
