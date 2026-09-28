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
