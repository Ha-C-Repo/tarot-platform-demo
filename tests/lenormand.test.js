// Lenormand: 36 cards, art for each, a fair shuffle, the pairs each spread reads, the Grand Tableau, every text.
const load = require('./load');
const TD = load(['js/data/lenormand.js', 'js/data/lenormand-art.js', 'js/data/lenormand-text.js', 'js/lenormand.js']).TD, L = TD.lenormand, C = TD.LENORMAND;
const assert = (c, msg) => { if (!c) throw new Error(msg); };
module.exports = [
  ['36 cards in order, each with art, a meaning and a reading for every pair', () => {
    assert(C.length === 36 && C.every((c, i) => c.n === i + 1) && new Set(C.map(c => c.id)).size === 36, 'deck');
    C.forEach(c => { assert(/^[MmLlHhVvCcQqAaZz0-9 .,-]+$/.test(TD.LENORMAND_ART[c.id] || ''), 'art ' + c.id); assert(TD.LENORMAND_TEXT['lnm:' + c.id], 'meaning ' + c.id); });
    let n = 0; for (let a = 0; a < 36; a++) for (let b = a + 1; b < 36; b++) { assert(TD.LENORMAND_TEXT[L.pairKey(b, a)], 'pair ' + L.pairKey(a, b)); n++; }
    assert(n === 630 && Object.keys(TD.LENORMAND_TEXT).length === 666, 'text count ' + Object.keys(TD.LENORMAND_TEXT).length);
  }],
  ['Fair shuffle; each spread reads the right pairs; the Grand Tableau finds the significator, its house and its neighbours', () => {
    const first = new Array(36).fill(0), N = 36000;
    for (let k = 0; k < N; k++) { const d = L.shuffled(); assert(new Set(d).size === 36, 'repeat'); first[d[0]]++; }
    const chi = first.reduce((t, x) => t + (x - N / 36) ** 2 / (N / 36), 0); assert(chi < 66.6, 'chi-square ' + chi.toFixed(1));   // 35 df, p < 0.001
    const seq = Array.from({ length: 36 }, (_, i) => i);
    assert(L.pairs('three', [0, 1, 2]).length === 3 && L.pairs('five', [0, 1, 2, 3, 4]).length === 6 && L.pairs('box', seq.slice(0, 9)).length === 10, 'pair counts');
    assert(L.pairs('box', seq.slice(0, 9)).slice(0, 8).every(p => p.a === 4), 'box pairs start from the centre');
    const corner = L.pairs('gt', seq, 0), middle = L.pairs('gt', seq, 13);
    assert(corner.length === 3 && middle.length === 8 && middle.every(p => p.a === 13), 'neighbours ' + corner.length + ' ' + middle.length);
    const t = L.tableau(seq, 27); assert(t.house === 28 && t.houseCard === 27 && t.row === 3 && t.behind.length === 0 && t.ahead.length === 8, JSON.stringify(t));
    ['three', 'five', 'box', 'gt'].forEach(s => assert(L.draw(s).length === { three: 3, five: 5, box: 9, gt: 36 }[s], s));
    return 'chi-square ' + chi.toFixed(1);
  }]
];
