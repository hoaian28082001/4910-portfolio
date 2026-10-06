/* Technical drawings (SVG) animated with anime.js.
   Usage: <svg class="sch" data-fig="wafer"></svg>  →  Schematic.render(svg); Schematic.draw(svg)
   Drawings are black & white; the only colour is in the moving parts (current pulses, litho scan). */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- primitives ---------- */
  const ln = (d, cls = '') => `<path class="ln ${cls}" d="${d}"/>`;
  const dsh = (d, cls = '') => `<path class="dsh ${cls}" d="${d}"/>`;
  const wire = (...pts) => ln('M' + pts.map(p => p.join(' ')).join('L'));
  const circ = (x, y, r, cls = '') => `<circle class="ln ${cls}" cx="${x}" cy="${y}" r="${r}"/>`;
  const dot = (x, y, r = 3) => `<circle class="dot" cx="${x}" cy="${y}" r="${r}"/>`;
  const box = (x, y, w, h, cls = '') => ln(`M${x} ${y}h${w}v${h}h${-w}Z`, cls);
  const txt = (x, y, s, a = 'start', cls = '') => `<text class="lbl ${cls}" x="${x}" y="${y}" text-anchor="${a}">${s}</text>`;
  const at = (x, y, r, inner, extra = '') => `<g transform="translate(${x} ${y})${r ? ` rotate(${r})` : ''}" ${extra}>${inner}</g>`;
  const scaled = (x, y, s, inner, extra = '') => `<g transform="translate(${x} ${y}) scale(${s})" ${extra}>${inner}</g>`;
  const fillShape = (d, pat) => `<path class="fill" fill="url(#${pat}-%UID%)" d="${d}"/>` + ln(d);

  const res = (L = 80) => ln(`M${-L / 2} 0H-24L-20 -8L-12 8L-4 -8L4 8L12 -8L20 8L24 0H${L / 2}`);
  const cap = () => ln('M-40 0H-5M-5 -16V16M5 -16V16M5 0H40');
  const ind = () => ln('M-40 0H-32' + 'a8 8 0 0 1 16 0'.repeat(4) + 'H40');
  const diode = () => ln('M-40 0H-10M-10 -12L10 0L-10 12ZM10 -12V12M10 0H40');
  const mos = p => ln('M0 -40V-18H-8M0 40V18H-8M-8 -24V24M-16 -18V18' + (p ? 'M-40 0H-24' : 'M-40 0H-16')) + (p ? circ(-20, 0, 4) : '');
  const gnd = () => ln('M0 0V12M-14 12H14M-9 18H9M-4 24H4');
  const src = ac => ln('M0 -40V-22M0 22V40') + circ(0, 0, 22) +
    (ac ? ln('M-12 0c4 -12 8 -12 12 0s8 12 12 0') : ln('M-5 -9H5M0 -14V-4M-5 10H5'));
  const opamp = () => ln('M-30 -36V36L36 0Z') + ln('M-50 -18H-30M-50 18H-30M36 0H56') + ln('M-25 -18h8M-21 -22v8M-25 18h8');
  const contact = (x, y) => ln(`M${x} ${y}h12v12h-12ZM${x} ${y}l12 12M${x + 12} ${y}l-12 12`);
  const ellipse = (cx, cy, rx, ry, cls = '') => ln(`M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0`, cls);

  /* isometric helper: x → right-down, y → left-down, z → up */
  function iso(ox, oy) {
    const C = 0.866, S = 0.5;
    const P = (x, y, z) => [+(ox + (x - y) * C).toFixed(1), +(oy + (x + y) * S - z).toFixed(1)];
    const p = a => a.join(' ');
    // solid block: two front faces + top, filled white so it hides what's behind
    const block = (x, y, z, w, d, t, hatch) => {
      const A = P(x, y, z + t), B = P(x + w, y, z + t), Cc = P(x + w, y + d, z + t), D = P(x, y + d, z + t);
      const B2 = P(x + w, y, z), C2 = P(x + w, y + d, z), D2 = P(x, y + d, z);
      const top = `M${p(A)}L${p(B)}L${p(Cc)}L${p(D)}Z`;
      return ln(`M${p(B)}L${p(B2)}L${p(C2)}L${p(Cc)}Z`, 'face side') +
        ln(`M${p(D)}L${p(Cc)}L${p(C2)}L${p(D2)}Z`, 'face') +
        ln(top, 'face') + (hatch ? `<path class="fill" fill="url(#${hatch}-%UID%)" d="${top}"/>` : '');
    };
    return { P, block };
  }

  /* ---------- figures ---------- */
  const F = {};

  /* --- grid one-line --- */
  F.oneline = () => {
    let b = '';
    b += circ(50, 90, 28) + ln('M36 90c4.7 -12 9.3 -12 14 0s9.3 12 14 0');
    b += wire([78, 90], [140, 90]) + ln('M140 40V140', 'bus');
    b += wire([140, 90], [170, 90]) + box(170, 80, 20, 20) + wire([190, 90], [214, 90]);
    b += circ(236, 90, 22) + circ(268, 90, 22) + wire([290, 90], [340, 90]) + ln('M340 40V140', 'bus');
    for (const y of [65, 115]) {
      b += wire([340, y], [370, y]) + box(370, y - 10, 20, 20) + wire([390, y], [770, y]) +
        box(770, y - 10, 20, 20) + wire([790, y], [820, y]);
    }
    b += ln('M820 40V140', 'bus') + wire([820, 90], [850, 90]) + circ(872, 90, 22) + circ(904, 90, 22);
    b += wire([926, 90], [980, 90]) + ln('M980 40V140', 'bus');
    b += wire([980, 90], [1040, 90]) + box(1040, 62, 56, 56) + ln('M1040 118L1096 62');
    b += ln('M1046 78c3 -7 6 -7 9 0s6 7 9 0') + ln('M1074 102h14M1074 108h14');
    b += wire([1096, 90], [1160, 90]) + box(1160, 62, 56, 56) + ln('M1160 118L1216 62');
    b += ln('M1166 74h14M1166 80h14') + ln('M1188 104c3 -7 6 -7 9 0s6 7 9 0');
    b += wire([1216, 90], [1290, 90]) + circ(1318, 90, 28);
    b += `<path class="flow" d="M78 90H340V65H820V90H1290"/>`;
    b += txt(580, 94, '345 kV TRANSMISSION', 'middle', 'sm') + txt(1128, 82, 'DC', 'middle', 'sm') + txt(1318, 96, 'M', 'middle', 'lg');
    for (const [x, s] of [[140, 'BUS 1'], [340, 'BUS 2'], [820, 'BUS 3'], [980, 'BUS 4']]) b += txt(x, 28, s, 'middle', 'sm');
    for (const [x, s] of [[50, 'G'], [252, 'T1'], [888, 'T2'], [1068, 'AC/DC'], [1188, 'DC/AC'], [1318, 'LOAD']]) b += txt(x, 146, s, 'middle');
    return { w: 1360, h: 156, body: b, play: playFlow };
  };

  /* --- power landscape: plant → step-up → lattice towers → substation --- */
  F.grid = () => {
    const B = 330;
    let b = '';
    // ground line with section hatching
    let hatch = '';
    for (let x = 6; x < 1400; x += 14) hatch += `M${x} ${B}l-7 9`;
    b += `<g class="g-ground">${ln(`M0 ${B}H1400`)}${ln(hatch, 'thin')}</g>`;

    // cooling towers (hyperboloids) with steam
    const tower = (ox, sc) => {
      let s = ln('M40 330Q85 195 62 160') + ln('M160 330Q115 195 138 160') + ellipse(100, 160, 38, 6);
      for (const t of [0.2, 0.4, 0.6, 0.8]) {
        const bx = 40 + 120 * t, tx = 62 + 76 * t, wx = 68 + 64 * t, cx = 2 * wx - 0.5 * (bx + tx);
        s += ln(`M${bx} 330Q${cx.toFixed(1)} 195 ${tx} 160`, 'thin');
      }
      s += dsh('M92 150c-12 -18 16 -30 2 -52c-10 -16 14 -28 6 -46', 'steam') + dsh('M110 152c10 -16 -12 -30 4 -50c12 -16 -8 -30 2 -44', 'steam');
      return `<g transform="translate(${ox} ${(B * (1 - sc)).toFixed(1)}) scale(${sc})">${s}</g>`;
    };
    let plant = tower(150, 0.8) + tower(0, 1);
    plant += ln('M300 330V258H410V330') + ln('M294 258L355 230L416 258');
    for (let i = 0; i < 5; i++) plant += ln(`M${312 + i * 19} 276h11v16h-11Z`, 'thin');
    plant += ln('M440 330V292H490V330');
    let fins = '';
    for (let x = 446; x <= 484; x += 6) fins += `M${x} 298V326`;
    plant += ln(fins, 'thin');
    for (const x of [450, 465, 480]) plant += ln(`M${x} 292V272`) + ellipse(x, 286, 4, 1.6, 'thin') + ellipse(x, 279, 4, 1.6, 'thin');
    b += `<g class="g-plant">${plant}</g>`;

    // lattice towers
    const lattice = x => {
      const xl = y => -34 + 24 * (y / 150);
      let s = ln(`M${x - 34} ${B}L${x - 10} ${B - 150}L${x - 8} ${B - 210}L${x} ${B - 224}L${x + 8} ${B - 210}L${x + 10} ${B - 150}L${x + 34} ${B}`);
      let br = '';
      for (let k = 0; k < 5; k++) {
        const y1 = k * 30, y2 = (k + 1) * 30, a = xl(y1), c = xl(y2);
        br += `M${x + a} ${B - y1}L${x - c} ${B - y2}M${x - a} ${B - y1}L${x + c} ${B - y2}M${x + c} ${B - y2}H${x - c}`;
      }
      br += `M${x - 10} ${B - 150}L${x + 9} ${B - 180}M${x + 10} ${B - 150}L${x - 9} ${B - 180}M${x - 9} ${B - 180}L${x + 8} ${B - 210}M${x + 9} ${B - 180}L${x - 8} ${B - 210}`;
      s += ln(br, 'thin');
      s += ln(`M${x - 60} ${B - 150}H${x + 60}M${x - 60} ${B - 150}L${x - 10} ${B - 138}M${x + 60} ${B - 150}L${x + 10} ${B - 138}`);
      s += ln(`M${x - 46} ${B - 190}H${x + 46}M${x - 46} ${B - 190}L${x - 9} ${B - 180}M${x + 46} ${B - 190}L${x + 9} ${B - 180}`);
      for (const [ix, top] of [[-56, 150], [56, 150], [-42, 190], [42, 190]]) {
        s += ln(`M${x + ix} ${B - top}V${B - top + 14}`) + ln(`M${x + ix - 3} ${B - top + 4}h6M${x + ix - 3} ${B - top + 8}h6M${x + ix - 3} ${B - top + 12}h6`, 'thin');
      }
      return `<g class="g-tower">${s}</g>`;
    };
    const TX = [640, 920, 1200];
    b += TX.map(lattice).join('');

    // substation gantry + transformer
    let sub = ln(`M1280 ${B}V226M1380 ${B}V226M1272 226H1388M1272 236H1388`);
    let zig = 'M1280 236';
    for (let x = 1290, up = true; x <= 1380; x += 10, up = !up) zig += `L${x} ${up ? 226 : 236}`;
    sub += ln(zig, 'thin');
    for (const x of [1290, 1320, 1350]) sub += ln(`M${x} 236V248`) + ln(`M${x - 3} 240h6M${x - 3} 244h6`, 'thin');
    sub += ln('M1300 330V290H1370V330') + ln('M1290 248L1312 270M1320 248V270M1350 248L1338 270');
    for (const x of [1312, 1325, 1338]) sub += ln(`M${x} 290V270`);
    let sfins = '';
    for (let x = 1306; x <= 1364; x += 6) sfins += `M${x} 296V326`;
    sub += ln(sfins, 'thin');
    b += `<g class="g-sub">${sub}</g>`;

    // conductors: one continuous path per phase so it draws left → right and carries pulses
    const span = (p, q, sag) => `Q${((p[0] + q[0]) / 2).toFixed(1)} ${((p[1] + q[1]) / 2 + sag).toFixed(1)} ${q[0]} ${q[1]}`;
    const phase = (start, dx, y, end) => {
      let pts = [start, ...TX.map(x => [x + dx, y]), end], d = `M${pts[0][0]} ${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) d += span(pts[i - 1], pts[i], i === 1 || i === pts.length - 1 ? 14 : 44);
      return d;
    };
    let cond = '';
    cond += ln(phase([450, 272], -56, 194, [1290, 248]), 'flowln');
    cond += ln(phase([465, 272], 56, 194, [1320, 248]), 'flowln');
    cond += ln(phase([480, 272], -42, 154, [1350, 248]), 'flowln');
    cond += ln(phase([465, 272], 42, 154, [1320, 248]), 'flowln thin');
    let shield = `M${TX[0]} ${B - 224}`;
    for (let i = 1; i < TX.length; i++) shield += span([TX[i - 1], B - 224], [TX[i], B - 224], 30);
    cond += ln(shield, 'thin');
    b += `<g class="g-cond">${cond}</g>`;

    b += txt(160, 360, 'GENERATION', 'middle', 'sm') + txt(465, 360, 'STEP-UP', 'middle', 'sm');
    b += txt(920, 360, 'TRANSMISSION · 345 kV', 'middle', 'sm') + txt(1330, 360, 'SUBSTATION', 'middle', 'sm');
    return { w: 1400, h: 372, body: b, play: playGrid };
  };

  /* --- silicon wafer with die map --- */
  function waferParts(cx, cy, R, p, target, dims = true) {
    let b = '', dies = '';
    const n = Math.ceil(R / p) + 1, lim = R - 14, s = p - 4;
    let hit = null;
    for (let i = -n; i < n; i++) for (let j = -n; j < n; j++) {
      const x = cx + i * p + 2, y = cy + j * p + 2;
      const far = Math.max(Math.hypot(x - cx, y - cy), Math.hypot(x + s - cx, y - cy), Math.hypot(x - cx, y + s - cy), Math.hypot(x + s - cx, y + s - cy));
      if (far > lim) continue;
      const d = Math.hypot(x + s / 2 - cx, y + s / 2 - cy).toFixed(0);
      dies += `<path class="ln die" data-d="${d}" d="M${x} ${y}h${s}v${s}h${-s}Z"/>`;
      if (target && i === target[0] && j === target[1]) hit = { x, y, s };
    }
    b += ln(`M${cx} ${cy}m${-R} 0a${R} ${R} 0 1 0 ${2 * R} 0a${R} ${R} 0 1 0 ${-2 * R} 0`, 'edge');
    b += dsh(`M${cx} ${cy}m${-(R - 10)} 0a${R - 10} ${R - 10} 0 1 0 ${2 * (R - 10)} 0a${R - 10} ${R - 10} 0 1 0 ${-2 * (R - 10)} 0`);
    b += ln(`M${cx - 9} ${cy + R - 1}L${cx} ${cy + R - 12}L${cx + 9} ${cy + R - 1}`);
    b += dies;
    b += dsh(`M${cx - R - 36} ${cy}H${cx + R + 36}M${cx} ${cy - R - 36}V${cy + R + 36}`, 'center');
    if (dims) {
      const yd = cy - R - 26;
      b += dsh(`M${cx - R} ${cy}V${yd - 8}M${cx + R} ${cy}V${yd - 8}`, 'light');
      b += ln(`M${cx - R} ${yd}H${cx + R}M${cx - R + 9} ${yd - 4}L${cx - R} ${yd}L${cx - R + 9} ${yd + 4}M${cx + R - 9} ${yd - 4}L${cx + R} ${yd}L${cx + R - 9} ${yd + 4}`, 'thin');
      b += `<text class="lbl dimtxt" x="${cx}" y="${yd - 8}" text-anchor="middle">Ø 300 mm</text>`;
      b += txt(cx + 16, cy + R - 16, 'NOTCH', 'start', 'sm');
    }
    // litho scan + highlighted die live in the colour layer
    let over = `<clipPath id="wc-%UID%"><circle cx="${cx}" cy="${cy}" r="${R - 2}"/></clipPath>`;
    over += `<g clip-path="url(#wc-%UID%)"><rect class="scan" x="${cx - R - 140}" y="${cy - R}" width="140" height="${2 * R}" fill="url(#scan-%UID%)" data-span="${2 * R + 140}"/></g>`;
    if (hit) over += `<path class="hl" d="M${hit.x} ${hit.y}h${hit.s}v${hit.s}h${-hit.s}Z"/>`;
    return { body: b, over, hit };
  }

  F.wafer = () => {
    const w = waferParts(320, 340, 280, 36, [2, -4]);
    return { w: 640, h: 660, body: w.body, over: w.over, play: playWafer };
  };

  /* --- exploded CMOS process stack (isometric) --- */
  function stackParts() {
    const W = 220, gap = 56, C = 0.866;
    const zs = [0, 30 + gap, 30 + 2 * gap, 30 + 3 * gap, 30 + 4 * gap, 30 + 5 * gap, 30 + 6 * gap];
    const zTop = zs[6] + 10;
    const I = iso(W * C + 4, zTop + 8);
    const L = [];
    L.push(['P-SUBSTRATE', I.block(0, 0, 0, W, W, 30, null)]);
    L.push(['ACTIVE (N+ / P+)', I.block(28, 24, zs[1], 70, 172, 6, 'd') + I.block(122, 24, zs[2 - 1], 70, 172, 6, 'd')]);
    L.push(['POLYSILICON GATES', [0, 1, 2].map(i => I.block(16, 56 + i * 46, zs[2], 188, 12, 6, 'p')).join('')]);
    let cts = '';
    for (const x of [56, 150]) for (const y of [34, 82, 128, 176]) cts += I.block(x, y, zs[3], 10, 10, 14, null);
    L.push(['CONTACTS', cts]);
    L.push(['METAL 1', [0, 1, 2, 3].map(i => I.block(40 + i * 48, 14, zs[4], 22, 192, 8, 'm')).join('')]);
    L.push(['VIAS', [0, 1, 2, 3].map(i => I.block(46 + i * 48, 100, zs[5], 10, 10, 12, null)).join('')]);
    L.push(['METAL 2', [0, 1, 2, 3].map(i => I.block(14, 22 + i * 50, zs[6], 192, 24, 8, 'm')).join('')]);
    // alignment guides through the stack corners
    let guide = '';
    for (const [x, y] of [[W, 0], [0, W], [W, W]]) {
      const a = I.P(x, y, 30), c = I.P(x, y, zTop);
      guide += `M${a[0]} ${a[1]}L${c[0]} ${c[1]}`;
    }
    let b = dsh(guide, 'light');
    L.forEach(([name, parts], i) => {
      const z = i === 0 ? 15 : zs[i] + 4;
      const a = I.P(W, 0, z);
      const lx = a[0] + 18, ly = a[1] + 4;
      b += `<g class="layer" data-i="${i}">${parts}${ln(`M${a[0] + 4} ${a[1]}H${lx - 4}`, 'thin')}${txt(lx, ly, name, 'start', 'sm')}</g>`;
    });
    return { body: b, w: W * 2 * C + 170, h: zTop + W + 30 };
  }

  F.stack = () => {
    const s = stackParts();
    return { w: s.w, h: s.h, body: s.body, play: playStack };
  };

  /* --- classic schematics --- */
  F.buck = () => {
    let b = '';
    b += at(40, 150, 0, src(false)) + wire([40, 110], [40, 60], [120, 60]) + wire([40, 190], [40, 240]);
    b += at(160, 60, -90, mos(false)) + ln('M144 118H152V106H160V118H168V106H176V118');
    b += wire([200, 60], [300, 60]) + dot(260, 60);
    b += at(260, 150, -90, diode()) + wire([260, 60], [260, 110]) + wire([260, 190], [260, 240]);
    b += at(340, 60, 0, ind()) + wire([380, 60], [580, 60]) + dot(460, 60);
    b += at(460, 150, 90, cap()) + wire([460, 60], [460, 110]) + wire([460, 190], [460, 240]);
    b += at(580, 150, 90, res()) + wire([580, 60], [580, 110]) + wire([580, 190], [580, 240]);
    b += wire([40, 240], [580, 240]) + dot(260, 240) + dot(460, 240) + dot(320, 240) + at(320, 240, 0, gnd());
    b += `<path class="flow" d="M40 110V60H580V240H40V190"/>`;
    b += txt(72, 154, 'V<tspan class="sub" dy="3">in</tspan>') + txt(160, 38, 'Q1', 'middle') + txt(160, 140, 'PWM', 'middle', 'sm');
    b += txt(280, 154, 'D1') + txt(340, 38, 'L1', 'middle') + txt(482, 154, 'C1') + txt(600, 154, 'R<tspan class="sub" dy="3">L</tspan>');
    b += txt(600, 52, 'V<tspan class="sub" dy="3">o</tspan>');
    return { w: 640, h: 272, body: b, play: playFlow };
  };

  F.inverter = () => {
    let b = '';
    b += ln('M80 30H140') + txt(110, 20, 'VDD', 'middle', 'sm');
    b += at(110, 90, 0, mos(true)) + wire([110, 30], [110, 50]);
    b += at(110, 210, 0, mos(false)) + wire([110, 130], [110, 170]);
    b += dot(110, 150) + wire([110, 150], [220, 150]) + txt(226, 154, 'OUT');
    b += wire([70, 90], [50, 90], [50, 210], [70, 210]) + dot(50, 150) + wire([50, 150], [10, 150]) + txt(10, 140, 'IN');
    b += at(110, 250, 0, gnd());
    b += txt(128, 94, 'M<tspan class="sub" dy="3">P</tspan>', 'start', 'sm') + txt(128, 214, 'M<tspan class="sub" dy="3">N</tspan>', 'start', 'sm');
    return { w: 262, h: 280, body: b };
  };

  F.layout = () => {
    let b = '';
    b += dsh('M10 2H310V166H10Z');
    b += fillShape('M0 14H320V40H0Z', 'm') + fillShape('M0 280H320V306H0Z', 'm');
    b += fillShape('M80 62H230V132H80Z', 'd') + fillShape('M80 192H230V254H80Z', 'd');
    b += fillShape('M148 48H168V268H148V170H40V152H148Z', 'p');
    b += fillShape('M96 40H122V110H96Z', 'm') + fillShape('M96 218H122V280H96Z', 'm');
    b += fillShape('M196 76H222V150H302V170H222V246H196Z', 'm') + fillShape('M30 146H62V176H30Z', 'm');
    b += contact(103, 80) + contact(203, 95) + contact(103, 224) + contact(203, 224) + contact(40, 155);
    b += txt(328, 32, 'VDD') + txt(328, 298, 'GND') + txt(310, 165, 'OUT') + txt(46, 138, 'IN', 'middle');
    b += txt(302, 60, 'N-WELL', 'end', 'sm') + txt(238, 126, 'P+', 'start', 'sm') + txt(238, 250, 'N+', 'start', 'sm');
    return { w: 380, h: 310, body: b };
  };

  F.protection = () => {
    let b = '';
    b += ln('M30 20V90', 'bus') + wire([30, 50], [150, 50]) + box(150, 36, 30, 28) + wire([180, 50], [392, 50]);
    b += ln('M382 44L392 50L382 56') + circ(260, 50, 11) + wire([260, 61], [260, 120]);
    b += box(220, 120, 100, 46) + dsh('M220 143H165V72') + ln('M160 74L165 66L170 74');
    b += `<path class="flow" d="M30 50H392"/>`;
    b += txt(165, 54, '52', 'middle', 'sm') + txt(276, 36, 'CT', 'start', 'sm') + txt(392, 36, 'FEEDER', 'end', 'sm');
    b += txt(270, 148, '50/51', 'middle') + txt(270, 186, 'PROTECTIVE RELAY', 'middle', 'sm');
    b += txt(174, 110, 'TRIP', 'start', 'sm') + txt(30, 108, 'BUS', 'middle', 'sm');
    return { w: 410, h: 196, body: b, play: playFlow };
  };

  F.ecprobe = () => {
    let b = '';
    b += dsh('M160 22V164');
    b += ln('M160 150C96 150 74 44 160 44', 'thin') + ln('M160 150C224 150 246 44 160 44', 'thin');
    b += ln('M160 162C60 162 36 24 160 24', 'thin') + ln('M160 162C260 162 284 24 160 24', 'thin');
    b += ln('M104 140V56H216V140');
    for (let i = 0; i < 4; i++) {
      const y = 74 + i * 18;
      b += circ(124, y, 6) + dot(124, y, 1.8) + circ(196, y, 6) + ln(`M192 ${y - 4}l8 8M200 ${y - 4}l-8 8`);
    }
    b += fillShape('M30 172H290V206H30Z', 'd');
    b += ln('M100 189a60 9 0 1 0 120 0a60 9 0 1 0 -120 0') + ln('M128 189a32 5 0 1 0 64 0a32 5 0 1 0 -64 0');
    b += `<path class="flow" d="M100 189a60 9 0 1 0 120 0a60 9 0 1 0 -120 0"/>`;
    b += ln('M156 194L163 198L156 202');
    b += txt(224, 70, 'COIL', 'start', 'sm') + txt(254, 118, 'B', 'start');
    b += txt(288, 166, 'EDDY CURRENTS', 'end', 'sm') + txt(160, 228, 'CONDUCTIVE SAMPLE (σ)', 'middle', 'sm');
    return { w: 320, h: 236, body: b, play: playFlow };
  };

  F.dac = () => {
    let b = txt(60, 18, 'VREF', 'middle', 'sm') + wire([60, 22], [60, 30]);
    [60, 120, 180, 240].forEach(y => { b += at(60, y, 90, res(60)) + txt(76, y + 4, 'R', 'start', 'sm'); });
    [30, 90, 150, 210].forEach((y, i) => {
      b += dot(60, y) + wire([60, y], [102, y]) + circ(104, y, 2) + ln(`M106 ${y}L132 ${y - 11}`) + circ(136, y, 2);
      b += wire([138, y], [170, y]) + txt(120, y - 16, 'S' + (3 - i), 'middle', 'sm');
    });
    b += wire([170, 30], [170, 210]) + dot(170, 90) + dot(170, 150) + dot(170, 112) + wire([170, 112], [180, 112]);
    b += at(230, 130, 0, opamp()) + wire([180, 148], [180, 176], [270, 176], [270, 130]) + dot(270, 130);
    b += wire([286, 130], [300, 130]) + txt(304, 134, 'OUT') + at(60, 270, 0, gnd());
    return { w: 340, h: 300, body: b };
  };

  F.rlc = () => {
    let b = at(40, 110, 0, src(true)) + wire([40, 70], [40, 40], [80, 40]);
    b += at(120, 40, 0, res()) + at(200, 40, 0, ind()) + wire([240, 40], [300, 40], [300, 70]);
    b += at(300, 110, 90, cap()) + wire([300, 150], [300, 180], [40, 180], [40, 150]);
    b += `<path class="flow" d="M40 70V40H300V180H40V150"/>`;
    b += ln('M252 56H280M274 52L280 56L274 60') + txt(266, 76, 'i(t)', 'middle', 'sm');
    b += txt(120, 24, 'R', 'middle') + txt(200, 20, 'L', 'middle') + txt(322, 114, 'C') + txt(70, 114, 'v<tspan class="sub" dy="3">s</tspan>');
    return { w: 360, h: 200, body: b, play: playFlow };
  };

  F.scope = () => {
    let grid = '';
    for (let x = 60; x <= 300; x += 40) grid += `M${x} 20V220`;
    for (let y = 60; y <= 180; y += 40) grid += `M20 ${y}H340`;
    let sine = 'M20 100';
    for (let x = 22; x <= 340; x += 2) sine += `L${x} ${(100 - 44 * Math.sin(2 * Math.PI * (x - 20) / 160)).toFixed(1)}`;
    let sq = 'M20 196';
    for (let x = 20, hi = false; x < 340; x += 40, hi = !hi) sq += `H${x}V${hi ? 196 : 162}`;
    sq += 'H340';
    let b = dsh(grid, 'grid') + box(20, 20, 320, 200) + ln(sine, 'trace') + ln(sq, 'trace');
    b += `<path class="flow" d="${sine}"/>`;
    b += txt(20, 240, 'CH1 · 2 V/div', 'start', 'sm') + txt(340, 240, 'CH2 · PWM', 'end', 'sm');
    return { w: 360, h: 246, body: b, play: playFlow };
  };

  /* --- cover: wafer → magnified die → exploded process stack --- */
  F.cover = () => {
    const wf = waferParts(360, 450, 400, 44, [3, -5]);
    const h = wf.hit;
    const st = stackParts(), ss = 0.6;
    let b = `<g data-part="wafer">${wf.body}</g>`;
    // magnified die
    const bx = 800, by = 64, bw = 290, bh = 248;
    let mag = box(bx, by, bw, bh) + scaled(bx + 22, by + 26, 0.66, F.layout().body);
    mag += txt(bx, by + bh + 24, 'DIE (3, −5) · INVERTER LAYOUT', 'start', 'cap');
    let lead = dsh(`M${h.x + h.s} ${h.y}L${bx} ${by}M${h.x + h.s} ${h.y + h.s}L${bx} ${by + bh}`, 'light');
    b += `<g data-part="lead">${lead}</g><g data-part="mag">${mag}</g>`;
    b += `<g data-part="stack">${scaled(790, 380, ss, st.body)}${txt(bx, 872, 'SECTION A–A · PROCESS STACK', 'start', 'cap')}</g>`;
    b += txt(420, 886, 'FIG. I · 300 MM SILICON WAFER', 'start', 'cap');
    return { w: 1120, h: 900, body: b, over: `<g data-part="wafer">${wf.over}</g>`, play: playCover };
  };

  F.coverTall = () => {
    const wf = waferParts(360, 400, 340, 40, [2, -4]);
    let b = `<g data-part="wafer">${wf.body}</g>` + txt(30, 790, 'FIG. 1 — 300 MM SILICON WAFER', 'start', 'cap');
    return { w: 720, h: 800, body: b, over: `<g data-part="wafer">${wf.over}</g>`, play: (svg, tl) => { playWafer(svg, tl, 0, part(svg, 'wafer')); } };
  };

  /* ---------- rendering ---------- */
  let uidSeq = 0;
  // The drawings are the point of the site and only use gentle line-drawing motion,
  // so they play even when the OS asks for reduced motion. Only a missing anime.js skips them.
  const reduce = false;
  const defs = u => `<defs>
    <pattern id="m-${u}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path class="hatch" d="M0 0V6"/></pattern>
    <pattern id="p-${u}" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><path class="hatch" d="M0 0V4"/></pattern>
    <pattern id="d-${u}" width="6" height="6" patternUnits="userSpaceOnUse"><circle class="hatch-dot" cx="3" cy="3" r="0.9"/></pattern>
    <linearGradient id="scan-${u}" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" class="sc0"/><stop offset=".7" class="sc1"/><stop offset="1" class="sc0"/></linearGradient></defs>`;

  function render(svg, name) {
    name = name || svg.dataset.fig;
    const fig = F[name] && F[name]();
    if (!fig) return;
    const u = 'f' + (++uidSeq);
    svg.setAttribute('viewBox', `0 0 ${fig.w} ${fig.h}`);
    if (!svg.hasAttribute('preserveAspectRatio')) svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.innerHTML = (defs(u) + `<g class="art">${fig.body}</g><g class="over">${fig.over || ''}</g><g class="pulses"></g>`).replace(/%UID%/g, u);
    svg._fig = fig;
    svg.dataset.drawn = '';
    if (reduce || !window.anime) return;
    svg.querySelectorAll('.ln').forEach(el => {
      const L = el.getTotalLength() + 1;
      el.style.strokeDasharray = L;
      el.style.strokeDashoffset = L;
    });
    svg.querySelectorAll('.lbl,.dot,.fill,.dsh,.hl,.scan').forEach(el => { el.style.opacity = 0; });
  }

  /* ---------- choreography ---------- */
  const q = (el, s) => el ? Array.from(el.querySelectorAll(s)) : [];
  const part = (svg, name) => ({ art: svg.querySelector(`.art [data-part="${name}"]`), over: svg.querySelector(`.over [data-part="${name}"]`) });
  const add = (tl, targets, params, t) => { if (targets.length) tl.add(Object.assign({ targets }, params), t); };
  const drawIn = el => [el.style.strokeDashoffset || 0, 0];

  function playGeneric(svg, tl, t0, scope, opt = {}) {
    const art = scope.art;
    add(tl, q(art, '.ln'), { strokeDashoffset: drawIn, duration: opt.duration || 1100, delay: anime.stagger(opt.stagger || 14), easing: 'easeInOutSine' }, t0);
    add(tl, q(art, '.dsh,.fill'), { opacity: [0, 1], duration: 700, easing: 'linear' }, t0 + 400);
    add(tl, q(art, '.dot'), { opacity: [0, 1], scale: [0, 1], duration: 350, delay: anime.stagger(25), easing: 'easeOutBack' }, t0 + 500);
    add(tl, q(art, '.lbl'), { opacity: [0, 1], translateY: [4, 0], duration: 500, delay: anime.stagger(14), easing: 'easeOutQuad' }, t0 + 700);
  }

  function playFlow(svg, tl, t0, scope) {
    playGeneric(svg, tl, t0, scope);
    svg._after.push(() => pulses(svg, scope.art, { n: 2, dur: 3600 }));
  }

  function playWafer(svg, tl, t0, scope) {
    const art = scope.art;
    add(tl, q(art, '.edge'), { strokeDashoffset: drawIn, duration: 1400, easing: 'easeInOutCubic' }, t0);
    add(tl, q(art, '.ln:not(.edge):not(.die)'), { strokeDashoffset: drawIn, duration: 700, easing: 'easeOutQuad' }, t0 + 900);
    add(tl, q(art, '.dsh'), { opacity: [0, 1], duration: 900, easing: 'linear' }, t0 + 300);
    add(tl, q(art, '.die'), { strokeDashoffset: drawIn, duration: 520, delay: el => +el.dataset.d * 2.4, easing: 'easeOutQuad' }, t0 + 600);
    add(tl, q(art, '.lbl'), { opacity: [0, 1], duration: 700, easing: 'linear' }, t0 + 1400);
    add(tl, q(scope.over, '.hl'), { opacity: [0, 1], duration: 700, easing: 'easeOutQuad' }, t0 + 1900);
    svg._after.push(() => {
      const hl = q(scope.over, '.hl'), scan = q(scope.over, '.scan');
      if (hl.length) anime({ targets: hl, opacity: [1, 0.35], duration: 1300, direction: 'alternate', loop: true, easing: 'easeInOutSine' });
      scan.forEach(r => anime({
        targets: r, opacity: [{ value: 1, duration: 300 }, { value: 1, duration: 3800 }, { value: 0, duration: 300 }],
        translateX: [0, +r.dataset.span], duration: 4400, easing: 'linear', loop: true, endDelay: 1600
      }));
    });
    return t0 + 2400;
  }

  function playStack(svg, tl, t0, scope) {
    const art = scope.art, layers = q(art, '.layer');
    anime.set(layers, { opacity: 0 });
    add(tl, q(art, ':scope > .dsh, :scope > g > .dsh'), { opacity: [0, 1], duration: 900, easing: 'linear' }, t0);
    layers.forEach((L, i) => {
      const t = t0 + i * 280;
      tl.add({ targets: L, opacity: [0, 1], translateY: [-38, 0], duration: 900, easing: 'easeOutCubic' }, t);
      add(tl, q(L, '.ln'), { strokeDashoffset: drawIn, duration: 800, easing: 'easeInOutSine' }, t);
      add(tl, q(L, '.fill,.lbl'), { opacity: [0, 1], duration: 600, easing: 'linear' }, t + 450);
    });
    svg._after.push(() => anime({
      targets: layers, translateY: (el, i) => [0, -i * 5], duration: 2800,
      direction: 'alternate', loop: true, easing: 'easeInOutSine'
    }));
    return t0 + layers.length * 280 + 900;
  }

  function playGrid(svg, tl, t0, scope) {
    const art = scope.art;
    add(tl, q(art, '.g-ground .ln'), { strokeDashoffset: drawIn, duration: 1400, easing: 'easeInOutQuad' }, t0);
    add(tl, q(art, '.g-plant .ln'), { strokeDashoffset: drawIn, duration: 1000, delay: anime.stagger(12), easing: 'easeInOutSine' }, t0 + 300);
    q(art, '.g-tower').forEach((T, i) =>
      add(tl, q(T, '.ln'), { strokeDashoffset: drawIn, duration: 1000, delay: anime.stagger(30), easing: 'easeInOutSine' }, t0 + 600 + i * 260));
    add(tl, q(art, '.g-sub .ln'), { strokeDashoffset: drawIn, duration: 900, delay: anime.stagger(20), easing: 'easeInOutSine' }, t0 + 1300);
    add(tl, q(art, '.g-cond .ln'), { strokeDashoffset: drawIn, duration: 2000, delay: anime.stagger(120), easing: 'easeInOutQuad' }, t0 + 1500);
    add(tl, q(art, '.dsh'), { opacity: [0, 1], duration: 800, easing: 'linear' }, t0 + 1600);
    add(tl, q(art, '.lbl'), { opacity: [0, 1], translateY: [4, 0], duration: 600, delay: anime.stagger(80), easing: 'easeOutQuad' }, t0 + 2200);
    svg._after.push(() => {
      pulses(svg, art, { n: 3, dur: 5200 });
      anime({ targets: q(art, '.steam'), strokeDashoffset: [0, -32], duration: 1800, easing: 'linear', loop: true });
    });
    return t0 + 3600;
  }

  function playCover(svg, tl) {
    const t1 = playWafer(svg, tl, 0, part(svg, 'wafer'));
    playGeneric(svg, tl, t1 - 600, part(svg, 'lead'), { duration: 700 });
    playGeneric(svg, tl, t1 - 300, part(svg, 'mag'), { duration: 1000, stagger: 10 });
    playStack(svg, tl, t1 + 500, part(svg, 'stack'));
    add(tl, q(svg.querySelector('.art'), ':scope > .lbl'), { opacity: [0, 1], duration: 800, easing: 'linear' }, t1);
    add(tl, q(part(svg, 'stack').art, ':scope > .lbl'), { opacity: [0, 1], duration: 800, easing: 'linear' }, t1 + 2400);
  }

  /* current pulses that travel along any .flow / .flowln path, forever */
  function toRoot(el, svg) {
    let m = new DOMMatrix();
    for (let n = el.parentNode; n && n !== svg; n = n.parentNode) {
      if (n.transform && n.transform.baseVal && n.transform.baseVal.numberOfItems) {
        m = DOMMatrix.fromMatrix(n.transform.baseVal.consolidate().matrix).multiply(m);
      }
    }
    return m;
  }
  function pulses(svg, scope, { n = 2, dur = 4000 } = {}) {
    const layer = svg.querySelector('.pulses');
    q(scope, '.flow, .flowln').forEach((path, k) => {
      const m = toRoot(path, svg), L = path.getTotalLength();
      const dots = [];
      for (let j = 0; j < n; j++) {
        const g = document.createElementNS(NS, 'g');
        g.setAttribute('class', 'pulse c' + (k % 3));
        g.innerHTML = '<circle class="halo" r="8"/><circle class="core" r="2.6"/>';
        g.style.opacity = 0;
        layer.appendChild(g);
        dots.push(g);
      }
      const o = { p: 0 };
      anime({
        targets: o, p: 1, duration: dur + k * 260, easing: 'linear', loop: true,
        update: () => dots.forEach((g, j) => {
          const t = (o.p + j / n) % 1;
          const pt = m.transformPoint(path.getPointAtLength(t * L));
          g.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
          g.style.opacity = Math.min(1, t * 8, (1 - t) * 8);
        })
      });
    });
  }

  function draw(svg) {
    if (svg.dataset.drawn) return;
    svg.dataset.drawn = '1';
    if (reduce || !window.anime) return;
    const fig = svg._fig || {};
    svg._after = [];
    const tl = anime.timeline({ easing: 'easeInOutSine' });
    if (fig.play) fig.play(svg, tl, 0, { art: svg.querySelector('.art'), over: svg.querySelector('.over') });
    else playGeneric(svg, tl, 0, { art: svg.querySelector('.art'), over: svg.querySelector('.over') });
    tl.finished.then(() => svg._after.forEach(fn => fn()));
  }

  window.Schematic = { render, draw, figures: F };
})();
