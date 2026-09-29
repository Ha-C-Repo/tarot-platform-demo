/* spreads.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   The spreads the card pull offers.

   WORDS: position names and notes are short functional labels written for this demo, EXCEPT the
   Celtic Cross. Its position names, notes and the Significator rule are Waite's own words, verbatim
   from The Pictorial Key to the Tarot (1911), Part III section 7, via archive.sacred-texts.com
   (public domain; "--" and "shews" are his, as printed there). On a live site the reader replaces
   any demo note with their own writing.

   YES OR NO: upright answers yes, reversed answers no. That is one of the common one-card methods,
   and it is stated on the page. Nothing about the visitor or the question changes the draw. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const P = (name, note) => ({ name, note });
const ORD = ['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'];
const HOUSES = [
  ['Aries', 'Self, body, how you meet the world.'],
  ['Taurus', 'Money, possessions, what you value.'],
  ['Gemini', 'Talk, learning, siblings and neighbours.'],
  ['Cancer', 'Home, family, roots.'],
  ['Leo', 'Creativity, pleasure, romance, children.'],
  ['Virgo', 'Work routine, health, daily habits.'],
  ['Libra', 'Partners and close one-to-one relationships.'],
  ['Scorpio', 'Shared money, intimacy, endings and change.'],
  ['Sagittarius', 'Travel, study, belief.'],
  ['Capricorn', 'Career, reputation, direction.'],
  ['Aquarius', 'Friends, groups, hopes.'],
  ['Pisces', 'Rest, the hidden, what works behind the scenes.']
];

const WAITE = {
  url: 'https://archive.sacred-texts.com/tarot/pkt/pkt0307.htm',
  cite: 'A.E. Waite, The Pictorial Key to the Tarot (1911), Part III §7, An Ancient Celtic Method of Divination',
  significator: 'The Diviner first selects a card to represent the person or, matter about which inquiry is made. This card is called the Significator.'
};

NS.SPREADS = [
  { id: 'ppf', name: 'Past, present, future', n: 3, layout: 'row',
    blurb: 'Three cards: where the question came from, where it stands, where it is heading.',
    pos: [P('Past', 'What has shaped the question: the ground it grew from.'),
          P('Present', 'Where things stand now.'),
          P('Future', 'Where things are heading if nothing changes. A direction, not a sentence.')] },

  { id: 'one', name: 'One card', n: 1, layout: 'row',
    blurb: 'One card for the day, or for one clear question.',
    pos: [P('The card', 'One card to sit with today.')] },

  { id: 'yesno', name: 'Yes or no', n: 1, layout: 'row', yesno: true,
    blurb: 'Hold a question that can be answered yes or no, then pull one card.',
    rule: 'Upright answers yes, reversed answers no. That is one of the common ways to read a single card for a yes-or-no question, and the card’s meaning always says more than the word does.',
    pos: [P('The answer', 'A plain answer first, then the card’s meaning for the detail.')] },

  { id: 'soa', name: 'Situation, obstacle, advice', n: 3, layout: 'row',
    blurb: 'Three cards for a problem you are in the middle of.',
    pos: [P('Situation', 'Where things stand.'),
          P('Obstacle', 'What is in the way.'),
          P('Advice', 'What to try next.')] },

  { id: 'love', name: 'Love', n: 5, layout: 'love',
    blurb: 'Five cards for a relationship: one that is new, one that is going on, or one that has ended. It reads the situation. It does not change anyone’s mind.',
    pos: [P('You', 'Where you stand in this: what you bring and what you want.'),
          P('The connection', 'What is between you right now.'),
          P('Them', 'Where the other person stands, as far as the cards can show it.'),
          P('What stands between', 'What gets in the way, from either side.'),
          P('Where it can go', 'The direction it is taking. A direction, not a sentence.')] },

  { id: 'fullmoon', name: 'Full moon', n: 4, layout: 'row',
    blurb: 'Four cards for the full moon: what has come to a head, and what to let go of before it wanes.',
    moon: true,
    pos: [P('What has come to fullness', 'What this cycle has brought into the light.'),
          P('What to release', 'What to put down before the moon wanes.'),
          P('What to give thanks for', 'What is already going right.'),
          P('What to carry forward', 'What to take into the next new moon.')] },

  { id: 'zodiac', name: 'Zodiac houses', n: 12, layout: 'wheel',
    blurb: 'Twelve cards, one for each house, laid round the wheel the way a birth chart runs: starting on the left and going anticlockwise. Each house carries its natural sign.',
    pos: HOUSES.map(([sign, note], i) => P(`${ORD[i]} house · ${sign}`, note)) },

  { id: 'celtic', name: 'Celtic Cross', n: 10, layout: 'celtic', significator: true, waite: WAITE,
    blurb: 'Waite’s own ten-card method from 1911, which he calls the most suitable for a definite question. Choose a Significator first: it comes out of the deck and sits under the first card.',
    pos: [
      P('That covers him', 'This covers him. This card gives the influence which is affecting the person or matter of inquiry generally, the atmosphere of it in which the other currents work.'),
      P('What crosses him', 'This crosses him. It shews the nature of the obstacles in the matter. If it is a favourable card, the opposing forces will not be serious, or it may indicate that something good in itself will not be productive of good in the particular connexion.'),
      P('What crowns him', 'This crowns him. It represents (a) the Querent\'s aim or ideal in the matter; (b) the best that can be achieved under the circumstances, but that which has not yet been made actual.'),
      P('What is beneath him', 'This is beneath him. It shews the foundation or basis of the matter, that which has already passed into actuality and which the Significator has made his own.'),
      P('What is behind him', 'This is behind him. It gives the influence that is just passed, or is now passing away.'),
      P('What is before him', 'This is before him. It shews the influence that is coming into action and will operate in the near future.'),
      P('Himself', 'The first of these, or the SEVENTH CARD of the operation, signifies himself--that is, the Significator--whether person or thing-and shews its position or attitude in the circumstances.'),
      P('His house', 'The EIGHTH CARD signifies his house, that is, his environment and the tendencies at work therein which have an effect on the matter--for instance, his position in life, the influence of immediate friends, and so forth.'),
      P('His hopes or fears', 'The NINTH CARD gives his hopes or fears in the matter.'),
      P('What will come', 'The TENTH is what will come, the final result, the culmination which is brought about by the influences shewn by the other cards that have been turned up in the divination.')
    ] }
];
NS.spreadById = id => NS.SPREADS.find(s => s.id === id) || NS.SPREADS[0];
NS.yesNo = entry => (entry.reversed ? 'no' : 'yes');
})(window.TD);
