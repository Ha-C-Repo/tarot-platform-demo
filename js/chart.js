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
/* Mean lunar node, Meeus (Astronomical Algorithms, 2nd ed.) eq. 47.7 */
function meanNode(date){
  const t = (AE().MakeTime(date).tt) / 36525;
  return norm(125.0445479 - 1934.1362891 * t + 0.0020754 * t * t + t * t * t / 467441 - t * t * t * t / 60616000);
}

/* ---------- angles and houses ---------- */
function angles(date, lat, lon){
  const time = AE().MakeTime(date);
  const eps = AE().e_tilt(time).tobl * RAD;
  const ramc = norm(AE().SiderealTime(date) * 15 + lon);         // local apparent sidereal time, degrees
  const r = ramc * RAD, phi = lat * RAD;
  const mc = norm(Math.atan2(Math.sin(r), Math.cos(r) * Math.cos(eps)) / RAD);
  let asc = norm(Math.atan2(Math.cos(r), -(Math.sin(r) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))) / RAD);
  // The Ascendant is the ecliptic point on the EASTERN horizon. The formula above can return the
  // western (setting) point near the poles; if so, take the opposite point.
  const raAsc = Math.atan2(Math.sin(asc * RAD) * Math.cos(eps), Math.cos(asc * RAD)) / RAD;
  const ha = norm(ramc - raAsc);
  let flipped = false;
  if (ha > 0 && ha < 180) { asc = norm(asc + 180); flipped = true; }
  return { asc, mc, ramc, lst: ramc / 15, obliquity: eps / RAD, flipped };
}
const HOUSE_SYSTEMS = { whole: 'Whole Sign', equal: 'Equal' };
function houseCusps(asc, system){
  const start = system === 'equal' ? asc : Math.floor(norm(asc) / 30) * 30;
  return Array.from({length: 12}, (_, i) => norm(start + 30 * i));
}
function houseOf(lon, asc, system){
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
  const system = p.system === 'equal' ? 'equal' : 'whole';
  const out = { input: p, system, timeKnown: !!p.timeKnown };
  let when;
  if (p.timeKnown) {
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
  if (p.timeKnown) {
    out.angles = angles(when, p.lat, p.lon);
    out.cusps = houseCusps(out.angles.asc, system);
    out.planets.forEach(pl => { pl.house = houseOf(pl.lon, out.angles.asc, system); });
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
  const sign = opts.glyph ? NS.SIGN_GLYPH[si] + '︎' : NS.SIGNS[si];
  return `${deg}°${String(min).padStart(2, '0')}′ ${sign}`;
}

NS.BODIES = BODIES;
NS.tzOffsetMs = tzOffsetMs;
NS.localToUTC = localToUTC;
NS.fmtOffset = fmtOffset;
NS.planetPositions = positions;
NS.meanNode = meanNode;
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
