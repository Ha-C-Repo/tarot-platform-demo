/* moonviz.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   Draws the Moon for a given phase angle (0 new, 180 full) as an SVG: the near side's maria
   and a handful of named craters, then the phase shadow over the top. North is up, as seen
   from the northern hemisphere, and the lit limb is on the right while waxing.

   The surface is our own drawing of the Moon's main features, placed by eye from their
   selenographic positions. It is not traced from any photograph. */
window.TD = window.TD || {};
(function(NS){
'use strict';

/* Maria: [cx, cy, rx, ry, rotation] in a 100x100 box. Blobs, overlapped for irregular edges. */
const MARIA = [
  // Oceanus Procellarum, the big western plain
  [22, 46, 11, 22, 8], [28, 60, 9, 12, -10], [18, 34, 7, 9, 20], [30, 38, 7, 8, 0],
  // Mare Imbrium
  [38, 30, 13, 10, -12], [44, 36, 7, 6, 0],
  // Mare Frigoris, the thin northern band
  [46, 17, 17, 3.2, -4], [30, 20, 7, 2.6, 18],
  // Mare Serenitatis
  [58, 31, 7.5, 7, 0],
  // Mare Vaporum, Sinus Medii
  [49, 42, 4.5, 3.5, 0], [52, 50, 3, 2.4, 0],
  // Mare Tranquillitatis
  [66, 45, 9, 7.5, 20], [61, 51, 5, 4, 0],
  // Mare Crisium
  [81, 35, 5.5, 4.6, 0],
  // Mare Fecunditatis
  [76, 57, 5.5, 8, -15],
  // Mare Nectaris
  [65, 62, 4, 4.2, 0],
  // Mare Nubium and Mare Cognitum
  [42, 66, 9, 6.5, 10], [36, 58, 5, 4, 0],
  // Mare Humorum
  [25, 67, 5, 4.6, 0]
];
/* Craters: [cx, cy, r, bright?]. Bright = young ray craters (Tycho, Copernicus, Kepler, Aristarchus). */
const CRATERS = [
  [44, 81, 3.2, 1], [37, 45, 2.8, 1], [26, 47, 1.7, 1], [19, 31, 1.4, 1],
  [55, 72, 2.6, 0], [60, 84, 3, 0], [50, 90, 2.2, 0], [34, 88, 2.4, 0], [70, 76, 2.4, 0],
  [30, 77, 2, 0], [74, 68, 1.8, 0], [58, 62, 1.6, 0], [86, 50, 1.6, 0], [80, 78, 2, 0],
  [48, 23, 1.6, 0], [66, 22, 2, 0], [55, 11, 1.8, 0], [72, 30, 1.4, 0], [14, 58, 1.8, 0], [40, 74, 1.4, 0]
];
/* Tycho's rays: angle (deg), length */
const RAYS = [[-70, 40], [-100, 36], [-40, 30], [-130, 26], [-15, 24], [200, 18], [160, 16], [20, 14]];

function surface(id){
  // Maria are drawn as one flat-coloured group with the opacity on the group, so overlapping
  // blobs merge into a single soft-edged sea instead of showing their seams.
  const maria = MARIA.map(([x, y, rx, ry, rot]) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})"/>`).join('');
  const cores = MARIA.filter((m, i) => [0, 4, 8, 11, 13].includes(i)).map(([x, y, rx, ry, rot]) =>
    `<ellipse cx="${x + .6}" cy="${y + .6}" rx="${(rx * .55).toFixed(2)}" ry="${(ry * .55).toFixed(2)}" transform="rotate(${rot} ${x} ${y})"/>`).join('');
  const rays = RAYS.map(([a, len]) => {
    const r = a * Math.PI / 180, x2 = 44 + Math.cos(r) * len, y2 = 81 + Math.sin(r) * len;
    return `<line x1="44" y1="81" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
  }).join('');
  const craters = CRATERS.map(([x, y, r, b]) => b
    ? `<circle cx="${x}" cy="${y}" r="${(r * 1.5).toFixed(2)}" fill="#FFFFFF" opacity=".28"/>
       <circle cx="${x}" cy="${y}" r="${(r * .7).toFixed(2)}" fill="#FFFFFF" opacity=".9"/>`
    : `<path d="M ${x - r} ${y} A ${r} ${r} 0 0 1 ${x + r} ${y}" fill="none" stroke="#6E6478" stroke-opacity=".45" stroke-width=".8"/>
       <path d="M ${x - r} ${y} A ${r} ${r} 0 0 0 ${x + r} ${y}" fill="none" stroke="#FFFFFF" stroke-opacity=".5" stroke-width=".7"/>`).join('');
  return `<filter id="${id}b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.2"/></filter>
  <g id="${id}s">
    <circle cx="50" cy="50" r="50" fill="url(#${id}g)"/>
    <g fill="#877D93" opacity=".6" filter="url(#${id}b)">${maria}</g>
    <g fill="#6C6379" opacity=".32" filter="url(#${id}b)">${cores}</g>
    <g stroke="#FFFFFF" stroke-opacity=".3" stroke-width="1.4" stroke-linecap="round" filter="url(#${id}b)">${rays}</g>
    ${craters}
    <circle cx="50" cy="50" r="50" fill="url(#${id}l)"/>
  </g>`;
}

function moonSVG(angle, size = 64){
  const a = ((angle % 360) + 360) % 360;
  const r = 50, cx = 50, cy = 50;
  const k = Math.cos(a * Math.PI / 180);       // +1 new, -1 full
  const rx = Math.abs(k) * r;                  // terminator ellipse half-width
  const waxing = a < 180;
  const outer = `M ${cx} ${cy - r} A ${r} ${r} 0 0 ${waxing ? 1 : 0} ${cx} ${cy + r}`;
  const termSweep = (k > 0) === waxing ? 0 : 1;
  const lit = `${outer} A ${rx} ${r} 0 0 ${termSweep} ${cx} ${cy - r} Z`;
  const id = 'mn' + Math.random().toString(36).slice(2, 8);
  const label = size >= 60 ? ` role="img" aria-label="The Moon, ${Math.round((1 - k) * 50)}% lit"` : ' aria-hidden="true"';
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="msvg"${label}>
    <defs>
      <radialGradient id="${id}g" cx="44%" cy="40%" r="62%">
        <stop offset="0%" stop-color="#F7F3F8"/><stop offset="70%" stop-color="#DDD6E2"/><stop offset="100%" stop-color="#BDB4C6"/>
      </radialGradient>
      <radialGradient id="${id}l" cx="50%" cy="50%" r="50%">
        <stop offset="78%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#1B1224" stop-opacity=".35"/>
      </radialGradient>
      <clipPath id="${id}c"><path d="${lit}"/></clipPath>
      <clipPath id="${id}d"><circle cx="50" cy="50" r="50"/></clipPath>
      ${surface(id)}
    </defs>
    <g clip-path="url(#${id}d)">
      <circle cx="50" cy="50" r="50" fill="#140D1D"/>
      <use href="#${id}s" opacity=".13"/>
      <g clip-path="url(#${id}c)"><use href="#${id}s"/></g>
    </g>
    <circle cx="50" cy="50" r="49.5" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1"/>
  </svg>`;
}
NS.moonSVG = moonSVG;
})(window.TD);
