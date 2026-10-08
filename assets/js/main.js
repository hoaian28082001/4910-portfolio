/* Shared page chrome (nav + footer), scroll reveals, and figure drawing. */
(function () {
  'use strict';

  const PAGES = [
    { href: '#contents', title: 'Contents' },
    { href: '#introduction', title: 'Introduction' },
    { href: '#projects', title: 'Projects' },
    { href: '#experience', title: 'Experience' },
    { href: 'resume.html', title: 'Résumé' },
    { href: '#reflections', title: 'Reflections' },
    { href: '#contact', title: 'Contact' }
  ];
  const reduce = false; // see note in schematic.js
  const page = location.pathname.split('/').pop() || 'index.html';
  const onHome = page === 'index.html';
  // section links point into the home page when we're on a separate page
  const link = href => href.startsWith('#') && !onHome ? 'index.html' + href : href;

  /* ---------- nav ---------- */
  const top = document.querySelector('[data-topbar]');
  if (top) {
    top.className = 'topbar';
    top.innerHTML = `<div class="wrap topbar-in">
      <a class="brand" href="${onHome ? '#' : 'index.html'}">Truong Luu</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
      <nav id="site-nav" class="nav" aria-label="Portfolio" data-track>
        ${PAGES.map(p => `<a href="${link(p.href)}"${p.href === page ? ' aria-current="page"' : ''}>${p.title}</a>`).join('')}
      </nav></div>`;
    const btn = top.querySelector('.menu-btn');
    const setOpen = open => {
      btn.setAttribute('aria-expanded', open);
      top.classList.toggle('open', open);
    };
    btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
    top.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  }

  /* ---------- footer ---------- */
  const foot = document.querySelector('[data-footer]');
  if (foot) {
    foot.className = 'footer';
    foot.innerHTML = `<div class="wrap">
      <div class="colophon"><span>Truong Hoai An Luu</span><span>Electrical Engineering Portfolio</span></div>
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

  /* ---------- section trackers (top nav, sub-navs, doc TOCs) ---------- */
  if ('IntersectionObserver' in window) {
    document.querySelectorAll('[data-track]').forEach(group => {
      const links = [...group.querySelectorAll('a[href^="#"]')].filter(a => a.getAttribute('href').length > 1);
      const map = new Map();
      links.forEach(a => {
        const t = document.querySelector(a.getAttribute('href'));
        if (t) map.set(t, a);
      });
      if (!map.size) return;
      const so = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          links.forEach(a => a.classList.remove('active'));
          map.get(e.target).classList.add('active');
        });
      }, { rootMargin: '-30% 0px -60% 0px' });
      map.forEach((_, t) => so.observe(t));
    });
  }
})();
