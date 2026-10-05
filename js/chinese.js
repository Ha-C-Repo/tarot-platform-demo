/* chinese.js — animal, element and the two year boundaries, computed from the real
   lunisolar calendar. Deliberately NOT a year-to-animal lookup table: see the note
   rendered on the page. Dates are evaluated in China Standard Time (UTC+8), which is
   the convention the calendar is defined in. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const ANIMALS = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'];
/* The animal written as its traditional character (text, not emoji: the site draws no emoji anywhere). */
const GLYPH   = ['鼠','牛','虎','兔','龍','蛇','馬','羊','猴','雞','狗','豬'];
const STEMS    = ['Jia','Yi','Bing','Ding','Wu','Ji','Geng','Xin','Ren','Gui'];
const ELEMENTS = ['Wood','Wood','Fire','Fire','Earth','Earth','Metal','Metal','Water','Water'];
const YIN_YANG = ['Yang','Yin'];
const CST = 8 / 24;                                   // China Standard Time offset in days

const dayInCST = jd => Math.floor(jd + 0.5 + CST);    // integer day index in CST
function cstDateOf(jd){                               // Date at CST midnight, for display
  const d = NS.fromJD(jd + CST);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
/* Year pillar from the sexagenary cycle: 1984 = Jia Zi = Wood Rat */
function pillar(year){
  const i = ((year - 1984) % 60 + 60) % 60;
  const stem = i % 10, branch = i % 12;
  return { stem: STEMS[stem], element: ELEMENTS[stem], polarity: YIN_YANG[stem % 2],
           animal: ANIMALS[branch], glyph: GLYPH[branch], branchIndex: branch };
}
/* Chinese New Year, exact: month 1 begins on the CST day of a new moon; month 11 is the month
   containing the December solstice; New Year is two new moons after the start of month 11, or
   three when a leap month falls between (the first month after month 11 that contains no
   principal solar term is the leap month). New moons and solstices from Astronomy Engine.
   Checked against lunar-javascript for every year 1901-2099 (tests/calendars.test.js). */
/* Day boundaries in China's calendar time: UTC+8 from 1929, Beijing mean time (116°25' E,
   UTC+7:45:40) before that. */
let calOff = 8 * 3600e3;
const cstDay = ms => Math.floor((ms + calOff) / 86400e3);              // integer day index in calendar time
function newMoonsFrom(ms, n){
  const A = window.Astronomy, out = [];
  let t = A.MakeTime(new Date(ms));
  for (let i = 0; i < n; i++) { const ev = A.SearchMoonPhase(0, t, 40); out.push(ev.date.getTime()); t = ev.AddDays(1); }
  return out;
}
function month11Start(year){                                           // CST day of the new moon starting month 11
  const A = window.Astronomy, sol = cstDay(A.Seasons(year).dec_solstice.date.getTime());
  const nms = newMoonsFrom(Date.UTC(year, 10, 1), 3).map(cstDay);
  let start = nms[0]; nms.forEach(d => { if (d <= sol) start = d; });
  return start;
}
const cnyCache = {};
function cnyPrecise(year){
  if (cnyCache[year]) return cnyCache[year];
  const A = window.Astronomy;
  calOff = year < 1929 ? (7 * 3600 + 45 * 60 + 40) * 1000 : 8 * 3600e3;
  const a = month11Start(year - 1), b = month11Start(year);
  const moons = newMoonsFrom(Date.UTC(year - 1, 9, 15), 16).map(cstDay).filter(d => d >= a && d <= b);
  let k = 2;
  if (moons.length === 14) {                 // 13 lunations between the two month-11 starts: a leap year
    // A month with no principal term (Sun at a multiple of 30 degrees) is the leap month.
    const hasZhongqi = (d0, d1) => {
      const l0 = A.SunPosition(new Date((d0 * 86400e3) - calOff)).elon, l1 = A.SunPosition(new Date((d1 * 86400e3) - calOff)).elon;
      return Math.floor(l0 / 30) !== Math.floor(l1 / 30) || (l1 < l0);
    };
    for (let i = 1; i <= 2; i++) if (!hasZhongqi(moons[i], moons[i + 1])) { k = 3; break; }
  }
  const ms = moons[k] * 86400e3 - calOff;                              // calendar midnight, as a UTC instant
  return (cnyCache[year] = NS.toJD(new Date(ms)) + 0.0001);
}
const cny = year => (window.Astronomy ? cnyPrecise(year) : NS.chineseNewYear(year));

/* iso: 'YYYY-MM-DD'. bornUtc (optional, ms): the exact birth instant, when time and place are
   known; otherwise the date is taken at noon UTC, as before. */
NS.chinese = function(iso, bornUtc){
  const birth = new Date(iso + 'T12:00:00Z');
  const jd = NS.toJD(bornUtc == null ? birth : new Date(bornUtc));
  const gy = birth.getUTCFullYear();
  const day = dayInCST(jd);

  const cnyThis = cny(gy), lcThis = NS.lichun(gy);
  const afterCNY = day >= dayInCST(cnyThis);
  const afterLC  = day >= dayInCST(lcThis);

  const popularYear = afterCNY ? gy : gy - 1;   // Lunar New Year boundary
  const baziYear    = afterLC  ? gy : gy - 1;   // Lichun boundary
  const popular = pillar(popularYear), bazi = pillar(baziYear);

  return {
    popular, bazi, agree: popularYear === baziYear,
    cny: cstDateOf(cnyThis), lichun: cstDateOf(lcThis),
    popularYear, baziYear,
    nextCny: cstDateOf(cny(gy + 1))
  };
};
/* ---------- Four Pillars (BaZi) ----------
   Needs Astronomy Engine (js/vendor/astronomy.browser.min.js) for the exact solar-term instants.
   Conventions, stated on the page:
   - Year pillar turns over at the exact moment of Lichun (Sun at 315 degrees).
   - Month pillar turns over at the twelve "jie" solar terms (Sun at 315 + 30k degrees).
   - Day pillar follows the local calendar date, turning over at local midnight.
   - Hour pillar is the two-hour branch of local clock time (23:00-00:59 is the Rat hour). For
     23:00-23:59 the hour stem is taken from the NEXT day's stem while the day pillar stays with
     the calendar date (the common "late Rat hour" rule).
   - Local clock time is used as-is, not corrected to true solar time. */
const STEM_ZH = '\u7532\u4e59\u4e19\u4e01\u620a\u5df1\u5e9a\u8f9b\u58ec\u7678';
const BRANCH_ZH = '\u5b50\u4e11\u5bc5\u536f\u8fb0\u5df3\u5348\u672a\u7533\u9149\u620c\u4ea5';
const BRANCHES = ['Zi','Chou','Yin','Mao','Chen','Si','Wu','Wei','Shen','You','Xu','Hai'];
const norm = d => ((d % 360) + 360) % 360;
function pillarOf(stem, branch){
  return { stem: STEMS[stem], branch: BRANCHES[branch], zh: STEM_ZH[stem] + BRANCH_ZH[branch],
           element: ELEMENTS[stem], polarity: YIN_YANG[stem % 2], animal: ANIMALS[branch],
           glyph: GLYPH[branch], stemIndex: stem, branchIndex: branch };
}
function sunLon(ms){ const A = window.Astronomy; return A.Ecliptic(A.GeoVector(A.Body.Sun, new Date(ms), true)).elon; }
function lichunMs(year){
  const A = window.Astronomy;
  return A.SearchSunLongitude(315, new Date(Date.UTC(year, 0, 20)), 30).date.getTime();
}
const monthIndex = ms => Math.floor(norm(sunLon(ms) - 315) / 30);     // 0 = Tiger month (Yin)
function jdn(y, mo, d){ return Math.floor(Date.UTC(y, mo - 1, d) / 86400000) + 2440588; }

/* Standard (non-daylight-saving) offset of a zone around a given year: the smallest January or
   July offset within two years either side, since daylight saving only ever adds, and some zones
   (China 1942-45, for one) kept it on all year round. */
function standardOffsetMs(year, tz){
  let m = Infinity;
  for (let y = year - 2; y <= year + 2; y++) [0, 6].forEach(mo => { m = Math.min(m, NS.tzOffsetMs(Date.UTC(y, mo, 1, 12), tz)); });
  return m;
}
/* p: {y, mo, d, timeKnown, bornUtc, tz, dayStartUtc, dayEndUtc}
   bornUtc: the exact instant if the time is known, otherwise any moment that day (local noon).
   With a known time, the day and hour pillars use local STANDARD time: an hour of daylight
   saving on the clock is taken off first. With no time, the calendar date entered is used.
   dayStartUtc/dayEndUtc: the local day's span, used to say which pillars an unknown time leaves open. */
NS.bazi = function(p){
  const born = p.bornUtc;
  if (p.timeKnown && p.tz && NS.tzOffsetMs) {
    const std = standardOffsetMs(p.y, p.tz), wall = new Date(born + std);
    p = Object.assign({}, p, { y: wall.getUTCFullYear(), mo: wall.getUTCMonth() + 1, d: wall.getUTCDate(),
                               h: wall.getUTCHours(), mi: wall.getUTCMinutes(),
                               dstMin: Math.round((NS.tzOffsetMs(born, p.tz) - std) / 60000) });
  }
  const ly = lichunMs(p.y);
  const baziYear = born >= ly ? p.y : p.y - 1;
  const yStem = ((baziYear - 4) % 10 + 10) % 10, yBranch = ((baziYear - 4) % 12 + 12) % 12;
  const m = monthIndex(born);
  const mStem = (((yStem % 5) * 2 + 2) + m) % 10, mBranch = (m + 2) % 12;
  const di = ((jdn(p.y, p.mo, p.d) - 11) % 60 + 60) % 60;
  const dStem = di % 10, dBranch = di % 12;
  const out = { year: pillarOf(yStem, yBranch), month: pillarOf(mStem, mBranch), day: pillarOf(dStem, dBranch),
                hour: null, lichun: new Date(ly), baziYear, open: [], dstMin: p.dstMin || 0,
                stdWall: p.timeKnown ? { y: p.y, mo: p.mo, d: p.d, h: p.h, mi: p.mi } : null };
  if (p.timeKnown) {
    const hb = Math.floor(((p.h + 1) % 24) / 2);
    const base = p.h >= 23 ? (dStem + 1) % 10 : dStem;
    out.hour = pillarOf(((base % 5) * 2 + hb) % 10, hb);
  } else if (p.dayStartUtc != null) {
    if (p.dayStartUtc < ly && p.dayEndUtc >= ly) out.open.push('year');
    if (monthIndex(p.dayStartUtc) !== monthIndex(p.dayEndUtc)) out.open.push('month');
  }
  return out;
};
NS.BRANCHES = BRANCHES;

NS.ANIMAL_NOTE = {
  Rat:'quick, resourceful, first through the door',
  Ox:'steady, stubborn in the useful way, finishes things',
  Tiger:'bold, restless, hard to tell no',
  Rabbit:'careful, diplomatic, reads the room',
  Dragon:'big presence, big weather, does not do small',
  Snake:'private, strategic, thinks three moves out',
  Horse:'independent, fast, hates the fence',
  Goat:'gentle, artistic, needs safety to work',
  Monkey:'clever, playful, finds the shortcut',
  Rooster:'precise, candid, notices what you missed',
  Dog:'loyal, fair, keeps the line',
  Pig:'generous, sincere, enjoys the good part'
};
})(window.TD);
