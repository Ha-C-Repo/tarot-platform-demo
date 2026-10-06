/* ogham.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   The twenty letters (feda) of the Ogham alphabet in its four families (aicmí) of five, each letter drawn as strokes
   on a stem line, and simple spreads. Load after nothing; texts come from js/data/oracle-text.js (ogham:<id>).

   Shapes: the Beith family strokes go to one side of the stem (1 to 5 strokes), the Uath family to the other side,
   the Muin family slant across it, the Ailm family (the vowels) cross it straight. Drawn here upright, reading
   upward, the way Ogham was cut along the edge of a standing stone. The tree for each letter follows the medieval
   Irish tradition; the divinatory senses are modern. Draws use the browser's cryptographic generator, without
   repeats; Ogham staves are read one way up only. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const FEDA = [
  ['beith', 'Beith', 'birch', 'b'], ['luis', 'Luis', 'rowan', 'l'], ['fearn', 'Fearn', 'alder', 'f'], ['sail', 'Sail', 'willow', 's'], ['nion', 'Nion', 'ash', 'n'],
  ['uath', 'Uath', 'hawthorn', 'h'], ['dair', 'Dair', 'oak', 'd'], ['tinne', 'Tinne', 'holly', 't'], ['coll', 'Coll', 'hazel', 'c'], ['ceirt', 'Ceirt', 'apple', 'q'],
  ['muin', 'Muin', 'vine or bramble', 'm'], ['gort', 'Gort', 'ivy', 'g'], ['ngetal', 'nGéadal', 'broom or reed', 'ng'], ['straif', 'Straif', 'blackthorn', 'st'], ['ruis', 'Ruis', 'elder', 'r'],
  ['ailm', 'Ailm', 'pine or fir', 'a'], ['onn', 'Onn', 'gorse', 'o'], ['ur', 'Úrr', 'heather', 'u'], ['eadhadh', 'Eadhadh', 'aspen', 'e'], ['iodhadh', 'Iodhadh', 'yew', 'i']
].map(([id, name, tree, sound], i) => ({ id, name, tree, sound, family: Math.floor(i / 5), strokes: i % 5 + 1 }));
const FAMILY = ['the Beith family', 'the Uath family', 'the Muin family', 'the Ailm family (the vowels)'];
const SPREADS = [
  { id: 'one', name: 'One stave', pos: [['Your stave', 'The heart of the matter.']] },
  { id: 'three', name: 'Root, trunk, crown', pos: [['The root', 'What feeds the question.'], ['The trunk', 'Where you stand now.'], ['The crown', 'Where it is growing.']] },
  { id: 'five', name: 'The grove', pos: [['The root', 'What feeds the question.'], ['The trunk', 'Where you stand now.'], ['The crown', 'Where it is growing.'],
    ['To cut back', 'What to prune or let go.'], ['To tend', 'What to water and protect.']] }
];
function cryptoInt(n){ const a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; let x; do { crypto.getRandomValues(a); x = a[0]; } while (x >= lim); return x % n; }
function draw(n){ const pool = FEDA.map((f, i) => i), out = []; for (let k = 0; k < n; k++) out.push(pool.splice(cryptoInt(pool.length), 1)[0]); return out; }
/* The letter as SVG path data on a 24 x 64 grid: a stem from y 4 to 60, strokes stacked from y 18 upward spacing 8. */
function path(i){
  const f = FEDA[i]; let d = 'M12 60V4';
  for (let k = 0; k < f.strokes; k++) {
    const y = 46 - k * 7;
    d += f.family === 0 ? `M12 ${y}H21` : f.family === 1 ? `M3 ${y}H12` : f.family === 2 ? `M4 ${y + 4}L20 ${y - 4}` : `M7 ${y}H17`;
  }
  return d;
}
function svg(i, opts = {}){
  const w = opts.size || 30;
  return `<svg viewBox="0 0 24 64" width="${w}" height="${w * 64 / 24}" aria-hidden="true" focusable="false" fill="none" stroke="${opts.stroke || 'currentColor'}" stroke-width="${opts.weight || 2.2}" stroke-linecap="round"><path d="${path(i)}"/></svg>`;
}
NS.ogham = { FEDA, FAMILY, SPREADS, draw, path, svg };
})(window.TD);
