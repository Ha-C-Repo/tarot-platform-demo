/* numerology.js — Pythagorean. Life Path by reduce-components-first.
   Master numbers 11/22/33 preserved at every stage. Method is stated on the page. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const VAL = {a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,
             s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8};
const VOWELS = 'aeiou';
function reduce(n){
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((a,c)=>a + (+c), 0);
  }
  return n;
}
const digits = n => String(n).split('').reduce((a,c)=>a + (+c), 0);
function letters(name, filter){
  const s = name.toLowerCase().replace(/[^a-z]/g,'');
  let t = 0;
  for (const ch of s) {
    const isV = VOWELS.includes(ch);
    if (filter === 'v' && !isV) continue;
    if (filter === 'c' && isV) continue;
    t += VAL[ch] || 0;
  }
  return reduce(t);
}
NS.numerology = function(name, iso){
  const [y,m,d] = iso.split('-').map(Number);
  const rm = reduce(m), rd = reduce(digits(d)), ry = reduce(digits(y));
  const life = reduce(rm + rd + ry);
  const now = new Date();
  const py = reduce(reduce(m) + reduce(digits(d)) + reduce(digits(now.getFullYear())));
  return {
    lifePath: life, parts: {month: rm, day: rd, year: ry},
    expression: letters(name), soulUrge: letters(name,'v'), personality: letters(name,'c'),
    birthday: reduce(digits(d)), personalYear: py, calendarYear: now.getFullYear()
  };
};
/* Karmic numbers. Debt: 13, 14, 16 or 19 appearing as a step on the way to a core number (Life Path from
   its reduced components, the birth day itself, Expression / Soul Urge / Personality from the raw letter
   sums). Lessons: the digits 1-9 that no letter of the full name carries. Name is optional. */
const DEBT = [13, 14, 16, 19];
function chain(n){ const s = [n]; while (n > 9) { n = digits(n); s.push(n); } return s; }
function rawLetters(name, filter){
  let t = 0;
  for (const ch of String(name || '').toLowerCase().replace(/[^a-z]/g, '')) {
    const isV = VOWELS.includes(ch);
    if ((filter === 'v' && !isV) || (filter === 'c' && isV)) continue;
    t += VAL[ch];
  }
  return t;
}
NS.karmicNumbers = function(name, iso){
  const [y, m, d] = iso.split('-').map(Number);
  const sources = { lifePath: chain(reduce(m) + reduce(digits(d)) + reduce(digits(y))), birthday: chain(d) };
  const letters = String(name || '').toLowerCase().replace(/[^a-z]/g, '');
  if (letters) Object.assign(sources, { expression: chain(rawLetters(name)), soulUrge: chain(rawLetters(name, 'v')), personality: chain(rawLetters(name, 'c')) });
  const debts = [];
  Object.entries(sources).forEach(([where, steps]) => steps.forEach(n => { if (DEBT.includes(n)) debts.push({ n, where }); }));
  const have = new Set([...letters].map(ch => VAL[ch]));
  return { debts, lessons: letters ? [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => !have.has(n)) : null, hasName: !!letters };
};
/* Chaldean (Cheiro) planet for each number, the bridge the past-life reports use between the two systems. */
NS.NUMBER_PLANET = { 1: ['Sun'], 2: ['Moon'], 3: ['Jupiter'], 4: ['Uranus'], 5: ['Mercury'], 6: ['Venus'], 7: ['Neptune'], 8: ['Saturn'], 9: ['Mars'],
  11: ['Moon', 'Uranus'], 22: ['Uranus', 'Saturn'], 33: ['Venus', 'Neptune'] };
NS.DEBT_PLANET = { 13: ['Saturn'], 14: ['Mercury', 'Uranus'], 16: ['Pluto', 'Neptune'], 19: ['Sun'] };

/* Tarot birth cards, Mary K. Greer's method (Tarot for Your Self, 1984).
   Month + day + year as whole numbers, then add the digits; while the total is above 22, add its
   digits again. That number is the Personality card. Adding its digits gives the Soul card.
   22 is The Fool (numbered 0 on the card) and reduces to 4, The Emperor. 19 gives three cards,
   19, 10 and 1: The Sun, Wheel of Fortune and The Magician. Numbering follows the 1909 deck
   (Strength 8, Justice 11), the same as the card images on this site. */
NS.birthCards = function(iso){
  const [y, m, d] = iso.split('-').map(Number);
  const sum = m + d + y, steps = [sum];
  let n = digits(sum); steps.push(n);
  while (n > 22) { n = digits(n); steps.push(n); }
  const nums = [n];
  for (let k = n; k > 9; ) { k = digits(k); nums.push(k); }
  return { month: m, day: d, year: y, sum, steps, personality: n, soul: nums[nums.length - 1], nums,
           ids: nums.map(k => 'major-' + String(k === 22 ? 0 : k).padStart(2, '0')) };
};
NS.numMeaning = {
  1:'beginnings, self-direction, doing it first',
  2:'partnership, patience, the quiet half of things',
  3:'expression, company, making something visible',
  4:'structure, work, the foundation under it',
  5:'change, movement, refusing the narrow road',
  6:'care, responsibility, the people you carry',
  7:'study, solitude, wanting to know why',
  8:'authority, material stakes, consequence',
  9:'completion, service, letting go of the last round',
  11:'heightened intuition, a bigger ask than you wanted',
  22:'building at scale, the practical visionary',
  33:'teaching, care given at cost'
};
})(window.TD);
