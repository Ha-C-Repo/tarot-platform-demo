/* icons.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   The site's own symbols, drawn as line icons on a 24-unit grid, so nothing on the site falls back to emoji.
   TD.icon(name, opts) returns inline SVG: stroke in the current text colour, or the prism gradient with
   {prism: true}. opts.size sets the width and height in px (default 1em), opts.cls adds a class, opts.label
   makes it announced to screen readers (otherwise it is hidden from them). */
window.TD = window.TD || {};
(function(NS){
'use strict';
const dot = (x, y, r = 1.15) => `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" stroke="none"/>`;
const star4 = (x, y, r) => `<path d="M${x} ${y - r}C${x + r * .18} ${y - r * .18} ${x + r * .18} ${y - r * .18} ${x + r} ${y}C${x + r * .18} ${y + r * .18} ${x + r * .18} ${y + r * .18} ${x} ${y + r}C${x - r * .18} ${y + r * .18} ${x - r * .18} ${y + r * .18} ${x - r} ${y}C${x - r * .18} ${y - r * .18} ${x - r * .18} ${y - r * .18} ${x} ${y - r}Z"/>`;
/* A pentagram inscribed in a circle of radius r, drawn point to point. */
const pentagram = (cx, cy, r) => {
  const p = k => { const a = (-90 + k * 144) * Math.PI / 180; return `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`; };
  return `<path d="M${p(0)}L${p(1)}L${p(2)}L${p(3)}L${p(4)}Z"/>`;
};

const ICONS = {
  /* The Handbook's Parts */
  cards: `<rect x="3.6" y="5.2" width="9.6" height="14.4" rx="1.4" transform="rotate(-9 8.4 12.4)"/>
          <rect x="10.4" y="4.2" width="9.6" height="14.4" rx="1.4" transform="rotate(7 15.2 11.4)"/>${star4(15.2, 11.4, 3)}`,
  stars: `<path d="M3.5 18.5 8.5 12l5 2.8 6.5-8.3"/>${dot(3.5, 18.5)}${dot(8.5, 12)}${dot(13.5, 14.8)}${dot(20, 6.5)}${star4(6, 5.5, 2.4)}`,
  moon: `<path d="M14.5 3.6a8.6 8.6 0 1 0 6 14.3 7 7 0 0 1-6-14.3Z"/>${star4(18.6, 6.4, 2.2)}`,
  gem: `<path d="M3 9.2 6.6 4h10.8L21 9.2 12 20.5Z"/><path d="M3 9.2h18M9 4.2 7.8 9.2 12 20.3l4.2-11.1L15 4.2M7.8 9.2 12 4.4l4.2 4.8"/>`,
  hand: `<path d="M8.6 12.2V5.4a1.5 1.5 0 0 1 3 0v5.8M11.6 10.6V3.9a1.5 1.5 0 0 1 3 0v6.9M14.6 11V5.6a1.5 1.5 0 0 1 3 0V14a6.5 6.5 0 0 1-6.5 6.5h-.6a6 6 0 0 1-4.8-2.4l-2.9-3.9a1.6 1.6 0 0 1 2.4-2.1l2.1 2.1"/>
         <path d="M9.6 15.6c.9-.8 1.9-1.1 3-1.1s2.1.4 2.9 1.1c-.8.8-1.8 1.1-2.9 1.1s-2.1-.3-3-1.1Z"/>${dot(12.6, 15.6, .7)}`,
  charm: `<path d="M5 3.8V11a7 7 0 0 0 14 0V3.8h-4V11a3 3 0 0 1-6 0V3.8Z"/>${dot(7, 7.4, .8)}${dot(7.3, 11.6, .8)}${dot(17, 7.4, .8)}${dot(16.7, 11.6, .8)}`,
  book: `<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v15H5.5A1.5 1.5 0 0 0 4 19.5Z"/><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H19v-3"/>${star4(11.5, 10.5, 3.2)}`,
  /* The four suits */
  wands: `<path d="M5.5 19.5 18.5 4.5"/><path d="M14.6 9c1.3-.6 2.6-.3 3.4.8-1.3.6-2.6.3-3.4-.8ZM10.6 13.6c-.6-1.3-.3-2.6.8-3.4.6 1.3.3 2.6-.8 3.4ZM16.9 6.3c.9-.1 1.7.3 2.1 1"/>`,
  cups: `<path d="M6 3.5h12v3.7a6 6 0 0 1-12 0Z"/><path d="M6 6.4h12M12 13.2v5M8.2 20.5h7.6M9.6 18.2h4.8"/>`,
  swords: `<path d="M10.8 15.4V5L12 2.6 13.2 5v10.4Z"/><path d="M7.5 15.4h9M12 15.4v3.6M10.4 21.2h3.2"/>${dot(12, 19.9, .9)}`,
  pentacles: `<circle cx="12" cy="12" r="8.6"/>${pentagram(12, 12, 6.9)}`,
  /* Interface */
  lock: `<rect x="5" y="10.6" width="14" height="10" rx="2"/><path d="M8.2 10.6V7.8a3.8 3.8 0 0 1 7.6 0v2.8M12 15.2v2.4"/>${dot(12, 14.9, .9)}`,
  alert: `<path d="M12 3.4 2.6 19.8h18.8Z"/><path d="M12 9.4v5.2"/>${dot(12, 17.2, .95)}`,
  contents: `<path d="M8.5 6.5H20M8.5 12H20M8.5 17.5H20"/>${dot(4.5, 6.5)}${dot(4.5, 12)}${dot(4.5, 17.5)}`,
  prev: `<path d="M14.8 5.5 8.3 12l6.5 6.5"/>`,
  next: `<path d="M9.2 5.5 15.7 12l-6.5 6.5"/>`,
  close: `<path d="M6 6l12 12M18 6 6 18"/>`,
  scroll: `<path d="M7 4h10M7 20h10M12 7.5v9M9 13.5l3 3 3-3"/>`,
  pages: `<path d="M3.5 5.5c2.8-1.2 5.6-1.2 8.5.6v13c-2.9-1.8-5.7-1.8-8.5-.6ZM20.5 5.5c-2.8-1.2-5.6-1.2-8.5.6v13c2.9-1.8 5.7-1.8 8.5-.6Z"/>`,
  text: `<path d="M4 19 9 5l5 14M5.8 14.2h6.4M15 19l3-8 3 8M15.9 16.6h4.2"/>`,
  user: `<circle cx="12" cy="8.2" r="3.8"/><path d="M4.5 20.2c.9-3.9 3.9-6.1 7.5-6.1s6.6 2.2 7.5 6.1"/>`,
  calendar: `<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.6h17M8 3v4M16 3v4"/>${dot(8.2, 13.4, .9)}${dot(12, 13.4, .9)}${dot(15.8, 13.4, .9)}${dot(8.2, 17, .9)}`,
  chat: `<path d="M4 5.5h16v10.2H10.2L6 19.5v-3.8H4Z"/>${dot(8.6, 10.6, .9)}${dot(12, 10.6, .9)}${dot(15.4, 10.6, .9)}`,
  play: `<circle cx="12" cy="12" r="8.6"/><path d="M10 8.4v7.2l6-3.6Z"/>`
};

let defsReady = false;
function defs(){
  if (defsReady || typeof document === 'undefined' || !document.body) return;
  defsReady = true;
  // The prism gradient, in each icon's own 24-unit space, shared by every icon on the page.
  document.body.insertAdjacentHTML('afterbegin', `<svg aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden">
    <defs><linearGradient id="tdPrism" gradientUnits="userSpaceOnUse" x1="2" y1="2" x2="22" y2="22">
      <stop offset="0" stop-color="var(--a1)"/><stop offset=".5" stop-color="var(--a2)"/><stop offset="1" stop-color="var(--a3)"/></linearGradient></defs></svg>`);
}
function icon(name, opts = {}){
  const body = ICONS[name]; if (!body) return '';
  if (opts.prism) defs();
  const size = opts.size ? `width="${opts.size}" height="${opts.size}"` : 'width="1em" height="1em"';
  const a11y = opts.label ? `role="img" aria-label="${String(opts.label).replace(/"/g, '&quot;')}"` : 'aria-hidden="true" focusable="false"';
  return `<svg class="ico${opts.cls ? ' ' + opts.cls : ''}" viewBox="0 0 24 24" ${size} ${a11y} fill="none" stroke="${opts.prism ? 'url(#tdPrism)' : 'currentColor'}"
    stroke-width="${opts.weight || 1.5}" stroke-linecap="round" stroke-linejoin="round"${opts.prism ? ' color="var(--a2)"' : ''}>${body}</svg>`;
}
/* Fill every <i data-icon="name"> placeholder in static HTML (data-prism, data-size optional). */
function fillIcons(root){
  (root || document).querySelectorAll('i[data-icon]').forEach(el => {
    el.outerHTML = icon(el.dataset.icon, { prism: 'prism' in el.dataset, size: el.dataset.size, cls: el.className || '', label: el.getAttribute('aria-label') });
  });
}
NS.ICONS = ICONS;
NS.icon = icon;
NS.fillIcons = fillIcons;
})(window.TD);
