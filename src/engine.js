// Human Design chart engine — low-precision ephemeris (Schlyter) + bodygraph logic
const HD = (() => {
  const R = Math.PI / 180, D = 180 / Math.PI;
  const rev = x => ((x % 360) + 360) % 360;
  const sin = x => Math.sin(x * R), cos = x => Math.cos(x * R);
  const atan2d = (y, x) => rev(Math.atan2(y, x) * D);

  const dayNum = ms => ms / 864e5 + 2440587.5 - 2451543.5; // days since 2000 Jan 0.0 UT

  function kepler(M, e) {
    let E = M + e * D * sin(M) * (1 + e * cos(M));
    for (let k = 0; k < 8; k++) E = E - (E - e * D * sin(E) - M) / (1 - e * cos(E));
    return E;
  }

  function sun(d) {
    const w = 282.9404 + 4.70935e-5 * d, e = 0.016709 - 1.151e-9 * d, M = rev(356.0470 + 0.9856002585 * d);
    const E = kepler(M, e);
    const xv = cos(E) - e, yv = Math.sqrt(1 - e * e) * sin(E);
    return { lon: rev(Math.atan2(yv, xv) * D + w), r: Math.hypot(xv, yv), M, w };
  }

  const EL = {
    mercury: d => [48.3313 + 3.24587e-5 * d, 7.0047 + 5e-8 * d, 29.1241 + 1.01444e-5 * d, 0.387098, 0.205635 + 5.59e-10 * d, 168.6562 + 4.0923344368 * d],
    venus: d => [76.6799 + 2.4659e-5 * d, 3.3946 + 2.75e-8 * d, 54.891 + 1.38374e-5 * d, 0.72333, 0.006773 - 1.302e-9 * d, 48.0052 + 1.6021302244 * d],
    mars: d => [49.5574 + 2.11081e-5 * d, 1.8497 - 1.78e-8 * d, 286.5016 + 2.92961e-5 * d, 1.523688, 0.093405 + 2.516e-9 * d, 18.6021 + 0.5240207766 * d],
    jupiter: d => [100.4542 + 2.76854e-5 * d, 1.303 - 1.557e-7 * d, 273.8777 + 1.64505e-5 * d, 5.20256, 0.048498 + 4.469e-9 * d, 19.895 + 0.0830853001 * d],
    saturn: d => [113.6634 + 2.3898e-5 * d, 2.4886 - 1.081e-7 * d, 339.3939 + 2.97661e-5 * d, 9.55475, 0.055546 - 9.499e-9 * d, 316.967 + 0.0334442282 * d],
    uranus: d => [74.0005 + 1.3978e-5 * d, 0.7733 + 1.9e-8 * d, 96.6612 + 3.0565e-5 * d, 19.18171 - 1.55e-8 * d, 0.047318 + 7.45e-9 * d, 142.5905 + 0.011725806 * d],
    neptune: d => [131.7806 + 3.0173e-5 * d, 1.77 - 2.55e-7 * d, 272.8461 - 6.027e-6 * d, 30.05826 + 3.313e-8 * d, 0.008606 + 2.15e-9 * d, 260.2471 + 0.005995147 * d]
  };

  function helio(name, d) {
    if (name === 'pluto') {
      const S = 50.03 + 0.033459652 * d, P = 238.95 + 0.003968789 * d;
      const lon = 238.9508 + 0.00400703 * d - 19.799 * sin(P) + 19.848 * cos(P) + 0.897 * sin(2 * P) - 4.956 * cos(2 * P) + 0.61 * sin(3 * P) + 1.211 * cos(3 * P) - 0.341 * sin(4 * P) - 0.19 * cos(4 * P) + 0.128 * sin(5 * P) - 0.034 * cos(5 * P) - 0.038 * sin(6 * P) + 0.031 * cos(6 * P) + 0.02 * sin(S - P) - 0.01 * cos(S - P);
      const lat = -3.9082 - 5.453 * sin(P) - 14.975 * cos(P) + 3.527 * sin(2 * P) + 1.673 * cos(2 * P) - 1.051 * sin(3 * P) + 0.328 * cos(3 * P) + 0.179 * sin(4 * P) - 0.292 * cos(4 * P) + 0.019 * sin(5 * P) + 0.1 * cos(5 * P) - 0.031 * sin(6 * P) - 0.026 * cos(6 * P) + 0.011 * cos(S - P);
      const r = 40.72 + 6.68 * sin(P) + 6.9 * cos(P) - 1.18 * sin(2 * P) - 0.03 * cos(2 * P) + 0.15 * sin(3 * P) - 0.14 * cos(3 * P);
      return { lon, lat, r };
    }
    const [N, i, w, a, e, M0] = EL[name](d);
    const M = rev(M0), E = kepler(M, e);
    const xv = a * (cos(E) - e), yv = a * Math.sqrt(1 - e * e) * sin(E);
    const v = Math.atan2(yv, xv) * D, r = Math.hypot(xv, yv);
    const xh = r * (cos(N) * cos(v + w) - sin(N) * sin(v + w) * cos(i));
    const yh = r * (sin(N) * cos(v + w) + cos(N) * sin(v + w) * cos(i));
    const zh = r * sin(v + w) * sin(i);
    let lon = atan2d(yh, xh), lat = Math.atan2(zh, Math.hypot(xh, yh)) * D;
    const Mj = rev(19.895 + 0.0830853001 * d), Ms = rev(316.967 + 0.0334442282 * d), Mu = rev(142.5905 + 0.011725806 * d);
    if (name === 'jupiter') lon += -0.332 * sin(2 * Mj - 5 * Ms - 67.6) - 0.056 * sin(2 * Mj - 2 * Ms + 21) + 0.042 * sin(3 * Mj - 5 * Ms + 21) - 0.036 * sin(Mj - 2 * Ms) + 0.022 * cos(Mj - Ms) + 0.023 * sin(2 * Mj - 3 * Ms + 52) - 0.016 * sin(Mj - 5 * Ms - 69);
    if (name === 'saturn') { lon += 0.812 * sin(2 * Mj - 5 * Ms - 67.6) - 0.229 * cos(2 * Mj - 4 * Ms - 2) + 0.119 * sin(Mj - 2 * Ms - 3) + 0.046 * sin(2 * Mj - 6 * Ms - 69) + 0.014 * sin(Mj - 3 * Ms + 32); lat += -0.02 * cos(2 * Mj - 4 * Ms - 2) + 0.018 * sin(2 * Mj - 6 * Ms - 49); }
    if (name === 'uranus') lon += 0.04 * sin(Ms - 2 * Mu + 6) + 0.035 * sin(Ms - 3 * Mu + 33) - 0.015 * sin(Mj - Mu + 20);
    return { lon, lat, r };
  }

  function geo(name, d) {
    const s = sun(d), h = helio(name, d);
    const x = h.r * cos(h.lon) * cos(h.lat) + s.r * cos(s.lon);
    const y = h.r * sin(h.lon) * cos(h.lat) + s.r * sin(s.lon);
    return atan2d(y, x);
  }

  function moonAndNode(d) {
    const N = 125.1228 - 0.0529538083 * d, i = 5.1454, w = 318.0634 + 0.1643573223 * d, e = 0.0549, M = rev(115.3654 + 13.0649929509 * d);
    const E = kepler(M, e);
    const xv = cos(E) - e, yv = Math.sqrt(1 - e * e) * sin(E), v = Math.atan2(yv, xv) * D;
    const xh = cos(N) * cos(v + w) - sin(N) * sin(v + w) * cos(i);
    const yh = sin(N) * cos(v + w) + cos(N) * sin(v + w) * cos(i);
    let lon = atan2d(yh, xh);
    const s = sun(d), Ms = s.M, Ls = rev(s.M + s.w), Lm = rev(N + w + M), Dm = rev(Lm - Ls), F = rev(Lm - N);
    lon += -1.274 * sin(M - 2 * Dm) + 0.658 * sin(2 * Dm) - 0.186 * sin(Ms) - 0.059 * sin(2 * M - 2 * Dm) - 0.057 * sin(M - 2 * Dm + Ms) + 0.053 * sin(M + 2 * Dm) + 0.046 * sin(2 * Dm - Ms) + 0.041 * sin(M - Ms) - 0.035 * sin(Dm) - 0.031 * sin(M + Ms) - 0.015 * sin(2 * F - 2 * Dm) + 0.011 * sin(M - 4 * Dm);
    // true node (Meeus main terms) from mean node
    const node = rev(N - 1.4979 * sin(2 * Dm - 2 * F) - 0.15 * sin(Ms) - 0.1226 * sin(2 * Dm) + 0.1176 * sin(2 * F) - 0.0801 * sin(2 * M - 2 * F));
    return { moon: rev(lon), node };
  }

  function positions(ms) {
    const d = dayNum(ms), s = sun(d), mn = moonAndNode(d);
    return {
      sun: s.lon, earth: rev(s.lon + 180), moon: mn.moon, northNode: mn.node, southNode: rev(mn.node + 180),
      mercury: geo('mercury', d), venus: geo('venus', d), mars: geo('mars', d), jupiter: geo('jupiter', d),
      saturn: geo('saturn', d), uranus: geo('uranus', d), neptune: geo('neptune', d), pluto: geo('pluto', d)
    };
  }

  const ORDER = [41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60];
  function gateOf(lon) {
    const off = rev(lon - 302);
    const idx = Math.floor(off / 5.625);
    return { gate: ORDER[idx], line: Math.floor((off - idx * 5.625) / 0.9375) + 1 };
  }

  const CENTERS = {
    head: [64, 61, 63], ajna: [47, 24, 4, 17, 43, 11], throat: [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16],
    g: [7, 1, 13, 10, 25, 15, 46, 2], heart: [21, 40, 26, 51], sacral: [5, 14, 29, 59, 9, 3, 42, 27, 34],
    solar: [6, 37, 22, 36, 30, 55, 49], spleen: [48, 57, 44, 50, 32, 28, 18], root: [58, 38, 54, 53, 60, 52, 19, 39, 41]
  };
  const GATE_CENTER = {};
  for (const c in CENTERS) for (const g of CENTERS[c]) GATE_CENTER[g] = c;
  const CHANNELS = [[64, 47], [61, 24], [63, 4], [17, 62], [43, 23], [11, 56], [16, 48], [20, 57], [20, 10], [20, 34], [31, 7], [8, 1], [33, 13], [45, 21], [35, 36], [12, 22], [10, 34], [10, 57], [15, 5], [2, 14], [46, 29], [25, 51], [26, 44], [40, 37], [27, 50], [59, 6], [34, 57], [3, 60], [42, 53], [9, 52], [18, 58], [28, 38], [32, 54], [19, 49], [39, 55], [41, 30]];
  const BODIES = ['sun', 'earth', 'northNode', 'southNode', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

  // find design time: sun 88° before natal sun
  function designTime(ms) {
    const target = rev(sun(dayNum(ms)).lon - 88);
    let t = ms - 88.5 * 864e5;
    for (let k = 0; k < 30; k++) {
      let diff = rev(target - sun(dayNum(t)).lon); if (diff > 180) diff -= 360;
      t += diff / 0.9856 * 864e5;
      if (Math.abs(diff) < 1e-7) break;
    }
    return t;
  }

  function chart(utcMs) {
    const pT = utcMs, dT = designTime(utcMs);
    const pp = positions(pT), dp = positions(dT);
    const pers = {}, des = {};
    for (const b of BODIES) { pers[b] = gateOf(pp[b]); des[b] = gateOf(dp[b]); }
    const gates = {}; // gate -> {p:bool,d:bool}
    for (const b of BODIES) {
      (gates[pers[b].gate] ||= { p: false, d: false }).p = true;
      (gates[des[b].gate] ||= { p: false, d: false }).d = true;
    }
    const channels = CHANNELS.filter(([a, b]) => gates[a] && gates[b]);
    const defined = new Set();
    channels.forEach(([a, b]) => { defined.add(GATE_CENTER[a]); defined.add(GATE_CENTER[b]); });
    // connectivity graph among defined centers
    const adj = {};
    channels.forEach(([a, b]) => { const x = GATE_CENTER[a], y = GATE_CENTER[b]; (adj[x] ||= new Set()).add(y); (adj[y] ||= new Set()).add(x); });
    const reach = (from) => { const seen = new Set([from]), st = [from]; while (st.length) { const c = st.pop(); for (const n of adj[c] || []) if (!seen.has(n)) { seen.add(n); st.push(n); } } return seen; };
    const throatReach = defined.has('throat') ? reach('throat') : new Set();
    const motorToThroat = ['sacral', 'solar', 'heart', 'root'].some(m => throatReach.has(m));
    let type;
    if (defined.size === 0) type = 'reflector';
    else if (defined.has('sacral')) type = throatReach.has('sacral') || motorToThroat ? 'mg' : 'generator';
    else type = ['solar', 'heart', 'root'].some(m => throatReach.has(m)) ? 'manifestor' : 'projector';
    if (type === 'mg' && !motorToThroat) type = 'generator';
    let authority;
    if (defined.has('solar')) authority = 'emotional';
    else if (defined.has('sacral')) authority = 'sacral';
    else if (defined.has('spleen')) authority = 'splenic';
    else if (defined.has('heart')) authority = 'ego';
    else if (defined.has('g')) authority = 'self';
    else if (type === 'reflector') authority = 'lunar';
    else authority = 'mental';
    // definition: connected components among defined centers
    const comps = []; const left = new Set(defined);
    while (left.size) { const s0 = left.values().next().value; const r = reach(s0); r.forEach(c => left.delete(c)); comps.push(r); }
    const definition = ['none', 'single', 'split', 'triple', 'quadruple'][Math.min(comps.length, 4)];
    const profile = `${pers.sun.line}/${des.sun.line}`;
    const cross = { p: [pers.sun.gate, pers.earth.gate], d: [des.sun.gate, des.earth.gate] };
    return { type, authority, profile, definition, defined: [...defined], channels, gates, pers, des, cross, designMs: dT };
  }

  // local wall time in IANA zone -> UTC ms
  function zoneOffset(ms, zone) {
    const f = new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const p = Object.fromEntries(f.formatToParts(new Date(ms)).map(x => [x.type, x.value]));
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - ms;
  }
  function localToUtc(y, mo, da, h, mi, zone) {
    const guess = Date.UTC(y, mo - 1, da, h, mi);
    let utc = guess - zoneOffset(guess, zone);
    utc = guess - zoneOffset(utc, zone);
    return utc;
  }

  return { chart, positions, gateOf, localToUtc, CENTERS, CHANNELS, GATE_CENTER, dayNum, sun };
})();
if (typeof module !== 'undefined') module.exports = HD;
