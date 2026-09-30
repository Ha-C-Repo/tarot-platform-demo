// Correspondences (Golden Dawn astrology, elements, numbers) and the whole-spread reading.
const load = require('./load');
const store = {};
const localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
const w = load(['js/cards.js', 'js/data/correspondences.js', 'js/data/meanings.js', 'js/deck.js', 'js/spreads.js', 'js/reading.js'], { localStorage });
const TD = w.TD;
const assert = (c, msg) => { if (!c) throw new Error(msg); };
const card = id => TD.DECK.find(c => c.id === id);
const E = (id, reversed = false) => ({ card: card(id), reversed });

/* The Golden Dawn table as published (Book T; tabulated at davidcunliffe.com, "Tarot Astrological
   Correspondences of the Hermetic Order of the Golden Dawn"), typed in here independently of the
   rule the code uses. Pips Two to Ten: planet in sign. */
const PIPS = {
  wands:     'Mars Aries, Sun Aries, Venus Aries, Saturn Leo, Jupiter Leo, Mars Leo, Mercury Sagittarius, Moon Sagittarius, Saturn Sagittarius',
  cups:      'Venus Cancer, Mercury Cancer, Moon Cancer, Mars Scorpio, Sun Scorpio, Venus Scorpio, Saturn Pisces, Jupiter Pisces, Mars Pisces',
  swords:    'Moon Libra, Saturn Libra, Jupiter Libra, Venus Aquarius, Mercury Aquarius, Moon Aquarius, Jupiter Gemini, Mars Gemini, Sun Gemini',
  pentacles: 'Jupiter Capricorn, Mars Capricorn, Sun Capricorn, Mercury Taurus, Moon Taurus, Saturn Taurus, Sun Virgo, Venus Virgo, Mercury Virgo'
};
const MAJORS = 'Air Mercury Moon Venus Aries Taurus Gemini Cancer Leo Virgo Jupiter Libra Water Scorpio Sagittarius Capricorn Mars Aquarius Pisces Sun Fire Saturn'.split(' ');
/* Courts, this deck's titles: 20 degrees of the first sign to 20 degrees of the second. */
const COURTS = {
  wands:     { King: 'Scorpio Sagittarius', Queen: 'Pisces Aries',      Knight: 'Cancer Leo' },
  cups:      { King: 'Aquarius Pisces',     Queen: 'Gemini Cancer',     Knight: 'Libra Scorpio' },
  swords:    { King: 'Taurus Gemini',       Queen: 'Virgo Libra',       Knight: 'Capricorn Aquarius' },
  pentacles: { King: 'Leo Virgo',           Queen: 'Sagittarius Capricorn', Knight: 'Aries Taurus' }
};

module.exports = [
  ['Correspondences: all 78 cards match the published Golden Dawn table (majors, 36 decans, court spans)', () => {
    // Every card has one; only the seven planet cards of the Major Arcana have no element of their own.
    TD.DECK.forEach(c => assert(c.astro && c.astro.label && (c.astro.el || c.astro.planet), `${c.id}: no correspondence`));
    assert(TD.DECK.filter(c => !c.astro.el).length === 7, 'exactly the seven planet cards lack an element');
    MAJORS.forEach((v, n) => {
      const a = card('major-' + String(n).padStart(2, '0')).astro;
      assert(a.sign === v || a.planet === v || (a.el === v && !a.sign && !a.planet), `major ${n}: expected ${v}, got ${a.label}`);
    });
    Object.entries(PIPS).forEach(([suit, s]) => s.split(', ').forEach((pv, k) => {
      const [planet, sign] = pv.split(' '), a = card(`${suit}-${String(k + 2).padStart(2, '0')}`).astro;
      assert(a.planet === planet && a.sign === sign, `${suit} ${k + 2}: expected ${pv}, got ${a.label}`);
    }));
    const starts = [];
    Object.entries(COURTS).forEach(([suit, m]) => Object.entries(m).forEach(([rank, span]) => {
      const n = { Knight: 12, Queen: 13, King: 14 }[rank], a = card(`${suit}-${n}`).astro;
      assert(a.span && a.span.join(' ') === span, `${rank} of ${suit}: expected ${span}, got ${a.label}`);
      starts.push(a.span[0]);
    }));
    assert(new Set(starts).size === 12, 'court spans must tile the zodiac, one starting in each sign');
    ['wands', 'cups', 'swords', 'pentacles'].forEach(s => assert(!card(`${s}-11`).astro.sign && !card(`${s}-01`).astro.sign, `${s}: Page and Ace carry no sign`));
    return '22 majors, 36 decans, 12 court spans';
  }],
  ['Numbers: Majors as printed (Strength 8, Justice 11, Fool 0), Ace 1, pips face value, courts none', () => {
    assert(card('major-08').name === 'Strength' && card('major-08').number === 8, 'Strength 8');
    assert(card('major-11').name === 'Justice' && card('major-11').number === 11, 'Justice 11');
    assert(card('major-00').number === 0 && card('cups-01').number === 1 && card('swords-10').number === 10, 'Fool 0, Ace 1, Ten 10');
    ['11', '12', '13', '14'].forEach(n => assert(card('wands-' + n).number === null, 'court numbers'));
  }],
  ['Elemental dignities: opposites contrary, everything else friendly, same element strengthens', () => {
    const d = TD.ASTRO.dignity;
    assert(d('Fire', 'Water') === 'contrary' && d('Earth', 'Air') === 'contrary', 'contrary');
    assert(d('Fire', 'Air') === 'friendly' && d('Fire', 'Earth') === 'friendly' && d('Water', 'Air') === 'friendly', 'friendly');
    assert(d('Water', 'Water') === 'same' && d(null, 'Fire') === null, 'same / unknown');
  }],
  ['Repeated numbers and the spread total: worked examples', () => {
    const R = TD.reading;
    const a = R.angelNumbers([E('cups-03'), E('swords-03'), E('major-03')]);
    assert(a.length === 1 && a[0].pattern === '333', `three 3s = 333, got ${JSON.stringify(a)}`);
    const t1 = R.spreadTotal([E('cups-03'), E('swords-03'), E('major-03')]);
    assert(t1.sum === 9 && t1.card.name === 'The Hermit', '3+3+3 = 9, The Hermit');
    const t2 = R.spreadTotal([E('major-19'), E('major-21'), E('wands-10')]);
    assert(t2.sum === 50 && t2.steps.join() === '50,5' && t2.card.name === 'The Hierophant', '19+21+10 = 50, 5, The Hierophant');
    const t3 = R.spreadTotal([E('major-20'), E('cups-02'), E('cups-14')]);
    assert(t3.sum === 22 && t3.card.name === 'The Fool' && t3.master.includes(22) && t3.nums.length === 2, '20+2 = 22, The Fool, court left out');
    const t4 = R.spreadTotal([E('wands-12'), E('major-00')]);
    assert(t4 === null, 'no numbers to add: no total');
    assert(R.angelNumbers([E('cups-05'), E('wands-06')]).length === 0, 'no repeat, no angel number');
  }],
  ['Reading it through: every spread reads every position, with no gaps or em dashes', () => {
    const D = TD.deck;
    let lines = 0;
    TD.SPREADS.forEach(sp => {
      for (let rep = 0; rep < 200; rep++) {
        const cards = D.shuffleCards(D.fresh()).slice(0, sp.n), es = cards.map(D.entry);
        const R = TD.reading.compose(sp, es);
        assert(R.walk.length === sp.n, `${sp.id}: walk length`);
        const text = [...R.walk.flatMap(x => [x.lead, x.kw, x.card, x.astro]), ...R.thread.flatMap(x => [x.why, x.t]),
                      ...R.angel.map(x => x.pattern + x.meaning), R.total ? R.total.card.name : ''].join(' | ');
        assert(!/undefined|NaN|null|—/.test(text), `${sp.id}: bad text ${text.slice(0, 300)}`);
        R.walk.forEach(x => assert(x.lead && x.kw && x.card, `${sp.id}: empty line`));
        lines += R.walk.length + R.thread.length;
      }
    });
    return `${TD.SPREADS.length} spreads x 200 random reads, ${lines} lines`;
  }],
  ['Reading it through: time runs past to future (rising numbers, orientation turning, elements opposed)', () => {
    const sp = TD.spreadById('ppf');
    const up = TD.reading.thread(sp, [E('wands-01', true), E('cups-05'), E('swords-10')]);
    assert(up.some(t => /Numbers rise/.test(t.why)), 'Ace, Five, Ten rises');
    assert(up.some(t => /Reversed behind/.test(t.why)), 'reversed past, upright future');
    assert(up.some(t => /Fire against Water/.test(t.why)), 'Wands next to Cups are contrary');
    const down = TD.reading.thread(sp, [E('major-19'), E('major-10'), E('major-02', true)]);
    assert(down.some(t => /Numbers fall/.test(t.why)) && down.some(t => /Upright behind/.test(t.why)), 'falling, turning reversed');
    const leo = TD.reading.thread(sp, [E('major-08'), E('wands-05'), E('wands-06')]);
    assert(leo.some(t => /^Leo three times/.test(t.why)), 'Strength, Five and Six of Wands are all Leo');
    assert(leo.some(t => /^Fire leads/.test(t.why)), 'all Fire leads');
  }]
];
