const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KEY = 'boussole-business-v1';

const EXAMPLE = {
  example: true,
  birth: { name: 'Camille', date: '1988-06-14', time: '09:30', unknown: false, zone: 'Europe/Paris', city: 'Lyon' },
  ans: {
    riasec: [2, 1, 2, 3, 3, 3, 2, 4, 3, 3, 4, 4, 4, 5, 4, 5, 5, 4, 4, 5, 3, 4, 5, 3, 4, 2, 2, 3, 3, 2],
    skills: { ecrire: 2, oral: 2, reseaux: 2, langues: 1, conseil: 3, former: 2, vendre: 1, conflits: 2, design: 1, photo: 1, manuel: 0, cuisine: 1, projet: 2, admin: 1, finance: 0, event: 1, digital: 2, nocode: 0, data: 0, bricolage: 0, sante: 1, expertise: 2 },
    open: { passions: 'Le développement personnel, les reconversions, la psychologie', flow: 'Écouter quelqu\'un raconter son parcours et l\'aider à y voir clair', help: 'Mes amies viennent me voir quand elles doivent prendre une décision importante', problem: 'Les gens qui restent dans un travail qui les rend malheureux' },
    values: ['liberte', 'impact', 'transmission', 'lien', 'creativite'],
    style: ['b', 'a', 'b', 'b', 'b', 'a', 'a', 'a'],
    cons: { time: 1, budget: 1, revenue: 1, risk: 0, place: 2 },
    ideas: 'Accompagner des femmes en reconversion', excl: 'Vente à domicile'
  }
};
const blankAns = () => ({ riasec: Array(30).fill(0), skills: {}, open: {}, values: [], style: Array(8).fill(''), cons: {}, ideas: '', excl: '' });

let S = load() || JSON.parse(JSON.stringify(EXAMPLE));
let step = 0;
function load() { try { const v = localStorage.getItem(KEY); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }

/* ---------- chart ---------- */
function computeChart() {
  const b = S.birth;
  if (!b.date) return null;
  const [y, m, d] = b.date.split('-').map(Number);
  const [h, mi] = (b.unknown || !b.time ? '12:00' : b.time).split(':').map(Number);
  const utc = HD.localToUtc(y, m, d, h, mi, b.zone || 'Europe/Paris');
  return HD.chart(utc);
}

const POS = { head: [180, 52], ajna: [180, 128], throat: [180, 210], g: [180, 300], heart: [248, 338], sacral: [180, 420], spleen: [64, 398], solar: [296, 398], root: [180, 500] };
function centerShape(c, on) {
  const [x, y] = POS[c];
  const fill = on ? 'var(--center-on)' : 'var(--surface)', st = on ? 'var(--ink)' : 'var(--muted)';
  const a = `fill="${fill}" stroke="${st}" stroke-width="1.5" stroke-linejoin="round"`;
  const name = CENTER_TXT[c][0];
  let shape;
  if (c === 'head') shape = `<polygon ${a} points="${x},${y - 30} ${x - 32},${y + 22} ${x + 32},${y + 22}"/>`;
  else if (c === 'ajna') shape = `<polygon ${a} points="${x - 32},${y - 22} ${x + 32},${y - 22} ${x},${y + 30}"/>`;
  else if (c === 'g') shape = `<polygon ${a} points="${x},${y - 36} ${x + 36},${y} ${x},${y + 36} ${x - 36},${y}"/>`;
  else if (c === 'heart') shape = `<polygon ${a} points="${x},${y - 18} ${x + 22},${y + 16} ${x - 22},${y + 16}"/>`;
  else if (c === 'spleen') shape = `<polygon ${a} points="${x - 24},${y - 36} ${x + 32},${y} ${x - 24},${y + 36}"/>`;
  else if (c === 'solar') shape = `<polygon ${a} points="${x + 24},${y - 36} ${x - 32},${y} ${x + 24},${y + 36}"/>`;
  else { const s = c === 'throat' ? 25 : 28; shape = `<rect ${a} x="${x - s}" y="${y - s}" width="${2 * s}" height="${2 * s}" rx="6"/>`; }
  return `<g><title>${name} : ${on ? 'défini' : 'ouvert'}</title>${shape}</g>`;
}
function bodygraph(ch) {
  const groups = {};
  HD.CHANNELS.forEach(([a, b]) => { const ca = HD.GATE_CENTER[a], cb = HD.GATE_CENTER[b]; const k = [ca, cb].sort().join('|'); (groups[k] ||= []).push([a, b]); });
  let lines = '';
  for (const k in groups) {
    const list = groups[k];
    list.forEach(([a, b], i) => {
      const [x1, y1] = POS[HD.GATE_CENTER[a]], [x2, y2] = POS[HD.GATE_CENTER[b]];
      const len = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
      const sign = HD.GATE_CENTER[a] < HD.GATE_CENTER[b] ? 1 : -1;
      const off = (i - (list.length - 1) / 2) * 11 * sign;
      const ax = x1 + nx * off, ay = y1 + ny * off, bx = x2 + nx * off, by = y2 + ny * off, mx = (ax + bx) / 2, my = (ay + by) / 2;
      const seg = (g, sx, sy) => {
        const s = ch.gates[g]; const p = `M${sx.toFixed(1)} ${sy.toFixed(1)}L${mx.toFixed(1)} ${my.toFixed(1)}`;
        if (!s) return `<path d="${p}" stroke="var(--line-off)" stroke-width="5" stroke-linecap="round"/>`;
        const t = `<title>Porte ${g} : ${s.p && s.d ? 'Design et Personnalité' : s.d ? 'Design' : 'Personnalité'}</title>`;
        if (s.p && s.d) return `<g>${t}<path d="${p}" stroke="var(--design)" stroke-width="6" stroke-linecap="round"/><path d="${p}" stroke="var(--ink)" stroke-width="6" stroke-dasharray="5 5"/></g>`;
        return `<g>${t}<path d="${p}" stroke="${s.d ? 'var(--design)' : 'var(--ink)'}" stroke-width="6" stroke-linecap="round"/></g>`;
      };
      lines += seg(a, ax, ay) + seg(b, bx, by);
    });
  }
  const centers = Object.keys(POS).map(c => centerShape(c, ch.defined.includes(c))).join('');
  return `<svg viewBox="0 0 360 540" role="img" aria-label="Bodygraph : ${ch.defined.length} centres définis sur 9"><g fill="none">${lines}</g>${centers}</svg>`;
}

function renderChart() {
  const ch = computeChart();
  S.chart = ch ? { type: ch.type, authority: ch.authority, profile: ch.profile, defined: ch.defined, channels: ch.channels } : null;
  const out = $('#chartOut');
  if (!ch) { out.innerHTML = '<p class="muted">Indique ta date de naissance pour calculer ta charte.</p>'; $('#chartDetails').innerHTML = ''; return; }
  const T = TYPES[ch.type], A = AUTH[ch.authority], b = S.birth;
  const [l1, l2] = ch.profile.split('/');
  const born = new Date(b.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  out.innerHTML = `
    <div class="who"><h3>${esc(b.name || 'Ta charte')}</h3>${S.example ? '<span class="tag ex">Exemple</span>' : ''}<span class="muted" style="font-size:.88rem">${born}${b.unknown ? ' · heure inconnue' : ' · ' + esc(b.time)}${b.city ? ' · ' + esc(b.city) : ''}</span></div>
    <div class="result">
      <div class="body-wrap">${bodygraph(ch)}
        <div class="legend"><span><i style="background:var(--ink)"></i>Personnalité (conscient)</span><span><i style="background:var(--design)"></i>Design (inconscient)</span></div>
      </div>
      <dl class="facts">
        <div class="fact wide"><dt>Type</dt><dd>${T.name}</dd></div>
        <div class="fact"><dt>Stratégie</dt><dd>${T.strat}</dd></div>
        <div class="fact"><dt>Autorité</dt><dd>${b.unknown ? 'À confirmer' : A[0]}</dd></div>
        <div class="fact"><dt>Profil</dt><dd>${b.unknown ? 'À confirmer' : `${ch.profile} · ${LINES[l1][0]} / ${LINES[l2][0]}`}</dd></div>
        <div class="fact"><dt>Définition</dt><dd>${DEFS[ch.definition]}</dd></div>
        <div class="fact"><dt>Signature</dt><dd>${T.sig}</dd></div>
        <div class="fact"><dt>Thème du non-soi</dt><dd>${T.ns}</dd></div>
        <div class="fact wide"><dt>Croix d'incarnation (portes)</dt><dd class="mono" style="font-size:1rem">${ch.cross.p.join('/')} | ${ch.cross.d.join('/')}</dd></div>
      </dl>
    </div>
    ${b.unknown ? '<p class="hint" style="margin-top:12px">Sans heure de naissance, la Lune et parfois le type peuvent changer : seuls les éléments les plus stables sont à retenir.</p>' : ''}`;

  const chans = ch.channels.map(([a, c]) => { const k = CHANNEL_TXT[`${a}-${c}`] || CHANNEL_TXT[`${c}-${a}`]; return `<div><span class="mono">${a}–${c}</span><span><b>${k[0]}</b> : ${k[1]}</span></div>`; }).join('') || '<p class="muted">Aucun canal défini : tu captes et amplifies l\'énergie des autres.</p>';
  const centers = Object.keys(CENTER_TXT).map(c => { const on = ch.defined.includes(c), t = CENTER_TXT[c]; return `<div class="center ${on ? 'on' : ''}"><b>${t[0]}<small>${on ? 'Défini' : 'Ouvert'}</small></b><span>${on ? t[1] : t[2]}</span></div>`; }).join('');
  const rows = BODY_LABELS.map(([k, sym, n]) => `<tr><td class="d mono">${ch.des[k].gate}.${ch.des[k].line}</td><td>${sym} ${n}</td><td class="mono">${ch.pers[k].gate}.${ch.pers[k].line}</td></tr>`).join('');
  $('#chartDetails').innerHTML = `
    <div class="details">
      <div class="block full hdbiz-head"><p class="eyebrow">Ton Human Design au service de ton business</p><h4>Tes 4 clés pour entreprendre à ta façon</h4><p class="muted">Chaque carte explique ce que cet élément change concrètement dans ta manière de travailler, de trouver des clients, de décider et de vendre.</p></div>
      ${hdCards(ch, S.birth.unknown).map(c => `<div class="block key"><div class="key-top"><span class="key-n">${c.n}</span><div><p class="eyebrow">${c.label}</p><h4>${c.title}</h4></div></div><p class="k-ess">${c.what}</p><div class="k-rows"><div><span class="k-lab">Business</span><p>${lead(c.why)}</p></div><div><span class="k-lab">À faire</span><p>${lead(c.evolve)}</p></div>${c.trap ? `<div><span class="k-lab warn">Alerte</span><p>${c.trap}</p></div>` : ''}</div></div>`).join('')}
      <div class="block full"><p class="eyebrow">Tes talents innés</p><h4>${ch.channels.length} canal${ch.channels.length > 1 ? 'aux' : ''} défini${ch.channels.length > 1 ? 's' : ''}</h4><div class="chan">${chans}</div></div>
      <div class="block full"><p class="eyebrow">Tes 9 centres</p><div class="centers">${centers}</div></div>
      <div class="block full"><details><summary>Positions planétaires (portes et lignes)</summary><div class="table-scroll" style="margin-top:10px"><table><thead><tr><th>Design</th><th>Planète</th><th>Personnalité</th></tr></thead><tbody>${rows}</tbody></table></div></details></div>
    </div>`;
}

/* ---------- wizard ---------- */
const MODS = [
  { k: 'riasec', t: 'Tes intérêts', d: 'À quel point ces activités te plaisent-elles, même si tu ne sais pas encore les faire ? (1 = pas du tout, 5 = énormément)' },
  { k: 'skills', t: 'Tes compétences', d: 'Indique ton niveau actuel pour chaque compétence.' },
  { k: 'open', t: 'Ton énergie', d: 'Quelques mots suffisent. Ces réponses nourrissent les idées personnalisées.' },
  { k: 'values', t: 'Tes valeurs', d: 'Choisis 5 valeurs, de la plus importante à la moins importante : l\'ordre de tes clics fait le classement.' },
  { k: 'style', t: 'Ton style de travail', d: 'Choisis la proposition qui te ressemble le plus.' },
  { k: 'cons', t: 'Tes contraintes', d: 'Elles servent à écarter les idées irréalistes pour toi aujourd\'hui.' },
  { k: 'ideas', t: 'Tes idées', d: 'Tes envies actuelles, et ce que tu ne veux surtout pas faire.' }
];
function modDone(i) {
  const a = S.ans;
  switch (MODS[i].k) {
    case 'riasec': return a.riasec.every(v => v > 0);
    case 'skills': return SKILLS.every(([, l]) => l.every(([k]) => a.skills[k] !== undefined));
    case 'open': return OPEN_Q.some(([k]) => (a.open[k] || '').trim());
    case 'values': return a.values.length === 5;
    case 'style': return a.style.every(Boolean);
    case 'cons': return CONSTRAINTS.every(([k]) => a.cons[k] !== undefined);
    case 'ideas': return true;
  }
}
function renderWizard() {
  const a = S.ans, m = MODS[step];
  const doneCount = MODS.filter((_, i) => modDone(i)).length;
  let body = '';
  if (m.k === 'riasec') {
    body = `<div class="scale-note"><span>1 Pas du tout</span><span>5 Énormément</span></div><div class="likert">` + RIASEC_Q.map(([, q], i) =>
      `<div class="lk"><span>${q}</span><div class="dots" role="group" aria-label="${esc(q)}">${[1, 2, 3, 4, 5].map(v => `<button type="button" data-r="${i}" data-v="${v}" class="${a.riasec[i] === v ? 'on' : ''}" aria-pressed="${a.riasec[i] === v}">${v}</button>`).join('')}</div></div>`).join('') + '</div>';
  } else if (m.k === 'skills') {
    body = SKILLS.map(([g, l]) => `<div class="skill-group"><h4>${g}</h4>${l.map(([k, n]) => `<div class="sk"><span>${n}</span><div class="seg" role="group" aria-label="${esc(n)}">${SKILL_LEVELS.map((lv, v) => `<button type="button" data-s="${k}" data-v="${v}" class="${a.skills[k] === v ? 'on' : ''}" aria-pressed="${a.skills[k] === v}">${lv}</button>`).join('')}</div></div>`).join('')}</div>`).join('');
  } else if (m.k === 'open') {
    body = `<div class="qgrid">${OPEN_Q.map(([k, q]) => `<label for="o-${k}">${q}<textarea id="o-${k}" data-o="${k}">${esc(a.open[k] || '')}</textarea></label>`).join('')}</div>`;
  } else if (m.k === 'values') {
    body = `<div class="chips">${VALUES.map(([k, n]) => { const i = a.values.indexOf(k); return `<button type="button" class="chip ${i > -1 ? 'on' : ''}" data-val="${k}" aria-pressed="${i > -1}">${i > -1 ? `<span class="n">${i + 1}</span>` : ''}${n}</button>`; }).join('')}</div><p class="hint" style="margin-top:10px">${a.values.length}/5 choisies. Clique à nouveau sur une valeur pour la retirer.</p>`;
  } else if (m.k === 'style') {
    body = STYLE_Q.map(([q, x, y], i) => `<div class="pair"><span>${q}</span><div class="seg" role="group" aria-label="${esc(q)}"><button type="button" data-st="${i}" data-v="a" class="${a.style[i] === 'a' ? 'on' : ''}" aria-pressed="${a.style[i] === 'a'}">${x}</button><button type="button" data-st="${i}" data-v="b" class="${a.style[i] === 'b' ? 'on' : ''}" aria-pressed="${a.style[i] === 'b'}">${y}</button></div></div>`).join('');
  } else if (m.k === 'cons') {
    body = CONSTRAINTS.map(([k, q, opts]) => `<div class="pair"><span>${q}</span><div class="chips">${opts.map((o, v) => `<button type="button" class="chip ${a.cons[k] === v ? 'on' : ''}" data-c="${k}" data-v="${v}" aria-pressed="${a.cons[k] === v}">${o}</button>`).join('')}</div></div>`).join('');
  } else {
    body = `<div class="qgrid"><label for="fIdeas">As-tu déjà des idées de projet ? Liste-les, même farfelues.<textarea id="fIdeas" data-f="ideas">${esc(a.ideas)}</textarea></label><label for="fExcl">Y a-t-il un domaine dans lequel tu ne veux surtout pas travailler ?<input type="text" id="fExcl" data-f="excl" value="${esc(a.excl)}"></label></div>`;
  }
  $('#wizard').innerHTML = `
    <div class="progress" role="tablist">${MODS.map((x, i) => `<button type="button" data-step="${i}" class="${i === step ? 'cur' : ''} ${modDone(i) ? 'done' : ''}" role="tab" aria-selected="${i === step}">${i + 1}. ${x.t}</button>`).join('')}</div>
    <div class="bar" aria-hidden="true"><span style="width:${doneCount / MODS.length * 100}%"></span></div>
    <div class="mod-head"><h3>${m.t}</h3><p class="muted">${m.d}</p></div>
    <div>${body}</div>
    <div class="wiz-nav">
      <button type="button" class="btn ghost" id="prev" ${step === 0 ? 'disabled' : ''}>Précédent</button>
      ${step < MODS.length - 1 ? '<button type="button" class="btn" id="next">Module suivant</button>' : '<button type="button" class="btn" id="finish">Voir mes pistes</button>'}
    </div>`;
}
function leaveExample() {
  if (!S.example) return;
  S.example = false; S.ans = blankAns();
  renderNotice();
}
$('#wizard').addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  const a = S.ans;
  if (t.dataset.step !== undefined) { step = +t.dataset.step; renderWizard(); return; }
  if (t.id === 'prev') { step--; renderWizard(); $('#bilan').scrollIntoView(); return; }
  if (t.id === 'next') { step++; renderWizard(); $('#bilan').scrollIntoView(); return; }
  if (t.id === 'finish') { renderCompass(); $('#pistes').scrollIntoView(); return; }
  const wasEx = S.example;
  if (wasEx) leaveExample();
  if (t.dataset.r !== undefined) a.riasec[+t.dataset.r] = +t.dataset.v;
  else if (t.dataset.s) a.skills[t.dataset.s] = +t.dataset.v;
  else if (t.dataset.val) { const k = t.dataset.val, i = a.values.indexOf(k); if (i > -1) a.values.splice(i, 1); else if (a.values.length < 5) a.values.push(k); }
  else if (t.dataset.st !== undefined) a.style[+t.dataset.st] = t.dataset.v;
  else if (t.dataset.c) a.cons[t.dataset.c] = +t.dataset.v;
  save();
  const y = window.scrollY; renderWizard(); renderCompass(); window.scrollTo(0, y);
});
$('#wizard').addEventListener('input', e => {
  const t = e.target;
  if (S.example) { const v = t.value; leaveExample(); renderWizard(); renderCompass(); const n = document.getElementById(t.id); if (n) { n.value = v; n.focus(); } }
  const el = document.getElementById(t.id) || t;
  if (el.dataset.o) S.ans.open[el.dataset.o] = el.value;
  if (el.dataset.f) S.ans[el.dataset.f] = el.value;
  save();
});
$('#wizard').addEventListener('change', () => renderCompass());

/* ---------- scoring ---------- */
function riasecScores() {
  const s = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  RIASEC_Q.forEach(([l], i) => { s[l] += S.ans.riasec[i] || 0; });
  return s;
}
function scoreIdeas() {
  const a = S.ans, rs = riasecScores();
  const type = S.chart?.type;
  const c = { time: a.cons.time ?? 2, budget: a.cons.budget ?? 2, revenue: a.cons.revenue ?? 3, place: a.cons.place ?? 2 };
  const exclWords = (a.excl || '').toLowerCase().split(/[^a-zà-ÿ]+/).filter(w => w.length > 3);
  const rw = [1, .8, .6, .4, .3];
  return IDEAS.map(([t, d, r, sk, vals, bmin, fast, async, loc, model, stepTxt, price]) => {
    if (bmin > c.budget) return null;
    if (c.place === 0 && loc === 'local') return null;
    const txt = (t + ' ' + d).toLowerCase();
    if (exclWords.some(w => txt.includes(w.slice(0, Math.max(4, w.length - 1))))) return null;
    const skill = sk.reduce((s, k) => s + (a.skills[k] || 0) / 3, 0) / sk.length;
    const inter = r.split('').reduce((s, l) => s + Math.max(0, rs[l] - 5) / 20, 0) / r.length;
    let val = 0; a.values.forEach((v, i) => { if (vals.includes(v)) val += rw[i]; }); val = Math.min(1, val / 1.6);
    let sty = type ? MODEL_FIT[type][model] : .7;
    if (a.style[7] === 'a' && (model === 'service' || model === 'conseil')) sty += .15;
    if (a.style[7] === 'b' && ['produit', 'contenu', 'communaute'].includes(model)) sty += .15;
    if (a.style[6] === 'a' && loc !== 'online') sty += .05;
    if (a.style[6] === 'b' && loc === 'online') sty += .05;
    sty = Math.min(1, sty);
    let feas = 1;
    if (c.time === 0 && !async) feas *= .4;
    if (c.revenue === 0 && !fast) feas *= .5;
    if (c.place === 1 && loc === 'online') feas *= .6;
    const parts = { 'Compétences': skill, 'Intérêts': inter, 'Valeurs': val, 'Style': sty, 'Faisabilité': feas };
    const total = Math.round(30 * skill + 25 * inter + 15 * val + 15 * sty + 15 * feas);
    return { t, d, r, model, stepTxt, price, parts, total, fast, async, loc };
  }).filter(Boolean).sort((x, y) => y.total - x.total);
}

function renderNotice() {
  const done = MODS.filter((_, i) => modDone(i)).length;
  if (!S.example && done < MODS.length) { $('#exampleNotice').innerHTML = `<div class="notice" style="margin-bottom:16px"><span>Ton bilan est complété à ${done}/${MODS.length} modules : tes pistes s'affinent à chaque réponse.</span><a class="btn ghost" href="#bilan">Continuer mon bilan</a></div>`; return; }
  $('#exampleNotice').innerHTML = S.example ? `<div class="notice" style="margin-bottom:16px"><span><span class="tag ex">Exemple</span> Ces pistes sont celles de Camille, un profil fictif. Remplis ta charte et ton bilan pour voir les tiennes.</span><a class="btn ghost" href="#bilan">Commencer mon bilan</a></div>` : '';
}

function renderCompass() {
  renderNotice();
  if (!unlocked()) { LAST_RULE = scoreIdeas().slice(0, 4); $('#compass').innerHTML = paywallHTML(); $('#compass').classList.add('is-locked'); if ($('#recapBox')) renderRecap(); return; }
  $('#compass').classList.remove('is-locked');
  const a = S.ans, rs = riasecScores();
  const answered = a.riasec.filter(Boolean).length;
  const order = Object.keys(rs).sort((x, y) => rs[y] - rs[x]);
  const code = answered >= 12 ? order.slice(0, 3).join('') : '···';
  const top = new Set(order.slice(0, 3));
  const bars = Object.keys(RIASEC).map(l => `<div class="rb ${top.has(l) && answered >= 12 ? 'top' : ''}"><span>${RIASEC[l][0]}</span><div class="track"><span style="width:${Math.max(0, rs[l] - 5) / 20 * 100}%"></span></div><span class="v">${rs[l] || 0}</span></div>`).join('');
  const strong = SKILLS.flatMap(([, l]) => l).filter(([k]) => (a.skills[k] || 0) >= 2).sort((x, y) => (a.skills[y[0]] || 0) - (a.skills[x[0]] || 0));
  const vals = a.values.map(v => VALUES.find(x => x[0] === v)[1]);
  const T = S.chart ? TYPES[S.chart.type] : null;
  const ideas = scoreIdeas().slice(0, 4);
  const ideaCards = ideas.map((x, i) => `
    <article class="idea">
      <div class="idea-top"><div><p class="eyebrow">Piste ${i + 1}</p><h4>${x.t}</h4></div><div class="score"><b class="mono">${x.total}</b><small>sur 100</small></div></div>
      <p>${x.d}</p>
      <div class="meta"><span class="pill">${MODEL_LABEL[x.model]}</span><span class="pill">${x.price}</span><span class="pill">${x.loc === 'online' ? 'En ligne' : x.loc === 'local' ? 'Local' : 'En ligne ou local'}</span>${x.fast ? '<span class="pill">Revenu rapide possible</span>' : ''}</div>
      <div class="breakdown">${Object.entries(x.parts).map(([k, v]) => `<div>${k}<i><span style="width:${Math.round(v * 100)}%"></span></i></div>`).join('')}</div>
      ${T ? `<p class="why"><b>Avec ton type ${T.name} :</b> ${fitTip(S.chart.type, x.model)}</p>` : ''}
      <p class="firststep"><b>Premier pas cette semaine :</b> ${x.stepTxt}</p>
      ${pickBtn(x.t, `rule:${i}`)}
    </article>`).join('');
  LAST_RULE = ideas;
  $('#compass').innerHTML = `
    <aside class="card profile-card">
      <div><p class="eyebrow">Ton code d'intérêts</p><div class="holland"><b>${code}</b><span class="muted">${answered < 30 ? `${answered}/30 réponses` : order.slice(0, 3).map(l => RIASEC[l][0]).join(' · ')}</span></div></div>
      <div class="rbars">${bars}</div>
      <div class="mini"><h4>Compétences fortes</h4><div>${strong.length ? strong.map(([, n]) => `<span class="pill">${n}</span>`).join('') : '<span class="muted">À compléter dans le module 2.</span>'}</div></div>
      <div class="mini"><h4>Valeurs prioritaires</h4><div>${vals.length ? vals.map((v, i) => `<span class="pill">${i + 1}. ${v}</span>`).join('') : '<span class="muted">À compléter dans le module 4.</span>'}</div></div>
      <div class="mini"><h4>Ton fonctionnement</h4><div>${T ? `<span class="pill">${T.name}</span><span class="pill">${S.birth.unknown ? 'Autorité à confirmer' : 'Autorité ' + AUTH[S.chart.authority][0].toLowerCase()}</span><span class="pill">Profil ${S.chart.profile}</span>` : '<span class="muted">Calcule ta charte à l\'étape 1.</span>'}</div></div>
    </aside>
    <div class="ideas">
      ${ideaCards || '<div class="card"><p>Aucune piste ne correspond à tes contraintes actuelles. Essaie d\'élargir le budget ou le lieu dans le module 6.</p></div>'}
      <div class="ai-box" id="aiBox">
        <div><p class="eyebrow">Aller plus loin</p><h3 style="font-size:1.25rem;font-weight:400;margin-top:4px">Des idées 100 % sur mesure</h3><p class="muted" style="margin-top:4px">Notre IA lit toutes tes réponses, y compris tes textes libres, et propose 4 projets inédits avec offre, clientèle et prix.</p></div>
        <div><button type="button" class="btn" id="aiGo">Générer mes idées sur mesure</button></div>
        <p class="ai-status" id="aiStatus" aria-live="polite"></p>
        <div class="ideas" id="aiOut"></div>
      </div>
    </div>`;
  setupAI();
  if ($('#recapBox')) renderRecap();
}
function fitTip(type, model) {
  const t = {
    generator: { service: 'une prestation régulière nourrit ton énergie durable, à condition que le métier t\'allume.', conseil: 'garde des formats réguliers que tu aimes animer, plutôt que des missions ponctuelles épuisantes.', produit: 'crée le produit en répondant aux demandes concrètes de ton public.', contenu: 'publie sur ce qui te passionne vraiment, la régularité viendra seule.', communaute: 'anime un rendez-vous récurrent que tu prends plaisir à tenir.', commerce: 'vends ce que tu aimes fabriquer ou recommander.' },
    mg: { service: 'propose plusieurs formats et ajuste vite selon les retours.', conseil: 'garde des missions courtes et variées pour éviter l\'ennui.', produit: 'teste vite plusieurs petits produits et garde ceux qui marchent.', contenu: 'ta polyvalence est un atout : plusieurs formats, plusieurs canaux.', communaute: 'tu peux lancer vite, préviens tes membres quand tu fais évoluer le format.', commerce: 'lance, teste, ajuste : ton rythme rapide est un avantage.' },
    projector: { service: 'limite le nombre de clients et vends ton regard plus que ton temps.', conseil: 'c\'est ton terrain naturel : guide, audite, conseille peu de clients bien payés.', produit: 'appuie-toi sur ta méthode et laisse le produit travailler à ta place.', contenu: 'montre ton expertise pour être reconnu·e et invité·e.', communaute: 'sois le guide de la communauté plutôt que son animateur à plein temps.', commerce: 'délègue la logistique pour garder ton énergie pour la stratégie.' },
    manifestor: { service: 'cadre bien tes disponibilités et informe tes clients de ton rythme.', conseil: 'interviens au démarrage des projets, là où ton impulsion compte.', produit: 'tu lances, d\'autres peuvent ensuite faire vivre le produit.', contenu: 'annonce tes projets à ton audience : elle te suivra.', communaute: 'initie le mouvement puis confie l\'animation à d\'autres.', commerce: 'fonde la marque et délègue l\'exécution au quotidien.' },
    reflector: { service: 'choisis des clients et des lieux qui te font du bien.', conseil: 'ton regard sur la santé d\'un groupe est rare, valorise-le.', produit: 'prends un cycle lunaire pour valider l\'idée avant de te lancer.', contenu: 'parle de ce que tu observes chez les autres : c\'est ton talent.', communaute: 'tu es fait·e pour sentir et refléter un collectif.', commerce: 'entoure-toi bien et laisse mûrir chaque décision.' }
  };
  return t[type][model];
}

/* ---------- Claude ---------- */
let sampleFn = null, aiCtl = null, aiCache = null;
sampleFn = { json: async (prompt, opts = {}) => {
  let r;
  try { r = await fetch('/api/claude', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, token: S.token || '' }), signal: opts.signal }); }
  catch (e) { throw { code: e && e.name === 'AbortError' ? 'cancelled' : 'upstream_error' }; }
  if (r.status === 402) throw { code: 'locked' };
  if (r.status === 429) throw { code: 'rate_limited' };
  if (!r.ok) throw { code: 'upstream_error' };
  const d = await r.json(); if (d.data === undefined) throw { code: 'invalid_json' }; return d.data;
} };
function setupAI() {
  const box = $('#aiBox'); if (!box) return;
  box.hidden = !sampleFn;
  if (aiCache) renderAI(aiCache);
  const go = $('#aiGo'); if (go) go.onclick = runAI;
}
function profileText() {
  const a = S.ans, rs = riasecScores();
  const order = Object.keys(rs).sort((x, y) => rs[y] - rs[x]);
  const ch = S.chart;
  const skills = SKILLS.flatMap(([, l]) => l).map(([k, n]) => `${n}: ${SKILL_LEVELS[a.skills[k] || 0]}`).join('; ');
  const cons = CONSTRAINTS.map(([k, q, o]) => `${q}: ${a.cons[k] !== undefined ? o[a.cons[k]] : 'non renseigné'}`).join('; ');
  const style = STYLE_Q.map(([q, x, y], i) => `${q}: ${a.style[i] === 'a' ? x : a.style[i] === 'b' ? y : '?'}`).join('; ');
  return [
    ch ? `Human Design: type ${TYPES[ch.type].name}, stratégie « ${TYPES[ch.type].strat} », autorité ${S.birth.unknown ? 'inconnue (heure manquante)' : AUTH[ch.authority][0]}, profil ${ch.profile}, centres définis: ${ch.defined.map(c => CENTER_TXT[c][0]).join(', ') || 'aucun'}, canaux: ${ch.channels.map(([x, y]) => (CHANNEL_TXT[`${x}-${y}`] || CHANNEL_TXT[`${y}-${x}`])[0]).join(', ') || 'aucun'}.` : 'Human Design: non calculé.',
    `Intérêts RIASEC (sur 25): ${order.map(l => `${RIASEC[l][0]} ${rs[l]}`).join(', ')}.`,
    `Compétences: ${skills}.`,
    `Valeurs (ordre d'importance): ${a.values.map(v => VALUES.find(x => x[0] === v)[1]).join(', ') || 'non renseignées'}.`,
    `Style: ${style}.`, `Contraintes: ${cons}.`,
    ...OPEN_Q.map(([k, q]) => `${q} ${a.open[k] || '—'}`),
    `Idées déjà envisagées: ${a.ideas || '—'}.`, `Domaines exclus: ${a.excl || '—'}.`
  ].join('\n');
}
async function runAI() {
  if (!sampleFn) return;
  const go = $('#aiGo'), st = $('#aiStatus');
  aiCtl?.abort(); aiCtl = new AbortController();
  go.disabled = true; st.textContent = 'Analyse de ton profil en cours… (cela peut prendre une minute)';
  const prompt = `Tu es conseiller en création d'entreprise, bienveillant et concret. Voici le profil d'une personne qui cherche son « business passion » :\n\n${profileText()}\n\nPropose 4 idées de business réalistes, variées et vraiment personnalisées (appuie-toi sur ses textes libres, ses compétences fortes et ses intérêts). Respecte toutes ses contraintes de budget, de temps, de revenu et de lieu, et n'utilise jamais un domaine exclu. Le Human Design sert seulement à adapter la manière de travailler et de vendre ; présente-le comme une piste de réflexion, jamais comme une certitude.\n\nRéponds uniquement avec un tableau JSON de 4 objets, en français, tutoiement, avec ces clés : "titre" (court), "concept" (1 phrase), "clients" (qui achète), "offre" (l'offre de départ et son prix indicatif en euros), "pourquoi" (1 à 2 phrases reliant l'idée à son profil), "risque" (1 phrase), "premier_pas" (une action réalisable en 7 jours, sans argent), "score" (entier de 0 à 100 pour l'alignement).`;
  try {
    const res = await sampleFn.json(prompt, { signal: aiCtl.signal, cache: false });
    if (!Array.isArray(res)) throw { code: 'invalid_json' };
    aiCache = res; st.textContent = ''; renderAI(res);
  } catch (e) {
    const msg = { locked: 'Les idées sur mesure sont incluses dans l\'accès complet.', not_granted: 'Tu n\'as pas autorisé cette page à utiliser Claude.', sampling_disabled: 'Claude n\'est pas disponible pour ce compte.', rate_limited: 'Trop de demandes pour le moment. Réessaie dans quelques minutes.', invalid_json: 'La réponse était incomplète. Clique à nouveau pour réessayer.', cancelled: '' };
    st.textContent = msg[e.code] ?? 'La génération a été interrompue. Clique à nouveau pour réessayer.';
    if (['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled'].includes(e.code)) go.hidden = true;
  } finally { go.disabled = false; }
}
function renderAI(list) {
  const out = $('#aiOut'); if (!out) return;
  out.innerHTML = list.slice(0, 4).map((x, i) => `
    <article class="idea">
      <div class="idea-top"><div><p class="eyebrow">Idée sur mesure ${i + 1}</p><h4>${esc(x.titre)}</h4></div><div class="score"><b class="mono">${esc(Math.round(Number(x.score) || 0))}</b><small>sur 100</small></div></div>
      <p>${esc(x.concept)}</p>
      <p class="why"><b>Clients :</b> ${esc(x.clients)}</p>
      <p class="why"><b>Offre de départ :</b> ${esc(x.offre)}</p>
      <p class="why"><b>Pourquoi toi :</b> ${esc(x.pourquoi)}</p>
      <p class="why muted"><b>Point de vigilance :</b> ${esc(x.risque)}</p>
      <p class="firststep"><b>Premier pas cette semaine :</b> ${esc(x.premier_pas)}</p>
      ${pickBtn(String(x.titre), `ai:${i}`)}
    </article>`).join('');
  const go = $('#aiGo'); if (go) go.textContent = 'Proposer d\'autres idées';
}

/* ---------- Human Design : 4 clés business ---------- */
function hdCards(ch, unknown) {
  const T = TYPES[ch.type], TB = TYPE_BIZ[ch.type], SB = STRAT_BIZ[ch.type], A = AUTH[ch.authority];
  const [l1, l2] = ch.profile.split('/');
  return [
    { n: 1, label: 'Ton type', title: `${T.name} · ${TB[0]}`, what: T.desc, why: TB[1], evolve: TB[2], trap: TB[3] },
    { n: 2, label: 'Ta stratégie', title: T.strat, what: "Ta stratégie est ta façon naturelle d'entrer dans les projets et de rencontrer les bonnes opportunités, sans forcer.", why: SB[0], evolve: SB[1] },
    unknown
      ? { n: 3, label: 'Ton autorité', title: 'À confirmer', what: "Ton autorité dépend de ton heure de naissance. Retrouve-la sur ton acte de naissance pour la connaître.", why: "En attendant, ne prends aucune grande décision business dans l'urgence : laisse-toi au moins une nuit.", evolve: "Complète ton heure de naissance dès que possible." }
      : { n: 3, label: 'Ton autorité', title: A[0], what: A[1], why: AUTH_BIZ[ch.authority], evolve: "Applique cette méthode à chaque décision importante : nouvelle offre, prix, client, associé, investissement." },
    unknown
      ? { n: 4, label: 'Ton profil', title: 'À confirmer', what: "Ton profil dépend de ton heure de naissance.", why: "Il indique comment tu attires tes clients et ce qu'ils attendent de toi.", evolve: "Complète ton heure de naissance pour le découvrir." }
      : { n: 4, label: 'Ton profil', title: `${ch.profile} · ${LINES[l1][0]} / ${LINES[l2][0]}`, what: `Ton profil décrit ton rôle et la façon dont les autres te perçoivent : ${LINES[l1][0].toLowerCase()} côté conscient, ${LINES[l2][0].toLowerCase()} côté inconscient.`, why: `${LINE_BIZ[l1]} ${LINE_BIZ[l2]}`, evolve: `${LINES[l1][1]} ${LINES[l2][1]}` }
  ];
}

/* ---------- offre et récap ---------- */
let LAST_RULE = [];
function pickBtn(title, ref) {
  const chosen = S.offer && S.offer.title0 === title;
  return `<div><button type="button" class="btn ${chosen ? '' : 'ghost'}" data-pick="${ref}" aria-pressed="${chosen}">${chosen ? 'Piste choisie ✓' : 'Choisir cette piste'}</button></div>`;
}
function offerFromRule(x) {
  return { title0: x.t, name: x.t, client: '', promise: x.d, format: `${MODEL_LABEL[x.model]}, ${x.loc === 'online' ? 'en ligne' : x.loc === 'local' ? 'en local' : 'en ligne ou en local'}`, price: x.price, step: x.stepTxt, score: x.total };
}
function offerFromAI(x) {
  return { title0: String(x.titre), name: String(x.titre || ''), client: String(x.clients || ''), promise: String(x.concept || ''), format: String(x.offre || ''), price: '', step: String(x.premier_pas || ''), score: Math.round(Number(x.score) || 0) };
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-pick]'); if (!t) return;
  const [src, i] = t.dataset.pick.split(':');
  const x = src === 'rule' ? LAST_RULE[+i] : aiCache?.[+i];
  if (!x) return;
  S.offer = src === 'rule' ? offerFromRule(x) : offerFromAI(x);
  save(); renderCompass(); renderRecap();
  $('#recap').scrollIntoView();
});
function currentOffer() {
  if (S.offer) return S.offer;
  if (S.example && LAST_RULE[0]) return Object.assign(offerFromRule(LAST_RULE[0]), { client: 'Femmes de 30 à 45 ans en reconversion professionnelle' });
  return null;
}
const OFFER_FIELDS = [
  ['name', "Nom de ton offre", "Ex. : Le cap de la reconversion", false],
  ['client', 'Pour qui ? (ton client idéal)', 'Ex. : femmes de 30 à 45 ans qui veulent quitter leur emploi', false],
  ['promise', 'Le résultat que tu promets', 'Ex. : repartir avec un projet clair en 6 semaines', true],
  ['format', 'Format et durée', 'Ex. : 6 séances individuelles en visio', false],
  ['price', 'Prix de lancement', 'Ex. : 390 € les 6 séances', false],
  ['step', 'Ton premier pas cette semaine', '', true]
];
function plan(o) {
  const ch = S.chart, unk = S.birth.unknown;
  const decide = ch && !unk ? AUTH_BIZ[ch.authority] : "Laisse-toi au moins une nuit avant de valider.";
  const launch = ch ? STRAT_BIZ[ch.type][1] : "Présente ton offre simplement, à des personnes réelles.";
  const find = ch ? STRAT_BIZ[ch.type][0] : "Parle de ton offre autour de toi et sur un réseau social.";
  const evolve = ch ? TYPE_BIZ[ch.type][2] : "Garde ce qui te donne de l'énergie, change le reste.";
  return [
    ['Semaine 1', 'Clarifier et valider', `Écris ton offre en une phrase et valide-la avec ton autorité. ${decide}`],
    ['Semaine 2', 'Tester', `${o.step || 'Présente ton offre à 10 personnes de ta cible.'} ${launch}`],
    ['Semaine 3', 'Trouver tes 3 premiers clients', `Propose ton offre au prix de lancement. ${find}`],
    ['Semaine 4', 'Ajuster et décider la suite', `Recueille les retours, ajuste l'offre et le prix. ${evolve}`]
  ];
}
function recapData() {
  const o = currentOffer(); if (!o) return null;
  const a = S.ans, rs = riasecScores(), ch = S.chart, unk = S.birth.unknown;
  const order = Object.keys(rs).sort((x, y) => rs[y] - rs[x]);
  return {
    o, ch, unk,
    name: S.birth.name || '',
    date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    code: a.riasec.filter(Boolean).length >= 12 ? order.slice(0, 3).map(l => RIASEC[l][0]).join(' · ') : '',
    skills: SKILLS.flatMap(([, l]) => l).filter(([k]) => (a.skills[k] || 0) >= 2).map(([, n]) => n),
    values: a.values.map(v => VALUES.find(x => x[0] === v)[1]),
    keys: ch ? hdCards(ch, unk) : [],
    ex: S.experts || {},
    plan: plan(o)
  };
}
function recapDocHTML(d) {
  const o = d.o;
  return `
  <header class="rc-head"><p class="rc-eyebrow">Ma Boussole Business · récap du ${d.date}</p><h2>${d.name ? esc(d.name) + ', ton' : 'Ton'} business passion</h2><p class="rc-angle">${esc(o.name || 'Ton offre')}${o.client ? ' pour ' + esc(o.client.charAt(0).toLowerCase() + o.client.slice(1)) : ''}</p></header>
  ${d.ex.synth ? `<section class="rc-sec"><h3>Ta vision</h3><p class="rc-vision">${esc(d.ex.synth.vision)}</p><p>${esc(d.ex.synth.pourquoi_toi)}</p>${(d.ex.synth.priorites || []).length ? `<p class="rc-w" style="margin-top:10px">Tes 3 priorités</p><ol class="rc-plan">${li(d.ex.synth.priorites)}</ol>` : ''}</section>` : ''}
  <section class="rc-sec"><h3>Ton offre de lancement</h3><dl class="rc-dl">
    <div><dt>Pour qui</dt><dd>${esc(o.client) || '<span class="rc-empty">À préciser</span>'}</dd></div>
    <div><dt>Résultat promis</dt><dd>${esc(o.promise) || '<span class="rc-empty">À préciser</span>'}</dd></div>
    <div><dt>Format</dt><dd>${esc(o.format) || '<span class="rc-empty">À préciser</span>'}</dd></div>
    <div><dt>Prix de lancement</dt><dd>${esc(o.price) || '<span class="rc-empty">À préciser</span>'}</dd></div>
  </dl></section>
  ${d.ex.mkt ? `<section class="rc-sec"><h3>Ton positionnement</h3><p class="rc-vision">${esc(d.ex.mkt.positionnement)}</p>${d.ex.mkt.pitch ? `<p><b>Ton pitch :</b> ${esc(d.ex.mkt.pitch)}</p>` : ''}${(d.ex.mkt.canaux || []).length ? `<p><b>Tes canaux :</b> ${(d.ex.mkt.canaux || []).map(c => esc(c.canal)).join(', ')}</p>` : ''}</section>` : ''}
  ${d.keys.length ? `<section class="rc-sec"><h3>Ton Human Design au service de ton business</h3><div class="rc-keys">${d.keys.map(k => `<div class="rc-key"><p class="rc-k-label">${k.label}</p><p class="rc-k-title">${k.title}</p><p>${k.why}</p></div>`).join('')}</div></section>` : ''}
  <section class="rc-sec"><h3>Tes ressources</h3><dl class="rc-dl">
    ${d.code ? `<div><dt>Intérêts dominants</dt><dd>${d.code}</dd></div>` : ''}
    <div><dt>Compétences fortes</dt><dd>${d.skills.join(', ') || '<span class="rc-empty">Bilan à compléter</span>'}</dd></div>
    <div><dt>Valeurs</dt><dd>${d.values.join(', ') || '<span class="rc-empty">Bilan à compléter</span>'}</dd></div>
  </dl></section>
  <section class="rc-sec"><h3>Tes 30 premiers jours</h3><ol class="rc-plan">${d.plan.map(([w, t, x]) => `<li><p class="rc-w">${w} · <b>${t}</b></p><p>${esc(x)}</p></li>`).join('')}</ol></section>
  ${d.ex.synth && (d.ex.synth.feuille_de_route || []).length ? `<section class="rc-sec"><h3>Ta feuille de route sur 90 jours</h3><div class="rc-keys">${d.ex.synth.feuille_de_route.map(m => `<div class="rc-key"><p class="rc-k-label">${esc(m.mois)}</p><p class="rc-k-title">${esc(m.objectif)}</p><ul class="rc-ul">${li(m.actions)}</ul></div>`).join('')}</div>${d.ex.synth.indicateur ? `<p style="margin-top:10px"><b>Ton indicateur de réussite :</b> ${esc(d.ex.synth.indicateur)}</p>` : ''}</section>` : ''}
  ${d.ex.mind?.phrase_ancre ? `<p class="rc-vision" style="margin-top:16px">« ${esc(d.ex.mind.phrase_ancre)} »</p>` : ''}
  <p class="rc-foot">Le Human Design est une grille de lecture de soi, pas une science validée : garde ce qui te parle et teste-le dans la réalité.</p>`;
}
function recapText(d) {
  const o = d.o, L = [];
  L.push(`MON RÉCAP BUSINESS PASSION — ${d.date}`, '');
  if (d.ex.synth) { L.push('MA VISION', d.ex.synth.vision || '', d.ex.synth.pourquoi_toi || ''); (d.ex.synth.priorites || []).forEach((p, i) => L.push(`${i + 1}. ${p}`)); L.push(''); }
  L.push(`Mon angle : ${o.name}${o.client ? ' pour ' + o.client : ''}`, '');
  L.push('MON OFFRE DE LANCEMENT', `- Pour qui : ${o.client || 'à préciser'}`, `- Résultat promis : ${o.promise || 'à préciser'}`, `- Format : ${o.format || 'à préciser'}`, `- Prix de lancement : ${o.price || 'à préciser'}`, '');
  if (d.keys.length) { L.push('MON HUMAN DESIGN AU SERVICE DE MON BUSINESS'); d.keys.forEach(k => L.push(`- ${k.label} : ${k.title}. ${k.why}`)); L.push(''); }
  L.push('MES RESSOURCES');
  if (d.code) L.push(`- Intérêts dominants : ${d.code}`);
  L.push(`- Compétences fortes : ${d.skills.join(', ') || 'à compléter'}`, `- Valeurs : ${d.values.join(', ') || 'à compléter'}`, '');
  if (d.ex.mkt) { L.push('', 'MON POSITIONNEMENT', d.ex.mkt.positionnement || ''); if (d.ex.mkt.pitch) L.push(`Pitch : ${d.ex.mkt.pitch}`); }
  L.push('', 'MES 30 PREMIERS JOURS'); d.plan.forEach(([w, t, x]) => L.push(`- ${w} — ${t} : ${x}`));
  if (d.ex.synth && (d.ex.synth.feuille_de_route || []).length) { L.push('', 'MA FEUILLE DE ROUTE SUR 90 JOURS'); d.ex.synth.feuille_de_route.forEach(m => { L.push(`${m.mois} — ${m.objectif}`); (m.actions || []).forEach(x => L.push(`  - ${x}`)); }); if (d.ex.synth.indicateur) L.push(`Indicateur de réussite : ${d.ex.synth.indicateur}`); }
  return L.join('\n');
}
const RECAP_CSS = `body{margin:0;background:#F4EDE1;color:#3A2819;font-family:Georgia,'Times New Roman',serif;line-height:1.55}
.doc{max-width:760px;margin:0 auto;padding:40px 24px}
.rc-head{border-bottom:2px solid #8A5A35;padding-bottom:18px;margin-bottom:8px}
.rc-eyebrow,.rc-k-label,dt,.rc-w{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#7A614B;font-weight:600;margin:0}
h2{font-size:32px;font-weight:400;margin:10px 0 6px}
.rc-angle{font-size:20px;font-style:italic;color:#8A5A35;margin:0}
.rc-sec{padding:18px 0;border-bottom:1px solid #D8C6AC;break-inside:avoid}
h3{font-size:19px;margin:0 0 12px}
.rc-dl{margin:0;display:grid;gap:10px}
.rc-dl div{display:grid;grid-template-columns:170px 1fr;gap:12px}
dd{margin:0}
.rc-keys{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.rc-key{background:#FBF7F1;border:1px solid #D8C6AC;border-radius:12px;padding:12px 14px}
.rc-key p{margin:0}
.rc-k-title{font-size:16px;font-weight:600;margin:4px 0 6px!important}
.rc-key p:last-child{font-size:14px}
.rc-plan{margin:0;padding-left:20px;display:grid;gap:10px}
.rc-plan p{margin:0}
.rc-empty{color:#7A614B;font-style:italic}
.rc-foot{font-size:13px;color:#7A614B;margin-top:18px}
.rc-vision{font-size:19px;font-style:italic;color:#8A5A35;margin:0 0 8px}
.rc-ul{margin:6px 0 0;padding-left:18px;font-size:14px}
@media (max-width:560px){.rc-dl div,.rc-keys{grid-template-columns:1fr}}
@media print{body{background:#fff}.doc{padding:0}}`;

let downloadsApi = null;
downloadsApi = { save: async ({ filename, data }) => { const url = URL.createObjectURL(new Blob([data], { type: 'text/html' })); const l = document.createElement('a'); l.href = url; l.download = filename; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); return { status: 'saved' }; } };

function renderRecap() {
  const box = $('#recapBox');
  $('#recap').hidden = !unlocked(); document.querySelector('a[href="#recap"].navl')?.toggleAttribute('hidden', !unlocked());
  if (!unlocked()) { box.innerHTML = ''; return; }
  const o = currentOffer();
  if (!o) {
    box.innerHTML = `<div class="card empty"><h3>Choisis d'abord une piste</h3><p class="muted">À l'étape 3, clique sur « Choisir cette piste » sous l'idée qui t'attire le plus. Tu pourras ensuite construire ton offre et recevoir ton récap.</p><div><a class="btn ghost" href="#pistes">Voir mes pistes</a></div></div>`;
    return;
  }
  box.innerHTML = `
    <div class="recap-grid">
      <div class="card offer-form">
        <div><p class="eyebrow">Construis ton offre</p><h3>Ton angle clair</h3><p class="muted" style="margin-top:4px">Pré-rempli à partir de ta piste. Modifie chaque champ avec tes mots : ton récap se met à jour en direct.</p></div>
        ${OFFER_FIELDS.map(([k, l, ph, big]) => `<label for="of-${k}">${l}${big ? `<textarea id="of-${k}" data-of="${k}" placeholder="${esc(ph)}">${esc(o[k])}</textarea>` : `<input type="text" id="of-${k}" data-of="${k}" placeholder="${esc(ph)}" value="${esc(o[k])}">`}</label>`).join('')}
      </div>
      <div class="recap-side">
        <div class="card recap-doc" id="recapDoc"></div>
        <div class="card recap-actions" id="recapActions"></div>
      </div>
    </div>`;
  renderRecapDoc(); renderRecapActions();
}
function renderRecapDoc() {
  const d = recapData(); const el = $('#recapDoc'); if (!d || !el) return;
  el.innerHTML = (S.example ? '<p style="margin-bottom:10px"><span class="tag ex">Exemple</span></p>' : '') + recapDocHTML(d);
}
function renderRecapActions() {
  const el = $('#recapActions'); if (!el) return;
  el.innerHTML = `
    <div><p class="eyebrow">Garder ton récap</p><h3>Reçois-le, imprime-le ou enregistre-le</h3></div>
    <form id="rcMailForm" class="mail-form" novalidate>
      <label for="rcMail">Ton adresse e-mail<input type="email" id="rcMail" autocomplete="email" placeholder="prenom@exemple.fr" value="${esc(S.email || '')}"></label>
      <div class="actions"><button type="submit" class="btn">Recevoir mon récap par e-mail</button><button type="button" class="btn ghost" id="rcDownload">Télécharger</button><button type="button" class="btn ghost" id="rcCopy">Copier le texte</button></div>
    </form>
    <p class="ai-status" id="rcStatus" aria-live="polite"></p>
    <ul class="howto">
      <li><b>Par e-mail</b> : ton récap complet arrive dans ta boîte, avec le fichier en pièce jointe.</li>
      <li><b>Télécharger</b> : tu obtiens un fichier à ouvrir dans ton navigateur, pour l'imprimer ou l'enregistrer en PDF.</li>
      <li><b>Sur cet appareil</b> : ton offre et tes réponses restent enregistrées ; rouvre simplement cette page pour les retrouver.</li>
    </ul>
    <textarea id="rcText" class="copy-area" readonly hidden aria-label="Texte du récap"></textarea>`;
}
function recapFileHTML(d) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Récap business passion${d.name ? ' — ' + esc(d.name) : ''}</title><style>${RECAP_CSS}</style></head><body><main class="doc">${recapDocHTML(d)}</main></body></html>`;
}
document.addEventListener('submit', async e => {
  if (e.target.id !== 'rcMailForm') return;
  e.preventDefault();
  const d = recapData(); if (!d) return;
  const v = $('#rcMail').value.trim(), st = $('#rcStatus');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { st.textContent = 'Indique une adresse e-mail valide.'; return; }
  if (!S.paid) { st.textContent = 'L\'envoi par e-mail est inclus dans l\'accès complet.'; return; }
  S.email = v; save(); st.textContent = 'Envoi en cours…';
  try { await api('/api/send-email', { type: 'recap', email: v, name: d.name, token: S.token, html: recapFileHTML(d) }); st.textContent = `Ton récap est parti à ${v}. Pense à vérifier tes courriers indésirables.`; }
  catch (err) { st.textContent = 'L\'envoi n\'a pas fonctionné. Réessaie, ou télécharge ton récap.'; }
});

$('#recap').addEventListener('input', e => {
  const k = e.target.dataset.of; if (!k) return;
  if (!S.offer) S.offer = Object.assign({}, currentOffer());
  if (S.example) { S.example = false; renderNotice(); }
  S.offer[k] = e.target.value; save(); renderRecapDoc();
});
$('#recap').addEventListener('click', async e => {
  const t = e.target.closest('button'); if (!t) return;
  const d = recapData(); if (!d) return;
  const st = $('#rcStatus');
  if (t.id === 'rcCopy') {
    const txt = recapText(d);
    try { await navigator.clipboard.writeText(txt); st.textContent = 'Texte copié. Colle-le dans un nouvel e-mail adressé à toi-même.'; }
    catch (err) { const ta = $('#rcText'); ta.hidden = false; ta.value = txt; ta.focus(); ta.select(); st.textContent = 'Sélectionne le texte ci-dessous et copie-le (Ctrl+C ou appui long).'; }
  }
  if (t.id === 'rcDownload' && downloadsApi) {
    const slug = (d.name || 'mon').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mon';
    const doc = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Récap business passion${d.name ? ' — ' + esc(d.name) : ''}</title><style>${RECAP_CSS}</style></head><body><main class="doc">${recapDocHTML(d)}</main></body></html>`;
    st.textContent = 'Confirme le téléchargement dans la fenêtre qui s\'ouvre…';
    try { await downloadsApi.save({ filename: `recap-business-passion-${slug}.html`, data: doc }); st.textContent = 'Récap téléchargé. Ouvre-le dans ton navigateur pour l\'imprimer ou l\'enregistrer en PDF.'; }
    catch (err) { st.textContent = err?.code === 'declined' ? 'Téléchargement annulé.' : 'Le téléchargement n\'est pas disponible ici. Utilise plutôt « Copier le texte ».'; if (['unavailable', 'not_granted', 'capability_disabled'].includes(err?.code)) { downloadsApi = null; renderRecapActions(); } }
  }
});

/* ---------- comité d'experts ---------- */
const AGENTS = [
  { k: 'hd', ini: 'HD', n: 'Analyste Human Design', d: "Traduit ta charte en mode d'emploi d'entrepreneur : forces, pièges, rythme, façon de vendre.",
    role: "analyste Human Design expérimenté·e. Traduis sa charte en mode d'emploi entrepreneurial : forces, pièges, rythme de travail idéal, façon d'attirer et de vendre, environnement idéal. Appuie-toi précisément sur son type, sa stratégie, son autorité, son profil, ses centres définis et ouverts et ses canaux.",
    schema: '{"synthese": "2 à 3 phrases", "forces": ["3 forces business"], "pieges": ["3 pièges à éviter"], "rythme": "son rythme de travail idéal", "vente": "comment attirer et vendre", "environnement": "son environnement de travail idéal"}' },
  { k: 'orient', ini: 'OR', n: "Conseillère en orientation", d: 'Révèle ta zone de génie, tes talents et tes compétences transférables.',
    role: "conseiller·ère en orientation et en bilan professionnel. Analyse ses intérêts (RIASEC), ses compétences, ses valeurs et ses réponses libres pour identifier sa zone de génie, ses talents, ses compétences transférables et ses motivations profondes.",
    schema: '{"synthese": "2 à 3 phrases", "zone_de_genie": "1 phrase", "talents": ["3 talents"], "competences_transferables": ["3 compétences"], "motivations": ["3 motivations profondes"], "a_eviter": "ce qui l\'éteint, 1 phrase"}' },
  { k: 'strat', ini: 'ST', n: 'Stratège business', d: 'Conçoit ton offre signature, ton prix et ton modèle de revenus.',
    role: "stratège business spécialisé·e dans le lancement d'activités d'indépendants. À partir des analyses précédentes et de la piste choisie, conçois son offre signature : client précis, problème, promesse, format, prix de lancement réaliste en euros, modèle de revenus, test de validation sans argent et évolution à 12 mois.",
    schema: '{"synthese": "2 à 3 phrases", "offre": {"nom": "nom court et parlant", "client": "client idéal précis", "probleme": "le problème résolu", "promesse": "le résultat promis", "format": "format et durée", "prix": "prix de lancement en euros"}, "modele_revenus": "1 à 2 phrases", "test_validation": "1 test à faire en 14 jours sans argent", "evolution": "comment l\'activité grandit à 12 mois"}' },
  { k: 'mkt', ini: 'MK', n: 'Experte marketing', d: 'Définit ton positionnement, ton pitch et tes meilleurs canaux pour trouver des clients.',
    role: "expert·e en marketing et en positionnement pour indépendants. Définis son positionnement, un pitch prêt à dire, 3 canaux d'acquisition adaptés à son Human Design (stratégie et profil), à ses compétences et à ses contraintes, et 5 idées de contenus.",
    schema: '{"synthese": "2 à 3 phrases", "positionnement": "1 phrase : j\'aide [qui] à [résultat] grâce à [méthode]", "pitch": "2 à 3 phrases à dire à l\'oral", "canaux": [{"canal": "nom", "pourquoi": "1 phrase", "action": "1 action concrète"}], "idees_contenus": ["5 idées de contenus"]}' },
  { k: 'mind', ini: 'MI', n: 'Coach mindset', d: 'Anticipe tes blocages probables et te donne de quoi les dépasser.',
    role: "coach en posture entrepreneuriale. Identifie ses 3 blocages les plus probables (d'après ses projets passés, son rapport au risque, ses centres ouverts, ses valeurs) avec une parade concrète pour chacun, un rituel hebdomadaire simple et une phrase ancre.",
    schema: '{"synthese": "2 à 3 phrases", "blocages": [{"blocage": "1 phrase", "parade": "1 phrase concrète"}], "rituel": "1 rituel hebdomadaire", "phrase_ancre": "1 phrase courte à se répéter"}' },
  { k: 'synth', ini: 'VS', n: 'Directrice de synthèse', d: 'Rassemble les 5 rapports en une vision claire et une feuille de route sur 90 jours.',
    role: "directeur·rice de synthèse du comité. Rassemble les 5 rapports en une vision claire, cohérente et motivante : sa vision en une phrase, pourquoi cette personne est faite pour ce projet, 3 priorités, une feuille de route sur 90 jours (3 mois, 3 actions concrètes par mois), l'indicateur de réussite à suivre et un message d'encouragement.",
    schema: '{"vision": "1 phrase inspirante et concrète", "pourquoi_toi": "2 à 3 phrases", "priorites": ["3 priorités"], "feuille_de_route": [{"mois": "Mois 1", "objectif": "1 phrase", "actions": ["3 actions"]}], "indicateur": "l\'indicateur de réussite à 90 jours", "message": "2 phrases d\'encouragement"}' }
];
const PHASES = [['hd', 'orient'], ['strat'], ['mkt', 'mind'], ['synth']];
let teamCtl = null, teamStatus = {}, teamRunning = false;

function offerContext() {
  const o = S.offer || currentOffer();
  if (o) return `PISTE CHOISIE : ${o.name}. Pour : ${o.client || 'à préciser'}. Promesse : ${o.promise || '—'}. Format : ${o.format || '—'}. Prix envisagé : ${o.price || '—'}.`;
  return `PISTES LES MIEUX CLASSÉES : ${LAST_RULE.map(x => `${x.t} (${x.total}/100)`).join(' ; ')}.`;
}
function agentPrompt(ag) {
  const prev = AGENTS.filter(a => a.k !== ag.k && S.experts?.[a.k] && PHASES.findIndex(p => p.includes(a.k)) < PHASES.findIndex(p => p.includes(ag.k)))
    .map(a => `RAPPORT DE ${a.n.toUpperCase()} :\n${JSON.stringify(S.experts[a.k])}`).join('\n\n').slice(0, 14000);
  return `Tu fais partie d'un comité d'experts qui aide une personne à trouver et lancer son business passion. Ton rôle : ${ag.role}\n\nÉcris en français, en tutoyant, avec des phrases courtes, concrètes et personnalisées : appuie-toi sur ses réponses réelles, jamais sur des généralités. Le Human Design est une grille de réflexion, jamais une certitude : formule-le avec nuance. Respecte toutes ses contraintes (budget, temps, besoin de revenu, lieu) et ses domaines exclus.\n\nPROFIL :\n${profileText()}\n\n${offerContext()}${prev ? '\n\n' + prev : ''}\n\nRéponds uniquement avec un objet JSON de cette forme : ${ag.schema}`;
}

function li(arr) { return (Array.isArray(arr) ? arr : []).map(x => `<li>${esc(x)}</li>`).join(''); }
function reportHTML(k, r) {
  if (!r) return '';
  const p = (lab, v) => v ? `<p><b>${lab} :</b> ${esc(v)}</p>` : '';
  switch (k) {
    case 'hd': return `<p class="lead-s">${esc(r.synthese)}</p><div class="two"><div><h5>Tes forces</h5><ul>${li(r.forces)}</ul></div><div><h5>Tes pièges</h5><ul>${li(r.pieges)}</ul></div></div>${p('Ton rythme idéal', r.rythme)}${p('Comment tu attires et vends', r.vente)}${p('Ton environnement idéal', r.environnement)}`;
    case 'orient': return `<p class="lead-s">${esc(r.synthese)}</p><p class="genie">${esc(r.zone_de_genie)}</p><div class="three"><div><h5>Talents</h5><ul>${li(r.talents)}</ul></div><div><h5>Compétences transférables</h5><ul>${li(r.competences_transferables)}</ul></div><div><h5>Motivations</h5><ul>${li(r.motivations)}</ul></div></div>${p('Ce qui t\'éteint', r.a_eviter)}`;
    case 'strat': { const o = r.offre || {}; return `<p class="lead-s">${esc(r.synthese)}</p><div class="offer-box"><p class="eyebrow">Ton offre signature</p><h5 class="offer-name">${esc(o.nom)}</h5><dl class="rc-dl"><div><dt>Pour qui</dt><dd>${esc(o.client)}</dd></div><div><dt>Problème</dt><dd>${esc(o.probleme)}</dd></div><div><dt>Promesse</dt><dd>${esc(o.promesse)}</dd></div><div><dt>Format</dt><dd>${esc(o.format)}</dd></div><div><dt>Prix de lancement</dt><dd>${esc(o.prix)}</dd></div></dl><div><button type="button" class="btn" id="useOffer">Utiliser cette offre pour mon récap</button></div></div>${p('Modèle de revenus', r.modele_revenus)}${p('Test de validation (14 jours)', r.test_validation)}${p('Dans 12 mois', r.evolution)}`; }
    case 'mkt': return `<p class="lead-s">${esc(r.synthese)}</p><p class="genie">${esc(r.positionnement)}</p>${r.pitch ? `<blockquote class="pitch">${esc(r.pitch)}</blockquote>` : ''}<h5>Tes 3 canaux</h5><div class="chan-cards">${(r.canaux || []).map(c => `<div><b>${esc(c.canal)}</b><p>${esc(c.pourquoi)}</p><p class="muted"><b>Action :</b> ${esc(c.action)}</p></div>`).join('')}</div><h5>Idées de contenus</h5><ul>${li(r.idees_contenus)}</ul>`;
    case 'mind': return `<p class="lead-s">${esc(r.synthese)}</p><div class="blocks">${(r.blocages || []).map(b => `<div><p><b>${esc(b.blocage)}</b></p><p>→ ${esc(b.parade)}</p></div>`).join('')}</div>${p('Ton rituel hebdomadaire', r.rituel)}${r.phrase_ancre ? `<p class="genie">« ${esc(r.phrase_ancre)} »</p>` : ''}`;
  }
  return '';
}
function visionHTML(v) {
  return `<div class="vision"><p class="eyebrow">Ta vision</p><h3 class="vision-line">${esc(v.vision)}</h3><p class="vision-why">${esc(v.pourquoi_toi)}</p>
    <div class="prios">${(v.priorites || []).map((x, i) => `<div><span class="key-n">${i + 1}</span><p>${esc(x)}</p></div>`).join('')}</div>
    <h4 class="road-title">Ta feuille de route sur 90 jours</h4>
    <div class="road">${(v.feuille_de_route || []).map(m => `<div class="month"><p class="eyebrow">${esc(m.mois)}</p><p class="m-goal">${esc(m.objectif)}</p><ul>${li(m.actions)}</ul></div>`).join('')}</div>
    ${v.indicateur ? `<p class="kpi"><b>Ton indicateur de réussite :</b> ${esc(v.indicateur)}</p>` : ''}
    ${v.message ? `<p class="encourage">${esc(v.message)}</p>` : ''}</div>`;
}
function renderTeam() {
  const box = $('#teamBox'); if (!box) return;
  $('#comite').hidden = !unlocked(); document.querySelector('a[href="#comite"].navl')?.toggleAttribute('hidden', !unlocked());
  if (!unlocked()) { box.innerHTML = ''; return; }
  const ex = S.experts || {};
  const done = AGENTS.filter(a => ex[a.k]).length;
  const st = k => teamStatus[k] || (ex[k] ? 'done' : 'idle');
  const label = { idle: 'En attente', run: 'Analyse en cours…', done: 'Rapport prêt', err: 'Interrompu' };
  const avail = !!sampleFn;
  box.innerHTML = `
    <div class="card team-card">
      <div class="roster">${AGENTS.map(a => `<div class="agent ${st(a.k)}"><span class="ini">${a.ini}</span><div><b>${a.n}</b><p>${a.d}</p><span class="state">${label[st(a.k)]}</span></div></div>`).join('')}</div>
      <div class="team-actions">
        ${avail ? `<button type="button" class="btn" id="teamGo" ${teamRunning ? 'disabled' : ''}>${done === 0 ? 'Lancer l\'analyse du comité' : done < AGENTS.length ? 'Compléter l\'analyse' : 'Refaire toute l\'analyse'}</button>${teamRunning ? '<button type="button" class="btn ghost" id="teamStop">Arrêter</button>' : ''}` : '<p class="muted">Le comité d\'experts est momentanément indisponible.</p>'}
        <p class="ai-status" id="teamMsg" aria-live="polite">${teamRunning ? 'Les experts travaillent l\'un après l\'autre, chacun lit les rapports précédents. Compte 3 à 5 minutes.' : S.example ? 'Remplis ton bilan et choisis une piste avant de lancer le comité : plus tes réponses sont précises, plus l\'analyse est juste.' : ex.at ? `Dernière analyse : ${esc(ex.at)}.` : 'Conseil : choisis d\'abord une piste à l\'étape 3, le comité construira ton offre autour.'}</p>
      </div>
    </div>
    ${ex.synth ? `<div class="card">${visionHTML(ex.synth)}</div>` : ''}
    ${AGENTS.filter(a => a.k !== 'synth' && ex[a.k]).map(a => `<details class="card report" ${a.k === 'strat' ? 'open' : ''}><summary><span class="ini">${a.ini}</span><span><b>${a.n}</b><br><span class="muted">${a.d}</span></span></summary><div class="report-body">${reportHTML(a.k, ex[a.k])}</div></details>`).join('')}`;
}
async function runTeam(full) {
  if (!sampleFn || teamRunning) return;
  if (full || AGENTS.every(a => S.experts?.[a.k])) S.experts = {};
  S.experts ||= {};
  teamRunning = true; teamStatus = {}; teamCtl = new AbortController();
  renderTeam();
  try {
    for (const phase of PHASES) {
      const todo = phase.filter(k => !S.experts[k]);
      todo.forEach(k => teamStatus[k] = 'run'); renderTeam();
      await Promise.all(todo.map(async k => {
        const ag = AGENTS.find(a => a.k === k);
        try {
          const r = await sampleFn.json(agentPrompt(ag), { signal: teamCtl.signal, cache: false });
          if (!r || typeof r !== 'object' || Array.isArray(r)) throw { code: 'invalid_json' };
          S.experts[k] = r; teamStatus[k] = 'done'; save(); renderTeam();
        } catch (e) { teamStatus[k] = 'err'; throw e; }
      }));
    }
    S.experts.at = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    save(); teamRunning = false; renderTeam(); renderRecap();
    $('#teamMsg').textContent = 'Analyse terminée. Ta vision et ta feuille de route sont aussi ajoutées à ton récap.';
  } catch (e) {
    teamCtl.abort(); teamRunning = false; renderTeam();
    const msg = { locked: 'Le comité d\'experts est inclus dans l\'accès complet.', not_granted: 'Accès refusé.', rate_limited: 'Trop de demandes pour le moment. Réessaie dans quelques minutes : les rapports déjà prêts sont conservés.', cancelled: 'Analyse arrêtée. Les rapports déjà prêts sont conservés.', invalid_json: 'Un rapport est arrivé incomplet. Clique sur « Compléter l\'analyse » pour reprendre là où tu en étais.' };
    $('#teamMsg').textContent = msg[e?.code] ?? 'L\'analyse a été interrompue. Clique sur « Compléter l\'analyse » pour reprendre là où tu en étais.';
  }
}
document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.id === 'teamGo') runTeam(AGENTS.every(a => S.experts?.[a.k]));
  if (t.id === 'teamStop') teamCtl?.abort();
  if (t.id === 'useOffer') {
    const o = S.experts?.strat?.offre; if (!o) return;
    if (S.example) S.example = false;
    S.offer = { title0: String(o.nom || ''), name: String(o.nom || ''), client: String(o.client || ''), promise: String(o.promesse || ''), format: String(o.format || ''), price: String(o.prix || ''), step: String(S.experts.strat.test_validation || ''), score: 0 };
    save(); renderCompass(); renderRecap(); $('#recap').scrollIntoView();
  }
});

/* ---------- accès payant (SumUp), e-mails (Brevo) et carte ---------- */
const PRICE = '22 €';
let isOwner = false;
const unlocked = () => S.example || S.paid;
const lead = s => { const i = s.search(/\.\s/); return i > 0 ? `<b>${s.slice(0, i + 1)}</b>${s.slice(i + 1)}` : `<b>${s}</b>`; };
const slugOf = n => (n || 'mon').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mon';

async function api(path, body) {
  const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  let d = {}; try { d = await r.json(); } catch (e) { }
  if (!r.ok) throw { status: r.status, message: d.error || 'Erreur' };
  return d;
}

function paywallHTML() {
  const rs = riasecScores(), order = Object.keys(rs).sort((x, y) => rs[y] - rs[x]);
  const done = MODS.filter((_, i) => modDone(i)).length;
  return `
    <div class="paywall">
      <div class="card pw-left">
        <p class="eyebrow">${done < 7 ? `Bilan complété à ${done}/7 : termine-le pour des pistes plus justes` : 'Ton profil est prêt'}</p>
        <h3>${S.birth.name ? esc(S.birth.name) + ', tes' : 'Tes'} pistes de business t'attendent</h3>
        <div class="pw-stats">
          <div><b>${S.chart ? TYPES[S.chart.type].name : '—'}</b><span>ton type</span></div>
          <div><b class="mono">${S.ans.riasec.filter(Boolean).length >= 12 ? order.slice(0, 3).join('') : '···'}</b><span>ton code d'intérêts</span></div>
          <div><b class="mono">${done}/7</b><span>modules du bilan</span></div>
        </div>
        <ul class="pw-list">
          <li><b>4 pistes de business</b> classées sur 100 selon ton profil</li>
          <li><b>Des idées 100 % sur mesure</b> générées à partir de tes réponses</li>
          <li><b>Ton comité de 6 experts</b> : Human Design, orientation, stratégie, marketing, mindset, synthèse</li>
          <li><b>Ton offre signature</b>, ta vision et ta feuille de route sur 90 jours</li>
          <li><b>Ton récap complet</b> envoyé par e-mail, à imprimer ou à enregistrer</li>
        </ul>
        <div class="pw-blur" aria-hidden="true">${[1, 2].map(i => `<div class="idea"><p class="eyebrow">Piste ${i}</p><h4>████████ ██████</h4><p>████ ██████ ████ ████████ ██ ██████.</p></div>`).join('')}</div>
      </div>
      <div class="card pw-right">
        <p class="eyebrow">Accès complet</p>
        <p class="pw-price">${PRICE}</p>
        <p class="muted">Paiement unique et sécurisé par SumUp · accès immédiat</p>
        <label class="check" for="fCgv" style="align-items:flex-start"><input type="checkbox" id="fCgv" style="margin-top:4px"> <span class="hint">J'accepte les <a href="/cgv.html" target="_blank">conditions générales de vente</a>. Je demande l'accès immédiat au contenu et je renonce à mon droit de rétractation.</span></label>
        <button class="btn" type="button" id="payGo">Débloquer mes résultats</button>
        <p class="hint" id="payMsg" role="alert"></p>
      </div>
    </div>`;
}
document.addEventListener('click', async e => {
  if (e.target.id !== 'payGo') return;
  const msg = $('#payMsg'), btn = e.target;
  if (!$('#fCgv').checked) { msg.textContent = 'Coche la case des conditions générales de vente pour continuer.'; return; }
  btn.disabled = true; msg.textContent = 'Ouverture du paiement sécurisé…';
  try {
    const d = await api('/api/checkout', { email: S.email || '' });
    S.pendingCheckout = d.id; save();
    location.href = d.url;
  } catch (err) { btn.disabled = false; msg.textContent = 'Le paiement n\'a pas pu s\'ouvrir. Réessaie dans un instant.'; }
});
async function verifyReturn() {
  const id = S.pendingCheckout; if (!id) return;
  try {
    const d = await api('/api/verify', { id });
    if (d.paid) {
      S.paid = true; S.example = false; S.token = d.token; delete S.pendingCheckout; save();
      renderCompass(); renderTeam(); renderRecap();
      setTimeout(() => $('#pistes').scrollIntoView(), 200);
    } else if (d.status === 'FAILED' || d.status === 'EXPIRED') { delete S.pendingCheckout; save(); }
  } catch (e) { }
}

function chartCardHTML() {
  const ch = computeChart(); if (!ch) return '';
  const T = TYPES[ch.type], b = S.birth;
  const svg = bodygraph(ch).replace(/var\(--center-on\)/g, '#DDBE93').replace(/var\(--surface\)/g, '#FBF7F1').replace(/var\(--ink\)/g, '#3A2819').replace(/var\(--muted\)/g, '#7A614B').replace(/var\(--design\)/g, '#C08C4E').replace(/var\(--line-off\)/g, '#E4D6C1');
  const keys = hdCards(ch, b.unknown);
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ma carte Human Design${b.name ? ' — ' + esc(b.name) : ''}</title><style>${RECAP_CSS}.grid{display:grid;grid-template-columns:240px 1fr;gap:24px;align-items:start}.grid svg{width:100%;height:auto}@media(max-width:560px){.grid{grid-template-columns:1fr}}</style></head><body><main class="doc">
  <header class="rc-head"><p class="rc-eyebrow">Ma Boussole Business · ma carte Human Design</p><h2>${b.name ? esc(b.name) + ', ' : ''}${T.name}</h2><p class="rc-angle">${T.strat}</p></header>
  <section class="rc-sec grid"><div>${svg}</div><dl class="rc-dl">
    <div><dt>Type</dt><dd>${T.name}</dd></div><div><dt>Stratégie</dt><dd>${T.strat}</dd></div>
    <div><dt>Autorité</dt><dd>${b.unknown ? 'À confirmer' : AUTH[ch.authority][0]}</dd></div><div><dt>Profil</dt><dd>${b.unknown ? 'À confirmer' : ch.profile}</dd></div>
    <div><dt>Définition</dt><dd>${DEFS[ch.definition]}</dd></div><div><dt>Signature</dt><dd>${T.sig}</dd></div>
    <div><dt>Centres définis</dt><dd>${ch.defined.map(c => CENTER_TXT[c][0]).join(', ') || 'Aucun'}</dd></div>
  </dl></section>
  <section class="rc-sec"><h3>Tes 4 clés pour entreprendre</h3><div class="rc-keys">${keys.map(k => `<div class="rc-key"><p class="rc-k-label">${k.label}</p><p class="rc-k-title">${k.title}</p><p>${k.why}</p></div>`).join('')}</div></section>
  <p class="rc-foot">Le Human Design est une grille de lecture de soi, pas une science validée.</p></main></body></html>`;
}
function renderMail() {
  const box = $('#mailBox'); if (!box) return;
  if (!S.chart) { box.innerHTML = ''; return; }
  box.innerHTML = `
    <div class="card mail">
      <div><p class="eyebrow">Garde ta carte</p><h3>Reçois ta carte Human Design par e-mail</h3><p class="muted">Ta charte et tes 4 clés pour entreprendre, dans ta boîte mail en quelques secondes.</p></div>
      <form id="mailForm" class="mail-form" novalidate>
        <label for="fMail">Ton adresse e-mail<input type="email" id="fMail" autocomplete="email" placeholder="prenom@exemple.fr" value="${esc(S.email || '')}"></label>
        <label class="check" for="fOptin"><input type="checkbox" id="fOptin"> <span class="hint">J'accepte de recevoir les conseils de Ma Boussole Business (désinscription en un clic).</span></label>
        <div class="mail-btns"><button class="btn" type="submit">Recevoir ma carte</button><a class="btn ghost" href="#bilan">Passer à mon bilan</a></div>
        <p class="hint" id="mailMsg" role="status"></p>
        <p class="hint">Tes données sont traitées selon notre <a href="/confidentialite.html" target="_blank">politique de confidentialité</a>.</p>
      </form>
    </div>`;
}
document.addEventListener('submit', async e => {
  if (e.target.id !== 'mailForm') return;
  e.preventDefault();
  const v = $('#fMail').value.trim(), msg = $('#mailMsg'), btn = e.target.querySelector('button[type=submit]');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { msg.textContent = 'Indique une adresse e-mail valide, par exemple prenom@exemple.fr.'; return; }
  S.email = v; save(); btn.disabled = true; msg.textContent = 'Envoi en cours…';
  try {
    await api('/api/send-email', { type: 'carte', email: v, name: S.birth.name || '', optin: $('#fOptin').checked, html: chartCardHTML() });
    msg.textContent = `Ta carte est partie à ${v}. Pense à vérifier tes courriers indésirables.`;
  } catch (err) { msg.textContent = 'L\'envoi n\'a pas fonctionné. Vérifie ton adresse et réessaie.'; }
  finally { btn.disabled = false; }
});

/* ---------- form ---------- */
function initForm() {
  $('#fZone').innerHTML = ZONES.map(([z, n]) => `<option value="${z}">${n}</option>`).join('');
  const b = S.birth;
  $('#fName').value = b.name || ''; $('#fDate').value = b.date || ''; $('#fTime').value = b.time || ''; $('#fCity').value = b.city || '';
  $('#fUnknown').checked = !!b.unknown; $('#fZone').value = b.zone || 'Europe/Paris'; $('#fTime').disabled = !!b.unknown;
  $('#fUnknown').addEventListener('change', e => { $('#fTime').disabled = e.target.checked; });
  $('#birthForm').addEventListener('submit', e => {
    e.preventDefault();
    const err = $('#formErr');
    const date = $('#fDate').value, time = $('#fTime').value, unknown = $('#fUnknown').checked;
    if (!date) { err.hidden = false; err.textContent = 'Indique ta date de naissance.'; return; }
    const yr = +date.slice(0, 4);
    if (yr < 1900 || yr > 2030) { err.hidden = false; err.textContent = 'Indique une année entre 1900 et 2030.'; return; }
    if (!unknown && !time) { err.hidden = false; err.textContent = 'Indique ton heure de naissance, ou coche « Je ne connais pas mon heure ».'; return; }
    err.hidden = true;
    if (S.example) { S.example = false; S.ans = blankAns(); }
    S.birth = { name: $('#fName').value.trim(), date, time, unknown, zone: $('#fZone').value, city: $('#fCity').value.trim() };
    renderChart(); save(); renderMail(); renderWizard(); renderCompass(); renderTeam();
    $('#chartOut').scrollIntoView({ block: 'start' });
  });
}

initForm(); renderChart(); renderMail(); renderWizard(); renderCompass(); renderTeam(); renderRecap(); verifyReturn();
