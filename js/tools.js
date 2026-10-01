/* tools.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   The astrology tools beyond the natal chart: solar return, secondary progressions, planetary and lunar
   returns, eclipses, void-of-course Moon, planetary hours and the Davison relationship chart.
   Load after astronomy.browser.min.js, astro.js, chart.js and transits.js. All times are UTC Date objects. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const AE = () => window.Astronomy;
const norm = d => ((d % 360) + 360) % 360;
const wrap = d => ((d + 540) % 360) - 180;
const DAY = 864e5, YEAR = 365.2422 * DAY;
const lon = (k, t) => NS.eclLon(k, new Date(t));

/* The moment body k reaches longitude target between t0 and t1 (it must cross it once). */
function crossing(k, target, t0, t1){
  let f0 = wrap(lon(k, t0) - target);
  for (let i = 0; i < 50 && t1 - t0 > 20e3; i++) {
    const tm = (t0 + t1) / 2, fm = wrap(lon(k, tm) - target);
    if ((fm < 0) === (f0 < 0)) { t0 = tm; f0 = fm; } else t1 = tm;
  }
  return new Date((t0 + t1) / 2);
}

/* ---------- solar return: the Sun back at its birth longitude in a given year ---------- */
function solarReturn(c, year, place, system){
  const sun = c.planets[0].lon, b = c.utc;
  const guess = Date.UTC(year, b.getUTCMonth(), b.getUTCDate(), b.getUTCHours());
  const t = crossing('Sun', sun, guess - 3 * DAY, guess + 3 * DAY);
  return NS.chart({ utc: +t, lat: place.lat, lon: place.lon, tz: place.tz, system: system || 'placidus' });
}

/* ---------- secondary progressions: a day after birth for each year of life ---------- */
const PHASES = ['New', 'Crescent', 'First quarter', 'Gibbous', 'Full', 'Disseminating', 'Last quarter', 'Balsamic'];
function progressedInstant(c, when){ return new Date(+c.utc + (+when - +c.utc) / YEAR * DAY); }
function realFor(c, progT){ return new Date(+c.utc + (progT - +c.utc) / DAY * YEAR); }
function progressions(c, when){
  const pt = progressedInstant(c, when);
  const planets = NS.planetPositions(pt);
  const out = { when, progressed: pt, planets };
  const sun = planets[0].lon, moon = planets[1].lon;
  if (c.angles) {                        // angles by solar arc: the natal MC moved by as much as the Sun
    const arc = norm(sun - c.planets[0].lon), mc = norm(c.angles.mc + arc), eps = c.angles.obliquity * Math.PI / 180;
    const ramc = norm(Math.atan2(Math.sin(mc * Math.PI / 180) * Math.cos(eps), Math.cos(mc * Math.PI / 180)) * 180 / Math.PI);
    out.arc = arc; out.mc = mc; out.asc = NS.ascFor(ramc, eps, c.angles.lat * Math.PI / 180).asc;
  }
  // Progressed lunar phase: the Moon's angle ahead of the Sun, in eighths.
  const ang = norm(moon - sun), idx = Math.floor(ang / 45);
  out.phase = { name: PHASES[idx], angle: ang };
  // When the phase and the Moon's sign began and end, in real time.
  const p0 = +pt;
  const phaseAt = t => Math.floor(norm(lon('Moon', t) - lon('Sun', t)) / 45);
  const edge = (fn, dir) => {                      // step through progressed days until fn changes
    let a = p0; const v = fn(a);
    for (let i = 0; i < 40; i++) { const b = a + dir * DAY; if (fn(b) !== v) {
      let lo = Math.min(a, b), hi = Math.max(a, b);
      for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if ((fn(m) === v) === (dir > 0)) lo = m; else hi = m; }
      return realFor(c, (lo + hi) / 2); } a = b; }
    return null;
  };
  out.phase.from = edge(phaseAt, -1); out.phase.to = edge(phaseAt, 1);
  const signAt = t => Math.floor(lon('Moon', t) / 30);
  out.moonSign = { sign: NS.SIGNS[signAt(p0)], from: edge(signAt, -1), to: edge(signAt, 1) };
  return out;
}

/* ---------- returns ---------- */
/* Every moment a slow planet passes its own birth longitude: sampled every 5 days (Jupiter and Saturn move
   under 0.25 deg a day), each crossing refined to the minute. */
function returnsOf(c, planet, from, to){
  const L0 = c.planets.find(p => p.key === planet).lon, step = 5 * DAY, out = [];
  let tPrev = +from, fPrev = wrap(lon(planet, tPrev) - L0);
  for (let t = +from + step; t <= +to + step; t += step) {
    const f = wrap(lon(planet, t) - L0);
    if ((f < 0) !== (fPrev < 0) && Math.abs(f) < 30) { const x = crossing(planet, L0, tPrev, t); if (x >= from && x <= to) out.push({ time: x }); }
    tPrev = t; fPrev = f;
  }
  return out;
}
function saturnReturns(c){                         // around ages 29.5, 59 and 88.5, every pass
  const out = [];
  [29.46, 58.9, 88.4].forEach((age, i) => {
    const mid = +c.utc + age * YEAR, hs = returnsOf(c, 'Saturn', new Date(mid - 1.6 * YEAR), new Date(mid + 1.6 * YEAR));
    if (hs.length) out.push({ n: i + 1, passes: hs.map(h => h.time) });
  });
  return out;
}
function jupiterReturns(c, from, years){           // every return in the window, grouped by cycle
  const hs = returnsOf(c, 'Jupiter', from, new Date(+from + years * YEAR)), out = [];
  hs.forEach(h => { const last = out[out.length - 1];
    if (last && h.time - last.passes[last.passes.length - 1] < 300 * DAY) last.passes.push(h.time); else out.push({ passes: [h.time] }); });
  return out;
}
function lunarReturn(c, from){                     // the Moon back at its birth longitude
  const m = c.planets[1].lon;
  for (let t = +from; t < +from + 30 * DAY; t += 3600e3 * 6) {
    const a = wrap(lon('Moon', t) - m), b = wrap(lon('Moon', t + 3600e3 * 6) - m);
    if (a < 0 && b >= 0) return crossing('Moon', m, t, t + 3600e3 * 6);
  }
  return null;
}

/* ---------- eclipses (Astronomy Engine's eclipse search) ---------- */
function eclipses(from, months){
  const end = +from + months * 30.44 * DAY, out = [];
  let s = AE().SearchGlobalSolarEclipse(new Date(from));
  while (s.peak.date < end) { out.push({ type: 'solar', kind: s.kind, time: s.peak.date, lon: lon('Sun', +s.peak.date) }); s = AE().NextGlobalSolarEclipse(s.peak); }
  let l = AE().SearchLunarEclipse(new Date(from));
  while (l.peak.date < end) { out.push({ type: 'lunar', kind: l.kind, time: l.peak.date, lon: lon('Moon', +l.peak.date) }); l = AE().NextLunarEclipse(l.peak); }
  return out.sort((a, b) => a.time - b.time);
}

/* ---------- void-of-course Moon ----------
   From the Moon's last exact major aspect (conjunction, sextile, square, trine, opposition) to any planet,
   Sun to Pluto, until it enters the next sign. */
const VOC_BODIES = ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
function voidMoon(from, days){
  const H = 3600e3, t0 = +from - 3 * DAY, t1 = +from + days * DAY, ts = [];
  for (let t = t0; t <= t1 + H; t += H) ts.push(t);
  const M = ts.map(t => lon('Moon', t));
  // Planets move slowly: sample every 6 hours and interpolate.
  const P = {}; VOC_BODIES.forEach(k => { const six = []; for (let t = t0; t <= t1 + 7 * H; t += 6 * H) six.push(lon(k, t));
    P[k] = ts.map((t, i) => { const f = (t - t0) / (6 * H), j = Math.floor(f), u = f - j; return norm(six[j] + u * wrap(six[j + 1] - six[j])); }); });
  // Sign ingresses.
  const ingress = [];
  for (let i = 1; i < ts.length; i++) if (Math.floor(M[i] / 30) !== Math.floor(M[i - 1] / 30))
    ingress.push({ i, time: crossing('Moon', Math.floor(M[i] / 30) * 30, ts[i - 1], ts[i]), sign: NS.SIGNS[Math.floor(M[i] / 30)] });
  const out = [];
  for (let n = 1; n < ingress.length; n++) {
    const a = ingress[n - 1].i, b = ingress[n].i;
    let last = null;                                // the latest hourly step in this sign where an aspect is exact
    VOC_BODIES.forEach(k => [0, 60, -60, 90, -90, 120, -120, 180].forEach(off => {
      for (let i = Math.max(a, 1); i <= b; i++) {
        const x = wrap(M[i - 1] - P[k][i - 1] - off), y = wrap(M[i] - P[k][i] - off);
        if ((x < 0) !== (y < 0) && Math.abs(x) < 30 && (!last || ts[i] > last.t1)) last = { t0: ts[i - 1], t1: ts[i], body: k, off };
      }
    }));
    let start = ingress[n - 1].time, aspect = null;
    if (last) {                                     // refine that aspect to the minute
      const f = t => wrap(lon('Moon', t) - lon(last.body, t) - last.off);
      let lo = last.t0, hi = last.t1; const f0 = f(lo);
      for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if ((f(m) < 0) === (f0 < 0)) lo = m; else hi = m; }
      start = new Date((lo + hi) / 2); aspect = { body: last.body, angle: Math.abs(last.off) };
    }
    if (ingress[n].time > from) out.push({ start, end: ingress[n].time, from: ingress[n - 1].sign, into: ingress[n].sign, aspect });
  }
  return out;
}

/* ---------- planetary hours ----------
   Day and night each split into twelve unequal hours between sunrise and sunset; the first hour of the
   day belongs to the day's ruler, then the Chaldean order (Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon). */
const CHALDEAN = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
const DAY_RULER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];   // Sunday first
function planetaryHours(y, mo, d, place){
  const obs = new (AE().Observer)(place.lat, place.lon, 0);
  const midnight = NS.localToUTC(y, mo, d, 0, 0, place.tz).utc;
  const rise = AE().SearchRiseSet(AE().Body.Sun, obs, +1, new Date(midnight), 1);
  if (!rise) return null;
  const set = AE().SearchRiseSet(AE().Body.Sun, obs, -1, rise, 1), next = set && AE().SearchRiseSet(AE().Body.Sun, obs, +1, set, 1);
  if (!set || !next) return null;
  const weekday = new Date(Date.UTC(y, mo - 1, d)).getUTCDay(), ruler = DAY_RULER[weekday];
  let k = CHALDEAN.indexOf(ruler);
  const hours = [], dh = (set.date - rise.date) / 12, nh = (next.date - set.date) / 12;
  for (let i = 0; i < 24; i++) {
    const start = i < 12 ? +rise.date + i * dh : +set.date + (i - 12) * nh;
    hours.push({ n: i + 1, night: i >= 12, planet: CHALDEAN[k % 7], start: new Date(start), end: new Date(start + (i < 12 ? dh : nh)) });
    k++;
  }
  return { ruler, sunrise: rise.date, sunset: set.date, nextSunrise: next.date, hours };
}

/* ---------- Davison relationship chart: the midpoint in time and in space ---------- */
function davison(A, B, system){
  const t = (+A.utc + +B.utc) / 2;
  const lat = (A.input.lat + B.input.lat) / 2;
  const dl = wrap(B.input.lon - A.input.lon), lon2 = wrap(A.input.lon + dl / 2);
  const c = NS.chart({ utc: t, lat, lon: lon2, tz: 'UTC', system: system || 'whole' });
  c.place = { lat, lon: lon2 };
  return c;
}

NS.tools = { PHASES, CHALDEAN, DAY_RULER, solarReturn, progressions, progressedInstant, saturnReturns, jupiterReturns, lunarReturn,
  eclipses, voidMoon, planetaryHours, davison };
})(window.TD);
