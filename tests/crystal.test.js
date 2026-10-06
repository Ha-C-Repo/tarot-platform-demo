// The crystal ball: two hidden cards, the deck shuffled before each pull, the question read for love/work/yes-no,
// and an answer assembled from texts that all exist, never naming a card.
const load = require('./load');
const W = load(['js/cards.js', 'js/deck.js', 'js/crystal.js', 'js/data/oracle-text.js', 'js/data/combos.js', 'js/data/combos-love.js', 'js/data/combos-work.js', 'js/data/bridges.js']);
const TD = W.TD, C = TD.crystal;
const assert = (c, msg) => { if (!c) throw new Error(msg); };

module.exports = [
  ['Two distinct cards; the deck is shuffled before each of the two pulls; fair over many draws', () => {
    const real = TD.deck.shuffleCards; let calls = 0, sizes = [];
    TD.deck.shuffleCards = d => { calls++; sizes.push(d.length); return real(d); };
    const one = C.draw(); TD.deck.shuffleCards = real;
    assert(calls === 2 && sizes.join() === '78,77', 'shuffles ' + calls + ' ' + sizes.join());
    assert(one.length === 2 && one[0].i !== one[1].i, 'two different cards');
    const first = new Array(78).fill(0), N = 39000; let rev = 0;
    for (let k = 0; k < N; k++) { const d = C.draw(); assert(d[0].i !== d[1].i, 'repeat'); first[d[0].i]++; rev += d[0].r + d[1].r; }
    const chi = first.reduce((t, x) => t + (x - N / 78) ** 2 / (N / 78), 0);
    assert(chi < 120, 'first card chi-square ' + chi.toFixed(1));           // 77 df: p < 0.002 above ~120
    assert(Math.abs(rev / (2 * N) - 0.5) < 0.01, 'reversed rate ' + (rev / (2 * N)).toFixed(3));
    return 'chi-square ' + chi.toFixed(1);
  }],
  ['The question decides love, work or general, and whether it is yes-or-no', () => {
    [['Does my partner still love me?', 'love', true], ['Will I get the job?', 'work', true], ['What should I focus on this month?', 'general', false],
     ['Should I stay or should I go?', 'general', false], ['Is it time to ask my boss for a raise?', 'work', true],
     ['How can I feel more at peace?', 'general', false], ['Will my ex and I get back together?', 'love', true]]
      .forEach(([q, f, yn]) => { assert(C.focusOf(q) === f, q + ' focus ' + C.focusOf(q)); assert(C.isYesNo(q) === yn, q + ' yes/no'); });
    assert(C.leanOf([{ r: false }, { r: false }]) === 'yes' && C.leanOf([{ r: true }, { r: true }]) === 'no' && C.leanOf([{ r: true }, { r: false }]) === 'mixed', 'lean');
  }],
  ['Every pair, both orientations, every focus: a full answer that never names a card', () => {
    const names = TD.DECK.map(c => c.name);
    let n = 0;
    for (let a = 0; a < 78; a++) for (let b = 0; b < 78; b++) { if (a === b || (a * 7 + b) % 11) continue;     // a spread-out sample of 498 pairs
      ['general', 'love', 'work'].forEach(f => [true, false].forEach(yn => {
        const cards = [{ i: a, r: (a + b) % 2 === 0 }, { i: b, r: a % 3 === 0 }], x = C.compose(cards, f, yn);
        assert(x.open && x.visions.every(Boolean) && x.thread && x.counsel && x.close, `${a}|${b} ${f} ${yn}: missing part`);
        const ball = [x.open, ...x.visions, x.close].join(' ');
        assert(!names.some(nm => ball.includes(nm)), `${a}|${b}: names a card`);
        assert(JSON.stringify(C.compose(cards, f, yn)) === JSON.stringify(x), 'deterministic'); n++;
      })); }
    TD.DECK.forEach(c => ['up', 'rev'].forEach(o => assert(TD.ORACLE_TEXT[`vision:${c.id}:${o}`], 'vision ' + c.id + ' ' + o)));
    return n + ' answers';
  }]
];
