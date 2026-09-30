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
  ['Shuffling mid-reading mixes only the deck; pulled cards keep their place in the spread', () => {
    Object.keys(store).forEach(k => delete store[k]);
    const s = D.state();
    const first = D.pull(s);
    const onTable = JSON.stringify(s.table), rest = s.deck.map(c => c.i).sort((a, b) => a - b).join();
    D.shuffle(s);
    const s2 = D.state();                                    // read back from storage
    assert(JSON.stringify(s2.table) === onTable, 'the pulled card must stay on the table, orientation included');
    assert(s2.deck.length === 77, 'the deck keeps the other 77 cards');
    assert(!s2.deck.some(c => c.i === first.i), 'the pulled card must not go back into the deck');
    assert(s2.deck.map(c => c.i).sort((a, b) => a - b).join() === rest, 'the same 77 cards, in a new order');
    const top = s2.deck[0], second = D.pull(s2);
    assert(second === top && s2.table.length === 2 && JSON.stringify(s2.table.slice(0, 1)) === onTable,
      'the next pull comes off the newly shuffled deck into the next position');
    D.shuffle(s2);
    const s3 = D.state();
    assert(s3.table.length === 2 && s3.deck.length === 76, 'a second shuffle mid-reading also leaves the table alone');
  }],
  ['Significator: taken out of the deck, the rest keep their order; it goes back under the deck', () => {
    Object.keys(store).forEach(k => delete store[k]);
    const s = D.state();
    const before = s.deck.map(c => c.i);
    const pick = before[40];                                 // a card from the middle of the deck
    assert(D.setSpread(s, 'celtic'), 'spread change allowed with an empty table');
    assert(D.setSig(s, pick), 'significator set');
    const s2 = D.state();                                    // read back from storage
    assert(s2.sig && s2.sig.i === pick && s2.sig.r === false, 'significator stored, upright');
    assert(s2.deck.length === 77 && !s2.deck.some(c => c.i === pick), 'significator is out of the deck');
    assert(s2.deck.map(c => c.i).join() === before.filter(i => i !== pick).join(), 'the other 77 keep their order');
    D.pull(s2);
    assert(!D.setSig(s2, before[0]) && !D.setSpread(s2, 'ppf'), 'no changes with cards on the table');
    D.shuffle(s2);
    assert(D.state().sig.i === pick && D.state().deck.length === 76, 'shuffling leaves the significator out');
    D.gather(s2);
    const s3 = D.state();
    assert(s3.sig.i === pick && s3.deck.length === 77 && s3.table.length === 0, 'new reading keeps the significator for the next question');
    D.setSig(s3, null);
    const s4 = D.state();
    assert(!s4.sig && s4.deck.length === 78 && s4.deck[77].i === pick, 'returned significator goes under the deck');
  }],
  ['Spreads: every spread has its positions; Celtic Cross names are Waite\'s; yes or no follows orientation', () => {
    const x = load(['js/spreads.js']).TD;
    const S = x.SPREADS;
    assert(S.length === 8 && S.every(s => s.pos.length === s.n && s.n >= 1), 'positions match card counts');
    const cc = x.spreadById('celtic');
    const waiteNames = ['That covers him', 'What crosses him', 'What crowns him', 'What is beneath him', 'What is behind him',
      'What is before him', 'Himself', 'His house', 'His hopes or fears', 'What will come'];
    assert(cc.n === 10 && cc.significator && cc.pos.map(p => p.name).join('|') === waiteNames.join('|'), 'Waite\'s ten positions, in order');
    assert(x.spreadById('nope').id === 'ppf', 'unknown spread falls back to past, present, future');
    assert(x.yesNo({ reversed: false }) === 'yes' && x.yesNo({ reversed: true }) === 'no', 'upright yes, reversed no');
    return S.map(s => `${s.id} ${s.n}`).join(', ');
  }],
  ['Interpretations: every card has all seven sections; every one of the 3,003 pairs has a reading', () => {
    const x = load(['js/cards.js', 'js/spreads.js', 'js/data/interpretations.js', 'js/data/combos.js']).TD;
    const keys = ['up', 'rev', 'loveUp', 'loveRev', 'workUp', 'workRev', 'picture'];
    const words = s => (String(s).match(/\S+/g) || []).length;
    x.DECK.forEach(c => {
      const r = x.READINGS[c.id]; assert(r, `${c.id}: no interpretation`);
      keys.forEach(k => assert(words(r[k]) >= 30, `${c.id}.${k}: missing or too short`));
      assert(!/—/.test(Object.values(r).join(' ')), `${c.id}: em dash in text`);
    });
    let n = 0;
    for (let i = 0; i < 78; i++) for (let j = i + 1; j < 78; j++) {
      const k = x.pairKey(i, j); assert(k === x.pairKey(j, i), 'pair key must not depend on order');
      assert(words(x.COMBOS[k]) >= 30, `${k}: missing pair reading`); n++;
    }
    assert(Object.keys(x.COMBOS).length === n, 'no stray pair readings');
    x.SPREADS.forEach(sp => x.spreadPairs(sp).forEach(([i, j]) => assert(i < sp.n && j < sp.n && i !== j, `${sp.id}: bad pair ${i},${j}`)));
    return `${x.DECK.length} cards x ${keys.length} sections, ${n} pairs`;
  }],
  ['Love and work pair readings: both cover every Major Arcana pair (the rest fall back to the general reading)', () => {
    const x = load(['js/cards.js', 'js/spreads.js', 'js/data/combos-love.js', 'js/data/combos-work.js']).TD;
    const words = s => (String(s).match(/\S+/g) || []).length;
    const majors = x.DECK.map((c, i) => i).filter(i => /^major-/.test(x.DECK[i].id));
    let n = 0;
    majors.forEach((i, a) => majors.slice(a + 1).forEach(j => {
      const k = x.pairKey(i, j);
      assert(words(x.COMBOS_LOVE[k]) >= 30, `${k}: missing love reading`);
      assert(words(x.COMBOS_WORK[k]) >= 30, `${k}: missing work reading`);
      n++;
    }));
    assert(n === 231, `expected 231 Major Arcana pairs, got ${n}`);
    [x.COMBOS_LOVE, x.COMBOS_WORK].forEach(t => {
      assert(Object.keys(t).length === n, 'no stray love/work pair readings');
      assert(!/—/.test(Object.values(t).join(' ')), 'em dash in love/work text');
    });
    return `${n} pairs x love, work`;
  }],
  ['Spread analysis: Waite recurrence and the suit/majors conventions', () => {
    const e = (id, reversed) => ({ card: TD.DECK.find(c => c.id === id), reversed });
    const r1 = D.analyse([e('wands-14', false), e('cups-14', false), e('swords-03', false)]);
    assert(r1.recurrence.length === 1 && r1.recurrence[0].rank === 'King' && r1.recurrence[0].text === 'minor counsel', 'two upright Kings = minor counsel');
    const r2 = D.analyse([e('major-00', true), e('major-13', true), e('cups-02', false)]);
    assert(r2.notes.some(n => n.k === 'majors') && r2.notes.some(n => n.k === 'reversed'), 'majority majors and majority reversed');
  }]
];
