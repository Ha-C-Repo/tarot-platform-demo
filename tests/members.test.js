// The business-flow mock-ups: prices follow the reading price, the calendar keeps its rules, holds stay local.
const load = require('./load');
const store = {};
const localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
const M = load(['js/members.js'], { localStorage }).TD.members;
const assert = (c, msg) => { if (!c) throw new Error(msg); };

module.exports = [
  ['Session prices match pricing.html (rate, and rate to 150 at the default 85)', () => {
    const s = M.sessions(85), by = id => s.find(x => x.id === id);
    assert(by('live45').price === 85 && by('live75').price === 150 && by('recorded').price === 85, JSON.stringify(s.map(x => x.price)));
    assert(M.sessions(120).find(x => x.id === 'live75').price === 212, 'scaled 75-minute price');
    assert(M.sessions('junk')[0].price === 85, 'bad rate falls back to 85');
    assert(Math.abs(M.perMinute(85) - 2.83) < 1e-9, 'per minute ' + M.perMinute(85));
  }],
  ['Calendar: two weeks ahead, open Tuesday to Saturday, nothing inside 24 hours, sessions end by 19:00', () => {
    const now = new Date(2026, 9, 5, 15, 30);            // Monday 5 Oct 2026, 15:30
    const days = M.openDays(now);
    assert(days.length === 14 && days[0].date.getDate() === 6, 'starts tomorrow');
    days.forEach(d => assert(d.open === [2, 3, 4, 5, 6].includes(d.date.getDay()), 'open day ' + d.date));
    const tue = days[0].date, sl = M.slots(tue, 45, now);
    sl.forEach(s => { if (s.at - now.getTime() < 864e5) assert(!s.free, 'slot inside 24 h offered'); });
    assert(M.slots(days.find(d => !d.open).date, 45, now).length === 0, 'closed day has slots');
    const last = M.slots(days[1].date, 75, now).slice(-1)[0];
    assert(new Date(last.at).getHours() + 75 / 60 <= 19, '75-minute session runs past 19:00');
  }],
  ['Demo holds and the demo sign-in stay in localStorage, and a taken slot is no longer free', () => {
    Object.keys(store).forEach(k => delete store[k]);
    const now = new Date(2026, 9, 5, 9), day = M.openDays(now)[1].date;
    const free = M.slots(day, 45, now).find(s => s.free);
    const h = M.hold('live45', free.at, '  my question  ');
    assert(h && h.question === 'my question', 'hold');
    assert(!M.slots(day, 45, now).find(s => s.at === free.at).free, 'held slot still free');
    M.cancel(h.id); assert(M.bookings().length === 0, 'cancel');
    assert(M.signIn('   ') === null, 'blank name accepted');
    assert(M.signIn('  Sam ').name === 'Sam' && M.account().name === 'Sam', 'sign in');
    M.signOut(); assert(M.account() === null, 'sign out');
  }],
];
