/* transits.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   Personal horoscope arithmetic: where the planets are at a moment, how they touch a natal chart
   (chart.js), the exact moments those contacts peak, retrograde stations, and which natal house the
   Sun and Moon are passing through. Load after astronomy.browser.min.js, astro.js and chart.js.

   METHOD. A moving planet's longitude is sampled (daily, or every 2 hours for the Moon); for each
   natal point and aspect angle the signed distance to the exact aspect is checked for a change of sign
   between samples, then the moment is found by bisection to under a minute. Stations are the moments
   a planet's daily motion changes sign, found the same way. All times are UTC Date objects. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const norm = d => ((d % 360) + 360) % 360;
const wrap = d => ((d + 540) % 360) - 180;                 // -180..180
const DAY = 86400e3;

const MOVERS = ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const FAST = { Sun: 1, Mercury: 1, Venus: 1, Mars: 1 };    // short transits: days; the rest weeks to years
const NATAL = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Ascendant', 'Midheaven'];
const ANGLES = [{ type: 'conjunction', angle: 0, kind: 'conjunction' }, { type: 'sextile', angle: 60, kind: 'easy' },
  { type: 'square', angle: 90, kind: 'hard' }, { type: 'trine', angle: 120, kind: 'easy' }, { type: 'opposition', angle: 180, kind: 'hard' }];
/* Orb within which a transit counts as "in effect now". Tighter than natal orbs, as is usual for transits. */
const ORB = { Sun: 2, Mercury: 2, Venus: 2, Mars: 2, Jupiter: 2, Saturn: 2, Uranus: 1.5, Neptune: 1.5, Pluto: 1.5 };

const lon = (key, t) => NS.eclLon(key, new Date(t));
function speed(key, t){ return wrap(lon(key, t + DAY / 2) - lon(key, t - DAY / 2)); }

/* The natal points a transit can touch. Ascendant and Midheaven only with a birth time. */
function natalPoints(c){
  const pts = c.planets.filter(p => NATAL.includes(p.key)).map(p => ({ key: p.key, lon: p.lon }));
  if (c.angles) pts.push({ key: 'Ascendant', lon: c.angles.asc }, { key: 'Midheaven', lon: c.angles.mc });
  return pts;
}
/* Exact-aspect targets for one natal longitude: 0 and 180 once, the others on both sides. */
function targets(natalLon){
  const out = [];
  ANGLES.forEach(a => { out.push(Object.assign({ at: norm(natalLon + a.angle) }, a));
    if (a.angle && a.angle !== 180) out.push(Object.assign({ at: norm(natalLon - a.angle) }, a)); });
  return out;
}
function bisect(key, at, t0, t1){
  let f0 = wrap(lon(key, t0) - at);
  for (let i = 0; i < 40 && t1 - t0 > 30e3; i++) {
    const tm = (t0 + t1) / 2, fm = wrap(lon(key, tm) - at);
    if ((fm < 0) === (f0 < 0)) { t0 = tm; f0 = fm; } else t1 = tm;
  }
  return (t0 + t1) / 2;
}

/* Every exact transit-to-natal hit between two instants. Options: movers (default all nine). */
function hits(c, from, to, opts = {}){
  const movers = opts.movers || MOVERS, pts = natalPoints(c), out = [];
  const t0 = +from, t1 = +to;
  movers.forEach(m => {
    // Fast planets twice a day; Jupiter every 2 days, Saturn to Pluto every 4 (they move under 0.15 deg a day).
    const step = FAST[m] ? DAY / 2 : m === 'Jupiter' ? 2 * DAY : 4 * DAY;
    const ts = []; for (let t = t0; t <= t1 + step; t += step) ts.push(t);
    const L = ts.map(t => lon(m, t));
    pts.forEach(p => targets(p.lon).forEach(tg => {
      for (let i = 1; i < ts.length; i++) {
        const a = wrap(L[i - 1] - tg.at), b = wrap(L[i] - tg.at);
        if (a === 0 || (a < 0) !== (b < 0)) {
          if (Math.abs(a) > 30 || Math.abs(b) > 30) continue;          // a wrap-around, not a crossing
          const t = bisect(m, tg.at, ts[i - 1], ts[i]);
          if (t >= t0 && t <= t1) out.push({ mover: m, natal: p.key, type: tg.type, kind: tg.kind, time: new Date(t), retro: speed(m, t) < 0 });
        }
      }
    }));
  });
  return out.sort((x, y) => x.time - y.time);
}

/* Transits in effect at one moment (within ORB), with whether they are still tightening. */
function active(c, when){
  const t = +when, out = [];
  MOVERS.forEach(m => {
    const L = lon(m, t), L2 = lon(m, t + DAY / 4);
    natalPoints(c).forEach(p => ANGLES.forEach(a => {
      const orb = Math.abs(NS.separation(L, p.lon) - a.angle);
      if (orb > ORB[m]) return;
      const later = Math.abs(NS.separation(L2, p.lon) - a.angle);
      out.push({ mover: m, natal: p.key, type: a.type, kind: a.kind, orb, applying: later < orb, retro: speed(m, t) < 0 });
    }));
  });
  return out.sort((x, y) => x.orb - y.orb);
}

/* For a slow transit in effect now, every pass over the exact point within the window: up to three
   when the planet turns retrograde over it. */
function passes(c, tr, from, to){
  return hits(c, from, to, { movers: [tr.mover] }).filter(h => h.natal === tr.natal && h.type === tr.type);
}

/* Retrograde and direct stations of Mercury to Pluto between two instants. */
function stations(from, to){
  const out = [];
  ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].forEach(m => {
    // One longitude per step, motion from neighbouring samples; inner planets daily, outer every 4 days
    // (their stations are weeks apart), then bisection on the true speed to under a minute.
    const step = FAST[m] ? DAY : 4 * DAY, ts = [];
    for (let t = +from - step; t <= +to + step; t += step) ts.push(t);
    const L = ts.map(t => lon(m, t)), S = L.map((_, i) => i && i < L.length - 1 ? wrap(L[i + 1] - L[i - 1]) : null);
    for (let i = 2; i < ts.length - 1; i++) {
      if ((S[i] < 0) === (S[i - 1] < 0)) continue;
      let a = ts[i - 1], b = ts[i], sa = speed(m, a);
      for (let k = 0; k < 30 && b - a > 60e3; k++) { const mid = (a + b) / 2, sm = speed(m, mid); if ((sm < 0) === (sa < 0)) { a = mid; sa = sm; } else b = mid; }
      const tm = (a + b) / 2;
      if (tm >= +from && tm <= +to) out.push({ planet: m, kind: S[i] < 0 ? 'retrograde' : 'direct', time: new Date(tm), lon: lon(m, tm) });
    }
  });
  return out.sort((x, y) => x.time - y.time);
}

/* Which natal house a moving body is in, and when it next moves into the following house. */
function houseNow(c, key, when){
  if (!c.cusps) return null;
  const t = +when, house = NS.houseOf(lon(key, t), c.angles.asc, c.system, c.cusps);
  const nextCusp = c.cusps[house % 12], step = key === 'Moon' ? 2 * 3600e3 : DAY;
  let a = t, next = null;
  for (let i = 0; i < (key === 'Moon' ? 120 : 400); i++) {
    const b = a + step;
    if (NS.houseOf(lon(key, b), c.angles.asc, c.system, c.cusps) !== house) { next = new Date(bisect(key, nextCusp, a, b)); break; }
    a = b;
  }
  return { house, next };
}

NS.transits = { MOVERS, FAST, NATAL, ANGLES, ORB, natalPoints, targets, hits, active, passes, stations, houseNow, lon, speed };
})(window.TD);
