/* astro.js — classic script; assigns to window.TD. No ES modules, so file:// works. */
window.TD = window.TD || {};
(function(NS){
'use strict';
// astro.js — Sun/Moon longitudes (Meeus), phases, solar terms, Chinese new year.
// Accuracy: Sun ~0.01 deg, Moon ~0.3 deg. Ample for sign, phase and calendar-day boundaries.
const RAD = Math.PI / 180;
const norm360 = d => ((d % 360) + 360) % 360;

function toJD(date) { return date.getTime() / 86400000 + 2440587.5; }
function fromJD(jd) { return new Date((jd - 2440587.5) * 86400000); }
const T = jd => (jd - 2451545.0) / 36525;

/* Meeus ch.25, apparent geometric longitude of the Sun */
function sunLongitude(jd) {
  const t = T(jd);
  const L0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
  const M  = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
  const Mr = M * RAD;
  const C = (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(Mr)
          + (0.019993 - 0.000101 * t) * Math.sin(2 * Mr)
          + 0.000289 * Math.sin(3 * Mr);
  const trueLon = L0 + C;
  const omega = 125.04 - 1934.136 * t;
  return norm360(trueLon - 0.00569 - 0.00478 * Math.sin(omega * RAD));
}

/* Meeus ch.47, truncated. Principal periodic terms only. */
function moonLongitude(jd) {
  const t = T(jd);
  const Lp = 218.3164477 + 481267.88123421 * t - 0.0015786 * t * t;
  const D  = 297.8501921 + 445267.1114034 * t - 0.0018819 * t * t;
  const M  = 357.5291092 + 35999.0502909 * t - 0.0001536 * t * t;
  const Mp = 134.9633964 + 477198.8675055 * t + 0.0087414 * t * t;
  const F  = 93.2720950 + 483202.0175233 * t - 0.0036539 * t * t;
  const d = D * RAD, m = M * RAD, mp = Mp * RAD, f = F * RAD;
  const s =
      6.288774 * Math.sin(mp)
    + 1.274027 * Math.sin(2 * d - mp)
    + 0.658314 * Math.sin(2 * d)
    + 0.213618 * Math.sin(2 * mp)
    - 0.185116 * Math.sin(m)
    - 0.114332 * Math.sin(2 * f)
    + 0.058793 * Math.sin(2 * d - 2 * mp)
    + 0.057066 * Math.sin(2 * d - m - mp)
    + 0.053322 * Math.sin(2 * d + mp)
    + 0.045758 * Math.sin(2 * d - m)
    - 0.040923 * Math.sin(m - mp)
    - 0.034720 * Math.sin(d)
    - 0.030383 * Math.sin(m + mp)
    + 0.015327 * Math.sin(2 * d - 2 * f)
    - 0.012528 * Math.sin(mp + 2 * f)
    + 0.010980 * Math.sin(mp - 2 * f)
    + 0.010675 * Math.sin(4 * d - mp)
    + 0.010034 * Math.sin(3 * mp)
    + 0.008548 * Math.sin(4 * d - 2 * mp)
    - 0.007888 * Math.sin(2 * d + m - mp)
    - 0.006766 * Math.sin(2 * d + m)
    - 0.005163 * Math.sin(d - mp)
    + 0.004987 * Math.sin(d + m)
    + 0.004036 * Math.sin(2 * d - m + mp)
    + 0.003994 * Math.sin(2 * d + 2 * mp)
    + 0.003861 * Math.sin(4 * d)
    + 0.003665 * Math.sin(2 * d - 3 * mp);
  return norm360(Lp + s);
}

/* Elongation of Moon from Sun, 0 = new, 180 = full */
const phaseAngle = jd => norm360(moonLongitude(jd) - sunLongitude(jd));
const illumination = jd => (1 - Math.cos(phaseAngle(jd) * RAD)) / 2;

/* Generic root finder for a normalised angular target */
function findAngle(fn, target, jdStart, step, maxDays) {
  const diff = jd => { let d = norm360(fn(jd) - target); return d > 180 ? d - 360 : d; };
  let prev = diff(jdStart), jd = jdStart;
  for (let i = 1; i <= maxDays / step; i++) {
    const cur = diff(jdStart + i * step);
    if (prev < 0 && cur >= 0) {
      let lo = jdStart + (i - 1) * step, hi = jdStart + i * step;
      for (let k = 0; k < 60; k++) {
        const mid = (lo + hi) / 2;
        (diff(mid) < 0 ? lo = mid : hi = mid);
      }
      return (lo + hi) / 2;
    }
    prev = cur; jd = jdStart + i * step;
  }
  return null;
}

const nextPhase = (jd, target) => findAngle(phaseAngle, target, jd, 0.5, 40);
const nextNewMoon  = jd => nextPhase(jd, 0);
const nextFullMoon = jd => nextPhase(jd, 180);
/* Solar term: the instant solar longitude reaches `deg` */
const solarTerm = (jd, deg) => findAngle(sunLongitude, deg, jd, 0.5, 400);

const PHASES = [
  ['New Moon', 0], ['Waxing Crescent', 45], ['First Quarter', 90], ['Waxing Gibbous', 135],
  ['Full Moon', 180], ['Waning Gibbous', 225], ['Last Quarter', 270], ['Waning Crescent', 315]
];
function phaseName(jd) {
  const a = phaseAngle(jd);
  const i = Math.floor(((a + 22.5) % 360) / 45);
  return PHASES[i][0];
}

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra',
                      'Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const SIGN_GLYPH = ['♈','♉','♊','♋','♌','♍',
                           '♎','♏','♐','♑','♒','♓'];
const ELEMENT  = ['Fire','Earth','Air','Water'];
const signOf     = lon => SIGNS[Math.floor(norm360(lon) / 30)];
const signIndex  = lon => Math.floor(norm360(lon) / 30);
const moonSign   = jd => signOf(moonLongitude(jd));
const sunSign    = jd => signOf(sunLongitude(jd));
const elementOf  = i => ELEMENT[i % 4];
const MODALITY   = ['Cardinal','Fixed','Mutable'];
const modalityOf = i => MODALITY[i % 3];

/* Lichun: solar longitude 315 deg, around 3-5 Feb */
function lichun(year) {
  const jd = toJD(new Date(Date.UTC(year, 0, 15)));
  return solarTerm(jd, 315);
}
/* Chinese New Year: the 2nd new moon after the December solstice of the previous year */
function chineseNewYear(year) {
  const solsticeJD = solarTerm(toJD(new Date(Date.UTC(year - 1, 10, 20))), 270);
  let nm = nextNewMoon(solsticeJD);
  nm = nextNewMoon(nm + 1);
  return nm;
}
NS.RAD = RAD;
NS.toJD = toJD;
NS.fromJD = fromJD;
NS.sunLongitude = sunLongitude;
NS.moonLongitude = moonLongitude;
NS.phaseAngle = phaseAngle;
NS.illumination = illumination;
NS.nextPhase = nextPhase;
NS.nextNewMoon = nextNewMoon;
NS.nextFullMoon = nextFullMoon;
NS.solarTerm = solarTerm;
NS.PHASES = PHASES;
NS.phaseName = phaseName;
NS.SIGNS = SIGNS;
NS.SIGN_GLYPH = SIGN_GLYPH;
NS.ELEMENT = ELEMENT;
NS.signOf = signOf;
NS.signIndex = signIndex;
NS.moonSign = moonSign;
NS.sunSign = sunSign;
NS.elementOf = elementOf;
NS.MODALITY = MODALITY;
NS.modalityOf = modalityOf;
NS.lichun = lichun;
NS.chineseNewYear = chineseNewYear;
})(window.TD);
