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
