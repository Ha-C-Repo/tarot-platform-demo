/* reportpage.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   The shared shell of the long-form reports (pastlife.html, karmic.html): the birth-data form, remembered in
   this browser under the same key as birthchart.html so one chart carries across pages; lazy loading of the
   text files; and one context object with every calculation a report reads. A page calls
   TD.reportPage({ page, render(ctx) }) after its scripts have loaded. Load after site.js, places.js and the
   engines (astro, chart, natal, vedic, numerology, factors, cards + correspondences). */
window.TD = window.TD || {};
(function(NS){
'use strict';
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const KEY = 'tarotdemo.natal';
const TEXT_FILES = ['js/data/natal-text.js', 'js/data/vedic-text.js', 'js/data/report-text.js', 'js/data/tools-text.js', 'js/data/astro-extra-text.js'];
const PKEY = 'tarotdemo.partner';      // the second person of the relationship reports
let textState = null;

function loadTexts(then){
  if (NS.NATAL_TEXT && NS.VEDIC_TEXT && NS.REPORT_TEXT && NS.TOOLS_TEXT && NS.ASTRO_EXTRA) return true;
  if (textState) return false;
  textState = 'loading';
  let i = 0;
  const next = () => {
    if (i === TEXT_FILES.length) { textState = 'done'; return then(); }
    const el = document.createElement('script'); el.src = TEXT_FILES[i++];
    el.onload = next; el.onerror = () => { textState = 'failed'; then(); }; document.head.appendChild(el);
  };
  next();
  return false;
}
const realName = n => { const s = String(n || '').trim(); return /[a-z]{2,}/i.test(s) && !/^you$/i.test(s); };

function context(p, mode){
  const c = NS.chart(p.input), F = NS.factors;
  const iso = `${p.input.y}-${String(p.input.mo).padStart(2, '0')}-${String(p.input.d).padStart(2, '0')}`;
  const named = realName(p.name);
  const num = NS.numerology(named ? p.name : '', iso);
  if (!named) { delete num.expression; delete num.soulUrge; delete num.personality; }
  const karmic = NS.karmicNumbers(named ? p.name : '', iso);
  const v = NS.vedic.chart(c), st = F.strength(c), soj = F.sojourns(c, mode);
  /* Relationship reports: the partner's chart as ctx.B, their details as ctx.pB. */
  const B = p.partner ? NS.chart(p.partner.input) : null;
  return { p, c, v, iso, B, pB: p.partner || null, named, num, karmic, st, soj, mode,
    nodes: F.nodes(c), onNodes: F.onNodes(c), retro: F.retrogrades(c), emphasis: F.emphasis(c), fortune: F.fortune(c),
    chakras: F.chakras(c, st), ak: F.atmakaraka(v), conv: F.convergence(c, v, num, karmic, soj, st),
    T: Object.assign({}, NS.TOOLS_TEXT, NS.NATAL_TEXT, NS.VEDIC_TEXT, NS.REPORT_TEXT) };
}

/* Helpers the report pages share. */
const H = {
  esc,
  signOf: lon => NS.SIGNS[Math.floor(((lon % 360) + 360) % 360 / 30)],
  ordinal: n => n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'),
  glyph: k => { const g = (NS.BODIES.find(b => b.key === k) || {}).glyph; return g ? `<span class="gl">${g}</span>` : ''; },
  para: t => t ? `<p class="interp">${esc(t)}</p>` : '',
  poss: n => /^you$/i.test(String(n).trim()) ? 'Your' : esc(n) + '’s',
  chapter: (n, title, intro) => `<div class="eyebrow rchead" style="margin-top:34px">Chapter ${n}</div><h2 class="rh2">${title}</h2>${intro ? `<p class="note">${intro}</p>` : ''}`,
  /* A titled group of separate boxes, one per item, so no box is split across printed pages. */
  items: (title, list, empty) => `<div class="rgroup"><h3 class="rgh">${title}</h3>${list.length ? list.map(x => `<div class="res">${x}</div>`).join('') : `<div class="res">${empty || ''}</div>`}</div>`,
  block: (h, body) => `<div class="res">${h ? `<h3>${h}</h3>` : ''}${body}</div>`,
  ORDER: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'],
  /* Major aspects between the ten planets, inner planet first, closest first; the Moon's are dropped with no birth time. */
  aspects(ctx){
    const O = H.ORDER;
    return NS.natal.aspects(ctx.c).filter(a => O.includes(a.a) && O.includes(a.b) && !a.uncertain).map(a => {
      const [x, y] = O.indexOf(a.a) < O.indexOf(a.b) ? [a.a, a.b] : [a.b, a.a];
      return Object.assign({ x, y, textKey: `aspect:${x}|${y}:${a.type}`, hard: a.type === 'square' || a.type === 'opposition', soft: a.type === 'trine' || a.type === 'sextile' }, a);
    });
  },
  card(id, role){
    const card = NS.DECK.find(c => c.id === id);
    return `<div class="bc">${NS.faceHTML({ card, reversed: false }, { caption: false, eager: true })}<b>${card.name}</b><span>${role}</span></div>`;
  },
  disclaimerPlain: '<p class="note rdisc" style="margin-top:22px">For reflection and entertainment. Sample text written for this demo, the same for everyone with the same placement; a live site uses the reader&rsquo;s own words. Astrology describes tendencies, never certainties, and is no substitute for professional advice.</p>',
  disclaimer: '<p class="note rdisc" style="margin-top:22px">For reflection and entertainment. Sample text written for this demo, the same for everyone with the same placement; a live site uses the reader&rsquo;s own words. Past-life readings are a spiritual tradition, not a historical record.</p>'
};

function reportPage(opts){
  NS.chrome(opts.page);
  let saved = null; try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (saved) { $('nm').value = saved.nm || 'You'; $('bd').value = saved.bd || $('bd').value; $('bt').value = saved.bt || '';
    $('bu').checked = !!saved.bu; $('bt').disabled = !!saved.bu; }
  const MKEY = 'tarotdemo.ayanamsa';
  try { const m = localStorage.getItem(MKEY); if (m && $('ayan')) $('ayan').value = m; } catch (e) {}
  const place = NS.places.picker($('bp'), () => go(), saved && saved.place || 'Denver');
  /* Optional second place: where you are now (return charts, saved as 'now' like tools.html) or a place to relocate to. */
  const here = $('np') ? NS.places.picker($('np'), () => go(), saved && (saved.now || saved.place) || 'Denver') : null;
  const away = $('rp') ? NS.places.picker($('rp'), () => go(), saved && saved.reloc || 'London') : null;
  $('bu').addEventListener('change', () => { $('bt').disabled = $('bu').checked; go(); });
  ['nm', 'bd', 'bt', 'ayan'].forEach(id => $(id) && $(id).addEventListener('change', go));
  $('go').onclick = go;
  /* Optional partner block (#pnm, #pbd, #pbt, #pbu, #pp), remembered under its own key. */
  let psaved = null, partner = null;
  if ($('pp')) {
    try { psaved = JSON.parse(localStorage.getItem(PKEY) || 'null'); } catch (e) {}
    if (psaved) { $('pnm').value = psaved.nm || $('pnm').value; $('pbd').value = psaved.bd || $('pbd').value; $('pbt').value = psaved.bt || '';
      $('pbu').checked = !!psaved.bu; $('pbt').disabled = !!psaved.bu; }
    partner = NS.places.picker($('pp'), () => go(), psaved && psaved.place || 'Chicago');
    $('pbu').addEventListener('change', () => { $('pbt').disabled = $('pbu').checked; go(); });
    ['pnm', 'pbd', 'pbt'].forEach(id => $(id).addEventListener('change', go));
  }
  function readPartner(hsys){
    const iso = $('pbd').value, pl = partner.get();
    if (!iso || !pl) return null;
    const [y, mo, d] = iso.split('-').map(Number), known = !$('pbu').checked && !!$('pbt').value;
    const [h, mi] = known ? $('pbt').value.split(':').map(Number) : [12, 0];
    try { localStorage.setItem(PKEY, JSON.stringify({ nm: $('pnm').value, bd: iso, bt: $('pbt').value, bu: $('pbu').checked, place: pl.name })); } catch (e) {}
    return { name: $('pnm').value || 'Partner', place: pl, input: { y, mo, d, h, mi, timeKnown: known, lat: pl.lat, lon: pl.lon, tz: pl.tz, system: hsys } };
  }

  function read(){
    const iso = $('bd').value, pl = place.get();
    if (!iso || !pl) return null;
    const [y, mo, d] = iso.split('-').map(Number);
    const known = !$('bu').checked && !!$('bt').value;
    const [h, mi] = known ? $('bt').value.split(':').map(Number) : [12, 0];
    let prev = null; try { prev = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    const hsys = prev && prev.hsys || 'placidus';
    try { localStorage.setItem(KEY, JSON.stringify(Object.assign({}, prev, { nm: $('nm').value, bd: iso, bt: $('bt').value, bu: $('bu').checked, hsys, place: pl.name },
      here && here.get() ? { now: here.get().name } : {}, away && away.get() ? { reloc: away.get().name } : {})));
      if ($('ayan')) localStorage.setItem(MKEY, $('ayan').value); } catch (e) {}
    const pB = partner ? readPartner(hsys) : null;
    if (partner && !pB) return null;
    return { name: $('nm').value || 'You', place: pl, partner: pB, now: here && here.get() || pl, reloc: away && away.get() || null, input: { y, mo, d, h, mi, timeKnown: known, lat: pl.lat, lon: pl.lon, tz: pl.tz, system: hsys } };
  }
  function go(){
    const p = read();
    if (!p) { $('out').innerHTML = `<div class="res"><p class="note">Pick a birth place from the list${$('pp') ? ' for both people' : ''} to write the report.</p></div>`; return; }
    if (!loadTexts(() => { const y = scrollY; go(); scrollTo({ top: y, behavior: 'instant' }); })) {
      $('out').innerHTML = `<div class="res"><p class="note">${textState === 'failed' ? 'The report text could not be loaded.' : 'Writing your report&hellip;'}</p></div>`;
      if (textState !== 'failed') return;
    }
    const ctx = context(p, $('ayan') ? $('ayan').value : 'fagan');
    const body = opts.render(ctx, H);
    $('out').innerHTML = (opts.cover ? printPages(ctx, body, opts.cover) : '') + body;
  }
  document.querySelectorAll('[data-report-print]').forEach(b => { b.onclick = () => (NS.printWhenReady || print)(); });
  go();
}

/* Print-only cover and "About this report" page. cover: { kicker, title, card: 'major-20', caption } */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function printPages(ctx, body, cover){
  const p = ctx.p, i = p.input, card = NS.DECK.find(c => c.id === cover.card), brand = NS.brand || {};
  let where = p.place && p.place.name || '';
  try { if (NS.places && NS.places.label && p.place.lat != null) where = NS.places.label(p.place); } catch (e) {}
  const when = `${i.d} ${MONTHS[i.mo - 1]} ${i.y}${i.timeKnown ? `, ${String(i.h).padStart(2, '0')}:${String(i.mi).padStart(2, '0')}` : ', birth time unknown'}`;
  const now = new Date(), made = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  const chapters = [...body.matchAll(/<h2 class="rh2">([\s\S]*?)<\/h2>/g)].map(m => m[1]);
  const method = [...document.querySelectorAll('#form .warn p')].map(x => `<p>${x.innerHTML}</p>`).join('');
  const who = (/^you$/i.test(String(p.name).trim()) ? 'you' : esc(p.name)) + (ctx.pB ? ' and ' + esc(ctx.pB.name) : '');
  const born = (q, pl) => { let w = pl && pl.name || ''; try { if (NS.places && NS.places.label && pl.lat != null) w = NS.places.label(pl); } catch (e) {}
    const j = q.input; return `${ctx.pB ? esc(q.name) + ': born ' : 'Born '}${j.d} ${MONTHS[j.mo - 1]} ${j.y}${j.timeKnown ? `, ${String(j.h).padStart(2, '0')}:${String(j.mi).padStart(2, '0')}` : ', birth time unknown'}<br>${esc(w)}`; };
  const disc = (body.match(/<p class="note rdisc"[^>]*>([\s\S]*?)<\/p>/) || [])[1];
  return `<div class="pcover">
      <div><div class="pc-brand">${esc(brand.name || '')}${brand.role ? ' &middot; ' + esc(brand.role) : ''}</div>
        <div class="pc-kicker">${cover.kicker}</div><h1 class="pc-title">${cover.title}</h1><div class="pc-for">Prepared for ${who}</div></div>
      ${card ? `<figure class="pc-card"><div><img src="${card.img}" alt="${esc(card.name)}" loading="eager"><figcaption>${esc(card.name)}${cover.caption ? ', ' + cover.caption : ''}. Rider-Waite-Smith deck, 1909, Pamela Colman Smith.</figcaption></div></figure>` : ''}
      <div><div class="pc-birth">${ctx.pB ? born(p, p.place) + '<br>' + born(ctx.pB, ctx.pB.place) : `Born ${when}<br>${esc(where)}`}</div>
        <div class="pc-foot">Prepared ${made}. For reflection and entertainment.</div></div>
    </div>
    <div class="pabout"><h2>About this report</h2><h3>Contents</h3><ol>${chapters.map(c => `<li>${c}</li>`).join('')}</ol>
      ${method ? `<h3>How it was made</h3>${method}` : ''}${disc ? `<h3>Please note</h3><p>${disc}</p>` : ''}</div>`;
}

NS.reportPage = reportPage;
NS.reportContext = context;
NS.reportHelpers = H;
})(window.TD);
