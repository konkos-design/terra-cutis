/* TERRA CUTIS — interactions */
(() => {
  const d = document, root = d.documentElement;
  root.classList.remove('no-js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const store = { get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }, set(k,v){ try { localStorage.setItem(k,v); } catch(e){} } };

  /* ---------- theme ---------- */
  const setTheme = (t) => {
    root.dataset.theme = t;
    store.set('tc-theme', t);
    $$('.tgl').forEach(b => { b.setAttribute('aria-label', t === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'); b.setAttribute('aria-pressed', t === 'dark'); });
    const m = $('meta[name="theme-color"]'); if (m) m.content = t === 'dark' ? '#150f1a' : '#f6eeeb';
  };
  setTheme(root.dataset.theme || 'light');
  $$('.tgl').forEach(btn => btn.addEventListener('click', (e) => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    if (!d.startViewTransition || reduce) { setTheme(next); return; }
    const r = btn.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = d.startViewTransition(() => setTheme(next));
    vt.ready.then(() => {
      root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] },
        { duration: 750, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' });
    }).catch(() => {});
  }));
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => { if (!store.get('tc-theme')) setTheme(e.matches ? 'dark' : 'light'); });

  /* ---------- header ---------- */
  const hdr = $('.hdr'), fab = $('.fab');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    hdr && hdr.classList.toggle('is-scrolled', y > 30);
    if (hdr && !d.body.classList.contains('menu-open')) hdr.classList.toggle('is-hidden', y > 500 && y > lastY + 4);
    if (y < lastY - 4) hdr && hdr.classList.remove('is-hidden');
    fab && fab.classList.toggle('on', y > 500);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- mobile menu ---------- */
  const burger = $('.burger');
  if (burger) {
    const close = () => { d.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); };
    burger.addEventListener('click', () => {
      const open = !d.body.classList.contains('menu-open');
      d.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open);
      hdr.classList.remove('is-hidden');
    });
    $$('.mnav a').forEach(a => a.addEventListener('click', close));
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ---------- reveal ---------- */
  const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  $$('.rv,.rv-img').forEach(el => io.observe(el));

  /* ---------- magnetic buttons ---------- */
  if (fine && !reduce) {
    $$('.btn,.tgl,.totop').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * .22, y = (e.clientY - r.top - r.height / 2) * .3;
        el.style.transform = `translate(${x}px,${y}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- service hover preview (appears beside the hovered row) ---------- */
  const fl = $('.sv-float');
  if (fl && fine) {
    const imgs = $$('img', fl);
    let shown = false;
    $$('.sv[data-img]').forEach(row => {
      row.addEventListener('pointerenter', () => {
        const k = row.dataset.img; imgs.forEach(i => i.classList.toggle('cur', i.dataset.k === k));
        fl.classList.toggle('jump', !shown);
        fl.style.top = (row.offsetTop + row.offsetHeight / 2) + 'px';
        fl.classList.add('on'); shown = true;
      });
    });
    $('.sv-list').addEventListener('pointerleave', () => { fl.classList.remove('on'); shown = false; });
  }

  /* ---------- lens toggle ---------- */
  const lens = $('.lens');
  const setLens = (on) => {
    if (!lens) return;
    lens.classList.toggle('is-on', on);
    $$('.lens__tag button').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.v === 'scope') === on)));
    if (window.gsap) gsap.to('.lens__scope', { clipPath: on ? 'circle(75% at 50% 50%)' : 'circle(0% at 50% 50%)', duration: 1.1, ease: 'power3.inOut' });
  };
  $$('.lens__tag button').forEach(b => b.addEventListener('click', () => { lens.dataset.manual = '1'; setLens(b.dataset.v === 'scope'); }));

  /* ---------- price search / accordion ---------- */
  $$('.pgrp>button').forEach(b => b.addEventListener('click', () => {
    const g = b.parentElement; const o = !g.classList.contains('open');
    g.classList.toggle('open', o); b.setAttribute('aria-expanded', o);
  }));
  const norm = s => s.toLowerCase().replace(/[’'ʼ`]/g, '').replace(/ё/g, 'е');
  const hl = (el, q) => {
    if (!el.dataset.t) el.dataset.t = el.textContent;
    const t = el.dataset.t;
    if (!q) { el.textContent = t; return; }
    const i = norm(t).indexOf(q);
    if (i < 0) { el.textContent = t; return; }
    el.innerHTML = '';
    el.append(t.slice(0, i)); const m = d.createElement('mark'); m.textContent = t.slice(i, i + q.length); el.append(m, t.slice(i + q.length));
  };
  const ps = $('#price-search');
  if (ps) {
    const chips = $$('[data-pcat]');
    let cat = 'all';
    const run = () => {
      const q = norm(ps.value.trim()); let any = 0;
      ps.closest('.search').classList.toggle('has', !!ps.value);
      $$('.pgrp').forEach(g => {
        const okCat = cat === 'all' || g.dataset.cat === cat; let n = 0;
        $$('.prow', g).forEach(r => {
          const name = $('span', r); const hit = !q || norm(name.dataset.t || name.textContent).includes(q) || norm(g.dataset.name).includes(q);
          r.classList.toggle('hide', !(hit && okCat)); hl(name, q); if (hit && okCat) n++;
        });
        g.classList.toggle('hide', n === 0);
        if (q && n) { g.classList.add('open'); $('button', g).setAttribute('aria-expanded', true); }
        any += n;
      });
      $('.empty').classList.toggle('on', !any);
    };
    ps.addEventListener('input', run);
    $('.search .clr').addEventListener('click', () => { ps.value = ''; run(); ps.focus(); });
    chips.forEach(c => c.addEventListener('click', () => { cat = c.dataset.pcat; chips.forEach(x => x.setAttribute('aria-pressed', x === c)); run(); }));
    const qs = new URLSearchParams(location.search).get('q'); if (qs) { ps.value = qs; run(); }
  }

  /* ---------- blog filter ---------- */
  const bs = $('#blog-search');
  if (bs) {
    const chips = $$('[data-bcat]'); let cat = 'all';
    const run = () => {
      const q = norm(bs.value.trim()); let any = 0;
      bs.closest('.search').classList.toggle('has', !!bs.value);
      $$('.card[data-cat]').forEach(c => {
        const ok = (cat === 'all' || c.dataset.cat === cat) && (!q || norm(c.dataset.s).includes(q));
        c.style.display = ok ? '' : 'none'; if (ok) any++;
        hl($('h3 a', c), q);
      });
      $('.empty').classList.toggle('on', !any);
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    };
    bs.addEventListener('input', run);
    $('.search .clr').addEventListener('click', () => { bs.value = ''; run(); bs.focus(); });
    chips.forEach(c => c.addEventListener('click', () => { cat = c.dataset.bcat; chips.forEach(x => x.setAttribute('aria-pressed', x === c)); run(); }));
  }

  /* ---------- article: progress, toc, share ---------- */
  const prog = $('.progress');
  if (prog) {
    const body = $('.art-body');
    const tocLinks = $$('.toc a[href^="#"]');
    const hs = tocLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
    const upd = () => {
      const r = body.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * .3 - r.top) / (r.height - innerHeight * .5)));
      prog.style.transform = `scaleX(${p})`;
      let cur = hs[0]; hs.forEach(h => { if (h.getBoundingClientRect().top < innerHeight * .35) cur = h; });
      tocLinks.forEach(a => a.classList.toggle('on', cur && a.getAttribute('href') === '#' + cur.id));
    };
    addEventListener('scroll', upd, { passive: true }); upd();
  }
  const toast = (t) => { let el = $('.toast'); if (!el) { el = d.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); d.body.append(el); } el.textContent = t; el.classList.add('on'); setTimeout(() => el.classList.remove('on'), 2200); };
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    try { if (navigator.share && matchMedia('(pointer:coarse)').matches) { await navigator.share({ title: d.title, url: location.href }); return; }
      await navigator.clipboard.writeText(location.href); toast('Посилання скопійовано'); } catch (e) {}
  }));

  /* ---------- steps carousel: drag with mouse, swipe, arrows ---------- */
  const tr = $('.steps__track');
  if (tr) {
    const bar = $('.steps__bar i'), prev = $('.steps__nav [data-dir="-1"]'), next = $('.steps__nav [data-dir="1"]');
    const upd = () => {
      const max = tr.scrollWidth - tr.clientWidth;
      const p = max > 0 ? tr.scrollLeft / max : 1;
      if (bar) bar.style.transform = `scaleX(${Math.max(.08, p)})`;
      if (prev) prev.disabled = tr.scrollLeft < 4;
      if (next) next.disabled = tr.scrollLeft > max - 4;
    };
    tr.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
    const step = () => ($('.step', tr)?.offsetWidth || 400) + 24;
    [prev, next].forEach(b => b && b.addEventListener('click', () => tr.scrollBy({ left: step() * +b.dataset.dir, behavior: reduce ? 'auto' : 'smooth' })));
    // mouse drag
    let down = false, sx = 0, sl = 0, moved = 0, lastX = 0, v = 0, raf;
    tr.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = 0; sx = lastX = e.clientX; sl = tr.scrollLeft; v = 0; cancelAnimationFrame(raf);
      tr.classList.add('drag');
    });
    addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx));
      v = e.clientX - lastX; lastX = e.clientX;
      tr.scrollLeft = sl - dx;
    });
    const end = () => {
      if (!down) return; down = false; tr.classList.remove('drag');
      const glide = () => { if (Math.abs(v) < .5) { snap(); return; } tr.scrollLeft -= v; v *= .92; raf = requestAnimationFrame(glide); };
      if (!reduce) glide(); else snap();
    };
    const snap = () => {
      const w = step(); const i = Math.round(tr.scrollLeft / w);
      tr.scrollTo({ left: i * w, behavior: reduce ? 'auto' : 'smooth' });
    };
    addEventListener('pointerup', end); addEventListener('pointercancel', end);
    tr.addEventListener('click', e => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    tr.addEventListener('dragstart', e => e.preventDefault());
    tr.addEventListener('keydown', e => { if (e.key === 'ArrowRight') next?.click(); if (e.key === 'ArrowLeft') prev?.click(); });
  }

  /* ---------- map lazy ---------- */
  $$('.map[data-src]').forEach(m => {
    const load = () => { if (m.dataset.done) return; m.dataset.done = 1; const f = d.createElement('iframe'); f.src = m.dataset.src; f.title = 'Карта: TERRA CUTIS, Вознесенськ'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade'; f.onload = () => { const l = $('.map__load', m); l && l.remove(); }; m.append(f); };
    const mo = new IntersectionObserver(es => { if (es[0].isIntersecting) { load(); mo.disconnect(); } }, { rootMargin: '300px' }); mo.observe(m);
  });

  /* ---------- year ---------- */
  $$('[data-year]').forEach(e => e.textContent = new Date().getFullYear());

  /* ---------- GSAP layer ---------- */
  if (!window.gsap || reduce) { root.classList.add('no-gsap'); return; }
  gsap.registerPlugin(ScrollTrigger, ...(window.SplitText ? [SplitText] : []), ...(window.DrawSVGPlugin ? [DrawSVGPlugin] : []));
  const mm = gsap.matchMedia();

  /* hero intro */
  if ($('.hero')) {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.hero h1 .ln>span', { yPercent: 110, duration: 1.3, stagger: .1 })
      .from('.hero .eyebrow,.hero__lead,.hero .btn-row,.hero__facts', { y: 26, autoAlpha: 0, duration: 1, stagger: .08 }, '-=.9')
      .from('.hero__arch', { clipPath: 'inset(100% 0 0 0 round 999px 999px 36px 36px)', duration: 1.5, ease: 'power3.inOut' }, 0.1)
      .from('.hero__arch img', { scale: 1.3, duration: 1.8, ease: 'power3.out' }, 0.1)
      .from('.hero__lens', { scale: 0, rotate: -60, duration: 1.2, ease: 'back.out(1.4)' }, .7)
      .from('.hero__chip', { y: 20, autoAlpha: 0, scale: .8, duration: .8, stagger: .12, ease: 'back.out(2)' }, 1);
    if (window.DrawSVGPlugin) tl.from('.hero__emblem path', { drawSVG: 0, duration: 3.2, ease: 'power2.inOut' }, 0);
  }
  if (window.DrawSVGPlugin) {
    $$('.phero__em path, .cta__em path').forEach(p => gsap.from(p, { drawSVG: 0, duration: 3, ease: 'power2.inOut', scrollTrigger: { trigger: p.closest('svg'), start: 'top 85%' } }));
  }

  /* parallax layers: data-speed (-1..1) */
  mm.add({ wide: '(min-width: 981px)', narrow: '(max-width: 980px)' }, (ctx) => {
    const k = ctx.conditions.wide ? 1 : .5;
    $$('[data-speed]').forEach(el => {
      const s = parseFloat(el.dataset.speed) * k;
      gsap.fromTo(el, { y: () => -s * 120 }, { y: () => s * 120, ease: 'none', scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
    });
    $$('.pframe img, .prof__img img, .hero__arch img, .art-cover img').forEach(img => {
      gsap.fromTo(img, { yPercent: -9 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });

  /* mouse parallax on hero (desktop) */
  if (fine && $('.hero__vis')) {
    const layers = $$('[data-depth]');
    const qx = layers.map(l => gsap.quickTo(l, 'x', { duration: 1.2, ease: 'power3' }));
    const qr = layers.map(l => gsap.quickTo(l, 'rotate', { duration: 1.2, ease: 'power3' }));
    $('.hero').addEventListener('pointermove', e => {
      const nx = e.clientX / innerWidth - .5;
      layers.forEach((l, i) => { const dp = parseFloat(l.dataset.depth); qx[i](nx * dp * 40); qr[i](nx * dp * 3); });
    });
  }

  /* statement word reveal */
  const st = $('.statement');
  if (st) {
    const wrapWords = (node) => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) frag.append(w); else { const s = d.createElement('span'); s.className = 'w'; s.textContent = w; frag.append(s); } });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) wrapWords(n);
      });
    };
    wrapWords(st);
    gsap.to($$('.w', st), { opacity: 1, stagger: .05, ease: 'none', scrollTrigger: { trigger: st, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  }

  /* lens: switch to dermatoscope view once when it comes into view (no pin) */
  if (lens) ScrollTrigger.create({ trigger: lens, start: 'top 55%', once: true, onEnter: () => { if (!lens.dataset.manual) setTimeout(() => setLens(true), 400); } });

  if ($('.abcde')) gsap.from('.abcde li', { x: -30, autoAlpha: 0, stagger: .1, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.abcde', start: 'top 85%' } });

  /* steps: fade in cards */
  if ($('.steps__track')) gsap.from('.step', { x: 60, autoAlpha: 0, duration: 1, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.steps__track', start: 'top 85%' } });

  /* counters */
  $$('[data-count]').forEach(el => {
    const end = parseFloat(el.dataset.count); const o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true }, onUpdate: () => { el.firstChild.nodeValue = (end < 0 ? '−' : '') + Math.round(Math.abs(o.v)); } });
  });

  /* doctor card tilt */
  if (fine) $$('.doc').forEach(c => {
    const rx = gsap.quickTo(c, 'rotationX', { duration: .8, ease: 'power3' }), ry = gsap.quickTo(c, 'rotationY', { duration: .8, ease: 'power3' });
    gsap.set(c, { transformPerspective: 1000 });
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 8); rx(-((e.clientY - r.top) / r.height - .5) * 8); });
    c.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });

  /* section headings soft rise via SplitText */
  if (window.SplitText) {
    $$('[data-split]').forEach(h => {
      d.fonts.ready.then(() => {
        const sp = new SplitText(h, { type: 'lines', mask: 'lines' });
        gsap.from(sp.lines, { yPercent: 110, duration: 1.1, stagger: .08, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 86%' } });
      });
    });
  }

  addEventListener('load', () => ScrollTrigger.refresh());
})();
