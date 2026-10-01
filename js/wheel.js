/* wheel.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   Draws a chart wheel into an element with AstroChart (js/vendor/astrochart.js, MIT) from a chart made by
   chart.js. Used by the birth chart and the astrology tools. Colours come from the site's CSS tokens. */
window.TD = window.TD || {};
(function(NS){
'use strict';
NS.drawWheel = function(id, c){
  const box = document.getElementById(id); if (!box || !window.astrochart) return;
  box.innerHTML = '';
  const cs = getComputedStyle(document.documentElement), v = n => cs.getPropertyValue(n).trim();
  const size = Math.min(560, box.clientWidth || 360);
  const planets = {};
  c.planets.forEach(p => { planets[p.key] = [p.lon, p.speed]; });
  if (c.node != null) { planets.NNode = [c.node]; planets.SNode = [(c.node + 180) % 360]; }
  if (c.lilith != null) planets.Lilith = [c.lilith];
  if (c.chiron) planets.Chiron = [c.chiron.lon, c.chiron.speed];
  if (c.fortune != null) planets.Fortune = [c.fortune];
  // No birth time: no Ascendant, so the wheel uses whole signs from 0 Aries and draws no angles.
  const cusps = c.cusps || Array.from({length: 12}, (_, i) => i * 30);
  const ink = v('--text') || '#eee', line = v('--line') || '#444', muted = v('--muted') || '#999';
  const settings = {
    COLOR_BACKGROUND: 'transparent', POINTS_COLOR: ink, SIGNS_COLOR: ink, CIRCLE_COLOR: line, LINE_COLOR: line,
    CUSPS_FONT_COLOR: muted, SYMBOL_AXIS_FONT_COLOR: ink, STROKE_ONLY: false, SHOW_DIGNITIES_TEXT: false,
    COLOR_ARIES: v('--a1'), COLOR_LEO: v('--a1'), COLOR_SAGITTARIUS: v('--a1'),
    COLOR_TAURUS: v('--a4'), COLOR_VIRGO: v('--a4'), COLOR_CAPRICORN: v('--a4'),
    COLOR_GEMINI: v('--a5'), COLOR_LIBRA: v('--a5'), COLOR_AQUARIUS: v('--a5'),
    COLOR_CANCER: v('--a3'), COLOR_SCORPIO: v('--a3'), COLOR_PISCES: v('--a3'),
    ASPECTS: { conjunction: { degree: 0, orbit: 6, color: 'transparent' }, sextile: { degree: 60, orbit: 4, color: v('--a3') },
               square: { degree: 90, orbit: 6, color: '#FF6B81' }, trine: { degree: 120, orbit: 6, color: v('--a4') },
               opposition: { degree: 180, orbit: 6, color: '#FF6B81' } }
  };
  try {
    const ch = new astrochart.Chart(id, size, size, settings);
    const r = ch.radix({ planets, cusps });
    r.aspects();
    if (!c.angles) box.querySelectorAll('[id$="-axis"]').forEach(e => e.remove());
  } catch (e) { box.innerHTML = '<p class="note">The wheel could not be drawn here. The tables below have every position.</p>'; }
};
})(window.TD);
