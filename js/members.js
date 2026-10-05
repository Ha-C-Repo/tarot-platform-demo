/* members.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   The mock account and bookings behind account.html, book.html, checkout.html and live.html.

   DEMO ONLY, and every page says so: no password, no email, no card field, nothing leaves the browser.
   "Signing in" stores a first name in localStorage. A booking is a "demo hold" stored the same way; it
   reaches nobody and charges nothing. Reset demo data clears it all (site.js clears localStorage).
   On a live site these calls are replaced by the real account, payment and calendar services. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const AKEY = 'tarotdemo.account', BKEY = 'tarotdemo.bookings';
const get = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } };
const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
const str = (x, n) => typeof x === 'string' ? x.trim().slice(0, n) : '';

/* Session types. Prices follow the reading price in Customise, as pricing.html does:
   recorded = the rate, live 45 = the rate, live 75 = the rate x 150/85 (pricing.html shows rate–150 at the default 85). */
function sessions(rate){
  const r = Math.max(1, Math.round(Number(rate) || 85));
  return [
    { id: 'live45', name: 'Live session, 45 minutes', min: 45, price: r, live: true,
      blurb: 'On video. Your chart and your questions, and you can ask things back.' },
    { id: 'live75', name: 'Live session, 75 minutes', min: 75, price: Math.round(r * 150 / 85), live: true,
      blurb: 'The longer session: room for a full Celtic Cross and your birth chart in one sitting.' },
    { id: 'recorded', name: 'Recorded reading', min: 10, price: r, live: false,
      blurb: 'Made for you and sent as a video of 8 to 10 minutes. Not a call; no time slot needed.' }
  ];
}
/* Pay-per-minute chat price for the live room mock: the reading price spread over 30 minutes. */
const perMinute = rate => Math.max(0.5, Math.round((Number(rate) || 85) / 30 * 100) / 100);

/* The reader's weekly hours (placeholder, in the visitor's own time zone): Tuesday to Saturday,
   sessions starting on the hour from 10:00 to 18:00, booked at least 24 hours ahead, two weeks out. */
const HOURS = { days: [2, 3, 4, 5, 6], from: 10, to: 18 };
function openDays(now = new Date(), n = 14){
  const out = [], d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (let k = 1; k <= n; k++) {
    const d = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + k);
    out.push({ date: d, open: HOURS.days.includes(d.getDay()) });
  }
  return out;
}
function slots(day, minutes, now = new Date()){
  if (!HOURS.days.includes(day.getDay())) return [];
  const taken = new Set(bookings().map(b => b.at));
  const out = [];
  for (let h = HOURS.from; h + minutes / 60 <= HOURS.to + 1; h++) {
    const t = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h).getTime();
    /* Some slots show as taken so the calendar looks like a working one: a fixed pattern by date and hour, not random. */
    const busy = (day.getDate() * 7 + h * 3) % 5 === 0;
    out.push({ at: t, free: t - now.getTime() >= 864e5 && !busy && !taken.has(t) });
  }
  return out;
}

/* ---------- the mock account ---------- */
function account(){ const a = get(AKEY, null); return a && typeof a.name === 'string' && a.name ? a : null; }
function signIn(name){
  const n = str(name, 40); if (!n) return null;
  const a = { name: n, since: (account() || {}).since || Date.now() };
  return put(AKEY, a) ? a : null;
}
function signOut(){ try { localStorage.removeItem(AKEY); } catch (e) {} }

/* ---------- demo holds ---------- */
function bookings(){
  const b = get(BKEY, []);
  return Array.isArray(b) ? b.filter(x => x && typeof x.id === 'string' && typeof x.kind === 'string') : [];
}
function hold(kind, at, question){
  const list = bookings(), id = Date.now().toString(36);
  const b = { id, kind: str(kind, 12), at: Number.isFinite(at) ? at : null, question: str(question, 300), made: Date.now() };
  list.push(b);
  return put(BKEY, list.slice(-20)) ? b : null;
}
function cancel(id){ put(BKEY, bookings().filter(b => b.id !== id)); }

NS.members = { sessions, perMinute, HOURS, openDays, slots, account, signIn, signOut, bookings, hold, cancel, AKEY, BKEY };
})(window.TD);
