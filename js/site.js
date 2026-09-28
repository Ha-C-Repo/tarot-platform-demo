/* site.js — classic script; assigns to window.TD. No ES modules, so file:// works. */
window.TD = window.TD || {};
(function(NS){
'use strict';
/* site.js — shared brand config, chrome, and the demo control panel. */
const DEF = { name:'Your Practice Name', role:'Tarot Reader & Astrologer', city:'Your City',
              theme:'default', rate:'85' };
const KEY = 'tarotdemo.brand';
const brand = Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || '{}'));
function save(){ localStorage.setItem(KEY, JSON.stringify(brand)); }

const NAV = [
  ['index.html','Home'], ['pull.html','Pull a card'], ['moon.html','The Moon'],
  ['compatibility.html','Compatibility'], ['numerology.html','Numerology'],
  ['chinese.html','Chinese'], ['maya.html','Maya'],
  ['handbook.html','Handbook'], ['pricing.html','Pricing']
];

function chrome(current){
  document.documentElement.dataset.theme = brand.theme;
  const band = `<div class="demoband">Demo build &mdash; <b>every name, price and reading below is placeholder.</b>
      Open <b>Customise</b>, bottom right, to put your own name on it.</div>`;
  const nav = `<a class="skip" href="#main">Skip to content</a>
    <nav class="nav"><div class="navin">
      <a class="brand" href="index.html" aria-label="Home"><span class="mark" aria-hidden="true"></span><b data-brand-name>${esc(brand.name)}</b></a>
      <button class="burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="navlinks">\u2630</button>
      <div class="navlinks" id="navlinks">${NAV.map(([h,t])=>
        `<a href="${h}"${h===current?' class="on" aria-current="page"':''}>${t}</a>`).join('')}</div>
      <a class="navcta" href="pricing.html">Book a reading</a>
    </div></nav>`;
  document.body.insertAdjacentHTML('afterbegin', band + nav + '<div class="grain"></div>');
  const first = document.querySelector('.wrap'); if (first) first.id = first.id || 'main';
  document.body.insertAdjacentHTML('beforeend', `<footer><div class="fin">
      <div><b data-brand-name>${esc(brand.name)}</b> &middot; <span data-brand-role>${esc(brand.role)}</span>
        &middot; <span data-brand-city>${esc(brand.city)}</span><br>
        <span class="note">For entertainment purposes only. Not medical, legal or financial advice.</span></div>
      <div class="note" style="max-width:38ch">Demo site. Nothing you type here leaves your browser &mdash;
        everything is stored in localStorage and cleared by the Reset button.<br>
        Tarot card imagery: Rider-Waite-Smith, 1909, illustrations by Pamela Colman Smith. Public domain.</div>
    </div></footer>` + panel());
  document.body.insertAdjacentHTML('beforeend', modal());
  wire();
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function panel(){
  const themes = [['default','Prism'],['ember','Ember'],['sage','Sage'],['ink','Ink']];
  return `<div id="demobar"><div id="demopanel">
    <h4>Make it yours</h4>
    <p class="note">Type a name and pick a palette. The whole site updates. This is what a client sees on day one.</p>
    <div class="row"><label class="f" for="dn">Practice name</label><input id="dn" value="${esc(brand.name)}"></div>
    <div class="row"><label class="f" for="dr">What you do</label><input id="dr" value="${esc(brand.role)}"></div>
    <div class="row"><label class="f" for="dc">City</label><input id="dc" value="${esc(brand.city)}"></div>
    <div class="row"><label class="f" for="dp">Your reading price ($)</label><input id="dp" value="${esc(brand.rate)}"></div>
    <div class="row"><label class="f">Palette</label><div class="swatches">${themes.map(([v,t])=>
      `<button class="sw" data-theme="${v}" title="${t}" aria-pressed="${brand.theme===v}"
        style="background:${swatch(v)}"></button>`).join('')}</div></div>
    <button class="btn wide" id="dreset" style="font-size:13px;padding:10px">Reset demo data</button>
  </div>
  <button id="demotoggle">Customise</button></div>`;
}
const swatch = v => ({
  default:'linear-gradient(100deg,#FF2E88,#A855F7,#22D3EE,#B6F04A)',
  ember:'linear-gradient(100deg,#FF6B35,#E8153F,#FFC857)',
  sage:'linear-gradient(100deg,#7BC47F,#3E8E7E,#D4C2A8)',
  ink:'linear-gradient(100deg,#C9A227,#8B93A7,#D8DCE6)'}[v]);

function apply(){
  document.documentElement.dataset.theme = brand.theme;
  document.querySelectorAll('[data-brand-name]').forEach(e=>e.textContent = brand.name);
  document.querySelectorAll('[data-brand-role]').forEach(e=>e.textContent = brand.role);
  document.querySelectorAll('[data-brand-city]').forEach(e=>e.textContent = brand.city);
  document.querySelectorAll('[data-brand-rate]').forEach(e=>e.textContent = brand.rate);
  save();
}
function wire(){
  const p = document.getElementById('demopanel');
  document.getElementById('demotoggle').onclick = () => p.classList.toggle('open');
  const bind = (id,k) => document.getElementById(id).addEventListener('input', e => {
    brand[k] = e.target.value || DEF[k]; apply(); });
  bind('dn','name'); bind('dr','role'); bind('dc','city'); bind('dp','rate');
  p.querySelectorAll('.sw').forEach(b => b.onclick = () => {
    brand.theme = b.dataset.theme;
    p.querySelectorAll('.sw').forEach(x => x.setAttribute('aria-pressed', x===b));
    apply();
  });
  // mobile nav
  const bg = document.getElementById('burger'), nl = document.getElementById('navlinks');
  if (bg) bg.onclick = () => { const o = nl.classList.toggle('open'); bg.setAttribute('aria-expanded', o); };
  // demo CTAs
  const mw = document.getElementById('mwrap');
  const close = () => mw.classList.remove('open');
  document.getElementById('mclose').onclick = close;
  document.getElementById('mback').onclick = close;
  mw.addEventListener('click', e => { if (e.target === mw) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  document.querySelectorAll('[data-demo], .navcta, .tier .btn, a[href="pricing.html"].btn').forEach(el => {
    if (el.closest('#demopanel')) return;
    el.addEventListener('click', e => {
      if (el.classList.contains('navcta') && !el.dataset.demo) return;   // nav CTA still navigates
      e.preventDefault(); mw.classList.add('open');
    });
  });
  document.getElementById('dreset').onclick = () => {
    if (confirm('Clear all demo data stored in this browser?')) { localStorage.clear(); location.reload(); }
  };
  apply();
}

function modal(){
  return `<div class="mwrap" id="mwrap" role="dialog" aria-modal="true" aria-labelledby="mttl">
    <div class="mbox">
      <button class="mclose" id="mclose" aria-label="Close">&times;</button>
      <h3 id="mttl">That button is switched off</h3>
      <p>On a live site this takes a booking, starts a subscription or opens the calendar.
         Here it stops, because there is no payment or scheduling account behind it yet.</p>
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

function money(n){ return '$' + Number(n).toLocaleString('en-US'); }
NS.brand = brand;
NS.chrome = chrome;
NS.money = money;
})(window.TD);
