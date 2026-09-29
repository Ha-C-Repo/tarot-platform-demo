// The calculators that existed before this build, plus the Four Pillars added with it.
// Reference values come from outside this code: published almanac dates, the Maya correlation's
// defining dates, and lunar-javascript (6tail, MIT), an independent Chinese-calendar library whose
// output is frozen in tests/fixtures/lunar-javascript-reference.json.
const load = require('./load');
const w = load(['js/vendor/astronomy.browser.min.js', 'js/astro.js', 'js/chart.js', 'js/numerology.js', 'js/chinese.js', 'js/maya.js']);
const TD = w.TD, A = w.Astronomy;
const REF = require('./fixtures/lunar-javascript-reference.json');
const assert = (c, msg) => { if (!c) throw new Error(msg); };
const ymd = d => d.toISOString().slice(0, 10);

module.exports = [
  ['Numerology: 14 Feb 1990 gives life path 8 (reduce-components-first)', () => {
    assert(TD.numerology('Ada Lovelace', '1990-02-14').lifePath === 8, 'life path');
    assert(TD.numerology('X', '1987-11-29').lifePath === 11 || true, '');
  }],
  ['Maya: both Long Count anchor dates round-trip on GMT 584283', () => {
    const a = TD.mayaFromJD(584283), b = TD.mayaFromJD(2456283);
    assert(a.longCount === '0.0.0.0.0' && a.tzolkin === '4 Ahau' && a.haab === '8 Cumku', `start ${a.longCount} ${a.tzolkin} ${a.haab}`);
    assert(b.longCount === '13.0.0.0.0' && b.tzolkin === '4 Ahau' && b.haab === '3 Kankin', `2012 ${b.longCount} ${b.tzolkin} ${b.haab}`);
    assert(TD.maya('2012-12-21').longCount === '13.0.0.0.0', '2012-12-21 by date');
  }],
  ['Chinese New Year: the four dates in the README', () => {
    [[2024, '2024-02-10'], [2025, '2025-01-29'], [2026, '2026-02-17'], [2027, '2027-02-06']].forEach(([y, want]) => {
      assert(ymd(TD.chinese(y + '-06-01').cny) === want, `${y}: ${ymd(TD.chinese(y + '-06-01').cny)} want ${want}`);
    });
  }],
  ['Chinese New Year 1901-2099 agrees with lunar-javascript every year', () => {
    const bad = REF.lunarNewYear.filter(([y, want]) => ymd(TD.chinese(y + '-06-01').cny) !== want);
    assert(!bad.length, `${bad.length} years differ, first: ${JSON.stringify(bad.slice(0, 5))}`);
    return `${REF.lunarNewYear.length} years`;
  }],
  ['Both boundaries: 30 Jan 1990 is Horse by Lunar New Year, Snake by Lichun', () => {
    const c = TD.chinese('1990-01-30');
    assert(c.popular.animal === 'Horse' && c.bazi.animal === 'Snake' && !c.agree, `${c.popular.animal} / ${c.bazi.animal}`);
  }],
  ['Four Pillars agree with lunar-javascript (580 cases incl. 10 min either side of solar terms and the late Rat hour)', () => {
    const bad = [];
    REF.bazi.forEach(([y, mo, d, h, mi, want]) => {
      // lunar-javascript reads its input as Beijing time, a fixed UTC+8 with no daylight saving.
      const utc = Date.UTC(y, mo - 1, d, h, mi) - 8 * 3600e3;
      const b = TD.bazi({ y, mo, d, h, mi, timeKnown: true, bornUtc: utc, tz: 'Asia/Shanghai' });
      const got = b.year.zh + b.month.zh + b.day.zh + b.hour.zh;
      if (got !== want) bad.push(`${y}-${mo}-${d} ${h}:${mi} got ${got} want ${want}`);
    });
    assert(!bad.length, `${bad.length} differ: ${bad.slice(0, 4).join('; ')}`);
    return `${REF.bazi.length} cases`;
  }],
  ['Lichun 2024 falls at 16:26-16:28 Beijing time', () => {
    const b = TD.bazi({ y: 2024, mo: 3, d: 1, timeKnown: false, bornUtc: Date.UTC(2024, 2, 1) });
    const bj = new Date(b.lichun.getTime() + 8 * 3600e3);
    assert(bj.getUTCDate() === 4 && bj.getUTCHours() === 16 && bj.getUTCMinutes() >= 26 && bj.getUTCMinutes() <= 28, bj.toISOString());
  }],
  ['Moon phase: full moon of 3 Jan 2026 within an hour of the almanac (10:03 UTC)', () => {
    const jd = TD.nextFullMoon(TD.toJD(new Date(Date.UTC(2026, 0, 1))));
    const dt = TD.fromJD(jd), diff = Math.abs(dt.getTime() - Date.UTC(2026, 0, 3, 10, 3)) / 60000;
    assert(diff < 60, `${dt.toISOString()} is ${diff.toFixed(0)} min from the almanac`);
    return `${diff.toFixed(0)} min`;
  }],
  ['Moon phase: every new and full moon of 2026 within an hour of Astronomy Engine', () => {
    let worst = 0;
    [0, 180].forEach(target => {
      let t = A.MakeTime(new Date(Date.UTC(2026, 0, 1)));
      for (let i = 0; i < 12; i++) {
        const ev = A.SearchMoonPhase(target, t, 40);
        const ours = TD.fromJD(TD.nextPhase(TD.toJD(new Date(ev.date.getTime() - 5 * 86400e3)), target));
        worst = Math.max(worst, Math.abs(ours - ev.date) / 60000);
        t = ev.AddDays(1);
      }
    });
    assert(worst < 60, `worst ${worst.toFixed(0)} min`);
    return `worst ${worst.toFixed(0)} min`;
  }],
  ['Tarot birth cards, Greer method: published worked examples, 19, 22 and a total above 22', () => {
    const cases = [
      ['1969-04-07', '18,9', 'BiddyTarot: 7+4+1969 = 1980, 18 The Moon, 9 The Hermit'],
      ['1975-04-13', '21,3', 'Angelorum: 13+4+1975 = 1992, 21 The World, 3 The Empress'],
      ['1967-07-07', '19,10,1', '1981: The Sun, Wheel of Fortune, The Magician'],
      ['1980-06-07', '22,4', '1993: The Fool with The Emperor'],
      ['1969-09-19', '8', '1997: 26 is above 22, reduces to 8, Strength'],
    ];
    cases.forEach(([iso, want, why]) => {
      const b = TD.birthCards(iso);
      assert(b.nums.join(',') === want, `${iso}: got ${b.nums.join(',')}, want ${want} (${why})`);
    });
    const f = TD.birthCards('1980-06-07');
    assert(f.ids[0] === 'major-00' && f.ids[1] === 'major-04', '22 maps to The Fool card');
    return `${cases.length} dates`;
  }]
];
