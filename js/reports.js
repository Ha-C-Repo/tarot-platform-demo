/* reports.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   The single-page reports served by report.html?r=<id>: their titles, cover cards, method notes and
   renderers. Each renderer reads the context from js/reportpage.js and the texts in natal-text.js and
   report-text.js. Load after reportpage.js. Listed on reports.html. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const S = lon => NS.SIGNS[Math.floor(((lon % 360) + 360) % 360 / 30)];
const P = (c, k) => c.planets.find(p => p.key === k);
const needTime = what => `<p class="note">${what} needs a birth time.</p>`;
const ELEMENTS = ['Fire', 'Earth', 'Air', 'Water'];
const topElement = em => ELEMENTS.slice().sort((a, b) => em.el[b] - em.el[a])[0];
const place = (H, c, k) => { const p = P(c, k), h = p.house ? ` &middot; ${H.ordinal(p.house)} house` : ''; return `${H.glyph(k)} ${k} in ${S(p.lon)}${h}${p.retro ? ' <span class="pill">retrograde</span>' : ''}`; };
/* A lens text for a planet's sign, or both possible signs when the Moon changed sign on a day with no birth time. */
function signLens(H, T, c, k, lens, title){
  const p = P(c, k);
  if (p.signUncertain) { const a = S(p.range[0]), b = S(p.range[1]);
    return H.block(`${title}: ${a} or ${b}`, `<p class="note">The ${k} changed sign that day; both readings follow and the birth time decides.</p><h4>${a}</h4>${H.para(T[`${lens}:${a}`])}<h4>${b}</h4>${H.para(T[`${lens}:${b}`])}`); }
  return H.block(`${title}: ${H.glyph(k)} ${k} in ${S(p.lon)}`, H.para(T[`${lens}:${S(p.lon)}`]));
}
const cusp = (ctx, n) => { const s = NS.factors.cuspSign(ctx.c, n); return s == null ? null : NS.SIGNS[s]; };

const REPORTS = {
  /* ---------------- Life Path: the thorough natal report ---------------- */
  lifepath: {
    title: 'Life path', kicker: 'A complete birth chart reading', card: 'major-21', caption: 'the card of the whole journey',
    lede: 'The most complete reading of your birth chart: the Big Three, every planet by sign and house, where each area of life draws its energy, the main aspects, your direction of growth, and the planets that work differently.',
    gv: 'Life Path, Merlin, Indra, Revelation, Personality Profile, Colloquial Style',
    method: 'Tropical zodiac, the house system last chosen on the Birth chart page (Placidus unless changed). House rulers use the traditional rulers. Out of bounds: a planet whose declination passes the Sun&rsquo;s greatest declination for the date (about 23.4&deg;), computed from Astronomy Engine and checked against Swiss Ephemeris to a tenth of an arcminute. Part of Fortune: Ascendant + Moon &minus; Sun by day, reversed by night.',
    render(ctx, H){
      const { c, T } = ctx, out = [], b3 = NS.natal.bigThree(c), ruler = NS.natal.chartRuler(c);
      out.push(H.chapter(1, 'The Big Three and your chart ruler', 'Sun, Moon and rising sign: the core self, the inner life and the way you meet the world.'),
        `<div class="grid g2" style="align-items:start">${c.angles ? H.block(`Rising sign: ${b3.rising}`, H.para(T['rising:' + b3.rising])
          + (ruler ? `<h4>Chart ruler: ${ruler.key} in ${S(ruler.lon)}, ${H.ordinal(ruler.house)} house</h4>` : '')) : H.block('Rising sign', needTime('The rising sign'))}
          ${H.block(place(H, c, 'Sun'), H.para(T['sign:Sun:' + b3.sun]))}
          ${b3.moon ? H.block(place(H, c, 'Moon'), H.para(T['sign:Moon:' + b3.moon])) : H.block(`${H.glyph('Moon')} Moon in ${b3.moonRange.join(' or ')}`, b3.moonRange.map(s => `<h4>${s}</h4>${H.para(T['sign:Moon:' + s])}`).join(''))}</div>`);
      out.push(H.chapter(2, 'Your planets, sign by sign and house by house', 'Mercury to Pluto. Uranus, Neptune and Pluto stay in a sign for years, so their sign is shared by your generation; their house is yours alone.'),
        H.items('The planets', H.ORDER.slice(2).map(k => { const p = P(c, k);
          return `<h3>${place(H, c, k)}</h3>${H.para(T[`sign:${k}:${S(p.lon)}`])}${p.house ? `<h4>In the ${H.ordinal(p.house)} house</h4>${H.para(T[`house:${k}:${p.house}`])}` : ''}`; })));
      const hr = NS.factors.houseRulers(c);
      out.push(H.chapter(3, 'Where each area of life draws its energy', 'Each house is ruled by the planet that rules the sign on its cusp. Where that planet sits shows where the area&rsquo;s energy goes.'),
        hr ? H.items('The twelve house rulers', hr.map(r => `<h4>House ${r.house} (${NS.SIGNS[r.sign]}) &rarr; ruler ${H.glyph(r.ruler)} ${r.ruler} in house ${r.in}</h4>${H.para(T[r.textKey])}`))
          : H.block('', needTime('Reading the house rulers')));
      const asp = H.aspects(ctx).filter(a => T[a.textKey]).slice(0, 10);
      out.push(H.chapter(4, 'The main aspects', 'Your ten closest aspects between planets, closest first.'),
        H.items('Aspects', asp.map(a => `<h4>${H.glyph(a.x)} ${a.x} ${a.glyph} ${a.type} ${H.glyph(a.y)} ${a.y} &middot; orb ${a.orb.toFixed(1)}&deg;</h4>${H.para(T[a.textKey])}`)));
      const n = ctx.nodes, f = ctx.fortune;
      out.push(H.chapter(5, 'Direction and ease: the North Node and the Part of Fortune', 'The North Node shows the direction that brings growth; the Part of Fortune, where things tend to go right.'),
        `<div class="grid g2" style="align-items:start">${H.block(`North Node in ${NS.SIGNS[n.nn.sign]}`, H.para(T[n.signKey]))}
          ${n.houseKey ? H.block(`North Node in the ${H.ordinal(n.nn.house)} house`, H.para(T[n.houseKey])) : ''}
          ${f ? H.block(`Part of Fortune in ${NS.SIGNS[f.sign]}, ${H.ordinal(f.house)} house`, H.para(T[f.keys[0]]) + H.para(T[f.keys[1]])) : H.block('Part of Fortune', needTime('The Part of Fortune'))}</div>`);
      const oob = NS.factors.outOfBounds(c).filter(x => T[x.textKey]);
      out.push(H.chapter(6, 'Planets that work differently', 'Retrograde at birth: worked inwardly, on a second pass. Out of bounds: beyond the Sun&rsquo;s reach, working by their own rules.'),
        H.items('Retrograde at birth', ctx.retro.map(r => `<h4>${H.glyph(r.key)} ${r.key}</h4>${H.para(T[r.textKey])}`), '<p class="note">No planet was retrograde when you were born.</p>'),
        H.items('Out of bounds', oob.map(x => `<h4>${H.glyph(x.key)} ${x.key} &middot; declination ${x.dec.toFixed(1)}&deg;</h4>${H.para(T[x.textKey])}`), '<p class="note">No planet was out of bounds when you were born.</p>'));
      const em = ctx.emphasis;
      out.push(H.chapter(7, 'The balance of your chart', `Fire ${em.el.Fire}, Earth ${em.el.Earth}, Air ${em.el.Air}, Water ${em.el.Water}; Cardinal ${em.mod.Cardinal}, Fixed ${em.mod.Fixed}, Mutable ${em.mod.Mutable} (of ten planets).`),
        H.items('Emphasis', em.keys.map(k => { const [kind, name, lvl] = k.split(':'); return `<h4>${kind === 'hemi' ? `Most planets in the ${name.toLowerCase()} half` : `${lvl === 'high' ? 'Strong' : 'Little'} ${name}`}</h4>${H.para(T[k])}`; }),
          '<p class="note">An even spread: no element or modality is unusually strong or missing.</p>'), H.disclaimerPlain);
      return out.join('');
    }
  },
  /* ---------------- Vocational guidance ---------------- */
  vocation: {
    title: 'Vocational guidance', kicker: 'A career and talents reading', card: 'major-01', caption: 'the card of skill put to work',
    lede: 'Work read from your birth chart: career direction, core strengths, daily working style, how you earn, where work feels hard, and the setting that suits you.',
    gv: 'Vocational Guidance',
    method: 'Career direction from the Midheaven&rsquo;s sign and planets in the 10th house; daily work from the 6th house; earning from the 2nd house (signs on the house cusps, so a birth time is needed for these); strengths from the Sun; working through difficulty from Saturn; the setting from your strongest element; the ruler of the 10th house shows where career energy goes.',
    render(ctx, H){
      const { c, T } = ctx, out = [], mc = c.angles ? S(c.angles.mc) : null;
      const p10 = c.timeKnown ? c.planets.filter(p => p.house === 10) : [];
      out.push(H.chapter(1, 'Career direction', 'The Midheaven is the top of the chart: the public role and reputation you grow into.'),
        mc ? H.block(`Midheaven in ${mc}`, H.para(T['voc:mc:' + mc])) : H.block('Midheaven', needTime('The Midheaven')),
        p10.length ? H.items('Planets in the 10th house', p10.map(p => `<h4>${H.glyph(p.key)} ${p.key}</h4>${H.para(T['voc:p10:' + p.key])}`)) : '');
      const r10 = c.cusps ? NS.factors.houseRulers(c)[9] : null;
      if (r10) out.push(H.block(`Where career energy goes: the 10th-house ruler, ${H.glyph(r10.ruler)} ${r10.ruler}, in house ${r10.in}`, H.para(T[r10.textKey])));
      out.push(H.chapter(2, 'Your core strength at work', 'The Sun: what you do best when it is fully yours.'), signLens(H, T, c, 'Sun', 'voc:sun', 'Core strength'));
      const h6 = cusp(ctx, 6), h2 = cusp(ctx, 2);
      out.push(H.chapter(3, 'Daily work and earning', 'The 6th house describes the working day; the 2nd, how you earn and what you value.'),
        `<div class="grid g2" style="align-items:start">${h6 ? H.block(`Daily work: 6th house in ${h6}`, H.para(T['voc:h6:' + h6])) : H.block('Daily work', needTime('The 6th house'))}
          ${h2 ? H.block(`Earning: 2nd house in ${h2}`, H.para(T['voc:h2:' + h2])) : H.block('Earning', needTime('The 2nd house'))}</div>`);
      out.push(H.chapter(4, 'Where work feels hard, and what discipline builds', 'Saturn marks the slow road to mastery.'), signLens(H, T, c, 'Saturn', 'voc:saturn', 'Saturn'));
      const el = topElement(ctx.emphasis);
      out.push(H.chapter(5, 'The setting that suits you', `Your strongest element is ${el} (${ctx.emphasis.el[el]} of ten planets).`), H.block(`A ${el} working life`, H.para(T['voc:elem:' + el])), H.disclaimerPlain);
      return out.join('');
    }
  },
  /* ---------------- Child ---------------- */
  child: {
    title: 'Child report', kicker: 'A birth chart reading for parents', card: 'major-19', caption: 'the card of childhood and joy', nameLabel: 'Child&rsquo;s name',
    lede: 'A reading for a parent about their child: temperament, who they are becoming, what comforts them, how they learn and play, and how they experience home.',
    gv: 'Child Report',
    method: 'Written to the parent. Temperament from the rising sign and home from the 4th house (both need a birth time); the Sun, Moon, Mercury and Mars by sign; the generation from the outer planets. It describes tendencies, never labels or predictions.',
    render(ctx, H){
      const { c, T } = ctx, out = [], who = /^you$/i.test(String(ctx.p.name).trim()) ? 'your child' : H.esc(ctx.p.name);
      out.push(H.chapter(1, 'Temperament: the first impression', `How ${who} meets new people and new places.`),
        c.angles ? H.block(`Rising sign: ${S(c.angles.asc)}`, H.para(T['child:rising:' + S(c.angles.asc)])) : H.block('Rising sign', needTime('The rising sign')));
      out.push(H.chapter(2, 'Who they are becoming', 'The Sun grows stronger with age.'), signLens(H, T, c, 'Sun', 'child:sun', 'The Sun'));
      out.push(H.chapter(3, 'Feelings and comfort', 'The Moon: what makes them feel safe.'), signLens(H, T, c, 'Moon', 'child:moon', 'The Moon'));
      out.push(H.chapter(4, 'Learning, play and energy', 'Mercury for learning and talk; Mars for energy, play and anger.'),
        `<div class="grid g2" style="align-items:start">${signLens(H, T, c, 'Mercury', 'child:mercury', 'Learning')}${signLens(H, T, c, 'Mars', 'child:mars', 'Energy')}</div>`);
      const h4 = cusp(ctx, 4);
      out.push(H.chapter(5, 'Home and parenting', 'The 4th house: how home feels from the inside.'), h4 ? H.block(`4th house in ${h4}`, H.para(T['child:h4:' + h4])) : H.block('Home', needTime('The 4th house')));
      out.push(H.chapter(6, 'Their generation', 'Uranus, Neptune and Pluto move slowly, so every child born within a few years shares their signs.'),
        H.items('The outer planets', ['Uranus', 'Neptune', 'Pluto'].map(k => `<h4>${H.glyph(k)} ${k} in ${S(P(c, k).lon)}</h4>${H.para(T[`sign:${k}:${S(P(c, k).lon)}`])}`)), H.disclaimerPlain);
      return out.join('');
    }
  },
  /* ---------------- Hidden messages: family patterns in love ---------------- */
  family: {
    title: 'Family patterns in love', kicker: 'A relationship-patterns reading', card: 'major-06', caption: 'the card of choice in love',
    lede: 'How the atmosphere of your early home shapes what feels familiar in love, the partner pattern your chart describes, and how to choose freely.',
    gv: 'Hidden Messages',
    method: 'Family atmosphere from the 4th house and partner pattern from the 7th house (signs on the cusps, so a birth time is needed); love style from Venus; the love-related aspects of Venus and the Moon; the North Node as the direction of free choice. No blame, no diagnosis.',
    render(ctx, H){
      const { c, T } = ctx, out = [], h4 = cusp(ctx, 4), h7 = cusp(ctx, 7);
      out.push(H.chapter(1, 'The family atmosphere', 'The 4th house: what home felt like, and so what feels like home.'),
        h4 ? H.block(`4th house in ${h4}`, H.para(T['hm:h4:' + h4])) : H.block('Family atmosphere', needTime('The 4th house')));
      out.push(H.chapter(2, 'What love learned to look like', 'Venus: how you give and receive affection.'), signLens(H, T, c, 'Venus', 'hm:venus', 'Venus'));
      out.push(H.chapter(3, 'The partner pattern', 'The 7th house: the qualities you look for in a partner, often ones you are still growing yourself.'),
        h7 ? H.block(`7th house (Descendant) in ${h7}`, H.para(T['hm:h7:' + h7])) : H.block('Partner pattern', needTime('The 7th house')));
      const asp = H.aspects(ctx).filter(a => T[a.textKey] && (/^(Venus|Moon)$/.test(a.x) || /^(Venus|Moon)$/.test(a.y))).slice(0, 5);
      out.push(H.chapter(4, 'Love patterns in your aspects', 'The closest aspects to Venus and the Moon.'),
        H.items('Aspects', asp.map(a => `<h4>${H.glyph(a.x)} ${a.x} ${a.glyph} ${a.type} ${H.glyph(a.y)} ${a.y} &middot; orb ${a.orb.toFixed(1)}&deg;</h4>${H.para(T[a.textKey])}`), '<p class="note">No close aspects to Venus or the Moon.</p>'));
      out.push(H.chapter(5, 'Choosing freely', 'The North Node: the direction that is new for you, in love as everywhere.'),
        H.block(`From ${NS.SIGNS[ctx.nodes.sn.sign]} toward ${NS.SIGNS[ctx.nodes.nn.sign]}`, H.para(T[ctx.nodes.signKey])), H.disclaimerPlain);
      return out.join('');
    }
  },
  /* ---------------- Chakras, stones and essences ---------------- */
  chakras: {
    title: 'Chakras, stones and essences', kicker: 'A reflective energy reading', card: 'major-14', caption: 'the card of balance and blending',
    lede: 'Your birth chart read through the seven chakras, with traditional stones, colours, Bach flower essences and affirmations for the planets that carry the most strain.',
    gv: 'Chakra Healing, Flower Essences and Gem',
    method: 'Chakras: one common modern Western mapping (Root Saturn and Pluto, Sacral Jupiter, Solar Plexus Mars, Heart Venus, Throat Mercury, Third Eye Moon and Uranus, Crown Sun and Neptune), scored by each planet&rsquo;s strength (angular, dignified, conjunct a light, well aspected); the two highest are strong, the two lowest quiet. Planets under strain: more squares and oppositions than trines and sextiles. Stones, colours and essences are traditions offered for reflection, never treatment.',
    render(ctx, H){
      const { c, T } = ctx, out = [], ch = ctx.chakras;
      out.push(H.chapter(1, 'Your chakra profile', 'All seven, strongest first.'),
        H.block('At a glance', `<table class="conv"><tr><th>Chakra</th><th>Planets</th><th>State</th></tr>${ch.slice().sort((a, b) => b.score - a.score).map(r => `<tr><td><b>${r.name}</b></td><td>${r.planets.join(', ')}</td><td>${r.state}</td></tr>`).join('')}</table>`),
        H.items('The seven chakras', ch.map(r => `<h4>${r.name} &middot; ${r.state}</h4>${H.para(T[r.textKey])}`)));
      const strained = ctx.st.filter(x => x.hard > x.soft).sort((a, b) => (b.hard - b.soft) - (a.hard - a.soft)).slice(0, 3);
      const list = strained.length ? strained : ctx.st.slice(-2);
      out.push(H.chapter(2, 'Planets under strain: essences, stones and affirmations', strained.length ? 'The planets with more hard aspects than easy ones.' : 'No planet has more hard aspects than easy ones; these are your two quietest planets.'),
        ...list.map(x => H.items(`${H.glyph(x.key)} ${x.key}`, [`<h4>Flower essence</h4>${H.para(T['essence:' + x.key])}`, `<h4>Stone and colour</h4>${H.para(T['gem:' + x.key])}`,
          `<h4>Affirmation</h4><p class="affirm">${H.esc(T['affirm:' + x.key] || '')}</p>`])));
      const b3 = NS.natal.bigThree(c);
      out.push(H.chapter(3, 'Affirmations for your Big Three', 'For meditation or journaling.'),
        H.block('', [['Sun in ' + b3.sun, b3.sun], b3.moon ? ['Moon in ' + b3.moon, b3.moon] : null, b3.rising ? ['Rising ' + b3.rising, b3.rising] : null].filter(Boolean)
          .map(([h, s]) => `<h4>${h}</h4><p class="affirm">${H.esc(T['affirm:' + s] || '')}</p>`).join('')),
        '<p class="note" style="margin-top:12px">Flower essences: Dr Edward Bach&rsquo;s 38, as he described them in the 1930s. Stones and colours: traditional planetary correspondences. Both are offered as focus points for reflection, not as treatment.</p>', H.disclaimerPlain);
      return out.join('');
    }
  }
};
NS.REPORTS = REPORTS;
})(window.TD);
