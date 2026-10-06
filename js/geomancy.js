/* geomancy.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   Western geomancy: the sixteen figures, the shield chart and the house chart, cast with the browser's
   cryptographic random generator.

   METHOD. Sixteen lines of marks are made at random (6 to 15 marks each); each line counts odd (one dot) or even
   (two dots). Lines 1-4 make the First Mother (top row down: fire, air, water, earth), 5-8 the Second, and so on.
   Daughters are the Mothers read across: Daughter k takes row k of Mothers 1-4. Nieces add pairs: Mothers 1+2,
   3+4, Daughters 1+2, 3+4 (adding = row by row, odd total one dot, even two). Right Witness = Nieces 1+2, Left
   Witness = Nieces 3+4, Judge = the two Witnesses, Reconciler = Judge + First Mother. The Judge always has an even
   number of dots, so only eight figures can be Judge. House chart: the twelve Mothers, Daughters and Nieces in
   houses 1-12 in order, the common modern method. Perfection between house 1 (the person asking) and the house of
   the question: occupation (same figure in both), conjunction (either figure next to the other house), mutation
   (the two figures side by side in two other houses), translation (one figure next to both houses), checked in
   that order. */
window.TD = window.TD || {};
(function(NS){
'use strict';
/* name, English, rows top to bottom (1 = one dot, 2 = two), traditional ruler, nature, short sense */
const FIGURES = [
  ['Via', 'The Way', [1, 1, 1, 1], 'Moon', 'mixed', 'movement, change, a road'],
  ['Populus', 'The People', [2, 2, 2, 2], 'Moon', 'mixed', 'the crowd, reflection, going with the tide'],
  ['Conjunctio', 'Conjunction', [2, 1, 1, 2], 'Mercury', 'mixed', 'meeting, joining, things coming together'],
  ['Carcer', 'The Prison', [1, 2, 2, 1], 'Saturn', 'bad', 'restriction, delay, being bound'],
  ['Fortuna Major', 'Greater Fortune', [2, 2, 1, 1], 'Sun', 'good', 'lasting success by your own effort'],
  ['Fortuna Minor', 'Lesser Fortune', [1, 1, 2, 2], 'Sun', 'good', 'quick help from outside, short-lived'],
  ['Acquisitio', 'Gain', [2, 1, 2, 1], 'Jupiter', 'good', 'gain, getting what you seek'],
  ['Amissio', 'Loss', [1, 2, 1, 2], 'Venus', 'bad', 'loss, things slipping away'],
  ['Laetitia', 'Joy', [1, 2, 2, 2], 'Jupiter', 'good', 'joy, rising spirits'],
  ['Tristitia', 'Sorrow', [2, 2, 2, 1], 'Saturn', 'bad', 'sorrow, sinking, deep foundations'],
  ['Puella', 'The Girl', [1, 2, 1, 1], 'Venus', 'good', 'harmony, beauty, kindness'],
  ['Puer', 'The Boy', [1, 1, 2, 1], 'Mars', 'mixed', 'force, courage, rashness'],
  ['Rubeus', 'Red', [2, 1, 2, 2], 'Mars', 'bad', 'passion, anger, a warning to pause'],
  ['Albus', 'White', [2, 2, 1, 2], 'Mercury', 'good', 'peace, clear thought, slow good'],
  ['Caput Draconis', 'The Dragon’s Head', [2, 1, 1, 1], 'North Node', 'good', 'beginnings, a door opening'],
  ['Cauda Draconis', 'The Dragon’s Tail', [1, 1, 1, 2], 'South Node', 'bad', 'endings, an exit, letting go']
].map(([name, en, rows, ruler, nature, sense], i) => ({ i, name, key: name.replace(/ /g, ''), en, rows, ruler, nature, sense }));
const byRows = rows => FIGURES.find(f => f.rows.join('') === rows.join(''));
const add = (a, b) => byRows(a.rows.map((r, k) => (r + b.rows[k]) % 2 ? 1 : 2));
/* Twelve houses: the topics the visitor can ask about (no health or death questions on this site). */
const HOUSES = ['You yourself, your path', 'Money and possessions', 'News, siblings, short trips', 'Home, family, property',
  'Love affairs, children, pleasure', 'Daily work, routines, employees', 'A partner, a contract, an opponent', 'Shared money, debts, deep change',
  'Long journeys, study, beliefs', 'Career, status, reputation', 'Friends, hopes, groups', 'Hidden matters, retreat, secrets'];

function cryptoInt(n){ const a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; let x; do { crypto.getRandomValues(a); x = a[0]; } while (x >= lim); return x % n; }
/* Sixteen lines of 6-15 marks; returns the counts and the four Mothers' indices. */
function castLines(){
  const marks = Array.from({ length: 16 }, () => 6 + cryptoInt(10));
  const mothers = [0, 1, 2, 3].map(m => byRows(marks.slice(4 * m, 4 * m + 4).map(n => n % 2 ? 1 : 2)).i);
  return { marks, mothers };
}
/* The whole chart from the four Mothers (indices into FIGURES). */
function chart(motherIdx){
  const M = motherIdx.map(i => FIGURES[i]);
  const D = [0, 1, 2, 3].map(k => byRows(M.map(m => m.rows[k])));
  const N = [add(M[0], M[1]), add(M[2], M[3]), add(D[0], D[1]), add(D[2], D[3])];
  const right = add(N[0], N[1]), left = add(N[2], N[3]), judge = add(right, left), reconciler = add(judge, M[0]);
  const houses = [...M, ...D, ...N];                 // houses[h - 1]
  return { mothers: M, daughters: D, nieces: N, right, left, judge, reconciler, houses };
}
const dots = f => f.rows.reduce((a, r) => a + r, 0);
const adj = h => [h === 1 ? 12 : h - 1, h === 12 ? 1 : h + 1];
/* Perfection between house 1 and house q: { mode, houses } or { mode: 'none' }. */
function perfection(c, q){
  const fig = h => c.houses[h - 1].i, A = fig(1), B = fig(q);
  if (q === 1) return { mode: 'occupation', self: true, houses: [1] };
  if (A === B) return { mode: 'occupation', houses: [1, q] };
  const nq = adj(q).filter(h => fig(h) === A), n1 = adj(1).filter(h => fig(h) === B);
  if (nq.length || n1.length) return { mode: 'conjunction', houses: [...nq, ...n1] };
  for (let h = 1; h <= 12; h++) { const k = h === 12 ? 1 : h + 1;
    if ([h, k].some(x => x === 1 || x === q)) continue;
    const pair = [fig(h), fig(k)];
    if ((pair[0] === A && pair[1] === B) || (pair[0] === B && pair[1] === A)) return { mode: 'mutation', houses: [h, k] }; }
  for (const h1 of adj(1)) for (const hq of adj(q)) if (h1 !== q && hq !== 1 && h1 !== hq && fig(h1) === fig(hq)) return { mode: 'translation', houses: [h1, hq] };
  return { mode: 'none', houses: [] };
}
/* The reading for a question about house q: the summary answer key and every part's text key. */
function read(c, q){
  const p = perfection(c, q);
  return { perfection: p, answerKey: `geoans:${c.judge.nature}:${p.mode === 'none' ? 'none' : 'perf'}`,
    judgeKey: 'geojudge:' + c.judge.key, perfKey: 'geoperf:' + p.mode, houseKey: 'geo:' + c.houses[q - 1].key };
}
/* A figure as dots, one or two per row, drawn (no font). */
function figureSVG(f, opts = {}){
  const w = opts.size || 34, fill = opts.fill || 'currentColor';
  const d = f.rows.map((r, k) => { const y = 8 + k * 14;
    return r === 1 ? `<circle cx="17" cy="${y}" r="3.6" fill="${fill}"/>` : `<circle cx="10" cy="${y}" r="3.6" fill="${fill}"/><circle cx="24" cy="${y}" r="3.6" fill="${fill}"/>`; }).join('');
  return `<svg viewBox="0 0 34 58" width="${w}" height="${w * 58 / 34}" aria-hidden="true" focusable="false">${d}</svg>`;
}

NS.geomancy = { FIGURES, HOUSES, byRows, add, castLines, chart, dots, adj, perfection, read, figureSVG };
})(window.TD);
