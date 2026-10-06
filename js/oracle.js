/* oracle.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   Casting the I Ching and the runes, with the browser's cryptographic random generator. Load after
   js/data/iching.js and js/data/runes.js.

   I CHING, the three-coin method: three coins per line, heads 3 and tails 2. A total of 6 is an old (changing)
   broken line, 7 a young unbroken line, 8 a young broken line, 9 an old (changing) unbroken line. Lines are cast
   from the bottom up. Changing lines flip to give the second (relating) hexagram. Odds per line: 6 one in eight,
   7 three in eight, 8 three in eight, 9 one in eight, exactly as with real coins.
   RUNES: drawn without replacement from all 24, each face up or reversed with even odds; a rune that looks the
   same either way is always read upright. Nothing about the visitor changes the odds. */
window.TD = window.TD || {};
(function(NS){
'use strict';
function coin(){ const a = new Uint8Array(1); crypto.getRandomValues(a); return (a[0] & 1) ? 3 : 2; }
function cryptoInt(n){ const a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; let x; do { crypto.getRandomValues(a); x = a[0]; } while (x >= lim); return x % n; }

const byLines = lines => NS.HEXAGRAMS.find(h => h.lines.join('') === lines.join(''));
/* totals: six numbers (6-9), bottom first. Returns the primary and, if any line changes, the relating hexagram. */
function reading(totals){
  const lines = totals.map(t => (t === 7 || t === 9) ? 1 : 0);
  const changing = totals.map((t, k) => (t === 6 || t === 9) ? k : -1).filter(k => k >= 0);
  const primary = byLines(lines);
  const relating = changing.length ? byLines(lines.map((b, k) => changing.includes(k) ? 1 - b : b)) : null;
  /* Hexagrams 1 and 2 have a seventh text, read when all six lines change. */
  const allSix = changing.length === 6 && primary.legge.lines.length === 7;
  return { totals, lines, changing, primary, relating, allSix };
}
function castIChing(){ return reading(Array.from({ length: 6 }, () => coin() + coin() + coin())); }

function castRunes(n){
  const pool = NS.RUNES.slice(), out = [];
  for (let k = 0; k < n && pool.length; k++) {
    const r = pool.splice(cryptoInt(pool.length), 1)[0];
    out.push({ rune: r, reversed: !r.sym && cryptoInt(2) === 1 });
  }
  return out;
}
/* A rune drawn as line art, in the current text colour or the prism gradient. */
function runeSVG(r, opts = {}){
  const w = opts.size || 40;
  return `<svg viewBox="0 0 20 32" width="${w}" height="${w * 1.6}" aria-hidden="true" focusable="false" fill="none"
    stroke="${opts.stroke || 'currentColor'}" stroke-width="${opts.weight || 2}" stroke-linecap="round" stroke-linejoin="round"
    ${opts.reversed ? 'style="transform:rotate(180deg)"' : ''}><path d="${r.d}"/></svg>`;
}
/* A hexagram drawn bottom line last, so it reads top to bottom on the page; changing lines marked. */
function hexSVG(lines, opts = {}){
  const w = opts.size || 72, ch = opts.changing || [];
  const rows = lines.map((b, k) => {
    const y = 4 + (5 - k) * 10, mark = ch.includes(k);
    const bar = b ? `<path d="M4 ${y}H56"/>` : `<path d="M4 ${y}H26M34 ${y}H56"/>`;
    return bar + (mark ? `<circle cx="64" cy="${y}" r="2.6" fill="currentColor" stroke="none"/>` : '');
  }).join('');
  return `<svg viewBox="0 0 70 60" width="${w}" height="${w * 60 / 70}" aria-hidden="true" focusable="false" fill="none"
    stroke="${opts.stroke || 'currentColor'}" stroke-width="5" stroke-linecap="round">${rows}</svg>`;
}

/* ---------- rune spreads (2026-10-05) ----------
   one: a single rune. norns: the three Norns of Norse myth as past, present and what is owed. cross: five runes in a
   cross. cast: nine runes thrown onto a round cloth (see castCloth). Positions are a modern reading convention. */
const RUNE_SPREADS = [
  { id: 'one', name: 'One rune', n: 1, pos: [['Your rune', 'The heart of the matter, as it stands.']] },
  { id: 'norns', name: 'The three Norns', n: 3, pos: [['Urd: what has been', 'The past that shaped the question.'],
    ['Verdandi: what is becoming', 'What is unfolding now.'], ['Skuld: what is owed', 'Where things lead if nothing changes, and what is due.']] },
  { id: 'cross', name: 'Five-rune cross', n: 5, pos: [['The centre: the situation', 'Where you stand now.'], ['Left: what lies behind', 'The influence fading out.'],
    ['Right: what lies ahead', 'The influence coming in.'], ['Above: what helps', 'What to reach for.'], ['Below: what to release', 'What holds you back or needs facing.']] },
  { id: 'cast', name: 'Nine-rune cast', n: 9, pos: [] }
];
/* The cast: nine runes drawn without repeats and thrown onto a round cloth of radius 1. Each lands at a uniform
   random point of a disc of radius 1.1, so about one in six rolls off the cloth and is not read; each lands face
   up or face down with even odds (a rune stone is marked on one side), and face-down runes are not read. Face-up
   runes are read by where they lie: the heart (within 0.4 of the centre: what matters most now), around you (0.4
   to 0.75: what is near), at the edge (0.75 to 1: distant or background influences). */
const ZONES = [['heart', 0.4, 'At the heart', 'What matters most now.'], ['near', 0.75, 'Around you', 'What is close and active.'], ['edge', 1, 'At the edge', 'Background and distant influences.']];
function rand01(){ const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 4294967296; }
function castCloth(n = 9){
  return castRunes(n).map(x => {
    const r = 1.1 * Math.sqrt(rand01()), t = 2 * Math.PI * rand01();
    const z = r > 1 ? 'off' : ZONES.find(Z => r <= Z[1])[0];
    return Object.assign(x, { x: r * Math.cos(t), y: r * Math.sin(t), up: cryptoInt(2) === 1, zone: z });
  });
}
/* The rune of the day: drawn once per calendar day in this browser and kept, so it does not change on reload. */
function dailyRune(today, store){
  let s = null; try { s = JSON.parse(store.getItem('tarotdemo.dailyrune') || 'null'); } catch (e) {}
  if (s && s.d === today && Number.isInteger(s.i) && s.i >= 0 && s.i < NS.RUNES.length) return { rune: NS.RUNES[s.i], reversed: !NS.RUNES[s.i].sym && !!s.r, fresh: false };
  const x = castRunes(1)[0];
  try { store.setItem('tarotdemo.dailyrune', JSON.stringify({ d: today, i: NS.RUNES.indexOf(x.rune), r: x.reversed })); } catch (e) {}
  return Object.assign(x, { fresh: true });
}
/* A bind rune: two or three runes drawn over one another on a shared upright stave, the usual way they are made. */
function bindRuneSVG(runes, opts = {}){
  const w = opts.size || 90;
  return `<svg viewBox="0 0 20 32" width="${w}" height="${w * 1.6}" aria-hidden="true" focusable="false" fill="none"
    stroke="${opts.stroke || 'currentColor'}" stroke-width="${opts.weight || 1.6}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 2V30" opacity=".55"/>${runes.map(r => `<path d="${r.d}" transform="translate(${10 - stave(r)} 0)"/>`).join('')}</svg>`;
}
/* The x of a rune's vertical stave (the first full-height V line), so bind runes line up on one stave. */
function stave(r){ const m = r.d.match(/M(\d+(?:\.\d+)?) 2V30/) || r.d.match(/M(\d+(?:\.\d+)?) 30V2/); return m ? +m[1] : 10; }

/* ---------- astro dice ----------
   Three twelve-sided dice, as sold for astrological divination: a planet die (the ten planets and the two lunar
   nodes: WHAT is at work), a sign die (HOW it unfolds) and a house die (WHERE in life). Each face has even odds. */
const T = '︎';
const DICE_PLANETS = [['Sun', '☉'], ['Moon', '☽'], ['Mercury', '☿'], ['Venus', '♀' + T], ['Mars', '♂' + T], ['Jupiter', '♃'], ['Saturn', '♄'],
  ['Uranus', '♅'], ['Neptune', '♆'], ['Pluto', '♇'], ['North Node', '☊'], ['South Node', '☋']];
const DICE_SIGNS = [['Aries', '♈︎'], ['Taurus', '♉︎'], ['Gemini', '♊︎'], ['Cancer', '♋︎'], ['Leo', '♌︎'], ['Virgo', '♍︎'], ['Libra', '♎︎'], ['Scorpio', '♏︎'], ['Sagittarius', '♐︎'], ['Capricorn', '♑︎'], ['Aquarius', '♒︎'], ['Pisces', '♓︎']];   // each glyph carries U+FE0E (text presentation)
function rollDice(){ return { p: cryptoInt(12), s: cryptoInt(12), h: cryptoInt(12) + 1 }; }
const diceKeys = d => ({ p: 'dice:p:' + DICE_PLANETS[d.p][0].replace(' ', ''), s: 'dice:s:' + DICE_SIGNS[d.s][0], h: 'dice:h:' + d.h });

NS.oracle = { reading, castIChing, castRunes, runeSVG, hexSVG, byLines, RUNE_SPREADS, ZONES, castCloth, dailyRune, bindRuneSVG, stave, DICE_PLANETS, DICE_SIGNS, rollDice, diceKeys };
})(window.TD);
