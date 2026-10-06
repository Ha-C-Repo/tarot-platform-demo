/* horary.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   Horary astrology: a chart cast for the moment a question is asked, judged by the traditional rules.
   Load after astronomy.browser.min.js, astro.js, chart.js and natal.js.

   METHOD.
   - The chart: the moment and place of the question, Placidus houses (traditional horary often uses Regiomontanus;
     this demo uses Placidus, which differs mainly in intermediate cusps), tropical zodiac.
   - Significators: the person asking is the traditional ruler of the Ascendant's sign; the matter is the traditional
     ruler of the sign on the cusp of the house the question belongs to (2nd money, 7th partner, 10th career...).
     Only the seven traditional planets rule. The Moon is the asker's co-significator.
   - Perfection: the two significators come to an exact major aspect (conjunction, sextile, square, trine, opposition)
     in the future before either leaves its present sign. Found by stepping forward (2 hours when the Moon is involved,
     12 hours otherwise) on the signed longitude difference and bisecting each crossing to under a minute.
   - If not: translation of light, when the Moon (not itself a significator) last perfected an aspect with one
     significator and next perfects one with the other before leaving its sign. Then the Moon as co-significator
     applying to the matter's significator before leaving its sign.
   - Considerations before judgement: Ascendant under 3 or over 27 degrees of its sign, the Moon void of course (no
     exact major aspect to the Sun or Mercury to Saturn before it leaves its sign), the Moon in the Via Combusta
     (15 Libra to 15 Scorpio), Saturn in the 7th house. They are shown as cautions; the page still gives the
     judgement. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const DAY = 864e5, norm = d => ((d % 360) + 360) % 360, wrap = d => ((d + 540) % 360) - 180;
const TRAD = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
const TARGETS = [[0, 'conjunction'], [60, 'sextile'], [-60, 'sextile'], [90, 'square'], [-90, 'square'], [120, 'trine'], [-120, 'trine'], [180, 'opposition']];
const KIND = { conjunction: 'conjunction', sextile: 'easy', trine: 'easy', square: 'hard', opposition: 'hard' };
const lon = (k, t) => NS.eclLon(k, new Date(t));
const signOf = l => Math.floor(norm(l) / 30);
/* The first exact aspect between bodies a and b after t0 (or before it, dir -1). Stops when a leaves its sign, and when
   b leaves its sign unless onlyA. Returns { type, kind, time } or null. */
function exact(a, b, t0, dir = 1, onlyA = false, maxDays = 800){
  const sa = signOf(lon(a, t0)), sb = signOf(lon(b, t0));
  const step = (a === 'Moon' || b === 'Moon' ? 2 * 3600e3 : 12 * 3600e3) * dir;
  const g = (t, x) => wrap(lon(a, t) - lon(b, t) - x);
  let prev = TARGETS.map(([x]) => g(t0, x)), t = t0;
  for (let i = 0; Math.abs(t - t0) < maxDays * DAY; i++) {
    const t1 = t + step;
    if (signOf(lon(a, t1)) !== sa || (!onlyA && signOf(lon(b, t1)) !== sb)) return null;
    const cur = TARGETS.map(([x]) => g(t1, x));
    for (let k = 0; k < TARGETS.length; k++) {
      if ((prev[k] < 0) !== (cur[k] < 0) && Math.abs(prev[k]) < 30 && Math.abs(cur[k]) < 30) {
        let lo = t, hi = t1, flo = prev[k];
        for (let n = 0; n < 40 && Math.abs(hi - lo) > 30e3; n++) { const m = (lo + hi) / 2, fm = g(m, TARGETS[k][0]); if ((fm < 0) === (flo < 0)) { lo = m; flo = fm; } else hi = m; }
        const time = (lo + hi) / 2, type = TARGETS[k][1];
        return { type, kind: KIND[type], time: new Date(time) };
      }
    }
    prev = cur; t = t1;
  }
  return null;
}
function judge(p){       // p: { utc, lat, lon, tz, house: 2..12 }
  const t0 = +p.utc, c = NS.chart({ utc: t0, lat: p.lat, lon: p.lon, tz: p.tz, system: 'placidus' });
  const R = NS.natal.RULER, asc = c.angles.asc, cusp = c.cusps[p.house - 1];
  const querent = R[signOf(asc)], quesited = R[signOf(cusp)];
  const P = k => c.planets.find(x => x.key === k);
  const out = { chart: c, house: p.house, ascSign: signOf(asc), ascDeg: norm(asc) % 30, cuspSign: signOf(cusp), querent, quesited,
    sig: [querent, quesited].map(k => ({ key: k, sign: signOf(P(k).lon), house: P(k).house, retro: !!P(k).retro })) };
  /* considerations */
  const moon = P('Moon').lon, cons = [];
  if (out.ascDeg < 3) cons.push('early'); else if (out.ascDeg > 27) cons.push('late');
  out.voc = TRAD.filter(k => k !== 'Moon').every(k => !exact('Moon', k, t0, 1, true));
  if (out.voc) cons.push('voc');
  if (norm(moon) >= 195 && norm(moon) < 225) cons.push('combusta');
  if (P('Saturn').house === 7) cons.push('saturn7');
  out.cons = cons;
  /* judgement */
  if (querent === quesited) { out.answer = { key: 'hor:same', by: 'same' }; return out; }
  const direct = exact(querent, quesited, t0);
  if (direct) { out.answer = Object.assign({ key: 'hor:yes:' + direct.kind, by: 'direct' }, direct); return out; }
  if (querent !== 'Moon' && quesited !== 'Moon') {
    const back = [querent, quesited].map(k => exact('Moon', k, t0, -1, true)), next = [querent, quesited].map(k => exact('Moon', k, t0, 1, true));
    const tr = (back[0] && next[1] && (!back[1] || back[1].time < back[0].time) && (!next[0] || next[0].time > next[1].time)) ? [querent, quesited]
      : (back[1] && next[0] && (!back[0] || back[0].time < back[1].time) && (!next[1] || next[1].time > next[0].time)) ? [quesited, querent] : null;
    if (tr) { const n = next[tr[0] === querent ? 1 : 0]; out.answer = Object.assign({ key: 'hor:translation', by: 'translation', from: tr[0], to: tr[1] }, n); return out; }
    if (next[1]) { out.answer = Object.assign({ key: 'hor:yes:' + next[1].kind, by: 'moon' }, next[1]); return out; }
  }
  out.answer = { key: 'hor:no', by: 'none' };
  return out;
}
const HOUSES = { 2: 'Money, possessions, a lost object', 3: 'News, a sibling, a neighbour, a short trip', 4: 'Home, property, a parent, a move',
  5: 'A love affair, a child, a creative project, fun', 6: 'A job you do, employees, routines, a pet', 7: 'A partner, a contract, a deal, an opponent',
  8: 'Shared money, a loan, an inheritance, taxes', 9: 'Travel, study, a legal matter, beliefs', 10: 'Career, promotion, reputation, a boss',
  11: 'Friends, a group, a hope or wish', 12: 'Something hidden, a secret, a retreat' };
NS.horary = { TRAD, TARGETS, exact, judge, HOUSES, signOf };
})(window.TD);
