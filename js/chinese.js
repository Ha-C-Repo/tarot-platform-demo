/* chinese.js — animal, element and the two year boundaries, computed from the real
   lunisolar calendar. Deliberately NOT a year-to-animal lookup table: see the note
   rendered on the page. Dates are evaluated in China Standard Time (UTC+8), which is
   the convention the calendar is defined in. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const ANIMALS = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'];
const EMOJI   = ['\u{1F401}','\u{1F402}','\u{1F405}','\u{1F407}','\u{1F409}','\u{1F40D}',
                 '\u{1F40E}','\u{1F410}','\u{1F412}','\u{1F413}','\u{1F415}','\u{1F416}'];
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
           animal: ANIMALS[branch], emoji: EMOJI[branch], branchIndex: branch };
}
NS.chinese = function(iso){
  const birth = new Date(iso + 'T12:00:00Z');
  const jd = NS.toJD(birth);
  const gy = birth.getUTCFullYear();
  const day = dayInCST(jd);

  const cnyThis = NS.chineseNewYear(gy), lcThis = NS.lichun(gy);
  const afterCNY = day >= dayInCST(cnyThis);
  const afterLC  = day >= dayInCST(lcThis);

  const popularYear = afterCNY ? gy : gy - 1;   // Lunar New Year boundary
  const baziYear    = afterLC  ? gy : gy - 1;   // Lichun boundary
  const popular = pillar(popularYear), bazi = pillar(baziYear);

  return {
    popular, bazi, agree: popularYear === baziYear,
    cny: cstDateOf(cnyThis), lichun: cstDateOf(lcThis),
    popularYear, baziYear,
    nextCny: cstDateOf(NS.chineseNewYear(gy + 1))
  };
};
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
