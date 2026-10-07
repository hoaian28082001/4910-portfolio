/* Shared page chrome (nav + footer), scroll reveals, and figure drawing. */
(function () {
  'use strict';

  const PAGES = [
    { n: '', href: 'contents.html', title: 'Contents' },
    { n: 'I', href: 'about.html', title: 'Introduction' },
    { n: 'II', href: 'experience.html', title: 'Experience' },
    { n: 'III', href: 'resume.html', title: 'Résumé' },
    { n: 'IV', href: 'gen-ed.html', title: 'Gen Ed Reflection' },
    { n: 'V', href: 'cumulative.html', title: 'Cumulative Reflection' },
    { n: 'VI', href: 'ethics.html', title: 'Ethics Paper' }
  ];
  const reduce = false; // see note in schematic.js
  const here = location.pathname.split('/').pop() || 'index.html';
  const idx = PAGES.findIndex(p => p.href === here);

  /* ---------- nav ---------- */
  const top = document.querySelector('[data-topbar]');
  if (top) {
    top.className = 'topbar';
    top.innerHTML = `<div class="wrap topbar-in">
      <a class="brand" href="index.html">Truong Luu</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
      <nav id="site-nav" class="nav" aria-label="Portfolio">
        ${PAGES.map(p => `<a href="${p.href}"${p.href === here ? ' aria-current="page"' : ''}>${p.title}</a>`).join('')}
      </nav></div>`;
    const btn = top.querySelector('.menu-btn');
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open);
      top.classList.toggle('open', open);
    });
  }

  /* ---------- footer with prev / next sheet ---------- */
  const foot = document.querySelector('[data-footer]');
  if (foot) {
    const prev = idx > 0 ? PAGES[idx - 1] : { n: '', href: 'index.html', title: 'Cover' };
    const label = p => p.n ? `Part ${p.n}` : (p.href === 'index.html' ? 'Front' : 'Index');
    const next = idx >= 0 && idx < PAGES.length - 1 ? PAGES[idx + 1] : null;
    foot.className = 'footer';
    foot.innerHTML = `<div class="wrap">
      <div class="pager">
        <a class="pg prev" href="${prev.href}"><small>← ${label(prev)}</small>${prev.title}</a>
        ${next ? `<a class="pg next" href="${next.href}"><small>${label(next)} →</small>${next.title}</a>` : '<span></span>'}
      </div>
      <div class="colophon"><span>Truong Hoai An Luu</span><span>Electrical Engineering Portfolio · Iowa State University · MMXXVII</span></div>
    </div>`;
  }

  /* ---------- figures: render now, draw when visible ---------- */
  const figs = document.querySelectorAll('svg.sch[data-fig]:not([data-manual])');
  figs.forEach(svg => Schematic.render(svg));

  /* ---------- reveal on scroll ---------- */
  const reveals = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || reduce || !window.anime) {
    reveals.forEach(el => el.classList.add('in'));
    figs.forEach(svg => Schematic.draw(svg));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const el = e.target;
        if (el.matches('svg.sch')) { Schematic.draw(el); return; }
        const kids = el.hasAttribute('data-stagger') ? el.children : [el];
        if (el.hasAttribute('data-stagger')) el.classList.add('in');
        anime({
          targets: kids, opacity: [0, 1], translateY: [16, 0],
          duration: 800, easing: 'easeOutCubic', delay: anime.stagger(70),
          complete: () => el.classList.add('in')
        });
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    reveals.forEach(el => io.observe(el));
    figs.forEach(svg => io.observe(svg));
  }

  /* ---------- in-page section tracker (sub-nav + doc TOC) ---------- */
  const tracked = document.querySelectorAll('[data-track] a[href^="#"]');
  if (tracked.length && 'IntersectionObserver' in window) {
    const map = new Map();
    tracked.forEach(a => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) map.set(t, a);
    });
    const so = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        tracked.forEach(a => a.classList.remove('active'));
        map.get(e.target).classList.add('active');
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    map.forEach((_, t) => so.observe(t));
  }
})();
