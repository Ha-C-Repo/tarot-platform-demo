// Astrology extras: the four asteroids against NASA JPL, their texts, composite texts, and the good-days rules.
const load = require('./load');
const TD = load(['js/vendor/astronomy.browser.min.js', 'js/astro.js', 'js/data/chiron.js', 'js/data/asteroids.js', 'js/chart.js', 'js/tools.js',
  'js/gooddays.js', 'js/data/astro-extra-text.js']).TD;
const assert = (c, msg) => { if (!c) throw new Error(msg); };
const DAY = 864e5, sep = (a, b) => Math.abs(((a - b) % 360 + 540) % 360 - 180);

module.exports = [
  ['Ceres, Pallas, Juno and Vesta within 1 arcminute of JPL Horizons at 175 dates each, 1905-2095', () => {
    const fx = require('./fixtures/asteroids-horizons.json').points, out = [];
    Object.entries(fx).forEach(([k, pts]) => {
      const w = pts.reduce((m, [jd, L]) => Math.max(m, sep(TD.asteroidLon(k, new Date((jd - 2440587.5) * DAY)), L) * 60), 0);
      assert(w < 1, `${k} worst ${w.toFixed(2)}'`); out.push(`${k} ${w.toFixed(2)}'`);
    });
    assert(TD.asteroidLon('ceres', new Date(Date.UTC(1890, 0, 1))) === null, 'outside the table must give no position');
    return out.join(', ');
  }],
  ['chart() carries the four asteroids with motion when the table is loaded', () => {
    const c = TD.chart({ y: 1992, mo: 7, d: 11, h: 14, mi: 20, lat: 39.74, lon: -104.98, tz: 'America/Denver', timeKnown: true, system: 'placidus' });
    assert(c.asteroids && c.asteroids.map(a => a.key).join() === 'Ceres,Pallas,Juno,Vesta', 'asteroids');
    c.asteroids.forEach(a => assert(a.lon >= 0 && a.lon < 360 && typeof a.retro === 'boolean', a.key));
  }],
  ['Texts: every asteroid in every sign, and the composite Sun, Moon, Venus and Mars in every sign', () => {
    const X = TD.ASTRO_EXTRA;
    ['Ceres', 'Pallas', 'Juno', 'Vesta'].forEach(a => { assert(X.asteroid[a], a); TD.SIGNS.forEach(s => assert(X.asteroidSign[a + ':' + s], a + ':' + s)); });
    ['Sun', 'Moon', 'Venus', 'Mars'].forEach(p => TD.SIGNS.forEach(s => assert(X.composite[p + ':' + s], p + ':' + s)));
    assert(Object.keys(X.asteroidSign).length === 48 && Object.keys(X.composite).length === 48, 'extra keys');
    return '100 texts';
  }],
  ['Good days: Mercury retrograde (24 Oct to 13 Nov 2026) costs every contract day 3 points, and scores add up', () => {
    const r = TD.goodDays.find('contract', { from: new Date(2026, 9, 26), days: 14 });
    assert(r.days.length === 14 && r.best.length === 5, 'sizes');
    r.days.forEach(d => {
      assert(d.score === d.reasons.reduce((s, x) => s + x.points, 0), 'score does not add up');
      const inRetro = d.date < new Date(2026, 10, 13);
      assert(inRetro === d.reasons.some(x => /Mercury is retrograde/.test(x.text)), 'retrograde rule on ' + d.date.toDateString());
    });
    for (let k = 1; k < r.best.length; k++) assert(r.best[k - 1].score >= r.best[k].score, 'best not sorted');
  }],
  ['Good days: the phase rule follows the real Moon, and a birth chart adds personal reasons', () => {
    const r = TD.goodDays.find('start', { from: new Date(2026, 9, 1), days: 30 });
    r.days.forEach(d => assert(d.reasons.some(x => /waxing|waning/.test(x.text)), 'no phase reason'));
    assert(r.days.some(d => d.waxing) && r.days.some(d => !d.waxing), 'a month has both phases');
    const natal = TD.chart({ y: 1990, mo: 2, d: 14, h: 12, mi: 0, lat: 51.5, lon: -0.12, tz: 'Europe/London', timeKnown: true, system: 'placidus' });
    const p = TD.goodDays.find('start', { from: new Date(2026, 9, 1), days: 30, natal });
    assert(p.days.some(d => d.reasons.some(x => /your natal/.test(x.text))), 'no personal reason in 30 days');
  }],
];
