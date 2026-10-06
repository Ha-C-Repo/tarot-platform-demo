// I Ching and runes: the 64 figures, the coin odds, changing lines, and fair rune draws.
const load = require('./load');
const TD = load(['js/data/iching.js', 'js/data/runes.js', 'js/oracle.js', 'js/data/oracle-text.js']).TD, O = TD.oracle;
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
  ['Rune spreads, the cloth cast and the rune of the day', () => {
    assert(O.RUNE_SPREADS.map(x => x.id + x.n).join() === 'one1,norns3,cross5,cast9', 'spreads');
    O.RUNE_SPREADS.filter(x => x.id !== 'cast').forEach(x => assert(x.pos.length === x.n, x.id + ' positions'));
    let off = 0, up = 0, n = 0;
    for (let i = 0; i < 2000; i++) O.castCloth(9).forEach(x => { n++;
      const r = Math.hypot(x.x, x.y); assert(r <= 1.1 + 1e-9, 'inside the throw');
      const z = r > 1 ? 'off' : r <= 0.4 ? 'heart' : r <= 0.75 ? 'near' : 'edge'; assert(z === x.zone, 'zone ' + x.zone + ' at ' + r);
      if (x.zone === 'off') off++; if (x.up) up++; });
    assert(Math.abs(off / n - (1 - 1 / 1.21)) < 0.02, 'off-cloth rate ' + (off / n).toFixed(3));
    assert(Math.abs(up / n - 0.5) < 0.02, 'face-up rate ' + (up / n).toFixed(3));
    const st = {}, store = { getItem: k => st[k] || null, setItem: (k, v) => { st[k] = v; } };
    const a = O.dailyRune('2026-10-05', store), b = O.dailyRune('2026-10-05', store);
    assert(a.fresh && !b.fresh && a.rune.id === b.rune.id && a.reversed === b.reversed, 'same rune all day');
    assert(O.dailyRune('2026-10-06', store).fresh, 'new day, new draw');
    assert(/<svg[^>]*>.*<path d="M10 2V30"/.test(O.bindRuneSVG(TD.RUNES.slice(0, 3)).replace(/\s+/g, ' ')), 'bind rune stave');
    TD.RUNES.forEach(r => { assert(TD.ORACLE_TEXT['rune:' + r.id], 'deep ' + r.id); if (!r.sym) assert(TD.ORACLE_TEXT['runerev:' + r.id], 'rev ' + r.id); });
  }],
  ['Astro dice: three fair twelve-sided dice, every face has its text', () => {
    assert(O.DICE_PLANETS.length === 12 && O.DICE_SIGNS.length === 12, 'faces');
    const c = { p: new Array(12).fill(0), s: new Array(12).fill(0), h: new Array(13).fill(0) }, N = 24000;
    for (let i = 0; i < N; i++) { const d = O.rollDice(); c.p[d.p]++; c.s[d.s]++; c.h[d.h]++; }
    const chi = a => a.reduce((t, x) => t + (x - N / 12) ** 2 / (N / 12), 0);
    assert(c.h[0] === 0 && chi(c.p) < 31.3 && chi(c.s) < 31.3 && chi(c.h.slice(1)) < 31.3, 'chi-square ' + [chi(c.p), chi(c.s), chi(c.h.slice(1))].map(x => x.toFixed(1)));
    for (let p = 0; p < 12; p++) for (let s = 0; s < 12; s++) for (let h = 1; h <= 12; h++) { const K = O.diceKeys({ p, s, h }); assert(TD.ORACLE_TEXT[K.p] && TD.ORACLE_TEXT[K.s] && TD.ORACLE_TEXT[K.h], JSON.stringify(K)); }
    O.DICE_PLANETS.concat(O.DICE_SIGNS).forEach(([n, g]) => assert(!/\p{Extended_Pictographic}(?!︎)/u.test(g), n + ' glyph must be text'));
  }],
];
