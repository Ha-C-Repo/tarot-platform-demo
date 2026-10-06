/* lenormand.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   The 36 cards of the Petit Lenormand, in their traditional order, with the playing-card inset most decks carry
   (from the 1799 Game of Hope by J. K. Hechtel). The card pictures on this site are original line drawings
   (js/data/lenormand-art.js), not scans. Keywords are the common modern sense of each card. Card 28 and card 29
   are the traditional significator cards; the visitor chooses which one stands for them. */
window.TD = window.TD || {};
window.TD.LENORMAND = [
  [1, 'rider', 'Rider', '9 of Hearts', 'news, a visitor, speed'],
  [2, 'clover', 'Clover', '6 of Diamonds', 'small luck, a brief chance'],
  [3, 'ship', 'Ship', '10 of Spades', 'travel, distance, trade'],
  [4, 'house', 'House', 'King of Hearts', 'home, family, security'],
  [5, 'tree', 'Tree', '7 of Hearts', 'health of body and spirit, growth, roots'],
  [6, 'clouds', 'Clouds', 'King of Clubs', 'confusion, doubt, passing trouble'],
  [7, 'snake', 'Snake', 'Queen of Clubs', 'complication, a detour, a rival'],
  [8, 'coffin', 'Coffin', '9 of Diamonds', 'an ending, a pause, closure'],
  [9, 'bouquet', 'Bouquet', 'Queen of Spades', 'a gift, pleasure, appreciation'],
  [10, 'scythe', 'Scythe', 'Jack of Diamonds', 'a sudden cut, a quick decision'],
  [11, 'whip', 'Whip', 'Jack of Clubs', 'conflict, repetition, effort'],
  [12, 'birds', 'Birds', '7 of Diamonds', 'talk, nerves, a pair'],
  [13, 'child', 'Child', 'Jack of Spades', 'a new start, something small, innocence'],
  [14, 'fox', 'Fox', '9 of Clubs', 'cunning, work, self-interest'],
  [15, 'bear', 'Bear', '10 of Clubs', 'strength, resources, a protector'],
  [16, 'stars', 'Stars', '6 of Hearts', 'hope, guidance, clarity'],
  [17, 'stork', 'Stork', 'Queen of Hearts', 'change, a move, improvement'],
  [18, 'dog', 'Dog', '10 of Hearts', 'a friend, loyalty, trust'],
  [19, 'tower', 'Tower', '6 of Spades', 'institutions, solitude, authority'],
  [20, 'garden', 'Garden', '8 of Spades', 'the public, gatherings, social life'],
  [21, 'mountain', 'Mountain', '8 of Clubs', 'an obstacle, delay, a challenge'],
  [22, 'crossroads', 'Crossroads', 'Queen of Diamonds', 'a choice, options, a fork'],
  [23, 'mice', 'Mice', '7 of Clubs', 'worry, loss by small degrees, erosion'],
  [24, 'heart', 'Heart', 'Jack of Hearts', 'love, affection, warmth'],
  [25, 'ring', 'Ring', 'Ace of Clubs', 'commitment, a contract, a cycle'],
  [26, 'book', 'Book', '10 of Diamonds', 'a secret, study, the unknown'],
  [27, 'letter', 'Letter', '7 of Spades', 'a message, a document, writing'],
  [28, 'man', 'Man', 'Ace of Hearts', 'the person asking, or a significant person'],
  [29, 'woman', 'Woman', 'Ace of Spades', 'the person asking, or a significant person'],
  [30, 'lily', 'Lily', 'King of Spades', 'peace, maturity, harmony'],
  [31, 'sun', 'Sun', 'Ace of Diamonds', 'success, energy, warmth'],
  [32, 'moon', 'Moon', '8 of Hearts', 'recognition, feelings, intuition'],
  [33, 'key', 'Key', '8 of Diamonds', 'a solution, certainty, an opening'],
  [34, 'fish', 'Fish', 'King of Diamonds', 'money, business, flow'],
  [35, 'anchor', 'Anchor', '9 of Spades', 'stability, perseverance, the long term'],
  [36, 'cross', 'Cross', '6 of Clubs', 'a burden, duty, meaning']
].map(([n, id, name, inset, keys]) => ({ n, id, name, inset, keys }));
