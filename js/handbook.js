/* handbook.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   The Handbook reader: one bound book holding the public-domain texts in js/data/handbook.js, read like an
   ebook. A cover, a contents page by Part, a title page per book, and chapters turned page by page (CSS columns,
   one page on a phone, a two-page spread on a wide screen) or read as one scroll. Remembers the place in this
   browser; the address bar carries it too (#handbook/<book>/<chapter>), so a chapter can be linked.
   Each book's text loads only when first opened, through a <script> tag (the page's CSP blocks fetch). */
window.TD = window.TD || {};
(function(NS){
'use strict';
const H = () => NS.HANDBOOK, I = (n, o) => NS.icon(n, o);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const PART_ICON = ['cards', 'stars', 'moon', 'gem', 'hand', 'charm'];
const KEY = 'tarotdemo.handbook';
const store = { get(){ try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } },
  set(v){ try { localStorage.setItem(KEY, JSON.stringify(Object.assign(store.get(), v))); } catch (e) {} } };

let root, el = {}, state = { view: 'cover', book: null, ch: null, sel: null, screen: 0, screens: 1, frac: 0 };
const prefs = Object.assign({ mode: 'pages', size: 1 }, store.get().prefs || {});

/* ---------- loading a book's text ---------- */
const loading = {};
function loadBook(id){
  if (NS.BOOKTEXT && NS.BOOKTEXT[id]) return Promise.resolve(NS.BOOKTEXT[id]);
  if (!loading[id]) loading[id] = new Promise((ok, bad) => {
    const s = document.createElement('script'); s.src = H().books[id].file;
    s.onload = () => NS.BOOKTEXT && NS.BOOKTEXT[id] ? ok(NS.BOOKTEXT[id]) : bad(new Error('empty'));
    s.onerror = () => { delete loading[id]; bad(new Error('load')); };
    document.head.appendChild(s);
  });
  return loading[id];
}

/* ---------- where things sit ---------- */
function partOf(id, ch){
  return H().parts.findIndex(p => (p.items || []).some(it => it.book === id && (ch == null || it.from == null || (ch >= it.from && ch <= it.to))));
}
const yearOf = b => (b.edition.match(/\b(1[5-9]\d\d)\b/) || [])[1] || '';

/* ---------- the pages ---------- */
function contentsHTML(){
  const parts = H().parts.map((p, i) => {
    const items = (p.items || []).map(it => {
      const b = H().books[it.book], range = it.from != null ? ` &middot; ${it.from === 0 ? 'foreword and ' : ''}chapters ${chNum(it.book, it.from)}&ndash;${chNum(it.book, it.to)}` : '';
      const go = it.from != null ? `ch:${it.book}:${it.from}` : `title:${it.book}`;
      return `<li><a href="#handbook/${it.book}${it.from != null ? '/' + it.from : ''}" data-go="${go}">${esc(b.title)}</a><span>${esc(b.author)}, ${yearOf(b)}${range}</span></li>`;
    }).join('');
    const sels = (p.selections || []).map((s, k) => `<li><a href="#handbook/sel/${k}" data-go="sel:${k}">${esc(s.title)}</a><span>from ${esc(H().books[s.book].title)}</span></li>`).join('');
    return `<section class="gr-part"><div class="gr-kicker">Part ${ROMAN[i]}</div>
      <h3>${I(PART_ICON[i], { size: 22, cls: 'gr-picon' })}${esc(p.title)}</h3><p class="gr-blurb">${esc(p.blurb)}</p><ul class="gr-list">${items}${sels}</ul></section>`;
  }).join('');
  return `<div class="gr-tp gr-contents"><div class="gr-orn">${I('book', { size: 30 })}</div><h2 class="gr-chtitle">Contents</h2>
    <p class="gr-small c">Six public-domain books bound in one, arranged by subject. Choose a title to read its introduction, or a chapter to begin.</p>${parts}
    <p class="gr-small">Every text here is in the public domain in the United States and the United Kingdom. Texts from Project Gutenberg and
    Wikisource, both transcribed and proofread by volunteers; illustrations from the same editions, reduced for the web.</p></div>`;
}
const chNum = (id, i) => { const t = H().books[id].chapters[i].t, m = t.match(/^Chapter ([IVXLC]+)/); return m ? m[1] : esc(t); };
function titleHTML(id){
  const b = H().books[id], pi = partOf(id);
  let lastG = null;
  const chs = b.chapters.map((c, i) => {
    const g = c.g && c.g !== lastG ? `<li class="gr-g">${esc(c.g)}</li>` : ''; lastG = c.g || lastG;
    return `${g}<li><a href="#handbook/${id}/${i}" data-go="ch:${id}:${i}">${esc(c.t)}</a></li>`;
  }).join('');
  return `<div class="gr-tp"><div class="gr-kicker c">Part ${ROMAN[pi]} &middot; ${esc(H().parts[pi].title)}</div>
    <h2 class="gr-booktitle">${esc(b.title)}</h2>${b.sub ? `<p class="gr-sub">${esc(b.sub)}</p>` : ''}
    <p class="gr-by">${esc(b.author)}</p>${b.with ? `<p class="gr-with">${esc(b.with)}</p>` : ''}
    <div class="gr-orn">${I('book', { size: 26 })}</div>
    <p class="gr-ed">${esc(b.edition)}</p>
    <h4>Introduction</h4><p class="gr-intro">${esc(b.intro)}</p>
    <p class="gr-small">Introduction written for this demo; on a live site the reader writes their own.</p>
    <p class="gr-small">${esc(b.notice)} Public domain. Text: <a href="${b.source.url}" target="_blank" rel="noopener">${esc(b.source.label)}</a>.</p>
    <p class="c"><button class="gr-begin" data-go="ch:${id}:0">Begin reading</button></p>
    <h4>Chapters</h4><ol class="gr-chs">${chs}</ol></div>`;
}
function selHead(k){
  const s = H().parts[5].selections[k], b = H().books[s.book];
  return `<div class="gr-selhead"><div class="gr-kicker">Charms and Customs</div><h2 class="gr-chtitle">${esc(s.title)}</h2>
    <p>${esc(s.note)}</p><p class="gr-small">From <a href="#handbook/${s.book}" data-go="title:${s.book}">${esc(b.title)}</a> (${yearOf(b)}), &ldquo;${esc(b.chapters[s.ch].t)}&rdquo;. Recorded as history; nothing here is advice.</p></div>`;
}

/* ---------- render ---------- */
function frame(){
  root.innerHTML = `<div class="gr-book">
    <div class="gr-cover" role="group" aria-label="The Handbook, closed">
      <div class="gr-cframe">${coverArt()}
        <div class="gr-ctitle">The Handbook</div>
        <div class="gr-csub">Six old books of the cards, the stars, the moon, stones, hands and charms</div>
        <div class="gr-cbtns"><button class="btn primary" data-go="toc">Open the book</button><span id="grcont"></span></div>
      </div></div>
    <div class="gr-inside" hidden>
      <div class="gr-bar">
        <button class="gr-ib" data-go="toc" aria-label="Contents">${I('contents', { size: 18 })}<span>Contents</span></button>
        <div class="gr-head" aria-live="polite"><b></b><span></span></div>
        <button class="gr-ib" data-act="size" aria-label="Text size">${I('text', { size: 18 })}</button>
        <button class="gr-ib" data-act="mode" aria-label="Turn pages or scroll">${I('scroll', { size: 18 })}</button>
        <button class="gr-ib" data-act="close" aria-label="Close the book">${I('close', { size: 18 })}</button>
      </div>
      <div class="gr-view" tabindex="0" aria-label="Page"><div class="gr-flow"></div></div>
      <div class="gr-foot">
        <button class="gr-ib gr-turn" data-act="prev" aria-label="Previous page">${I('prev', { size: 22 })}</button>
        <div class="gr-prog"><span></span><i><b></b></i></div>
        <button class="gr-ib gr-turn" data-act="next" aria-label="Next page">${I('next', { size: 22 })}</button>
      </div>
      <div class="gr-note" role="dialog" aria-label="Note" hidden><button class="gr-ib" data-act="closenote" aria-label="Close note">${I('close', { size: 16 })}</button><div></div></div>
    </div></div>`;
  el = { book: root.querySelector('.gr-book'), cover: root.querySelector('.gr-cover'), inside: root.querySelector('.gr-inside'),
    view: root.querySelector('.gr-view'), flow: root.querySelector('.gr-flow'), head: root.querySelector('.gr-head'),
    prog: root.querySelector('.gr-prog'), note: root.querySelector('.gr-note'), cont: root.querySelector('#grcont'),
    mode: root.querySelector('[data-act="mode"]') };
  root.addEventListener('click', onClick);
  el.view.addEventListener('keydown', onKey);
  document.addEventListener('keydown', e => { if (!el.inside.hidden && e.target === document.body) onKey(e); });
  swipe(el.view);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => layout(true), 120); });
  showContinue();
}
function coverArt(){
  // The sigil: seven-pointed star in a ring of moon phases, drawn in the prism colours.
  const pts = k => { const a = (-90 + k * 360 / 7 * 3) * Math.PI / 180; return `${(100 + 46 * Math.cos(a)).toFixed(1)} ${(100 + 46 * Math.sin(a)).toFixed(1)}`; };
  const star = `M${[0, 1, 2, 3, 4, 5, 6].map(pts).join('L')}Z`;
  // Eight moons round the ring, new at the top, waxing clockwise. The lit part: a half disc on the lit side,
  // closed by the terminator, an ellipse of half-width r|cos 2πf| bulging out for a crescent, in for a gibbous.
  const R = 6.5;
  const moons = [0, 1, 2, 3, 4, 5, 6, 7].map(k => {
    const a = (-90 + k * 45) * Math.PI / 180, x = (100 + 74 * Math.cos(a)).toFixed(1), y = 100 + 74 * Math.sin(a), f = k / 8;
    const top = (y - R).toFixed(1), bot = (y + R).toFixed(1), rx = (R * Math.abs(Math.cos(2 * Math.PI * f))).toFixed(2);
    let lit = '';
    if (k === 4) lit = `<circle cx="${x}" cy="${y.toFixed(1)}" r="${R}" fill="url(#gcp)" stroke="none"/>`;
    else if (k) {
      const waxing = f < .5, s1 = waxing ? 1 : 0, s2 = waxing ? (f < .25 ? 0 : 1) : (f > .75 ? 1 : 0);
      lit = `<path d="M${x} ${top}A${R} ${R} 0 0 ${s1} ${x} ${bot}A${rx} ${R} 0 0 ${s2} ${x} ${top}Z" fill="url(#gcp)" stroke="none"/>`;
    }
    return `<circle cx="${x}" cy="${y.toFixed(1)}" r="${R}"/>${lit}`;
  }).join('');
  return `<svg class="gr-sigil" viewBox="0 0 200 200" aria-hidden="true"><defs><linearGradient id="gcp" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="var(--a1)"/><stop offset=".5" stop-color="var(--a2)"/><stop offset="1" stop-color="var(--a3)"/></linearGradient></defs>
    <g fill="none" stroke="url(#gcp)" stroke-width="1.6"><circle cx="100" cy="100" r="96"/><circle cx="100" cy="100" r="88" stroke-width=".8"/>
    <circle cx="100" cy="100" r="58"/><path d="${star}"/><circle cx="100" cy="100" r="14"/>${moons}</g></svg>`;
}
function showContinue(){
  const s = store.get();
  if (s.book != null && s.ch != null && H().books[s.book] && H().books[s.book].chapters[s.ch])
    el.cont.innerHTML = `<button class="btn" data-go="${s.sel != null ? 'sel:' + s.sel : `ch:${s.book}:${s.ch}`}" data-frac="${s.frac || 0}">Continue: ${esc(H().books[s.book].chapters[s.ch].t)}</button>`;
}

function open(view, opts = {}){
  state.view = view; state.book = opts.book != null ? opts.book : null; state.ch = opts.ch != null ? opts.ch : null; state.sel = opts.sel != null ? opts.sel : null;
  el.cover.hidden = view !== 'cover'; el.inside.hidden = view === 'cover';
  el.book.classList.toggle('open', view !== 'cover');
  closeNote();
  if (view === 'cover') { showContinue(); hash(''); return; }
  const head = (b, c) => { el.head.querySelector('b').textContent = b; el.head.querySelector('span').textContent = c || ''; };
  if (view === 'toc') { head('The Handbook', 'Contents'); put(contentsHTML(), 0); hash('contents'); return; }
  if (view === 'title') { const b = H().books[state.book]; head(b.title, 'Introduction'); put(titleHTML(state.book), 0); hash(state.book); return; }
  // a chapter, or a Charms and Customs selection (a chapter with its own heading)
  let id = state.book, ch = state.ch;
  if (view === 'sel') { const s = H().parts[5].selections[state.sel]; id = state.book = s.book; ch = state.ch = s.ch; }
  const b = H().books[id], c = b.chapters[ch];
  head(view === 'sel' ? 'Charms and Customs' : b.title, view === 'sel' ? H().parts[5].selections[state.sel].title : c.t);
  put('<p class="gr-small c">Opening the book&hellip;</p>', 0);
  loadBook(id).then(T => {
    if (state.book !== id || state.ch !== ch) return;
    const top = view === 'sel' ? selHead(state.sel) : `<div class="gr-chhead">${c.g ? `<div class="gr-kicker">${esc(c.g)}</div>` : ''}<h2 class="gr-chtitle">${esc(c.t)}</h2></div>`;
    put(top + T[ch] + endHTML(id, ch), opts.frac || 0, opts.end);
    hash(view === 'sel' ? 'sel/' + state.sel : id + '/' + ch);
    store.set({ book: id, ch, sel: state.sel, frac: opts.frac || 0 });
  }).catch(() => put('<p class="gr-small c">This book could not be opened here. Try reloading the page.</p>', 0));
}
function endHTML(id, ch){
  const b = H().books[id], nxt = b.chapters[ch + 1];
  return `<div class="gr-end">${I('book', { size: 22 })}<p>${nxt ? `Next: <a href="#handbook/${id}/${ch + 1}" data-go="ch:${id}:${ch + 1}">${esc(nxt.t)}</a>` : `End of <i>${esc(b.title)}</i>. <a href="#handbook/contents" data-go="toc">Back to the contents</a>`}</p></div>`;
}
function put(html, frac, atEnd){
  el.flow.innerHTML = html;
  el.flow.style.fontSize = ['', '16px', '18px', '20.5px'][prefs.size + 1] || '';
  // The first real paragraph of a chapter gets the drop capital.
  const p = [...el.flow.querySelectorAll('p')].find(x => !x.closest('.gr-selhead,.gr-chhead,.notes') && x.textContent.trim().length > 120 && !x.classList.contains('sub'));
  if (p && (state.view === 'chapter' || state.view === 'sel')) p.classList.add('gr-first');
  el.flow.querySelectorAll('img').forEach(im => { im.loading = 'eager'; im.decoding = 'async'; if (!im.complete) im.addEventListener('load', () => layout(true), { once: true }); });
  state.frac = frac || 0;
  layout(false, atEnd);
  if (!atEnd && !frac) el.view.scrollTop = 0;
}

/* ---------- pagination ---------- */
function layout(keep, atEnd){
  const paged = prefs.mode === 'pages';
  el.book.classList.toggle('gr-scroll', !paged);
  el.mode.innerHTML = I(paged ? 'scroll' : 'pages', { size: 18 });
  el.mode.setAttribute('aria-label', paged ? 'Read as one scroll' : 'Turn pages');
  if (!paged) { el.flow.style.cssText = `font-size:${el.flow.style.fontSize}`; el.view.scrollLeft = 0; el.prog.hidden = true; state.screens = 1; turnButtons(); return; }
  el.prog.hidden = false;
  if (keep) state.frac = state.screens > 1 ? state.screen / (state.screens - 1) : 0;
  // Measure the page area with the flow back in normal layout: left-over columns from the last page run
  // would otherwise change the width being measured.
  const fs = el.flow.style.fontSize;
  el.flow.style.cssText = `font-size:${fs};height:0;overflow:hidden`;
  const pad = parseFloat(getComputedStyle(el.view).paddingLeft), w = el.view.clientWidth - pad * 2;
  const spread = el.view.clientWidth >= 860, gap = pad * 2;
  const colW = spread ? (w - gap) / 2 : w;
  el.flow.style.cssText = `font-size:${fs};column-width:${colW}px;column-gap:${gap}px;column-fill:auto;height:${el.view.clientHeight - parseFloat(getComputedStyle(el.view).paddingTop) * 2}px`;
  el.book.classList.toggle('gr-spread', spread);
  const step = colW + gap, cols = Math.max(1, Math.round((el.flow.scrollWidth + gap) / step));
  state.per = spread ? 2 : 1; state.step = step;
  state.screens = Math.max(1, Math.ceil(cols / state.per));
  // Make the text block exactly as wide as all its screens, so the last screen can scroll fully into view
  // even when it holds a single page.
  el.flow.style.width = `${state.screens * state.per * step - gap}px`;
  state.screen = atEnd ? state.screens - 1 : Math.round(state.frac * (state.screens - 1));
  go(state.screen, true);
}
function go(n, quiet){
  state.screen = Math.max(0, Math.min(state.screens - 1, n));
  // Pages turn by scrolling the page area sideways (not by transforming the text), so the old figures can
  // multiply onto the paper colour instead of sitting in white boxes.
  const smooth = !quiet && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.view.scrollTo({ left: state.screen * state.per * state.step, behavior: smooth ? 'smooth' : 'instant' });
  const pageNo = state.screen * state.per + 1, total = state.screens * state.per;
  el.prog.querySelector('span').textContent = state.per === 2 ? `${pageNo}–${Math.min(pageNo + 1, total)} of ${total}` : `${pageNo} of ${state.screens}`;
  el.prog.querySelector('b').style.width = `${state.screens > 1 ? 100 * state.screen / (state.screens - 1) : 100}%`;
  turnButtons();
  if (!quiet && (state.view === 'chapter' || state.view === 'sel')) store.set({ frac: state.screens > 1 ? state.screen / (state.screens - 1) : 0 });
  closeNote();
}
/* Back always leads somewhere (the cover at worst); forward stops only at the end of the contents. */
function turnButtons(){
  const last = prefs.mode !== 'pages' || state.screen >= state.screens - 1;
  root.querySelector('[data-act="next"]').disabled = state.view === 'toc' && last;
}
function turn(dir){
  if (prefs.mode === 'pages' && ((dir > 0 && state.screen < state.screens - 1) || (dir < 0 && state.screen > 0))) { go(state.screen + dir); el.view.focus({ preventScroll: true }); return; }
  // At the edge of a page run: move to the neighbouring chapter (or between contents and title page).
  if (state.view === 'chapter' || state.view === 'sel') {
    const n = H().books[state.book].chapters.length;
    if (dir > 0) { if (state.view === 'chapter' && state.ch + 1 < n) open('chapter', { book: state.book, ch: state.ch + 1 }); else open('toc'); }
    else { if (state.view === 'chapter' && state.ch > 0) open('chapter', { book: state.book, ch: state.ch - 1, end: true }); else open('title', { book: state.book }); }
  } else if (state.view === 'title') { if (dir > 0) open('chapter', { book: state.book, ch: 0 }); else open('toc'); }
  else if (state.view === 'toc' && dir < 0) open('cover');
  if (prefs.mode !== 'pages') scrollIntoBook();
}
const scrollIntoBook = () => { const r = el.book.getBoundingClientRect(); if (r.top < 0 || r.top > innerHeight * .4) scrollTo({ top: scrollY + r.top - 70, behavior: 'instant' }); };

/* ---------- input ---------- */
function onClick(e){
  const g = e.target.closest('[data-go]'), a = e.target.closest('[data-act]'), fn = e.target.closest('sup.fn');
  if (g) {
    e.preventDefault();
    const [k, x, y] = g.dataset.go.split(':'), frac = +g.dataset.frac || 0;
    if (k === 'toc') open('toc');
    else if (k === 'title') open('title', { book: x });
    else if (k === 'ch') open('chapter', { book: x, ch: +y, frac });
    else if (k === 'sel') open('sel', { sel: +x, frac });
    scrollIntoBook();
    return;
  }
  if (fn) { showNote(fn); return; }
  if (!a) return;
  const act = a.dataset.act;
  if (act === 'prev') turn(-1);
  else if (act === 'next') turn(1);
  else if (act === 'close') open('cover');
  else if (act === 'closenote') closeNote();
  else if (act === 'mode') { prefs.mode = prefs.mode === 'pages' ? 'scroll' : 'pages'; store.set({ prefs }); layout(true); }
  else if (act === 'size') { prefs.size = (prefs.size + 1) % 3; store.set({ prefs }); el.flow.style.fontSize = ['16px', '18px', '20.5px'][prefs.size]; layout(true); }
}
function onKey(e){
  if (e.key === 'ArrowRight' || e.key === 'PageDown') { if (prefs.mode === 'pages') { e.preventDefault(); turn(1); } }
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { if (prefs.mode === 'pages') { e.preventDefault(); turn(-1); } }
  else if (e.key === 'Escape') closeNote();
}
function swipe(v){
  let x0 = null, y0 = 0;
  v.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') { x0 = e.clientX; y0 = e.clientY; } });
  v.addEventListener('pointerup', e => {
    if (x0 == null || prefs.mode !== 'pages') return;
    const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
    if (Math.abs(dx) > 45 && Math.abs(dy) < 70) turn(dx < 0 ? 1 : -1);
  });
  v.addEventListener('pointercancel', () => { x0 = null; });
}

/* ---------- notes ---------- */
function showNote(sup){
  const n = sup.dataset.n, sec = sup.closest('.gr-flow').querySelector(`section.notes p[data-n="${n}"]`);
  if (!sec) return;
  el.note.querySelector('div').innerHTML = `<b>Note ${esc(n)}</b> ${sec.innerHTML.replace(/^<b>\d+<\/b>\s*/, '')}`;
  el.note.hidden = false;
}
function closeNote(){ if (el.note) el.note.hidden = true; }

/* ---------- the address bar ---------- */
function hash(h){
  const want = h ? '#handbook/' + h : '';
  if (location.hash !== want) try { history.replaceState(null, '', location.pathname + location.search + want); } catch (e) {}
}
function fromHash(){
  const m = location.hash.match(/^#handbook\/(.+)$/); if (!m) return false;
  const [a, b] = m[1].split('/');
  if (a === 'contents') open('toc');
  else if (a === 'sel' && H().parts[5].selections[+b]) open('sel', { sel: +b });
  else if (H().books[a] && b != null && H().books[a].chapters[+b]) open('chapter', { book: a, ch: +b });
  else if (H().books[a]) open('title', { book: a });
  else return false;
  return true;
}

NS.handbook = {
  mount(node){ root = node; frame(); if (!fromHash()) open('cover'); addEventListener('hashchange', () => { fromHash(); scrollIntoBook(); }); },
  open, state: () => state
};
})(window.TD);
