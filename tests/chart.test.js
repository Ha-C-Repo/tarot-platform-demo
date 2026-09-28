// The astrology engine, checked against sources outside this code.
const load = require('./load');
const w = load(['js/vendor/astronomy.browser.min.js', 'js/astro.js', 'js/chart.js']);
const TD = w.TD;
const RAD = Math.PI / 180;
const norm = d => ((d % 360) + 360) % 360;
const sep = (a, b) => { const d = norm(a - b); return d > 180 ? 360 - d : d; };
const dms = (sign, d, m, s) => sign * 30 + d + m / 60 + s / 3600;
const assert = (c, msg) => { if (!c) throw new Error(msg); };

/* Reference: Astro-Databank, Barack Obama, Rodden rating AA (birth certificate).
   4 Aug 1961, 19:24 AHST (UTC-10), Honolulu 21n18 157w52.
   Positions read from Astrodienst's published chart (Swiss Ephemeris), retrieved 2026-09-28:
   https://www.astro.com/astro-databank/Obama,_Barack  (chart with Whole Sign houses). */
const OBAMA = {
  input: { y: 1961, mo: 8, d: 4, h: 19, mi: 24, timeKnown: true, lat: 21 + 18 / 60, lon: -(157 + 52 / 60), tz: 'Pacific/Honolulu' },
  Sun: dms(4, 12, 32, 53), Moon: dms(2, 3, 21, 27), Mercury: dms(4, 2, 19, 54), Venus: dms(3, 1, 47, 22),
  Mars: dms(5, 22, 34, 36), Jupiter: dms(10, 0, 51, 31), Saturn: dms(9, 25, 19, 51), Uranus: dms(4, 25, 16, 15),
  Neptune: dms(7, 8, 36, 21), Pluto: dms(5, 6, 58, 40), Node: dms(4, 27, 53, 33),
  ASC: dms(10, 18, 2, 41), MC: dms(7, 28, 53, 7), LSTh: 15 + 46 / 60 + 38 / 3600,
  retro: ['Jupiter', 'Saturn']
};

/* Independent geometry: altitude and azimuth of an ecliptic point (latitude 0) for a given
   local sidereal angle. Used to confirm the Ascendant really is on the eastern horizon and the
   MC really is on the meridian, at any latitude. */
function altAz(lon, ramc, lat, eps){
  const l = lon * RAD, e = eps * RAD, f = lat * RAD;
  const ra = Math.atan2(Math.sin(l) * Math.cos(e), Math.cos(l)), dec = Math.asin(Math.sin(l) * Math.sin(e));
  const H = ramc * RAD - ra;
  const alt = Math.asin(Math.sin(f) * Math.sin(dec) + Math.cos(f) * Math.cos(dec) * Math.cos(H));
  const az = Math.atan2(-Math.sin(H) * Math.cos(dec), Math.cos(f) * Math.sin(dec) - Math.sin(f) * Math.cos(dec) * Math.cos(H));
  return { alt: alt / RAD, az: norm(az / RAD), H: norm(H / RAD) };
}
function saneHouses(c, label){
  const a = c.angles, eps = a.obliquity;
  const asc = altAz(a.asc, a.ramc, c.input.lat, eps);
  assert(Math.abs(asc.alt) < 0.01, `${label}: Ascendant altitude ${asc.alt.toFixed(4)} deg, expected 0`);
  assert(asc.az > 0 && asc.az < 180, `${label}: Ascendant azimuth ${asc.az.toFixed(2)} deg is not in the east`);
  const mc = altAz(a.mc, a.ramc, c.input.lat, eps);
  assert(sep(mc.H, 0) < 0.01, `${label}: MC hour angle ${mc.H.toFixed(4)}, expected 0 (on the meridian)`);
  for (let i = 0; i < 12; i++) assert(Math.abs(sep(c.cusps[(i + 1) % 12], c.cusps[i]) - 30) < 1e-9, `${label}: cusps not 30 deg apart`);
  c.planets.forEach(p => assert(p.house >= 1 && p.house <= 12, `${label}: ${p.key} has house ${p.house}`));
}

module.exports = [
  ['Ten bodies match Astrodienst within 1 arcminute (Rodden AA chart)', () => {
    const c = TD.chart(OBAMA.input);
    const worst = [];
    c.planets.forEach(p => {
      const d = sep(p.lon, OBAMA[p.key]) * 3600;
      worst.push(`${p.key} ${d.toFixed(1)}"`);
      assert(d < 60, `${p.key}: ${TD.fmtLon(p.lon)} vs published ${TD.fmtLon(OBAMA[p.key])}, off by ${d.toFixed(1)} arcsec`);
      assert(p.retro === OBAMA.retro.includes(p.key), `${p.key}: retrograde flag wrong`);
    });
    const dn = sep(TD.meanNode(c.utc), OBAMA.Node) * 3600;
    assert(dn < 60, `Mean node off by ${dn.toFixed(1)} arcsec`);
    return worst.join(', ') + `, node ${dn.toFixed(1)}"`;
  }],
  ['Ascendant, MC and sidereal time match the same chart', () => {
    const c = TD.chart(OBAMA.input);
    const da = sep(c.angles.asc, OBAMA.ASC) * 60, dm = sep(c.angles.mc, OBAMA.MC) * 60;
    assert(da < 60, `ASC off by ${da.toFixed(2)} arcmin`); assert(dm < 60, `MC off by ${dm.toFixed(2)} arcmin`);
    const dl = Math.abs(c.angles.lst - OBAMA.LSTh) * 3600;
    assert(dl < 2, `LST off by ${dl.toFixed(1)} s`);
    return `ASC ${da.toFixed(2)}', MC ${dm.toFixed(2)}', LST ${dl.toFixed(1)}s`;
  }],
  ['Local time to UTC, with historical daylight saving (handoff table)', () => {
    const cases = [
      [[1974, 6, 15, 3, 30, 'Australia/Sydney'], '1974-06-14T17:30:00.000Z'],
      [[1985, 1, 20, 14, 5, 'America/New_York'], '1985-01-20T19:05:00.000Z'],
      [[1985, 7, 20, 14, 5, 'America/New_York'], '1985-07-20T18:05:00.000Z'],
      [[1968, 3, 1, 9, 0, 'Europe/London'], '1968-03-01T08:00:00.000Z'],      // British Standard Time experiment
      [[2026, 9, 28, 12, 0, 'America/Denver'], '2026-09-28T18:00:00.000Z'],
      [[1961, 8, 4, 19, 24, 'Pacific/Honolulu'], '1961-08-05T05:24:00.000Z']
    ];
    cases.forEach(([a, want]) => {
      const r = TD.localToUTC(...a);
      assert(new Date(r.utc).toISOString() === want, `${a.join(' ')} gave ${new Date(r.utc).toISOString()}, want ${want}`);
      assert(r.status === 'ok', `${a.join(' ')} status ${r.status}`);
    });
  }],
  ['The repeated hour when clocks go back is flagged, first occurrence used', () => {
    const r = TD.localToUTC(2021, 11, 7, 1, 30, 'America/New_York');
    assert(r.status === 'ambiguous', 'status ' + r.status);
    assert(new Date(r.utc).toISOString() === '2021-11-07T05:30:00.000Z', 'first occurrence should be 05:30Z (EDT)');
    assert(new Date(r.altUtc).toISOString() === '2021-11-07T06:30:00.000Z', 'second occurrence should be 06:30Z (EST)');
    const lon = TD.localToUTC(1975, 10, 26, 2, 30, 'Europe/London');   // BST ended 03:00 BST -> 02:00 GMT
    assert(lon.status === 'ambiguous', 'London 1975 fall-back hour not flagged');
  }],
  ['The skipped hour when clocks go forward is flagged, not silently shifted', () => {
    const r = TD.localToUTC(2021, 3, 14, 2, 30, 'America/New_York');
    assert(r.status === 'gap', 'status ' + r.status);
    assert(new Date(r.utc).toISOString() === '2021-03-14T07:30:00.000Z', 'gap time should be read on the old offset');
  }],
  ['Southern-hemisphere chart has sane houses (Sydney, both house systems)', () => {
    ['whole', 'equal'].forEach(system => {
      for (let h = 0; h < 24; h += 3) {
        const c = TD.chart({ y: 1974, mo: 6, d: 15, h, mi: 30, timeKnown: true, lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney', system });
        saneHouses(c, `Sydney ${h}:30 ${system}`);
      }
    });
  }],
  ['High-latitude chart has sane houses (Tromso 69.6N, round the clock, both solstices)', () => {
    let flips = 0;
    [[2026, 6, 21], [2026, 12, 21]].forEach(([y, mo, d]) => {
      for (let h = 0; h < 24; h++) {
        const c = TD.chart({ y, mo, d, h, mi: 0, timeKnown: true, lat: 69.6492, lon: 18.9553, tz: 'Europe/Oslo', system: 'whole' });
        saneHouses(c, `Tromso ${y}-${mo}-${d} ${h}:00`);
        if (c.angles.flipped) flips++;
      }
    });
    return `${flips} of 48 hours needed the polar correction`;
  }],
  ['Time unknown: no houses, no Ascendant, Moon sign flagged when it changes that day', () => {
    // Find a day in 1990 when the Moon changes sign, and one when it does not.
    let changed = null, steady = null;
    for (let d = 1; d <= 28 && (!changed || !steady); d++) {
      const c = TD.chart({ y: 1990, mo: 3, d, timeKnown: false, lat: 40.7128, lon: -74.006, tz: 'America/New_York' });
      assert(!c.angles && !c.cusps, 'time-unknown chart must not carry angles or cusps');
      assert(c.planets.every(p => p.house === undefined), 'time-unknown chart must not assign houses');
      const moon = c.planets.find(p => p.key === 'Moon');
      if (moon.signUncertain && !changed) changed = d;
      if (!moon.signUncertain && !steady) steady = d;
    }
    assert(changed && steady, 'expected both a sign-change day and a steady day in March 1990');
    return `Moon changes sign on 1990-03-${changed}, steady on 1990-03-${steady}`;
  }],
  ['Composite midpoints take the shorter arc across 0 Aries', () => {
    const cases = [[350, 10, 0], [10, 350, 0], [170, 190, 180], [0, 90, 45], [300, 20, 340], [359, 1, 0]];
    cases.forEach(([a, b, want]) => { const m = TD.midpoint(a, b); assert(sep(m, want) < 1e-9, `midpoint(${a}, ${b}) = ${m}, want ${want}`); });
  }],
  ['Aspects use the published orbs', () => {
    const A = (a, b, ka = 'Mars', kb = 'Venus') => TD.aspectBetween({ key: ka, lon: a }, { key: kb, lon: b });
    assert(A(10, 130).type === 'trine', 'exact trine');
    assert(A(10, 136).type === 'trine', 'trine at 6 deg orb');
    assert(A(10, 137) === null, 'no trine beyond 6 deg for non-luminaries');
    assert(A(10, 137, 'Sun').type === 'trine', 'Sun gets 8 deg');
    assert(A(355, 59).type === 'sextile', 'sextile across 0 Aries');
    assert(A(355, 61) === null, 'sextile limited to 4 deg');
    assert(A(0, 180).type === 'opposition' && A(0, 90).type === 'square' && A(5, 0).type === 'conjunction', 'major aspects');
  }],
  ['Synastry grid is 10 x 10 and the score stays in 0-100', () => {
    const a = TD.chart(OBAMA.input);
    const b = TD.chart({ y: 1964, mo: 1, d: 17, h: 12, mi: 0, timeKnown: false, lat: 41.8781, lon: -87.6298, tz: 'America/Chicago' });
    const s = TD.synastry(a, b);
    assert(s.grid.length === 10 && s.grid.every(r => r.length === 10), 'grid shape');
    assert(s.score >= 0 && s.score <= 100, 'score ' + s.score);
    s.grid.forEach((row, i) => row.forEach((c, j) => {
      if (c) assert(c.uncertain === (j === 1), `cell ${i},${j}: only B's Moon (column 1) should be uncertain, B has no birth time`);
    }));
    assert(s.contacts.every(c => !c.uncertain), 'uncertain contacts must not be scored');
    return `score ${s.score}, ${s.contacts.length} scored contacts`;
  }]
];
