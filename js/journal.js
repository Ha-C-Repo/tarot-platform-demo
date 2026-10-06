/* journal.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   The reading journal: every completed card reading, kept in this browser's localStorage.

   - An entry is saved once, when the last card of a spread lands (pull.html). Nothing is sent anywhere.
   - The visitor can add a question and a note, delete an entry, and back the whole journal up to a
     file and load it again (here or in another browser), so nothing is locked to one device.
   - Reset demo data clears it with everything else (site.js clears localStorage).
   Entry: { id, at (ms), spread, focus, question, note, sig: card index or null, cards: [{i, r}] }
   Oracle entries (oracle.html, 2026-10-05) add kind: 'runes' with runes: [{i: 0-23, r, z: zone}] (1-9), or
   kind: 'dice' with dice: [planet 0-11, sign 0-11, house 1-12]; or kind: 'crystal' (crystal.html) with the answer text and
   orb: the two hidden cards [{i, r}], kept but never shown; their cards list is empty and the tarot stats skip them. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const KEY = 'tarotdemo.journal';
const MAX = 500;                                   // oldest entries drop off beyond this; ~150 bytes each
const FOCI = ['general', 'love', 'work'];
const FORMAT = 'tarotdemo.journal';                // the backup file says what it is
const VERSION = 1;

function read(){
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (s && Array.isArray(s.entries)) return s.entries.filter(valid);
  } catch (e) {}
  return [];
}
function write(list){
  try { localStorage.setItem(KEY, JSON.stringify({ v: VERSION, entries: list })); return true; } catch (e) { return false; }
}
const str = (x, n) => typeof x === 'string' ? x.slice(0, n) : '';
const isInt = (x, lo, hi) => Number.isInteger(x) && x >= lo && x <= hi;
function validOracle(e){
  if (e.kind === 'runes') return Array.isArray(e.runes) && e.runes.length >= 1 && e.runes.length <= 9 && e.runes.every(x => x && isInt(x.i, 0, 23));
  if (e.kind === 'crystal') return Array.isArray(e.orb) && e.orb.length === 2 && e.orb.every(x => x && isInt(x.i, 0, 77)) && typeof e.answer === 'string' && e.answer.length > 0;
  if (e.kind === 'dice') return Array.isArray(e.dice) && e.dice.length === 3 && isInt(e.dice[0], 0, 11) && isInt(e.dice[1], 0, 11) && isInt(e.dice[2], 1, 12);
  return false;
}
function valid(e){
  if (e && e.kind) return typeof e.id === 'string' && /^[a-z0-9-]{1,40}$/i.test(e.id) && Number.isFinite(e.at) && typeof e.spread === 'string' && validOracle(e);
  return e && typeof e.id === 'string' && /^[a-z0-9-]{1,40}$/i.test(e.id) && Number.isFinite(e.at) && typeof e.spread === 'string' &&
    Array.isArray(e.cards) && e.cards.length >= 1 && e.cards.length <= 12 &&
    e.cards.every(c => c && Number.isInteger(c.i) && c.i >= 0 && c.i < 78);
}
/* Copy only the fields we know, with lengths capped, so a hand-edited or foreign file cannot inject anything. */
function clean(e){
  return { id: str(e.id, 40), at: +e.at, spread: str(e.spread, 20), focus: FOCI.includes(e.focus) ? e.focus : 'general',
    question: str(e.question, 300), note: str(e.note, 4000),
    sig: Number.isInteger(e.sig) && e.sig >= 0 && e.sig < 78 ? e.sig : null,
    name: str(e.name, 40), pos: Array.isArray(e.pos) ? e.pos.slice(0, 12).map(p => str(p, 30)) : [],   // a spread the visitor made
    cards: e.kind ? [] : e.cards.map(c => ({ i: c.i, r: !!c.r })),
    ...(e.kind === 'runes' ? { kind: 'runes', runes: e.runes.map(x => ({ i: x.i, r: !!x.r, z: ['heart', 'near', 'edge'].includes(x.z) ? x.z : '' })) } : {}),
    ...(e.kind === 'dice' ? { kind: 'dice', dice: e.dice.slice(0, 3) } : {}),
    ...(e.kind === 'crystal' ? { kind: 'crystal', orb: e.orb.map(x => ({ i: x.i, r: !!x.r })), answer: str(e.answer, 3000) } : {}) };
}
function newId(){
  const a = new Uint8Array(6); crypto.getRandomValues(a);
  return Date.now().toString(36) + '-' + Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
}

/* Newest first. */
function list(){ return read().map(clean).sort((a, b) => b.at - a.at); }
function get(id){ return list().find(e => e.id === id) || null; }
function add(e){
  const entry = clean(Object.assign({ id: newId(), at: Date.now(), question: '', note: '' }, e));
  if (!valid(entry)) return null;
  const all = [entry].concat(list()).slice(0, MAX);
  return write(all) ? entry : null;
}
function update(id, patch){
  const all = list(), k = all.findIndex(e => e.id === id);
  if (k < 0) return null;
  const next = clean(Object.assign({}, all[k], patch, { id, at: all[k].at, cards: all[k].cards, spread: all[k].spread }));
  all[k] = next; write(all); return next;
}
function remove(id){ const all = list(), n = all.length, rest = all.filter(e => e.id !== id); write(rest); return rest.length < n; }

/* ---------- patterns over time ---------- */
const SUITS = ['wands', 'cups', 'swords', 'pentacles'];
function stats(entries){
  entries = entries.filter(e => !e.kind);                // tarot only: rune and dice entries have no cards
  const D = NS.DECK, count = new Array(78).fill(0), rev = new Array(78).fill(0);
  let cards = 0, reversed = 0, majors = 0;
  const suits = { wands: 0, cups: 0, swords: 0, pentacles: 0 }, spreads = {}, foci = { general: 0, love: 0, work: 0 };
  entries.forEach(e => {
    spreads[e.spread] = (spreads[e.spread] || 0) + 1;
    foci[e.focus] = (foci[e.focus] || 0) + 1;
    e.cards.forEach(c => {
      cards++; count[c.i]++;
      if (c.r) { reversed++; rev[c.i]++; }
      const card = D[c.i];
      if (card.arcana === 'major') majors++; else if (suits[card.suit] != null) suits[card.suit]++;
    });
  });
  const top = count.map((n, i) => ({ i, n, rev: rev[i] })).filter(x => x.n > 0)
    .sort((a, b) => b.n - a.n || a.i - b.i);
  /* With a uniform deck each card turns up cards/78 times on average; a card seen at least 3 times and at
     least twice its fair share is worth pointing out. Stated on the page so nobody reads fate into noise. */
  const expected = cards / 78;
  const repeat = top.filter(x => x.n >= 3 && x.n >= 2 * expected);
  return { readings: entries.length, cards, reversed, majors, suits, spreads, foci, top, repeat, expected,
    first: entries.length ? Math.min(...entries.map(e => e.at)) : null };
}

/* ---------- backup to a file and back ---------- */
function exportText(){
  return JSON.stringify({ format: FORMAT, v: VERSION, exported: new Date().toISOString(), entries: list() }, null, 1);
}
/* Merges by id: entries already here are kept as they are (with any newer note), new ones are added. */
function importText(text){
  let data;
  try { data = JSON.parse(text); } catch (e) { return { ok: false, error: 'That file is not a journal backup (it is not JSON).' }; }
  if (!data || data.format !== FORMAT || !Array.isArray(data.entries)) return { ok: false, error: 'That file is not a journal backup from this site.' };
  const have = list(), ids = new Set(have.map(e => e.id));
  let added = 0, skipped = 0;
  data.entries.forEach(e => {
    if (!valid(e)) { skipped++; return; }
    const c = clean(e);
    if (ids.has(c.id)) { skipped++; return; }
    have.push(c); ids.add(c.id); added++;
  });
  have.sort((a, b) => b.at - a.at);
  if (!write(have.slice(0, MAX))) return { ok: false, error: 'This browser would not store the journal (storage is blocked or full).' };
  return { ok: true, added, skipped };
}

NS.journal = { KEY, MAX, list, get, add, update, remove, stats, exportText, importText, SUITS };
})(window.TD);
