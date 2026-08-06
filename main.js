// =====================
// LOTTIE ANIMATIONS
// =====================
(function () {
  if (typeof lottie === 'undefined') return;

  // Scroll indicator
  const scrollEl = document.getElementById('lottie-scroll');
  if (scrollEl) {
    lottie.loadAnimation({
      container: scrollEl,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'assets/lottie/scroll.json'
    });
    // Hide after user scrolls
    window.addEventListener('scroll', () => {
      scrollEl.parentElement.style.opacity = window.scrollY > 80 ? '0' : '';
    }, { passive: true });
  }
})();

// =====================
// HERO ENTRANCE
// =====================
(function () {
  if (typeof anime === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const heroName = document.querySelector('.hero-name');
  const heroTop  = document.querySelector('.hero-top');
  const heroRule = document.querySelector('.hero-rule');
  const heroBot  = document.querySelector('.hero-bottom');

  if (!heroName) return;

  // Split headline into per-word spans with an overflow mask
  heroName.innerHTML = heroName.innerHTML
    .split(/(\s+|<br\s*\/?>)/i)
    .map(part =>
      /^(\s+|<br\s*\/?>)$/i.test(part)
        ? part
        : `<span style="display:inline-block;overflow:hidden"><span class="hw" style="display:inline-block;opacity:0;transform:translateY(28px)">${part}</span></span>`
    )
    .join('');

  // Set supporting elements to hidden before animation fires
  [heroTop, heroRule, heroBot].forEach(el => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
  });

  anime.timeline({ easing: 'easeOutExpo' })
    .add({
      targets:  heroName.querySelectorAll('.hw'),
      translateY: [28, 0],
      opacity:    [0, 1],
      duration:   1100,
      delay:      anime.stagger(90, { start: 120 }),
    })
    .add({
      targets:  [heroTop, heroRule, heroBot].filter(Boolean),
      translateY: [24, 0],
      opacity:    [0, 1],
      duration:   900,
      easing:     'easeOutQuart',
      delay:      anime.stagger(70),
    }, '-=600');
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
// LIVE CLOCK — Toronto
// =====================
(function () {
  const el = document.getElementById('nav-clock');
  if (!el) return;
  function tick() {
    el.textContent = new Date().toLocaleTimeString('en-CA', {
      hour: '2-digit', minute: '2-digit',
      timeZone: 'America/Toronto', hour12: false,
    });
  }
  tick();
  setInterval(tick, 10000);
})();

// =====================
// AI CHAT WIDGET
// =====================
(function () {
  const form  = document.getElementById('ai-form');
  const input = document.getElementById('ai-input');
  const body  = document.getElementById('ai-demo-body');
  if (!form || !input || !body) return;

  let history = [];
  let busy = false;

  // Prompt hint buttons
  document.querySelectorAll('.ai-hint-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      input.value = btn.textContent;
      document.getElementById('ai-hints')?.remove();
      form.dispatchEvent(new Event('submit', { cancelable: true }));
    });
  });

  const wait = ms => new Promise(r => setTimeout(r, ms));

  function addMessage(text, role) {
    const msg = document.createElement('div');
    msg.className = `ai-msg ai-msg--${role}`;
    msg.textContent = text;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
    return msg;
  }

  async function typeMessage(el, text) {
    for (const ch of text) {
      el.textContent += ch;
      body.scrollTop = body.scrollHeight;
      await wait(18);
    }
  }


  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;

    const message = input.value.trim();
    if (!message) return;

    // Remove hints if present
    document.getElementById('ai-hints')?.remove();

    input.value = '';
    busy = true;
    input.disabled = true;

    addMessage(message, 'user');

    // Typing indicator with Lottie
    const indicator = document.createElement('div');
    indicator.className = 'ai-msg ai-msg--typing';
    body.appendChild(indicator);
    body.scrollTop = body.scrollHeight;

    let typingAnim = null;
    if (typeof lottie !== 'undefined') {
      typingAnim = lottie.loadAnimation({
        container: indicator,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'assets/lottie/typing.json'
      });
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history })
      });

      const data = await res.json();
      if (typingAnim) typingAnim.destroy();
      indicator.remove();

      const reply = data.reply || 'Something went wrong. Try emailing okulajastephen@gmail.com.';

      // Update history
      history.push({ role: 'user', content: message });
      history.push({ role: 'assistant', content: reply });
      if (history.length > 10) history = history.slice(-10);

      const aiMsg = addMessage('', 'ai');
      await typeMessage(aiMsg, reply);

    } catch {
      if (typingAnim) typingAnim.destroy();
      indicator.remove();
      addMessage('Connection issue — email okulajastephen@gmail.com directly.', 'ai');
    }

    busy = false;
    input.disabled = false;
    input.focus();
  });
})();

// =====================
// CUSTOM CURSOR (desktop only)
// =====================
const dot  = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
const isTouch = window.matchMedia('(hover: none)').matches;

if (!isTouch && dot && ring) {
  let ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;

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
// CURSOR LABEL ON CARDS
// =====================
if (!isTouch) {
  const label = document.createElement('span');
  label.className = 'cursor-label';
  label.textContent = 'View';
  document.body.appendChild(label);

  document.addEventListener('mousemove', e => {
    label.style.left = e.clientX + 'px';
    label.style.top  = e.clientY + 'px';
  });

  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', () => label.classList.add('visible'));
    card.addEventListener('mouseleave', () => label.classList.remove('visible'));
  });
}

// =====================
// MAGNETIC BUTTONS
// =====================
if (!isTouch) {
  document.querySelectorAll('.hero-btn, .form-submit').forEach(btn => {
    btn.addEventListener('mouseenter', () => { btn.style.transition = 'transform 0.1s ease'; });
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.28}px, ${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      btn.style.transform = '';
    });
  });
}

// =====================
// 3D CARD TILT (desktop only)
// =====================
if (!isTouch) {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease';
    });

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -6;
      const rotateY = ((x - cx) / cx) * 6;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      card.style.boxShadow = `${-rotateY * 1.5}px ${rotateX * 1.5}px 40px rgba(0,0,0,0.09)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
}

// =====================
// HERO CANVAS AURORA
// =====================
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, rafId;

  function resize() {
    W = canvas.width  = canvas.offsetWidth  * devicePixelRatio;
    H = canvas.height = canvas.offsetHeight * devicePixelRatio;
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 100);
  }, { passive: true });

  resize();

  const orbs = [
    { x: 0.38, y: 0.42, vx:  0.00022, vy:  0.00014, r: 0.62, rgb: '200,190,175' },
    { x: 0.62, y: 0.58, vx: -0.00017, vy:  0.00021, r: 0.55, rgb: '175,192,208' },
    { x: 0.50, y: 0.26, vx:  0.00011, vy: -0.00019, r: 0.50, rgb: '175,202,190' },
  ];

  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (const o of orbs) {
      o.x += o.vx;
      o.y += o.vy;
      if (o.x < 0.15 || o.x > 0.85) o.vx *= -1;
      if (o.y < 0.15 || o.y > 0.85) o.vy *= -1;
      const cx  = o.x * W;
      const cy  = o.y * H;
      const rad = o.r * Math.min(W, H);
      const g   = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      g.addColorStop(0,   `rgba(${o.rgb},0.60)`);
      g.addColorStop(0.5, `rgba(${o.rgb},0.20)`);
      g.addColorStop(1,   `rgba(${o.rgb},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    rafId = requestAnimationFrame(tick);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else if (canvasVisible) rafId = requestAnimationFrame(tick);
  });

  let canvasVisible = false;
  new IntersectionObserver(entries => {
    canvasVisible = entries[0].isIntersecting;
    if (canvasVisible) rafId = requestAnimationFrame(tick);
    else cancelAnimationFrame(rafId);
  }, { threshold: 0 }).observe(canvas);

  rafId = requestAnimationFrame(tick);
})();

// =====================
// HERO MOUSE GRADIENT
// =====================
const hero = document.getElementById('hero');
if (hero && !isTouch) {
  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    hero.style.setProperty('--mx', x + '%');
    hero.style.setProperty('--my', y + '%');
  });
}

// =====================
// STICKY NAV
// =====================
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

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
// CARD STAGGER (anime.js)
// =====================
(function () {
  // Fallback: if anime.js CDN failed, show all data-anime elements immediately
  if (typeof anime === 'undefined') {
    document.querySelectorAll('[data-anime]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    document.querySelectorAll('.sa-br, .sa-prog, .sa-ck').forEach(el => {
      el.style.strokeDashoffset = '0';
      if (el.classList.contains('sa-ck')) el.style.opacity = '0.7';
      else if (el.classList.contains('sa-br')) el.style.opacity = '0.6';
    });
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-anime]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      cardObserver.unobserve(entry.target);
      const el = entry.target;

      if (el.classList.contains('card--featured')) {
        anime({
          targets:    el,
          translateY: [24, 0],
          opacity:    [0, 1],
          duration:   700,
          easing:     'easeOutQuart',
        });
      } else if (el.classList.contains('cards-grid')) {
        anime({
          targets:    el.querySelectorAll('[data-anime="card"]'),
          translateY: [24, 0],
          opacity:    [0, 1],
          duration:   700,
          easing:     'easeOutQuart',
          delay:      anime.stagger(90),
        });
      }
    });
  }, { threshold: 0.08 });

  const featured = document.querySelector('.card--featured');
  const grid     = document.querySelector('.cards-grid');
  if (featured) cardObserver.observe(featured);
  if (grid)     cardObserver.observe(grid);
})();

// =====================
// PROCESS ICON TIMELINES
// =====================
(function () {
  if (typeof anime === 'undefined') return;

  const steps = document.querySelector('.process-steps');
  if (!steps) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const stepObserver = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    stepObserver.disconnect();

    // Reduced motion: show step cards immediately, skip icon animations
    if (reducedMotion) {
      steps.querySelectorAll('[data-anime="step"]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // Stagger step cards in
    anime({
      targets:    steps.querySelectorAll('[data-anime="step"]'),
      translateY: [24, 0],
      opacity:    [0, 1],
      duration:   700,
      easing:     'easeOutQuart',
      delay:      anime.stagger(80),
    });

    const icons = steps.querySelectorAll('.step-anim');
    const BASE  = 150; // ms stagger between icons

    // DISCOVER (icon 0): radar arm rotates 360°
    anime({
      targets:  icons[0]?.querySelector('.sa-sweep'),
      rotate:   360,
      duration: 1200,
      easing:   'easeInOutSine',
      delay:    BASE * 0,
    });

    // DESIGN (icon 1): four brackets draw in via strokeDashoffset, 100ms stagger
    anime({
      targets:          icons[1]?.querySelectorAll('.sa-br'),
      strokeDashoffset: [24, 0],
      opacity:          [0, 1],
      duration:         600,
      easing:           'easeOutCubic',
      delay:            (el, i) => BASE * 1 + i * 100,
    });

    // BUILD (icon 2): ring fills then checkmark draws
    const buildTl = anime.timeline({ easing: 'easeOutCubic' });
    buildTl
      .add({
        targets:          icons[2]?.querySelector('.sa-prog'),
        strokeDashoffset: [138.2, 0],
        duration:         800,
        delay:            BASE * 2,
      })
      .add({
        targets:          icons[2]?.querySelector('.sa-ck'),
        strokeDashoffset: [30, 0],
        opacity:          [0, 1],
        duration:         400,
      }, '-=100');

    // LAUNCH (icon 3): orb rises via cy attribute
    anime({
      targets:  icons[3]?.querySelector('.sa-orb'),
      cy:       [60, 16],
      duration: 900,
      easing:   'easeOutCubic',
      delay:    BASE * 3,
    });

  }, { threshold: 0.08 });

  stepObserver.observe(steps);
})();

// =====================
// CONTACT FORM (AJAX)
// =====================
const contactForm = document.querySelector('.contact-form');
const formSuccess = document.getElementById('form-success');
if (contactForm && formSuccess) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.form-submit');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(contactForm)).toString()
      });
      contactForm.hidden = true;
      formSuccess.hidden = false;
    } catch {
      btn.disabled = false;
      btn.textContent = 'Send Message →';
      contactForm.submit();
    }
  });
}
