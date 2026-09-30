/* correspondences.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   Astrology, element and number for every card, attached to each card in TD.DECK as card.astro
   and card.number. Load after cards.js.

   SYSTEM: the Hermetic Order of the Golden Dawn's attributions (Book T, c. 1888, Mathers; the same
   tables in Crowley's 777, 1909), the system Waite and Pamela Colman Smith worked in when the
   1909 deck was made. Traditional attributions are shared knowledge; the wording here is our own.
   - Major Arcana: twelve signs, seven classical planets, three elements. The Fool, The Hanged Man
     and Judgement are the elemental cards (Air, Water, Fire); modern astrologers add Uranus,
     Neptune and Pluto to them, shown as a note. Planet cards carry no element of their own.
   - Pips Two to Ten: the 36 decans (10-degree thirds of a sign). Wands Two to Four are Aries, Five
     to Seven Leo, Eight to Ten Sagittarius; Cups are Cancer, Scorpio, Pisces; Swords Libra,
     Aquarius, Gemini; Pentacles Capricorn, Taurus, Virgo. The decan planets run in Chaldean order
     (Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon) starting from Mars at 0 degrees Aries.
     tests/deck.test.js checks every pip against that rule independently.
   - Aces: the root of their element, no sign.
   - Court cards: each King, Queen and Knight rules 30 degrees, from 20 degrees of one sign to 20
     degrees of the next. Golden Dawn titles map to this deck as the usual Rider-Waite-Smith reading
     does: Golden Dawn Knight (mounted, fire) = King here; Queen = Queen (water); Prince (air) =
     Knight here; Princess (earth) = Page here. Kings reach into the mutable sign of their element,
     Queens the cardinal, Knights the fixed. Pages rule no span of the zodiac.
   - Numbers: Major Arcana by the numbers printed on the 1909 cards (Strength 8, Justice 11, The Fool
     0); Ace 1, pips at face value; court cards carry no number.
   Some readers use other systems (planet elements for every Major, sign-per-court shortcuts); a live
   site states whichever the reader uses. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const SIGN_EL = ['Fire','Earth','Air','Water'];                  // Aries Fire, Taurus Earth, Gemini Air, Cancer Water, repeating
const signEl = s => SIGN_EL[SIGNS.indexOf(s) % 4];
const CHALDEAN = ['Saturn','Jupiter','Mars','Sun','Venus','Mercury','Moon'];
const SUIT_EL = { wands: 'Fire', cups: 'Water', swords: 'Air', pentacles: 'Earth' };

/* Major Arcana by number: sign, planet, or element. */
const MAJOR = [
  { el: 'Air', modern: 'Uranus' }, { planet: 'Mercury' }, { planet: 'Moon' }, { planet: 'Venus' },
  { sign: 'Aries' }, { sign: 'Taurus' }, { sign: 'Gemini' }, { sign: 'Cancer' }, { sign: 'Leo' },
  { sign: 'Virgo' }, { planet: 'Jupiter' }, { sign: 'Libra' }, { el: 'Water', modern: 'Neptune' },
  { sign: 'Scorpio' }, { sign: 'Sagittarius' }, { sign: 'Capricorn' }, { planet: 'Mars' },
  { sign: 'Aquarius' }, { sign: 'Pisces' }, { planet: 'Sun' }, { el: 'Fire', modern: 'Pluto' },
  { planet: 'Saturn', note: 'The Golden Dawn also gives this card to Earth.' }
];
/* Pips: the three signs each suit's Two to Ten pass through, in order. */
const PIP_SIGNS = { wands: ['Aries','Leo','Sagittarius'], cups: ['Cancer','Scorpio','Pisces'],
                    swords: ['Libra','Aquarius','Gemini'], pentacles: ['Capricorn','Taurus','Virgo'] };
/* Courts: the sign whose 20th degree starts the span (the span ends at 20 degrees of the next sign). */
const COURT_START = {
  wands:     { King: 'Scorpio',  Queen: 'Pisces',      Knight: 'Cancer' },
  cups:      { King: 'Aquarius', Queen: 'Gemini',      Knight: 'Libra' },
  swords:    { King: 'Taurus',   Queen: 'Virgo',       Knight: 'Capricorn' },
  pentacles: { King: 'Leo',      Queen: 'Sagittarius', Knight: 'Aries' }
};
const COURT_EL = { Page: 'Earth', Knight: 'Air', Queen: 'Water', King: 'Fire' };
const RANKS = ['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King'];

/* The planet ruling a decan: Chaldean order from Mars at 0 degrees Aries. d = 0..35 counted from Aries. */
const decanPlanet = d => CHALDEAN[(2 + d) % 7];

function astroFor(card){
  const [suit, num] = card.id.split('-'), n = parseInt(num, 10);
  if (suit === 'major') {
    const m = MAJOR[n];
    const a = { kind: 'major', sign: m.sign || null, planet: m.planet || null, modern: m.modern || null, note: m.note || null,
                el: m.el || (m.sign ? signEl(m.sign) : null) };
    a.label = m.sign ? `${m.sign} · ${a.el}` : m.planet ? m.planet : `${m.el} (modern astrologers add ${m.modern})`;
    return a;
  }
  const rank = RANKS[n - 1], el = SUIT_EL[suit];
  if (rank === 'Ace') return { kind: 'ace', el, sign: null, planet: null, label: `The root of ${el}: the element itself, no sign` };
  if (n <= 10) {
    const sign = PIP_SIGNS[suit][Math.floor((n - 2) / 3)], third = (n - 2) % 3;
    const planet = decanPlanet(SIGNS.indexOf(sign) * 3 + third);
    return { kind: 'pip', el, sign, planet, decan: third + 1, from: third * 10, to: third * 10 + 10,
             label: `${planet} in ${sign}, ${third * 10}° to ${third * 10 + 10}° · ${el}` };
  }
  const cel = COURT_EL[rank];
  if (rank === 'Page') return { kind: 'court', rank, el, courtEl: cel, sign: null, planet: null,
    label: `${cel} of ${el} · the Pages rule no span of the zodiac in this system` };
  const start = COURT_START[suit][rank], end = SIGNS[(SIGNS.indexOf(start) + 1) % 12];
  return { kind: 'court', rank, el, courtEl: cel, sign: end, span: [start, end], planet: null,
           label: `${cel} of ${el} · 20° ${start} to 20° ${end}` };
}
function numberFor(card){
  const [suit, num] = card.id.split('-'), n = parseInt(num, 10);
  return suit === 'major' ? n : n <= 10 ? n : null;
}

NS.DECK.forEach(c => { c.astro = astroFor(c); c.number = numberFor(c); });

NS.ASTRO = { SIGNS, CHALDEAN, SIGN_EL, signEl, decanPlanet,
  /* What each element brings to a reading, in plain words. */
  EL_MEANING: {
    Fire: 'drive, will and the urge to act',
    Water: 'feeling, closeness and intuition',
    Air: 'thought, words and decisions',
    Earth: 'the practical: body, money, work and time'
  },
  EL_MISSING: {
    Fire: 'energy may need to come from you rather than from events',
    Water: 'feelings may be under-heard in how this is being handled',
    Air: 'it may help to talk it through or write it down before deciding',
    Earth: 'plans may need grounding in time, money or a concrete next step'
  },
  /* Golden Dawn elemental dignities (Book T): opposites weaken each other (Fire and Water, Air and
     Earth); every other mix is friendly; the same element strengthens. */
  dignity(a, b){
    if (!a || !b) return null;
    if (a === b) return 'same';
    const opp = { Fire: 'Water', Water: 'Fire', Air: 'Earth', Earth: 'Air' };
    return opp[a] === b ? 'contrary' : 'friendly';
  },
  CONTRARY: {
    'Fire|Water': 'what you want and what you feel may pull in different directions',
    'Air|Earth': 'the idea and the practical limits need reconciling before either works'
  }
};
})(window.TD);
