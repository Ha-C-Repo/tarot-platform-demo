/* lenormand.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   Lenormand spreads and the pairs each one reads. Load after js/data/lenormand.js.

   METHOD. The 36 cards are shuffled with the browser's cryptographic generator (Fisher-Yates) and laid out in
   order; Lenormand cards are read upright only. A spread is read in PAIRS, the way Lenormand readers combine two
   cards into one phrase:
     line of 3     1+2, 2+3, and the outer pair 1+3 (the summary)
     line of 5     each neighbour pair, then the centre with each end
     box of 9      3 x 3: the centre card is the heart; read the centre row, column and both diagonals as pairs
                   with the centre, and the four corners together (corners 1+9 and 3+7: the frame of the matter)
     Grand Tableau all 36 in four rows of nine. The chosen
                   significator (Man 28 or Woman 29) is found; the cards touching it (up to 8) are read as pairs
                   with it; the cards in the house it lands in (house n = the card numbered n) colour the reading;
                   cards on the same row to its left lie behind, to its right lie ahead. */
window.TD = window.TD || {};
(function(NS){
'use strict';
function cryptoInt(n){ const a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; let x; do { crypto.getRandomValues(a); x = a[0]; } while (x >= lim); return x % n; }
function shuffled(){
  const d = NS.LENORMAND.map((c, i) => i);
  for (let k = d.length - 1; k > 0; k--) { const j = cryptoInt(k + 1); [d[k], d[j]] = [d[j], d[k]]; }
  return d;
}
const SPREADS = [
  { id: 'three', name: 'Line of three', n: 3, cols: 3 },
  { id: 'five', name: 'Line of five', n: 5, cols: 5 },
  { id: 'box', name: 'Box of nine', n: 9, cols: 3 },
  { id: 'gt', name: 'Grand Tableau', n: 36, cols: 9 }
];
/* Pair key in deck order, as the text keys are written. */
const pairKey = (a, b) => { const [x, y] = a < b ? [a, b] : [b, a]; return `lnmpair:${NS.LENORMAND[x].id}|${NS.LENORMAND[y].id}`; };
/* cards: deck indices in layout order. Returns [{a, b, label, key}] in reading order. */
function pairs(spreadId, cards, sig){
  const P = (i, j, label) => ({ a: cards[i], b: cards[j], label, key: pairKey(cards[i], cards[j]) });
  if (spreadId === 'three') return [P(0, 1, 'First and second'), P(1, 2, 'Second and third'), P(0, 2, 'The outer pair: the summary')];
  if (spreadId === 'five') return [P(0, 1, 'Cards 1 and 2'), P(1, 2, 'Cards 2 and 3'), P(2, 3, 'Cards 3 and 4'), P(3, 4, 'Cards 4 and 5'),
    P(2, 0, 'The centre and the start'), P(2, 4, 'The centre and the end')];
  if (spreadId === 'box') return [P(4, 3, 'The heart and its left'), P(4, 5, 'The heart and its right'), P(4, 1, 'The heart and what is above'),
    P(4, 7, 'The heart and what is below'), P(4, 0, 'Diagonal: top left'), P(4, 8, 'Diagonal: bottom right'), P(4, 2, 'Diagonal: top right'),
    P(4, 6, 'Diagonal: bottom left'), P(0, 8, 'The corners: top left and bottom right'), P(2, 6, 'The corners: top right and bottom left')];
  if (spreadId === 'gt') {
    const s = cards.indexOf(sig), r = Math.floor(s / 9), c = s % 9, out = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const rr = r + dr, cc = c + dc;
      if (rr < 0 || rr > 3 || cc < 0 || cc > 8) continue;
      const where = (dr < 0 ? 'above' : dr > 0 ? 'below' : '') + (dr && dc ? ', ' : '') + (dc < 0 ? 'to the left' : dc > 0 ? 'to the right' : '');
      out.push(P(s, rr * 9 + cc, 'Touching you, ' + where));
    }
    return out;
  }
  return [];
}
/* Grand Tableau details: where the significator lies, its house, what lies behind and ahead on its row. */
function tableau(cards, sig){
  const s = cards.indexOf(sig), r = Math.floor(s / 9), c = s % 9;
  return { pos: s, row: r, col: c, house: s + 1, houseCard: s,            // house n is the place of card n in a fresh deck
    behind: cards.slice(r * 9, s), ahead: cards.slice(s + 1, r * 9 + 9), above: r > 0, below: r < 3 };
}
function draw(spreadId){ const sp = SPREADS.find(x => x.id === spreadId); return shuffled().slice(0, sp.n); }
/* A card as line art in a card frame, with its number and inset. */
function cardSVG(i, opts = {}){
  const c = NS.LENORMAND[i], d = (NS.LENORMAND_ART || {})[c.id] || '', w = opts.size || 70;
  return `<svg viewBox="0 0 70 100" width="${w}" height="${w * 100 / 70}" role="img" aria-label="${c.name}">
    <rect x="2" y="2" width="66" height="96" rx="7" fill="var(--surface)" stroke="var(--line)"/>
    <text x="8" y="15" font-size="9" font-weight="700" fill="var(--a3)">${c.n}</text>
    <g transform="translate(5 18) scale(0.94)" fill="none" stroke="${opts.stroke || 'url(#tdPrism)'}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></g>
    <text x="35" y="90" font-size="7.5" text-anchor="middle" fill="var(--muted)">${c.inset}</text></svg>`;
}
NS.lenormand = { SPREADS, shuffled, draw, pairs, pairKey, tableau, cardSVG };
})(window.TD);
