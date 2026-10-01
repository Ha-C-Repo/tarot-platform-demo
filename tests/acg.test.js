// Astrocartography lines (js/acg.js), checked through Astronomy Engine's own horizon code: on an ASC or DSC line
// the planet sits on the horizon (east or west), on an MC line it is due south or north at its highest.
const load = require('./load');
const TD = load(['js/vendor/astronomy.browser.min.js', 'js/astro.js', 'js/chart.js', 'js/acg.js', 'js/data/world.js']).TD;
const A = TD.acg, AE = TD.Astronomy || load(['js/vendor/astronomy.browser.min.js']).Astronomy;
const assert = (c, msg) => { if (!c) throw new Error(msg); };
const C = TD.chart({ y: 1992, mo: 7, d: 11, h: 14, mi: 20, timeKnown: true, lat: 39.7392, lon: -104.9903, tz: 'America/Denver', system: 'whole' });
const L = A.lines(C.utc);
const hz = (b, lat, lon) => AE.Horizon(C.utc, new AE.Observer(lat, lon, 0), b.ra / 15, b.dec, null);

module.exports = [
  ['40 lines; RA and declination agree with Astronomy Engine Equator() (planets, 0.01 deg)', () => {
    assert(L.lines.length === 40, `${L.lines.length} lines`);
    L.sky.bodies.filter(b => b.key !== 'Moon').forEach(b => {
      const e = AE.Equator(AE.Body[b.key], C.utc, new AE.Observer(0, 0, 0), true, true);
      assert(Math.abs(((e.ra * 15 - b.ra + 540) % 360) - 180) < 0.01 && Math.abs(e.dec - b.dec) < 0.01, b.key);
    });
  }],
  ['On ASC and DSC lines the planet is on the horizon, east or west; on MC/IC it is on the meridian', () => {
    let worstAlt = 0, worstAz = 0, n = 0;
    L.lines.forEach(l => {
      const b = L.sky.bodies.find(x => x.key === l.body);
      l.segs.forEach(seg => seg.forEach(([lon, lat], i) => {
        if (i % 7 || Math.abs(lat) > 75) return;
        const h = hz(b, lat, lon); n++;
        if (l.line === 'ASC' || l.line === 'DSC') {
          worstAlt = Math.max(worstAlt, Math.abs(h.altitude));
          if (Math.abs(h.altitude) < 0.05 && Math.abs(Math.abs(lat) - (90 - Math.abs(b.dec))) > 2)
            assert(l.line === 'ASC' ? h.azimuth < 180 : h.azimuth > 180, `${l.body} ${l.line} azimuth ${h.azimuth.toFixed(1)} at ${lat}`);
        } else {
          const az = h.azimuth, d = Math.min(Math.abs(az), Math.abs(az - 180), Math.abs(az - 360));
          if (Math.abs(lat - b.dec) > 2) worstAz = Math.max(worstAz, d);
          if (l.line === 'MC') assert(Math.abs(h.altitude - (90 - Math.abs(lat - b.dec))) < 0.05, `${l.body} MC altitude at ${lat}`);
          else assert(Math.abs(h.altitude + (90 - Math.abs(lat + b.dec))) < 0.05, `${l.body} IC altitude at ${lat}`);
        }
      }));
    });
    assert(worstAlt < 0.01, `ASC/DSC altitude off by ${worstAlt.toFixed(4)} deg`);
    assert(worstAz < 0.05, `MC/IC azimuth off the meridian by ${worstAz.toFixed(3)} deg`);
    return `${n} points, altitude within ${(worstAlt * 3600).toFixed(1)}"`;
  }],
  ['Lines near a place: a point on a line is 0 km from it; distances are great-circle', () => {
    const l = L.lines.find(x => x.body === 'Venus' && x.line === 'ASC'), [lon, lat] = l.segs[0][Math.floor(l.segs[0].length / 2)];
    const hit = A.near(L, lat, lon, 1000).find(x => x.body === 'Venus' && x.line === 'ASC');
    assert(hit && hit.km < 3, `Venus ASC ${hit && hit.km.toFixed(1)} km`);
    assert(Math.abs(A.km(0, 0, 0, 1) - 111.19) < 0.05 && Math.abs(A.km(51.5, -0.13, 40.71, -74.01) - 5570) < 15, 'haversine');
    assert(A.near(L, lat, lon, 1000).every((x, i, a) => !i || a[i - 1].km <= x.km), 'sorted');
  }],
  ['World outline loads: rings of [lon, lat] in tenths of a degree within range', () => {
    assert(TD.WORLD.length > 100, `${TD.WORLD.length} rings`);
    assert(TD.WORLD.every(r => r.length % 2 === 0 && r.every((v, i) => Math.abs(v) <= (i % 2 ? 900 : 1800))), 'ranges');
  }]
];
