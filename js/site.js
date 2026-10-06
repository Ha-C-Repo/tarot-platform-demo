/* site.js — classic script; assigns to window.TD. No ES modules, so file:// works. */
window.TD = window.TD || {};
(function(NS){
'use strict';
/* site.js — shared brand config, chrome, the demo control panel and the Free/Subscriber view. */
const DEF = { name:'Your Practice Name', role:'Tarot Reader & Astrologer', city:'Your City',
              theme:'default', rate:'85', tier:'sub', deck:'rws' };
const KEY = 'tarotdemo.brand';
let stored = {};
try { stored = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) {}
const brand = Object.assign({}, DEF, stored);
function save(){ try { localStorage.setItem(KEY, JSON.stringify(brand)); } catch (e) {} }

/* 'astro' marks where the Astrology menu sits. Third field 1 = phone menu only; on desktop those pages are linked from the pages. */
const NAV = [
  ['index.html','Home'], ['pull.html','Pull a card'], ['crystal.html','Crystal ball'], ['moon.html','The Moon'], ['astro'], ['numerology.html','Numerology'],
  ['handbook.html','Handbook'], ['pricing.html','Pricing'],
  ['journal.html','Your journal',1], ['learn.html','Learn the cards',1], ['oracle.html','I Ching, runes, dice, geomancy',1], ['book.html','Book a session',1], ['live.html','Live reading room',1], ['account.html','Your account',1]
];
/* The Astrology menu (Amanda, 2026-10-05): every astrology page, calculator and report, in sections. Columns on desktop, an accordion on phones. */
const ASTRO = [
  [['Charts and calculators', [['birthchart.html','Birth chart'], ['vedic.html','Vedic chart'], ['astromap.html','Astrocartography'], ['compatibility.html','Compatibility'], ['tools.html','Astrology tools']]],
   ['Horoscopes', [['horoscope.html','Personal horoscope'], ['signs.html','Horoscopes by sign']]]],
  [['Reports: soul and self', [['reports.html','All reports'], ['pastlife.html','Past lives'], ['karmic.html','Karmic path'], ['report.html?r=lifepath','Life path'], ['report.html?r=vocation','Vocational guidance'],
    ['report.html?r=child','Child report'], ['report.html?r=family','Family patterns in love'], ['report.html?r=chakras','Chakras, stones and essences']]]],
  [['Reports: timing', [['report.html?r=solarreturn','Solar return'], ['report.html?r=lunarreturn','Lunar return'], ['report.html?r=progressions','Progressed chart'], ['report.html?r=saturn','Saturn cycle'], ['report.html?r=relocation','Relocation']]],
   ['Reports: relationships', [['report.html?r=synastry','Synastry'], ['report.html?r=composite','Composite chart'], ['report.html?r=couplefc','Couple forecast'], ['report.html?r=couplepast','Past lives together']]]],
  [['Other traditions', [['chinese.html','Chinese astrology'], ['report.html?r=chinese','Chinese astrology report'], ['oracle.html?o=dice','Astro dice'], ['maya.html','Maya calendar']]]]
];
/* Is this menu link the page being shown? report.html links match on their ?r= id (Life path when none is given). */
function isHere(h, current){
  const [page, q] = h.split('?');
  if (page !== current) return false;
  if (!q) return true;
  const [k, v] = q.split('=');
  let have = null; try { have = new URLSearchParams(location.search).get(k); } catch (e) {}
  return v === (have || (k === 'r' ? 'lifepath' : ''));
}
function astroMenu(current){
  const on = ASTRO.some(col => col.some(([, links]) => links.some(([h]) => isHere(h, current))));
  const chev = '<svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 4.5 6 8l3.5-3.5"/></svg>';
  return `<div class="navdrop${on ? ' here' : ''}"><button type="button" class="navdropbtn${on ? ' on' : ''}" id="astrobtn" aria-expanded="false" aria-controls="astromenu">Astrology ${chev}</button>
    <div class="navmenu" id="astromenu">${ASTRO.map(col => `<div class="nmcol">${col.map(([title, links]) => `<div class="nmsec"><span class="nmh">${title}</span>${links.map(([h, t]) =>
      `<a href="${h}"${isHere(h, current) ? ' class="on" aria-current="page"' : ''}>${t}</a>`).join('')}</div>`).join('')}</div>`).join('')}</div></div>`;
}

function chrome(current){
  document.documentElement.dataset.theme = brand.theme;
  document.documentElement.dataset.deck = NS.deckId || 'rws';
  document.documentElement.dataset.tier = brand.tier;
  const band = `<div class="demoband">Demo build &mdash; <b>every name, price and reading below is placeholder.</b>
      Viewing as <b data-tier-label>${brand.tier === 'free' ? 'a free visitor' : 'a subscriber'}</b>.
      Open <b>Customise</b>, bottom right, to put your own name on it.</div>`;
  const nav = `<a class="skip" href="#main">Skip to content</a>
    <nav class="nav"><div class="navin">
      <a class="brand" href="index.html" aria-label="Home"><span class="mark" aria-hidden="true"></span><b data-brand-name>${esc(brand.name)}</b></a>
      <div class="navlinks" id="navlinks">${NAV.map(([h,t,m])=> h === 'astro' ? astroMenu(current) :
        `<a href="${h}"${m?' class="monly'+(h===current?' on':'')+'"':h===current?' class="on"':''}${h===current?' aria-current="page"':''}>${t}</a>`).join('')}</div>
      <a class="navacct${current==='account.html'?' on':''}" href="account.html" aria-label="Your account" title="Your account"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="8.2" r="3.8"/><path d="M4.5 20.2c.9-3.9 3.9-6.1 7.5-6.1s6.6 2.2 7.5 6.1"/></svg></a>
      <a class="navcta" href="book.html">Book a reading</a>
      <button class="burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="navlinks">☰</button>
    </div></nav>`;
  document.body.insertAdjacentHTML('afterbegin', band + nav + '<div class="grain"></div>');
  const first = document.querySelector('.wrap'); if (first) first.id = first.id || 'main';
  document.body.insertAdjacentHTML('beforeend', `<footer><div class="fin">
      <div><b data-brand-name>${esc(brand.name)}</b> &middot; <span data-brand-role>${esc(brand.role)}</span>
        &middot; <span data-brand-city>${esc(brand.city)}</span><br>
        <span class="note">For entertainment purposes only. Not medical, legal or financial advice.</span></div>
      <div class="note" style="max-width:52ch">Demo site. Nothing you type here leaves your browser &mdash;
        it is stored in this browser only and cleared by the Reset button.<br>
        ${NS.DECKS ? NS.DECKS[NS.deckId].credit : 'Tarot card imagery: Rider-Waite-Smith, 1909, illustrations by Pamela Colman Smith. Public domain.'}<br>
        Traditional card meanings: A.E. Waite, <i>The Pictorial Key to the Tarot</i>, 1911. Public domain.<br>
        Place data: <a href="https://www.geonames.org/" rel="noopener" style="text-decoration:underline">GeoNames</a>,
        licensed CC BY 4.0. Planet positions: Astronomy Engine by Don Cross, MIT licence. Chart wheel: AstroChart by Matheus Alves, MIT licence. World map: Natural Earth, public domain.
        Handbook texts and figures: public domain, from Project Gutenberg and Wikisource.</div>
    </div></footer>` + panel());
  document.body.insertAdjacentHTML('beforeend', modal());
  wire();
  if (NS.fillIcons) NS.fillIcons();          // <i data-icon> placeholders -> the drawn symbols in js/icons.js
  if (NS.tour) NS.tour.boot(current);
  printable(current);
}
/* Report pages get a Print button under the intro; printing opens every closed details section first
   and closes them again afterwards, so the printed report carries the full reading. */
/* Lazy images below the screen never load before a print, so they print blank: switch them to eager and wait
   (at most 6 s) until every image has loaded or failed, then print. */
function printWhenReady(){
  const imgs = [...document.images];
  imgs.forEach(i => { if (i.loading === 'lazy') i.loading = 'eager'; });
  const ready = imgs.map(i => i.complete ? null : new Promise(r => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); })).filter(Boolean);
  Promise.race([Promise.all(ready), new Promise(r => setTimeout(r, 6000))]).then(() => window.print());
}
NS.printWhenReady = printWhenReady;
const PRINTABLE = ['birthchart.html', 'vedic.html', 'horoscope.html', 'signs.html', 'journal.html', 'tools.html', 'compatibility.html', 'numerology.html'];
function printable(current){
  if (PRINTABLE.includes(current)) {
    const lede = document.querySelector('.wrap .lede');
    if (lede) {
      lede.insertAdjacentHTML('afterend', '<button class="btn printbtn" type="button" data-print style="margin-top:14px">Print or save as PDF</button>');
      lede.nextElementSibling.onclick = () => printWhenReady();
    }
  }
  let opened = [];
  window.addEventListener('beforeprint', () => { opened = [...document.querySelectorAll('details:not([open])')]; opened.forEach(d => d.open = true); });
  window.addEventListener('afterprint', () => { opened.forEach(d => d.open = false); opened = []; });
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function panel(){
  const themes = [['default','Prism'],['ember','Ember'],['sage','Sage'],['ink','Ink'],['light','Daylight']];
  return `<div id="demobar"><div id="demopanel">
    <h4>Make it yours</h4>
    <p class="note">Type a name and pick a palette. The whole site updates. This is what a client sees on day one.</p>
    <div class="row"><label class="f" for="dn">Practice name</label><input id="dn" value="${esc(brand.name)}"></div>
    <div class="row"><label class="f" for="dr">What you do</label><input id="dr" value="${esc(brand.role)}"></div>
    <div class="row"><label class="f" for="dc">City</label><input id="dc" value="${esc(brand.city)}"></div>
    <div class="row"><label class="f" for="dp">Your reading price ($)</label><input id="dp" inputmode="numeric" value="${esc(brand.rate)}"></div>
    <div class="row"><label class="f">Palette</label><div class="swatches">${themes.map(([v,t])=>
      `<button class="sw" data-theme="${v}" title="${t}" aria-label="${t} palette" aria-pressed="${brand.theme===v}"
        style="background:${swatch(v)}"></button>`).join('')}</div></div>
${NS.DECKS && Object.keys(NS.DECKS).length > 1 ? `<div class="row"><label class="f" for="ddeck">Card deck</label><select id="ddeck">${Object.entries(NS.DECKS).map(([k, d]) =>
      `<option value="${k}"${(NS.deckId || 'rws') === k ? ' selected' : ''}>${esc(d.name)}</option>`).join('')}</select></div>` : ''}
    <div class="row" id="tierrow"><label class="f">Viewing as</label>
      <div class="seg" role="group" aria-label="Viewing as">
        <button type="button" data-tier="free" aria-pressed="${brand.tier==='free'}">Free visitor</button>
        <button type="button" data-tier="sub" aria-pressed="${brand.tier==='sub'}">Subscriber</button></div>
      <p class="note" style="margin:0">Free shows the ads and the members' lock. Card readings are unlimited in both views.
        Subscriber removes the ads and unlocks everything.</p></div>
    <button class="btn wide" id="dinstall" style="font-size:13px;padding:10px;margin-bottom:8px">Install as an app</button>
    <p class="note" id="dinstallnote" style="margin:-2px 0 8px"></p>
    <button class="btn wide" id="dtour" style="font-size:13px;padding:10px;margin-bottom:8px">Take the tour</button>
    <button class="btn wide" id="dreset" style="font-size:13px;padding:10px">Reset demo data</button>
  </div>
  <button id="demotoggle" aria-expanded="false" aria-controls="demopanel">Customise</button></div>`;
}
const swatch = v => ({
  default:'linear-gradient(100deg,#FF2E88,#A855F7,#22D3EE,#B6F04A)',
  ember:'linear-gradient(100deg,#FF6B35,#E8153F,#FFC857)',
  sage:'linear-gradient(100deg,#7BC47F,#3E8E7E,#D4C2A8)',
  ink:'linear-gradient(100deg,#C9A227,#8B93A7,#D8DCE6)',
  light:'linear-gradient(100deg,#FBF8F4 0 45%,#D6246E 45% 60%,#7C3AED 60% 80%,#0E7F96 80%)'}[v]);

function apply(){
  document.documentElement.dataset.theme = brand.theme;
  document.documentElement.dataset.tier = brand.tier;
  document.querySelectorAll('[data-brand-name]').forEach(e=>e.textContent = brand.name);
  document.querySelectorAll('[data-brand-role]').forEach(e=>e.textContent = brand.role);
  document.querySelectorAll('[data-brand-city]').forEach(e=>e.textContent = brand.city);
  document.querySelectorAll('[data-brand-rate]').forEach(e=>e.textContent = brand.rate);
  document.querySelectorAll('[data-tier-label]').forEach(e=>e.textContent = brand.tier === 'free' ? 'a free visitor' : 'a subscriber');
  save();
}
function setTier(t){
  brand.tier = t === 'free' ? 'free' : 'sub';
  document.querySelectorAll('.seg [data-tier]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tier === brand.tier));
  apply();
  document.dispatchEvent(new CustomEvent('tierchange', { detail: brand.tier }));
}
function openPanel(open){
  const p = document.getElementById('demopanel'), t = document.getElementById('demotoggle');
  const o = open === undefined ? !p.classList.contains('open') : open;
  p.classList.toggle('open', o); t.setAttribute('aria-expanded', o);
}
function openModal(){ document.getElementById('mwrap').classList.add('open'); }
function wire(){
  const p = document.getElementById('demopanel');
  document.getElementById('demotoggle').onclick = () => openPanel();
  const bind = (id,k) => document.getElementById(id).addEventListener('input', e => {
    brand[k] = e.target.value || DEF[k]; apply(); });
  bind('dn','name'); bind('dr','role'); bind('dc','city'); bind('dp','rate');
  p.querySelectorAll('.sw').forEach(b => b.onclick = () => {
    brand.theme = b.dataset.theme;
    p.querySelectorAll('.sw').forEach(x => x.setAttribute('aria-pressed', x===b));
    apply();
  });
  p.querySelectorAll('.seg [data-tier]').forEach(b => b.onclick = () => setTier(b.dataset.tier));
  const di = document.getElementById('dinstall'), dn = document.getElementById('dinstallnote');
  const syncInstall = () => { const st = install.state(); di.style.display = st === 'installed' ? 'none' : ''; dn.textContent = st === 'ready' ? '' : install.help(); di.disabled = st !== 'ready'; };
  di.onclick = () => install.prompt().then(syncInstall);
  document.addEventListener('installready', syncInstall); syncInstall();
  const dd = document.getElementById('ddeck'); if (dd) dd.onchange = e => { brand.deck = e.target.value; save(); location.reload(); };
  document.getElementById('dtour').onclick = () => { openPanel(false); if (NS.tour) NS.tour.start(); };
  // mobile nav
  const bg = document.getElementById('burger'), nl = document.getElementById('navlinks');
  if (bg) bg.onclick = () => { const o = nl.classList.toggle('open'); bg.setAttribute('aria-expanded', o); };
  // Astrology menu: click or tap opens and closes it (desktop also opens on hover); Escape or a click elsewhere closes it.
  const ab = document.getElementById('astrobtn');
  if (ab) {
    const dd = ab.parentNode, setOpen = o => { dd.classList.toggle('open', o); ab.setAttribute('aria-expanded', o); };
    ab.onclick = e => { e.stopPropagation(); setOpen(!dd.classList.contains('open')); };
    document.addEventListener('click', e => { if (!dd.contains(e.target) && !nl.classList.contains('open')) setOpen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && dd.classList.contains('open')) { setOpen(false); ab.focus(); } });
    if (dd.classList.contains('here') && matchMedia('(max-width:860px)').matches) setOpen(true);   // phone menu: open on the section you are in
  }
  // demo CTAs: anything that would take money or book time stops at the modal
  const mw = document.getElementById('mwrap');
  const close = () => mw.classList.remove('open');
  document.getElementById('mclose').onclick = close;
  document.getElementById('mback').onclick = close;
  mw.addEventListener('click', e => { if (e.target === mw) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  document.querySelectorAll('[data-demo], .navcta, .tier button.btn, a[href="pricing.html"].btn').forEach(el => {
    if (el.closest('#demopanel')) return;
    el.addEventListener('click', e => {
      if (el.classList.contains('navcta') && !el.dataset.demo) return;   // nav CTA still navigates
      e.preventDefault(); openModal();
    });
  });
  document.getElementById('dreset').onclick = () => {
    if (confirm('Clear all demo data stored in this browser? That includes your name, palette, the deck order and the tour.')) {
      try { localStorage.clear(); sessionStorage.clear(); } catch (e) {}
      location.reload();
    }
  };
  apply();
}

function modal(){
  return `<div class="mwrap" id="mwrap" role="dialog" aria-modal="true" aria-labelledby="mttl">
    <div class="mbox">
      <button class="mclose" id="mclose" aria-label="Close">&times;</button>
      <h3 id="mttl">That button is switched off</h3>
      <p>On a live site this takes a booking, starts a subscription or opens the calendar.
         Here it stops, because there is no payment or scheduling account behind it.
         Nothing is charged and no card details are ever asked for on this demo.</p>
      <p>Everything else you are looking at is real and running: the draws, the moon calendar,
         the chart maths, the calculators. Only the money is off.</p>
      <p><b>Want one of these with your name on it?</b> Ask the person who sent you this link.</p>
      <div class="ph"><span class="k">Placeholder &mdash; contact details go here</span>
        <p>On a live site this is the reader&rsquo;s own booking link or email address.</p></div>
      <div class="mact">
        <button class="btn primary" id="mback">Keep looking around</button>
      </div>
    </div></div>`;
}

/* ---------- installable app (manifest.webmanifest, sw.js) ----------
   The service worker only runs over http(s), never from a file. Browsers that offer an install prompt
   (Chrome, Edge, Android) fire beforeinstallprompt; we keep it for the Install buttons. iPhone and iPad
   have no prompt, so the buttons explain Share, then Add to Home Screen. */
let installEvt = null;
const standalone = () => { try { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch (e) { return false; } };
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; document.dispatchEvent(new CustomEvent('installready')); });
  window.addEventListener('appinstalled', () => { installEvt = null; document.dispatchEvent(new CustomEvent('installready')); });
  /* The manifest link is added here, over http(s) only: from a file the browser refuses to read it and logs an error. */
  if (/^https?:$/.test(location.protocol) && document.head && !document.querySelector('link[rel="manifest"]')) {
    const ln = document.createElement('link'); ln.rel = 'manifest'; ln.href = 'manifest.webmanifest'; document.head.appendChild(ln);
  }
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }
}
const install = {
  state(){ return standalone() ? 'installed' : installEvt ? 'ready' : isIOS() ? 'ios' : /^https?:$/.test(location.protocol) ? 'manual' : 'file'; },
  prompt(){ if (!installEvt) return Promise.resolve(false); const e = installEvt; installEvt = null; e.prompt(); return e.userChoice.then(c => c.outcome === 'accepted').catch(() => false); },
  help(){ return ({ installed: 'It is installed: you are using the app now.',
    ready: 'Your browser can install it in one tap.',
    ios: 'On iPhone or iPad: tap Share, then Add to Home Screen.',
    manual: 'In your browser menu, choose Install app or Add to Home screen.',
    file: 'Open the site from its web address to install it; a file opened from disk cannot install.' })[install.state()]; }
};

function money(n){ return '$' + Number(n).toLocaleString('en-US'); }
NS.brand = brand;
NS.chrome = chrome;
NS.money = money;
NS.install = install;
NS.setTier = setTier;
NS.openPanel = openPanel;
NS.openModal = openModal;
NS.isSubscriber = () => brand.tier !== 'free';
})(window.TD);
