// Personal horoscope (js/transits.js): stations, exact transit hits, transits in effect, houses; and the texts.
const load = require('./load');
const TD = load(['js/vendor/astronomy.browser.min.js', 'js/astro.js', 'js/chart.js', 'js/transits.js']).TD;
const X = TD.transits;
const assert = (c, msg) => { if (!c) throw new Error(msg); };
const DAY = 864e5;
const C = TD.chart({ y: 1992, mo: 7, d: 11, h: 14, mi: 20, timeKnown: true, lat: 39.7392, lon: -104.9903, tz: 'America/Denver', system: 'placidus' });
const from = new Date(Date.UTC(2026, 9, 1));

module.exports = [
  ['Retrograde stations in 2026 match Swiss Ephemeris within one hour (18 stations, Mercury to Pluto)', () => {
    const fx = require('./fixtures/stations-2026-swisseph.json').stations;
    const st = X.stations(new Date(Date.UTC(2026, 0, 1)), new Date(Date.UTC(2027, 0, 1)));
    assert(st.length === fx.length, `${st.length} stations vs ${fx.length}`);
    let worst = 0;
    fx.forEach((f, i) => {
      const s = st[i]; assert(s.planet === f.planet && s.kind === f.kind, `#${i}: ${s.planet} ${s.kind} vs ${f.planet} ${f.kind}`);
      worst = Math.max(worst, Math.abs(s.time - new Date(f.time)) / 36e5);
    });
    assert(worst < 1, `worst ${worst.toFixed(2)} h`);
    return `worst ${worst.toFixed(2)} h`;
  }],
  ['Every transit hit is exact (within 0.01 degree) and inside the window; sorted by time', () => {
    const hs = X.hits(C, from, new Date(+from + 365 * DAY));
    assert(hs.length > 100, 'a year of hits for all nine movers');
    hs.forEach((h, i) => {
      const p = X.natalPoints(C).find(x => x.key === h.natal), a = X.ANGLES.find(x => x.type === h.type).angle;
      const e = Math.abs(TD.separation(X.lon(h.mover, +h.time), p.lon) - a);
      assert(e < 0.01, `${h.mover} ${h.type} ${h.natal}: ${e.toFixed(4)} deg off`);
      assert(h.time >= from && (i === 0 || h.time >= hs[i - 1].time), 'window and order');
    });
    return `${hs.length} hits`;
  }],
  ['Transits in effect: inside orb, and every slow one has its exact passes within a year either side', () => {
    const act = X.active(C, from);
    act.forEach(a => {
      assert(a.orb <= X.ORB[a.mover], 'inside orb');
      if (!X.FAST[a.mover]) assert(X.passes(C, a, new Date(+from - 400 * DAY), new Date(+from + 400 * DAY)).length >= 1, `${a.mover} ${a.type} ${a.natal}: no exact pass`);
    });
    return `${act.length} in effect`;
  }],
  ['Moon and Sun by house: the house holds the body now, and the next house begins at the reported moment', () => {
    ['Moon', 'Sun'].forEach(k => {
      const h = X.houseNow(C, k, from);
      assert(TD.houseOf(X.lon(k, +from), C.angles.asc, C.system, C.cusps) === h.house, k + ' house now');
      assert(TD.houseOf(X.lon(k, +h.next + 60e3), C.angles.asc, C.system, C.cusps) === h.house % 12 + 1, k + ' next house');
    });
    const noTime = TD.chart({ y: 1992, mo: 7, d: 11, h: 12, mi: 0, timeKnown: false, lat: 39.7, lon: -105, tz: 'America/Denver' });
    assert(X.houseNow(noTime, 'Moon', from) === null && X.natalPoints(noTime).length === 7, 'no time: no houses, no angles');
  }],
  ['Horoscope texts: every mover on every natal point in all three kinds, Moon and Sun by house, every retrograde', () => {
    const T = load(['js/data/transit-text.js']).TD.TRANSIT_TEXT;
    const words = s => (String(s).match(/\S+/g) || []).length, keys = [];
    X.MOVERS.forEach(m => X.NATAL.forEach(n => ['conjunction', 'easy', 'hard'].forEach(k => keys.push(`transit:${m}:${n}:${k}`))));
    for (let h = 1; h <= 12; h++) keys.push('moonhouse:' + h, 'sunhouse:' + h);
    ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].forEach(p => keys.push('retro:' + p));
    keys.forEach(k => assert(words(T[k]) >= 40, `${k}: missing or short`));
    assert(Object.keys(T).length === keys.length && keys.length === 275, 'no stray keys');
    const all = Object.values(T).join(' ');
    assert(!/—|!/.test(all) && !/\b(he|she|his|her|him)\b/i.test(all) && !/\byou will\b/i.test(all), 'no em dash, exclamation, gendered pronoun or "you will"');
    return `${keys.length} texts`;
  }]
];
