// The Vedic chart (js/vedic.js), checked against Swiss Ephemeris (Lahiri) and the rules of the system.
const load = require('./load');
const TD = load(['js/vendor/astronomy.browser.min.js', 'js/astro.js', 'js/chart.js', 'js/vedic.js']).TD;
const V = TD.vedic;
const assert = (c, msg) => { if (!c) throw new Error(msg); };
const DAY = 864e5;
const sep = (a, b) => { const d = ((a - b) % 360 + 360) % 360; return d > 180 ? 360 - d : d; };
const fx = require('./fixtures/vedic-swisseph.json').cases;
const chartOf = f => { const [y, mo, d, h, mi] = f.local; return TD.chart({ y, mo, d, h, mi, timeKnown: true, lat: f.lat, lon: f.lon, tz: f.tz, system: 'whole' }); };

module.exports = [
  ['Lahiri ayanamsa, sidereal grahas and Lagna match Swiss Ephemeris (6 charts, 1962-2005)', () => {
    let wa = 0, wg = 0, wl = 0;
    fx.forEach(f => {
      const c = chartOf(f), v = V.chart(c);
      assert(Math.abs(+c.utc - +new Date(f.utc)) < 1000, `${f.name}: UTC instant`);
      wa = Math.max(wa, Math.abs(v.ayanamsa.true - f.ayanamsa) * 3600);
      v.grahas.forEach(g => { if (f.grahas[g.key] != null) wg = Math.max(wg, sep(g.lon, f.grahas[g.key]) * 60); });
      wg = Math.max(wg, sep(v.grahas[8].lon, (f.grahas.Rahu + 180) % 360) * 60);
      wl = Math.max(wl, sep(v.lagna.lon, f.lagna) * 60);
    });
    assert(wa < 2, `ayanamsa worst ${wa.toFixed(2)}"`);
    assert(wg < 1, `grahas worst ${wg.toFixed(2)}'`);
    assert(wl < 1, `Lagna worst ${wl.toFixed(2)}'`);
    return `ayanamsa ${wa.toFixed(2)}", grahas ${wg.toFixed(2)}', Lagna ${wl.toFixed(2)}'`;
  }],
  ['Nakshatra, pada and Navamsa follow the 13°20′ and 3°20′ divisions', () => {
    const n = V.nakshatra;
    assert(n(0).name === 'Ashwini' && n(0).pada === 1 && n(0).lord === 'Ketu', 'Aries 0');
    assert(n(13.34).name === 'Bharani' && n(13.34).lord === 'Venus', 'Aries 13°20′');
    assert(n(359.9).name === 'Revati' && n(359.9).pada === 4 && n(359.9).lord === 'Mercury', 'Pisces 29°54′');
    assert(n(120.1).name === 'Magha' && n(120.1).lord === 'Ketu', 'Leo 0 starts the second cycle');
    assert(n(3.34).pada === 2 && n(6.67).pada === 3 && n(10.01).pada === 4, 'padas');
    // Navamsa: movable signs start from themselves, fixed from the 9th, dual from the 5th.
    assert(V.navamsaSign(0) === 0 && V.navamsaSign(30) === 9 && V.navamsaSign(60) === 6 && V.navamsaSign(90) === 3, 'first navamsa of Aries/Taurus/Gemini/Cancer');
    assert(V.navamsaSign(29.99) === 8 && V.navamsaSign(359.99) === 11, 'last navamsas');
  }],
  ['Vimshottari: the Moon\'s nakshatra lord first, balance from the part left, 120-year cycle, sub-periods fill each period', () => {
    const birth = new Date(Date.UTC(1990, 0, 1));
    const d = V.vimshottari(13.3333333 / 2, birth);            // halfway through Ashwini (Ketu)
    assert(d.periods[0].lord === 'Ketu' && Math.abs(d.balance.years - 3.5) < 1e-6, 'Ketu, 3.5 years left');
    assert(Math.abs((d.periods[0].start - birth) / V.VYEAR + 3.5) < 1e-6, 'started 3.5 years before birth');
    const order = d.periods.map(p => p.lord).join(' ');
    assert(order === 'Ketu Venus Sun Moon Mars Rahu Jupiter Saturn Mercury Ketu', order);
    assert(Math.abs((d.periods[9].start - d.periods[0].start) / V.VYEAR - 120) < 1e-6, '120 years');
    d.periods.forEach(p => {
      assert(p.ads[0].lord === p.lord, `${p.lord} opens with itself`);
      assert(Math.abs(+p.ads[8].end - +p.end) < 1000 && +p.ads[0].start === +p.start, `${p.lord} sub-periods fill it`);
    });
    const venusSun = d.periods[1].ads[1];                        // Venus-Sun: 20 x 6 / 120 = 1 year
    assert(venusSun.lord === 'Sun' && Math.abs((venusSun.end - venusSun.start) / V.VYEAR - 1) < 1e-9, 'Venus-Sun is one year');
    const cur = V.currentDasha(d, new Date(Date.UTC(2000, 0, 1)));
    assert(cur.md.lord === 'Venus' && cur.ad, 'current period found');
  }],
  ['Panchang: tithi, yoga, karana and the vara that starts at sunrise', () => {
    const c = TD.chart({ y: 1984, mo: 3, d: 5, h: 6, mi: 40, timeKnown: true, lat: 28.6139, lon: 77.209, tz: 'Asia/Kolkata', system: 'whole' });
    const v = V.chart(c), p = V.panchang(v, c);
    const el = ((v.grahas[1].lon - v.grahas[0].lon) + 360) % 360;
    assert(p.tithi.n === Math.floor(el / 12) + 1, 'tithi from the Moon-Sun angle');
    assert(V.YOGA.includes(p.yoga) && typeof p.karana === 'string', 'yoga and karana named');
    // 6:40 in Delhi on 5 March 1984 is just before sunrise (about 6:45): still Sunday's vara, though the date is Monday.
    assert(p.vara.beforeSunrise === true && p.vara.en === 'Sunday', `vara ${p.vara.en}`);
    const c2 = TD.chart({ y: 1984, mo: 3, d: 5, h: 9, mi: 0, timeKnown: true, lat: 28.6139, lon: 77.209, tz: 'Asia/Kolkata', system: 'whole' });
    assert(V.panchang(V.chart(c2), c2).vara.en === 'Monday', 'after sunrise: Monday');
  }],
  ['Manglik counts Mars from the Lagna and the Moon; Sade Sati covers Saturn in the 12th, 1st and 2nd from the Moon', () => {
    fx.forEach(f => {
      const v = V.chart(chartOf(f)), m = v.manglik, mars = v.grahas[2].sign;
      assert(m.fromMoon === V.houseFrom(v.grahas[1].sign, mars) && m.fromLagna === V.houseFrom(v.lagna.sign, mars), f.name);
      assert(m.present === (V.MANGLIK_HOUSES.includes(m.fromMoon) || V.MANGLIK_HOUSES.includes(m.fromLagna)), f.name + ' present');
    });
    const c = chartOf(fx[3]), v = V.chart(c), ms = v.grahas[1].sign;
    const cy = V.sadeSati(v, c.utc, new Date(+c.utc + 90 * 365.25 * DAY));
    assert(cy.length >= 2 && cy.length <= 4, `${cy.length} cycles in 90 years`);
    cy.forEach(k => {
      const yrs = (k.end - k.start) / (365.25 * DAY);
      assert(k.openStart || k.openEnd || (yrs > 6.5 && yrs < 9), `cycle of ${yrs.toFixed(1)} years`);
      k.segs.forEach(s => {
        const mid = new Date((+s.start + +s.end) / 2), sat = Math.floor(V.sidereal(TD.eclLon('Saturn', mid), mid) / 30);
        assert({ rising: (ms + 11) % 12, peak: ms, setting: (ms + 1) % 12 }[s.phase] === sat, 'phase sign');
      });
    });
    for (let i = 1; i < cy.length; i++) assert((cy[i].start - cy[i - 1].end) / (365.25 * DAY) > 15, 'cycles about 30 years apart');
    // Saturn touches sidereal Libra for ten days in 2041 (28 Jan to 7 Feb, found by a day-by-day search) and turns back
    // within 0.01 deg of the edge: a short first pass the search must not miss.
    const dip = cy.flatMap(k => k.segs).find(s => Math.abs(s.start - Date.UTC(2041, 0, 28)) < 2 * DAY);
    assert(dip && dip.phase === 'rising' && Math.abs((dip.end - dip.start) / DAY - 10) < 2, '2041 ten-day pass');
  }],
  ['vedic-text.js has every text the Vedic and astrocartography pages ask for (186), and nothing else', () => {
    const X = load(['js/data/vedic-text.js']).TD.VEDIC_TEXT, want = [];
    TD.SIGNS.forEach(s => want.push('lagna:' + s, 'rashi:' + s));
    V.NAKSHATRAS.forEach(n => want.push('nak:' + n));
    V.DASHA.forEach(([a]) => { want.push('md:' + a); V.DASHA.forEach(([b]) => want.push(`ad:${a}|${b}`)); });
    want.push('manglik:yes', 'manglik:no', 'sadesati:rising', 'sadesati:peak', 'sadesati:setting');
    TD.BODIES.forEach(b => ['ASC', 'DSC', 'MC', 'IC'].forEach(l => want.push(`acg:${b.key}:${l}`)));
    const missing = want.filter(k => !X[k]), extra = Object.keys(X).filter(k => !want.includes(k));
    assert(!missing.length && !extra.length && want.length === 186, `missing ${missing.slice(0, 3)} extra ${extra.slice(0, 3)}`);
  }],
  ['No birth time: no Lagna or houses, the Moon\'s day span is checked for a sign or nakshatra change', () => {
    const v = V.chart(TD.chart({ y: 1992, mo: 7, d: 11, timeKnown: false, lat: 39.7392, lon: -104.9903, tz: 'America/Denver', system: 'whole' }));
    assert(!v.lagna && v.grahas.every(g => g.house == null), 'no Lagna');
    assert(Array.isArray(v.grahas[1].range) && typeof v.grahas[1].nakUncertain === 'boolean', 'Moon range');
    assert(v.manglik.fromLagna === null, 'Manglik from the Moon only');
  }]
];
