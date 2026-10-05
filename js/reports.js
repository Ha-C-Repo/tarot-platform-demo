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
/* Planets within 8 degrees of an angle of a chart: [{key, angle: 'ASC'|'DSC'|'MC'|'IC', orb}] */
function angular(ch){
  if (!ch.angles) return [];
  const A = { ASC: ch.angles.asc, DSC: ch.angles.asc + 180, MC: ch.angles.mc, IC: ch.angles.mc + 180 }, out = [];
  ch.planets.forEach(p => { Object.entries(A).forEach(([k, l]) => { const o = NS.separation(p.lon, l); if (o <= 8) out.push({ key: p.key, angle: k, orb: o }); }); });
  return out.sort((a, b) => a.orb - b.orb);
}
const ANGLE_NAME = { ASC: 'rising (Ascendant)', DSC: 'setting (Descendant)', MC: 'overhead (Midheaven)', IC: 'below (IC)' };
/* Where the person is now (return charts) or the place to read (relocation); the birth place when not given. */
const herePlace = (ctx, which) => { const p = ctx.p[which]; return p && p.lat != null ? p : { lat: ctx.p.input.lat, lon: ctx.p.input.lon, tz: ctx.p.input.tz, name: 'the birth place' }; };
const placeName = pl => { try { return NS.places && pl.cc !== undefined ? NS.places.label(pl) : pl.name; } catch (e) { return pl.name; } };
const DAYMS = 864e5, YEARMS = 365.2422 * DAYMS;
const fmtDate = d => d.toISOString().slice(0, 10);
const sinceBirthday = c => { /* the solar-return year in force today: last birthday's year */
  const now = new Date(), b = c.utc; let y = now.getUTCFullYear();
  if (Date.UTC(y, b.getUTCMonth(), b.getUTCDate()) > +now) y -= 1;
  return y;
};

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
/* ---------------- W3: forecasts ---------------- */
Object.assign(REPORTS, {
  solarreturn: {
    title: 'Solar return', kicker: 'The year ahead, birthday to birthday', card: 'major-19', caption: 'the card of the Sun&rsquo;s return', needs: 'now', group: 'time',
    lede: 'The year from your last birthday to your next, read from the chart of the exact moment the Sun returned to its birth degree, cast for where you are.',
    gv: 'Solar Return, Poppe Solar Return',
    method: 'The solar return is the moment the Sun comes back to its exact birth longitude, found to the second, and the chart is cast for the place you name as where you are (solar returns are read for where you spend the birthday). Placidus houses. The year in force is the one that began at your most recent birthday. The overlay places the return Ascendant in your natal houses.',
    render(ctx, H){
      const { c, T } = ctx, out = [], y = sinceBirthday(c), here = herePlace(ctx, 'now');
      const sr = NS.tools.solarReturn(c, y, here, 'placidus'), asc = S(sr.angles.asc), mc = S(sr.angles.mc), sun = P(sr, 'Sun'), moon = P(sr, 'Moon');
      const ovl = c.angles ? NS.houseOf(sr.angles.asc, c.angles.asc, c.system, c.cusps) : null;
      out.push(H.chapter(1, `The tone of the year: ${y} to ${y + 1}`, `Return on ${sr.utc.toISOString().slice(0, 16).replace('T', ' ')} UTC, cast for ${H.esc(placeName(here))}.`),
        `<div class="grid g2" style="align-items:start">${H.block(`Rising sign of the year: ${asc}`, H.para(T['sr-asc:' + asc]))}
          ${H.block(`The year&rsquo;s aim: Midheaven in ${mc}`, H.para(T['sr-mc:' + mc]))}</div>`,
        ovl ? H.block(`Where the year starts from: the return Ascendant in your natal ${H.ordinal(ovl)} house`, H.para(T['sr-overlay:' + ovl])) : '');
      out.push(H.chapter(2, 'The focus and the mood', 'The Sun&rsquo;s house is where the year&rsquo;s energy goes; the Moon sets its emotional tone.'),
        `<div class="grid g2" style="align-items:start">${H.block(`The focus: Sun in the ${H.ordinal(sun.house)} house`, H.para(T['sr-sun:' + sun.house]))}
          ${H.block(`The mood: Moon in ${S(moon.lon)}, ${H.ordinal(moon.house)} house`, H.para(T['sr-moon:' + S(moon.lon)]) + H.para(T['sr-moonh:' + moon.house]))}</div>`);
      const ang = angular(sr).filter((x, i, a) => a.findIndex(z => z.key === x.key) === i);
      out.push(H.chapter(3, 'Loud planets this year', 'Planets within 8&deg; of an angle of the return chart.'),
        H.items('On the angles', ang.map(x => `<h4>${H.glyph(x.key)} ${x.key} ${ANGLE_NAME[x.angle]} &middot; ${x.orb.toFixed(1)}&deg;</h4>${H.para(T['sr-ang:' + x.key])}`), '<p class="note">No planet sits on an angle of this year&rsquo;s chart.</p>'));
      out.push(H.chapter(4, 'Love, effort, growth and work', 'Venus, Mars, Jupiter and Saturn in the houses of the return chart.'),
        H.items('Four planets', ['Venus', 'Mars', 'Jupiter', 'Saturn'].map(k => `<h4>${H.glyph(k)} ${k} in the ${H.ordinal(P(sr, k).house)} house</h4>${H.para(T[`sr-ph:${k}:${P(sr, k).house}`])}`)),
        `<details class="more res"><summary>About solar returns</summary>${H.para(T['return:Solar'])}</details>`, H.disclaimerPlain);
      return out.join('');
    }
  },
  lunarreturn: {
    title: 'Lunar return', kicker: 'The month ahead', card: 'major-18', caption: 'the card of the Moon', needs: 'now', group: 'time',
    lede: 'The month from your most recent lunar return to the next: the moment the Moon comes back to its birth degree, about every 27 days, read for where you are.',
    gv: 'Lunar Return',
    method: 'The lunar return is the moment the Moon returns to its exact birth longitude (about every 27.3 days), found to the minute and cast for where you are now. Placidus houses. The return in force is the most recent one before today; the next one is given. With no birth time the Moon&rsquo;s birth degree is uncertain by up to about 7&deg;, so the date can be off by up to half a day.',
    render(ctx, H){
      const { c, T } = ctx, out = [], here = herePlace(ctx, 'now'), now = Date.now();
      const t = NS.tools.lunarReturn(c, new Date(now - 28 * DAYMS)), next = t && NS.tools.lunarReturn(c, new Date(+t + 2 * DAYMS));
      const cur = next && +next <= now ? next : t, nxt = cur === next ? NS.tools.lunarReturn(c, new Date(+next + 2 * DAYMS)) : next;
      const lr = NS.chart({ utc: +cur, lat: here.lat, lon: here.lon, tz: here.tz, system: 'placidus' }), asc = S(lr.angles.asc), moon = P(lr, 'Moon');
      out.push(H.chapter(1, `The month from ${fmtDate(cur)} to ${fmtDate(nxt)}`, `Cast for ${H.esc(placeName(here))}.${c.timeKnown ? '' : ' No birth time: the dates can be off by up to half a day.'}`),
        `<div class="grid g2" style="align-items:start">${H.block(`Rising sign of the month: ${asc}`, H.para(T['lr-asc:' + asc]))}
          ${H.block(`Where feelings gather: Moon in the ${H.ordinal(moon.house)} house`, H.para(T['lr-moon:' + moon.house]))}</div>`);
      const ang = angular(lr).filter((x, i, a) => a.findIndex(z => z.key === x.key) === i);
      out.push(H.chapter(2, 'Loud planets this month', 'Planets within 8&deg; of an angle of the lunar-return chart.'),
        H.items('On the angles', ang.map(x => `<h4>${H.glyph(x.key)} ${x.key} ${ANGLE_NAME[x.angle]} &middot; ${x.orb.toFixed(1)}&deg;</h4>${H.para(T['lr-ang:' + x.key])}`), '<p class="note">No planet sits on an angle of this month&rsquo;s chart.</p>'),
        `<details class="more res"><summary>About lunar returns</summary>${H.para(T['return:Lunar'])}</details>`, H.disclaimerPlain);
      return out.join('');
    }
  },
  progressions: {
    title: 'Progressed chart', kicker: 'The chapters of your life', card: 'major-09', caption: 'the card of slow inner growth', group: 'time',
    lede: 'Your chart moved forward by the secondary progressions, a day after birth for each year of life: the chapter you are in now, your developing self, and the themes building over the next years.',
    gv: 'Secondary Progressed',
    method: 'Secondary progressions: the planets one day after birth for each year of life. Progressed Ascendant and Midheaven by solar arc (the natal angles moved by as much as the progressed Sun). Progressed Moon house in your natal houses. Progressed Sun aspects to natal points with a 1&deg; orb, which is about two years either side of exact.',
    render(ctx, H){
      const { c, T } = ctx, out = [], now = new Date(), pr = NS.tools.progressions(c, now);
      const age = ((+now - +c.utc) / YEARMS).toFixed(1), psun = S(pr.planets[0].lon), pmoon = pr.moonSign.sign;
      const pmh = c.angles ? NS.houseOf(pr.planets[1].lon, c.angles.asc, c.system, c.cusps) : null;
      out.push(H.chapter(1, `Your developing self, at ${age}`, 'The progressed Sun moves about one degree a year and changes sign about every thirty years.'),
        H.block(`Progressed Sun in ${psun}`, H.para(T['prog-sun:' + psun])));
      out.push(H.chapter(2, 'The emotional chapter you are in', 'The progressed Moon changes sign about every two and a half years.'),
        `<div class="grid g2" style="align-items:start">${H.block(`Progressed Moon in ${pmoon}`, `<p class="note">${pr.moonSign.from ? fmtDate(pr.moonSign.from) : '?'} to ${pr.moonSign.to ? fmtDate(pr.moonSign.to) : '?'}</p>` + H.para(T['prog-moon:' + pmoon]))}
          ${pmh ? H.block(`In your natal ${H.ordinal(pmh)} house`, H.para(T['prog-moonh:' + pmh])) : H.block('The house', needTime('The progressed Moon&rsquo;s house'))}</div>`,
        H.block(`Progressed lunar phase: ${pr.phase.name}`, `<p class="note">${pr.phase.from ? fmtDate(pr.phase.from) : '?'} to ${pr.phase.to ? fmtDate(pr.phase.to) : '?'}</p>` + H.para(T['prog-phase:' + pr.phase.name])));
      out.push(H.chapter(3, 'How you meet the world now', 'The progressed Ascendant and Midheaven, by solar arc.'),
        pr.asc != null ? `<div class="grid g2" style="align-items:start">${H.block(`Progressed Ascendant in ${S(pr.asc)}`, H.para(T['prog-asc:' + S(pr.asc)]))}${H.block(`Progressed Midheaven in ${S(pr.mc)}`, H.para(T['prog-mc:' + S(pr.mc)]))}</div>`
          : H.block('', needTime('The progressed angles')));
      const NAT = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].map(k => [k, P(c, k).lon]).concat(c.angles ? [['Ascendant', c.angles.asc], ['Midheaven', c.angles.mc]] : []);
      const hits = [];
      NAT.forEach(([k, l]) => { if (k === 'Moon' && !c.timeKnown) return; const sep = NS.separation(pr.planets[0].lon, l);
        [[0, 'conjunction'], [60, 'easy'], [120, 'easy'], [90, 'hard'], [180, 'hard']].forEach(([a, t]) => { if (k !== 'Sun' && Math.abs(sep - a) <= 1) hits.push({ k, t, orb: Math.abs(sep - a) }); }); });
      out.push(H.chapter(4, 'Themes building now', 'The progressed Sun within 1&deg; of an aspect to a natal point: a theme that builds for about two years, peaks and fades.'),
        H.items('Progressed Sun aspects', hits.map(h => `<h4>Progressed Sun ${h.t === 'conjunction' ? 'conjunct' : h.t === 'easy' ? 'in easy aspect to' : 'in hard aspect to'} natal ${h.k} &middot; ${h.orb.toFixed(2)}&deg;</h4>${H.para(T[`prog-asp:${h.k}:${h.t}`])}`),
          '<p class="note">The progressed Sun makes no exact aspect to a natal point right now; this is a quieter in-between chapter.</p>'), H.disclaimerPlain);
      return out.join('');
    }
  },
  saturn: {
    title: 'Saturn cycle', kicker: 'Saturn&rsquo;s promise across a lifetime', card: 'major-21', caption: 'the card of completion', group: 'time',
    lede: 'Every stage of Saturn&rsquo;s 29-year cycle to its own birth place, from childhood to old age: the squares, the oppositions and the Saturn returns, with their dates and where you are now.',
    gv: 'Saturn Return&rsquo;s Promise',
    method: 'Every date when transiting Saturn reaches 90&deg;, 180&deg;, 270&deg; or 360&deg; past its birth longitude, from birth to age 95. Saturn&rsquo;s retrograde loops can make it cross the same point up to three times; all passes are listed. Saturn returns match the Tools page&rsquo;s search to the day.',
    render(ctx, H){
      const { c, T } = ctx, out = [], cyc = NS.factors.saturnCycle(c), now = Date.now(), sat = P(c, 'Saturn');
      const NAME = { wax: 'Waxing square', opp: 'Opposition', wane: 'Waning square', return: 'Saturn return' };
      const curIdx = cyc.reduce((acc, x, i) => x.passes[0] <= now ? i : acc, -1), cur = cyc[curIdx], nxt = cyc[curIdx + 1];
      out.push(H.chapter(1, 'Your natal Saturn', 'Where the cycle starts: Saturn&rsquo;s sign and house at birth.'),
        H.block(`${H.glyph('Saturn')} Saturn in ${S(sat.lon)}${sat.house ? `, ${H.ordinal(sat.house)} house` : ''}`, H.para(T['sign:Saturn:' + S(sat.lon)]) + (sat.house ? `<h4>In the ${H.ordinal(sat.house)} house</h4>${H.para(T['house:Saturn:' + sat.house])}` : '')));
      out.push(H.chapter(2, 'Where you are in the cycle now', cur ? `Since ${fmtDate(cur.passes[0])}, age ${cur.age.toFixed(1)}: ${NAME[cur.kind].toLowerCase()}.${nxt ? ` Next: ${NAME[nxt.kind].toLowerCase()} from ${fmtDate(nxt.passes[0])}.` : ''}` : 'Before the first waxing square.'),
        cur ? H.block(NAME[cur.kind], H.para(T[cur.textKey])) : '', nxt ? H.block(`Next: ${NAME[nxt.kind]}, age ${nxt.age.toFixed(1)}`, H.para(T[nxt.textKey])) : '');
      out.push(H.chapter(3, 'The whole cycle, birth to 95', 'Every stage with its dates. Dates in bold are past.'),
        H.block('Timeline', `<table class="conv"><tr><th>Stage</th><th>Age</th><th>Dates (each pass)</th></tr>${cyc.map(x => `<tr><td>${x.passes[0] <= now ? '<b>' + NAME[x.kind] + '</b>' : NAME[x.kind]}</td><td>${x.age.toFixed(1)}</td><td>${x.passes.map(fmtDate).join(', ')}</td></tr>`).join('')}</table>`),
        H.items('The stages', ['sat:wax', 'sat:opp', 'sat:wane', 'sat:return1', 'sat:return2', 'sat:return3'].map(k => `<h4>${{ 'sat:wax': 'Waxing square', 'sat:opp': 'Opposition', 'sat:wane': 'Waning square', 'sat:return1': 'First Saturn return', 'sat:return2': 'Second Saturn return', 'sat:return3': 'Third Saturn return' }[k]}</h4>${H.para(T[k])}`)),
        H.disclaimerPlain);
      return out.join('');
    }
  },
  relocation: {
    title: 'Relocation', kicker: 'Your chart in another place', card: 'major-07', caption: 'the card of the journey', needs: 'reloc', group: 'time',
    lede: 'Your birth chart recast for another city: the rising sign and life direction you would carry there, the planets that become loud on its angles, and where your planets fall in its houses.',
    gv: 'Poppe Relocation Information',
    method: 'Relocation keeps the birth moment and recasts the houses and angles for the new place (Placidus). Planets within 8&deg; of a relocated angle are read with the astrocartography line texts, since they are the same thing seen from one city. A birth time is needed. For the world map of every line, see Astrocartography.',
    render(ctx, H){
      const { c, T } = ctx, out = [];
      if (!c.timeKnown) return H.chapter(1, 'A birth time is needed', '') + H.block('', '<p class="note">Relocation moves the houses and angles, which come from the birth time. Add a birth time to read it.</p>');
      const there = herePlace(ctx, 'reloc'), rc = NS.chart({ utc: +c.utc, lat: there.lat, lon: there.lon, tz: there.tz, system: 'placidus' });
      const ra = S(rc.angles.asc), rm = S(rc.angles.mc);
      out.push(H.chapter(1, `You in ${H.esc(placeName(there))}`, `Birth rising sign ${S(c.angles.asc)}; relocated rising sign ${ra}. Birth Midheaven ${S(c.angles.mc)}; relocated ${rm}.`),
        `<div class="grid g2" style="align-items:start">${H.block(`Relocated rising sign: ${ra}`, H.para(T['rising:' + ra]))}${H.block(`Relocated Midheaven: ${rm}`, H.para(T['voc:mc:' + rm]))}</div>`);
      const ang = angular(rc);
      out.push(H.chapter(2, 'Planets on the angles there', 'Within 8&deg; of the relocated Ascendant, Descendant, Midheaven or IC: these planets are loud in that place.'),
        H.items('Loud planets', ang.map(x => `<h4>${H.glyph(x.key)} ${x.key} ${ANGLE_NAME[x.angle]} &middot; ${x.orb.toFixed(1)}&deg;</h4>${H.para(T[`acg:${x.key}:${x.angle}`])}`), '<p class="note">No planet sits on an angle there; the place is neutral ground for your chart.</p>'));
      const moved = ['Sun', 'Moon', 'Venus', 'Mars', 'Jupiter', 'Saturn'].map(k => ({ k, from: P(c, k).house, to: P(rc, k).house })).filter(x => x.from !== x.to);
      out.push(H.chapter(3, 'Where your planets land there', 'Planets that change house when you move: the life area they colour shifts.'),
        H.items('Planets in new houses', moved.map(x => `<h4>${H.glyph(x.k)} ${x.k}: from the ${H.ordinal(x.from)} to the ${H.ordinal(x.to)} house</h4>${H.para(T[`house:${x.k}:${x.to}`])}`), '<p class="note">Your main planets stay in the same houses there.</p>'),
        '<p class="note" style="margin-top:12px">See every planet line on the world map on the <a href="astromap.html">Astrocartography</a> page.</p>', H.disclaimerPlain);
      return out.join('');
    }
  }
});
NS.REPORTS = REPORTS;
})(window.TD);
