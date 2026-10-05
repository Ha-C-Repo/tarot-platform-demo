// The second deck: every card has its Marseille picture, and choosing the deck switches every image path.
const load = require('./load'), fs = require('fs'), path = require('path');
const assert = (c, msg) => { if (!c) throw new Error(msg); };
const root = path.join(__dirname, '..');
const withDeck = deck => { const store = { 'tarotdemo.brand': JSON.stringify({ deck }) };
  return load(['js/cards.js'], { localStorage: { getItem: k => store[k] || null, setItem(){} } }).TD; };

module.exports = [
  ['Marseille deck: 78 pictures on disk, one per card id, and the deck switch points every card at them', () => {
    const T = withDeck('marseille');
    assert(T.deckId === 'marseille', 'deck not chosen');
    T.DECK.forEach(c => { assert(c.img === 'assets/cards/marseille/' + c.id + '.jpg', c.id + ' path ' + c.img);
      assert(fs.statSync(path.join(root, c.img)).size > 10000, 'missing or tiny: ' + c.img); });
    assert(fs.readdirSync(path.join(root, 'assets/cards/marseille')).filter(f => f.endsWith('.jpg')).length === 78, 'extra files');
  }],
  ['Default and unknown deck values keep the 1909 pictures', () => {
    [withDeck(undefined), withDeck('nonsense')].forEach(T => {
      assert(T.deckId === 'rws', 'deck id'); assert(T.DECK.every(c => !c.img.includes('/marseille/') && fs.existsSync(path.join(root, c.img))), 'paths');
    });
  }],
  ['Each deck names its source in the credit line', () => {
    const T = withDeck('rws');
    assert(/Pamela Colman Smith/.test(T.DECKS.rws.credit) && /Biblioth.que nationale de France/.test(T.DECKS.marseille.credit), 'credits');
  }],
];
