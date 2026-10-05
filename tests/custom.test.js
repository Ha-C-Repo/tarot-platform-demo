// Spreads the visitor makes: saved, cleaned, joined to the spread list, read by role, removable.
const load = require('./load');
const store = {};
const localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
const TD = load(['js/cards.js', 'js/data/correspondences.js', 'js/spreads.js', 'js/reading.js'], { localStorage }).TD, C = TD.customSpreads;
const assert = (c, msg) => { if (!c) throw new Error(msg); };
const builtIn = TD.SPREADS.length;

module.exports = [
  ['Save a new spread: it gets a my- id, joins the list, and keeps names, notes and roles', () => {
    const d = C.save({ id: undefined, name: '  Sunday  ', pos: [{ name: 'Now', role: 'present' }, { name: 'Block', role: 'obstacle', note: 'what stops me' }, { name: '', role: 'nonsense' }] });
    assert(d && /^my-[a-z0-9]+$/.test(d.id), 'id ' + (d && d.id));
    assert(d.name === 'Sunday' && d.pos[2].name === 'Card 3' && d.pos[2].role === '', 'cleaning');
    assert(TD.SPREADS.length === builtIn + 1, 'not in the list');
    const sp = TD.spreadById(d.id);
    assert(sp.custom && sp.n === 3 && sp.layout === 'row' && sp.roles.join() === 'present,obstacle,', 'spread object');
    assert(TD.reading.roleOf(sp, 0) === 'present' && TD.reading.roleOf(sp, 2) === 'card', 'roles');
  }],
  ['Editing keeps the id; six or more positions lay out as a grid; ten is the most', () => {
    const d = C.list()[0];
    const e = C.save({ id: d.id, name: 'Sunday two', pos: Array.from({ length: 14 }, (_, k) => ({ name: 'P' + k })) });
    assert(e.id === d.id && C.list().length === 1, 'edit made a copy');
    assert(e.pos.length === 10 && TD.spreadById(d.id).layout === 'grid', 'limit or layout');
  }],
  ['Reading it through walks a custom spread by its roles and names', () => {
    const sp = TD.spreadById(C.list()[0].id);
    const entries = TD.DECK.slice(0, sp.n).map(card => ({ card, reversed: false }));
    const R = TD.reading.compose(sp, entries);
    assert(R.walk.length === sp.n && R.walk[0].lead === 'P0', 'lead ' + R.walk[0].lead);
  }],
  ['Junk in storage is ignored; removing a spread takes it out of the list', () => {
    store[C.KEY] = JSON.stringify([{ id: '<x>', pos: [] }, { id: 'my-ok', name: 'Fine', pos: [{ name: 'A' }] }]);
    C.refresh();
    assert(TD.SPREADS.length === builtIn + 1 && TD.spreadById('my-ok').name === 'Fine', 'junk not ignored');
    C.remove('my-ok'); assert(TD.SPREADS.length === builtIn, 'not removed');
    assert(TD.spreadById('my-gone').id === 'ppf', 'missing spread falls back to the first');
  }],
];
