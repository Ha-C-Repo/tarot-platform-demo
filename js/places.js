/* places.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   Birth-place search over the bundled GeoNames cities file (js/data/cities.js), which is
   loaded only on pages that ask for a birth place. No geocoding service is called: the
   whole list ships with the site, and each row carries its IANA time zone.

   Data: GeoNames (geonames.org), cities with population over 15,000 plus capitals, CC BY 4.0. */
window.TD = window.TD || {};
(function(NS){
'use strict';
let db = null, loading = null;
const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
let regionName = cc => cc;
try { const dn = new Intl.DisplayNames(['en'], { type: 'region' }); regionName = cc => { try { return dn.of(cc) || cc; } catch (e) { return cc; } }; } catch (e) {}

function build(raw){
  const rows = raw.rows.split('\n').map((line, i) => {
    const f = line.split('\t');
    const r = { rank: i, name: f[0], cc: f[2], admin: raw.admin[+f[3]] || '', lat: +f[4], lon: +f[5], tz: raw.tz[+f[6]] };
    r.key = fold(f[1] || f[0]);
    return r;
  });
  return { rows };
}
/* Loads js/data/cities.js once, by script tag, so it works from a double-clicked file too. */
function load(){
  if (db) return Promise.resolve(db);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    if (window.TD_CITIES) { db = build(window.TD_CITIES); resolve(db); return; }
    const s = document.createElement('script');
    s.src = (NS.ROOT || '') + 'js/data/cities.js';
    s.onload = () => { db = build(window.TD_CITIES); window.TD_CITIES = null; resolve(db); };
    s.onerror = () => { loading = null; reject(new Error('Could not load the cities list')); };
    document.head.appendChild(s);
  });
  return loading;
}
function label(r){ return [r.name, r.admin, regionName(r.cc)].filter(Boolean).join(', '); }
function search(q, limit = 8){
  if (!db) return [];
  const parts = q.split(',').map(s => fold(s.trim())).filter(Boolean);
  if (!parts.length) return [];
  const head = parts[0], rest = parts.slice(1);
  const out = [];
  for (const r of db.rows) {                       // rows are pre-sorted by population, largest first
    if (!r.key.startsWith(head) && !r.key.includes(' ' + head)) continue;
    if (rest.length) {
      const hay = fold(r.admin + ' ' + regionName(r.cc) + ' ' + r.cc);
      if (!rest.every(p => hay.includes(p))) continue;
    }
    out.push(r);
    if (out.length >= limit * 4) break;
  }
  out.sort((a, b) => (b.key.startsWith(head) - a.key.startsWith(head)) || (a.rank - b.rank));
  return out.slice(0, limit);
}
function fmtCoord(r){
  const la = Math.abs(r.lat).toFixed(2) + '°' + (r.lat >= 0 ? 'N' : 'S');
  const lo = Math.abs(r.lon).toFixed(2) + '°' + (r.lon >= 0 ? 'E' : 'W');
  return la + ' ' + lo;
}

/* A small accessible combobox. onPick(row) fires when a place is chosen. */
let uid = 0;
function picker(input, onPick, initial){
  const id = 'plist' + (++uid);
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', id);
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('spellcheck', 'false');
  const wrap = document.createElement('div'); wrap.className = 'pwrap';
  input.parentNode.insertBefore(wrap, input); wrap.appendChild(input);
  const list = document.createElement('ul'); list.id = id; list.className = 'plist'; list.setAttribute('role', 'listbox');
  wrap.appendChild(list);
  const meta = document.createElement('div'); meta.className = 'note pmeta'; wrap.after(meta);
  let items = [], active = -1, chosen = null;
  const close = () => { list.innerHTML = ''; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; };
  const choose = r => {
    chosen = r; input.value = label(r); close();
    meta.textContent = fmtCoord(r) + ' · time zone ' + r.tz;
    onPick(r);
  };
  const render = () => {
    list.innerHTML = items.map((r, i) =>
      `<li role="option" id="${id}-${i}" aria-selected="${i === active}" data-i="${i}">${esc(label(r))}</li>`).join('');
    input.setAttribute('aria-expanded', items.length ? 'true' : 'false');
    if (active >= 0) input.setAttribute('aria-activedescendant', `${id}-${active}`);
  };
  input.addEventListener('focus', () => { load().catch(() => { meta.textContent = 'The cities list could not be loaded.'; }); });
  input.addEventListener('input', () => {
    chosen = null; meta.textContent = '';
    load().then(() => { items = search(input.value); active = items.length ? 0 : -1; render(); });
  });
  input.addEventListener('keydown', e => {
    if (!items.length || input.getAttribute('aria-expanded') !== 'true') return;
    if (e.key === 'ArrowDown') { active = (active + 1) % items.length; render(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { active = (active - 1 + items.length) % items.length; render(); e.preventDefault(); }
    else if (e.key === 'Enter') { if (active >= 0) { choose(items[active]); e.preventDefault(); } }
    else if (e.key === 'Escape') { close(); }
  });
  list.addEventListener('mousedown', e => { const li = e.target.closest('li'); if (li) { e.preventDefault(); choose(items[+li.dataset.i]); } });
  input.addEventListener('blur', () => setTimeout(close, 120));
  const api = {
    get: () => chosen,
    set: q => load().then(() => { const r = search(q, 1)[0]; if (r) choose(r); return r; })
  };
  if (initial) api.set(initial);
  return api;
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

NS.places = { load, search, label, picker, fmtCoord };
})(window.TD);
