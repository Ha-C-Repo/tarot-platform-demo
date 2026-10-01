// The astrology tools (js/tools.js) and Chiron, checked against outside references where there are some.
const load = require('./load');
const TD = load(['js/vendor/astronomy.browser.min.js', 'js/astro.js', 'js/data/chiron.js', 'js/chart.js', 'js/tools.js']).TD;
const K = TD.tools;
const assert = (c, msg) => { if (!c) throw new Error(msg); };
const DAY = 864e5, YEAR = 365.2422 * DAY;
const sep = (a, b) => { const d = ((a - b) % 360 + 360) % 360; return d > 180 ? 360 - d : d; };
const DEN = { lat: 39.7392, lon: -104.9903, tz: 'America/Denver' };
const C = TD.chart(Object.assign({ y: 1992, mo: 7, d: 11, h: 14, mi: 20, timeKnown: true, system: 'placidus' }, DEN));
const NOW = new Date(Date.UTC(2026, 9, 1, 12));

module.exports = [
  ['Chiron matches NASA JPL Horizons within 0.6 arcminute, 1913 to 2077 (9 dates)', () => {
    const fx = require('./fixtures/chiron-horizons.json').points;
    let worst = 0;
    fx.forEach(([jd, L]) => { worst = Math.max(worst, sep(TD.chironLon(new Date((jd - 2440587.5) * DAY)), L) * 60); });
    assert(worst < 0.6, `worst ${worst.toFixed(2)}'`);
    assert(TD.chironLon(new Date(Date.UTC(1890, 0, 1))) === null, 'outside the table: no Chiron');
    assert(C.chiron && C.chiron.lon >= 0, 'chart() carries Chiron');
    return `worst ${worst.toFixed(2)}'`;
  }],
  ['Solar return: the Sun back on its birth longitude, within a day of the birthday', () => {
    [2000, 2026, 2050].forEach(y => {
      const sr = K.solarReturn(C, y, DEN);
      assert(sep(sr.planets[0].lon, C.planets[0].lon) < 1e-3, `${y}: Sun off by ${sep(sr.planets[0].lon, C.planets[0].lon)}`);
      assert(Math.abs(sr.utc - Date.UTC(y, 6, 11, 20, 20)) < 1.5 * DAY && sr.cusps.length === 12, `${y}: date ${sr.utc.toISOString()}`);
    });
  }],
  ['Progressions: one day per year; solar arc about a degree a year; the phase and sign windows contain now', () => {
    const pr = K.progressions(C, NOW), age = (NOW - C.utc) / YEAR;
    assert(Math.abs((pr.progressed - C.utc) / DAY - age) < 1e-6, 'a day per year');
    assert(Math.abs(pr.arc - age * 0.9856) < 2, `arc ${pr.arc.toFixed(2)} at age ${age.toFixed(1)}`);
    assert(pr.phase.from < NOW && pr.phase.to > NOW && pr.moonSign.from < NOW && pr.moonSign.to > NOW, 'windows contain now');
    assert(K.PHASES.includes(pr.phase.name) && TD.SIGNS.includes(pr.moonSign.sign), 'names');
  }],
  ['Returns: Saturn on its birth position at about 29, 59 and 88; Jupiter about every 12 years; the Moon within 28 days', () => {
    const sat = K.saturnReturns(C), satLon = C.planets.find(p => p.key === 'Saturn').lon;
    assert(sat.length === 3, `${sat.length} Saturn returns`);
    sat.forEach((r, i) => r.passes.forEach(t => {
      assert(sep(TD.eclLon('Saturn', t), satLon) < 1e-3, 'exact');
      const age = (t - C.utc) / YEAR; assert(Math.abs(age - [29.5, 58.9, 88.4][i]) < 2, `return ${i + 1} at ${age.toFixed(1)}`);
    }));
    const jup = K.jupiterReturns(C, NOW, 25);
    assert(jup.length === 2 || jup.length === 3, 'two or three Jupiter returns in 25 years');
    for (let i = 1; i < jup.length; i++) { const gap = (jup[i].passes[0] - jup[i - 1].passes[0]) / YEAR; assert(gap > 10.5 && gap < 13, `gap ${gap.toFixed(1)}`); }
    const lr = K.lunarReturn(C, NOW);
    assert(lr - NOW > 0 && lr - NOW < 28 * DAY && sep(TD.eclLon('Moon', lr), C.planets[1].lon) < 1e-3, 'lunar return');
  }],
  ['Eclipses 2026-2027 match the published list (NASA eclipse catalogue): date and type', () => {
    const want = [['2026-02-17', 'solar', 'annular'], ['2026-03-03', 'lunar', 'total'], ['2026-08-12', 'solar', 'total'], ['2026-08-28', 'lunar', 'partial'],
      ['2027-02-06', 'solar', 'annular'], ['2027-02-20', 'lunar', 'penumbral'], ['2027-07-18', 'lunar', 'penumbral'], ['2027-08-02', 'solar', 'total'], ['2027-08-17', 'lunar', 'penumbral']];
    const got = K.eclipses(new Date(Date.UTC(2026, 0, 1)), 24).filter(e => e.time < Date.UTC(2028, 0, 1));
    assert(got.length === want.length, `${got.length} eclipses`);
    got.forEach((e, i) => assert(e.time.toISOString().slice(0, 10) === want[i][0] && e.type === want[i][1] && e.kind === want[i][2],
      `#${i}: ${e.time.toISOString().slice(0, 10)} ${e.kind} ${e.type} vs ${want[i].join(' ')}`));
  }],
  ['Void-of-course Moon: starts at an exact aspect, ends at a sign change, no exact aspect in between', () => {
    const list = K.voidMoon(NOW, 7);
    assert(list.length >= 3, 'a few periods a week');
    const bodies = ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    list.forEach(v => {
      assert(v.end > v.start, 'ends after it starts');
      const m1 = TD.eclLon('Moon', new Date(+v.end - 60e3)), m2 = TD.eclLon('Moon', new Date(+v.end + 60e3));
      assert(Math.floor(m1 / 30) !== Math.floor(m2 / 30), 'ends at an ingress');
      if (v.aspect) assert(Math.abs(sep(TD.eclLon('Moon', v.start), TD.eclLon(v.aspect.body, v.start)) - v.aspect.angle) < 0.01, 'starts at an exact aspect');
      // No exact aspect strictly inside: sample every 20 minutes for a sign change of the distance to each aspect.
      for (let t = +v.start + 30 * 60e3; t < +v.end - 30 * 60e3; t += 20 * 60e3) bodies.forEach(b => [0, 60, 90, 120, 180].forEach(a => {
        const f = x => sep(TD.eclLon('Moon', new Date(x)), TD.eclLon(b, new Date(x))) - a;
        assert(!(f(t) * f(t + 20 * 60e3) < 0 && Math.abs(f(t)) < 1), `aspect ${b} ${a} inside a void period`);
      }));
    });
    return `${list.length} periods`;
  }],
  ['Planetary hours: Thursday belongs to Jupiter, 24 back-to-back hours from sunrise, Chaldean order', () => {
    const ph = K.planetaryHours(2026, 10, 1, DEN);
    assert(ph.ruler === 'Jupiter' && ph.hours[0].planet === 'Jupiter', 'Thursday: Jupiter');
    assert(+ph.hours[0].start === +ph.sunrise && +ph.hours[12].start === +ph.sunset && Math.abs(ph.hours[23].end - ph.nextSunrise) < 1000, 'sunrise to sunrise');
    ph.hours.forEach((h, i) => { if (i) { assert(Math.abs(h.start - ph.hours[i - 1].end) < 1000, 'back to back');
      assert(K.CHALDEAN.indexOf(h.planet) === (K.CHALDEAN.indexOf(ph.hours[i - 1].planet) + 1) % 7, 'Chaldean order'); } });
    const sunday = K.planetaryHours(2026, 10, 4, DEN);
    assert(sunday.ruler === 'Sun' && sunday.hours[0].planet === 'Sun', 'Sunday: Sun');
    assert(K.planetaryHours(2026, 6, 21, { lat: 78.22, lon: 15.65, tz: 'Arctic/Longyearbyen' }) === null, 'midnight sun: no hours');
  }],
  ['Davison chart: the midpoint in time and in place, shorter way round the globe', () => {
    const B = TD.chart({ y: 1989, mo: 11, d: 3, h: 6, mi: 45, timeKnown: true, lat: -33.87, lon: 151.21, tz: 'Australia/Sydney', system: 'whole' });
    const D = K.davison(C, B, 'whole');
    assert(Math.abs(+D.utc - (+C.utc + +B.utc) / 2) < 1000, 'time midpoint');
    assert(Math.abs(D.place.lat - (39.7392 - 33.87) / 2) < 1e-9, 'latitude midpoint');
    // Denver 104.99 W and Sydney 151.21 E are 103.8 deg apart across the Pacific: halfway is 156.89 W.
    assert(Math.abs(D.place.lon + 156.89) < 0.01, `longitude across the Pacific: ${D.place.lon}`);
    assert(D.cusps && D.cusps.length === 12, 'houses');
  }],
  ['Tools texts: solar return, progressions, returns, eclipses, void Moon, planetary hours, Chiron', () => {
    const T = load(['js/data/tools-text.js']).TD.TOOLS_TEXT, keys = [];
    TD.SIGNS.forEach(s => keys.push('sr-asc:' + s, 'prog-moon:' + s, 'chiron-sign:' + s));
    for (let h = 1; h <= 12; h++) keys.push('sr-sun:' + h, 'eclipse-house:' + h, 'chiron-house:' + h);
    K.PHASES.forEach(p => keys.push('prog-phase:' + p));
    ['Saturn', 'Jupiter', 'Lunar', 'Solar'].forEach(r => keys.push('return:' + r));
    keys.push('eclipse:solar', 'eclipse:lunar', 'voc');
    K.CHALDEAN.forEach(p => keys.push('hour:' + p));
    keys.forEach(k => assert(T[k] && T[k].split(/\s+/).length >= 20, `${k}: missing`));
    assert(Object.keys(T).length === keys.length && keys.length === 94, `${Object.keys(T).length} keys`);
    const all = Object.values(T).join(' ');
    assert(!/—|!/.test(all) && !/\b(he|she|his|her|him)\b/i.test(all) && !/\byou will\b/i.test(all), 'house style');
    return `${keys.length} texts`;
  }]
];
