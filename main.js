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

    // Typing indicator
    const indicator = document.createElement('div');
    indicator.className = 'ai-msg ai-msg--typing';
    indicator.textContent = '···';
    body.appendChild(indicator);
    body.scrollTop = body.scrollHeight;

    try {
      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history })
      });

      const data = await res.json();
      indicator.remove();

      const reply = data.reply || 'Something went wrong. Try emailing okulajastephen@gmail.com.';

      // Update history
      history.push({ role: 'user', content: message });
      history.push({ role: 'assistant', content: reply });
      if (history.length > 10) history = history.slice(-10);

      const aiMsg = addMessage('', 'ai');
      await typeMessage(aiMsg, reply);

    } catch {
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
