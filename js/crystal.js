/* crystal.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   The crystal ball (crystal.html): an answer to a question, built from two tarot cards the visitor never sees.

   METHOD. A fresh 78-card deck is shuffled with the tarot engine (js/deck.js: Fisher-Yates with the browser's
   cryptographic generator, each card upright or reversed with even odds) and the top card is taken; the 77 left
   are shuffled again and the top card taken. Nothing about the visitor or the question changes the odds.
   The answer is assembled from texts that already exist plus the ball's own voice:
     opening   cb:<lean>:1-4 (TD.ORACLE_TEXT), chosen by the cards so the same draw always reads the same
     visions   vision:<card id>:up|rev for each card (what the seer sees; never names a card)
     thread    TD.BRIDGES, the one-sentence link written for that pair of cards
     counsel   the pair reading from TD.COMBOS, TD.COMBOS_LOVE or TD.COMBOS_WORK, picked by the question's words
     closing   cb:close:1-8
   Yes-or-no questions (starting "Will", "Should", "Is", "Can"...) get a lean: both cards upright = yes, both
   reversed = no, one of each = divided. That extends the common one-card rule (upright yes, reversed no).
   Load after cards.js and deck.js; the text tables are loaded by the page when needed. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const LOVE = /\b(love|loves|loving|partner|boyfriend|girlfriend|husband|wife|spouse|crush|date|dating|relationship|marry|married|marriage|ex|romance|romantic|soulmate|feelings|like me|text me|back together|break ?up|wedding|engaged)\b/i;
const WORK = /\b(job|jobs|work|working|career|boss|promotion|money|business|interview|salary|raise|client|clients|hire|hired|project|finance|finances|financial|pay|paid|rent|debt|company|office|coworker|colleague|degree|exam|school|startup|sell|sale|sales|loan|house|apartment|move)\b/i;
const YN = /^\s*(will|would|should|shall|is|isn't|are|aren't|am|can|could|do|does|did|don't|has|have|was|were|may|might|must)\b/i;

function focusOf(q){ const l = LOVE.test(q), w = WORK.test(q); return l && !w ? 'love' : w && !l ? 'work' : 'general'; }
function isYesNo(q){ return YN.test(q) && !/\bor\b/i.test(q); }          // "Should I stay or go?" is not yes-or-no

/* Two cards, the deck shuffled before each pull. */
function draw(){
  const D = NS.deck, deck = D.fresh();
  D.shuffleCards(deck); const a = deck.shift();
  D.shuffleCards(deck); const b = deck.shift();
  return [{ i: a.i, r: a.r }, { i: b.i, r: b.r }];
}
const pairKey = (a, b) => { const x = NS.DECK[Math.min(a, b)].id, y = NS.DECK[Math.max(a, b)].id; return x + '|' + y; };
const TABLE = { general: 'COMBOS', love: 'COMBOS_LOVE', work: 'COMBOS_WORK' };
const FILE = { general: 'js/data/combos.js', love: 'js/data/combos-love.js', work: 'js/data/combos-work.js' };
function leanOf(cards){ const up = cards.filter(c => !c.r).length; return up === 2 ? 'yes' : up === 0 ? 'no' : 'mixed'; }

/* The answer for a draw. Deterministic: the same cards, focus and question type always give the same words. */
function compose(cards, focus, yn){
  const T = NS.ORACLE_TEXT || {}, [a, b] = cards, A = NS.DECK[a.i], B = NS.DECK[b.i];
  const h = a.i * 79 + b.i * 7 + (a.r ? 3 : 0) + (b.r ? 5 : 0);
  const lean = yn ? leanOf(cards) : 'open';
  const key = pairKey(a.i, b.i), combos = NS[TABLE[focus]] || NS.COMBOS || {};
  return {
    lean, focus, yn,
    open: T[`cb:${lean}:${h % 4 + 1}`] || '',
    visions: [T[`vision:${A.id}:${a.r ? 'rev' : 'up'}`] || '', T[`vision:${B.id}:${b.r ? 'rev' : 'up'}`] || ''],
    thread: (NS.BRIDGES || {})[key] || '',
    counsel: combos[key] || '',
    close: T[`cb:close:${h % 8 + 1}`] || ''
  };
}
/* One plain-text version of the answer, for the journal. */
const asText = x => [x.open, x.visions.join(' '), x.thread, x.counsel, x.close].filter(Boolean).join('\n\n');

NS.crystal = { focusOf, isYesNo, draw, compose, asText, leanOf, pairKey, TABLE, FILE };
})(window.TD);
