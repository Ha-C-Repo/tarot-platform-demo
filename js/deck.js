/* deck.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   A persistent, physical-style deck for the card pull.

   How it behaves, and it is stated on the page:
   - The deck has a real order, all 78 cards, each upright or reversed.
   - Shuffle gathers any cards on the table back in, then puts the whole deck in a new random
     order (uniform Fisher-Yates, crypto.getRandomValues) and turns each card upright or
     reversed at random, 50/50, independently.
   - That order then STAYS until the next shuffle, including across visits (it is kept in this
     browser's localStorage). Pull takes the top card. Not shuffling means the next reading
     comes off the same deck, in the same order.
   - Nothing about the visitor changes the odds. Every order of the deck is equally likely. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const KEY = 'tarotdemo.deck';
const N = 78;

function cryptoInt(n){                       // unbiased integer in [0, n)
  const a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n;
  let x; do { crypto.getRandomValues(a); x = a[0]; } while (x >= lim);
  return x % n;
}
function cryptoBit(){ const a = new Uint8Array(1); crypto.getRandomValues(a); return (a[0] & 1) === 1; }

/* Shuffle an array of {i, r} in place: new order and new orientations. */
function shuffleCards(cards){
  for (let k = cards.length - 1; k > 0; k--) {
    const j = cryptoInt(k + 1);
    const t = cards[k]; cards[k] = cards[j]; cards[j] = t;
  }
  cards.forEach(c => { c.r = cryptoBit(); });
  return cards;
}
function fresh(){ return Array.from({length: N}, (_, i) => ({ i, r: false })); }

function read(){
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (s && Array.isArray(s.deck) && Array.isArray(s.table) && s.deck.length + s.table.length === N) return s;
  } catch (e) {}
  return null;
}
function write(s){ try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }

/* The deck arrives shuffled once, the way a reader would hand it over. After that it only
   changes when the visitor shuffles or pulls. */
function state(){
  let s = read();
  if (!s) { s = { deck: shuffleCards(fresh()), table: [], shuffledAt: Date.now(), shuffles: 1, readingDay: null }; write(s); }
  return s;
}
function shuffle(s){
  s.deck = shuffleCards(s.deck.concat(s.table));
  s.table = []; s.shuffledAt = Date.now(); s.shuffles = (s.shuffles || 0) + 1;
  write(s); return s;
}
function pull(s){
  if (!s.deck.length) return null;
  const c = s.deck.shift(); s.table.push(c); write(s); return c;
}
/* Put the cards on the table back under the deck, in the order they were drawn, unshuffled. */
function gather(s){ s.deck = s.deck.concat(s.table); s.table = []; write(s); return s; }
function entry(c){ return { card: NS.DECK[c.i], reversed: !!c.r }; }

/* ---------- reading the spread as a whole ---------- */
const RANK_NAMES = ['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King'];
function rankOf(card){ return card.arcana === 'major' ? null : RANK_NAMES[parseInt(card.id.split('-')[1], 10) - 1]; }
function analyse(entries){
  const notes = [];
  const n = entries.length; if (!n) return { notes, recurrence: [] };
  const majors = entries.filter(e => e.card.arcana === 'major').length;
  const rev = entries.filter(e => e.reversed).length;
  const suits = {};
  entries.forEach(e => { if (e.card.suit) suits[e.card.suit] = (suits[e.card.suit] || 0) + 1; });
  const courts = entries.filter(e => /^(Page|Knight|Queen|King)$/.test(rankOf(e.card) || '')).length;
  const S = NS.SPREAD_NOTES;
  if (majors * 2 > n) notes.push({ k: 'majors', t: S.majors, why: `${majors} of ${n} cards are Major Arcana` });
  if (majors === 0 && n >= 3) notes.push({ k: 'minors', t: S.minors, why: 'No Major Arcana' });
  Object.entries(suits).forEach(([suit, c]) => {
    if (c * 2 > n) notes.push({ k: suit, t: S[suit], why: `${c} of ${n} cards are ${suit[0].toUpperCase() + suit.slice(1)}` });
  });
  if (courts >= 2) notes.push({ k: 'courts', t: S.courts, why: `${courts} court cards` });
  if (rev * 2 > n) notes.push({ k: 'reversed', t: S.reversed, why: `${rev} of ${n} cards reversed` });
  else if (rev === 0 && n >= 3) notes.push({ k: 'upright', t: S.upright, why: 'No reversals' });

  // Waite's recurrence table: two or more of the same rank.
  const byRank = {};
  entries.forEach(e => { const r = rankOf(e.card); if (r) (byRank[r] = byRank[r] || []).push(e); });
  const recurrence = [];
  Object.entries(byRank).forEach(([rank, list]) => {
    if (list.length < 2) return;
    const idx = 4 - Math.min(list.length, 4);       // [four, three, two]
    const allUp = list.every(e => !e.reversed), allRev = list.every(e => e.reversed);
    const up = NS.RECURRENCE.upright[rank][idx], rv = NS.RECURRENCE.reversed[rank][idx];
    recurrence.push({ rank, count: list.length,
      text: allUp ? up : allRev ? rv : null, up, rv, mixed: !allUp && !allRev });
  });
  return { notes, recurrence, majors, rev, suits, courts };
}

/* Kept for the uniformity test and for any page that wants a one-shot draw. */
function draw(n){ return shuffleCards(fresh()).slice(0, n).map(entry); }

/* ---------- the card back: our own design, themed with the site palette ---------- */
function backSVG(){
  const rays = Array.from({length: 12}, (_, i) => {
    const a = i * Math.PI / 6, r1 = 22, r2 = i % 2 ? 34 : 44;
    return `<line x1="${(100 + Math.cos(a) * r1).toFixed(1)}" y1="${(171 + Math.sin(a) * r1).toFixed(1)}" x2="${(100 + Math.cos(a) * r2).toFixed(1)}" y2="${(171 + Math.sin(a) * r2).toFixed(1)}"/>`;
  }).join('');
  return `<svg viewBox="0 0 200 342" preserveAspectRatio="none" class="cbsvg" aria-hidden="true">
    <rect width="200" height="342" rx="12" fill="#150E1C"/>
    <rect x="7" y="7" width="186" height="328" rx="8" fill="none" stroke="var(--a1)" stroke-opacity=".75" stroke-width="2"/>
    <rect x="13" y="13" width="174" height="316" rx="6" fill="none" stroke="var(--a3)" stroke-opacity=".35"/>
    <g stroke="var(--a2)" stroke-opacity=".22">${Array.from({length: 15}, (_, i) =>
      `<line x1="13" y1="${20 + i * 22}" x2="187" y2="${42 + i * 22}"/>`).join('')}</g>
    <circle cx="100" cy="171" r="52" fill="#1F1428" stroke="var(--a4)" stroke-opacity=".5"/>
    <g stroke="var(--a5)" stroke-opacity=".8" stroke-width="2" stroke-linecap="round">${rays}</g>
    <circle cx="100" cy="171" r="16" fill="var(--a1)" fill-opacity=".85"/>
    <circle cx="106" cy="166" r="13" fill="#1F1428"/>
    ${[[40, 50], [160, 50], [40, 292], [160, 292]].map(([x, y]) =>
      `<path d="M ${x} ${y - 7} L ${x + 2} ${y - 2} L ${x + 7} ${y} L ${x + 2} ${y + 2} L ${x} ${y + 7} L ${x - 2} ${y + 2} L ${x - 7} ${y} L ${x - 2} ${y - 2} Z" fill="var(--a3)" fill-opacity=".7"/>`).join('')}
  </svg>`;
}

NS.deck = { state, shuffle, pull, gather, entry, analyse, shuffleCards, fresh, rankOf, KEY, N };
NS.draw = draw;
NS.cardBackSVG = backSVG;
})(window.TD);
