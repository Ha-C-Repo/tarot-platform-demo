/* share.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   "Save as image": draws a finished reading to a canvas in the site's current palette (the Customise
   colours and practice name) and hands it to the phone's share sheet, or downloads it as a PNG.
   Nothing is uploaded. Card images are this site's own files, so the canvas stays readable; opened from
   a file (file://) the browser blocks reading it back, and the page says so instead of failing silently.

   TD.share.readingImage({ title, sub, question, cards: [{ entry, pos }], lines: [string], footer }) -> Promise<Blob>
   TD.share.deliver(blob, filename, text) -> Promise<'shared' | 'downloaded'> */
window.TD = window.TD || {};
(function(NS){
'use strict';
const W = 1080, PAD = 64, GAP = 18;
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

function wrap(ctx, text, maxW){
  const words = String(text).split(/\s+/), lines = []; let cur = '';
  words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
  if (cur) lines.push(cur);
  return lines;
}
function loadImg(src){
  return new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
}

async function readingImage(o){
  if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) {} }
  const C = { ink: css('--ink') || '#0A0710', surface: css('--surface') || '#150E1C', line: css('--line') || '#352542',
    text: css('--text') || '#F6F0FA', muted: css('--muted') || '#A091B0', a1: css('--a1') || '#FF2E88', a2: css('--a2') || '#A855F7', a3: css('--a3') || '#22D3EE' };
  const n = o.cards.length, cols = n <= 5 ? n : n <= 10 ? 5 : 6, rows = Math.ceil(n / cols);
  const cw = Math.min(230, (W - 2 * PAD - (cols - 1) * GAP) / cols), ch = cw * 856 / 500;
  const imgs = await Promise.all(o.cards.map(c => loadImg(c.entry.card.img)));

  const m = document.createElement('canvas').getContext('2d');
  const F = { eye: '700 20px InterV, sans-serif', title: '58px Anton, Impact, sans-serif', sub: '500 24px InterV, sans-serif',
    q: 'italic 500 34px CormorantV, Georgia, serif', pos: '800 15px InterV, sans-serif', name: '700 19px InterV, sans-serif',
    body: '400 25px InterV, sans-serif', foot: '500 19px InterV, sans-serif' };
  /* Measure first, so the canvas is exactly as tall as the reading. */
  m.font = F.title; const titleL = wrap(m, o.title.toUpperCase(), W - 2 * PAD);
  m.font = F.q; const qL = o.question ? wrap(m, '“' + o.question + '”', W - 2 * PAD) : [];
  m.font = F.name; const nameL = o.cards.map(c => wrap(m, c.entry.card.name, cw).slice(0, 2));
  m.font = F.pos; const posL = o.cards.map((c, k) => wrap(m, ((n > 1 ? (k + 1) + '. ' : '') + (c.pos || '')).toUpperCase(), cw).slice(0, 2));
  const rowLines = (L, r) => Math.max(...L.slice(r * cols, r * cols + cols).map(l => l.length));
  const nameRows = [], posRows = []; for (let r = 0; r < rows; r++) { nameRows.push(rowLines(nameL, r)); posRows.push(rowLines(posL, r)); }
  const rowH = r => ch + 14 + posRows[r] * 20 + 4 + nameRows[r] * 24 + 24 + 26;
  m.font = F.body; const bodyL = (o.lines || []).flatMap(t => wrap(m, t, W - 2 * PAD).concat([''])).slice(0, 18);
  let H = PAD + 30 + titleL.length * 62 + 40 + (qL.length ? qL.length * 42 + 22 : 0) + 18;
  const gridTop = H;
  for (let r = 0; r < rows; r++) H += rowH(r);
  const bodyTop = H + 6; H = bodyTop + bodyL.length * 36 + 30 + 70;

  const cv = document.createElement('canvas'); cv.width = W; cv.height = Math.ceil(H);
  const x = cv.getContext('2d');
  x.fillStyle = C.ink; x.fillRect(0, 0, W, H);
  const glow = x.createRadialGradient(W * .15, 0, 0, W * .15, 0, W * .8); glow.addColorStop(0, C.a1 + '33'); glow.addColorStop(1, 'transparent');
  x.fillStyle = glow; x.fillRect(0, 0, W, H * .5);
  let y = PAD;
  x.textBaseline = 'top';
  x.font = F.eye; x.fillStyle = C.a1; x.fillText((o.eyebrow || '').toUpperCase(), PAD, y); y += 34;
  x.font = F.title; x.fillStyle = C.text; titleL.forEach(l => { x.fillText(l, PAD, y); y += 62; });
  x.font = F.sub; x.fillStyle = C.muted; x.fillText(o.sub || '', PAD, y + 4); y += 40;
  if (qL.length) { x.font = F.q; x.fillStyle = C.text; qL.forEach(l => { x.fillText(l, PAD, y + 8); y += 42; }); y += 22; }
  y = gridTop;
  for (let r = 0; r < rows; r++) {
    const rowCards = o.cards.slice(r * cols, r * cols + cols), rowW = rowCards.length * cw + (rowCards.length - 1) * GAP;
    let cx = (W - rowW) / 2;
    rowCards.forEach((c, j) => {
      const k = r * cols + j, im = imgs[k];
      x.save(); x.beginPath(); x.roundRect ? x.roundRect(cx, y, cw, ch, 10) : x.rect(cx, y, cw, ch); x.clip();
      if (im) {
        if (c.entry.reversed) { x.translate(cx + cw / 2, y + ch / 2); x.rotate(Math.PI); x.drawImage(im, -cw / 2, -ch / 2, cw, ch); }
        else x.drawImage(im, cx, y, cw, ch);
      } else { x.fillStyle = C.surface; x.fillRect(cx, y, cw, ch); }
      x.restore();
      x.strokeStyle = C.line; x.lineWidth = 2; x.beginPath(); x.roundRect ? x.roundRect(cx, y, cw, ch, 10) : x.rect(cx, y, cw, ch); x.stroke();
      let ty = y + ch + 14;
      x.font = F.pos; x.fillStyle = C.a3; posL[k].forEach(l => { x.fillText(l, cx, ty); ty += 20; }); ty += 4;
      x.font = F.name; x.fillStyle = C.text; nameL[k].forEach(l => { x.fillText(l, cx, ty); ty += 24; });
      if (c.entry.reversed) { x.font = F.pos; x.fillStyle = C.a1; x.fillText('REVERSED', cx, ty + 2); }
      cx += cw + GAP;
    });
    y += rowH(r);
  }
  y = bodyTop;
  x.font = F.body; x.fillStyle = C.muted; bodyL.forEach(l => { x.fillText(l, PAD, y); y += 36; });
  const g = x.createLinearGradient(PAD, 0, W - PAD, 0); g.addColorStop(0, C.a1); g.addColorStop(.5, C.a2); g.addColorStop(1, C.a3);
  y = H - 70; x.fillStyle = g; x.fillRect(PAD, y, W - 2 * PAD, 3);
  x.font = F.foot; x.fillStyle = C.muted; x.fillText(o.footer || '', PAD, y + 20);
  return new Promise((res, rej) => {
    try { cv.toBlob(b => b ? res(b) : rej(new Error('The browser could not make the image.')), 'image/png'); }
    catch (e) { rej(new Error(location.protocol === 'file:' ? 'Saving an image needs the site opened from its web address; a file opened from disk is blocked by the browser.' : 'The browser could not make the image.')); }
  });
}

async function deliver(blob, filename, text){
  try {
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] }) && matchMedia('(pointer: coarse)').matches) {
      await navigator.share({ files: [file], text: text || '' });
      return 'shared';
    }
  } catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  return 'downloaded';
}

/* Everything the image needs for one reading. cards = [{i, r}] as the deck and the journal store them. */
function fromReading(spreadId, cards, opts = {}){
  const sp = NS.spreadById(spreadId), entries = cards.map(c => ({ card: NS.DECK[c.i], reversed: !!c.r }));
  const known = sp.id === spreadId, when = new Date(opts.at || Date.now());
  const focus = { love: 'about love', work: 'about work and money' }[opts.focus];
  const lines = [];
  if (NS.reading && known) {
    const s = NS.reading.story(sp, entries); if (s) lines.push(s.t);
    else NS.reading.compose(sp, entries).walk.forEach(w => lines.push(w.lead + ': ' + w.kw));
  } else entries.forEach((e, k) => lines.push((known && sp.pos[k] ? sp.pos[k].name : 'Card ' + (k + 1)) + ': ' + (e.reversed ? e.card.rev : e.card.up)));
  const brand = (NS.brand && NS.brand.name) || '';
  return { eyebrow: brand, title: known ? sp.name : 'A reading',
    sub: when.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + (focus ? ' · ' + focus : ''),
    question: opts.question || '',
    cards: entries.map((entry, k) => ({ entry, pos: known && sp.pos[k] ? sp.pos[k].name : 'Card ' + (k + 1) })),
    lines, footer: (brand ? brand + ' · ' : '') + 'Rider-Waite-Smith cards, 1909, Pamela Colman Smith. For entertainment only.' };
}
async function saveReading(spreadId, cards, opts, statusEl){
  const say = t => { if (statusEl) statusEl.textContent = t; };
  say('Drawing the image…');
  try {
    const o = fromReading(spreadId, cards, opts), blob = await readingImage(o);
    const d = new Date(opts.at || Date.now()), name = `reading-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.png`;
    const how = await deliver(blob, name, o.title);
    say(how === 'shared' ? 'Shared.' : how === 'cancelled' ? '' : 'Image saved to your downloads.');
  } catch (e) { say(e.message); }
}

NS.share = { readingImage, deliver, fromReading, saveReading };
})(window.TD);
