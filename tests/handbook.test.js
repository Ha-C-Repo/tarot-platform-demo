// The Handbook (js/data/handbook.js + js/book/*.js) and the site-wide rule that nothing renders as emoji.
const fs = require('fs'), path = require('path');
const load = require('./load');
const ROOT = path.join(__dirname, '..');
const assert = (c, msg) => { if (!c) throw new Error(msg); };
const TD = load(['js/data/handbook.js']).TD, H = TD.HANDBOOK;
const books = Object.keys(H.books);
const text = {}; books.forEach(id => { text[id] = load([H.books[id].file]).TD.BOOKTEXT[id]; });

module.exports = [
  ['Every Part, book range and Charms and Customs selection points at a real chapter', () => {
    assert(H.parts.length === 6 && books.length === 6, `${H.parts.length} parts, ${books.length} books`);
    H.parts.forEach(p => {
      (p.items || []).forEach(it => { const n = H.books[it.book].chapters.length;
        assert(it.from == null || (it.from >= 0 && it.to < n && it.from <= it.to), `${p.title}: ${it.book} ${it.from}-${it.to} of ${n}`); });
      (p.selections || []).forEach(s => assert(H.books[s.book].chapters[s.ch], `${s.title}: chapter ${s.ch}`));
    });
    // every book is reachable from some Part, every Baughan chapter from one of its two ranges
    books.forEach(id => assert(H.parts.some(p => (p.items || []).some(it => it.book === id)), id + ' not in any Part'));
    const cov = new Set(); H.parts.forEach(p => (p.items || []).filter(it => it.book === 'baughan').forEach(it => { for (let i = it.from; i <= it.to; i++) cov.add(i); }));
    assert(cov.size === H.books.baughan.chapters.length, `Baughan chapters covered ${cov.size}/${H.books.baughan.chapters.length}`);
  }],
  ['Each book file holds exactly its listed chapters, every one with real text', () => {
    let total = 0;
    books.forEach(id => {
      assert(Array.isArray(text[id]) && text[id].length === H.books[id].chapters.length, `${id}: ${text[id] && text[id].length} vs ${H.books[id].chapters.length}`);
      text[id].forEach((h, i) => { const n = h.replace(/<[^>]+>/g, '').trim().length; total += n; assert(n > 300, `${id} ${i} "${H.books[id].chapters[i].t}": ${n} chars`); });
    });
    return `${books.reduce((s, id) => s + text[id].length, 0)} chapters, ${(total / 1e6).toFixed(2)}M characters`;
  }],
  ['Book HTML is sanitised: no scripts, styles, handlers, links out, Gutenberg licence text or remote images', () => {
    books.forEach(id => text[id].forEach((h, i) => {
      const where = `${id} ${i}`;
      assert(!/<script|<style|<iframe|<link|<meta/i.test(h), where + ': tag');
      assert(!/\son\w+=|\sstyle=|\shref=|\sid=/i.test(h), where + ': attribute');
      assert(!/project gutenberg|gutenberg license|www\.gutenberg/i.test(h), where + ': Gutenberg boilerplate');
      (h.match(/<img [^>]*>/g) || []).forEach(t => { const src = (t.match(/src="([^"]+)"/) || [])[1];
        assert(src && src.startsWith('assets/book/' + id + '/') && fs.existsSync(path.join(ROOT, src)), `${where}: image ${src}`); });
    }));
  }],
  ['Footnote markers and notes match, chapter by chapter', () => {
    let n = 0;
    books.forEach(id => text[id].forEach((h, i) => {
      const marks = [...h.matchAll(/<sup class="fn" data-n="(\d+)">/g)].map(m => +m[1]), notes = [...h.matchAll(/<p data-n="(\d+)">/g)].map(m => +m[1]);
      assert(marks.join() === notes.join() && marks.every((m, k) => m === k + 1), `${id} ${i}: markers ${marks.length}, notes ${notes.length}`);
      n += marks.length;
    }));
    return `${n} notes`;
  }],
  ['Each book names its edition, a public-domain source link and an introduction', () => {
    books.forEach(id => { const b = H.books[id];
      assert(b.title && b.author && /\b1[5-9]\d\d\b/.test(b.edition), id + ' details');
      assert(/^https:\/\/(www\.gutenberg\.org\/ebooks\/\d+|en\.wikisource\.org\/wiki\/)/.test(b.source.url), id + ' source');
      const w = b.intro.split(/\s+/).length; assert(w >= 60 && w <= 140, `${id} intro ${w} words`);
      assert(!/—/.test(b.intro) && !/!/.test(b.intro), id + ' intro punctuation'); });
  }],
  ['No emoji anywhere in the site\'s own pages, scripts and styles (literal, entity, CSS or JS escape)', () => {
    const files = [];
    (function walk(d){ fs.readdirSync(d).forEach(f => { const p = path.join(d, f);
      if (/vendor|node_modules|brochure|tests|[\\/]assets$|cities\.js$/.test(p)) return;   // the hosted books are scanned too
      if (fs.statSync(p).isDirectory()) walk(p); else if (/\.(html|js|css)$/.test(f)) files.push(p); }); })(ROOT);
    const pict = /\p{Extended_Pictographic}/u, bad = [];
    const re = /(\p{Extended_Pictographic})(︎|️)?|&#(\d+);|&#x([0-9a-f]+);|\\(1F[0-9A-F]{3}|2[67][0-9A-F]{2})|\\u\{([0-9A-F]{4,6})\}|\\u(2[67][0-9A-F]{2})|\\u(D83[CDE])\\u(D[C-F][0-9A-F]{2})/giu;
    files.forEach(f => { const s = fs.readFileSync(f, 'utf8');
      for (const m of s.matchAll(re)) {
        const cp = m[3] ? +m[3] : m[4] ? parseInt(m[4], 16) : m[5] ? parseInt(m[5], 16) : m[6] ? parseInt(m[6], 16) : m[7] ? parseInt(m[7], 16)
          : m[8] ? 0x10000 + ((parseInt(m[8], 16) - 0xD800) << 10) + (parseInt(m[9], 16) - 0xDC00) : m[1].codePointAt(0);
        if (!pict.test(String.fromCodePoint(cp))) continue;
        // allowed: a symbol forced to text presentation (U+FE0E written right after it, or appended in code)
        const after = s.slice(m.index + m[0].length, m.index + m[0].length + 12);
        if (m[2] === '︎' || /^(︎|&#xFE0E;|\\uFE0E)/i.test(after) || /SIGN_GLYPH|const T = /.test(s.slice(Math.max(0, m.index - 400), m.index + 400) )) continue;
        bad.push(`${path.relative(ROOT, f)}: U+${cp.toString(16).toUpperCase()}`);
      } });
    assert(!bad.length, 'emoji: ' + [...new Set(bad)].slice(0, 8).join(', '));
    return `${files.length} files`;
  }],
  ['Drawn icons: every icon the pages ask for exists and is well-formed SVG', () => {
    const I = load(['js/icons.js']).TD;
    ['cards', 'stars', 'moon', 'gem', 'hand', 'charm', 'book', 'wands', 'cups', 'swords', 'pentacles', 'lock', 'alert', 'contents', 'prev', 'next', 'close', 'scroll', 'pages', 'text'].forEach(n => {
      const s = I.icon(n); assert(s.startsWith('<svg') && s.endsWith('</svg>') && !/NaN|undefined/.test(s), n);
    });
    const deck = load(['js/cards.js'], { document: undefined }).TD.DECK;
    assert(deck.filter(c => c.arcana !== 'major').every(c => I.ICONS[c.icon]), 'every minor card names a suit icon');
  }]
];
