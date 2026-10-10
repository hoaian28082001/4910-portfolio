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
      </nav>
      <button class="theme-btn" type="button">
        <svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M5.3 18.7l1.5-1.5M17.2 6.8l1.5-1.5"/></svg>
        <svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>
      </button></div>`;
    const btn = top.querySelector('.menu-btn');
    const setOpen = open => {
      btn.setAttribute('aria-expanded', open);
      top.classList.toggle('open', open);
    };
    btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
    top.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => setOpen(false)));

    // light / dark: the OS decides until the visitor picks one, then their pick is remembered
    const root = document.documentElement;
    const osDark = window.matchMedia('(prefers-color-scheme: dark)');
    const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : osDark.matches;
    const themeBtn = top.querySelector('.theme-btn');
    const label = () => themeBtn.setAttribute('aria-label', `Switch to ${isDark() ? 'light' : 'dark'} mode`);
    themeBtn.addEventListener('click', () => {
      root.dataset.theme = isDark() ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) { /* private mode */ }
      label();
    });
    osDark.addEventListener('change', label);
    label();
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

  /* ---------- projects: a project opens only when its card is chosen ----------
     (after the figures render, so closed panels still hold fully built drawings) */
  const picker = document.querySelector('[data-picker]');
  if (picker) {
    const tabs = [...picker.querySelectorAll('[role="tab"]')];
    const panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls')));
    const hint = document.querySelector('.pick-hint');
    const open = (i, jump) => {
      const already = tabs[i] && tabs[i].getAttribute('aria-selected') === 'true';
      const show = i >= 0 && !(already && !jump);   // choosing the open card again closes it
      tabs.forEach((t, k) => t.setAttribute('aria-selected', show && k === i));
      panels.forEach((p, k) => { p.hidden = !(show && k === i); });
      if (hint) hint.hidden = show;
      if (!show) return;
      const p = panels[i];
      if (window.anime && !jump) anime({ targets: p, opacity: [0, 1], translateY: [18, 0], duration: 650, easing: 'easeOutCubic' });
      if (jump) p.scrollIntoView({ block: 'start' });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => open(i));
      t.addEventListener('keydown', e => {
        const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!d) return;
        e.preventDefault();
        tabs[(i + d + tabs.length) % tabs.length].focus();
      });
    });
    // links straight to a project (or anything inside one) open its panel first
    const fromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (!id) return;
      const i = panels.findIndex(p => p.id === id || p.querySelector('#' + CSS.escape(id)));
      if (i >= 0) open(i, true);
    };
    open(-1);
    fromHash();
    window.addEventListener('hashchange', fromHash);
  }

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
