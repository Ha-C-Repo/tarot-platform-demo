// The reading journal: save, note, delete, stats, and a backup that round-trips and refuses junk.
const load = require('./load');
const store = {};
const localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
const w = load(['js/cards.js', 'js/journal.js'], { localStorage });
const J = w.TD.journal;
const assert = (c, msg) => { if (!c) throw new Error(msg); };
const reset = () => Object.keys(store).forEach(k => delete store[k]);
const reading = (cards, extra) => Object.assign({ spread: 'ppf', focus: 'general', cards: cards.map(([i, r]) => ({ i, r })) }, extra);

module.exports = [
  ['Saves a reading, newest first, with question and note', () => {
    reset();
    const a = J.add(reading([[0, false], [1, true], [2, false]], { question: 'Should I move?', at: 1000 }));
    const b = J.add(reading([[21, false]], { spread: 'one', at: 2000 }));
    assert(a && b, 'add returned null');
    const L = J.list();
    assert(L.length === 2 && L[0].id === b.id, 'not newest first');
    assert(L[1].question === 'Should I move?', 'question lost');
    J.update(a.id, { note: 'I moved.', cards: [], spread: 'celtic' });
    const a2 = J.get(a.id);
    assert(a2.note === 'I moved.', 'note not saved');
    assert(a2.cards.length === 3 && a2.spread === 'ppf', 'update must not change the cards or spread');
    assert(J.remove(a.id) && J.list().length === 1, 'remove');
  }],
  ['Refuses bad entries', () => {
    reset();
    assert(J.add(reading([[78, false]])) === null, 'card 78 accepted');
    assert(J.add(reading([])) === null, 'empty reading accepted');
    assert(J.add(reading(Array.from({ length: 13 }, (_, i) => [i, false]))) === null, '13 cards accepted');
    const e = J.add(reading([[5, 1]], { focus: 'nonsense', question: 'x'.repeat(900) }));
    assert(e.focus === 'general' && e.question.length === 300 && e.cards[0].r === true, 'fields not cleaned');
  }],
  ['Stats count suits, Majors, reversals and repeats', () => {
    reset();
    for (let k = 0; k < 4; k++) J.add(reading([[0, k % 2 === 1], [22, false], [36, false]]));   // Fool x4
    const S = J.stats(J.list());
    assert(S.readings === 4 && S.cards === 12, 'counts');
    assert(S.majors === 4 && S.reversed === 2, `majors ${S.majors} reversed ${S.reversed}`);
    const suitTotal = Object.values(S.suits).reduce((a, b) => a + b, 0);
    assert(suitTotal === 8, 'suits ' + suitTotal);
    assert(S.top[0].i === 0 && S.top[0].n === 4 && S.top[0].rev === 2, 'top card');
    assert(S.repeat.some(x => x.i === 0), 'repeat not flagged');
  }],
  ['Backup round-trips and merges without duplicates', () => {
    reset();
    J.add(reading([[3, false]], { note: 'keep me' }));
    J.add(reading([[4, true]]));
    const text = J.exportText();
    reset();
    let r = J.importText(text);
    assert(r.ok && r.added === 2, 'first import ' + JSON.stringify(r));
    r = J.importText(text);
    assert(r.ok && r.added === 0 && r.skipped === 2, 'second import must add nothing');
    assert(J.list().some(e => e.note === 'keep me'), 'note lost in backup');
  }],
  ['Backup import refuses junk and strips unknown fields', () => {
    reset();
    assert(!J.importText('not json').ok, 'non-JSON accepted');
    assert(!J.importText('{"entries":[]}').ok, 'file without format accepted');
    const evil = JSON.stringify({ format: 'tarotdemo.journal', entries: [
      { id: '<img src=x>', at: 1, spread: 'ppf', cards: [{ i: 1 }] },
      { id: 'ok-1', at: 1, spread: 'ppf', cards: [{ i: 1, r: true }], extra: 'drop me', note: 7 }] });
    const r = J.importText(evil);
    assert(r.ok && r.added === 1 && r.skipped === 1, JSON.stringify(r));
    const e = J.list()[0];
    assert(!('extra' in e) && e.note === '', 'unknown field kept or note not a string');
  }],
  ['Storage blocked: add returns null, list is empty, nothing throws', () => {
    const blocked = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    const w2 = load(['js/cards.js', 'js/journal.js'], { localStorage: blocked });
    assert(w2.TD.journal.list().length === 0, 'list');
    assert(w2.TD.journal.add(reading([[1, false]])) === null, 'add');
  }],
];
