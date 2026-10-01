/* vedic.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   Vedic (Jyotish) chart from a chart made by chart.js: sidereal positions with the Lahiri ayanamsa, the
   Lagna and whole-sign houses, nakshatras and padas, the Navamsa (D9), Vimshottari dashas, the birth
   Panchang, the Manglik check and Sade Sati. Load after astronomy.browser.min.js, astro.js and chart.js.

   Lahiri (Chitrapaksha) ayanamsa: Swiss Ephemeris's definition, 23.245524743 deg at JD 2435553.5, carried
   by the IAU 2006 general precession in longitude (mean ayanamsa); adding the nutation in longitude gives
   the true ayanamsa. Sidereal longitude = apparent tropical longitude - true ayanamsa, as Swiss Ephemeris
   computes it. All times are UTC Date objects. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const AE = () => window.Astronomy;
const norm = d => ((d % 360) + 360) % 360;
const DAY = 864e5, VYEAR = 365.25 * DAY;          // Vimshottari year: 365.25 days
const NAK_SPAN = 40 / 3;                          // 13 deg 20'

/* ---------- ayanamsa ---------- */
const LAHIRI_T0 = (2435553.5 - 2451545.0) / 36525, LAHIRI_A0 = 23.245524743;
const precession = T => (5028.796195 * T + 1.1054348 * T * T + 0.00007964 * T * T * T - 0.000023857 * T * T * T * T) / 3600;
function ayanamsa(date){
  const time = AE().MakeTime(date), T = time.tt / 36525;
  const mean = LAHIRI_A0 + precession(T) - precession(LAHIRI_T0);
  return { mean, true: mean + AE().e_tilt(time).dpsi / 3600 };
}
const sidereal = (lon, date) => norm(lon - ayanamsa(date).true);

/* ---------- names ---------- */
const RASHI = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
const LORD = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
const NAKSHATRAS = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
  'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
const DASHA = [['Ketu', 7], ['Venus', 20], ['Sun', 6], ['Moon', 10], ['Mars', 7], ['Rahu', 18], ['Jupiter', 16], ['Saturn', 19], ['Mercury', 17]];
const DASHA_YEARS = Object.fromEntries(DASHA);
const GRAHAS = [['Sun', 'Su', 'Surya'], ['Moon', 'Mo', 'Chandra'], ['Mars', 'Ma', 'Mangal'], ['Mercury', 'Me', 'Budha'], ['Jupiter', 'Ju', 'Guru'],
  ['Venus', 'Ve', 'Shukra'], ['Saturn', 'Sa', 'Shani'], ['Rahu', 'Ra', 'Rahu'], ['Ketu', 'Ke', 'Ketu']];
/* Exaltation, debilitation and own signs (sign index), the seven visible planets. */
const DIGNITY = { Sun: [0, 6, [4]], Moon: [1, 7, [3]], Mars: [9, 3, [0, 7]], Mercury: [5, 11, [2, 5]], Jupiter: [3, 9, [8, 11]], Venus: [11, 5, [1, 6]], Saturn: [6, 0, [9, 10]] };
function dignity(key, sign){
  const d = DIGNITY[key]; if (!d) return null;
  if (d[0] === sign) return 'exalted';
  if (d[1] === sign) return 'debilitated';
  if (d[2].includes(sign)) return 'own sign';
  return null;
}

/* ---------- point details ---------- */
function nakshatra(lon){
  const i = Math.floor(norm(lon) / NAK_SPAN), within = norm(lon) - i * NAK_SPAN;
  return { index: i, name: NAKSHATRAS[i], pada: Math.floor(within / (NAK_SPAN / 4)) + 1, lord: DASHA[i % 9][0], fraction: within / NAK_SPAN };
}
const navamsaSign = lon => Math.floor(norm(lon) / (30 / 9)) % 12;
const signIdx = lon => Math.floor(norm(lon) / 30);
const houseFrom = (fromSign, sign) => ((sign - fromSign + 12) % 12) + 1;

/* ---------- the chart ---------- */
function vedic(c){
  const when = c.utc, ay = ayanamsa(when);
  const trop = { }; c.planets.forEach(p => { trop[p.key] = p; });
  const pts = GRAHAS.map(([key, abbr, sk]) => {
    let lon, retro = false;
    if (key === 'Rahu') { lon = c.node; retro = true; }
    else if (key === 'Ketu') { lon = norm(c.node + 180); retro = true; }
    else { lon = trop[key].lon; retro = trop[key].retro; }
    const sid = norm(lon - ay.true), s = signIdx(sid);
    return { key, abbr, sk, lon: sid, sign: s, deg: sid - s * 30, retro, nak: nakshatra(sid), navamsa: navamsaSign(sid), dignity: dignity(key, s) };
  });
  const out = { ayanamsa: ay, grahas: pts, timeKnown: c.timeKnown, utc: when };
  if (c.angles) {
    const L = norm(c.angles.asc - ay.true), ls = signIdx(L);
    out.lagna = { lon: L, sign: ls, deg: L - ls * 30, nak: nakshatra(L), navamsa: navamsaSign(L) };
    pts.forEach(p => { p.house = houseFrom(ls, p.sign); });
  }
  const moon = pts[1];
  if (!c.timeKnown && c.planets[1].range) {          // no birth time: the Moon's span over the day
    const [a, b] = c.planets[1].range.map((l, i) => norm(l - ayanamsa(new Date(i ? c.daySpan.end : c.daySpan.start)).true));
    moon.range = [a, b];
    moon.signUncertain = signIdx(a) !== signIdx(b);
    moon.nakUncertain = nakshatra(a).index !== nakshatra(b).index;
  }
  out.dashas = vimshottari(moon.lon, when);
  out.manglik = manglik(out);
  return out;
}

/* ---------- Vimshottari dasha ----------
   The Moon's nakshatra lord rules the first Mahadasha; the part of the nakshatra the Moon has already crossed
   is the part of that period already spent at birth. Each Mahadasha splits into nine Antardashas, starting
   with its own lord, each lasting (major years x minor years / 120). */
function vimshottari(moonLon, birth){
  const n = nakshatra(moonLon), first = n.index % 9;
  let t = +birth - n.fraction * DASHA[first][1] * VYEAR;
  const out = [];
  for (let k = 0; k < 10; k++) {                    // ten periods: past the 120-year cycle from birth
    const [lord, yrs] = DASHA[(first + k) % 9], start = t, end = t + yrs * VYEAR;
    const ads = []; let u = start;
    for (let j = 0; j < 9; j++) { const [l2, y2] = DASHA[(first + k + j) % 9], len = yrs * y2 / 120 * VYEAR;
      ads.push({ lord: l2, start: new Date(u), end: new Date(u + len) }); u += len; }
    out.push({ lord, years: yrs, start: new Date(start), end: new Date(end), ads });
    t = end;
  }
  return { balance: { lord: DASHA[first][0], years: (1 - n.fraction) * DASHA[first][1] }, periods: out };
}
function currentDasha(d, when){
  const md = d.periods.find(p => p.start <= when && p.end > when); if (!md) return null;
  return { md, ad: md.ads.find(a => a.start <= when && a.end > when) };
}

/* ---------- Manglik (Mangal dosha): Mars in houses 1, 2, 4, 7, 8 or 12 from the Lagna or the Moon ---------- */
const MANGLIK_HOUSES = [1, 2, 4, 7, 8, 12];
function manglik(v){
  const mars = v.grahas[2], moon = v.grahas[1];
  const fromMoon = houseFrom(moon.sign, mars.sign);
  const fromLagna = v.lagna ? houseFrom(v.lagna.sign, mars.sign) : null;
  const m = MANGLIK_HOUSES.includes(fromMoon), l = fromLagna != null && MANGLIK_HOUSES.includes(fromLagna);
  return { fromLagna, fromMoon, byLagna: fromLagna == null ? null : l, byMoon: m, present: l || m };
}

/* ---------- Panchang at birth: tithi, nakshatra, yoga, karana, vara ---------- */
const TITHI = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi'];
const YOGA = ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi',
  'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha',
  'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];
const KARANA_MOVING = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti'];
const VARA = [['Ravivara', 'Sunday', 'Sun'], ['Somavara', 'Monday', 'Moon'], ['Mangalavara', 'Tuesday', 'Mars'], ['Budhavara', 'Wednesday', 'Mercury'],
  ['Guruvara', 'Thursday', 'Jupiter'], ['Shukravara', 'Friday', 'Venus'], ['Shanivara', 'Saturday', 'Saturn']];
function panchang(v, c){
  const sun = v.grahas[0].lon, moon = v.grahas[1].lon, el = norm(moon - sun);
  const t = Math.floor(el / 12);                    // 0-29
  const tithi = { n: t + 1, paksha: t < 15 ? 'Shukla' : 'Krishna',
    name: t === 14 ? 'Purnima' : t === 29 ? 'Amavasya' : TITHI[t % 15] };
  const k = Math.floor(el / 6);                     // 0-59 half-tithis
  const karana = k === 0 ? 'Kimstughna' : k >= 57 ? ['Shakuni', 'Chatushpada', 'Naga'][k - 57] : KARANA_MOVING[(k - 1) % 7];
  const yoga = YOGA[Math.floor(norm(sun + moon) / NAK_SPAN)];
  // Vara: the Vedic day runs sunrise to sunrise, so a birth before local sunrise belongs to the day before.
  const p = c.input;
  let wd = new Date(Date.UTC(p.y, p.mo - 1, p.d)).getUTCDay(), beforeSunrise = null;
  if (c.timeKnown && p.tz && p.lat != null) {
    const midnight = NS.localToUTC(p.y, p.mo, p.d, 0, 0, p.tz).utc;
    const rise = AE().SearchRiseSet(AE().Body.Sun, new (AE().Observer)(p.lat, p.lon, 0), +1, new Date(midnight), 1);
    if (rise && +c.utc < +rise.date) { beforeSunrise = true; wd = (wd + 6) % 7; } else if (rise) beforeSunrise = false;
  }
  return { tithi, nakshatra: v.grahas[1].nak, yoga, karana, vara: { sk: VARA[wd][0], en: VARA[wd][1], lord: VARA[wd][2], beforeSunrise } };
}

/* ---------- Sade Sati: sidereal Saturn in the 12th, 1st and 2nd signs from the Moon sign ----------
   Saturn's position is costly to compute, so it is sampled every 30 days and interpolated day by day with a
   Lagrange cubic (under 0.01 deg of error; within 0.1 deg of a sign edge the real position is used instead); each sign change found that way is refined to the
   hour on the real position. Passes that leave and re-enter (retrograde) within 400 days form one cycle. */
function sadeSati(v, from, to){
  const ms = v.grahas[1].sign, phaseOf = s => s === (ms + 11) % 12 ? 'rising' : s === ms ? 'peak' : s === (ms + 1) % 12 ? 'setting' : null;
  const ay = t => ayanamsa(new Date(t)).true;
  const realSign = t => signIdx(NS.eclLon('Saturn', new Date(t)) - ay(t));
  const H = 30 * DAY, t0 = +from, n = Math.ceil((+to - t0) / H);
  const L = [];                                     // unwrapped sidereal samples at t0 + (k - 1) H, k = 0..n+3
  for (let k = 0; k <= n + 3; k++) {
    const tk = t0 + (k - 1) * H;
    let l = NS.eclLon('Saturn', new Date(tk)) - ay(tk);
    if (k) { while (l - L[k - 1] > 180) l -= 360; while (l - L[k - 1] < -180) l += 360; }
    L.push(l);
  }
  const lonAt = t => {                              // cubic through the four samples around t
    const f = (t - t0) / H + 1, i = Math.min(Math.max(Math.floor(f), 1), n + 1), u = f - i;
    const [a, b, c, d] = [L[i - 1], L[i], L[i + 1], L[i + 2]];
    return -a * u * (u - 1) * (u - 2) / 6 + b * (u + 1) * (u - 1) * (u - 2) / 2 - c * (u + 1) * u * (u - 2) / 2 + d * (u + 1) * u * (u - 1) / 6;
  };
  const sign = t => {                               // within 0.1 deg of a sign edge, trust only the real position
    const x = norm(lonAt(t)), r = x % 30;
    return r < 0.1 || r > 29.9 ? realSign(t) : Math.floor(x / 30);
  };
  const segs = []; let s0 = sign(t0), start = t0;
  for (let t = t0 + DAY; ; t += DAY) {
    const end = t >= +to, tt = end ? +to : t, s = sign(tt);
    if (s !== s0 || end) {
      let edge = tt;
      if (s !== s0) {                               // refine on the real position
        let a = tt - DAY, b = tt; const sa = realSign(a);
        for (let k = 0; k < 5; k++) { const m = (a + b) / 2; if (realSign(m) === sa) a = m; else b = m; }
        edge = b;
      }
      if (phaseOf(s0)) segs.push({ phase: phaseOf(s0), start: new Date(start), end: new Date(edge), openStart: start === t0, openEnd: s === s0 });
      start = edge; s0 = s;
    }
    if (end) break;
  }
  const cycles = [];
  segs.forEach(sg => {
    const last = cycles[cycles.length - 1];
    if (last && sg.start - last.end < 400 * DAY) { last.segs.push(sg); last.end = sg.end; } else cycles.push({ start: sg.start, end: sg.end, segs: [sg] });
  });
  cycles.forEach(cy => {
    cy.phases = ['rising', 'peak', 'setting'].map(ph => { const s = cy.segs.filter(x => x.phase === ph);
      return s.length ? { phase: ph, start: s[0].start, end: s[s.length - 1].end, passes: s.length } : null; }).filter(Boolean);
    cy.openStart = cy.segs[0].openStart; cy.openEnd = cy.segs[cy.segs.length - 1].openEnd;
  });
  return cycles;
}

NS.vedic = { ayanamsa, sidereal, RASHI, LORD, NAKSHATRAS, DASHA, DASHA_YEARS, GRAHAS, MANGLIK_HOUSES, TITHI, YOGA, VARA,
  nakshatra, navamsaSign, houseFrom, dignity, chart: vedic, vimshottari, currentDasha, manglik, panchang, sadeSati, VYEAR };
})(window.TD);
