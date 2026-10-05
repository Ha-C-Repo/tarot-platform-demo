/* factors.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   Chart factors shared by the report suite (pastlife.html, karmic.html and the reports that follow): the
   lunar nodal axis, natal retrogrades, planets on the nodes, element / modality / hemisphere emphasis, the
   Part of Fortune, planet strength, chakra emphasis, the Cayce-style sidereal decanates, the Golden Dawn
   decan card, the Atmakaraka and the astro-numerology convergence. Arithmetic only: each function returns
   text KEYS; the texts live in js/data/report-text.js (and the existing natal, vedic and card texts).
   Load after astro.js, chart.js, natal.js, vedic.js and numerology.js (and data/correspondences.js for cards). */
window.TD = window.TD || {};
(function(NS){
'use strict';
const norm = d => ((d % 360) + 360) % 360;
const signIdx = lon => Math.floor(norm(lon) / 30);
const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
/* Modern rulers: the Cayce-style decanate rulers include Uranus, Neptune and Pluto. */
const MODERN = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Pluto', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
const house = (c, lon) => c.angles ? NS.houseOf(lon, c.angles.asc, c.system, c.cusps) : null;

/* ---------- lunar nodes (mean node, as the rest of the site) ---------- */
function nodes(c){
  const nn = norm(c.node), sn = norm(c.node + 180);
  const out = { nn: { lon: nn, sign: signIdx(nn), house: house(c, nn) }, sn: { lon: sn, sign: signIdx(sn), house: house(c, sn) } };
  out.signKey = 'node:' + NS.SIGNS[out.sn.sign];
  out.houseKey = out.sn.house ? 'nodehouse:' + out.sn.house : null;
  out.snRuler = MODERN[out.sn.sign];
  return out;
}
/* Planets within orb of either node. With no birth time the Moon is left out (it moves ~13 deg a day). */
function onNodes(c, orb = 8){
  const n = nodes(c), out = [];
  c.planets.forEach(p => {
    if (!c.timeKnown && p.key === 'Moon') return;
    const dn = NS.separation(p.lon, n.nn.lon), ds = NS.separation(p.lon, n.sn.lon);
    if (dn <= orb) out.push({ key: p.key, end: 'nn', orb: dn, textKey: 'nn:' + p.key });
    else if (ds <= orb) out.push({ key: p.key, end: 'sn', orb: ds, textKey: 'sn:' + p.key });
  });
  return out.sort((a, b) => a.orb - b.orb);
}
const retrogrades = c => c.planets.filter(p => p.retro && !/^(Sun|Moon)$/.test(p.key)).map(p => ({ key: p.key, textKey: 'nretro:' + p.key }));

/* ---------- emphasis: high = 4+ of the ten planets in an element, 5+ in a modality; low = 0-1. Hemispheres: 7+ of 10 ---------- */
function emphasis(c){
  const el = { Fire: 0, Earth: 0, Air: 0, Water: 0 }, mod = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  c.planets.forEach(p => { const s = signIdx(p.lon); el[NS.elementOf(s)]++; mod[NS.modalityOf(s)]++; });
  const keys = [];
  Object.entries(el).forEach(([k, n]) => { if (n >= 4) keys.push('elem:' + k + ':high'); else if (n <= 1) keys.push('elem:' + k + ':low'); });
  Object.entries(mod).forEach(([k, n]) => { if (n >= 5) keys.push('mode:' + k + ':high'); else if (n <= 1) keys.push('mode:' + k + ':low'); });
  if (c.angles) {
    const above = c.planets.filter(p => p.house >= 7).length, east = c.planets.filter(p => p.house >= 10 || p.house <= 3).length;
    if (above >= 7) keys.push('hemi:South'); if (above <= 3) keys.push('hemi:North');
    if (east >= 7) keys.push('hemi:East'); if (east <= 3) keys.push('hemi:West');
  }
  return { el, mod, keys };
}
function fortune(c){
  if (c.fortune == null) return null;
  const s = signIdx(c.fortune), h = house(c, c.fortune);
  return { lon: c.fortune, sign: s, house: h, keys: ['fortune:' + NS.SIGNS[s], 'fortune:' + h] };
}

/* ---------- planet strength: a simple, stated score used to rank planets ----------
   angular house (1, 4, 7, 10) +2; within 8 deg of the Ascendant or Midheaven axis +1; domicile or exaltation +2,
   detriment or fall -1; conjunct the Sun or Moon +1; +0.25 per major aspect; hard aspects counted apart as stress. */
function strength(c){
  const asp = NS.natal.aspects(c).filter(a => PLANETS.includes(a.a) && PLANETS.includes(a.b) && !a.uncertain);
  return PLANETS.map(k => {
    const p = c.planets.find(x => x.key === k);
    let s = 0;
    if (p.house && [1, 4, 7, 10].includes(p.house)) s += 2;
    if (c.angles && [c.angles.asc, c.angles.mc].some(a => NS.separation(p.lon, a) <= 8 || NS.separation(p.lon, a + 180) <= 8)) s += 1;
    const d = NS.natal.dignity(k, p.lon);
    if (d === 'domicile' || d === 'exaltation') s += 2; else if (d) s -= 1;
    const mine = asp.filter(a => a.a === k || a.b === k);
    if (mine.some(a => a.type === 'conjunction' && /^(Sun|Moon)$/.test(a.a === k ? a.b : a.a))) s += 1;
    s += 0.25 * mine.length;
    const hard = mine.filter(a => a.type === 'square' || a.type === 'opposition').length, soft = mine.filter(a => a.type === 'trine' || a.type === 'sextile').length;
    return { key: k, score: s, hard, soft };
  }).sort((a, b) => b.score - a.score || PLANETS.indexOf(a.key) - PLANETS.indexOf(b.key)).map((x, i) => Object.assign(x, { rank: i + 1 }));
}

/* ---------- chakras (one common modern Western mapping; outer planets count half) ---------- */
const CHAKRAS = [['Root', ['Saturn', 'Pluto']], ['Sacral', ['Jupiter']], ['Solar Plexus', ['Mars']], ['Heart', ['Venus']],
  ['Throat', ['Mercury']], ['Third Eye', ['Moon', 'Uranus']], ['Crown', ['Sun', 'Neptune']]];
function chakras(c, st = strength(c)){
  const sc = k => st.find(x => x.key === k).score;
  const rows = CHAKRAS.map(([name, pl]) => ({ name, planets: pl, score: sc(pl[0]) + (pl[1] ? 0.5 * sc(pl[1]) : 0) / 1 }));
  const order = rows.slice().sort((a, b) => b.score - a.score);
  rows.forEach(r => { const i = order.indexOf(r); r.state = i < 2 ? 'strong' : i >= 5 ? 'quiet' : 'balanced'; r.textKey = `chakra:${r.name}:${r.state}`; });
  return rows;
}

/* ---------- Cayce-style sidereal decanates ----------
   Triplicity (drekkana) decans: the decans of a sign are that sign and the next two of its element. The ruler
   (modern) of the decan's sign is the "past-life planet", read as the realm of the interlife sojourn. */
function decanOf(lon){
  const s = signIdx(lon), d = Math.floor((norm(lon) - s * 30) / 10), ds = (s + 4 * d) % 12;
  return { sign: s, decan: d + 1, decanSign: ds, ruler: MODERN[ds] };
}
function sojourns(c, mode = 'fagan'){
  const side = (lon, when) => NS.vedic.sidereal(lon, when, mode);
  const sun = c.planets[0], moon = c.planets[1];
  const out = { mode, ayanamsa: NS.vedic.ayanamsa(c.utc, mode).true,
    sun: Object.assign({ body: 'Sun', lon: side(sun.lon, c.utc) }, decanOf(side(sun.lon, c.utc))) };
  out.moon = Object.assign({ body: 'Moon', lon: side(moon.lon, c.utc) }, decanOf(side(moon.lon, c.utc)));
  if (!c.timeKnown && moon.range) {             // no time: is the Moon's decan the same all day?
    const a = decanOf(side(moon.range[0], new Date(c.daySpan.start))), b = decanOf(side(moon.range[1], new Date(c.daySpan.end)));
    if (a.sign !== b.sign || a.decan !== b.decan) out.moon.alternatives = [a, b];
  }
  out.planets = [...new Set([out.sun.ruler].concat(out.moon.alternatives ? [] : [out.moon.ruler]))];
  return out;
}
/* Tropical and sidereal sign of a point, flagged when they differ (the Cayce report reads both). */
function bothZodiacs(lon, when, mode = 'fagan'){
  const t = signIdx(lon), s = signIdx(NS.vedic.sidereal(lon, when, mode));
  return { tropical: NS.SIGNS[t], sidereal: NS.SIGNS[s], differ: t !== s };
}
/* Golden Dawn decan card (the Two to Ten of a suit) for a longitude, from js/data/correspondences.js's system. */
const PIP_SIGNS = { wands: ['Aries', 'Leo', 'Sagittarius'], cups: ['Cancer', 'Scorpio', 'Pisces'], swords: ['Libra', 'Aquarius', 'Gemini'], pentacles: ['Capricorn', 'Taurus', 'Virgo'] };
function decanCard(lon){
  const s = signIdx(lon), d = Math.floor((norm(lon) - s * 30) / 10), sign = NS.SIGNS[s];
  const suit = Object.keys(PIP_SIGNS).find(k => PIP_SIGNS[k].includes(sign)), n = 2 + PIP_SIGNS[suit].indexOf(sign) * 3 + d;
  const CHALDEAN = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
  return { id: suit + '-' + String(n).padStart(2, '0'), suit, n, sign, decan: d + 1, planet: CHALDEAN[(2 + s * 3 + d) % 7] };
}

/* ---------- Atmakaraka (Jaimini): highest degree within its sign among Sun-Saturn, sidereal Lahiri ---------- */
function atmakaraka(v){
  const g = v.grahas.filter(x => !/^(Rahu|Ketu)$/.test(x.key)).sort((a, b) => b.deg - a.deg)[0];
  return { key: g.key, deg: g.deg, sign: g.sign, textKey: 'ak:' + g.key };
}

/* ---------- astro-numerology convergence ----------
   Each system votes for planets. A planet backed by two or more systems is a "core theme".
   numerology: Life Path 3, Expression 2, Soul Urge 2, Birthday 1, each karmic debt 2 (Chaldean planets);
   chart: strength rank 1-3 scores 3/2/1; cayce: each sojourn planet 3; vedic: Atmakaraka 2; karmic: South Node ruler 2. */
const W = { lifePath: 3, expression: 2, soulUrge: 2, birthday: 1 };
const LABEL = { lifePath: 'Life Path', expression: 'Expression', soulUrge: 'Soul Urge', birthday: 'Birthday' };
function convergence(c, v, num, karmic, soj, st = strength(c)){
  const votes = {};
  const vote = (k, sys, pts, why) => { const x = votes[k] || (votes[k] = { key: k, score: 0, systems: new Set(), why: [] }); x.score += pts; x.systems.add(sys); x.why.push(why); };
  const NP = NS.NUMBER_PLANET;
  if (num) Object.entries(W).forEach(([f, w]) => { const n = num[f]; if (n && NP[n]) NP[n].forEach(p => vote(p, 'numerology', w, `${LABEL[f]} ${n}`)); });
  if (karmic) karmic.debts.forEach(d => NS.DEBT_PLANET[d.n].forEach(p => vote(p, 'numerology', 2, `karmic debt ${d.n}`)));
  st.slice(0, 3).forEach((x, i) => vote(x.key, 'chart', 3 - i, `chart strength #${i + 1}`));
  if (soj) soj.planets.forEach(p => vote(p, 'cayce', 3, 'interlife sojourn'));
  if (v) { const ak = atmakaraka(v); vote(ak.key, 'vedic', 2, 'Atmakaraka'); }
  const n = nodes(c); vote(n.snRuler, 'karmic', 2, 'South Node ruler');
  const all = Object.values(votes).map(x => Object.assign(x, { systems: [...x.systems] })).sort((a, b) => b.systems.length - a.systems.length || b.score - a.score);
  /* Each core number: its planet is backed by the chart (rank <= 4 of 10) -> numecho; quiet (rank >= 8) or more hard
     than soft aspects -> numtension; otherwise numecho if rank <= 6 else numtension. */
  const numbers = !num ? [] : Object.keys(W).filter(f => num[f] && NP[num[f]]).map(f => {
    const n = num[f], ranks = NP[n].map(p => st.find(x => x.key === p)), best = ranks.sort((a, b) => a.rank - b.rank)[0];
    const backed = best.rank <= 4 || (best.rank <= 6 && best.hard <= best.soft);
    return { field: f, n, planets: NP[n], best: best.key, rank: best.rank, backed, textKey: (backed ? 'numecho:' : 'numtension:') + n };
  });
  const seen = new Set();
  return { votes: all, core: all.filter(x => x.systems.length >= 2).slice(0, 3), numbers: numbers.filter(x => !seen.has(x.textKey) && seen.add(x.textKey)) };
}

/* ---------- house cusps and house rulers (traditional rulers, as the Birth chart page's chart ruler) ---------- */
const cuspSign = (c, n) => c.cusps ? signIdx(c.cusps[n - 1]) : null;
function houseRulers(c){
  if (!c.cusps) return null;
  return Array.from({ length: 12 }, (_, i) => {
    const s = cuspSign(c, i + 1), key = NS.natal.RULER[s], p = c.planets.find(x => x.key === key);
    return { house: i + 1, sign: s, ruler: key, in: p.house, textKey: `ruler:${i + 1}:${p.house}` };
  });
}
/* ---------- out of bounds: declination beyond the Sun's greatest (the true obliquity of the date) ----------
   Geocentric apparent declination of date from Astronomy Engine (GeoVector, J2000 -> equator of date). */
function declination(key, date){
  const A = window.Astronomy, t = A.MakeTime(date);
  const v = A.RotateVector(A.Rotation_EQJ_EQD(t), A.GeoVector(A.Body[key], t, true));
  return A.EquatorFromVector(v).dec;
}
function outOfBounds(c){
  const A = window.Astronomy, limit = A.e_tilt(A.MakeTime(c.utc)).tobl;
  return c.planets.filter(p => p.key !== 'Sun' && !(p.key === 'Moon' && !c.timeKnown)).map(p => ({ key: p.key, dec: declination(p.key, c.utc) }))
    .filter(x => Math.abs(x.dec) > limit).map(x => Object.assign(x, { limit, textKey: 'oob:' + x.key }));
}

NS.factors = { cuspSign, houseRulers, declination, outOfBounds, PLANETS, MODERN, nodes, onNodes, retrogrades, emphasis, fortune, strength, CHAKRAS, chakras, decanOf, sojourns, bothZodiacs, decanCard, atmakaraka, convergence };
})(window.TD);
