/* oracle.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   Casting the I Ching and the runes, with the browser's cryptographic random generator. Load after
   js/data/iching.js and js/data/runes.js.

   I CHING, the three-coin method: three coins per line, heads 3 and tails 2. A total of 6 is an old (changing)
   broken line, 7 a young unbroken line, 8 a young broken line, 9 an old (changing) unbroken line. Lines are cast
   from the bottom up. Changing lines flip to give the second (relating) hexagram. Odds per line: 6 one in eight,
   7 three in eight, 8 three in eight, 9 one in eight, exactly as with real coins.
   RUNES: drawn without replacement from all 24, each face up or reversed with even odds; a rune that looks the
   same either way is always read upright. Nothing about the visitor changes the odds. */
window.TD = window.TD || {};
(function(NS){
'use strict';
function coin(){ const a = new Uint8Array(1); crypto.getRandomValues(a); return (a[0] & 1) ? 3 : 2; }
function cryptoInt(n){ const a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; let x; do { crypto.getRandomValues(a); x = a[0]; } while (x >= lim); return x % n; }

const byLines = lines => NS.HEXAGRAMS.find(h => h.lines.join('') === lines.join(''));
/* totals: six numbers (6-9), bottom first. Returns the primary and, if any line changes, the relating hexagram. */
function reading(totals){
  const lines = totals.map(t => (t === 7 || t === 9) ? 1 : 0);
  const changing = totals.map((t, k) => (t === 6 || t === 9) ? k : -1).filter(k => k >= 0);
  const primary = byLines(lines);
  const relating = changing.length ? byLines(lines.map((b, k) => changing.includes(k) ? 1 - b : b)) : null;
  /* Hexagrams 1 and 2 have a seventh text, read when all six lines change. */
  const allSix = changing.length === 6 && primary.legge.lines.length === 7;
  return { totals, lines, changing, primary, relating, allSix };
}
function castIChing(){ return reading(Array.from({ length: 6 }, () => coin() + coin() + coin())); }

function castRunes(n){
  const pool = NS.RUNES.slice(), out = [];
  for (let k = 0; k < n && pool.length; k++) {
    const r = pool.splice(cryptoInt(pool.length), 1)[0];
    out.push({ rune: r, reversed: !r.sym && cryptoInt(2) === 1 });
  }
  return out;
}
/* A rune drawn as line art, in the current text colour or the prism gradient. */
function runeSVG(r, opts = {}){
  const w = opts.size || 40;
  return `<svg viewBox="0 0 20 32" width="${w}" height="${w * 1.6}" aria-hidden="true" focusable="false" fill="none"
    stroke="${opts.stroke || 'currentColor'}" stroke-width="${opts.weight || 2}" stroke-linecap="round" stroke-linejoin="round"
    ${opts.reversed ? 'style="transform:rotate(180deg)"' : ''}><path d="${r.d}"/></svg>`;
}
/* A hexagram drawn bottom line last, so it reads top to bottom on the page; changing lines marked. */
function hexSVG(lines, opts = {}){
  const w = opts.size || 72, ch = opts.changing || [];
  const rows = lines.map((b, k) => {
    const y = 4 + (5 - k) * 10, mark = ch.includes(k);
    const bar = b ? `<path d="M4 ${y}H56"/>` : `<path d="M4 ${y}H26M34 ${y}H56"/>`;
    return bar + (mark ? `<circle cx="64" cy="${y}" r="2.6" fill="currentColor" stroke="none"/>` : '');
  }).join('');
  return `<svg viewBox="0 0 70 60" width="${w}" height="${w * 60 / 70}" aria-hidden="true" focusable="false" fill="none"
    stroke="${opts.stroke || 'currentColor'}" stroke-width="5" stroke-linecap="round">${rows}</svg>`;
}

NS.oracle = { reading, castIChing, castRunes, runeSVG, hexSVG, byLines };
})(window.TD);
