// The report suite: js/factors.js, the karmic numbers in js/numerology.js, Fagan-Bradley in js/vedic.js, and the
// pastlife.html / karmic.html renderers run end to end on several charts with every text present.
const fs = require('fs'), path = require('path');
const load = require('./load');
const FILES = ['js/vendor/astronomy.browser.min.js', 'js/data/chiron.js', 'js/astro.js', 'js/chart.js', 'js/natal.js', 'js/vedic.js',
  'js/numerology.js', 'js/factors.js', 'js/cards.js', 'js/data/correspondences.js', 'js/data/extra-text.js',
  'js/data/natal-text.js', 'js/data/vedic-text.js', 'js/data/report-text.js', 'js/data/tools-text.js', 'js/tools.js'];
const W = load(FILES), TD = W.TD, F = TD.factors;
const assert = (c, msg) => { if (!c) throw new Error(msg); };
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/fagan-swisseph.json'), 'utf8'));
const sep = (a, b) => { const d = Math.abs(((a - b) % 360 + 540) % 360 - 180); return d; };

/* Run a page's inline script with TD.reportPage captured, then render a context made by js/reportpage.js. */
function renderer(page){
  const html = fs.readFileSync(path.join(__dirname, '..', page), 'utf8');
  const code = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
  const ctx = load(FILES.concat(['js/reportpage.js']), { document: { getElementById: () => null } });
  let render = null;
  ctx.TD.reportPage = o => { render = o.render; };
  require('vm').runInContext(code, ctx);
  return { render, ctx };
}
const CHARTS = [
  ['Denver 1992, named', 'Jane Ann Smith', { y: 1992, mo: 7, d: 11, h: 14, mi: 20, timeKnown: true, lat: 39.7392, lon: -104.9903, tz: 'America/Denver', system: 'placidus' }],
  ['Denver 1992, no time', 'You', { y: 1992, mo: 7, d: 11, h: 12, mi: 0, timeKnown: false, lat: 39.7392, lon: -104.9903, tz: 'America/Denver', system: 'placidus' }],
  ['London 1969', 'Ada Lovelace', { y: 1969, mo: 7, d: 20, h: 21, mi: 17, timeKnown: true, lat: 51.5072, lon: -0.1276, tz: 'Europe/London', system: 'placidus' }],
  ['Tromso 2001 (Porphyry fallback)', 'You', { y: 2001, mo: 12, d: 21, h: 3, mi: 0, timeKnown: true, lat: 69.6492, lon: 18.9553, tz: 'Europe/Oslo', system: 'placidus' }],
  ['Sydney 1955, whole sign', 'Mo Li', { y: 1955, mo: 2, d: 24, h: 19, mi: 15, timeKnown: true, lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney', system: 'whole' }],
  ['Mumbai 2010, no time', 'Priya Raman', { y: 2010, mo: 5, d: 3, h: 12, mi: 0, timeKnown: false, lat: 19.076, lon: 72.8777, tz: 'Asia/Kolkata', system: 'placidus' }]
];

module.exports = [
  ['Fagan-Bradley ayanamsa and sidereal Sun/Moon match Swiss Ephemeris', () => {
    let worst = 0;
    fixture.rows.forEach(r => {
      const d = new Date(r.utc), ay = TD.vedic.ayanamsa(d, 'fagan').true;
      worst = Math.max(worst, Math.abs(ay - r.fagan) * 3600);
      const sun = TD.vedic.sidereal(TD.planetPositions(d)[0].lon, d, 'fagan'), moon = TD.vedic.sidereal(TD.planetPositions(d)[1].lon, d, 'fagan');
      assert(sep(sun, r.sunSid) < 1 / 60 && sep(moon, r.moonSid) < 1 / 60, `${r.utc}: Sun ${sun} vs ${r.sunSid}, Moon ${moon} vs ${r.moonSid}`);
    });
    assert(worst < 1, `ayanamsa off by ${worst.toFixed(2)}"`);
    const d = new Date('2000-01-01T12:00:00Z');
    assert(Math.abs(TD.vedic.ayanamsa(d, 'fagan').true - TD.vedic.ayanamsa(d).true - 0.8832076) < 1e-9, 'Lahiri unchanged by default');
    return `worst ${worst.toFixed(3)}"`;
  }],
  ['Triplicity decanates and their rulers', () => {
    const at = (sign, deg) => TD.SIGNS.indexOf(sign) * 30 + deg;
    const d = F.decanOf(at('Leo', 5)); assert(d.decanSign === 4 && d.ruler === 'Sun', 'Leo first decan is Leo, Sun');
    assert(F.decanOf(at('Leo', 15)).ruler === 'Jupiter' && F.decanOf(at('Leo', 25)).ruler === 'Mars', 'Leo: Sagittarius, Aries');
    assert(F.decanOf(at('Gemini', 25)).ruler === 'Uranus', 'Gemini third decan is Aquarius, Uranus');
    assert(F.decanOf(at('Scorpio', 22)).ruler === 'Moon', 'Scorpio third decan is Cancer, Moon');
    for (let s = 0; s < 12; s++) for (let k = 0; k < 3; k++) {
      const x = F.decanOf(s * 30 + k * 10 + 5);
      assert(TD.elementOf(x.decanSign) === TD.elementOf(s) && x.decan === k + 1, `sign ${s} decan ${k}`);
    }
  }],
  ['Decan cards agree with the Golden Dawn table in correspondences.js for all 36 decans', () => {
    for (let k = 0; k < 36; k++) {
      const dc = F.decanCard(k * 10 + 5), card = TD.DECK.find(c => c.id === dc.id);
      assert(card && card.astro.kind === 'pip' && card.astro.sign === dc.sign && card.astro.planet === dc.planet && card.astro.decan === dc.decan, `decan ${k}: ${dc.id}`);
    }
  }],
  ['Karmic numbers: debts on the way to core numbers, lessons from the name', () => {
    let k = TD.karmicNumbers('Jane Ann Smith', '1992-07-11');
    assert(k.debts.length === 1 && k.debts[0].n === 16 && k.debts[0].where === 'soulUrge', JSON.stringify(k.debts));
    assert(k.lessons.join() === '3,6,7', 'lessons ' + k.lessons);
    k = TD.karmicNumbers('', '1980-03-19');
    assert(k.debts.some(d => d.n === 19 && d.where === 'birthday') && k.lessons === null && !k.hasName, 'birthday 19, no name');
    k = TD.karmicNumbers('', '1987-04-13');      // the birth day 13 itself is a debt
    assert(k.debts.some(d => d.n === 13 && d.where === 'birthday'), 'birthday 13');
    k = TD.karmicNumbers('', '1960-02-02');      // 2 + 2 + 7 (1960 -> 16 -> 7): 11 is a master number, not a debt
    assert(!k.debts.length, 'no debts: ' + JSON.stringify(k.debts));
    k = TD.karmicNumbers('', '1999-11-03');      // 2 (11 -> 2) + 3 + 1 (1999 -> 28 -> 10 -> 1) = 6
    assert(!k.debts.length, 'none');
    k = TD.karmicNumbers('', '2002-05-07');      // 5 + 7 + 4 (2002 -> 4) = 16 -> 7
    assert(k.debts.some(d => d.n === 16 && d.where === 'lifePath'), 'life path 16 ' + JSON.stringify(k.debts));
    k = TD.karmicNumbers('', '1975-05-07');      // 5 + 7 + 22 (1975 -> 22, master number kept) = 34: no debt
    assert(!k.debts.length, 'master year: ' + JSON.stringify(k.debts));
  }],
  ['Factors on the default chart, as worked by hand', () => {
    const c = TD.chart(CHARTS[0][2]);
    const n = F.nodes(c);
    assert(n.signKey === 'node:Gemini' && n.houseKey === 'nodehouse:8' && n.snRuler === 'Mercury', JSON.stringify(n));
    assert(F.retrogrades(c).map(r => r.key).join() === 'Saturn,Uranus,Neptune,Pluto', 'retrogrades');
    const s = F.sojourns(c, 'fagan');
    assert(s.sun.ruler === 'Uranus' && s.moon.ruler === 'Moon' && s.planets.join() === 'Uranus,Moon', JSON.stringify(s.planets));
    const ch = F.chakras(c); assert(ch.filter(r => r.state === 'strong').length === 2 && ch.filter(r => r.state === 'quiet').length === 2, 'chakra states');
    const st = F.strength(c); assert(st.length === 10 && st[0].rank === 1 && new Set(st.map(x => x.key)).size === 10, 'strength ranks');
  }],
  ['Convergence is deterministic and only counts planets backed by two systems as core', () => {
    const c = TD.chart(CHARTS[0][2]), v = TD.vedic.chart(c);
    const num = TD.numerology('Jane Ann Smith', '1992-07-11'), k = TD.karmicNumbers('Jane Ann Smith', '1992-07-11'), s = F.sojourns(c);
    const a = F.convergence(c, v, num, k, s), b = F.convergence(c, v, num, k, s);
    assert(JSON.stringify(a) === JSON.stringify(b), 'same input, same output');
    assert(a.core.every(x => x.systems.length >= 2) && a.core.length <= 3, 'core rule');
    assert(a.numbers.every(x => /^num(echo|tension):\d+$/.test(x.textKey)), 'number keys');
  }],
  ['Every text key the factors can produce exists in the corpus', () => {
    const T = Object.assign({}, TD.NATAL_TEXT, TD.VEDIC_TEXT, TD.REPORT_TEXT), miss = [];
    const need = k => { if (!T[k]) miss.push(k); };
    TD.SIGNS.forEach(s => { need('node:' + s); need('era:' + s); need('fortune:' + s); need('affirm:' + s); });
    for (let h = 1; h <= 12; h++) { need('nodehouse:' + h); need('pastrole:' + h); need('fortune:' + h); }
    F.PLANETS.forEach(p => ['sojourn', 'echo', 'nn', 'sn', 'affirm', 'karma', 'gem'].forEach(k => need(k + ':' + p)));
    ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].forEach(p => need('nretro:' + p));
    ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].forEach(p => need('ak:' + p));
    F.CHAKRAS.forEach(([n]) => ['strong', 'quiet', 'balanced'].forEach(s => need(`chakra:${n}:${s}`)));
    ['Fire', 'Earth', 'Air', 'Water', 'Cardinal', 'Fixed', 'Mutable'].forEach(e => ['high', 'low'].forEach(l => need(`${/^(Fire|Earth|Air|Water)$/.test(e) ? 'elem' : 'mode'}:${e}:${l}`)));
    ['East', 'West', 'North', 'South'].forEach(h => need('hemi:' + h));
    [13, 14, 16, 19].forEach(n => need('kdebt:' + n));
    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(n => need('klesson:' + n));
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33].forEach(n => { need('numecho:' + n); need('numtension:' + n); });
    assert(!miss.length, 'missing: ' + miss.join(', '));
    return Object.keys(TD.REPORT_TEXT).length + ' report texts';
  }],
  ['Out-of-bounds declinations match Swiss Ephemeris', () => {
    const fx = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/declination-swisseph.json'), 'utf8'));
    let worst = 0;
    fx.rows.forEach(r => Object.entries(r.dec).forEach(([k, v]) => { worst = Math.max(worst, Math.abs(F.declination(k, new Date(r.utc)) - v) * 60); }));
    assert(worst < 0.2, `worst ${worst.toFixed(3)}'`);
    const c = TD.chart({ y: 2006, mo: 3, d: 14, h: 18, mi: 0, timeKnown: true, lat: 39.7392, lon: -104.9903, tz: 'America/Denver', system: 'placidus' });
    assert(F.outOfBounds(c).map(x => x.key).join() === 'Mars', 'Mars out of bounds in March 2006 (dec 24.1)');
    return `worst ${worst.toFixed(3)}'`;
  }],
  ['Saturn cycle: returns match tools.js saturnReturns to the day, stages in order', () => {
    const c = TD.chart(CHARTS[0][2]), cyc = F.saturnCycle(c);
    const mine = cyc.filter(x => x.kind === 'return').map(x => x.passes.map(p => p.toISOString().slice(0, 10)).join(' ')).join(' | ');
    const ref = TD.tools.saturnReturns(c).map(r => r.passes.map(p => p.toISOString().slice(0, 10)).join(' ')).join(' | ');
    assert(mine === ref, mine + ' vs ' + ref);
    assert(cyc.map(x => x.kind).slice(0, 4).join() === 'wax,opp,wane,return' && cyc[0].age > 6 && cyc[0].age < 9, 'first stages ' + cyc.map(x => x.kind + '@' + x.age.toFixed(1)).join(' '));
    assert(cyc.filter(x => x.kind === 'return').map(x => x.textKey).join() === 'sat:return1,sat:return2,sat:return3', 'return keys');
  }],
  ['House rulers: twelve, each pointing to the house its ruler occupies', () => {
    const c = TD.chart(CHARTS[0][2]), hr = F.houseRulers(c);
    assert(hr.length === 12 && hr.map(x => x.textKey).join(' ') === 'ruler:1:7 ruler:2:11 ruler:3:4 ruler:4:4 ruler:5:11 ruler:6:7 ruler:7:9 ruler:8:10 ruler:9:2 ruler:10:9 ruler:11:10 ruler:12:9', hr.map(x => x.textKey).join(' '));
    assert(F.houseRulers(TD.chart(CHARTS[1][2])) === null, 'no time, no rulers');
  }],
  ['report.html: all ten reports render every test chart with all their texts', () => {
    const ctx = load(FILES.concat(['js/reportpage.js', 'js/reports.js']), { document: { getElementById: () => null } });
    const R = ctx.TD.REPORTS, H = ctx.TD.reportHelpers;
    assert(Object.keys(R).join() === 'lifepath,vocation,child,family,chakras,solarreturn,lunarreturn,progressions,saturn,relocation', Object.keys(R).join());
    let n = 0;
    Object.entries(R).forEach(([id, rep]) => CHARTS.forEach(([label, name, input]) => {
      const reloc = { name: 'London', lat: 51.5072, lon: -0.1276, tz: 'Europe/London' };
      const html = rep.render(ctx.TD.reportContext({ name, place: { name: label }, reloc, input }, 'fagan'), H); n++;
      assert(!/undefined|NaN|\[object/.test(html), `${id} ${label}: ${(html.match(/.{60}(undefined|NaN|\[object).{20}/) || [''])[0]}`);
      assert(!/<p class="interp"><\/p>|<p class="affirm"[^>]*><\/p>/.test(html), `${id} ${label}: empty text`);
      assert((html.match(/class="eyebrow rchead"/g) || []).length >= (id === 'relocation' && !input.timeKnown ? 1 : 2), `${id} ${label}: chapters`);
    }));
    return n + ' renders';
  }],
  ...['pastlife.html', 'karmic.html'].map(page => [`${page} renders every test chart with all its texts`, () => {
    const { render, ctx } = renderer(page);
    assert(typeof render === 'function', 'render captured');
    CHARTS.forEach(([label, name, input]) => ['fagan', 'lahiri'].forEach(mode => {
      const p = { name, place: { name: label }, input };
      const html = render(ctx.TD.reportContext(p, mode), ctx.TD.reportHelpers);
      assert(!/undefined|NaN|\[object/.test(html), `${label} ${mode}: ${(html.match(/.{60}(undefined|NaN|\[object).{20}/) || [''])[0]}`);
      assert(!/<p class="interp"><\/p>|<p class="affirm"[^>]*><\/p>/.test(html), `${label} ${mode}: empty text`);
      assert((html.match(/Chapter \d/g) || []).length >= 6, `${label}: chapters`);
      assert(!/\p{Extended_Pictographic}/u.test(html.replace(/[☀-⛿]︎|[☀-⛿]/g, '')), `${label}: emoji`);
    }));
    return CHARTS.length * 2 + ' renders';
  }])
];
