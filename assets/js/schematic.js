/* Technical drawings (SVG) animated with anime.js.
   Usage: <svg class="sch" data-fig="tower"></svg>  →  Schematic.render(svg); Schematic.draw(svg)
   Drawings are black & white; the only colour is in the moving parts (current pulses, phasors). */
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

  /* --- double-circuit lattice tower (local: base centre at 0,0; up is −y) --- */
  function lattice() {
    const hw = h => h <= 440 ? 160 - 116 * h / 440 : h <= 700 ? 44 - 14 * (h - 440) / 260 : 30 - 30 * (h - 700) / 60;
    const X = (s, h) => +(s * hw(h)).toFixed(1);
    let b = ln('M-160 0L-44 -440L-30 -700L0 -760L30 -700L44 -440L160 0', 'leg');
    const lv = [0, 90, 170, 240, 300, 350, 395, 440, 492, 544, 596, 648, 700];
    let br = '', strut = '';
    for (let i = 0; i < lv.length - 1; i++) {
      const a = lv[i], c = lv[i + 1];
      br += `M${X(-1, a)} ${-a}L${X(1, c)} ${-c}M${X(1, a)} ${-a}L${X(-1, c)} ${-c}M${X(-1, c)} ${-c}H${X(1, c)}`;
      if (c - a >= 60) { const m = (a + c) / 2; strut += `M${X(-1, m)} ${-m}H${X(1, m)}`; }
    }
    b += ln(br, 'thin') + ln(strut, 'thin');
    const attach = [];
    let arms = '', web = '', ins = '';
    for (const [h, L] of [[480, 210], [570, 180], [660, 150]]) for (const s of [-1, 1]) {
      const xb = X(s, h), xt = X(s, h + 34), tip = s * L;
      arms += `M${xb} ${-h}L${tip} ${-h}L${xt} ${-(h + 34)}`;
      web += `M${xb} ${-h}`;
      for (let k = 1; k < 7; k++) {
        const f = k / 7;
        web += k % 2 ? `L${(xt + (tip - xt) * f).toFixed(1)} ${(-(h + 34) + 34 * f).toFixed(1)}` : `L${(xb + (tip - xb) * f).toFixed(1)} ${-h}`;
      }
      ins += `M${tip} ${-h}V${-h + 64}`;
      for (let k = 0; k < 8; k++) ins += `M${tip - 7} ${-h + 12 + k * 6.5}h14`;
      attach.push([tip, -h + 64]);
    }
    b += ln(arms) + ln(web, 'thin') + ln(ins);
    b += ln('M-56 -740H56M-56 -740L-17 -726M56 -740L17 -726');
    return { body: b, attach, gw: [[-56, -740], [56, -740]] };
  }

  /* a line of towers receding to the right; the conductors carry the current pulses */
  function towerScene({ G, gTo, main, far, left }) {
    const T = lattice();
    const P = (t, a) => [t.x + t.s * a[0], t.y + t.s * a[1]];
    const sag = (p, q) => `Q${((p[0] + q[0]) / 2).toFixed(1)} ${((p[1] + q[1]) / 2 + Math.abs(q[0] - p[0]) * 0.09).toFixed(1)} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
    let hatch = '';
    for (let x = 6; x < gTo; x += 14) hatch += `M${x} ${G}l-7 9`;
    let b = `<g class="g-ground">${ln(`M0 ${G}H${gTo}`)}${ln(hatch, 'thin')}</g>`;
    b += `<g class="g-far nodraw">${far.map(t => scaled(t.x, t.y, t.s, T.body)).join('')}</g>`;
    b += `<g class="g-main">${scaled(main.x, main.y, main.s, T.body)}</g>`;
    let cond = '';
    const run = (a, cls) => {
      const pts = [[left, P(main, a)[1] + 60 * main.s], P(main, a), ...far.map(t => P(t, a))];
      let d = `M${pts[0][0]} ${pts[0][1].toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) d += sag(pts[i - 1], pts[i]);
      cond += ln(d, cls);
    };
    T.attach.forEach(a => run(a, 'flowln cond'));
    T.gw.forEach(a => run(a, 'thin'));
    b += `<g class="g-cond">${cond}</g>`;
    return { body: b };
  }

  F.tower = () => {
    const sc = towerScene({ G: 500, gTo: 700, left: -40, main: { x: 190, y: 500, s: 0.6 },
      far: [{ x: 430, y: 494, s: 0.3 }, { x: 545, y: 490, s: 0.17 }, { x: 612, y: 487, s: 0.1 }] });
    return { w: 700, h: 520, body: sc.body, play: (svg, tl) => playTowerScene(svg, tl, 0, svg.querySelector('.art')) };
  };

  /* --- magnified suspension insulator string --- */
  function insulatorDetail(bx, by) {
    const cx = bx + 130, cy = by + 292;
    let b = box(bx, by, 300, 330);
    let web = `M${bx + 20} ${by + 44}`;
    for (let x = bx + 40, up = true; x <= bx + 280; x += 20, up = !up) web += `L${x} ${by + (up ? 24 : 44)}`;
    b += ln(`M${bx + 20} ${by + 24}H${bx + 280}M${bx + 20} ${by + 44}H${bx + 280}`) + ln(web, 'thin');
    b += ln(`M${cx} ${by + 60}V${by + 268}`);
    b += ln(`M${cx - 6} ${by + 44}v10a6 6 0 0 0 12 0v-10`);
    b += ln(`M${cx - 4} ${by + 66}C${cx - 34} ${by + 68} ${cx - 44} ${by + 84} ${cx - 40} ${by + 106}`);
    b += ln(`M${cx - 4} ${by + 270}C${cx - 34} ${by + 268} ${cx - 44} ${by + 252} ${cx - 40} ${by + 230}`);
    for (let k = 0; k < 9; k++) {
      const y = by + 86 + k * 21;
      b += ln(`M${cx - 7} ${y - 13}h14v6h-14Z`, 'face') +
        ln(`M${cx - 34} ${y}C${cx - 24} ${y - 9} ${cx + 24} ${y - 9} ${cx + 34} ${y}C${cx + 20} ${y + 5} ${cx - 20} ${y + 5} ${cx - 34} ${y}Z`, 'face');
    }
    b += ln(`M${cx} ${by + 268}V${cy - 16}`) + ln(`M${cx - 26} ${cy - 14}Q${cx} ${cy + 28} ${cx + 26} ${cy - 14}`);
    b += circ(cx, cy, 16, 'face') + dot(cx, cy, 2.4);
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; b += dot((cx + 5 * Math.cos(a)).toFixed(1), (cy + 5 * Math.sin(a)).toFixed(1), 2.2); }
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6 + Math.PI / 12; b += circ((cx + 11 * Math.cos(a)).toFixed(1), (cy + 11 * Math.sin(a)).toFixed(1), 2.9, 'thin'); }
    b += txt(cx + 60, by + 64, 'CROSS-ARM', 'start', 'sm');
    b += ln(`M${cx + 38} ${by + 170}H${cx + 46}`, 'thin') + txt(cx + 50, by + 168, 'CAP-AND-PIN', 'start', 'sm') + txt(cx + 50, by + 181, 'DISCS × 9', 'start', 'sm');
    b += txt(bx + 14, by + 128, 'ARCING', 'start', 'sm') + txt(bx + 14, by + 141, 'HORN', 'start', 'sm');
    b += ln(`M${cx + 18} ${cy}H${cx + 28}`, 'thin') + txt(cx + 32, cy - 3, 'ACSR', 'start', 'sm') + txt(cx + 32, cy + 10, 'CONDUCTOR', 'start', 'sm');
    return b;
  }

  /* --- three-phase phasors that rotate and trace their sine waves --- */
  const PH = [0, -2 * Math.PI / 3, 2 * Math.PI / 3];
  function phasorParts(cx, cy, A, x0, x1, P, legendY) {
    let b = circ(cx, cy, A, 'thin') + ln(`M${cx - A - 14} ${cy}H${x1}`, 'thin') + ln(`M${cx} ${cy - A - 14}V${cy + A + 14}`, 'thin');
    let ticks = '';
    for (let x = x0; x <= x1 + 0.1; x += P / 4) ticks += `M${x} ${cy - 3}V${cy + 3}`;
    b += ln(ticks, 'thin') + ln(`M${x0} ${cy - A - 8}V${cy + A + 8}`, 'thin');
    b += txt(cx + A * 0.72 + 6, cy - A * 0.72 - 4, 'ωt', 'start', 'sm') + txt(x1, cy + A + 22, 't →', 'end', 'sm');
    let o = `<clipPath id="pc-%UID%"><rect x="${x0}" y="${cy - A - 8}" width="${x1 - x0}" height="${2 * A + 16}"/></clipPath>`;
    o += `<g class="phasor" data-cx="${cx}" data-cy="${cy}" data-a="${A}" data-p="${P}"><g clip-path="url(#pc-%UID%)">`;
    PH.forEach((ph, i) => {
      let d = '';
      for (let u = x0 - P; u <= x1; u += 2) d += `${d ? 'L' : 'M'}${u.toFixed(1)} ${(cy - A * Math.sin(ph - 2 * Math.PI * (u - x0) / P)).toFixed(1)}`;
      o += `<path class="wave c${i}" d="${d}"/>`;
    });
    o += '</g>';
    PH.forEach((ph, i) => {
      const x = (cx + A * Math.cos(ph)).toFixed(1), y = (cy - A * Math.sin(ph)).toFixed(1);
      o += `<line class="proj c${i}" x1="${x}" y1="${y}" x2="${x0}" y2="${y}"/><line class="phl" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/><circle class="tip c${i}" cx="${x}" cy="${y}" r="3.4"/>`;
    });
    if (legendY) ['V<tspan dy="3" class="sub">a</tspan><tspan dy="-3"> = V ∠ 0°</tspan>', 'V<tspan dy="3" class="sub">b</tspan><tspan dy="-3"> = V ∠ −120°</tspan>', 'V<tspan dy="3" class="sub">c</tspan><tspan dy="-3"> = V ∠ +120°</tspan>'].forEach((s, i) => {
      const y = legendY + i * 22;
      o += `<line class="leg c${i}" x1="${cx - A}" y1="${y - 4}" x2="${cx - A + 22}" y2="${y - 4}"/><text class="ptxt" x="${cx - A + 32}" y="${y}">${s}</text>`;
    });
    o += '</g>';
    return { body: b, over: o };
  }

  F.phasor = () => {
    const p = phasorParts(96, 104, 70, 196, 430, 156, 222);
    return { w: 440, h: 280, body: p.body, over: p.over, play: playPhasor };
  };

  /* --- EE 230: comparator thresholds with hysteresis --- */
  F.hyst = () => {
    const X = t => +(60 + t * 2.75).toFixed(1);            // °C → x
    let b = ln(`M60 222H${X(124)}M${X(124) - 8} 218L${X(124)} 222L${X(124) - 8} 226`, 'thin') + ln('M60 222V20', 'thin');
    let ticks = '';
    for (const t of [0, 30, 40, 80, 100, 120]) ticks += `M${X(t)} 222v5`;
    b += ln(ticks, 'thin');
    for (const t of [30, 40, 80, 100]) b += txt(X(t), 242, t + '°', 'middle', 'sm');
    b += txt(X(124), 242, 'T (°C)', 'end', 'sm');
    // a loop: off level → on at tUp while heating, back off at tDn while cooling
    const loop = (tDn, tUp, yOff, yOn) =>
      ln(`M${X(4)} ${yOff}H${X(tUp)}V${yOn}H${X(118)}`) +
      ln(`M${X(tUp)} ${yOn}H${X(tDn)}V${yOff}H${X(tUp)}`, 'thin') +
      ln(`M${X(tUp) - 4} ${(yOff + yOn) / 2 + 4}L${X(tUp)} ${(yOff + yOn) / 2 - 4}L${X(tUp) + 4} ${(yOff + yOn) / 2 + 4}`) +
      ln(`M${X(tDn) - 4} ${(yOff + yOn) / 2 - 4}L${X(tDn)} ${(yOff + yOn) / 2 + 4}L${X(tDn) + 4} ${(yOff + yOn) / 2 - 4}`) +
      dsh(`M${X(tDn)} ${yOn}V222M${X(tUp)} ${yOn}V222`, 'light') +
      `<path class="flow" d="M${X(4)} ${yOff}H${X(tUp)}V${yOn}H${X(118)}H${X(tDn)}V${yOff}H${X(4)}"/>`;
    b += loop(30, 40, 196, 150) + loop(80, 100, 112, 66);
    b += txt(50, 154, 'ON', 'end', 'sm') + txt(50, 200, 'OFF', 'end', 'sm') + txt(50, 70, 'ON', 'end', 'sm') + txt(50, 116, 'OFF', 'end', 'sm');
    b += txt(X(4), 138, 'ORANGE LED  (GREEN = NOT ORANGE)', 'start', 'sm') + txt(X(4), 54, 'RED LED', 'start', 'sm');
    return { w: 420, h: 252, body: b, play: playFlow };
  };

  /* --- EE 3030: the PLECS energy system as a one-line block diagram --- */
  F.pesys = () => {
    const Y = 92;
    const conv = (x, a, c) => box(x, Y - 28, 56, 56) + ln(`M${x} ${Y + 28}L${x + 56} ${Y - 28}`, 'thin') + a(x + 6, Y - 18) + c(x + 34, Y + 14);
    const dc = (x, y) => ln(`M${x} ${y}h14M${x} ${y + 5}h14`);
    const ac = (x, y) => ln(`M${x} ${y + 2}c2.5 -6 5 -6 7.5 0s5 6 7.5 0`);
    let b = '';
    b += circ(40, Y, 22) + ln(`M33 ${Y - 6}h14M40 ${Y - 13}v14M33 ${Y + 10}h14`, 'thin');
    b += wire([62, Y], [90, Y]) + conv(90, dc, dc);
    b += wire([146, Y], [200, Y]) + dot(172, Y);
    b += conv(200, dc, ac) + wire([256, Y], [280, Y]);
    b += at(310, Y, 0, ind().replace('M-40 0H-32', 'M-30 0H-32').replace('H40', 'H30'));
    b += wire([340, Y], [372, Y]) + dot(354, Y) + at(354, Y + 26, 90, cap().replace('M-40 0H-5', 'M-14 0H-5').replace('H40', 'H14')) + at(354, Y + 40, 0, gnd());
    b += circ(388, Y, 16) + circ(410, Y, 16) + wire([426, Y], [446, Y]);
    b += box(446, Y - 8, 12, 16) + wire([458, Y], [532, Y]) + box(532, Y - 8, 12, 16) + wire([544, Y], [564, Y]);
    b += ln(`M564 ${Y - 34}V${Y + 34}`, 'bus');
    for (const y of [Y - 24, Y, Y + 24]) b += ln(`M564 ${y}H592M586 ${y - 5}L592 ${y}L586 ${y + 5}`);
    b += wire([172, Y], [172, 186], [200, 186]) + box(200, 158, 56, 56) + ln(`M200 214L256 158`, 'thin') + dc(206, 168) + dc(234, 200);
    b += wire([256, 186], [300, 186]) + ln('M300 186h10M304 180L310 186L304 192');
    b += `<path class="flow" d="M62 ${Y}H564"/><path class="flow" d="M172 ${Y}V186H300"/>`;
    b += txt(172, Y - 40, '1 500 V DC BUS', 'middle', 'sm') + ln(`M172 ${Y - 34}V${Y - 4}`, 'thin');
    for (const [x, s] of [[40, 'SOURCE'], [118, 'BOOST'], [228, '3φ INVERTER'], [306, 'LC FILTER'], [399, 'XFMR'], [495, 'LINE'], [578, 'LOADS']]) b += txt(x, Y + 46, s, 'middle', 'sm');
    b += txt(228, 234, 'BUCK', 'middle', 'sm') + txt(316, 190, '48 V DC LOAD', 'start', 'sm');
    return { w: 620, h: 246, body: b, play: playFlow };
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

  /* --- cover: a transmission line in elevation → detail A (insulator string) + detail B (phasors) --- */
  F.cover = () => {
    const sc = towerScene({ G: 870, gTo: 780, left: -90, main: { x: 210, y: 870, s: 1 },
      far: [{ x: 560, y: 858, s: 0.42 }, { x: 690, y: 850, s: 0.24 }, { x: 762, y: 846, s: 0.14 }] });
    const ax = 360, ay = 210;            // top-right cross-arm tip of the main tower
    const dA = [790, 56], dB = [790, 452];
    let b = `<g data-part="scene">${sc.body}</g>`;
    b += `<g data-part="lead">${circ(ax + 18, ay - 18, 11)}${txt(ax + 18, ay - 14, 'A', 'middle')}` +
      dsh(`M${ax + 29} ${ay - 22}L${dA[0]} ${dA[1]}M${ax + 26} ${ay - 10}L${dA[0]} ${dA[1] + 330}`, 'light') + `</g>`;
    b += `<g data-part="detA">${insulatorDetail(dA[0], dA[1])}${txt(dA[0], dA[1] + 354, 'DETAIL A · SUSPENSION STRING', 'start', 'cap')}</g>`;
    const ph = phasorParts(dB[0] + 66, dB[1] + 112, 50, dB[0] + 134, dB[0] + 286, 112, dB[1] + 238);
    b += `<g data-part="detB">${box(dB[0], dB[1], 300, 330)}${ph.body}${txt(dB[0], dB[1] + 354, 'DETAIL B · THREE-PHASE VOLTAGES', 'start', 'cap')}</g>`;
    b += txt(420, 896, 'FIG. I · DOUBLE-CIRCUIT LATTICE TOWER, ELEVATION', 'start', 'cap');
    return { w: 1120, h: 900, body: b, over: ph.over, play: playCover };
  };

  F.coverTall = () => {
    const sc = towerScene({ G: 770, gTo: 720, left: -60, main: { x: 250, y: 770, s: 0.9 },
      far: [{ x: 520, y: 760, s: 0.4 }, { x: 630, y: 753, s: 0.22 }, { x: 690, y: 749, s: 0.12 }] });
    const b = `<g data-part="scene">${sc.body}</g>` + txt(30, 796, 'FIG. I · LATTICE TOWER, ELEVATION', 'start', 'cap');
    return { w: 720, h: 800, body: b, play: (svg, tl) => {
      playTowerScene(svg, tl, 0, part(svg, 'scene').art);
      add(tl, q(svg.querySelector('.art'), ':scope > .lbl'), { opacity: [0, 1], duration: 900, easing: 'linear' }, 2400);
    } };
  };

  /* ---------- rendering ---------- */
  let uidSeq = 0;
  // The drawings are the point of the site and only use gentle line-drawing motion,
  // so they play even when the OS asks for reduced motion. Only a missing anime.js skips them.
  const reduce = false;
  const defs = u => `<defs>
    <pattern id="m-${u}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path class="hatch" d="M0 0V6"/></pattern>
    <pattern id="p-${u}" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><path class="hatch" d="M0 0V4"/></pattern>
    <pattern id="d-${u}" width="6" height="6" patternUnits="userSpaceOnUse"><circle class="hatch-dot" cx="3" cy="3" r="0.9"/></pattern></defs>`;

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
      if (el.closest('.nodraw')) return;
      const L = el.getTotalLength() + 1;
      el.style.strokeDasharray = L;
      el.style.strokeDashoffset = L;
    });
    svg.querySelectorAll('.lbl,.dot,.fill,.dsh,.phasor,.nodraw').forEach(el => { el.style.opacity = 0; });
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

  function playTowerScene(svg, tl, t0, art) {
    const main = art.querySelector('.g-main');
    add(tl, q(art, '.g-ground .ln'), { strokeDashoffset: drawIn, duration: 1400, easing: 'easeInOutQuad' }, t0);
    add(tl, q(main, '.ln:not(.thin)'), { strokeDashoffset: drawIn, duration: 1600, delay: anime.stagger(80), easing: 'easeInOutSine' }, t0 + 200);
    add(tl, q(main, '.ln.thin'), { strokeDashoffset: drawIn, duration: 1900, delay: anime.stagger(120), easing: 'easeInOutSine' }, t0 + 600);
    add(tl, q(art, '.g-far'), { opacity: [0, 1], duration: 1400, easing: 'linear' }, t0 + 1300);
    add(tl, q(art, '.g-cond .ln'), { strokeDashoffset: drawIn, duration: 2300, delay: anime.stagger(90), easing: 'easeInOutQuad' }, t0 + 1800);
    add(tl, q(art, '.lbl'), { opacity: [0, 1], duration: 800, easing: 'linear' }, t0 + 2600);
    svg._after.push(() => pulses(svg, art, { n: 2, dur: 6000 }));
    return t0 + 4000;
  }

  function spinPhasors(svg) {
    q(svg, '.phasor').forEach(g => {
      const cx = +g.dataset.cx, cy = +g.dataset.cy, A = +g.dataset.a, P = +g.dataset.p;
      const waves = q(g, '.wave'), projs = q(g, '.proj'), lines = q(g, '.phl'), tips = q(g, '.tip');
      const o = { t: 0 };
      anime({
        targets: o, t: [0, 1], duration: 3600, easing: 'linear', loop: true,
        update: () => {
          const th = o.t * 2 * Math.PI, d = (o.t * P).toFixed(2);
          PH.forEach((ph, i) => {
            const x = (cx + A * Math.cos(ph + th)).toFixed(1), y = (cy - A * Math.sin(ph + th)).toFixed(1);
            lines[i].setAttribute('x2', x); lines[i].setAttribute('y2', y);
            tips[i].setAttribute('cx', x); tips[i].setAttribute('cy', y);
            projs[i].setAttribute('x1', x); projs[i].setAttribute('y1', y); projs[i].setAttribute('y2', y);
            waves[i].setAttribute('transform', `translate(${d} 0)`);
          });
        }
      });
    });
  }

  function playPhasor(svg, tl, t0, scope) {
    playGeneric(svg, tl, t0, scope, { duration: 900 });
    add(tl, q(svg, '.phasor'), { opacity: [0, 1], duration: 900, easing: 'linear' }, t0 + 700);
    svg._after.push(() => spinPhasors(svg));
  }

  function playCover(svg, tl) {
    playTowerScene(svg, tl, 0, part(svg, 'scene').art);
    playGeneric(svg, tl, 2400, part(svg, 'lead'), { duration: 700 });
    playGeneric(svg, tl, 2700, part(svg, 'detA'), { duration: 900, stagger: 16 });
    playGeneric(svg, tl, 3300, part(svg, 'detB'), { duration: 900, stagger: 20 });
    add(tl, q(svg, '.phasor'), { opacity: [0, 1], duration: 900, easing: 'linear' }, 4000);
    add(tl, q(svg.querySelector('.art'), ':scope > .lbl'), { opacity: [0, 1], duration: 900, easing: 'linear' }, 2600);
    svg._after.push(() => spinPhasors(svg));
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
