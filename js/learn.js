/* learn.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   Learning the cards: flashcards and a multiple-choice quiz built only from data the site already has
   (TD.DECK names and keywords, the Golden Dawn correspondences). Progress stays in this browser.

   Spaced practice, kept simple and stated on learn.html: each card has a score. A right answer adds to its
   streak; a wrong one resets the streak and counts against it. The next card is drawn at random, weighted
   towards weak cards, never the same card twice running. A card with a streak of 3 counts as learned. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const KEY = 'tarotdemo.learn';
const FILTERS = {
  all: { name: 'All 78', test: () => true },
  major: { name: 'Major Arcana', test: c => c.arcana === 'major' },
  wands: { name: 'Wands', test: c => c.suit === 'wands' },
  cups: { name: 'Cups', test: c => c.suit === 'cups' },
  swords: { name: 'Swords', test: c => c.suit === 'swords' },
  pentacles: { name: 'Pentacles', test: c => c.suit === 'pentacles' },
  court: { name: 'Court cards', test: c => /^(Page|Knight|Queen|King) of/.test(c.name) },
  missed: { name: 'The ones I miss', test: (c, s) => { const x = s.cards[c.id]; return !!x && x.w > 0 && x.streak < 3; } }
};
const KINDS = {
  name: 'Which card is this?',
  meaning: 'Which card means this, upright?',
  reversed: 'Which card means this, reversed?',
  astro: 'Which correspondence belongs to this card?'
};

function load(){
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.cards && typeof s.cards === 'object') return s; } catch (e) {}
  return { cards: {}, last: null };
}
function save(s){ try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
function record(s, id, correct){
  const x = s.cards[id] || (s.cards[id] = { r: 0, w: 0, streak: 0 });
  if (correct) { x.r++; x.streak++; } else { x.w++; x.streak = 0; }
  x.at = Date.now(); s.last = id; save(s); return x;
}
function pool(filter, s){ const f = FILTERS[filter] || FILTERS.all; return NS.DECK.filter(c => f.test(c, s)); }
/* Weak cards come up more: unseen 2, then up by 2 per wrong answer, down by each point of streak, never below 0.25. */
function weight(s, id){
  const x = s.cards[id]; if (!x) return 2;
  return Math.max(0.25, 1 + 2 * x.w - x.streak);
}
function next(cards, s, rnd = Math.random){
  const list = cards.length > 1 ? cards.filter(c => c.id !== s.last) : cards;
  if (!list.length) return null;
  const ws = list.map(c => weight(s, c.id)), tot = ws.reduce((a, b) => a + b, 0);
  let r = rnd() * tot;
  for (let k = 0; k < list.length; k++) { r -= ws[k]; if (r < 0) return list[k]; }
  return list[list.length - 1];
}
function shuffle(a, rnd){ for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; }
/* Four choices. Wrong answers come from the same group where possible (same suit, or other Majors), so the
   quiz tests the card and not the suit. */
function question(card, kind, rnd = Math.random){
  const same = NS.DECK.filter(c => c.id !== card.id && (card.arcana === 'major' ? c.arcana === 'major' : c.suit === card.suit));
  const rest = NS.DECK.filter(c => c.id !== card.id && !same.includes(c));
  const field = kind === 'astro' ? (c => c.astro && c.astro.label) : (c => c.name);
  const answer = field(card), seen = new Set([answer]), wrong = [];
  for (const c of shuffle(same.slice(), rnd).concat(shuffle(rest.slice(), rnd))) {
    const v = field(c); if (!v || seen.has(v)) continue;
    seen.add(v); wrong.push(v); if (wrong.length === 3) break;
  }
  const prompt = kind === 'meaning' ? card.up : kind === 'reversed' ? card.rev : null;
  return { kind, card, prompt, answer, choices: shuffle([answer].concat(wrong), rnd), ask: KINDS[kind] };
}
function stats(s, cards){
  const ids = cards.map(c => c.id);
  const seen = ids.filter(id => s.cards[id]), learned = ids.filter(id => s.cards[id] && s.cards[id].streak >= 3);
  const r = seen.reduce((a, id) => a + s.cards[id].r, 0), w = seen.reduce((a, id) => a + s.cards[id].w, 0);
  return { total: ids.length, seen: seen.length, learned: learned.length, right: r, wrong: w };
}
function reset(){ try { localStorage.removeItem(KEY); } catch (e) {} }

NS.learn = { KEY, FILTERS, KINDS, load, save, record, pool, weight, next, question, stats, reset };
})(window.TD);
