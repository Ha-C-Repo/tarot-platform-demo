/* cards.js — classic script; assigns to window.TD. No ES modules, so file:// works. */
window.TD = window.TD || {};
(function(NS){
'use strict';
/* cards.js — the 78-card deck.
   Keywords are traditional associations in common use, written fresh for this demo.
   They are NOT anyone's copyrighted interpretation text, and they are NOT the product:
   in a real build every card carries the reader's own writing. See the placeholder block
   rendered under each card. */

const MAJOR = [
  ['The Fool','beginnings, the leap, not knowing yet','hesitation, a leap taken blind'],
  ['The Magician','focus, resource, making the thing','scattered effort, talk without work'],
  ['The High Priestess','what you already know, quiet, the inside','ignoring the gut, secrets kept too long'],
  ['The Empress','abundance, care, the body, growing things','smothering, neglect of self'],
  ['The Emperor','structure, boundaries, the frame','rigidity, control that has stopped serving'],
  ['The Hierophant','tradition, teaching, the known road','dogma, rules outgrown'],
  ['The Lovers','choice, alignment, what you value','misalignment, a decision avoided'],
  ['The Chariot','drive, direction, holding the reins','forcing it, going nowhere fast'],
  ['Strength','patience, soft power, staying with it','self-doubt, force where patience belongs'],
  ['The Hermit','withdrawal, the lamp, one honest question','isolation, refusing counsel'],
  ['Wheel of Fortune','turning, timing, what is not yours to hold','resisting a turn already made'],
  ['Justice','consequence, clear sight, the balance','imbalance, accounts unsettled'],
  ['The Hanged Man','pause, the other angle, willing delay','stalling, martyrdom'],
  ['Death','ending, clearing, what comes after','clinging, a door held shut'],
  ['Temperance','blending, moderation, the long middle','excess, impatience with the process'],
  ['The Devil','attachment, the loop, what has a hold','seeing the chain, loosening it'],
  ['The Tower','sudden change, the false thing falling','delayed collapse, change resisted'],
  ['The Star','hope, repair, the quiet after','faith thin, looking away'],
  ['The Moon','fog, dream, not seeing straight yet','the fog lifting, confusion named'],
  ['The Sun','clarity, warmth, plain good','dimmed joy, clarity postponed'],
  ['Judgement','reckoning, the call, honest review','self-judgement, ignoring the call'],
  ['The World','completion, the whole circle, arrival','nearly there, a loop left open']
];
const SUITS = {
  wands:    { icon:'wands',     el:'Fire',  name:'Wands' },        // drawn symbols, js/icons.js
  cups:     { icon:'cups',      el:'Water', name:'Cups' },
  swords:   { icon:'swords',    el:'Air',   name:'Swords' },
  pentacles:{ icon:'pentacles', el:'Earth', name:'Pentacles' }
};
const PIPS = {
  wands:[['Ace','a spark, the first move','a spark not acted on'],
    ['Two','planning, the wider view','a plan stalled at the edge'],['Three','the wait after the work','delay, looking too far out'],
    ['Four','a good pause, home ground','a celebration postponed'],['Five','friction, useful noise','conflict avoided or overheated'],
    ['Six','recognition, the win seen','praise that rings hollow'],['Seven','holding your ground','worn down by defending'],
    ['Eight','speed, news, the rush','crossed wires, slowdown'],['Nine','tired and still standing','guarding against nothing'],
    ['Ten','carrying too much','putting some of it down'],['Page','curiosity, the new interest','a message that fizzles'],
    ['Knight','momentum, impatience, heat','recklessness, spinning wheels'],
    ['Queen','warmth with spine, sure of herself','self-doubt behind the confidence'],
    ['King','vision and the nerve to lead','dominance, a vision imposed']],
  cups:[['Ace','the heart opens, an offer','feeling held back'],
    ['Two','mutual, met halfway','imbalance, one doing the work'],['Three','friends, chorus, gladness','crowd without closeness'],
    ['Four','bored with what you have','the offer you finally notice'],['Five','grief over the spilled part','turning to see what is left standing'],
    ['Six','memory, sweetness, the old kindness','living in the old version'],['Seven','many options, none solid','choosing, fog clearing'],
    ['Eight','walking away on purpose','staying past the ending'],['Nine','contentment, the wish','satisfaction that does not satisfy'],
    ['Ten','the whole picture, belonging','a picture that looks right and is not'],
    ['Page','a tender message, the first feeling','sentiment without follow-through'],
    ['Knight','the romantic offer, the invitation','charm without substance'],
    ['Queen','deep feeling held steady','feeling that floods'],
    ['King','emotion under command, kindness with judgement','warmth withheld, moods ruling']],
  swords:[['Ace','the clear thought, the cut','clarity used as a weapon'],
    ['Two','stalemate, eyes covered','the blindfold comes off'],['Three','the hurt named plainly','the ache easing, the scab'],
    ['Four','rest, the necessary stop','rest refused'],['Five','winning badly','the cost of being right'],
    ['Six','moving to calmer water','carrying the trouble along'],['Seven','strategy, or something taken quietly','coming clean'],
    ['Eight','stuck by your own account of it','a rope loosening'],['Nine','the 3am thought','the thought in daylight, smaller'],
    ['Ten','the ending, fully done','slow recovery, the worst behind'],
    ['Page','watchfulness, a question asked','suspicion for its own sake'],
    ['Knight','fast, blunt, straight in','haste that breaks things'],
    ['Queen','clear sight, no comforting lies','coldness, cutting first'],
    ['King','judgement, principle, the ruling','logic without warmth']],
  pentacles:[['Ace','an opening, something solid','an opportunity not taken up'],
    ['Two','juggling, the working balance','dropping one on purpose'],['Three','craft, the team, doing it properly','mismatched effort'],
    ['Four','holding on, security','grip loosening, generosity'],['Five','the cold outside, scarcity felt','help visible through the window'],
    ['Six','give and take, fair exchange','strings attached'],['Seven','the long view, assessing the crop','impatience with slow growth'],
    ['Eight','practice, the repeated hour','going through the motions'],['Nine','self-made comfort, your own garden','comfort that isolates'],
    ['Ten','legacy, the long structure','inheritance complicated'],
    ['Page','study, the first real attempt','plans that stay plans'],
    ['Knight','steady, unglamorous, reliable','stuck in the groove'],
    ['Queen','practical care, the capable hand','over-giving, self last'],
    ['King','provision, mastery of the material','status mistaken for worth']]
};
const ROMAN = ['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII',
               'XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'];

const DECK = [];
MAJOR.forEach(([name,up,rev],i)=>DECK.push({
  id:`major-${String(i).padStart(2,'0')}`, name, arcana:'major', numeral:ROMAN[i],
  suit:null, element:null, up, rev,
  img:`assets/cards/major-${String(i).padStart(2,'0')}-${slug(name)}.jpg`
}));
Object.entries(PIPS).forEach(([suit,list])=>{
  list.forEach(([rank,up,rev],i)=>DECK.push({
    id:`${suit}-${String(i+1).padStart(2,'0')}`,
    name:`${rank} of ${SUITS[suit].name}`, arcana:'minor',
    numeral:rank==='Ace'?'A':(i<10?ROMAN[i+1]:rank[0]),
    suit, element:SUITS[suit].el, icon:SUITS[suit].icon, up, rev,
    img:`assets/cards/${suit}-${String(i+1).padStart(2,'0')}-${slug(rank)}.jpg`
  }));
});
function slug(s){ return s.toLowerCase().replace(/^the /,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }

/* One deck: the 1909 Rider-Waite-Smith pictures (Amanda, 2026-10-05: only free-to-use public-domain cards, no second deck option). */
const DECKS = {
  rws: { name: 'Rider-Waite-Smith (1909)',
    credit: 'Tarot card imagery: Rider-Waite-Smith, 1909, illustrations by Pamela Colman Smith. Public domain.' }
};
let deckId = 'rws';
try { const b = JSON.parse(localStorage.getItem('tarotdemo.brand') || '{}'); if (b && DECKS[b.deck]) deckId = b.deck; } catch (e) {}
if (DECKS[deckId].folder) DECK.forEach(c => { c.img = DECKS[deckId].folder + c.id + '.jpg'; });

/* Uniform draw without replacement, crypto-seeded. No weighting. No personalisation.
   This is deliberate: see HANDOFF-DEMO.md rule 2. */
function draw(n, seed){
  const idx = DECK.map((_,i)=>i);
  const rnd = seed === undefined ? cryptoRnd : mulberry32(seed);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, n).map(i => ({ card: DECK[i], reversed: rnd() < 0.5 }));
}
function cryptoRnd(){ const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 4294967296; }
function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0;
  let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
/* Stable per-day seed so a daily pull is the same on reload */
function daySeed(d = new Date()){
  return d.getFullYear()*10000 + (d.getMonth()+1)*100 + d.getDate();  // local day, so the pull turns over at the visitor's midnight
}


/* ---- Original card face, used when the 1909 scan is absent. ----
   This is our own decorative design: a frame, a pip layout for the numbered cards,
   a monogram for the courts, a numeral and emblem for the majors. It is NOT a
   reproduction of anyone's artwork. Drop the real scans into assets/cards/ and the
   <img> takes over automatically. */
const SUIT_TINT = { wands:'#FFA31A', cups:'#22D3EE', swords:'#A855F7', pentacles:'#B6F04A' };
const PIP_LAYOUT = {
  1:[[.5,.5]],
  2:[[.5,.22],[.5,.78]],
  3:[[.5,.2],[.5,.5],[.5,.8]],
  4:[[.3,.24],[.7,.24],[.3,.76],[.7,.76]],
  5:[[.3,.22],[.7,.22],[.5,.5],[.3,.78],[.7,.78]],
  6:[[.3,.2],[.7,.2],[.3,.5],[.7,.5],[.3,.8],[.7,.8]],
  7:[[.3,.2],[.7,.2],[.5,.35],[.3,.5],[.7,.5],[.3,.8],[.7,.8]],
  8:[[.3,.18],[.7,.18],[.5,.34],[.3,.46],[.7,.46],[.5,.66],[.3,.82],[.7,.82]],
  9:[[.3,.16],[.7,.16],[.3,.38],[.7,.38],[.5,.5],[.3,.62],[.7,.62],[.3,.84],[.7,.84]],
  10:[[.3,.14],[.7,.14],[.3,.34],[.7,.34],[.5,.24],[.5,.76],[.3,.66],[.7,.66],[.3,.86],[.7,.86]]
};

/* Drawn pips, so nothing depends on which emoji font a visitor happens to have. */
function pipPath(suit, x, y, k){
  const s = k, t = (a,b)=>`${(x+a*s).toFixed(1)},${(y+b*s).toFixed(1)}`;
  if (suit === 'cups')
    return `<path d="M ${t(-.5,-.55)} L ${t(.5,-.55)} L ${t(.36,.12)} Q ${t(0,.42)} ${t(-.36,.12)} Z
             M ${t(-.3,.5)} L ${t(.3,.5)} M ${t(0,.42)} L ${t(0,.5)}"
             fill="none" stroke="currentColor" stroke-width="${(s*.16).toFixed(2)}"
             stroke-linejoin="round" stroke-linecap="round"/>`;
  if (suit === 'swords')
    return `<path d="M ${t(0,-.62)} L ${t(.17,-.3)} L ${t(.1,.36)} L ${t(0,.5)} L ${t(-.1,.36)} L ${t(-.17,-.3)} Z
             M ${t(-.42,.3)} L ${t(.42,.3)} M ${t(0,.5)} L ${t(0,.64)}"
             fill="none" stroke="currentColor" stroke-width="${(s*.15).toFixed(2)}"
             stroke-linejoin="round" stroke-linecap="round"/>`;
  if (suit === 'wands')
    return `<path d="M ${t(0,.62)} L ${t(0,-.34)}
             M ${t(0,-.34)} q ${(-.3*s).toFixed(1)},${(-.14*s).toFixed(1)} ${(-.22*s).toFixed(1)},${(-.36*s).toFixed(1)}
             q ${(.28*s).toFixed(1)},${(.06*s).toFixed(1)} ${(.22*s).toFixed(1)},${(.36*s).toFixed(1)}
             M ${t(0,-.34)} q ${(.3*s).toFixed(1)},${(-.14*s).toFixed(1)} ${(.22*s).toFixed(1)},${(-.36*s).toFixed(1)}
             q ${(-.28*s).toFixed(1)},${(.06*s).toFixed(1)} ${(-.22*s).toFixed(1)},${(.36*s).toFixed(1)}"
             fill="none" stroke="currentColor" stroke-width="${(s*.16).toFixed(2)}"
             stroke-linecap="round" stroke-linejoin="round"/>`;
  // pentacles: circled five-point star
  const pts = [];
  for (let i = 0; i < 5; i++){
    const a = -Math.PI/2 + i * 4 * Math.PI / 5;
    pts.push(`${(x + Math.cos(a)*s*.42).toFixed(1)},${(y + Math.sin(a)*s*.42).toFixed(1)}`);
  }
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(s*.58).toFixed(1)}" fill="none"
            stroke="currentColor" stroke-width="${(s*.13).toFixed(2)}"/>
          <polygon points="${pts.join(' ')}" fill="none" stroke="currentColor"
            stroke-width="${(s*.13).toFixed(2)}" stroke-linejoin="round"/>`;
}

function cardFaceSVG(c){
  const tint = c.suit ? SUIT_TINT[c.suit] : '#FF2E88';
  const W = 200, H = 342, m = 11;
  let art = '';
  if (c.arcana === 'major') {
    // Numeral as the hero, with a drawn ring of rays. No per-card emblem, so nothing
    // depends on emoji availability.
    const rays = Array.from({length:16}, (_,i) => {
      const a = i * Math.PI / 8, r1 = 52, r2 = 60;
      return `<line x1="${(100+Math.cos(a)*r1).toFixed(1)}" y1="${(150+Math.sin(a)*r1).toFixed(1)}"
                    x2="${(100+Math.cos(a)*r2).toFixed(1)}" y2="${(150+Math.sin(a)*r2).toFixed(1)}"/>`;
    }).join('');
    art = `<g stroke="${tint}" stroke-opacity=".45" stroke-width="1.4" stroke-linecap="round">${rays}</g>
           <circle cx="100" cy="150" r="44" fill="none" stroke="${tint}" stroke-opacity=".3"/>
           <text x="100" y="166" text-anchor="middle" font-family="Anton,Impact,sans-serif"
                 font-size="${c.numeral.length > 3 ? 30 : c.numeral.length > 2 ? 38 : 46}"
                 fill="#F6F0FA" letter-spacing="1">${c.numeral}</text>`;
  } else {
    const n = parseInt(c.id.split('-')[1], 10);
    if (n <= 10) {
      const pts = PIP_LAYOUT[n] || [];
      const k = n === 1 ? 42 : n === 2 ? 30 : n === 3 ? 26 : n > 8 ? 15 : n > 6 ? 17 : 21;
      art = `<g color="${tint}" opacity=".95">` + pts.map(([x,y]) =>
        pipPath(c.suit, m + 16 + x * (W - 2*m - 32), 60 + y * 194, k)).join('') + `</g>`;
    } else {
      art = `<g color="${tint}" opacity=".95">${pipPath(c.suit, 100, 126, 40)}</g>
             <text x="100" y="212" text-anchor="middle" font-family="Anton,Impact,sans-serif"
                   font-size="34" fill="#F6F0FA" opacity=".92"
                   letter-spacing="2">${c.name.split(' ')[0].toUpperCase()}</text>`;
    }
  }
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" class="cfsvg" aria-hidden="true">
    <defs>
      <linearGradient id="bg-${c.id}" x1="0" y1="0" x2=".4" y2="1">
        <stop offset="0" stop-color="#241733"/><stop offset="1" stop-color="#120B1B"/></linearGradient>
      <radialGradient id="gl-${c.id}" cx="50%" cy="38%">
        <stop offset="0" stop-color="${tint}" stop-opacity=".18"/>
        <stop offset="1" stop-color="${tint}" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg-${c.id})"/>
    <rect width="${W}" height="${H}" fill="url(#gl-${c.id})"/>
    <rect x="${m}" y="${m}" width="${W-2*m}" height="${H-2*m}" rx="6" fill="none"
          stroke="${tint}" stroke-opacity=".38"/>
    <rect x="${m+4}" y="${m+4}" width="${W-2*m-8}" height="${H-2*m-8}" rx="4" fill="none"
          stroke="${tint}" stroke-opacity=".16"/>
    ${[[m,m],[W-m,m],[m,H-m],[W-m,H-m]].map(([x,y])=>
      `<circle cx="${x}" cy="${y}" r="3" fill="${tint}" opacity=".55"/>`).join('')}
    <line x1="${m+14}" y1="46" x2="${W-m-14}" y2="46" stroke="${tint}" stroke-opacity=".22"/>
    <line x1="${m+14}" y1="${H-52}" x2="${W-m-14}" y2="${H-52}" stroke="${tint}" stroke-opacity=".22"/>
    <text x="100" y="36" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="14"
          fill="${tint}" letter-spacing="3.5" opacity=".85">${c.arcana === 'major' ? 'ARCANUM' : c.suit.toUpperCase()}</text>
    ${art}
    <text x="100" y="${H-24}" text-anchor="middle" font-family="CormorantV,Georgia,serif"
          font-style="italic" font-size="19" fill="#F1E8F7">${c.name}</text>
  </svg>`;
}

/* Card face. Uses the real 1909 scan when present, otherwise the design above. */
function faceHTML(entry, opts = {}){
  const c = entry.card, rev = entry.reversed;
  return `<figure class="tc${rev?' rev':''}">
    <div class="tcface">
      <img src="${c.img}" alt="${c.name}" loading="lazy"
           onerror="this.closest('.tcface').classList.add('noimg');this.remove()">
      <div class="tcfall">${cardFaceSVG(c)}</div><span class="tcrevmark">\u21BA</span>
    </div>
    ${opts.caption === false ? '' : `<figcaption>
      <b>${c.name}</b>${rev?'<span class="revtag">Reversed</span>':''}
      <span class="kw">${rev ? c.rev : c.up}</span></figcaption>`}
  </figure>`;
}
NS.DECK = DECK;
NS.DECKS = DECKS;
NS.deckId = deckId;
NS.draw = draw;
NS.daySeed = daySeed;
NS.faceHTML = faceHTML;
})(window.TD);
