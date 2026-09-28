/* moonviz.js — classic script; assigns to window.TD. No ES modules, so file:// works. */
window.TD = window.TD || {};
(function(NS){
'use strict';
/* moonviz.js — SVG moon disc for a given phase angle (0 new, 180 full).
   Lit limb is on the right while waxing (0-180), left while waning. */
function moonSVG(angle, size = 64){
  const a = ((angle % 360) + 360) % 360;
  const r = 50, cx = 50, cy = 50;
  const k = Math.cos(a * Math.PI / 180);       // +1 new, -1 full
  const rx = Math.abs(k) * r;                  // terminator ellipse-width
  const waxing = a < 180;
  // Outer lit-circle on the lit side, plus terminator ellipse half.
  const litSweep = waxing ? 1 : 0;
  const outer = `M ${cx} ${cy - r} A ${r} ${r} 0 0 ${litSweep} ${cx} ${cy + r}`;
  // Terminator: bulges toward lit side when gibbous (k<0), away when crescent (k>0)
  const termSweep = (k > 0) === waxing ? 0 : 1;
  const term = `A ${rx} ${r} 0 0 ${termSweep} ${cx} ${cy - r}`;
  const id = 'mg' + Math.random().toString(36).slice(2, 8);
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="msvg" aria-hidden="true">
    <defs><radialGradient id="${id}" cx="62%" cy="36%">
      <stop offset="0%" stop-color="#FFFDF8"/><stop offset="100%" stop-color="#DCD2E4"/>
    </radialGradient><clipPath id="${id}c"><circle cx="50" cy="50" r="50"/></clipPath></defs>
    <circle cx="50" cy="50" r="50" fill="rgba(255,255,255,.055)"/>
    <path d="${outer} ${term} Z" fill="url(#${id})" clip-path="url(#${id}c)"/>
    <circle cx="50" cy="50" r="50" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="1"/>
  </svg>`;
}
NS.moonSVG = moonSVG;
})(window.TD);
