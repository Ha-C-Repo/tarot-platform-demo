/* reading.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   Reads a finished spread as one reading instead of card by card: each card in the light of its
   position, then what the cards say as a set. Load after cards.js, data/correspondences.js,
   deck.js and spreads.js.

   METHOD, all rule-based and the same for everyone who draws the same cards in the same places:
   1. Position by position: each position has a role (past, obstacle, advice, ...) and the card's
      own keywords are read in that role.
   2. Elements: the element that leads, any element missing (four cards or more), and the Golden
      Dawn elemental dignities between cards the spread pairs up (opposites weaken each other).
   3. Movement (spreads that run through time): whether the card numbers rise or fall, and whether
      the cards turn upright or reversed along the way.
   4. Astrology: a sign or planet that comes up more than once.
   5. Repeated numbers ("angel numbers"): two or more cards with the same number, read as 33, 333 ...
   6. The spread's total: all card numbers added, reduced while above 22, named as a Major Arcana card
      (22 is The Fool). Court cards carry no number. 11 and 22 are flagged as master numbers.
   Wording is written for this demo; a live site replaces it with the reader's own. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const A = () => NS.ASTRO;

/* Each spread position's role, by spread id. */
const ROLES = {
  ppf: ['past', 'present', 'future'],
  soa: ['present', 'obstacle', 'advice'],
  love: ['self', 'connection', 'other', 'obstacle', 'outcome'],
  fullmoon: ['culmination', 'release', 'gratitude', 'carry'],
  celtic: ['present', 'obstacle', 'aim', 'foundation', 'past', 'future', 'self', 'environment', 'hopes', 'outcome']
};
const ROLE_LEAD = {
  past: 'What brought you here', present: 'Where things stand', future: 'Where it is heading if nothing changes',
  obstacle: 'What is in the way', advice: 'What to try', self: 'What you bring', connection: 'What is between you',
  other: 'What they bring, as far as the cards show', outcome: 'Where it can go',
  culmination: 'What has come to fullness', release: 'What to let go of', gratitude: 'What to be thankful for',
  carry: 'What to carry forward', aim: 'What you are reaching for', foundation: 'What is already underneath it',
  environment: 'What is around you', hopes: 'Your hopes or fears'
};
function roleOf(sp, k){ return (ROLES[sp.id] || [])[k] || (sp.id === 'zodiac' ? 'house' : 'card'); }

/* The card's own keywords, first two phrases, for the orientation it came up in. */
function kw(e){ return (e.reversed ? e.card.rev : e.card.up).split(',').slice(0, 2).map(s => s.trim()).join(', '); }
function nameOf(e){ return e.card.name + (e.reversed ? ', reversed' : ''); }
function list(xs){ return xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1]; }
const TIMES = ['', 'once', 'twice', 'three times', 'four times', 'five times'];

/* Repeated numbers. */
const ANGEL = {
  1: 'a fresh start that is asking for your own first move',
  2: 'balance and partnership, and patience with timing',
  3: 'expression and support: say it, share it, let people help',
  4: 'steady ground: the work you have put in is holding',
  5: 'change on the way, and a reason to stay flexible',
  6: 'care for home and close ties, yourself included',
  7: 'reflection: what you learn by slowing down can be trusted',
  8: 'effort meeting results, with the responsibility that comes with it',
  9: 'a chapter completing, and room being cleared for the next',
  10: 'one cycle closing as the next begins a step higher'
};
function angelNumbers(entries){
  const by = {};
  entries.forEach(e => { const n = e.card.number; if (n) (by[n] = by[n] || []).push(e); });
  return Object.keys(by).map(Number).filter(n => by[n].length >= 2).sort((a, b) => a - b).map(n => ({
    n, count: by[n].length, pattern: String(n).repeat(by[n].length), cards: by[n].map(e => e.card.name), meaning: ANGEL[n]
  }));
}

/* The spread's total, reduced to a Major Arcana card. */
const digits = n => String(n).split('').reduce((s, d) => s + +d, 0);
function spreadTotal(entries){
  const nums = entries.map(e => e.card.number).filter(n => n != null);
  const sum = nums.reduce((s, n) => s + n, 0);
  if (!sum) return null;
  const steps = [sum];
  let n = sum;
  while (n > 22) { n = digits(n); steps.push(n); }
  const card = NS.DECK.find(c => c.id === 'major-' + String(n === 22 ? 0 : n).padStart(2, '0'));
  return { nums, sum, steps, n, card, master: steps.filter(s => s === 11 || s === 22) };
}

/* Everything the reading says about the spread as a set. Returns [{why, t}]. */
function thread(sp, entries){
  const out = [], X = A(), n = entries.length;
  const els = entries.map(e => e.card.astro && e.card.astro.el).filter(Boolean);

  // Elements that lead, and elements missing.
  const tally = {};
  els.forEach(el => tally[el] = (tally[el] || 0) + 1);
  const lead = Object.keys(tally).filter(el => tally[el] * 2 > n);
  lead.forEach(el => out.push({ why: `${el} leads, ${tally[el]} of ${n} cards`, t: `The reading is weighted toward ${X.EL_MEANING[el]}.` }));
  if (n >= 4) {
    const missing = ['Fire', 'Water', 'Air', 'Earth'].filter(el => !tally[el]);
    if (missing.length && missing.length < 3)
      missing.forEach(el => out.push({ why: `No ${el}`, t: `With no ${el} in the spread, ${X.EL_MISSING[el]}.` }));
  }

  // Elemental dignities between the positions the spread reads together.
  const pairs = NS.spreadPairs(sp).filter(([i, j]) => entries[i] && entries[j]);
  const contrary = [];
  let friendly = 0, known = 0;
  pairs.forEach(([i, j]) => {
    const a = entries[i].card.astro.el, b = entries[j].card.astro.el, d = X.dignity(a, b);
    if (!d) return;
    known++;
    if (d === 'contrary') contrary.push([i, j, a, b]); else friendly++;
  });
  contrary.slice(0, 2).forEach(([i, j, a, b]) => {
    const why = X.CONTRARY[a === 'Fire' || b === 'Fire' ? 'Fire|Water' : 'Air|Earth'];
    out.push({ why: `${sp.pos[i].name} + ${sp.pos[j].name}: ${a} against ${b}`,
      t: `${entries[i].card.name} and ${entries[j].card.name} sit on opposite elements, which weaken each other, so ${why}. Neither card is wrong; the work is in holding both.` });
  });
  if (known >= 2 && !contrary.length && friendly === known)
    out.push({ why: 'No opposing elements', t: 'Every pair of cards read together is on friendly elemental terms, so the cards support one another rather than pulling apart.' });

  // Movement through time: numbers rising or falling, orientation turning.
  const R = ROLES[sp.id] || [], ip = R.indexOf('past'), inow = R.indexOf('present'), ifut = R.indexOf('future');
  if (ip >= 0 && ifut >= 0 && entries[ip] && entries[ifut]) {
    const seq = [ip, inow, ifut].filter(k => k >= 0 && entries[k]).map(k => entries[k]);
    const nums = seq.map(e => e.card.number);
    if (nums.every(x => x != null) && seq.length === 3) {
      if (nums[0] < nums[1] && nums[1] < nums[2])
        out.push({ why: `Numbers rise, ${nums.join(' to ')}`, t: 'The card numbers climb from past to future: something is building, stage by stage.' });
      else if (nums[0] > nums[1] && nums[1] > nums[2])
        out.push({ why: `Numbers fall, ${nums.join(' to ')}`, t: 'The card numbers drop from past to future: something is winding down or returning to basics, which can be a relief as much as a loss.' });
    }
    const p = entries[ip].reversed, f = entries[ifut].reversed;
    if (p && !f) out.push({ why: 'Reversed behind, upright ahead', t: 'What was blocked or turned inward in the past opens up by the future card: the direction is toward release.' });
    if (!p && f) out.push({ why: 'Upright behind, reversed ahead', t: 'The past card flowed and the future card is reversed: watch for momentum stalling, and give it attention early rather than late.' });
  }

  // Astrology: a sign or planet that comes up more than once.
  const bySign = {}, byPlanet = {};
  entries.forEach(e => {
    const a = e.card.astro; if (!a) return;
    if (a.sign) (bySign[a.sign] = bySign[a.sign] || []).push(e.card.name);
    if (a.planet) (byPlanet[a.planet] = byPlanet[a.planet] || []).push(e.card.name);
  });
  Object.keys(bySign).filter(s => bySign[s].length >= 2).forEach(s => out.push({
    why: `${s} ${TIMES[bySign[s].length] || bySign[s].length + ' times'}`,
    t: `${list(bySign[s])} ${bySign[s].length === 2 ? "both" : "all"} fall in ${s}, ${X.signEl(s) === "Air" || X.signEl(s) === "Earth" ? "an" : "a"} ${X.signEl(s)} sign: its themes are underlined in this reading.` }));
  Object.keys(byPlanet).filter(p => byPlanet[p].length >= 2).forEach(p => out.push({
    why: `${p} ${TIMES[byPlanet[p].length] || byPlanet[p].length + ' times'}`,
    t: `${list(byPlanet[p])} share ${p}: the same planetary note sounds more than once.` }));
  return out;
}

/* The whole reading for a finished (or partly finished) spread. entries = st.table.map(deck.entry). */
function compose(sp, entries){
  const walk = entries.map((e, k) => {
    const role = roleOf(sp, k);
    const lead = role === 'house' ? sp.pos[k].name : role === 'card' ? sp.pos[k].name : ROLE_LEAD[role];
    return { k, role, lead, card: nameOf(e), kw: kw(e), astro: e.card.astro ? e.card.astro.label : '', number: e.card.number };
  });
  return { walk, thread: thread(sp, entries), angel: angelNumbers(entries), total: spreadTotal(entries) };
}

NS.reading = { ROLES, ROLE_LEAD, ANGEL, roleOf, compose, thread, angelNumbers, spreadTotal };
})(window.TD);
