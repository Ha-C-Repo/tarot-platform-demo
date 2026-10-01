/* natal.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   Reads a natal chart from chart.js into the summaries a birth-chart page shows: the Big Three,
   element / modality / hemisphere balance, the chart ruler, essential dignities and the aspect list.
   Load after astro.js and chart.js. All of it is arithmetic on the chart; no interpretation text here. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const norm = d => ((d % 360) + 360) % 360;
const signIdx = lon => Math.floor(norm(lon) / 30);

/* Traditional rulers (the seven visible planets), with the modern outer-planet co-rulers. */
const RULER = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
const MODERN_RULER = { 7: 'Pluto', 10: 'Uranus', 11: 'Neptune' };
/* Essential dignities by sign index (Ptolemy's table; exaltation signs only, no degrees). */
const DIGNITY = {
  Sun:     { dom: [4],     exalt: 0,  det: [10],    fall: 6 },
  Moon:    { dom: [3],     exalt: 1,  det: [9],     fall: 7 },
  Mercury: { dom: [2, 5],  exalt: 5,  det: [8, 11], fall: 11 },
  Venus:   { dom: [1, 6],  exalt: 11, det: [7, 0],  fall: 5 },
  Mars:    { dom: [0, 7],  exalt: 9,  det: [6, 1],  fall: 3 },
  Jupiter: { dom: [8, 11], exalt: 3,  det: [2, 5],  fall: 9 },
  Saturn:  { dom: [9, 10], exalt: 6,  det: [3, 4],  fall: 0 }
};
function dignity(key, lon){
  const d = DIGNITY[key]; if (!d) return null;
  const s = signIdx(lon);
  if (d.dom.includes(s)) return 'domicile';
  if (d.exalt === s) return 'exaltation';
  if (d.det.includes(s)) return 'detriment';
  if (d.fall === s) return 'fall';
  return null;
}

/* Element and modality counts over the ten planets, plus the Ascendant when the time is known. */
function balance(c){
  const pts = c.planets.map(p => ({ key: p.key, lon: p.lon }));
  if (c.angles) pts.push({ key: 'Ascendant', lon: c.angles.asc });
  const el = { Fire: [], Earth: [], Air: [], Water: [] }, mod = { Cardinal: [], Fixed: [], Mutable: [] };
  pts.forEach(p => { const s = signIdx(p.lon); el[NS.elementOf(s)].push(p.key); mod[NS.modalityOf(s)].push(p.key); });
  const out = { el, mod, n: pts.length };
  if (c.angles) {                                    // hemispheres from the houses: 7-12 above the horizon, 10-3 east
    const above = c.planets.filter(p => p.house >= 7).map(p => p.key);
    const east = c.planets.filter(p => p.house >= 10 || p.house <= 3).map(p => p.key);
    out.hemi = { above, below: c.planets.filter(p => !above.includes(p.key)).map(p => p.key),
                 east, west: c.planets.filter(p => !east.includes(p.key)).map(p => p.key) };
  }
  return out;
}

/* Chart ruler: ruler of the rising sign, and where that planet sits. */
function chartRuler(c){
  if (!c.angles) return null;
  const s = signIdx(c.angles.asc), key = RULER[s], p = c.planets.find(x => x.key === key);
  return { sign: NS.SIGNS[s], key, modern: MODERN_RULER[s] || null, lon: p.lon, house: p.house };
}

/* Every major aspect between the ten planets (and the angles when known), closest first. */
function aspects(c){
  const pts = c.planets.map(p => ({ key: p.key, lon: p.lon, uncertain: !c.timeKnown && p.key === 'Moon' }));
  if (c.angles) pts.push({ key: 'Ascendant', lon: c.angles.asc }, { key: 'Midheaven', lon: c.angles.mc });
  const out = [];
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    if (pts[i].key === 'Ascendant' && pts[j].key === 'Midheaven') continue;
    const a = NS.aspectBetween(pts[i], pts[j]);
    if (a) out.push(Object.assign({ a: pts[i].key, b: pts[j].key, uncertain: pts[i].uncertain || pts[j].uncertain }, a));
  }
  return out.sort((x, y) => x.orb - y.orb);
}

/* Applying or separating, from the planets' daily speeds: does the orb shrink over the next day? */
function applying(c, asp){
  const P = k => c.planets.find(p => p.key === k);
  const a = P(asp.a), b = P(asp.b); if (!a || !b) return null;
  const target = NS.ASPECTS.find(x => x.key === asp.type).angle;
  const now = Math.abs(NS.separation(a.lon, b.lon) - target);
  const next = Math.abs(NS.separation(a.lon + a.speed / 1, b.lon + b.speed / 1) - target);
  return next < now;
}

/* The Big Three. Moon sign is marked uncertain when there is no birth time and it changes sign that day. */
function bigThree(c){
  const sun = c.planets[0], moon = c.planets[1];
  return {
    sun: NS.SIGNS[signIdx(sun.lon)],
    moon: moon.signUncertain ? null : NS.SIGNS[signIdx(moon.lon)],
    moonRange: moon.signUncertain ? [NS.SIGNS[signIdx(moon.range[0])], NS.SIGNS[signIdx(moon.range[1])]] : null,
    rising: c.angles ? NS.SIGNS[signIdx(c.angles.asc)] : null
  };
}

NS.natal = { RULER, MODERN_RULER, DIGNITY, dignity, balance, chartRuler, aspects, applying, bigThree };
})(window.TD);
