// Card pictures: every card has a picture on disk, each deck credits its source, and only free decks are listed.
const load = require('./load'), fs = require('fs'), path = require('path');
const assert = (c, msg) => { if (!c) throw new Error(msg); };
const root = path.join(__dirname, '..');
const withDeck = deck => { const store = { 'tarotdemo.brand': JSON.stringify({ deck }) };
  return load(['js/cards.js'], { localStorage: { getItem: k => store[k] || null, setItem(){} } }).TD; };

module.exports = [
  ['1909 deck: a picture on disk for all 78 cards', () => {
    const T = withDeck(undefined);
    assert(T.deckId === 'rws', 'default deck');
    T.DECK.forEach(c => assert(fs.statSync(path.join(root, c.img)).size > 10000, 'missing or tiny: ' + c.img));
  }],
  ['An unknown or removed deck value falls back to the 1909 pictures', () => {
    ['marseille', 'nonsense'].forEach(d => { const T = withDeck(d); assert(T.deckId === 'rws' && T.DECK.every(c => !c.img.includes('/marseille/')), d); });
  }],
  ['One deck only, credited as public domain', () => {
    const T = withDeck('rws');
    assert(Object.keys(T.DECKS).join() === 'rws', 'extra deck listed');
    assert(/Public domain/.test(T.DECKS.rws.credit), 'credit');
  }],
];
