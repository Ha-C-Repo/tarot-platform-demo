/* chart.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   Natal charts, houses, aspects, synastry and composite charts.

   Planet positions come from Astronomy Engine (MIT, vendored in js/vendor/), which must be
   loaded before this file. Everything here runs in the browser: nothing is sent anywhere.

   Positions are apparent geocentric longitudes on the true ecliptic and equinox of date,
   the tropical zodiac astrologers use. Houses: Whole Sign (default) or Equal, both measured
   from the Ascendant. Local birth time is converted to UTC with the browser's own IANA
   time-zone database, which carries historical daylight-saving rules. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const RAD = Math.PI / 180;
const norm = d => ((d % 360) + 360) % 360;
const AE = () => window.Astronomy;

const T = '︎';   // text presentation, so these never render as emoji
const BODIES = [
  {key:'Sun', glyph:'☉'}, {key:'Moon', glyph:'☽'}, {key:'Mercury', glyph:'☿'},
  {key:'Venus', glyph:'♀' + T}, {key:'Mars', glyph:'♂' + T}, {key:'Jupiter', glyph:'♃'},
  {key:'Saturn', glyph:'♄'}, {key:'Uranus', glyph:'♅'}, {key:'Neptune', glyph:'♆'},
  {key:'Pluto', glyph:'♇'}
];

/* ---------- time: local wall clock at a place -> UTC instant ---------- */
const fmtCache = {};
function tzOffsetMs(utcMs, tz){
  const f = fmtCache[tz] || (fmtCache[tz] = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', era: 'short' }));
  const p = {};
  f.formatToParts(new Date(utcMs)).forEach(x => { p[x.type] = x.value; });
  let y = +p.year; if (p.era && /^B/.test(p.era)) y = 1 - y;
  const asUTC = Date.UTC(y, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
  return asUTC - Math.floor(utcMs / 1000) * 1000;
}
/* Returns {utc, offsetMin, status, altUtc?}. status:
   'ok'        the wall-clock time happened exactly once
   'ambiguous' it happened twice (clocks went back); the FIRST occurrence is used
   'gap'       it never happened (clocks went forward); read as the same moment on the old offset */
function localToUTC(y, mo, d, h, mi, tz){
  const L = Date.UTC(y, mo - 1, d, h, mi);
  const probes = [L - 36 * 3600e3, L - 12 * 3600e3, L, L + 12 * 3600e3, L + 36 * 3600e3];
  const offs = [...new Set(probes.map(p => tzOffsetMs(p, tz)))];
  const hits = [];
  offs.forEach(o => { const u = L - o; if (tzOffsetMs(u, tz) === o && !hits.includes(u)) hits.push(u); });
  hits.sort((a, b) => a - b);
  if (hits.length === 1) return { utc: hits[0], offsetMin: (L - hits[0]) / 60000, status: 'ok' };
  if (hits.length > 1) return { utc: hits[0], offsetMin: (L - hits[0]) / 60000, status: 'ambiguous',
                                altUtc: hits[hits.length - 1], altOffsetMin: (L - hits[hits.length - 1]) / 60000 };
  const before = tzOffsetMs(L - 36 * 3600e3, tz);
  return { utc: L - before, offsetMin: before / 60000, status: 'gap' };
}
function fmtOffset(min){
  const s = min < 0 ? '−' : '+', a = Math.abs(min), h = Math.floor(a / 60), m = Math.round(a % 60);
  return 'UTC' + s + h + (m ? ':' + String(m).padStart(2, '0') : '');
}

/* ---------- positions ---------- */
function eclLon(key, date){
  const v = AE().GeoVector(AE().Body[key], date, true);
  return AE().Ecliptic(v).elon;
}
function positions(date){
  const d1 = new Date(date.getTime() - 43200e3), d2 = new Date(date.getTime() + 43200e3);
  return BODIES.map(b => {
    const lon = eclLon(b.key, date);
    let sp = eclLon(b.key, d2) - eclLon(b.key, d1);
    if (sp > 180) sp -= 360; if (sp < -180) sp += 360;
    return { key: b.key, glyph: b.glyph, lon, speed: sp, retro: sp < 0 };
  });
}
/* Chiron from the JPL table in js/data/chiron.js (TD.CHIRON, load it first; without it Chiron is left out).
   Cubic interpolation of the heliocentric J2000 vector, minus the Earth's heliocentric vector, corrected for
   light time, then turned into the true ecliptic of date like the planets. null outside 1900-2100. */
function chironLon(date){
  const C = NS.CHIRON; if (!C) return null;
  const at = tdbJD => {
    const f = (tdbJD - C.jd0) / C.step, i = Math.floor(f), u = f - i;
    if (i < 1 || i + 2 >= C.n) return null;
    const w = [-u * (u - 1) * (u - 2) / 6, (u + 1) * (u - 1) * (u - 2) / 2, -(u + 1) * u * (u - 2) / 2, (u + 1) * u * (u - 1) / 6];
    return [0, 1, 2].map(k => w.reduce((s, wj, j) => s + wj * C.xyz[(i - 1 + j) * 3 + k], 0) / 1e6);
  };
  const time = AE().MakeTime(date), jd = time.tt + 2451545.0, earth = AE().HelioVector(AE().Body.Earth, time);
  const rot = AE().Rotation_ECL_EQJ();
  let v = null, lt = 0;
  for (let k = 0; k < 2; k++) {                       // light time: where Chiron was when the light left it
    const h = at(jd - lt); if (!h) return null;
    const e = AE().RotateVector(rot, new (AE().Vector)(h[0], h[1], h[2], time));
    v = new (AE().Vector)(e.x - earth.x, e.y - earth.y, e.z - earth.z, time);
    lt = Math.hypot(v.x, v.y, v.z) / 173.1446;        // AU per day at the speed of light
  }
  return AE().Ecliptic(v).elon;
}
/* Black Moon Lilith, the mean lunar apogee: Meeus (Astronomical Algorithms, 2nd ed.) ch. 50, mean perigee + 180. */
function meanLilith(date){
  const t = (AE().MakeTime(date).tt) / 36525;
  return norm(83.3532465 + 4069.0137287 * t - 0.0103200 * t * t - t * t * t / 80053 + t * t * t * t / 18999000 + 180);
}
/* Mean lunar node, Meeus (Astronomical Algorithms, 2nd ed.) eq. 47.7 */
function meanNode(date){
  const t = (AE().MakeTime(date).tt) / 36525;
  return norm(125.0445479 - 1934.1362891 * t + 0.0020754 * t * t + t * t * t / 467441 - t * t * t * t / 60616000);
}

/* ---------- angles and houses ---------- */
/* The ecliptic point rising on the eastern horizon when the local sidereal angle is ramc (degrees). */
function ascFor(ramc, eps, phi){
  const r = ramc * RAD;
  let asc = norm(Math.atan2(Math.cos(r), -(Math.sin(r) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))) / RAD);
  // The formula can return the western (setting) point near the poles; if so, take the opposite point.
  const raAsc = Math.atan2(Math.sin(asc * RAD) * Math.cos(eps), Math.cos(asc * RAD)) / RAD;
  const ha = norm(ramc - raAsc);
  return ha > 0 && ha < 180 ? { asc: norm(asc + 180), flipped: true } : { asc, flipped: false };
}
function angles(date, lat, lon){
  const time = AE().MakeTime(date);
  const eps = AE().e_tilt(time).tobl * RAD;
  const ramc = norm(AE().SiderealTime(date) * 15 + lon);         // local apparent sidereal time, degrees
  const r = ramc * RAD, phi = lat * RAD;
  const mc = norm(Math.atan2(Math.sin(r), Math.cos(r) * Math.cos(eps)) / RAD);
  const { asc, flipped } = ascFor(ramc, eps, phi);
  return { asc, mc, ramc, lst: ramc / 15, obliquity: eps / RAD, lat, flipped };
}
const HOUSE_SYSTEMS = { placidus: 'Placidus', koch: 'Koch', whole: 'Whole Sign', equal: 'Equal' };
const QUADRANT = { placidus: 1, koch: 1 };
/* Ecliptic longitude of the point with right ascension ra (degrees). */
const lonOfRA = (ra, eps) => norm(Math.atan2(Math.sin(ra * RAD), Math.cos(ra * RAD) * Math.cos(eps)) / RAD);
/* Placidus: cusps 11, 12, 2, 3 trisect each point's own diurnal or nocturnal semi-arc in time
   (iterated; converges in a few steps). Undefined where points never rise or set (|lat| > ~66.5). */
function placidus(a){
  const eps = a.obliquity * RAD, phi = a.lat * RAD, out = [];
  const cusp = (f, upper) => {
    let lon = lonOfRA(a.ramc + (upper ? 90 * f : 180 - 90 * f), eps);
    for (let i = 0; i < 50; i++) {
      const dec = Math.asin(Math.sin(eps) * Math.sin(lon * RAD)), x = Math.tan(phi) * Math.tan(dec);
      if (Math.abs(x) >= 1) return null;
      const ad = Math.asin(x) / RAD;
      const ra = upper ? a.ramc + f * (90 + ad) : a.ramc + 180 - f * (90 - ad);
      const next = lonOfRA(ra, eps);
      if (Math.abs(((next - lon + 540) % 360) - 180) < 1e-7) return next;
      lon = next;
    }
    return lon;
  };
  const c11 = cusp(1 / 3, true), c12 = cusp(2 / 3, true), c2 = cusp(2 / 3, false), c3 = cusp(1 / 3, false);
  if ([c11, c12, c2, c3].some(v => v == null)) return null;
  return [a.asc, c2, c3, norm(a.mc + 180), norm(c11 + 180), norm(c12 + 180), norm(a.asc + 180), norm(c2 + 180), norm(c3 + 180), a.mc, c11, c12];
}
/* Koch: cusps are the Ascendants at the moments the Midheaven degree had covered thirds of its own
   diurnal semi-arc. Undefined where the Midheaven degree never sets. */
function koch(a){
  const eps = a.obliquity * RAD, phi = a.lat * RAD;
  const dec = Math.asin(Math.sin(eps) * Math.sin(a.mc * RAD)), x = Math.tan(phi) * Math.tan(dec);
  if (Math.abs(x) >= 1) return null;
  const dsa = 90 + Math.asin(x) / RAD, at = k => ascFor(a.ramc + k * dsa / 3, eps, phi).asc;
  const c11 = at(-2), c12 = at(-1), c2 = at(1), c3 = at(2);
  return [a.asc, c2, c3, norm(a.mc + 180), norm(c11 + 180), norm(c12 + 180), norm(a.asc + 180), norm(c2 + 180), norm(c3 + 180), a.mc, c11, c12];
}
/* Twelve cusp longitudes, house 1 first. Placidus and Koch need the full angles object; where they are
   undefined (polar latitudes) this returns null and the caller falls back (chart() uses Porphyry). */
function houseCusps(asc, system, a){
  if (system === 'placidus') return a ? placidus(a) : null;
  if (system === 'koch') return a ? koch(a) : null;
  if (system === 'porphyry') return a ? porphyry(a) : null;
  const start = system === 'equal' ? asc : Math.floor(norm(asc) / 30) * 30;
  return Array.from({length: 12}, (_, i) => norm(start + 30 * i));
}
/* Porphyry: each quadrant between the angles split into three equal parts of ecliptic longitude. */
function porphyry(a){
  const ic = norm(a.mc + 180), dsc = norm(a.asc + 180);
  const q = (from, to) => { const d = norm(to - from) / 3; return [norm(from + d), norm(from + 2 * d)]; };
  const [c2, c3] = q(a.asc, ic), [c5, c6] = q(ic, dsc), [c8, c9] = q(dsc, a.mc), [c11, c12] = q(a.mc, a.asc);
  return [a.asc, c2, c3, ic, c5, c6, dsc, c8, c9, a.mc, c11, c12];
}
/* House number (1-12) of a longitude. Quadrant systems need the cusps from houseCusps(). */
function houseOf(lon, asc, system, cusps){
  if ((QUADRANT[system] || system === 'porphyry') && cusps) {
    for (let i = 0; i < 12; i++) if (norm(lon - cusps[i]) < norm(cusps[(i + 1) % 12] - cusps[i])) return i + 1;
    return 12;
  }
  if (system === 'equal') return Math.floor(norm(lon - asc) / 30) + 1;
  return ((Math.floor(norm(lon) / 30) - Math.floor(norm(asc) / 30) + 12) % 12) + 1;
}

/* ---------- aspects ---------- */
const ASPECTS = [
  { key: 'conjunction', angle: 0,   glyph: '☌', orb: 6 },
  { key: 'sextile',     angle: 60,  glyph: '⚹', orb: 4 },
  { key: 'square',      angle: 90,  glyph: '□', orb: 6 },
  { key: 'trine',       angle: 120, glyph: '△', orb: 6 },
  { key: 'opposition',  angle: 180, glyph: '☍', orb: 6 }
];
const LUMINARY_EXTRA = 2;           // extra orb when the Sun or Moon is involved
function separation(a, b){ const d = norm(a - b); return d > 180 ? 360 - d : d; }
function aspectBetween(a, b){       // a, b: {key, lon}
  const sep = separation(a.lon, b.lon);
  const lum = /^(Sun|Moon)$/.test(a.key) || /^(Sun|Moon)$/.test(b.key);
  let best = null;
  ASPECTS.forEach(asp => {
    const allowed = asp.orb + (lum ? LUMINARY_EXTRA : 0), orb = Math.abs(sep - asp.angle);
    if (orb <= allowed && (!best || orb < best.orb)) best = { type: asp.key, glyph: asp.glyph, orb, allowed, sep };
  });
  return best;
}

/* ---------- composite ---------- */
function midpoint(a, b){ const d = ((b - a + 540) % 360) - 180; return norm(a + d / 2); }

/* ---------- a full chart ----------
   p: {y, mo, d, h, mi, timeKnown, lat, lon, tz, system} */
function chart(p){
  const system = HOUSE_SYSTEMS[p.system] ? p.system : 'whole';
  const out = { input: p, system, timeKnown: !!p.timeKnown };
  let when;
  if (p.utc != null) {                     // an exact instant (solar return, Davison): no local-time conversion
    when = new Date(p.utc); out.timeKnown = true; out.tzInfo = { utc: +when, offsetMin: 0, status: 'ok' };
  } else if (p.timeKnown) {
    const t = localToUTC(p.y, p.mo, p.d, p.h, p.mi, p.tz);
    out.tzInfo = t; when = new Date(t.utc);
  } else {
    // No birth time: planets at local noon, and the day's full span so we can say what is uncertain.
    const noon = localToUTC(p.y, p.mo, p.d, 12, 0, p.tz);
    out.tzInfo = noon; when = new Date(noon.utc);
    const start = localToUTC(p.y, p.mo, p.d, 0, 0, p.tz).utc;
    const end = localToUTC(p.y, p.mo, p.d, 23, 59, p.tz).utc;
    out.daySpan = { start, end };
  }
  out.utc = when;
  out.planets = positions(when);
  out.node = meanNode(when);
  out.lilith = meanLilith(when);
  const ch = chironLon(when);
  if (ch != null) {
    let sp = chironLon(new Date(when.getTime() + 43200e3)) - chironLon(new Date(when.getTime() - 43200e3));
    if (sp > 180) sp -= 360; if (sp < -180) sp += 360;
    out.chiron = { lon: ch, speed: sp, retro: sp < 0 };
  }
  if (out.timeKnown) {
    out.angles = angles(when, p.lat, p.lon);
    out.cusps = houseCusps(out.angles.asc, system, out.angles);
    if (!out.cusps) {                    // Placidus / Koch undefined this far north or south
      out.houseFallback = { from: system, to: 'porphyry' };
      out.system = 'porphyry';
      out.cusps = porphyry(out.angles);
    }
    out.planets.forEach(pl => { pl.house = houseOf(pl.lon, out.angles.asc, out.system, out.cusps); });
    const sun = out.planets[0].lon, moon = out.planets[1].lon;
    out.dayBirth = houseOf(sun, out.angles.asc, 'porphyry', porphyry(out.angles)) >= 7;   // Sun above the horizon
    out.fortune = out.dayBirth ? norm(out.angles.asc + moon - sun) : norm(out.angles.asc + sun - moon);
  } else {
    // For each body, does its sign change during the day? (Almost always only the Moon.)
    const s0 = positions(new Date(out.daySpan.start)), s1 = positions(new Date(out.daySpan.end));
    out.planets.forEach((pl, i) => {
      pl.range = [s0[i].lon, s1[i].lon];
      pl.signUncertain = Math.floor(s0[i].lon / 30) !== Math.floor(s1[i].lon / 30);
    });
  }
  return out;
}

/* ---------- synastry and the published compatibility heuristic ---------- */
const ASPECT_VALUE = { trine: 1, sextile: 0.8, conjunction: 0.6, opposition: -0.6, square: -1 };
const PLANET_WEIGHT = { Sun: 1, Moon: 1, Venus: 1, Mars: 0.8, Mercury: 0.6, Jupiter: 0.5, Saturn: 0.5,
                        Uranus: 0.25, Neptune: 0.25, Pluto: 0.25 };
const KEY_PAIRS = ['Moon|Sun', 'Moon|Moon', 'Mars|Venus', 'Moon|Venus', 'Sun|Venus'];
const PAIR_BONUS = 1.5;
function synastry(A, B){
  const grid = [], contacts = [];
  let harmony = 0, tension = 0;
  A.planets.forEach(a => {
    const row = [];
    B.planets.forEach(b => {
      // With no birth time the Moon can be anywhere in a ~13 degree band, so its aspects are shown
      // but marked, and left out of the score.
      const uncertain = (a.key === 'Moon' && !A.timeKnown) || (b.key === 'Moon' && !B.timeKnown);
      const asp = aspectBetween(a, b);
      if (!asp) { row.push(null); return; }
      const bonus = KEY_PAIRS.includes([a.key, b.key].sort().join('|')) ? PAIR_BONUS : 1;
      const weight = PLANET_WEIGHT[a.key] * PLANET_WEIGHT[b.key] * bonus * (1 - asp.orb / asp.allowed);
      const points = ASPECT_VALUE[asp.type] * weight;
      const cell = Object.assign({ a: a.key, b: b.key, points, uncertain }, asp);
      row.push(cell);
      if (uncertain) return;              // a Moon with no birth time is not scored
      contacts.push(cell);
      if (points > 0) harmony += points; else tension -= points;
    });
    grid.push(row);
  });
  const score = Math.round(50 + 50 * (harmony - tension) / (harmony + tension + 2));
  contacts.sort((x, y) => Math.abs(y.points) - Math.abs(x.points));
  return { grid, contacts, harmony, tension, score };
}
function composite(A, B){
  const planets = A.planets.map((a, i) => ({ key: a.key, glyph: a.glyph, lon: midpoint(a.lon, B.planets[i].lon) }));
  const out = { planets };
  if (A.angles && B.angles) {
    out.asc = midpoint(A.angles.asc, B.angles.asc);
    out.mc = midpoint(A.angles.mc, B.angles.mc);
    planets.forEach(p => { p.house = houseOf(p.lon, out.asc, 'whole'); });
  }
  return out;
}

/* ---------- display helpers ---------- */
function fmtLon(lon, opts = {}){
  const l = norm(lon);
  let si = Math.floor(l / 30), deg = Math.floor(l - si * 30), min = Math.round((l - si * 30 - deg) * 60);
  if (min === 60) { min = 0; deg += 1; if (deg === 30) { deg = 0; si = (si + 1) % 12; } }
  const sign = opts.glyph ? NS.SIGN_GLYPH[si] : NS.SIGNS[si];
  return `${deg}°${String(min).padStart(2, '0')}′ ${sign}`;
}

NS.BODIES = BODIES;
NS.tzOffsetMs = tzOffsetMs;
NS.localToUTC = localToUTC;
NS.fmtOffset = fmtOffset;
NS.planetPositions = positions;
NS.eclLon = eclLon;
NS.meanNode = meanNode;
NS.meanLilith = meanLilith;
NS.chironLon = chironLon;
NS.ascFor = ascFor;
NS.porphyry = porphyry;
NS.QUADRANT = QUADRANT;
NS.angles = angles;
NS.HOUSE_SYSTEMS = HOUSE_SYSTEMS;
NS.houseCusps = houseCusps;
NS.houseOf = houseOf;
NS.ASPECTS = ASPECTS;
NS.LUMINARY_EXTRA = LUMINARY_EXTRA;
NS.separation = separation;
NS.aspectBetween = aspectBetween;
NS.midpoint = midpoint;
NS.chart = chart;
NS.synastry = synastry;
NS.composite = composite;
NS.ASPECT_VALUE = ASPECT_VALUE;
NS.PLANET_WEIGHT = PLANET_WEIGHT;
NS.KEY_PAIRS = KEY_PAIRS;
NS.PAIR_BONUS = PAIR_BONUS;
NS.fmtLon = fmtLon;
})(window.TD);
