// The card pull: a genuinely uniform shuffle, and a deck that keeps its order until shuffled.
const load = require('./load');
const store = {};
const localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
const w = load(['js/cards.js', 'js/data/meanings.js', 'js/deck.js'], { localStorage });
const TD = w.TD, D = TD.deck;
const assert = (c, msg) => { if (!c) throw new Error(msg); };

// Chi-square critical value, 77 degrees of freedom, p = 0.001
const CHI2_77_P001 = 116.8;
function chi2(counts, expected){ return counts.reduce((s, c) => s + (c - expected) * (c - expected) / expected, 0); }

module.exports = [
  ['78 cards, each with upright and reversed text from the meanings database', () => {
    assert(TD.DECK.length === 78, 'deck size');
    TD.DECK.forEach(c => {
      const m = TD.MEANINGS[c.id];
      assert(m && m[0], `${c.id}: no upright meaning`);
      assert(m[1] || m[3], `${c.id}: no reversed meaning in either of Waite's lists`);
    });
  }],
  ['Shuffle is uniform: 60,000 shuffles, top card and third card chi-square, reversal rate', () => {
    const N = 60000, top = new Array(78).fill(0), third = new Array(78).fill(0);
    let rev = 0;
    const cards = D.fresh();
    for (let i = 0; i < N; i++) {
      D.shuffleCards(cards);
      top[cards[0].i]++; third[cards[2].i]++;
      if (cards[0].r) rev++;
    }
    const c1 = chi2(top, N / 78), c3 = chi2(third, N / 78), rate = rev / N;
    assert(c1 < CHI2_77_P001, `top card chi-square ${c1.toFixed(1)}`);
    assert(c3 < CHI2_77_P001, `third card chi-square ${c3.toFixed(1)}`);
    assert(Math.abs(rate - 0.5) < 0.01, `reversal rate ${(rate * 100).toFixed(2)}%`);
    return `chi2 ${c1.toFixed(1)} / ${c3.toFixed(1)} (limit ${CHI2_77_P001}), reversed ${(rate * 100).toFixed(2)}%`;
  }],
  ['The order stays put until the next shuffle, across reloads', () => {
    Object.keys(store).forEach(k => delete store[k]);
    const s1 = D.state();
    const order = JSON.stringify(s1.deck);
    const s2 = D.state();                                   // a "reload": read back from storage
    assert(JSON.stringify(s2.deck) === order, 'order changed without a shuffle');
    const a = D.pull(s2), b = D.pull(s2), c = D.pull(s2);
    const firstThree = JSON.parse(order).slice(0, 3);
    assert(JSON.stringify([a, b, c]) === JSON.stringify(firstThree), 'pull must take the top cards in order, orientation included');
    D.gather(s2);
    const s3 = D.state();
    assert(s3.deck.length === 78 && s3.table.length === 0, 'gather returns the table to the deck');
    assert(JSON.stringify(s3.deck.slice(-3)) === JSON.stringify(firstThree), 'gathered cards go under the deck, unshuffled');
    assert(JSON.stringify(s3.deck.slice(0, 75)) === JSON.stringify(JSON.parse(order).slice(3)), 'the rest of the deck keeps its order');
    D.shuffle(s3);
    assert(JSON.stringify(D.state().deck) !== order, 'shuffle changes the order');
  }],
  ['Spread analysis: Waite recurrence and the suit/majors conventions', () => {
    const e = (id, reversed) => ({ card: TD.DECK.find(c => c.id === id), reversed });
    const r1 = D.analyse([e('wands-14', false), e('cups-14', false), e('swords-03', false)]);
    assert(r1.recurrence.length === 1 && r1.recurrence[0].rank === 'King' && r1.recurrence[0].text === 'minor counsel', 'two upright Kings = minor counsel');
    const r2 = D.analyse([e('major-00', true), e('major-13', true), e('cups-02', false)]);
    assert(r2.notes.some(n => n.k === 'majors') && r2.notes.some(n => n.k === 'reversed'), 'majority majors and majority reversed');
  }]
];
