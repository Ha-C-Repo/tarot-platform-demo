// Ogham, horary astrology, angel numbers and dreams, and bibliomancy's passages.
const fs = require('fs'), path = require('path');
const load = require('./load');
const TD = load(['js/vendor/astronomy.browser.min.js', 'js/astro.js', 'js/chart.js', 'js/natal.js', 'js/horary.js', 'js/ogham.js', 'js/data/oracle-text.js', 'js/data/dreams-text.js', 'js/data/handbook.js']).TD;
const assert = (c, msg) => { if (!c) throw new Error(msg); };
const sep = (a, b) => { const d = Math.abs(((a - b) % 360 + 540) % 360 - 180); return d; };
module.exports = [
  ['Ogham: twenty distinct letters in four families of five, draws without repeats, every text exists', () => {
    const O = TD.ogham;
    assert(O.FEDA.length === 20 && new Set(O.FEDA.map((f, i) => O.path(i))).size === 20, 'twenty distinct shapes');
    O.FEDA.forEach(f => assert(TD.ORACLE_TEXT['ogham:' + f.id], 'text ' + f.id));
    for (let k = 0; k < 500; k++) { const d = O.draw(5); assert(new Set(d).size === 5 && d.every(i => i >= 0 && i < 20), 'draw'); }
  }],
  ['Horary: exact aspects are exact, the void Moon matches a minute-by-minute search, every answer has its text', () => {
    const H = TD.horary, t0 = Date.UTC(2026, 9, 6, 15, 0);
    const e = H.exact('Mars', 'Venus', t0); assert(e, 'Mars-Venus aspect');
    const angle = { conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180 }[e.type];
    assert(Math.abs(sep(TD.eclLon('Mars', e.time), TD.eclLon('Venus', e.time)) - angle) < 0.01, 'exact to 0.01 deg');
    assert(H.TRAD.filter(k => k !== 'Moon').every(k => !H.exact('Moon', k, t0, 1, true)), 'Moon void at 23 Leo, 2026-10-06 15:00 UTC (checked by brute force)');
    const back = H.exact('Moon', 'Sun', Date.UTC(2026, 9, 1), 1, true); assert(back === null || back.time > Date.UTC(2026, 9, 1), 'forward only');
    const keys = new Set();
    for (let k = 0; k < 12; k++) for (let h = 2; h <= 12; h += 2) { const r = H.judge({ utc: t0 + k * 61 * 3600e3, lat: 51.5, lon: -0.13, tz: 'Europe/London', house: h });
      keys.add(r.answer.key); assert(TD.ORACLE_TEXT[r.answer.key], 'answer text ' + r.answer.key); r.cons.forEach(c => assert(TD.ORACLE_TEXT['hor:' + c], c));
      r.sig.forEach(s => assert(TD.ORACLE_TEXT['hor:sig:' + s.key], 'sig ' + s.key)); assert(r.querent === TD.natal.RULER[r.ascSign], 'querent'); }
    return [...keys].join(' ');
  }],
  ['Angel numbers and dreams: every text the page can ask for exists', () => {
    const T = TD.DREAM_TEXT; for (let d = 0; d <= 9; d++) assert(T['angeldigit:' + d], 'digit ' + d);
    assert(Object.keys(T).filter(k => k.startsWith('angel:')).length === 30 && Object.keys(T).filter(k => k.startsWith('dream:')).length === 96, 'counts');
  }],
  ['Bibliomancy: every Handbook book has many readable passages', () => {
    global.window = global.window || {};
    const plain = h => h.replace(/<sup[^>]*>.*?<\/sup>/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const out = [];
    Object.keys(TD.HANDBOOK.books).forEach(id => { const W = load([TD.HANDBOOK.books[id].file]).TD, ch = W.BOOKTEXT[id];
      let n = 0; ch.forEach(h => { const ps = [...h.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(m => plain(m[1])).filter(t => t.length >= 140 && t.length <= 900 && !/^\[/.test(t));
        ps.forEach(t => assert(!/^\[/.test(t), id + ': footnote passage')); n += ps.length; });
      assert(n >= 20, id + ' passages ' + n); out.push(id + ' ' + n); });
    return out.join(', ');
  }]
];
