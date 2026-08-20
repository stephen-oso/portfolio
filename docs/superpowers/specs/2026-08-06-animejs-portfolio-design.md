# anime.js Portfolio Animations — Design Spec
**Date:** 2026-08-06
**Approach:** Additive layer (anime.js alongside existing CSS/Lottie/Lenis stack)

---

## Overview

Add anime.js to Stephen Okulaja's portfolio to upgrade three specific animation moments: hero text entrance on page load, staggered scroll-triggered reveals for card groups, and SVG timeline animations for the four process step icons. Everything else (CSS `.fade-in`, Lottie, Lenis, cursor, tilt, magnetic buttons) stays untouched.

**Feel:** Smooth and considered — 600–900ms durations, ease-out or spring easing. Nothing flashy. Restrained and mobile-responsive throughout.

---

## Integration

- Add anime.js via CDN in `index.html` (before `main.js`)
- No build tools required — pure script tag, same pattern as Lottie and Lenis
- All anime.js code lives in `main.js`, clearly sectioned

---

## 1. Hero Text Entrance

**Target elements:** `.hero-name`, `.hero-top`, `.hero-rule`, `.hero-bottom`

**Behaviour:**
- On `DOMContentLoaded`, JS splits `.hero-name` text into individual `<span>` elements per word
- Words start at `translateY: 20px, opacity: 0`
- Animate to `translateY: 0, opacity: 1` with 70ms stagger between words
- Duration: 700ms, easing: `easeOutQuart`
- After headline completes, `.hero-top`, `.hero-rule`, `.hero-bottom` follow as a group: 60ms stagger, 600ms duration, same easing

**Constraint:** These elements already use `.fade-in`. Remove `fade-in` from hero elements that are handled by anime.js so the CSS and JS don't conflict.

---

## 2. Staggered Card Scroll Reveals

**Target elements:** `.card--featured`, `.card` (grid), `.step-card`

**Behaviour:**
- Remove `.fade-in` class from all cards and step cards; add `data-anime="card"` to project cards and `data-anime="step"` to step cards
- The existing `IntersectionObserver` in `main.js` gets one extra branch: when an element with `data-anime` enters view, fire an anime.js stagger animation instead of a class toggle
- **Project cards:** Featured card enters first (700ms, translateY 24→0, opacity 0→1, `easeOutQuart`), then grid cards stagger 90ms apart with same values
- **Step cards:** All four stagger 80ms apart, same translateY/opacity/easing
- Start state set via inline style (`opacity: 0, transform: translateY(24px)`) so elements are hidden before JS fires — no flash of visible content
- Works identically on mobile; translateY distance is small (24px) so it reads well on any screen size

---

## 3. SVG Process Icon Timelines

**Target:** The four `.step-anim` SVGs inside `.process-steps`

**Trigger:** Single IntersectionObserver on `.process-steps`; when it enters view, fire all four timelines with 150ms stagger between them. Fires once (observer disconnects after trigger).

**Timelines:**

| Step | Element | Animation | Duration | Easing |
|------|---------|-----------|----------|--------|
| Discover | `.sa-sweep` | `rotate: 360` (full sweep) | 1200ms | `easeInOutSine` |
| Design | `.sa-br-a` through `.sa-br-d` | `strokeDashoffset: [length, 0]` per bracket, 100ms stagger | 600ms | `easeOutCubic` |
| Build | `.sa-prog` then `.sa-ck` | Ring: `strokeDashoffset` fill 800ms; Checkmark: draw after ring, 400ms | 1200ms total | `easeOutCubic` |
| Launch | `.sa-orb` | `cy: [60, 16]` (SVG attribute, not transform) with settle | 900ms | `easeOutCubic` |

**CSS pre-requisites for strokeDashoffset animations:** `.sa-br-*`, `.sa-prog`, and `.sa-ck` must have `stroke-dasharray` set to their path length in CSS, and `stroke-dashoffset` set to that same length as the initial hidden state. anime.js then animates `stroke-dashoffset` to `0` (fully drawn).

**CSS cleanup:** Remove any `@keyframes` and `animation:` rules for `.sa-sweep`, `.sa-br-*`, `.sa-prog`, `.sa-ck`, `.sa-orb` from `style.css`. anime.js owns these.

---

## Files Changed

| File | Change |
|------|--------|
| `index.html` | Add anime.js CDN script tag; remove `fade-in` from hero elements and card elements; add `data-anime` attributes |
| `style.css` | Remove SVG icon keyframes and animation rules; add `.is-hidden` initial state for `data-anime` elements |
| `main.js` | Add three sections: hero entrance, stagger observer branch, SVG timelines |

---

## Out of Scope

- Case study pages (`projects/*.html`) — no changes
- Lottie animations — untouched
- CSS `.fade-in` on non-card elements (section labels, about text, tools list, contact copy, footer) — untouched
- Marquee strip — untouched
