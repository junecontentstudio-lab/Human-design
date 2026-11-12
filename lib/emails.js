import { esc, site } from './mail.js';
import { freeAccess, unsubToken, optinToken } from './token.js';

// Les trois e-mails du parcours (profil gratuit, confirmation d'achat + accès, guide complet).
// Mise en page en tableaux avec styles en ligne : compatible Gmail, Apple Mail, Outlook. Crème, marron, sobre.
const INK = '#21170F', MUTED = '#5E4A3A', ACCENT = '#7B4A26', LINE = '#E2D6C4', SAND = '#F3ECE1', PAGE = '#F4EEE3', CARD = '#FFFEFB';
const SERIF = "Georgia,'Times New Roman',serif", SANS = "-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";
const contact = () => process.env.REPLY_TO || process.env.SENDER_EMAIL || 'ludivine@businessdesign.fr';
const money = n => `${Number(n).toFixed(2).replace('.', ',')} €`;
const day = d => new Date(d || Date.now()).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris', day: 'numeric', month: 'long', year: 'numeric' });
const hello = name => (name ? `${esc(name)}, ` : '');

export const optinLink = email => `${site()}/api/confirm?e=${encodeURIComponent(email)}&t=${optinToken(email)}`;
export const unsubLink = email => `${site()}/api/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubToken(email)}`;
export const accessLink = token => `${site()}/?acces=${encodeURIComponent(token)}#bilan`;

const eyebrow = (t, color = ACCENT) => `<p style="margin:0 0 10px;font:600 11px/1.4 ${SANS};letter-spacing:.14em;text-transform:uppercase;color:${color}">${t}</p>`;
const h1 = t => `<h1 style="margin:0 0 16px;font:400 28px/1.25 ${SERIF};color:${INK}">${t}</h1>`;
const h2 = t => `<h2 style="margin:0 0 12px;font:400 20px/1.3 ${SERIF};color:${INK}">${t}</h2>`;
const p = (t, o = {}) => `<p style="margin:0 0 ${o.mb ?? 16}px;font:400 ${o.size || 15}px/1.65 ${SANS};color:${o.color || INK}">${t}</p>`;
const btn = (href, label) => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 24px"><tr><td style="background:${ACCENT};border-radius:999px"><a href="${href}" style="display:inline-block;padding:15px 30px;font:600 15px/1 ${SANS};color:${CARD};text-decoration:none">${label}</a></td></tr></table>`;
const rule = `<div style="height:1px;background:${LINE};margin:28px 0;line-height:1px;font-size:1px">&nbsp;</div>`;
const panel = (inner, bg = SAND) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px"><tr><td style="background:${bg};border-radius:12px;padding:20px 22px">${inner}</td></tr></table>`;
const steps = items => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 6px">${items.map(([a, b], i) => `<tr><td width="40" valign="top" style="padding:0 0 16px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="28" height="28" align="center" style="border:1px solid #B9824A;border-radius:14px;font:400 14px/26px ${SERIF};color:${ACCENT}">${i + 1}</td></tr></table></td><td valign="top" style="padding:0 0 16px"><p style="margin:0 0 2px;font:600 14.5px/1.4 ${SANS};color:${INK}">${a}</p><p style="margin:0;font:400 13.5px/1.55 ${SANS};color:${MUTED}">${b}</p></td></tr>`).join('')}</table>`;
const kv = rows => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows.map(([k, v]) => `<tr><td valign="top" width="38%" style="padding:7px 0;border-top:1px solid ${LINE};font:600 11px/1.6 ${SANS};letter-spacing:.1em;text-transform:uppercase;color:${MUTED}">${k}</td><td valign="top" style="padding:7px 0;border-top:1px solid ${LINE};font:400 14px/1.55 ${SANS};color:${INK}">${v}</td></tr>`).join('')}</table>`;

function layout({ title, preheader, body, note = '' }) {
  const s = site();
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${PAGE}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px">${esc(preheader)}${'&nbsp;&zwnj;'.repeat(40)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE}"><tr><td align="center" style="padding:34px 14px 40px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
<tr><td align="center" style="padding:0 0 22px"><p style="margin:0;font:600 21px/1.2 ${SERIF};color:${INK}">Ma Boussole Business</p><p style="margin:6px 0 0;font:600 10px/1.4 ${SANS};letter-spacing:.24em;text-transform:uppercase;color:${ACCENT}">by Business Design</p></td></tr>
<tr><td style="background:${CARD};border:1px solid ${LINE};border-radius:16px;padding:38px 36px 14px">${body}</td></tr>
<tr><td align="center" style="padding:24px 18px 0"><p style="margin:0 0 8px;font:400 12px/1.6 ${SANS};color:${MUTED}">Harmonie Group · 69 rue du Rouet, Marseille<br>Une question ? Réponds simplement à cet e-mail ou écris à <a href="mailto:${esc(contact())}" style="color:${ACCENT}">${esc(contact())}</a></p>${note ? `<p style="margin:0 0 8px;font:400 11.5px/1.6 ${SANS};color:${MUTED}">${note}</p>` : ''}<p style="margin:0;font:400 11.5px/1.6 ${SANS};color:${MUTED}"><a href="${s}/mentions-legales.html" style="color:${MUTED}">Mentions légales</a> · <a href="${s}/cgv.html" style="color:${MUTED}">CGV</a> · <a href="${s}/confidentialite.html" style="color:${MUTED}">Confidentialité</a></p></td></tr>
</table></td></tr></table></body></html>`;
}

/* ---------- 1. Profil gratuit ---------- */
export function profileEmail({ name, archetype, pistes = [], attached = true, optin = false, email = '' }) {
  const s = site(), ar = archetype || {}, ps = (pistes || []).slice(0, 3);
  const price = freeAccess() ? '' : `Version complète : ${Number(process.env.PRICE_EUR || 46)} €`;
  const body = `
    ${eyebrow('Ton profil est prêt')}
    ${h1(`${hello(name)}voici ton profil d'entrepreneur·e`)}
    ${p(attached ? 'Ton archétype, ta charte Human Design et tes 3 pistes de business t\'attendent dans le <b>PDF en pièce jointe</b>. Voici l\'essentiel.' : 'Voici l\'essentiel de ton profil.')}
    ${ar.name ? panel(`${eyebrow('Ton archétype', MUTED)}<p style="margin:0 0 8px;font:italic 400 26px/1.2 ${SERIF};color:${ACCENT}">${esc(ar.name)}</p><p style="margin:0;font:400 14.5px/1.6 ${SANS};color:${INK}">${esc(ar.line || '')}</p>`) : ''}
    ${ps.length ? `${h2('Tes 3 pistes de business')}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px">${ps.map((x, i) => `<tr><td width="34" valign="top" style="padding:11px 0;border-top:1px solid ${LINE};font:400 20px/1.2 ${SERIF};color:#B9824A">${i + 1}</td><td valign="top" style="padding:11px 0;border-top:1px solid ${LINE};font:600 14.5px/1.45 ${SANS};color:${INK}">${esc(x.t)}</td><td valign="top" align="right" style="padding:11px 0;border-top:1px solid ${LINE};font:400 15px/1.45 ${SERIF};color:${ACCENT};white-space:nowrap">${x.aff ? esc(String(x.aff).slice(0, 30)) : Math.round(Number(x.total) || 0) + '/100'}</td></tr>`).join('')}</table>` : ''}
    ${p('Chaque piste est notée selon tes réponses : compétences, intérêts, valeurs, préférences et contraintes. Le Human Design n\'entre pas dans le score : c\'est une grille de réflexion, pas un test validé.', { size: 13, color: MUTED })}
    ${optin && email ? `${rule}${eyebrow('Une dernière étape')}${h2('Confirme ton inscription à nos conseils')}${p('Tu as demandé à recevoir les conseils de Ma Boussole Business pour lancer ton activité. Confirme en un clic : sans cette confirmation, nous ne t\'écrirons pas.', { size: 14 })}${btn(optinLink(email), 'Oui, je veux recevoir les conseils')}` : ''}
    ${rule}
    ${eyebrow('Aller plus loin')}
    ${h2('Transforme une piste en projet concret')}
    ${steps([['Des idées 100 % sur mesure', 'Générées par IA à partir de tes réponses et de ton projet.'], ['Un bilan approfondi et un comité de 6 experts', 'Pour affiner tes pistes et construire ton offre.'], ['Ton plan d\'action et ton guide en PDF', 'Un plan de 30 jours et des critères pour savoir si ça marche.']])}
    ${btn(`${s}/#offre`, 'Découvrir la version complète')}
    ${price ? p(price, { size: 12.5, color: MUTED, mb: 8 }) : ''}`;
  return {
    subject: 'Ton profil d\'entrepreneur·e est prêt',
    html: layout({ title: 'Ton profil d\'entrepreneur·e', preheader: ar.name ? `${ar.name} : ton archétype et tes 3 pistes de business.` : 'Ton archétype et tes 3 pistes de business.', body, note: optin && email ? `Tu reçois cet e-mail parce que tu as demandé ton profil sur businessdesign.fr. Nos conseils ne te seront envoyés que si tu confirmes ton inscription ci-dessus.` : 'Tu reçois cet e-mail parce que tu as demandé ton profil sur businessdesign.fr. Sans ton accord, nous ne t\'enverrons pas d\'autres messages.' }),
    text: `${hello(name).replace(/&[^;]+;/g, '')}voici ton profil d'entrepreneur·e.\n\nArchétype : ${ar.name || ''}\n${ar.line || ''}\n\nTes 3 pistes :\n${ps.map((x, i) => `${i + 1}. ${x.t} (${x.aff ? String(x.aff).slice(0, 30) : Math.round(Number(x.total) || 0) + '/100'})`).join('\n')}\n\nLe détail est dans le PDF en pièce jointe.${optin && email ? `\n\nPour recevoir nos conseils, confirme ton inscription : ${optinLink(email)}` : ''}\nVersion complète : ${s}/#offre\n\nHarmonie Group · 69 rue du Rouet, Marseille · ${contact()}`
  };
}

/* ---------- 2. Paiement confirmé + lien d'accès ---------- */
export function accessEmail({ name, token, order }) {
  const link = accessLink(token), s = site();
  const body = `
    ${eyebrow('Paiement confirmé')}
    ${h1(`Merci ${esc(name || '')}${name ? ', ' : ''}ton accès complet est ouvert`)}
    ${p('Tout est prêt pour passer de l\'envie au projet. <b>Garde cet e-mail</b> : le bouton ci-dessous rouvre ton accès sur n\'importe quel appareil, téléphone, ordinateur ou tablette.')}
    ${btn(link, 'Ouvrir mon accès complet')}
    ${p('Ce lien est personnel : ne le partage pas.', { size: 12.5, color: MUTED })}
    ${rule}
    ${h2('Ton parcours en 4 étapes')}
    ${steps([['Complète ton bilan approfondi', 'Environ 20 minutes, à ton rythme : tout est enregistré au fur et à mesure.'], ['Découvre tes idées sur mesure', 'Générées par IA à partir de tes réponses et de ton projet.'], ['Lance ton comité de 6 experts', 'Human Design, orientation, stratégie, marketing, mindset et synthèse.'], ['Reçois ton guide en PDF', 'Ton offre, ton plan de 30 jours, tes critères de validation et ta feuille de route.']])}
    ${rule}
    ${h2('Ta commande')}
    ${order ? kv([['Produit', 'Ma Boussole Business by Business Design · accès complet (contenu numérique)'], ['Montant', `${money(order.amount)} TTC`], ['Date', day(order.date)], ['Paiement', 'Carte bancaire, via SumUp']]) : ''}
    ${p('Tu as demandé l\'accès immédiat au contenu et renoncé expressément à ton droit de rétractation (article L221-28 13° du Code de la consommation). Conditions générales de vente : <a href="' + s + '/cgv.html" style="color:' + ACCENT + '">' + s.replace(/^https?:\/\//, '') + '/cgv.html</a>.', { size: 12.5, color: MUTED })}`;
  return {
    subject: 'Ton accès complet est ouvert · confirmation de commande',
    html: layout({ title: 'Ton accès complet', preheader: 'Ton lien d\'accès personnel et ta confirmation de commande.', body }),
    text: `Merci ${name || ''}, ton accès complet est ouvert.\n\nOuvre ton accès (lien personnel, à garder) :\n${link}\n\nCommande : accès complet Ma Boussole Business by Business Design${order ? `\nMontant : ${money(order.amount)} TTC · ${day(order.date)} · carte bancaire via SumUp` : ''}\nTu as demandé l'accès immédiat et renoncé à ton droit de rétractation (art. L221-28 13° du Code de la consommation). CGV : ${s}/cgv.html\n\nHarmonie Group · 69 rue du Rouet, Marseille · ${contact()}`
  };
}

/* ---------- 3. Guide complet ---------- */
export function guideEmail({ name, offer = {}, token }) {
  const o = offer || {}, link = token ? accessLink(token) : site();
  const body = `
    ${eyebrow('Ton guide est prêt')}
    ${h1(`${hello(name)}ton guide business passion`)}
    ${p('Il est en <b>pièce jointe (PDF)</b> : ton profil, ta charte, tes pistes, ton offre, ton plan de 30 jours, tes critères de validation et ta feuille de route.')}
    ${o.name ? panel(`${eyebrow('Ton offre de lancement', MUTED)}<p style="margin:0 0 10px;font:400 22px/1.25 ${SERIF};color:${INK}">${esc(o.name)}</p>${kv([['Pour qui', esc(o.client || 'À préciser')], ['Résultat promis', esc(o.promise || 'À préciser')], ['Prix de lancement', esc(o.price || 'À préciser')]])}`) : ''}
    ${o.step ? `${h2('Ton prochain pas')}${p(esc(o.step))}` : ''}
    ${p('Le plus important maintenant : parler à de vraies personnes de ta cible cette semaine. Tu en sauras plus en 10 conversations qu\'en 10 heures de réflexion.', { color: MUTED, size: 14 })}
    ${btn(link, 'Retrouver mon espace')}
    ${rule}
    ${p('Le Human Design est une grille de réflexion, pas une science validée : garde ce qui te parle et teste-le dans la réalité. Une partie du guide est générée par intelligence artificielle et peut comporter des erreurs. Aucun résultat commercial n\'est garanti.', { size: 12, color: MUTED })}`;
  return {
    subject: 'Ton guide business passion est prêt (PDF)',
    html: layout({ title: 'Ton guide business passion', preheader: o.name ? `${o.name} : ton offre, ton plan de 30 jours et ta feuille de route.` : 'Ton offre, ton plan de 30 jours et ta feuille de route.', body }),
    text: `${hello(name).replace(/&[^;]+;/g, '')}ton guide business passion est en pièce jointe (PDF).\n\n${o.name ? `Offre : ${o.name}\n` : ''}${o.step ? `Ton prochain pas : ${o.step}\n` : ''}\nRetrouver mon espace : ${link}\n\nHarmonie Group · 69 rue du Rouet, Marseille · ${contact()}`
  };
}

/* ---------- 4. Relance à J+2 (prospects qui ont accepté de recevoir des conseils) ---------- */
export function relanceEmail({ name, email, archetype, topIdea }) {
  const s = site(), unsub = unsubLink(email);
  const price = freeAccess() ? '' : `Version complète : ${Number(process.env.PRICE_EUR || 46)} €`;
  const body = `
    ${eyebrow('Ton profil, deux jours après')}
    ${h1(`${hello(name)}où en es-tu de ta piste ?`)}
    ${p(`Il y a deux jours, tu as découvert ton profil${archetype ? ` : <b>${esc(archetype)}</b>` : ''}.${topIdea ? ` Ta piste n°1 : <b>${esc(topIdea)}</b>.` : ''} Une idée reste une idée tant qu'elle n'est pas confrontée à de vraies personnes.`)}
    ${panel(`${eyebrow('Un premier pas pour cette semaine', MUTED)}<p style="margin:0;font:400 15px/1.65 ${SANS};color:${INK}">Parle de ton idée à <b>3 personnes</b> qui pourraient être tes clientes, et note les mots exacts qu'elles utilisent pour décrire leur problème. C'est le meilleur test, et il ne coûte rien.</p>`)}
    ${p('Si tu veux avancer plus vite et avec un cadre, la version complète t\'accompagne pas à pas :')}
    ${steps([['Des idées 100 % sur mesure', 'Générées par IA à partir de tes réponses et de ton projet.'], ['Ton offre et ton comité de 6 experts', 'Pour savoir à qui tu t\'adresses, quoi proposer et à quel prix.'], ['Ton plan de 30 jours en PDF', 'Avec des critères clairs pour savoir si ton idée tient la route.']])}
    ${btn(`${s}/#offre`, 'Retrouver mon profil et continuer')}
    ${price ? p(price, { size: 12.5, color: MUTED, mb: 8 }) : ''}`;
  return {
    subject: `${name ? name + ', ' : ''}où en es-tu de ta piste ?`,
    html: layout({ title: 'Où en es-tu de ta piste ?', preheader: 'Un premier pas simple à faire cette semaine, sans rien dépenser.', body, note: `Tu reçois cet e-mail parce que tu as accepté de recevoir nos conseils. <a href="${unsub}" style="color:${MUTED}">Se désinscrire</a>` }),
    text: `${hello(name).replace(/&[^;]+;/g, '')}où en es-tu de ta piste ?\n\n${archetype ? `Ton archétype : ${archetype}\n` : ''}${topIdea ? `Ta piste n°1 : ${topIdea}\n` : ''}\nUn premier pas pour cette semaine : parle de ton idée à 3 personnes qui pourraient être tes clientes et note les mots qu'elles utilisent.\n\nVersion complète : ${s}/#offre\n\nSe désinscrire : ${unsub}\nHarmonie Group · 69 rue du Rouet, Marseille · ${contact()}`,
    headers: { 'List-Unsubscribe': `<${unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
  };
}
