// Learn the cards: questions always have one right answer among four distinct choices; weak cards come up more.
const load = require('./load');
const store = {};
const localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
const TD = load(['js/cards.js', 'js/data/correspondences.js', 'js/learn.js'], { localStorage }).TD, L = TD.learn;
const assert = (c, msg) => { if (!c) throw new Error(msg); };
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

module.exports = [
  ['Every card, every kind: four distinct choices, exactly one is the answer, and it is right for the card', () => {
    TD.DECK.forEach(c => Object.keys(L.KINDS).forEach(k => {
      const q = L.question(c, k, rnd);
      assert(q.choices.length === 4 && new Set(q.choices).size === 4, `${c.id} ${k}: choices ${q.choices}`);
      assert(q.choices.filter(x => x === q.answer).length === 1, `${c.id} ${k}: answer missing`);
      assert(q.answer === (k === 'astro' ? c.astro.label : c.name), `${c.id} ${k}: wrong answer`);
      if (k === 'meaning') assert(q.prompt === c.up, 'prompt'); if (k === 'reversed') assert(q.prompt === c.rev, 'prompt');
    }));
    return 78 * 4 + ' questions';
  }],
  ['Filters: 22 Majors, 14 per suit, 16 court cards, and "missed" holds only cards still being missed', () => {
    const s = { cards: {} };
    assert(L.pool('major', s).length === 22 && L.pool('cups', s).length === 14 && L.pool('court', s).length === 16, 'sizes');
    assert(L.pool('missed', s).length === 0, 'missed empty');
    s.cards['cups-03'] = { r: 0, w: 1, streak: 0 }; s.cards['cups-04'] = { r: 4, w: 1, streak: 3 };
    const m = L.pool('missed', s).map(c => c.id);
    assert(m.length === 1 && m[0] === 'cups-03', m.join());
  }],
  ['Weighting: a missed card comes up far more than a learned one, and never twice running', () => {
    const s = { cards: { 'major-01': { r: 0, w: 3, streak: 0 }, 'major-02': { r: 5, w: 0, streak: 5 } }, last: null };
    const two = TD.DECK.filter(c => c.id === 'major-01' || c.id === 'major-02');
    let a = 0; for (let k = 0; k < 2000; k++) { s.last = null; if (L.next(two, s, rnd).id === 'major-01') a++; }
    assert(a > 1800, 'missed card share ' + a / 2000);
    s.last = 'major-01'; assert(L.next(two, s, rnd).id === 'major-02', 'repeat');
  }],
  ['Recording answers: streak, learned count, saved and reset', () => {
    Object.keys(store).forEach(k => delete store[k]);
    const s = L.load();
    L.record(s, 'wands-01', true); L.record(s, 'wands-01', true); L.record(s, 'wands-01', true); L.record(s, 'wands-02', false);
    const st = L.stats(L.load(), L.pool('wands', s));
    assert(st.learned === 1 && st.seen === 2 && st.right === 3 && st.wrong === 1, JSON.stringify(st));
    L.reset(); assert(Object.keys(L.load().cards).length === 0, 'reset');
  }],
];
