/* kundli.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   Draws a Vedic chart (kundli) as inline SVG, North Indian (houses fixed, signs move) or South Indian (signs
   fixed, houses move). Input: the rising sign index (0 = Aries), a list of {abbr, sign, retro}, a title, and asc = false when the
   chart is drawn from the Moon sign (no birth time): the first house is then not labelled As. Colours
   come from the site's CSS tokens through currentColor and var(). */
window.TD = window.TD || {};
(function(NS){
'use strict';
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const label = p => p.abbr + (p.retro ? '<tspan font-size="8" dy="-3">R</tspan>' : '');

/* Text lines centred on (x, y), perRow items to a line. */
function stack(items, x, y, perRow){
  const rows = [];
  for (let i = 0; i < items.length; i += perRow) rows.push(items.slice(i, i + perRow));
  const lh = 13, y0 = y - (rows.length - 1) * lh / 2;
  return rows.map((r, i) => `<text x="${x}" y="${y0 + i * lh}" text-anchor="middle" dominant-baseline="middle">${r.map((p, j) =>
    `${j ? '<tspan> </tspan>' : ''}<tspan${p.lagna ? ' class="kl"' : ''}>${label(p)}</tspan>`).join('')}</text>`).join('');
}

/* North Indian: house 1 is the top diamond, houses run anticlockwise. */
const N_CENTER = [null, [150, 72], [75, 26], [26, 75], [72, 150], [26, 225], [75, 274], [150, 228], [225, 274], [274, 225], [228, 150], [274, 75], [225, 26]];
const N_NUM = [null, [150, 132], [75, 62], [62, 75], [132, 150], [62, 225], [75, 238], [150, 168], [225, 238], [238, 225], [168, 150], [238, 75], [225, 62]];
const N_PER = [0, 2, 3, 1, 2, 1, 3, 2, 3, 1, 2, 1, 3];
function north(lagna, pts, title, asc = true){
  let s = `<line x1="0" y1="0" x2="300" y2="300"/><line x1="300" y1="0" x2="0" y2="300"/><polygon points="150,0 300,150 150,300 0,150" fill="none"/>`;
  let t = '';
  for (let h = 1; h <= 12; h++) {
    const sign = (lagna + h - 1) % 12, inside = pts.filter(p => p.sign === sign);
    if (h === 1 && asc) inside.unshift({ abbr: 'As', lagna: true });
    t += `<text class="kn" x="${N_NUM[h][0]}" y="${N_NUM[h][1]}" text-anchor="middle" dominant-baseline="middle">${sign + 1}</text>`;
    t += stack(inside, N_CENTER[h][0], N_CENTER[h][1], N_PER[h]);
  }
  return frame(s, t, title);
}

/* South Indian: Pisces top left, signs run clockwise round the edge; the rising sign is marked "As". */
const S_CELL = [[1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [3, 3], [2, 3], [1, 3], [0, 3], [0, 2], [0, 1], [0, 0]];   // Aries first
const SHORT = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'];
function south(lagna, pts, title, asc = true){
  let s = '<rect x="0" y="0" width="300" height="300" fill="none"/>';
  [75, 150, 225].forEach(v => { s += `<line x1="${v}" y1="0" x2="${v}" y2="${v === 150 ? 75 : 300}"/><line x1="${v}" y1="${v === 150 ? 225 : 0}" x2="${v}" y2="300"/>`;
    s += `<line x1="0" y1="${v}" x2="${v === 150 ? 75 : 300}" y2="${v}"/><line x1="${v === 150 ? 225 : 0}" y1="${v}" x2="300" y2="${v}"/>`; });
  s += '<rect x="75" y="75" width="150" height="150" fill="none"/>';
  let t = '';
  S_CELL.forEach(([cx, cy], sign) => {
    const x = cx * 75, y = cy * 75, inside = pts.filter(p => p.sign === sign);
    if (sign === lagna) { if (asc) inside.unshift({ abbr: 'As', lagna: true }); s += `<line class="kd" x1="${x}" y1="${y + 16}" x2="${x + 16}" y2="${y}"/>`; }
    t += `<text class="kn" x="${x + 71}" y="${y + 11}" text-anchor="end">${SHORT[sign]}</text>`;
    t += stack(inside, x + 37.5, y + 42, 2);
  });
  return frame(s, t, title, true);
}

function frame(lines, text, title, centre){
  return `<svg class="kundli" viewBox="-2 -2 304 304" role="img" aria-label="${esc(title)}">
    <g fill="none" stroke="var(--line)" stroke-width="1.2">${lines}</g>
    <g fill="var(--text)" font-size="11.5" font-weight="600">${text}</g>
    ${centre ? `<text x="150" y="150" text-anchor="middle" dominant-baseline="middle" fill="var(--muted)" font-size="12">${esc(title)}</text>` : ''}</svg>`;
}

NS.kundli = { north, south };
})(window.TD);
