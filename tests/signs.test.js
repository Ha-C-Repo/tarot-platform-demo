// Horoscopes by sign: solar-house arithmetic, sign changes, sky aspects, and every text the page can ask for.
const load = require('./load');
const w = load(['js/vendor/astronomy.browser.min.js', 'js/astro.js', 'js/chart.js', 'js/transits.js', 'js/signs.js', 'js/data/signs-text.js', 'js/data/transit-text.js']);
const TD = w.TD, S = TD.signs;
const assert = (c, msg) => { if (!c) throw new Error(msg); };
const U = (...a) => new Date(Date.UTC(...a));

module.exports = [
  ['Solar houses: the sign itself is the 1st house, counting on round the zodiac', () => {
    assert(S.house(5, 0) === 1 && S.house(35, 0) === 2 && S.house(355, 0) === 12, 'Aries');
    assert(S.house(5, 4) === 9 && S.house(125, 4) === 1, 'Leo');
    for (let s = 0; s < 12; s++) for (let l = 0; l < 360; l += 15) { const h = S.house(l, s); assert(h >= 1 && h <= 12, 'range'); }
  }],
  ['Sun enters Aries at the March 2026 equinox (20 Mar 14:46 UTC) to within 10 minutes', () => {
    const x = S.ingresses('Sun', U(2026, 2, 19), U(2026, 2, 22));
    assert(x.length === 1 && x[0].sign === 0, 'no ingress');
    const off = Math.abs(x[0].time - U(2026, 2, 20, 14, 46)) / 60e3;
    assert(off < 10, off.toFixed(1) + ' min');
    return off.toFixed(1) + ' min';
  }],
  ['A retrograde planet backing into the previous sign is reported as moving backward', () => {
    // Saturn enters Aries 2025-05-25, backs into Pisces 2025-09-01, returns 2026-02-14.
    const x = S.ingresses('Saturn', U(2025, 4, 1), U(2026, 2, 1));
    assert(x.length === 3, 'count ' + x.length);
    assert(!x[0].retro && x[1].retro && !x[2].retro, 'directions');
    assert(Math.abs(x[2].time - U(2026, 1, 14)) < 2 * 864e5, 'Saturn back into Aries ' + x[2].time.toISOString());
  }],
  ['Sky aspects: the Saturn-Neptune conjunction of 20 Feb 2026 is found, with both planets at the same longitude', () => {
    const a = S.aspects(U(2026, 1, 1), U(2026, 2, 15), ['Saturn', 'Neptune']).filter(x => x.type === 'conjunction');
    assert(a.length === 1, 'found ' + a.length);
    assert(Math.abs(a[0].time - U(2026, 1, 20, 12)) < 1.5 * 864e5, a[0].time.toISOString());
    assert(TD.separation(a[0].lonA, a[0].lonB) < 0.01, 'not exact');
  }],
  ['Every aspect found in a year is exact to 0.01 degree and has its text', () => {
    const list = S.aspects(U(2026, 0, 1), U(2026, 11, 31));
    const ang = { conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180 };
    list.forEach(x => {
      assert(Math.abs(TD.separation(x.lonA, x.lonB) - ang[x.type]) < 0.01, `${x.a}-${x.b} ${x.type} not exact`);
      assert(TD.SIGN_TEXT[S.skyKey(x)], 'no text ' + S.skyKey(x));
    });
    return list.length + ' aspects';
  }],
  ['Moon path: contiguous segments, each in the house the Moon is really in', () => {
    const from = U(2026, 9, 4), to = U(2026, 9, 11), segs = S.moonPath(3, from, to);
    assert(+segs[0].from === +from && +segs[segs.length - 1].to === +to, 'ends');
    for (let i = 1; i < segs.length; i++) assert(+segs[i].from === +segs[i - 1].to, 'gap');
    segs.forEach(sg => { const mid = (+sg.from + +sg.to) / 2; assert(S.house(S.lon('Moon', mid), 3) === sg.house, 'house'); });
  }],
  ['Texts: every key the page asks for, nothing extra; shared Moon, Sun and retrograde texts present', () => {
    const want = S.allKeys(), have = Object.keys(TD.SIGN_TEXT);
    want.forEach(k => assert(TD.SIGN_TEXT[k], 'missing ' + k));
    have.forEach(k => assert(want.includes(k), 'extra ' + k));
    for (let h = 1; h <= 12; h++) assert(TD.TRANSIT_TEXT['moonhouse:' + h] && TD.TRANSIT_TEXT['sunhouse:' + h], 'shared house ' + h);
    ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].forEach(p => assert(TD.TRANSIT_TEXT['retro:' + p], 'retro ' + p));
    return want.length + ' texts';
  }],
];
