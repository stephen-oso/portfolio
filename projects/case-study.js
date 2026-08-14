// =====================
// PAGE CURTAIN REVEAL (non-VT entry animation)
// =====================
(function () {
  if ('startViewTransition' in document) return; // VT handles transitions
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const curtain = document.createElement('div');
  curtain.className = 'cs-curtain';
  document.body.appendChild(curtain);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      curtain.classList.add('cs-curtain--out');
      curtain.addEventListener('transitionend', () => curtain.remove(), { once: true });
    });
  });
})();

// =====================
// PAGE EXIT on nav-back (non-VT)
// =====================
(function () {
  if ('startViewTransition' in document) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.nav-back, .cs-project-nav a').forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.href;
      if (!href || href.includes('#')) return;
      e.preventDefault();
      document.body.style.opacity = '0';
      document.body.style.transform = 'translateY(-8px)';
      document.body.style.transition = 'opacity 260ms ease, transform 260ms ease';
      setTimeout(() => { window.location.href = href; }, 280);
    });
  });
})();

// =====================
// LENIS SMOOTH SCROLL
// =====================
if (typeof Lenis !== 'undefined') {
  const _lenis = new Lenis({ duration: 1.2 });
  function _raf(time) { _lenis.raf(time); requestAnimationFrame(_raf); }
  requestAnimationFrame(_raf);
}

// =====================
// READING PROGRESS BAR
// =====================
const progressBar = document.getElementById('progress-bar');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.setProperty('--p', (window.scrollY / max).toFixed(4));
  }, { passive: true });
}

// =====================
// STAT COUNTER
// =====================
function animateStat(el) {
  const raw = el.textContent.trim();
  const m = raw.match(/^([\d.]+)(.*)/);
  if (!m) return;
  const end = parseFloat(m[1]);
  const suffix = m[2];
  const t0 = performance.now();
  const dur = 1400;
  (function frame(now) {
    const p = Math.min((now - t0) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(end * eased) + suffix;
    if (p < 1) requestAnimationFrame(frame);
  })(t0);
}

const statObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateStat(e.target); statObs.unobserve(e.target); }
  });
}, { threshold: 0.6 });

document.querySelectorAll('.cs-stat-num').forEach(el => statObs.observe(el));

// =====================
// CUSTOM CURSOR (desktop only)
// =====================
const dot  = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
const isTouch = window.matchMedia('(hover: none)').matches;

if (!isTouch && dot && ring) {
  let ringX = 0, ringY = 0;
  let mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  (function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  })();

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// =====================
// STICKY NAV
// =====================
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// =====================
// SCROLL FADE-IN
// =====================
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// =====================
// IFRAME ASSET SCALING
// =====================
function scaleEmbeds() {
  document.querySelectorAll('.cs-embed').forEach(wrap => {
    const iframe = wrap.querySelector('iframe');
    if (!iframe) return;
    const h = parseInt(iframe.dataset.h, 10);
    const scale = wrap.offsetWidth / 1200;
    iframe.style.height = h + 'px';
    iframe.style.transform = `scale(${scale})`;
    wrap.style.height = Math.round(h * scale) + 'px';
  });
}
window.addEventListener('load', scaleEmbeds);
window.addEventListener('resize', scaleEmbeds);

// =====================
// VP-CARD SCROLL REVEAL (NAFDAC verification paths)
// =====================
(function () {
  const cards = document.querySelectorAll('.vp-card');
  if (!cards.length) return;
  cards.forEach(c => c.classList.add('vp-will-animate'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = Array.prototype.indexOf.call(cards, e.target);
          setTimeout(() => e.target.classList.add('vp-in'), idx * 75);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.05 });
    cards.forEach(c => io.observe(c));
  } else {
    cards.forEach(c => c.classList.add('vp-in'));
  }
})();
