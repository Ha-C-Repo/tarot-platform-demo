/* collective.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   Today's card for the collective: ONE card the reader chooses by hand each morning, the same for
   every visitor, with a few lines in the reader's own words. It is not random and not personal,
   which is the difference from the card pull.

   To post a new day on a live site, change these four values:
     card     a card id from js/cards.js, e.g. 'major-17' (The Star), 'cups-03', 'swords-14'
     reversed true or false
     posted   the date as 'YYYY-MM-DD', shown under the card; null hides the date
     message  the reader's words; empty shows the placeholder box instead */
window.TD = window.TD || {};
window.TD.COLLECTIVE = {
  card: 'major-17',
  reversed: false,
  posted: null,
  message: 'The Star for all of us today. Whatever the last stretch took out of you, this is the card of the breath after: rest, rinse off, and let something hopeful back in. Pour a little of what you have into someone who is running low. It comes back. (Sample message: the reader writes their own each morning.)'
};
