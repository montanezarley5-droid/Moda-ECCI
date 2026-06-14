/* ============================================================
   MODA ECCI — script.js
   Interactive Experience Engine
   ============================================================ */

'use strict';

/* ── Utility ────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── DOM Ready ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCursor();
  initNavbar();
  initParticles();
  initScrollReveal();
  initStats();
  initBilingual();
  initCard3D();
  initBackToTop();
  initSmoothScroll();
});

/* ══════════════════════════════════════════════════════════════
   THEME — Dark / Light toggle with LocalStorage persistence
   ══════════════════════════════════════════════════════════════ */
function initTheme() {
  const saved = localStorage.getItem('moda-theme') || 'dark';
  applyTheme(saved);

  const btn = $('#theme-toggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      localStorage.setItem('moda-theme', next);
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = $('#theme-toggle');
  if (btn) btn.textContent = theme === 'light' ? '🌙 Dark' : '☀️ Light';
}

/* ══════════════════════════════════════════════════════════════
   CUSTOM CURSOR
   ══════════════════════════════════════════════════════════════ */
function initCursor() {
  const dot  = $('#cursor-dot');
  const ring = $('#cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
  });

  // Ring follows with lerp
  function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Expand on interactive elements
  const targets = $$('a, button, [role="button"], .glass-card, .card-3d');
  targets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width  = '58px';
      ring.style.height = '58px';
      ring.style.borderColor = 'var(--rose)';
      dot.style.transform = 'translate(-50%, -50%) scale(0)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width  = '36px';
      ring.style.height = '36px';
      ring.style.borderColor = 'var(--amethyst)';
      dot.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   NAVBAR — transparent → solid on scroll
   ══════════════════════════════════════════════════════════════ */
function initNavbar() {
  const nav = $('#main-navbar');
  if (!nav) return;

  const toggle = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
}

/* ══════════════════════════════════════════════════════════════
   PARTICLE CANVAS — colorful floating dots in hero
   ══════════════════════════════════════════════════════════════ */
function initParticles() {
  const canvas = $('#particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles;
  const COLORS = ['#9B4DFF', '#D81B8F', '#6C1FD4', '#00D4FF', '#FF2D9B', '#ffffff'];
  const COUNT = 90;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(Math.random() * 0.5 + 0.2),
      alpha: Math.random() * 0.6 + 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      p.x += p.vx;
      p.y += p.vy;

      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  init();
  draw();
}

/* ══════════════════════════════════════════════════════════════
   SCROLL REVEAL — Intersection Observer
   ══════════════════════════════════════════════════════════════ */
function initScrollReveal() {
  const obs = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  $$('.reveal').forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════════════════════════════
   ANIMATED COUNTERS
   ══════════════════════════════════════════════════════════════ */
function initStats() {
  const counters = $$('[data-count]');
  if (!counters.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const dur    = 1800;
      const start  = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / dur, 1);
        const eased    = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════════════════════════════
   BILINGUAL TOGGLE
   ══════════════════════════════════════════════════════════════ */
function initBilingual() {
  const btns = $$('.lang-btn');
  const contents = $$('.lang-content');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      btns.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
      contents.forEach(c => c.classList.toggle('active', c.dataset.lang === lang));
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   3D CARD TILT
   ══════════════════════════════════════════════════════════════ */
function initCard3D() {
  $$('.card-3d').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);

      card.style.transform = `rotateY(${dx * 8}deg) rotateX(${-dy * 8}deg) translateZ(12px)`;
      card.style.setProperty('--mx', `${(e.clientX - rect.left) / rect.width * 100}%`);
      card.style.setProperty('--my', `${(e.clientY - rect.top)  / rect.height * 100}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateY(0) rotateX(0) translateZ(0)';
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   BACK TO TOP
   ══════════════════════════════════════════════════════════════ */
function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ══════════════════════════════════════════════════════════════
   SMOOTH SCROLL — anchor links
   ══════════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   GLOSSARY — real-time search filter
   ══════════════════════════════════════════════════════════════ */
function initGlossarySearch() {
  const input   = $('#glossary-search');
  const rows    = $$('.glossary-row');
  const noRes   = $('#no-results');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    let count = 0;

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const show = !q || text.includes(q);
      row.style.display = show ? '' : 'none';
      if (show) count++;
    });

    if (noRes) noRes.style.display = count === 0 ? 'block' : 'none';
  });
}

// Auto-init glossary if on that page
if (document.querySelector('.glossary-table')) {
  document.addEventListener('DOMContentLoaded', initGlossarySearch);
  initGlossarySearch();
}
