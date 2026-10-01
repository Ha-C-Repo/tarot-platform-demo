// The birth-chart summaries (js/natal.js): dignities, balance, chart ruler, aspects, Big Three.
const load = require('./load');
const TD = load(['js/vendor/astronomy.browser.min.js', 'js/astro.js', 'js/chart.js', 'js/natal.js']).TD;
const assert = (c, msg) => { if (!c) throw new Error(msg); };
const N = TD.natal;
// Denver, 11 Jul 1992, 14:20 MDT: the page's default chart.
const C = TD.chart({ y: 1992, mo: 7, d: 11, h: 14, mi: 20, timeKnown: true, lat: 39.7392, lon: -104.9903, tz: 'America/Denver', system: 'placidus' });

module.exports = [
  ['Essential dignities follow the traditional table', () => {
    const at = sign => TD.SIGNS.indexOf(sign) * 30 + 10;
    assert(N.dignity('Sun', at('Leo')) === 'domicile' && N.dignity('Sun', at('Aries')) === 'exaltation', 'Sun');
    assert(N.dignity('Sun', at('Aquarius')) === 'detriment' && N.dignity('Sun', at('Libra')) === 'fall', 'Sun hard');
    assert(N.dignity('Moon', at('Taurus')) === 'exaltation' && N.dignity('Moon', at('Scorpio')) === 'fall', 'Moon');
    assert(N.dignity('Venus', at('Pisces')) === 'exaltation' && N.dignity('Venus', at('Virgo')) === 'fall', 'Venus');
    assert(N.dignity('Saturn', at('Libra')) === 'exaltation' && N.dignity('Saturn', at('Cancer')) === 'detriment', 'Saturn');
    assert(N.dignity('Mercury', at('Virgo')) === 'domicile', 'Mercury rules and is exalted in Virgo: domicile wins');
    assert(N.dignity('Uranus', at('Aquarius')) === null && N.dignity('Mars', at('Leo')) === null, 'no dignity');
    // Every classical planet has 2 domiciles (Sun, Moon 1) and the detriments are the opposite signs.
    Object.entries(N.DIGNITY).forEach(([k, d]) => {
      assert(d.dom.length === (k === 'Sun' || k === 'Moon' ? 1 : 2), k + ' domiciles');
      d.dom.forEach(s => assert(d.det.includes((s + 6) % 12), k + ' detriment opposite domicile'));
      assert(d.fall === (d.exalt + 6) % 12, k + ' fall opposite exaltation');
    });
  }],
  ['Default chart: Big Three, chart ruler, dignities, as computed independently', () => {
    const b = N.bigThree(C);
    assert(b.sun === 'Cancer' && b.moon === 'Sagittarius' && b.rising === 'Scorpio', JSON.stringify(b));
    const r = N.chartRuler(C);
    assert(r.key === 'Mars' && r.modern === 'Pluto' && TD.SIGNS[Math.floor(r.lon / 30)] === 'Taurus', JSON.stringify(r));
    const sat = C.planets.find(p => p.key === 'Saturn');
    assert(N.dignity('Saturn', sat.lon) === 'domicile', 'Saturn in Aquarius');
  }],
  ['Balance: every point counted once in each table; hemispheres split the ten planets', () => {
    const b = N.balance(C);
    const sum = o => Object.values(o).reduce((s, l) => s + l.length, 0);
    assert(b.n === 11 && sum(b.el) === 11 && sum(b.mod) === 11, 'ten planets + Ascendant');
    assert(b.hemi.above.length + b.hemi.below.length === 10 && b.hemi.east.length + b.hemi.west.length === 10, 'hemispheres');
    const nt = N.balance(TD.chart({ y: 1992, mo: 7, d: 11, h: 12, mi: 0, timeKnown: false, lat: 39.7, lon: -105, tz: 'America/Denver' }));
    assert(nt.n === 10 && !nt.hemi, 'no time: no Ascendant, no hemispheres');
  }],
  ['Aspects: closest first, never Ascendant to Midheaven, all within the published orbs', () => {
    const list = N.aspects(C);
    assert(list.length > 5, 'some aspects');
    list.forEach((a, i) => {
      assert(i === 0 || a.orb >= list[i - 1].orb, 'sorted by orb');
      assert(a.orb <= a.allowed, 'inside its orb');
      assert(!(a.a === 'Ascendant' && a.b === 'Midheaven'), 'angles not aspected to each other');
    });
    const sunMars = list.find(a => a.a === 'Sun' && a.b === 'Mars');
    assert(sunMars && sunMars.type === 'sextile', 'Sun 19 Cancer sextile Mars 19 Taurus');
  }]
];
