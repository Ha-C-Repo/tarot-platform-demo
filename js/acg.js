/* acg.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   Astrocartography: for the moment of birth, where on Earth each planet (Sun to Pluto) was rising (ASC line),
   setting (DSC), overhead on the meridian (MC) or at the lowest point below (IC). Geocentric apparent right
   ascension and declination of date from Astronomy Engine, no refraction: the usual astrocartography
   convention. Load after astronomy.browser.min.js and chart.js. Longitudes east positive, degrees. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const AE = () => window.Astronomy;
const RAD = Math.PI / 180, R_KM = 6371;
const wrap = d => ((d + 540) % 360 + 360) % 360 - 180;
const LINES = ['ASC', 'DSC', 'MC', 'IC'];
const MAX_LAT = 80;

/* Apparent geocentric RA (degrees) and declination of date for every body, and the Greenwich sidereal angle. */
function sky(date){
  const time = AE().MakeTime(date), rot = AE().Rotation_EQJ_EQD(time);
  const bodies = NS.BODIES.map(b => {
    const eq = AE().EquatorFromVector(AE().RotateVector(rot, AE().GeoVector(AE().Body[b.key], time, true)));
    return { key: b.key, glyph: b.glyph, ra: eq.ra * 15, dec: eq.dec };
  });
  return { gst: AE().SiderealTime(time) * 15, bodies };
}

/* Longitude of a body's line at latitude lat, or null where it never rises or sets (ASC/DSC only). */
function lonAt(b, gst, line, lat){
  const mc = wrap(b.ra - gst);
  if (line === 'MC') return mc;
  if (line === 'IC') return wrap(mc + 180);
  const x = -Math.tan(lat * RAD) * Math.tan(b.dec * RAD);
  if (Math.abs(x) > 1) return null;
  const H = Math.acos(x) / RAD;                     // hour angle of rising / setting
  return wrap(line === 'ASC' ? mc - H : mc + H);
}

/* Every line as a polyline of [lon, lat] points, split where it crosses the date line. */
function lines(date){
  const s = sky(date), out = [];
  s.bodies.forEach(b => LINES.forEach(line => {
    let lats = [];
    for (let la = -MAX_LAT; la <= MAX_LAT + 1e-9; la += 0.5) lats.push(la);
    if (line === 'ASC' || line === 'DSC') {        // add the latitude where the line turns, so it meets MC/IC cleanly
      const lim = 90 - Math.abs(b.dec);
      [lim, -lim].forEach(l => { if (Math.abs(l) < MAX_LAT) lats.push(l * 0.999999); });
      lats.sort((a, c) => a - c);
    }
    const segs = []; let cur = [];
    lats.forEach(la => {
      const lo = lonAt(b, s.gst, line, la);
      if (lo == null) { if (cur.length > 1) segs.push(cur); cur = []; return; }
      if (cur.length && Math.abs(lo - cur[cur.length - 1][0]) > 180) { segs.push(cur); cur = []; }
      cur.push([lo, la]);
    });
    if (cur.length > 1) segs.push(cur);
    out.push({ body: b.key, glyph: b.glyph, line, segs, ra: b.ra, dec: b.dec });
  }));
  return { gst: s.gst, lines: out, sky: s };
}

/* Great-circle distance in km. */
function km(lat1, lon1, lat2, lon2){
  const a = Math.sin((lat2 - lat1) * RAD / 2) ** 2 + Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin((lon2 - lon1) * RAD / 2) ** 2;
  return 2 * R_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

/* Lines within maxKm of a place, closest first: the nearest point of each line found by searching latitudes
   within 15 degrees of the place in 0.05 degree steps, on the exact line formula. */
function near(L, lat, lon, maxKm){
  const out = [];
  L.lines.forEach(l => {
    const b = L.sky.bodies.find(x => x.key === l.body);
    let best = Infinity, at = null;
    for (let la = Math.max(-89, lat - 15); la <= Math.min(89, lat + 15); la += 0.05) {
      const lo = lonAt(b, L.gst, l.line, la); if (lo == null) continue;
      const d = km(lat, lon, la, lo); if (d < best) { best = d; at = [lo, la]; }
    }
    if (best <= maxKm) out.push({ body: l.body, glyph: l.glyph, line: l.line, km: best, at });
  });
  return out.sort((a, b) => a.km - b.km);
}

NS.acg = { LINES, MAX_LAT, sky, lonAt, lines, near, km };
})(window.TD);
