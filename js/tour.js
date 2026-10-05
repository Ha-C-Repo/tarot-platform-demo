/* tour.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   The guided tour. No library: a dimmer with a cut-out over the target, a tooltip, and
   Back / Next / Skip. The site is multi-page, so the step index lives in sessionStorage and
   each page picks the tour up if it owns the current step. Escape ends the tour. Clicking the
   dimmer does not, since that is too easy to do by accident. It starts by itself on a first
   visit to the home page (remembered in localStorage) and from any "Take the tour" button. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const RUN = 'tarotdemo.tour', DONE = 'tarotdemo.toured';
const STEPS = [
  { page: 'index.html', sel: '#hero', title: 'A reader’s site, ready to wear',
    body: 'Every name, price and photo slot is a placeholder. Everything else is working software, and this tour shows you where. About three minutes.' },
  { page: 'index.html', sel: '#skystrip', title: 'Tonight’s sky, calculated',
    body: 'The Moon’s phase, sign and next full moon are worked out from its orbit when the page loads. No lookup table, nothing fetched from anywhere.' },
  { page: 'index.html', sel: '#reels', title: 'The reader’s own video goes here',
    body: 'Reels, live readings and longer videos are designed empty slots in this demo. On a live site they carry the reader’s own footage from TikTok, Facebook or Vimeo.' },
  { page: 'index.html', sel: '#workwith', title: 'Where the money comes in',
    body: 'Booking a session, a pay-by-the-minute live room and a client account. Each one is a clickable walk-through of the real flow, and each stops before any money moves.' },
  { page: 'index.html', sel: '#getapp', title: 'An app, without an app store',
    body: 'Visitors can install the site on their phone: its own icon, full screen, and it opens offline once visited. No store listing and no review queue.' },
  { page: 'pull.html', sel: '#deckzone', title: 'A real deck, shuffled for real',
    body: 'Pick a spread: one card, yes or no, love, the full moon, the zodiac houses or Waite’s own Celtic Cross. Shuffle puts the deck in a new random order that stays until the next shuffle. Pull deals from the top, and a finished reading is saved to the visitor’s journal. Visitors can also make and save spreads of their own.' },
  { page: 'pull.html', sel: '#howdeck', title: 'Meanings for both orientations',
    body: 'Every card carries its traditional upright and reversed meaning, from Waite’s 1911 book, and the spread is read as a whole. A finished reading can be saved as an image to share, or printed. On a live site the reader’s own writing replaces the sample text.' },
  { page: 'journal.html', sel: '#jlist', title: 'Every reading, kept',
    body: 'The journal keeps each reading with its question and the visitor’s notes, and shows the cards that keep coming back. It lives in the visitor’s browser and backs up to a file.' },
  { page: 'learn.html', sel: '#stage', title: 'Learning the cards',
    body: 'Flashcards and a quiz on all 78 cards: names, meanings both ways up, and the astrology. The cards a visitor misses come back more often until they stick.' },
  { page: 'moon.html', sel: '#calcard', title: 'The page people bookmark',
    body: 'A month of moon phases, day by day, with the maths stated underneath and a reading for the phase and sign tonight. It is the free tool that brings people back.' },
  { page: 'signs.html', sel: '#signpick', title: 'Horoscopes for every sign, written by the sky',
    body: 'Today, the week, the month and the year for all twelve signs, matched to where the planets really are. Nobody has to write a daily column for it to stay current.' },
  { page: 'tools.html', sel: '#good-days', title: 'Good days for anything',
    body: 'Pick an activity, a date, a contract, a trip, and see the best days of the next month, scored by published rules and, with a birth chart, by the visitor’s own planets.' },
  { page: 'compatibility.html', sel: '#fullform', title: 'Compatibility with birth time and place',
    body: 'Both people’s time and place give the rising sign, the houses and a ten-by-ten grid of real planetary aspects, each strong contact read in words. Historical daylight saving is handled, and an unknown time is said out loud, not guessed.' },
  { page: 'compatibility.html', sel: '#weighting', title: 'The score shows its working',
    body: 'The number is a rule of thumb, and the rule is printed next to it. Nobody has to take a score on trust.' },
  { page: 'chinese.html', sel: '#boundary', title: 'The detail most sites get wrong',
    body: 'The Chinese zodiac year does not start on 1 January, and there are two boundaries in use. This page shows both, and the Four Pillars from the exact birth moment.' },
  { page: 'oracle.html', sel: '#otabs', title: 'The I Ching and the runes',
    body: 'Two more oracles: the Book of Changes cast with three coins, in James Legge’s 1882 translation, and the 24 runes of the Elder Futhark, drawn as line art.' },
  { page: 'handbook.html', sel: '#vault', title: 'The members’ Vault',
    body: 'What a subscriber gets: the long-form practice pieces and a recorded reading every month. Switch the view to Free visitor in Customise and watch it lock.' },
  { page: 'pricing.html', sel: '#tiers', title: 'Four ways in',
    body: 'Prices follow whatever the reader types in Customise. Each button walks through checkout or booking and stops at a notice. Nothing is charged, and no card field exists anywhere on this site.' },
  { page: 'book.html', sel: '#opts', title: 'Booking, start to finish',
    body: 'Choose a session, pick an open time in the visitor’s own time zone, add a question, confirm. On a live site this is where the calendar and the payment provider plug in.' },
  { page: 'account.html', sel: '#hello', title: 'The client’s own page',
    body: 'Plan, sessions, saved chart and journal in one place. Here a first name is enough to look around; on a live site visitors sign in with a link sent to their email.' },
  { page: '*', sel: '#demopanel', open: true, title: 'Now make it theirs',
    body: 'Type a practice name, pick a palette (one of them light), switch between Free and Subscriber. The whole site changes as you type. That is the pitch.' }
];
let ui = null, cur = -1, curPage = '';

const ss = { get(){ try { const v = sessionStorage.getItem(RUN); return v == null ? null : +v; } catch (e) { return null; } },
             set(v){ try { v == null ? sessionStorage.removeItem(RUN) : sessionStorage.setItem(RUN, String(v)); } catch (e) {} } };
/* Which way the visitor is moving, so a hidden step is skipped forward on Next and backward on Back. */
const dir = d => { try { if (d === undefined) return +(sessionStorage.getItem(RUN + '.dir') || 1); sessionStorage.setItem(RUN + '.dir', String(d)); } catch (e) {} return d || 1; };
const done = () => { try { return localStorage.getItem(DONE) === '1'; } catch (e) { return true; } };
const markDone = () => { try { localStorage.setItem(DONE, '1'); } catch (e) {} };
const owns = (i, page) => STEPS[i] && (STEPS[i].page === page || STEPS[i].page === '*');

function build(){
  if (ui) return ui;
  const block = document.createElement('div'); block.className = 'tour-block';
  const hole = document.createElement('div'); hole.className = 'tour-hole';
  const tip = document.createElement('div'); tip.className = 'tour-tip';
  tip.setAttribute('role', 'dialog'); tip.setAttribute('aria-modal', 'true'); tip.setAttribute('aria-labelledby', 'tourttl');
  document.body.append(block, hole, tip);
  ui = { block, hole, tip };
  window.addEventListener('resize', place);
  window.addEventListener('scroll', place, { passive: true });
  document.addEventListener('keydown', onKey);
  return ui;
}
function teardown(){
  if (!ui) return;
  ui.block.remove(); ui.hole.remove(); ui.tip.remove();
  window.removeEventListener('resize', place); window.removeEventListener('scroll', place);
  document.removeEventListener('keydown', onKey);
  ui = null; cur = -1;
}
function onKey(e){ if (e.key === 'Escape') { e.stopPropagation(); end(); } }

function target(){ const s = STEPS[cur]; return s && document.querySelector(s.sel); }
function place(){
  if (!ui) return;
  const el = target(); if (!el) return;
  const r = el.getBoundingClientRect(), pad = 8;
  const top = Math.max(r.top - pad, 4), left = Math.max(r.left - pad, 4);
  const w = Math.min(r.width + pad * 2, innerWidth - left - 4), h = Math.min(r.height + pad * 2, innerHeight - top - 4);
  Object.assign(ui.hole.style, { top: top + 'px', left: left + 'px', width: w + 'px', height: h + 'px' });
  const tw = ui.tip.offsetWidth, th = ui.tip.offsetHeight, gap = 14;
  let ty = top + h + gap;
  if (ty + th > innerHeight - 8) ty = top - th - gap;          // no room below: go above
  if (ty < 8) ty = Math.max(8, innerHeight - th - 8);           // no room either side: pin to the bottom
  ty = Math.max(8, Math.min(ty, innerHeight - th - 8));
  let tx = Math.min(Math.max(left, 16), innerWidth - tw - 16);
  Object.assign(ui.tip.style, { top: ty + 'px', left: tx + 'px', visibility: 'visible' });
}
function show(i){
  const s = STEPS[i]; if (!s) return end(true);
  cur = i; ss.set(i);
  if (s.open && NS.openPanel) NS.openPanel(true);
  const el = target();
  if (!el || !el.getClientRects().length) {                    // missing or hidden: skip it, in the direction of travel
    const back = dir() < 0, j = back ? i - 1 : i + 1;
    return j < 0 ? go(0) : j < STEPS.length ? go(j, back ? -1 : 1) : end(true);
  }
  build();
  Object.assign(ui.tip.style, { top: '0px', left: '0px', visibility: 'hidden' });   // shown once placed
  const last = i === STEPS.length - 1;
  ui.tip.innerHTML = `<div class="n">Step ${i + 1} of ${STEPS.length}</div><h4 id="tourttl">${s.title}</h4><p>${s.body}</p>
    <div class="tb"><button class="btn" data-t="back"${i === 0 ? ' disabled' : ''}>Back</button>
    <button class="btn primary" data-t="next">${last ? 'Finish' : 'Next'}</button>
    <button class="tskip" data-t="skip">Skip tour</button></div>`;
  ui.tip.querySelector('[data-t="back"]').onclick = () => go(i - 1, -1);
  ui.tip.querySelector('[data-t="next"]').onclick = () => last ? end(true) : go(i + 1);
  ui.tip.querySelector('[data-t="skip"]').onclick = () => end();
  const fixed = getComputedStyle(el).position === 'fixed' || el.closest('#demobar');
  if (!fixed) el.scrollIntoView({ block: 'center', behavior: 'auto' });
  requestAnimationFrame(() => { place(); ui.tip.querySelector('[data-t="next"]').focus({ preventScroll: true }); });
  setTimeout(place, 250);
  /* Pages that fill in after load (the tools) can push the target down: bring it back into view while that settles. */
  [900, 2000, 3500, 5000].forEach(ms => setTimeout(() => {
    if (cur !== i || !ui) return;
    const r = el.getBoundingClientRect();
    if (!fixed && (r.top < 0 || r.top > innerHeight - 60)) el.scrollIntoView({ block: 'center', behavior: 'auto' });
    place();
  }, ms));
}
function go(i, d = 1){
  if (i < 0) return;
  ss.set(i); dir(d);
  if (owns(i, curPage)) return show(i);
  teardown();
  location.href = STEPS[i].page;
}
function end(finished){
  ss.set(null); markDone(); teardown();
  if (finished !== true && NS.openPanel) NS.openPanel(false);
}
function start(){ curPage = curPage || 'index.html'; go(0); }
function boot(page){
  curPage = page || '';
  const i = ss.get();
  if (i != null) {
    if (owns(i, curPage)) setTimeout(() => show(i), 350);
    else ss.set(null);                                   // the visitor wandered off: the tour ends quietly
    return;
  }
  if (curPage === 'index.html' && !done()) setTimeout(start, 900);
}
NS.tour = { start, boot, end, STEPS };
})(window.TD);
