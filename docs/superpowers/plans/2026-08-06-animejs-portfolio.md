# anime.js Portfolio Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add anime.js as an additive animation layer to the portfolio — hero text entrance on load, staggered scroll-triggered card reveals, and SVG timeline animations for the four process step icons.

**Architecture:** anime.js (CDN) loads alongside Lottie and Lenis. Hero elements lose their `fade-in` class and are set to opacity:0 via JS before the entrance timeline fires. Cards and step-cards lose `fade-in` and gain `data-anime` attributes; a CSS rule hides them initially and a new IntersectionObserver fires anime.js stagger on scroll. The four process SVG icons shed their CSS keyframes; anime.js timelines replace them, triggered by the same observer watching `.process-steps`.

**Tech Stack:** anime.js v3.2.1 (cdnjs CDN), pure HTML/CSS/JS, no build tools.

## Global Constraints

- anime.js v3.2.1 from `https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js`
- All anime.js sections guard with `if (typeof anime === 'undefined') return;`
- All animations check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and skip or show elements immediately when true
- translateY distances ≤ 24px — restrained, mobile-friendly
- Lottie, Lenis, cursor, card tilt, magnetic buttons: untouched
- CSS `.fade-in` system: untouched for non-card/non-hero elements
- Case study pages (`projects/*.html`): untouched

---

### Task 1: Add anime.js CDN and update HTML attributes

**Files:**
- Modify: `index.html`

- [ ] Add anime.js script tag. In `index.html`, place it immediately before the Lenis script at the bottom of `<body>`:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/bundled/lenis.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>
<script src="main.js?v=3"></script>
```

- [ ] Remove `fade-in` from the four hero content elements. Find these lines and update them:

```html
<!-- BEFORE -->
<div class="hero-top fade-in">
<h1 class="hero-name fade-in">I build products<br>that think.</h1>
<div class="hero-rule fade-in"></div>
<div class="hero-bottom fade-in">

<!-- AFTER -->
<div class="hero-top">
<h1 class="hero-name">I build products<br>that think.</h1>
<div class="hero-rule"></div>
<div class="hero-bottom">
```

- [ ] Update the featured card — remove `fade-in`, add `data-anime="card"`:

```html
<!-- BEFORE -->
<a class="card card--featured fade-in" href="projects/quickfit.html">

<!-- AFTER -->
<a class="card card--featured" data-anime="card" href="projects/quickfit.html">
```

- [ ] Update all four grid cards — remove `fade-in`, add `data-anime="card"`:

```html
<!-- BEFORE (all four instances) -->
<a class="card fade-in" href="projects/versecue.html">
<a class="card fade-in" href="projects/elicit-furnishing.html">
<a class="card fade-in" href="projects/machineline.html">
<a class="card fade-in" href="projects/t2d-trial.html">

<!-- AFTER -->
<a class="card" data-anime="card" href="projects/versecue.html">
<a class="card" data-anime="card" href="projects/elicit-furnishing.html">
<a class="card" data-anime="card" href="projects/machineline.html">
<a class="card" data-anime="card" href="projects/t2d-trial.html">
```

- [ ] Update all four step cards — remove `fade-in`, add `data-anime="step"`:

```html
<!-- BEFORE (all four instances) -->
<div class="step-card fade-in">

<!-- AFTER -->
<div class="step-card" data-anime="step">
```

- [ ] Open `http://localhost:3000` (via `npx serve .` in the portfolio folder). Open DevTools console — confirm no JS errors. Cards and step-cards are still visible at this point (CSS not yet updated).

---

### Task 2: CSS — initial hidden states and remove SVG keyframe declarations

**Files:**
- Modify: `style.css`

- [ ] Add initial hidden state for `[data-anime]` elements. Insert after the `.fade-in.visible` block (around line 1205):

```css
[data-anime] {
  opacity: 0;
  transform: translateY(24px);
}
```

- [ ] Remove the `animation:` declaration from `.sa-sweep` (keep the rest of the rule):

```css
/* BEFORE */
.sa-sweep {
  transform-origin: 50% 50%;
  animation: sa-sweep 3s linear infinite;
}

/* AFTER */
.sa-sweep {
  transform-origin: 50% 50%;
}
```

- [ ] Remove `animation:` from `.sa-br` (keep stroke-dasharray, stroke-dashoffset, opacity — they are the initial state anime.js animates from):

```css
/* BEFORE */
.sa-br {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  opacity: 0;
  animation: sa-bracket 2.8s ease-in-out infinite;
}

/* AFTER */
.sa-br {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  opacity: 0;
}
```

- [ ] Delete the four animation-delay rules immediately below — they are no longer needed:

```css
/* DELETE these four lines entirely */
.sa-br-a { animation-delay: 0s; }
.sa-br-b { animation-delay: 0.08s; }
.sa-br-c { animation-delay: 0.08s; }
.sa-br-d { animation-delay: 0.16s; }
```

- [ ] Remove `animation:` from `.sa-prog` (keep stroke-dasharray and stroke-dashoffset):

```css
/* BEFORE */
.sa-prog {
  stroke-dasharray: 138.2;
  stroke-dashoffset: 138.2;
  animation: sa-ring-fill 2.8s ease-in-out infinite;
}

/* AFTER */
.sa-prog {
  stroke-dasharray: 138.2;
  stroke-dashoffset: 138.2;
}
```

- [ ] Remove `animation:` from `.sa-ck` (keep stroke-dasharray, stroke-dashoffset, opacity):

```css
/* BEFORE */
.sa-ck {
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
  opacity: 0;
  animation: sa-check 2.8s ease-in-out infinite;
}

/* AFTER */
.sa-ck {
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
  opacity: 0;
}
```

- [ ] Remove `animation:` from `.sa-orb` (keep transform-box and transform-origin):

```css
/* BEFORE */
.sa-orb {
  transform-box: fill-box;
  transform-origin: center;
  animation: sa-launch 2s cubic-bezier(0.33, 0, 0.66, 1) infinite;
}

/* AFTER */
.sa-orb {
  transform-box: fill-box;
  transform-origin: center;
}
```

- [ ] Delete these five `@keyframes` blocks entirely (they are now owned by anime.js):
  - `@keyframes sa-sweep { ... }`
  - `@keyframes sa-bracket { ... }`
  - `@keyframes sa-ring-fill { ... }`
  - `@keyframes sa-check { ... }`
  - `@keyframes sa-launch { ... }`

- [ ] Replace the SVG entries in the `@media (prefers-reduced-motion: reduce)` block with static fallback states. Also add a rule to instantly show `[data-anime]` elements:

```css
/* BEFORE */
@media (prefers-reduced-motion: reduce) {
  .sa-sweep { animation: none; }
  .sa-br    { animation: none; stroke-dashoffset: 0; opacity: 0.6; }
  .sa-prog  { animation: none; stroke-dashoffset: 0; }
  .sa-ck    { animation: none; stroke-dashoffset: 0; opacity: 0.7; }
  .sa-orb   { animation: none; opacity: 1; }
}

/* AFTER */
@media (prefers-reduced-motion: reduce) {
  .sa-br   { stroke-dashoffset: 0; opacity: 0.6; }
  .sa-prog { stroke-dashoffset: 0; }
  .sa-ck   { stroke-dashoffset: 0; opacity: 0.7; }
  .sa-orb  { opacity: 1; }
  [data-anime] { opacity: 1; transform: none; }
}
```

- [ ] Verify in browser: all five cards and four step-cards should be invisible (opacity 0) on page load. The four process SVG icons should be static — no CSS keyframe looping.

---

### Task 3: Hero text entrance

**Files:**
- Modify: `main.js` — add `// HERO ENTRANCE` section at the top, after the Lottie IIFE and before the Lenis block

- [ ] Add this block to `main.js` after the closing `})();` of the Lottie IIFE:

```js
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
        : `<span style="display:inline-block;overflow:hidden"><span class="hw" style="display:inline-block;opacity:0;transform:translateY(20px)">${part}</span></span>`
    )
    .join('');

  // Set supporting elements to hidden before animation fires
  [heroTop, heroRule, heroBot].forEach(el => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
  });

  anime.timeline({ easing: 'easeOutQuart' })
    .add({
      targets: heroName.querySelectorAll('.hw'),
      translateY: [20, 0],
      opacity:    [0, 1],
      duration:   700,
      delay:      anime.stagger(70),
    })
    .add({
      targets:  [heroTop, heroRule, heroBot].filter(Boolean),
      translateY: [20, 0],
      opacity:    [0, 1],
      duration:   600,
      delay:      anime.stagger(60),
    }, '-=300');
})();
```

- [ ] Verify in browser: hard-reload the page. The headline words should stagger up into view one-by-one on load, then the top bar (location + status badge), rule, and bottom row (subheading + CTA button) follow. No flash of invisible content.

- [ ] Check mobile: resize to 375px wide in DevTools. Animation should still run cleanly — no layout shifts, no overflow.

---

### Task 4: Staggered card scroll reveals

**Files:**
- Modify: `main.js` — add `// CARD STAGGER` section after the existing `// SCROLL FADE-IN` section

- [ ] Add this block after the existing IntersectionObserver for `.fade-in`:

```js
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
```

- [ ] Verify in browser: scroll slowly past the hero. The featured card (QuickFit) should animate in as it enters the viewport. Continue scrolling — the four grid cards should stagger in 90ms apart. No cards appear before their scroll trigger.

- [ ] Check mobile at 375px: cards should still stagger in correctly. Confirm no horizontal overflow from the translateY animation.

---

### Task 5: SVG process icon timelines

**Files:**
- Modify: `main.js` — add `// PROCESS ICON TIMELINES` section after the card stagger section

- [ ] Add this block after the card stagger IIFE:

```js
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
      targets:  icons[0] && icons[0].querySelector('.sa-sweep'),
      rotate:   360,
      duration: 1200,
      easing:   'easeInOutSine',
      delay:    BASE * 0,
    });

    // DESIGN (icon 1): four brackets draw in via strokeDashoffset, 100ms stagger
    anime({
      targets:          icons[1] && icons[1].querySelectorAll('.sa-br'),
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
        targets:          icons[2] && icons[2].querySelector('.sa-prog'),
        strokeDashoffset: [138.2, 0],
        duration:         800,
        delay:            BASE * 2,  // delay the start of the full timeline
      })
      .add({
        targets:          icons[2] && icons[2].querySelector('.sa-ck'),
        strokeDashoffset: [30, 0],
        opacity:          [0, 1],
        duration:         400,
      }, '-=100');

    // LAUNCH (icon 3): orb rises via cy attribute
    anime({
      targets:  icons[3] && icons[3].querySelector('.sa-orb'),
      cy:       [60, 16],
      duration: 900,
      easing:   'easeOutCubic',
      delay:    BASE * 3,
    });

  }, { threshold: 0.08 });

  stepObserver.observe(steps);
})();
```

- [ ] Verify in browser: scroll to "How I Work". Step cards stagger in. Then:
  - **Discover**: radar arm sweeps one full rotation
  - **Design**: four corner brackets draw in one-by-one
  - **Build**: ring fills, then the checkmark draws in
  - **Launch**: orb rises from bottom to top of the dotted track
- All four cascade with 150ms between them.

- [ ] Check reduced motion: in DevTools, enable "Emulate CSS media feature prefers-reduced-motion". Reload. Step cards should appear instantly; icons should be static in their final drawn state (CSS fallback values from Task 2 apply).

- [ ] Check mobile at 375px. The process steps stack to 1 column. Confirm animations still trigger correctly as each card scrolls into view.
