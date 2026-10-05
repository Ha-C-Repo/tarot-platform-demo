/* gooddays.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   "Good days for…": the next 30 days scored for one activity by a short set of traditional electional rules,
   published on tools.html. Load after astronomy.browser.min.js, astro.js, chart.js and tools.js.

   RULES (each day is judged at local noon, the void Moon over the waking hours 08:00-22:00):
     Moon in one of the activity's signs            +2
     Moon waxing for things you start, waning for   +2 when it matches, -1 when it does not
       things you end or rest from
     Mercury retrograde, for talk, travel, contracts -3
     Venus retrograde, for love and money           -3
     Moon void of course for half the waking hours  -2
     With a birth chart: the Moon within 6 deg of a  +2 conjunction, sextile or trine
       trine, sextile or conjunction to the           -1 square or opposition
       activity's natal planets
   The same for everyone without a birth chart; nothing is random. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const DAY = 864e5, H = 3600e3;
const ACTIVITIES = {
  start:    { name: 'Start something new', phase: 'waxing', signs: ['Aries', 'Leo', 'Sagittarius', 'Capricorn'], natal: ['Sun', 'Mars'] },
  contract: { name: 'Sign a contract or agreement', mercury: true, signs: ['Taurus', 'Virgo', 'Libra', 'Capricorn'], natal: ['Mercury', 'Saturn'] },
  romance:  { name: 'A date or romance', venus: true, phase: 'waxing', signs: ['Taurus', 'Leo', 'Libra', 'Pisces'], natal: ['Venus', 'Moon'] },
  money:    { name: 'Ask for money or a raise', venus: true, phase: 'waxing', signs: ['Taurus', 'Leo', 'Virgo', 'Capricorn'], natal: ['Jupiter', 'Venus', 'Sun'] },
  travel:   { name: 'Travel or a trip', mercury: true, signs: ['Gemini', 'Sagittarius', 'Aquarius'], natal: ['Jupiter', 'Mercury'] },
  talk:     { name: 'A difficult conversation', mercury: true, signs: ['Gemini', 'Virgo', 'Libra', 'Aquarius'], natal: ['Mercury', 'Moon'] },
  end:      { name: 'End something or let it go', phase: 'waning', signs: ['Virgo', 'Scorpio', 'Capricorn'], natal: ['Saturn', 'Pluto'] },
  rest:     { name: 'Rest and recharge', phase: 'waning', signs: ['Taurus', 'Cancer', 'Pisces'], natal: ['Moon', 'Neptune'] }
};
const lon = (k, t) => NS.eclLon(k, new Date(t));
const norm = d => ((d % 360) + 360) % 360;
const speed = (k, t) => { const d = lon(k, t + DAY / 2) - lon(k, t - DAY / 2); return d > 180 ? d - 360 : d < -180 ? d + 360 : d; };
const sep = (a, b) => { const d = norm(a - b); return d > 180 ? 360 - d : d; };

/* days: [{ date (local midnight), noon, score, reasons: [{ text, points }] }], best first in .best */
function find(activity, opts = {}){
  const A = ACTIVITIES[activity]; if (!A) return null;
  const now = opts.from ? new Date(opts.from) : new Date(), n = opts.days || 30, natal = opts.natal || null;
  const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const voc = NS.tools.voidMoon(d0, n + 1);
  const days = [];
  for (let k = 0; k < n; k++) {
    const date = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + k), noon = +date + 12 * H;
    const reasons = [], add = (points, text) => reasons.push({ points, text });
    const moon = lon('Moon', noon), sign = NS.SIGNS[Math.floor(norm(moon) / 30)];
    if (A.signs.includes(sign)) add(2, `The Moon is in ${sign}, a sign that suits it`);
    const waxing = norm(moon - lon('Sun', noon)) < 180;
    if (A.phase) { if ((A.phase === 'waxing') === waxing) add(2, `The Moon is ${waxing ? 'waxing, good for beginnings' : 'waning, good for endings and rest'}`);
                   else add(-1, `The Moon is ${waxing ? 'waxing' : 'waning'}, against the grain for this`); }
    if (A.mercury && speed('Mercury', noon) < 0) add(-3, 'Mercury is retrograde: plans and papers tend to need a second look');
    if (A.venus && speed('Venus', noon) < 0) add(-3, 'Venus is retrograde: love and money matters tend to be revisited');
    const w0 = +date + 8 * H, w1 = +date + 22 * H;
    const vocMs = voc.reduce((s, v) => s + Math.max(0, Math.min(+v.end, w1) - Math.max(+v.start, w0)), 0);
    if (vocMs >= 7 * H) add(-2, `The Moon is void of course for ${Math.round(vocMs / H)} of the waking hours`);
    if (natal) A.natal.forEach(p => {
      const pl = natal.planets.find(x => x.key === p); if (!pl) return;
      const s = sep(moon, pl.lon);
      const near = [[0, 'meets'], [60, 'sextiles'], [120, 'trines'], [90, 'squares'], [180, 'opposes']].find(([a]) => Math.abs(s - a) <= 6);
      if (!near) return;
      if (near[0] === 90 || near[0] === 180) add(-1, `The Moon ${near[1]} your natal ${p}`);
      else add(2, `The Moon ${near[1]} your natal ${p}`);
    });
    days.push({ date, noon: new Date(noon), sign, waxing, score: reasons.reduce((s, r) => s + r.points, 0), reasons });
  }
  const best = days.slice().sort((a, b) => b.score - a.score || a.date - b.date).slice(0, 5);
  return { activity: A, days, best };
}

NS.goodDays = { ACTIVITIES, find };
})(window.TD);
