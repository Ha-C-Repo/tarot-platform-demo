/* signs.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   Horoscopes for the twelve signs, computed from the real sky so nobody has to write daily copy.
   Load after astronomy.browser.min.js, astro.js, chart.js and transits.js.

   METHOD (stated on signs.html). Solar houses, the usual method of sun-sign columns: the sign itself is
   the 1st house, the next sign the 2nd, and so on round the zodiac. A planet's house for a sign is
   therefore the count from that sign to the planet's sign. On top of that:
   - Moon: which solar house it is in during the day, with the moment it moves on (ingress by bisection).
   - Sun to Pluto: the dates each enters a new sign, inside the window.
   - Aspects between the moving planets (conjunction, sextile, square, trine, opposition) that are exact
     inside the window, found by sampling and bisection like transits.js; the same for every sign, with
     the house where it lands added per sign.
   - New and full moons (Meeus, astro.js), with the house they fall in.
   - Retrograde and direct stations (transits.js).
   All times are UTC Date objects; the page shows them in the visitor's time zone. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const DAY = 86400e3;
const norm = d => ((d % 360) + 360) % 360;
const wrap = d => ((d + 540) % 360) - 180;
const BODIES = ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const PLANETS_IN_HOUSE = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const FAST = { Moon: 1, Sun: 1, Mercury: 1, Venus: 1, Mars: 1 };
const ANG = [{ type: 'conjunction', angle: 0, kind: 'conjunction' }, { type: 'sextile', angle: 60, kind: 'easy' },
  { type: 'square', angle: 90, kind: 'hard' }, { type: 'trine', angle: 120, kind: 'easy' }, { type: 'opposition', angle: 180, kind: 'hard' }];
/* Pairs that can never reach an aspect: Mercury stays within 28 deg of the Sun, Venus within 47, and the two within 76 of each other. */
const NEVER = { 'Sun|Mercury': ['easy', 'hard'], 'Sun|Venus': ['easy', 'hard'], 'Mercury|Venus': ['hard'] };

const lon = (key, t) => NS.eclLon(key, new Date(t));
const signIdx = l => Math.floor(norm(l) / 30);
const house = (l, sign) => ((signIdx(l) - sign + 12) % 12) + 1;
function speed(key, t){ return wrap(lon(key, t + DAY / 2) - lon(key, t - DAY / 2)); }

/* Moment a body crosses longitude `at` between t0 and t1 (bisection to 30 s). */
function cross(key, at, t0, t1){
  let f0 = wrap(lon(key, t0) - at);
  for (let i = 0; i < 40 && t1 - t0 > 30e3; i++) {
    const tm = (t0 + t1) / 2, fm = wrap(lon(key, tm) - at);
    if ((fm < 0) === (f0 < 0)) { t0 = tm; f0 = fm; } else t1 = tm;
  }
  return (t0 + t1) / 2;
}
const stepFor = key => key === 'Moon' ? 2 * 3600e3 : FAST[key] ? DAY / 2 : key === 'Jupiter' ? 2 * DAY : 4 * DAY;

/* Every sign change of a body between two instants: { key, sign (index entered), from (index left), time, retro }. */
function ingresses(key, from, to){
  const out = [], step = stepFor(key);
  let ta = +from, sa = signIdx(lon(key, ta));
  for (let tb = ta + step; ta < +to; ta = tb, tb += step) {
    const t = Math.min(tb, +to), sb = signIdx(lon(key, t));
    if (sb !== sa) {
      const forward = ((sb - sa + 12) % 12) === 1, cusp = forward ? sb * 30 : sa * 30;
      out.push({ key, sign: sb, from: sa, time: new Date(cross(key, cusp, ta, t)), retro: !forward });
      sa = sb;
    }
    if (t >= +to) break;
  }
  return out;
}

/* The Moon's solar houses for one sign over a window: [{ house, from, to }]. */
function moonPath(sign, from, to){
  const ing = ingresses('Moon', from, to);
  const segs = []; let start = +from, h = house(lon('Moon', start), sign);
  ing.forEach(i => { segs.push({ house: h, from: new Date(start), to: i.time }); start = +i.time; h = ((i.sign - sign + 12) % 12) + 1; });
  segs.push({ house: h, from: new Date(start), to: new Date(+to) });
  return segs;
}

/* Exact aspects between two moving planets inside the window. */
function aspects(from, to, bodies = BODIES){
  const out = [];
  /* One shared grid of longitudes: every half day if any fast body is in play, else every 2 days.
     Slow pairs read every 4th sample of the half-day grid. */
  const anyFast = bodies.some(k => FAST[k]), base = anyFast ? DAY / 2 : 2 * DAY;
  const ts = []; for (let t = +from; t <= +to + 2 * DAY; t += base) ts.push(t);
  const L = {}; bodies.forEach(k => { L[k] = ts.map(t => lon(k, t)); });
  for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
    const A = bodies[i], B = bodies[j], pk = A + '|' + B;
    const every = FAST[A] || FAST[B] || !anyFast ? 1 : 4;
    const idx = []; for (let k = 0; k < ts.length; k += every) idx.push(k);
    if (idx[idx.length - 1] !== ts.length - 1) idx.push(ts.length - 1);
    const D = idx.map(k => wrap(L[A][k] - L[B][k]));
    ANG.forEach(a => {
      if ((NEVER[pk] || []).includes(a.kind)) return;
      (a.angle && a.angle !== 180 ? [a.angle, -a.angle] : [a.angle]).forEach(target => {
        for (let k = 1; k < idx.length; k++) {
          const f0 = wrap(D[k - 1] - target), f1 = wrap(D[k] - target);
          if (!(f0 === 0 || (f0 < 0) !== (f1 < 0)) || Math.abs(f0) > 30 || Math.abs(f1) > 30) continue;
          let t0 = ts[idx[k - 1]], t1 = ts[idx[k]], g0 = f0;
          for (let n = 0; n < 40 && t1 - t0 > 30e3; n++) {
            const tm = (t0 + t1) / 2, gm = wrap(wrap(lon(A, tm) - lon(B, tm)) - target);
            if ((gm < 0) === (g0 < 0)) { t0 = tm; g0 = gm; } else t1 = tm;
          }
          const t = (t0 + t1) / 2;
          if (t >= +from && t <= +to) out.push({ a: A, b: B, type: a.type, kind: a.kind, time: new Date(t), lonA: lon(A, t), lonB: lon(B, t) });
        }
      });
    });
  }
  return out.sort((x, y) => x.time - y.time);
}

/* New and full moons inside the window, with the Moon's longitude at that moment. */
function lunations(from, to){
  const out = [], jd0 = NS.toJD(new Date(+from) ), jd1 = NS.toJD(new Date(+to));
  [['new', NS.nextNewMoon], ['full', NS.nextFullMoon]].forEach(([kind, next]) => {
    let jd = next(jd0 - 0.0001);
    for (let n = 0; n < 30 && jd <= jd1; n++) {
      const time = NS.fromJD(jd);
      if (+time >= +from) out.push({ kind, time, lon: lon('Moon', +time) });
      jd = next(jd + 1);
    }
  });
  return out.sort((x, y) => x.time - y.time);
}

/* Where each planet is for a sign at one moment: { key, house, sign, retro }. */
function placements(sign, when){
  return ['Sun', 'Moon'].concat(PLANETS_IN_HOUSE).map(key => {
    const l = lon(key, +when);
    return { key, lon: l, sign: signIdx(l), house: house(l, sign), retro: key !== 'Sun' && key !== 'Moon' && speed(key, +when) < 0 };
  });
}

/* Text keys (js/data/signs-text.js) for an aspect: the pair in BODIES order, and its kind. */
const skyKey = x => `sky:${x.a}|${x.b}:${x.kind}`;
function allKeys(){
  const k = [];
  PLANETS_IN_HOUSE.forEach(p => { for (let h = 1; h <= 12; h++) k.push(`pin:${p}:${h}`); });
  for (let i = 0; i < BODIES.length; i++) for (let j = i + 1; j < BODIES.length; j++)
    ['conjunction', 'easy', 'hard'].forEach(kind => { if (!(NEVER[BODIES[i] + '|' + BODIES[j]] || []).includes(kind)) k.push(`sky:${BODIES[i]}|${BODIES[j]}:${kind}`); });
  for (let h = 1; h <= 12; h++) k.push(`lunation:new:${h}`, `lunation:full:${h}`);
  for (let h = 1; h <= 12; h++) k.push(`area:${h}`);
  return k;
}

NS.signs = { BODIES, PLANETS_IN_HOUSE, NEVER, house, signIdx, ingresses, moonPath, aspects, lunations, placements, skyKey, allKeys, lon, speed };
})(window.TD);
