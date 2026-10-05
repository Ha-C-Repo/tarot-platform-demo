// I Ching and runes: the 64 figures, the coin odds, changing lines, and fair rune draws.
const load = require('./load');
const TD = load(['js/data/iching.js', 'js/data/runes.js', 'js/oracle.js']).TD, O = TD.oracle;
const assert = (c, msg) => { if (!c) throw new Error(msg); };

module.exports = [
  ['64 distinct hexagrams, each with Legge text: a judgement and six line texts (seven for 1 and 2)', () => {
    const H = TD.HEXAGRAMS;
    assert(H.length === 64 && new Set(H.map(h => h.lines.join(''))).size === 64, 'figures');
    H.forEach(h => {
      assert(h.legge.judgement.length > 20 && h.gloss && h.name && h.pinyin, h.n + ' fields');
      assert(h.legge.lines.length === (h.n <= 2 ? 7 : 6) && h.legge.lines.every(t => typeof t === 'string' && t.length > 20), h.n + ' line texts');
      h.legge.lines.slice(0, 6).forEach((t, k) => { const m = t.slice(0, 70).match(/\b(un)?divided\b/);
        if (m) assert(!!m[1] === (h.lines[k] === 1), `${h.n}.${k + 1}: text says ${m[0]}`); });
    });
    assert(H[0].lines.join('') === '111111' && H[1].lines.join('') === '000000' && H[62].lines.join('') === '101010', 'known figures (1, 2, 63)');
  }],
  ['Three coins per line give 6, 7, 8, 9 at 1:3:3:1 (24,000 lines, chi-square)', () => {
    const c = { 6: 0, 7: 0, 8: 0, 9: 0 }, N = 4000;
    for (let i = 0; i < N; i++) O.castIChing().totals.forEach(t => c[t]++);
    const tot = N * 6, exp = { 6: tot / 8, 7: tot * 3 / 8, 8: tot * 3 / 8, 9: tot / 8 };
    const chi = Object.keys(c).reduce((s, k) => s + (c[k] - exp[k]) ** 2 / exp[k], 0);
    assert(chi < 16.27, 'chi-square ' + chi.toFixed(2));                 // 3 degrees of freedom, p = 0.001
    return 'chi2 ' + chi.toFixed(2);
  }],
  ['Changing lines flip into the relating hexagram; no change, no second hexagram; all six on 1 uses the seventh text', () => {
    let r = O.reading([7, 7, 7, 7, 7, 7]);
    assert(r.primary.n === 1 && r.relating === null && r.changing.length === 0, 'hexagram 1, still');
    r = O.reading([9, 7, 7, 7, 7, 7]);
    assert(r.primary.n === 1 && r.relating.n === 44 && r.changing.join() === '0', '1 with first line changing -> 44');
    r = O.reading([9, 9, 9, 9, 9, 9]);
    assert(r.primary.n === 1 && r.relating.n === 2 && r.allSix, 'all six change');
    r = O.reading([8, 7, 8, 7, 8, 7]);
    assert(r.primary.n === 64, 'figure 010101 is hexagram 64, got ' + r.primary.n);
  }],
  ['Runes: 24, distinct, drawn without repeats; symmetrical runes never reversed; even odds for the rest', () => {
    assert(TD.RUNES.length === 24 && new Set(TD.RUNES.map(r => r.id)).size === 24, 'set');
    TD.RUNES.forEach(r => { assert(/^M[\d .MLHVZ]+$/.test(r.d), r.id + ' path'); assert(r.up && (r.sym || r.rev), r.id + ' texts'); });
    assert(TD.RUNES.filter(r => r.sym).length === 9, 'nine symmetrical runes');
    let rev = 0, n = 0;
    for (let i = 0; i < 3000; i++) {
      const d = O.castRunes(3);
      assert(new Set(d.map(x => x.rune.id)).size === 3, 'repeat in one draw');
      d.forEach(x => { if (x.rune.sym) assert(!x.reversed, 'symmetrical rune reversed'); else { n++; if (x.reversed) rev++; } });
    }
    assert(Math.abs(rev / n - 0.5) < 0.03, 'reversal rate ' + (rev / n).toFixed(3));
    assert(O.castRunes(30).length === 24, 'cannot draw more than 24');
  }],
];
