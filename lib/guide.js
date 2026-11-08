import PDFDocument from 'pdfkit';
import { readFileSync } from 'node:fs';

// Génère le PDF du profil (gratuit) ou du guide complet (payant) à partir des données envoyées par la page.
// Mise en page A4 : crème blanc cassé, marron, Fraunces (titres) et Figtree (texte).
const fontFile = f => readFileSync(new URL(`../assets/fonts/${f}`, import.meta.url));
const C = { bg: '#FBF8F2', card: '#FFFEFB', sand: '#F3ECE1', line: '#E2D6C4', ink: '#21170F', muted: '#5E4A3A', accent: '#7B4A26', design: '#B9824A', on: '#E3C59C' };
const W = 595.28, H = 841.89, M = 56, CW = W - 2 * M, BOTTOM = H - 78;

// Positions du bodygraph (même repère que la page : 360 x 540)
const POS = { head: [180, 52], ajna: [180, 128], throat: [180, 210], g: [180, 300], heart: [248, 338], sacral: [180, 420], spleen: [64, 398], solar: [296, 398], root: [180, 500] };

const t = (s, n = 900) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
const objs = a => (Array.isArray(a) ? a : []).filter(x => x && typeof x === 'object' && !Array.isArray(x));
const list = (a, n = 8, m = 400) => (Array.isArray(a) ? a : []).slice(0, n).map(x => t(x, m)).filter(Boolean);

export async function buildGuide(g = {}) {
  const full = g.kind === 'guide';
  const name = t(g.name, 60);
  const doc = new PDFDocument({
    size: 'A4', margins: { top: 64, bottom: 40, left: M, right: M }, bufferPages: true, autoFirstPage: false,
    info: { Title: full ? 'Mon guide business passion' : 'Mon profil d\'entrepreneur·e', Author: 'Ma Boussole Business by Business Design', Subject: 'Human Design et business passion' }
  });
  const chunks = []; doc.on('data', c => chunks.push(c));
  const done = new Promise(r => doc.on('end', r));
  doc.registerFont('H', fontFile('fraunces-latin-600-normal.woff'));
  doc.registerFont('HR', fontFile('fraunces-latin-400-normal.woff'));
  doc.registerFont('HI', fontFile('fraunces-latin-400-italic.woff'));
  doc.registerFont('B', fontFile('figtree-latin-400-normal.woff'));
  doc.registerFont('B6', fontFile('figtree-latin-600-normal.woff'));
  doc.on('pageAdded', () => { doc.save(); doc.rect(0, 0, W, H).fill(C.bg); doc.restore(); });

  /* ----- aides de mise en page ----- */
  const setf = (f, size, color) => doc.font(f).fontSize(size).fillColor(color);
  const hOf = (txt, f, size, w, gap = 3) => { doc.font(f).fontSize(size); return doc.heightOfString(txt, { width: w, lineGap: gap }); };
  const text = (txt, x, y, w, f = 'B', size = 10, color = C.ink, o = {}) => { setf(f, size, color); doc.text(txt, x, y, { width: w, lineGap: o.gap ?? 3, align: o.align || 'left', characterSpacing: o.cs || 0 }); return doc.y; };
  const eyebrow = (txt, x, y, w = CW, color = C.muted, align = 'left') => { setf('B6', 7.5, color); doc.text(txt.toUpperCase(), x, y, { width: w, characterSpacing: 1.4, align, lineBreak: false }); };
  const box = (x, y, w, h, fill = C.card, stroke = C.line, r = 9) => { doc.save(); doc.lineWidth(0.7).roundedRect(x, y, w, h, r).fillAndStroke(fill, stroke); doc.restore(); };
  const need = h => { if (doc.y + h > BOTTOM) { doc.addPage(); return true; } return false; };
  const gap = n => { doc.y += n; };

  // Une nouvelle section reprend sur la même page s'il reste assez de place, sinon sur une page neuve.
  const head = (eb, title, intro, force = false, thr = 0.5) => {
    let top = 70;
    if (force || doc.y > H * thr) doc.addPage(); else top = doc.y + 34;
    eyebrow(eb, M, top, CW, C.accent);
    let y = text(title, M, top + 18, CW, 'H', 24, C.ink, { gap: 2 });
    doc.save(); doc.moveTo(M, y + 8).lineTo(M + 30, y + 8).lineWidth(1.6).stroke(C.design); doc.restore();
    y += 22;
    if (intro) y = text(intro, M, y, CW, 'B', 10, C.muted);
    doc.y = y + 16;
  };
  const sub = (title) => { need(60); const y = doc.y + 4; text(title, M, y, CW, 'H', 14, C.ink); doc.y += 8; };

  /* ----- couverture ----- */
  doc.addPage();
  doc.save(); doc.lineWidth(0.8).roundedRect(30, 30, W - 60, H - 60, 12).stroke(C.line); doc.restore();
  const cx = W / 2;
  doc.save(); doc.lineWidth(1.3).circle(cx, 214, 26).stroke(C.accent); doc.polygon([cx, 195], [cx + 7.5, 214], [cx, 233], [cx - 7.5, 214]).fill(C.accent); doc.restore();
  eyebrow('Ma Boussole Business', M, 268, CW, C.muted, 'center');
  eyebrow('by Business Design', M, 282, CW, C.accent, 'center');
  let y = text(full ? 'Ton guide' : 'Ton profil', M, 350, CW, 'H', 46, C.ink, { align: 'center', gap: 0 });
  y = text(full ? 'business passion' : 'd\'entrepreneur·e', M, y + 2, CW, 'HI', 38, C.accent, { align: 'center', gap: 0 });
  doc.save(); doc.moveTo(cx - 20, y + 30).lineTo(cx + 20, y + 30).lineWidth(1.2).stroke(C.design); doc.restore();
  if (name) text(`Préparé pour ${name}`, M, y + 54, CW, 'HR', 15, C.ink, { align: 'center' });
  if (g.archetype?.name) text(t(g.archetype.name, 60), M, doc.y + 6, CW, 'HI', 13, C.muted, { align: 'center' });
  eyebrow(t(g.date, 40), M, H - 112, CW, C.muted, 'center');
  eyebrow('businessdesign.fr', M, H - 96, CW, C.accent, 'center');

  /* ----- profil ----- */
  const ar = g.archetype;
  if (ar?.name) {
    head('Ton profil', 'Ton archétype d\'entrepreneur·e', '', true);
    let y = text(t(ar.name, 70), M, doc.y, CW, 'HI', 32, C.accent, { gap: 0 });
    y = text(t(ar.line, 200), M, y + 8, CW, 'HR', 14, C.ink, { gap: 3 });
    y = text(t(ar.biz, 400), M, y + 10, CW, 'B', 10.5, C.muted);
    if (ar.nuance) {
      const w = CW - 32, h = hOf(t(ar.nuance, 500), 'B', 10, w) + 38;
      y += 14; box(M, y, CW, h, C.sand, C.sand);
      eyebrow(`Avec ton type ${t(g.chart?.type, 40)}`, M + 16, y + 12, w, C.accent);
      y = text(t(ar.nuance, 500), M + 16, y + 26, w, 'B', 10, C.ink) + 14;
    }
    y += 22; text('Tes 3 forces', M, y, CW, 'H', 14, C.ink); y = doc.y + 8;
    const cw3 = (CW - 24) / 3, forces = list(ar.forces, 3, 160);
    const fh = Math.max(...forces.map(f => hOf(f, 'B', 10, cw3 - 28))) + 52;
    forces.forEach((f, i) => { const x = M + i * (cw3 + 12); box(x, y, cw3, fh); text(String(i + 1), x + 14, y + 12, 30, 'HR', 22, C.design, { gap: 0 }); text(f, x + 14, y + 42, cw3 - 28, 'B', 10, C.ink); });
    doc.y = y + fh + 26;
    const rows = [['Intérêts dominants', t(g.code, 80)], ['Compétences fortes', list(g.skills, 8, 50).join(' · ')], ['Valeurs prioritaires', list(g.values, 5, 40).map((v, i) => `${i + 1}. ${v}`).join('  ')]].filter(r => r[1]);
    if (rows.length) {
      text('Tes ressources', M, doc.y, CW, 'H', 14, C.ink); doc.y += 8;
      rows.forEach(([k, v]) => { const hh = Math.max(hOf(v, 'B', 10, CW - 140), 14) + 14; need(hh); const yy = doc.y; doc.save(); doc.moveTo(M, yy).lineTo(M + CW, yy).lineWidth(0.6).stroke(C.line); doc.restore(); eyebrow(k, M, yy + 9, 130); text(v, M + 140, yy + 7, CW - 140, 'B', 10, C.ink); doc.y = yy + hh; });
    }
  }

  /* ----- charte ----- */
  const ch = g.chart;
  if (ch?.type) {
    head('Ta charte Human Design', 'Ton mode de fonctionnement', 'Une lecture symbolique, issue de la tradition Human Design : une grille de réflexion pour mieux te connaître, pas un test validé scientifiquement.');
    const top = doc.y, s = 0.6, ox = M, oy = top;
    const P = (x, y) => [ox + x * s, oy + y * s];
    const defined = new Set(objs(ch.centers).filter(c => c.on).map(c => c.k));
    doc.save(); doc.lineCap('round');
    objs(ch.channels).slice(0, 36).forEach(c => { if (POS[c.a] && POS[c.b]) { const [x1, y1] = P(...POS[c.a]), [x2, y2] = P(...POS[c.b]); doc.lineWidth(3).moveTo(x1, y1).lineTo(x2, y2).stroke(C.design); } });
    doc.restore();
    const shape = (k) => {
      const [x, y] = POS[k], on = defined.has(k), pts = a => a.map(([px, py]) => P(x + px, y + py));
      doc.save(); doc.lineWidth(1.1).lineJoin('round');
      const fin = on ? [C.on, C.ink] : [C.card, C.muted];
      if (k === 'head') doc.polygon(...pts([[0, -30], [-32, 22], [32, 22]]));
      else if (k === 'ajna') doc.polygon(...pts([[-32, -22], [32, -22], [0, 30]]));
      else if (k === 'g') doc.polygon(...pts([[0, -36], [36, 0], [0, 36], [-36, 0]]));
      else if (k === 'heart') doc.polygon(...pts([[0, -18], [22, 16], [-22, 16]]));
      else if (k === 'spleen') doc.polygon(...pts([[-24, -36], [32, 0], [-24, 36]]));
      else if (k === 'solar') doc.polygon(...pts([[24, -36], [-32, 0], [24, 36]]));
      else { const sz = k === 'throat' ? 25 : 28, [px, py] = P(x - sz, y - sz); doc.roundedRect(px, py, 2 * sz * s, 2 * sz * s, 3); }
      doc.fillAndStroke(...fin); doc.restore();
    };
    Object.keys(POS).forEach(shape);
    const bh = 540 * s;
    doc.save(); doc.rect(ox + 4, oy + bh + 8, 8, 8).fill(C.on); doc.restore();
    text('Centre défini', ox + 18, oy + bh + 7, 90, 'B', 8, C.muted);
    doc.save(); doc.lineWidth(0.8).rect(ox + 112, oy + bh + 8, 8, 8).fillAndStroke(C.card, C.muted); doc.restore();
    text('Centre ouvert', ox + 126, oy + bh + 7, 90, 'B', 8, C.muted);
    // définitions à droite
    const rx = M + 240, rw = CW - 240;
    let ry = top;
    objs(ch.defs).slice(0, 8).forEach(d => {
      const hv = hOf(t(d.value, 120), 'H', 12, rw), hw = hOf(t(d.what, 220), 'B', 8.5, rw, 2), hh = hv + hw + 28;
      doc.save(); doc.moveTo(rx, ry).lineTo(rx + rw, ry).lineWidth(0.6).stroke(C.line); doc.restore();
      eyebrow(t(d.term, 40), rx, ry + 8, rw, C.accent);
      let yy = text(t(d.value, 120), rx, ry + 20, rw, 'H', 12, C.ink, { gap: 1 });
      text(t(d.what, 220), rx, yy + 3, rw, 'B', 8.5, C.muted, { gap: 2 });
      ry += hh;
    });
    doc.y = Math.max(ry, top + bh + 26) + 10;

    // centres
    sub('Tes 9 centres');
    text('Un centre ouvert ne signifie pas une absence de capacité : c\'est un thème que tu vis de façon plus variable.', M, doc.y, CW, 'B', 9, C.muted); doc.y += 10;
    const cw3 = (CW - 20) / 3, cs = objs(ch.centers).slice(0, 9);
    for (let i = 0; i < cs.length; i += 3) {
      const row = cs.slice(i, i + 3), rh = Math.max(...row.map(c => hOf(t(c.txt, 160), 'B', 8.5, cw3 - 24, 2))) + 40;
      need(rh + 10); const yy = doc.y;
      row.forEach((c, j) => { const x = M + j * (cw3 + 10); box(x, yy, cw3, rh, c.on ? C.sand : C.card, c.on ? C.on : C.line, 8); text(t(c.name, 30), x + 12, yy + 10, cw3 - 24, 'H', 11, C.ink, { gap: 0 }); eyebrow(c.on ? 'Défini' : 'Ouvert', x + 12, yy + 25, cw3 - 24, c.on ? C.accent : C.muted); text(t(c.txt, 160), x + 12, yy + 38, cw3 - 24, 'B', 8.5, C.ink, { gap: 2 }); });
      doc.y = yy + rh + 10;
    }
    const chans = objs(ch.channels).filter(c => c.name);
    if (chans.length) {
      sub('Tes talents innés');
      chans.slice(0, 10).forEach(c => { const hh = hOf(`${t(c.name, 50)} : ${t(c.txt, 200)}`, 'B', 9.5, CW - 14) + 8; need(hh); const yy = doc.y; doc.save(); doc.circle(M + 3, yy + 6, 2.2).fill(C.design); doc.restore(); text(`${t(c.name, 50)} : ${t(c.txt, 200)}`, M + 14, yy, CW - 14, 'B', 9.5, C.ink); doc.y = yy + hh; });
    }

    /* ----- 4 clés ----- */
    head('Ton Human Design au service de ton business', 'Tes 4 clés pour entreprendre', 'Ce que chaque élément de ta charte peut changer dans ta manière de travailler, de décider et de vendre. Garde ce qui te parle, écarte le reste.', false, 0.66);
    objs(ch.keys).slice(0, 4).forEach((k, i) => {
      const w = CW - 40, parts = [['Business', t(k.why, 420)], ['À faire', t(k.evolve, 320)], k.q ? ['Question', t(k.q, 260)] : null].filter(Boolean);
      const hh = 44 + parts.reduce((a, [, v]) => a + hOf(v, 'B', 9.5, w - 64, 2.5) + 8, 0) + 8;
      need(hh + 12); const yy = doc.y;
      box(M, yy, CW, hh); doc.save(); doc.rect(M + 1, yy + 14, 2.2, hh - 28).fill(C.design); doc.restore();
      eyebrow(t(k.label, 40), M + 20, yy + 14, w, C.accent);
      text(t(k.title, 100), M + 20, yy + 26, w, 'H', 13, C.ink, { gap: 1 });
      let py = yy + 48;
      parts.forEach(([lab, v]) => { eyebrow(lab, M + 20, py + 2, 60, C.muted); const e = text(v, M + 84, py, w - 64, lab === 'Question' ? 'HI' : 'B', lab === 'Question' ? 10 : 9.5, C.ink, { gap: 2.5 }); py = e + 8; });
      doc.y = yy + hh + 12;
    });
  }

  /* ----- pistes ----- */
  const pistes = objs(g.pistes).slice(0, 3);
  if (pistes.length) {
    head('Tes pistes de business', 'Tes 3 pistes de business', 'Classées selon tes réponses : compétences, intérêts, valeurs, préférences et contraintes. Ton Human Design n\'entre pas dans le score.', true);
    pistes.forEach((p, i) => {
      const w = CW - 40, hd = hOf(t(p.t, 90), 'H', 15, w - 70, 1), hdsc = hOf(t(p.d, 260), 'B', 10, w, 3), hstep = hOf(t(p.step, 260), 'B', 9.5, w - 24, 2.5);
      const hh = 26 + hd + 10 + hdsc + 28 + hstep + 36;
      need(hh + 14); const yy = doc.y;
      box(M, yy, CW, hh);
      eyebrow(`Piste n°${i + 1}`, M + 20, yy + 16, 120, C.accent);
      text(t(p.t, 90), M + 20, yy + 30, w - 70, 'H', 15, C.ink, { gap: 1 });
      text(String(Math.round(Number(p.total) || 0)), M + CW - 80, yy + 16, 60, 'HR', 28, C.accent, { align: 'right', gap: 0 });
      eyebrow('sur 100', M + CW - 80, yy + 46, 60, C.muted, 'right');
      let py = yy + 30 + hd + 8;
      py = text(t(p.d, 260), M + 20, py, w, 'B', 10, C.ink) + 6;
      text([t(p.model, 30), t(p.price, 60), t(p.loc, 30)].filter(Boolean).join('  ·  '), M + 20, py, w, 'B6', 8.5, C.muted); py += 20;
      box(M + 20, py, w, hstep + 26, C.sand, C.sand, 7);
      eyebrow('Premier pas cette semaine', M + 32, py + 9, w - 24, C.accent);
      text(t(p.step, 260), M + 32, py + 22, w - 24, 'B', 9.5, C.ink, { gap: 2.5 });
      doc.y = yy + hh + 14;
    });
  }

  if (full) {
    /* ----- offre ----- */
    const o = g.offer || {};
    if (o.name) {
      head('Ton offre', 'Ton offre de lancement', 'Ton angle clair, à tester auprès de vraies personnes avant de la perfectionner.', true);
      const rows = [['Pour qui', o.client], ['Résultat promis', o.promise], ['Format', o.format], ['Prix de lancement', o.price], ['Premier pas', o.step]].map(([k, v]) => [k, t(v, 320) || 'À préciser']);
      const w = CW - 48, hh = 70 + rows.reduce((a, [, v]) => a + Math.max(hOf(v, 'B', 10, w - 120, 2.5), 13) + 14, 0);
      need(hh + 10); const yy = doc.y;
      box(M, yy, CW, hh); doc.save(); doc.rect(M, yy + 18, 3, 40).fill(C.accent); doc.restore();
      eyebrow('Ton offre signature', M + 24, yy + 18, w, C.accent);
      text(t(o.name, 100), M + 24, yy + 32, w, 'H', 18, C.ink, { gap: 1 });
      let py = yy + 66;
      rows.forEach(([k, v]) => { doc.save(); doc.moveTo(M + 24, py - 6).lineTo(M + CW - 24, py - 6).lineWidth(0.5).stroke(C.line); doc.restore(); eyebrow(k, M + 24, py + 1, 110); const e = text(v, M + 144, py - 1, w - 120, 'B', 10, C.ink, { gap: 2.5 }); py = Math.max(e, py + 13) + 14; });
      doc.y = yy + hh + 18;
      if (g.positionnement) { sub('Ton positionnement'); const e = text(t(g.positionnement, 400), M, doc.y, CW, 'HI', 13, C.accent, { gap: 3 }); doc.y = e + 6; }
      if (g.pitch) { const hp = hOf(t(g.pitch, 500), 'B', 10, CW - 24, 3); need(hp + 40); const yy2 = doc.y + 22; doc.save(); doc.rect(M, yy2, 2.4, hp).fill(C.design); doc.restore(); eyebrow('Ton pitch, à dire à voix haute', M + 14, yy2 - 12, CW, C.muted); text(t(g.pitch, 500), M + 14, yy2, CW - 24, 'HI', 10.5, C.ink); doc.y = yy2 + hp + 14; }
      const canaux = objs(g.canaux).slice(0, 3);
      if (canaux.length) { sub('Tes canaux pour trouver des clients'); canaux.forEach(c => { const tx = `${t(c.canal, 60)} : ${t(c.action, 220)}`; const hh2 = hOf(tx, 'B', 9.5, CW - 14) + 8; need(hh2); const yy3 = doc.y; doc.save(); doc.circle(M + 3, yy3 + 6, 2.2).fill(C.design); doc.restore(); text(tx, M + 14, yy3, CW - 14, 'B', 9.5, C.ink); doc.y = yy3 + hh2; }); }
    }

    /* ----- plan ----- */
    const plan = (Array.isArray(g.plan) ? g.plan : []).filter(Array.isArray).slice(0, 6);
    if (plan.length) {
      head('Passer à l\'action', 'Tes 30 premiers jours pour tester', 'Le but n\'est pas d\'être parfait·e : c\'est d\'obtenir des retours réels, vite.', true);
      plan.forEach(([w, ti, x], i) => {
        const tx = t(x, 420), hh = Math.max(hOf(tx, 'B', 10, CW - 90, 3) + 34, 54);
        need(hh + 8); const yy = doc.y;
        doc.save(); doc.circle(M + 18, yy + 20, 15).lineWidth(1).fillAndStroke(C.sand, C.design); doc.restore();
        text(String(i + 1), M + 3, yy + 12, 30, 'HR', 15, C.accent, { align: 'center', gap: 0 });
        if (i < plan.length - 1) { doc.save(); doc.moveTo(M + 18, yy + 36).lineTo(M + 18, yy + hh + 5).lineWidth(0.7).dash(2, { space: 2 }).stroke(C.line); doc.restore(); }
        eyebrow(t(w, 30), M + 50, yy + 6, CW - 60, C.accent);
        text(t(ti, 80), M + 50, yy + 18, CW - 60, 'H', 12.5, C.ink, { gap: 1 });
        text(tx, M + 50, yy + 36, CW - 90, 'B', 10, C.ink);
        doc.y = yy + hh + 8;
      });
      const valid = list(g.valid, 5, 220);
      if (valid.length) {
        sub('Tes critères de validation');
        valid.forEach(v => { const hh = hOf(v, 'B', 10, CW - 28, 2.5) + 10; need(hh); const yy = doc.y; doc.save(); doc.lineWidth(0.9).roundedRect(M, yy + 1.5, 10, 10, 2).stroke(C.accent); doc.restore(); text(v, M + 22, yy, CW - 22, 'B', 10, C.ink, { gap: 2.5 }); doc.y = yy + hh; });
      }
      if (g.alt) { need(80); const yy = doc.y + 12, w = CW - 32, hh = hOf(t(g.alt, 300), 'B', 10, w) + 38; box(M, yy, CW, hh, C.sand, C.sand); eyebrow('Si le test n\'est pas concluant, ta piste alternative', M + 16, yy + 12, w, C.accent); text(t(g.alt, 300), M + 16, yy + 26, w, 'B', 10, C.ink); doc.y = yy + hh + 10; }
    }

    /* ----- vision ----- */
    const v = g.vision;
    if (v?.vision) {
      head('Ta vision', 'Ta vision et ta feuille de route', '', true);
      let y = text(t(v.vision, 300), M, doc.y, CW, 'HI', 19, C.accent, { gap: 4 });
      y = text(t(v.pourquoi_toi, 500), M, y + 12, CW, 'B', 10.5, C.ink) + 6; doc.y = y;
      const pr = list(v.priorites, 3, 200);
      if (pr.length) { sub('Tes 3 priorités'); pr.forEach((p, i) => { const hh = hOf(p, 'B', 10, CW - 40, 2.5) + 14; need(hh); const yy = doc.y; text(String(i + 1), M, yy - 2, 24, 'HR', 17, C.design, { gap: 0 }); text(p, M + 30, yy, CW - 30, 'B', 10, C.ink, { gap: 2.5 }); doc.y = yy + hh; }); }
      const road = objs(v.feuille_de_route).slice(0, 3);
      if (road.length) {
        sub('Ta feuille de route sur 90 jours');
        const cw3 = (CW - 24) / 3;
        const hs = road.map(m => 46 + hOf(t(m.objectif, 160), 'HR', 10.5, cw3 - 24, 2) + 8 + list(m.actions, 4, 160).reduce((a, x) => a + hOf(x, 'B', 8.5, cw3 - 36, 2) + 5, 0));
        const rh = Math.max(...hs) + 6; need(rh + 10); const yy = doc.y;
        road.forEach((m, i) => { const x = M + i * (cw3 + 12); box(x, yy, cw3, rh); doc.save(); doc.rect(x + 12, yy, cw3 - 24, 2.2).fill(C.design); doc.restore(); eyebrow(t(m.mois, 20), x + 12, yy + 14, cw3 - 24, C.accent); let py = text(t(m.objectif, 160), x + 12, yy + 28, cw3 - 24, 'HR', 10.5, C.ink, { gap: 2 }) + 8; list(m.actions, 4, 160).forEach(a => { doc.save(); doc.circle(x + 15, py + 4.5, 1.6).fill(C.design); doc.restore(); py = text(a, x + 24, py, cw3 - 36, 'B', 8.5, C.ink, { gap: 2 }) + 5; }); });
        doc.y = yy + rh + 14;
      }
      if (v.indicateur) { const hh = hOf(t(v.indicateur, 260), 'B', 10, CW - 32) + 36; need(hh + 6); const yy = doc.y + 4; box(M, yy, CW, hh, C.sand, C.sand); eyebrow('Ton indicateur de réussite à 90 jours', M + 16, yy + 12, CW - 32, C.accent); text(t(v.indicateur, 260), M + 16, yy + 26, CW - 32, 'B', 10, C.ink); doc.y = yy + hh + 8; }
    }
  }

  /* ----- fin ----- */
  doc.addPage();
  const site = (process.env.SITE_URL || 'https://www.businessdesign.fr').replace(/\/$/, '');
  eyebrow(full ? 'Et maintenant' : 'Aller plus loin', M, 120, CW, C.accent, 'center');
  let ey = text(full ? 'Passe à l\'action cette semaine' : 'Transforme une piste en projet concret', M + 30, 140, CW - 60, 'H', 24, C.ink, { align: 'center', gap: 2 });
  doc.save(); doc.moveTo(cx - 15, ey + 12).lineTo(cx + 15, ey + 12).lineWidth(1.4).stroke(C.design); doc.restore();
  ey += 34;
  const steps = full
    ? [['Choisis ton premier pas', 'Un seul, réalisable en moins de 7 jours et sans dépense.'], ['Parle à 10 personnes de ta cible', 'Écoute leurs mots : ils deviendront les tiens pour vendre.'], ['Mesure les signaux', 'Conversations, intentions d\'achat, premier paiement : compare à tes critères.']]
    : [['Des idées 100 % sur mesure', 'Générées à partir de tes réponses et de ton projet.'], ['Un bilan approfondi et un comité de 6 experts', 'Pour affiner tes pistes et construire ton offre.'], ['Ton plan d\'action et ton guide complet', 'Un plan de 30 jours, des critères de validation et ton guide en PDF.']];
  steps.forEach(([a, b], i) => { const yy = ey + i * 74; box(M + 20, yy, CW - 40, 62); text(String(i + 1), M + 36, yy + 14, 30, 'HR', 26, C.design, { gap: 0 }); text(a, M + 76, yy + 15, CW - 130, 'H', 12.5, C.ink, { gap: 1 }); text(b, M + 76, yy + 33, CW - 130, 'B', 9.5, C.muted); });
  ey += steps.length * 74 + 14;
  if (!full) { setf('B6', 10.5, C.accent); doc.text('Découvrir la version complète', M, ey, { width: CW, align: 'center', link: `${site}/#offre`, underline: true }); ey += 40; }
  const msg = full ? t(g.vision?.message, 300) : '';
  if (msg) ey = text(msg, M + 40, ey + 4, CW - 80, 'HI', 13, C.accent, { align: 'center', gap: 3 }) + 14;
  if (full && g.ancre) ey = text(`« ${t(g.ancre, 200)} »`, M + 40, ey + 4, CW - 80, 'HI', 12, C.muted, { align: 'center', gap: 3 }) + 14;
  const dis = 'Le Human Design est une grille de lecture de soi, pas une science validée : il inspire des questions mais ne décide jamais de ton projet. Garde ce qui te parle et teste-le dans la réalité. Une partie de ce document est générée par intelligence artificielle et peut comporter des erreurs ; il ne remplace pas un conseil professionnel. Aucun résultat commercial n\'est garanti.';
  text(dis, M + 20, H - 190, CW - 40, 'B', 8, C.muted, { align: 'center', gap: 2.5 });
  text('Ma Boussole Business by Business Design · Harmonie Group · 69 rue du Rouet, Marseille', M, H - 140, CW, 'B', 8, C.muted, { align: 'center' });

  /* ----- pieds de page ----- */
  const range = doc.bufferedPageRange();
  for (let i = 1; i < range.count; i++) {
    doc.switchToPage(i);
    doc.page.margins.bottom = 0;
    doc.save(); doc.moveTo(M, H - 54).lineTo(W - M, H - 54).lineWidth(0.5).stroke(C.line); doc.restore();
    eyebrow('Ma Boussole Business · by Business Design', M, H - 44, CW / 2, C.muted);
    eyebrow(`${i + 1}`, W - M - 60, H - 44, 60, C.muted, 'right');
  }
  doc.end();
  await done;
  return Buffer.concat(chunks);
}
