/* maya.js — traditional Tzolk'in, Haab' and Long Count on the Goodman-Martinez-Thompson
   correlation (584283). This is NOT Dreamspell: no galactic signatures, no wavespells,
   no 13 Moon calendar. Verified against 0.0.0.0.0 = 4 Ahau 8 Cumku and
   13.0.0.0.0 = 4 Ahau 3 Kankin. */
window.TD = window.TD || {};
(function(NS){
'use strict';
const GMT = 584283;
const SIGNS = ['Imix','Ik','Akbal','Kan','Chicchan','Cimi','Manik','Lamat','Muluc','Oc',
               'Chuen','Eb','Ben','Ix','Men','Cib','Caban','Etznab','Cauac','Ahau'];
const HAAB = ['Pop','Uo','Zip','Zotz','Tzec','Xul','Yaxkin','Mol','Chen','Yax','Zac','Ceh',
              'Mac','Kankin','Muan','Pax','Kayab','Cumku','Uayeb'];
const SIGN_NOTE = {
  Imix:'the first thing, raw material, the nurturing start',
  Ik:'breath, wind, what moves and what is said',
  Akbal:'night, the interior, dreaming and the house',
  Kan:'the seed, ripening, what is stored for later',
  Chicchan:'the serpent, the body’s own knowing, life force',
  Cimi:'the handing over, endings, what is owed to the dead',
  Manik:'the hand, the grip, healing and the making of things',
  Lamat:'the star, abundance, seed scattered wide',
  Muluc:'water offered, memory, the sign that asks payment',
  Oc:'the dog, loyalty, the one who guides through',
  Chuen:'the monkey, craft, play as serious work',
  Eb:'the road, the long descent, human weather',
  Ben:'the reed, the standing pillar, growth with a spine',
  Ix:'the jaguar, the earth’s own power, night sight',
  Men:'the eagle, the high view, ambition and distance',
  Cib:'the candle, old counsel, the weight of what came before',
  Caban:'earth, movement, the mind and the quake',
  Etznab:'the blade, clean separation, the mirror that does not flatter',
  Cauac:'the storm, gathering, release and renewal',
  Ahau:'the lord, the sun, completion and the finished face'
};
NS.mayaFromJD = function(jdInt){
  const d = Math.floor(jdInt) - GMT;
  const tzNum  = ((d + 3) % 13 + 13) % 13 + 1;
  const tzSign = SIGNS[((d + 19) % 20 + 20) % 20];
  const doy    = ((d + 348) % 365 + 365) % 365;
  const hMonth = Math.floor(doy / 20), hDay = doy % 20;
  const lc = [];
  let r = d;
  [144000, 7200, 360, 20, 1].forEach(u => { lc.push(Math.floor(r / u)); r -= Math.floor(r / u) * u; });
  return {
    tzolkin: `${tzNum} ${tzSign}`, tzNum, tzSign, note: SIGN_NOTE[tzSign],
    haab: `${hDay} ${HAAB[hMonth]}`, longCount: lc.join('.'),
    cyclePos: (((d + 3) % 13 + 13) % 13) + 1 && ((((d) % 260) + 260) % 260) + 1
  };
};
NS.maya = function(iso){
  const dt = new Date(iso + 'T12:00:00Z');
  return NS.mayaFromJD(Math.floor(NS.toJD(dt) + 0.5));
};
NS.MAYA_CORRELATION = GMT;
})(window.TD);
