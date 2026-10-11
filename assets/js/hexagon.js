/* Table of contents as a hexagon: six points, one per part of the portfolio. The point you hover
   (or, left alone, each point in turn) pokes out, its facet lines light up, and a pulse runs out to its link. */
(function () {
  'use strict';

  const root = document.querySelector('[data-hex]');
  if (!root) return;
  const stage = root.querySelector('.hex-stage');
  const canvas = stage.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const labels = [...stage.querySelectorAll('.hex-labels a')];
  const N = 6;

  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const ease = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

  // pointy-top hexagon, points clockwise from the top: I at the top, then II … VI
  const DIR = [...Array(N)].map((_, i) => { const a = -Math.PI / 2 + i * Math.PI / 3; return [Math.cos(a), Math.sin(a)]; });

  // a fine dust inside the hexagon (unit coordinates), each grain twinkling on its own phase
  const dust = [];
  for (let k = 0; k < 560; k++) {
    const i = k % N, a = DIR[i], b = DIR[(i + 1) % N];
    let u = Math.random(), v = Math.random();
    if (u + v > 1) { u = 1 - u; v = 1 - v; }
    dust.push({ p: [a[0] * u + b[0] * v, a[1] * u + b[1] * v], ph: Math.random() * 7, s: Math.random() < 0.15 ? 1.7 : 1 });
  }

  /* ---------- state ---------- */
  let W = 0, H = 0, R = 1, dpr = 1;
  let hovered = -1, cycle = 0, cycleAt = 0, lastHover = 0;
  let intro = 0, introStart = 0, running = false, raf = 0, last = 0;
  const poke = new Array(N).fill(0);               // how far each point is poking out, 0 … 1
  const sizes = labels.map(() => [0, 0]);

  /* ---------- colours follow the light / dark theme ---------- */
  let C = {};
  const rgba = (hex, a) => {
    const h = hex.trim().replace('#', '');
    const f = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const n = parseInt(f, 16);
    return isNaN(n) ? `rgba(0,0,0,${a})` : `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
  };
  const readColors = () => {
    const cs = getComputedStyle(document.documentElement);
    C = { ink: cs.getPropertyValue('--ink'), paper: cs.getPropertyValue('--paper'),
      g: ['--g1', '--g2', '--g3'].map(v => cs.getPropertyValue(v)) };
  };
  readColors();
  new MutationObserver(readColors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readColors);

  /* ---------- layout ---------- */
  const measure = () => {
    const r = stage.getBoundingClientRect();
    W = r.width; H = r.height;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    labels.forEach((a, i) => { sizes[i] = [a.offsetWidth, a.offsetHeight]; });
    // leave room above and below for the top and bottom labels, and at the sides for the others
    // (on a phone the side labels may tuck in over the edge; they sit above or below their node, so it stays clear)
    const tall = Math.max(sizes[0][1], sizes[3][1]), wide = Math.max(sizes[1][0], sizes[2][0], sizes[4][0], sizes[5][0]);
    R = clamp(Math.min((H / 2 - tall - 62) / 1.18, Math.max((W / 2 - wide - 56) / 1.03, W * 0.2)), 40, 230);
  };
  new ResizeObserver(() => { measure(); frame(performance.now(), true); }).observe(stage);
  if (document.fonts) document.fonts.ready.then(measure);

  /* ---------- drawing ---------- */
  let V = [], centre = [0, 0];
  function draw(t) {
    const cx = W / 2, cy = H / 2;
    centre = [cx, cy];
    const breathe = 1 + 0.008 * Math.sin(t / 900);
    V = DIR.map((d, i) => { const r = R * breathe * (1 + 0.18 * poke[i]); return [cx + d[0] * r, cy + d[1] * r]; });
    const unit = p => [cx + p[0] * R * breathe, cy + p[1] * R * breathe];

    const e = ease(intro / 0.6);                  // outline draws in
    const fa = ease((intro - 0.25) / 0.5);        // facets and dust fade in
    const sp = ease((intro - 0.45) / 0.4);        // points grow out

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const seg = (a, b) => { ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); };

    // the chosen point's kite (centre → half edge → point → half edge) washes with colour
    V.forEach((v, i) => {
      if (poke[i] < 0.02) return;
      const a = lerp(V[(i + N - 1) % N], v, 0.5), b = lerp(v, V[(i + 1) % N], 0.5);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(a[0], a[1]); ctx.lineTo(v[0], v[1]); ctx.lineTo(b[0], b[1]); ctx.closePath();
      ctx.fillStyle = rgba(C.g[1], 0.1 * poke[i] * fa); ctx.fill();
    });

    // facet lines: from every point, a fan across to the far edges, like a cut crystal
    V.forEach((v, i) => {
      const far = [V[(i + 2) % N], V[(i + 3) % N], V[(i + 4) % N]];
      ctx.beginPath();
      for (const s of [0.3, 0.6]) { seg(v, lerp(far[0], far[1], s)); seg(v, lerp(far[1], far[2], s)); }
      seg(v, V[(i + 2) % N]); seg(v, V[(i + 4) % N]);
      const hot = poke[i];
      ctx.strokeStyle = hot > 0.02 ? rgba(C.g[1], (0.12 + 0.5 * hot) * fa) : rgba(C.ink, 0.12 * fa);
      ctx.lineWidth = 0.6 + 0.4 * hot;
      ctx.stroke();
    });

    // dust
    ctx.fillStyle = rgba(C.ink, 1);
    dust.forEach(d => {
      const a = (0.16 + 0.14 * Math.sin(t / 700 + d.ph)) * fa;
      if (a < 0.01) return;
      const p = unit(d.p);
      ctx.globalAlpha = a; ctx.fillRect(p[0], p[1], d.s, d.s);
    });
    ctx.globalAlpha = 1;

    // spokes to the centre, then the outline, drawn round from the top point
    ctx.beginPath();
    V.forEach(v => seg([cx, cy], lerp([cx, cy], v, e)));
    ctx.strokeStyle = rgba(C.ink, 0.28); ctx.lineWidth = 0.8; ctx.stroke();
    ctx.beginPath();
    V.forEach((v, i) => seg(v, lerp(v, V[(i + 1) % N], e)));
    ctx.strokeStyle = rgba(C.ink, 0.9); ctx.lineWidth = 1.3; ctx.stroke();

    // each point pokes out past the outline to a node; the label hangs off the node
    const tips = V.map((v, i) => {
      const L = (22 + 26 * poke[i]) * sp;
      return [v[0] + DIR[i][0] * L, v[1] + DIR[i][1] * L];
    });
    V.forEach((v, i) => {
      if (sp <= 0.01) return;
      const hot = poke[i], col = hot > 0.5 ? C.g[1] : C.ink, tip = tips[i];
      ctx.beginPath(); seg(v, tip);
      ctx.strokeStyle = rgba(col, 0.85 * sp); ctx.lineWidth = 1 + 0.5 * hot; ctx.stroke();
      ctx.beginPath(); ctx.arc(v[0], v[1], 2.6 + 1.2 * hot, 0, 7); ctx.fillStyle = rgba(col, sp); ctx.fill();
      ctx.beginPath(); ctx.arc(tip[0], tip[1], 4 + 1.6 * hot, 0, 7);
      ctx.fillStyle = hot > 0.5 ? rgba(C.g[1], 1) : rgba(C.paper, 1); ctx.fill();
      ctx.strokeStyle = rgba(col, sp); ctx.lineWidth = 1; ctx.stroke();
      if (hot < 0.3) return;
      // a pulse runs from the centre out through the point to its node
      const u = (t / 1100) % 1, path = u < 0.7 ? lerp([cx, cy], v, u / 0.7) : lerp(v, tip, (u - 0.7) / 0.3);
      const g = C.g[i % 3], o = Math.min(1, u * 6, (1 - u) * 6) * hot;
      ctx.beginPath(); ctx.arc(path[0], path[1], 7, 0, 7); ctx.fillStyle = rgba(g, 0.18 * o); ctx.fill();
      ctx.beginPath(); ctx.arc(path[0], path[1], 2.4, 0, 7); ctx.fillStyle = rgba(g, o); ctx.fill();
    });

    // labels sit just past each node, pushed outward and kept on screen
    V.forEach((v, i) => {
      const a = labels[i], [w, h] = sizes[i], [ux, uy] = DIR[i];
      const ax = -0.5 + 0.5 * clamp(ux * 2.4, -1, 1), ay = -0.5 + 0.5 * clamp(uy * 2.4, -1, 1);
      const x = clamp(tips[i][0] + ux * 12 + ax * w, 2, W - w - 2);
      const y = clamp(tips[i][1] + uy * 12 + ay * h, 2, H - h - 2);
      a.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      a.style.opacity = ease((intro - 0.55 - i * 0.05) / 0.3).toFixed(3);
      a.classList.toggle('on', poke[i] > 0.5);
    });
  }

  /* ---------- motion ---------- */
  function frame(now, once) {
    const dt = Math.min(50, now - (last || now)); last = now;
    if (introStart) intro = Math.min(1, (now - introStart) / 1800);
    // left alone, the points take turns poking out, round the hexagon
    if (intro >= 1 && hovered < 0 && now - lastHover > 1200 && now - cycleAt > 2400) {
      cycle = (cycle + 1) % N; cycleAt = now;
    }
    const active = hovered >= 0 ? hovered : intro >= 1 ? cycle : -1;
    for (let i = 0; i < N; i++) {
      const target = i === active ? 1 : 0;
      poke[i] += (target - poke[i]) * (1 - Math.pow(0.86, dt / 16));
    }
    draw(now);
    if (!once && running) raf = requestAnimationFrame(frame);
  }
  const start = () => { if (running) return; running = true; last = 0; raf = requestAnimationFrame(frame); };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { if (!introStart) { introStart = performance.now(); cycleAt = introStart + 1800; cycle = -1; } start(); }
    else stop();
  }), { threshold: 0.05 }).observe(stage);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });

  /* ---------- pointer: hover a point (or its slice of the hexagon) to poke it out, click to go ---------- */
  const pointAt = (x, y) => {
    const dx = x - centre[0], dy = y - centre[1];
    if (Math.hypot(dx, dy) > R * 1.55) return -1;
    let best = -1, bestDot = -2;
    DIR.forEach((d, i) => { const s = (dx * d[0] + dy * d[1]) / (Math.hypot(dx, dy) || 1); if (s > bestDot) { bestDot = s; best = i; } });
    return best;
  };
  const local = e => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const hover = i => { hovered = i; lastHover = performance.now(); if (i >= 0) cycle = i; };

  canvas.addEventListener('pointermove', e => {
    const i = pointAt(...local(e));
    hover(i);
    canvas.style.cursor = i >= 0 ? 'pointer' : '';
  });
  canvas.addEventListener('pointerleave', () => { hover(-1); canvas.style.cursor = ''; });
  canvas.addEventListener('click', e => {
    const i = pointAt(...local(e));
    if (i >= 0) labels[i].click();
  });
  labels.forEach((a, i) => {
    a.addEventListener('pointerenter', () => hover(i));
    a.addEventListener('pointerleave', () => { if (hovered === i) hover(-1); });
    a.addEventListener('focus', () => hover(i));
    a.addEventListener('blur', () => { if (hovered === i) hover(-1); });
  });

  root.classList.add('hex-live');
  measure();
  draw(0);
})();
