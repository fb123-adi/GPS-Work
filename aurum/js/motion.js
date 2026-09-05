/* ============================================================
   AURUM motion — the cinematic layer
   Butter-smooth inertial scroll · scroll-triggered depth ·
   a cursor that reads the room · magnetic CTAs · plate hover.

   Pure progressive enhancement. Every effect is opt-in by
   feature + capability, and the site is fully usable — reveals
   and all — if this module never runs. Honours reduced-motion
   and simplifies away from anything hover/pointer-driven on
   touch devices.
   ============================================================ */

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const Lenis = window.Lenis;
const hasGSAP = !!(gsap && ScrollTrigger);

let lenis = null;

export function initMotion() {
  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.config({ nullTargetWarn: false });
  }

  scrollProgress();      // gold hairline of read-progress (always, cheap)

  if (reduce) return;    // everything below is motion; respect the setting

  smoothScroll();        // Lenis inertial scroll, bridged to ScrollTrigger
  if (hasGSAP) {
    heroCinema();        // hero content parallax + exit
  }
  if (finePointer) {
    customCursor();      // dot + ring that reacts to context
    magnetic();          // CTA magnetism
    plateTilt();         // pointer-follow tilt on hero plates
  }
}

/* ------------------------------------------------------------
   Smooth inertial scroll (Lenis) + ScrollTrigger bridge
   ------------------------------------------------------------ */
function smoothScroll() {
  if (!Lenis) return;
  // Nested scroll surfaces keep their own native scroll.
  document.querySelectorAll(
    ".studio-col, .drawer-body, .search-results, .admin-table-wrap, .editor-body"
  ).forEach(el => el.setAttribute("data-lenis-prevent", ""));

  lenis = new Lenis({
    duration: 1.15,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.4,
    lerp: 0.1,
  });
  document.documentElement.classList.add("lenis-on");

  if (hasGSAP) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // In-page anchors glide instead of jumping.
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -90, duration: 1.2 });
  });

  window.__aurumLenis = lenis; // handy for other modules if ever needed
}

/* ------------------------------------------------------------
   Read-progress: a gold hairline across the very top
   ------------------------------------------------------------ */
function scrollProgress() {
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  const update = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    const p = h > 0 ? Math.min(1, Math.max(0, scrollY / h)) : 0;
    bar.style.transform = `scaleX(${p})`;
  };
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update, { passive: true });
  update();
}

/* ------------------------------------------------------------
   Hero: content lifts & fades as you leave; scene eases back
   ------------------------------------------------------------ */
function heroCinema() {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  const inner = hero.querySelector(".hero-inner");
  const canvas = hero.querySelector(".hero-canvas");
  const veil = hero.querySelector(".hero-veil");

  if (inner) {
    gsap.to(inner, {
      yPercent: -14, opacity: 0.35, ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 },
    });
  }
  if (canvas) {
    gsap.to(canvas, {
      yPercent: 12, scale: 1.08, ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 },
    });
  }
  if (veil) {
    gsap.to(veil, {
      opacity: 1.15, ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 },
    });
  }
}

/* ------------------------------------------------------------
   Depth: featured plates & rows drift gently against the scroll
   ------------------------------------------------------------ */
function depthParallax(scope = document) {
  const mark = el => { if (el.dataset.pxOn) return false; el.dataset.pxOn = "1"; return true; };

  // Featured capsule plate — a slow, expensive float.
  const cap = scope.querySelector?.(".capsule-plate");
  if (cap && mark(cap)) {
    gsap.fromTo(cap, { yPercent: 7 }, {
      yPercent: -7, ease: "none",
      scrollTrigger: { trigger: cap, start: "top bottom", end: "bottom top", scrub: 0.8 },
    });
  }
  // Floor & limited-edition plates, offset from each other for parallax layering.
  scope.querySelectorAll?.(".floor-plates .plate, #ltd-plates .plate").forEach((el, i) => {
    if (!mark(el)) return;
    const amt = 5 + (i % 3) * 4;
    gsap.fromTo(el, { yPercent: amt }, {
      yPercent: -amt, ease: "none",
      scrollTrigger: { trigger: el.closest("section, .floor") || el, start: "top bottom", end: "bottom top", scrub: 1 },
    });
  });
  // Studio-teaser art: a whisper of vertical drift.
  const teaser = scope.querySelector?.(".studio-teaser .viewer");
  if (teaser && mark(teaser)) {
    gsap.fromTo(teaser, { yPercent: 5 }, {
      yPercent: -5, ease: "none",
      scrollTrigger: { trigger: teaser, start: "top bottom", end: "bottom top", scrub: 1 },
    });
  }
}

/* ------------------------------------------------------------
   Exhibit grids: a masked wipe as each plate enters the frame.
   Complements (does not replace) the CSS .reveal fade system.
   ------------------------------------------------------------ */
function plateReveal(scope = document) {
  const cards = scope.querySelectorAll?.(".exhibit-grid .exhibit, .rail .exhibit") || [];
  cards.forEach(card => {
    if (card.dataset.wipeOn) return;
    const art = card.querySelector(".plate");
    if (!art) return;
    card.dataset.wipeOn = "1";
    gsap.set(art, { clipPath: "inset(0 0 100% 0)" });
    gsap.to(art, {
      clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: card, start: "top 90%", once: true },
    });
  });
}

/* ------------------------------------------------------------
   Custom cursor — a dot that leads, a ring that follows,
   both reading what's under them.
   ------------------------------------------------------------ */
function customCursor() {
  const dot = document.createElement("div");
  const ring = document.createElement("div");
  dot.className = "cursor-dot";
  ring.className = "cursor-ring";
  ring.innerHTML = `<span class="cursor-label"></span>`;
  dot.setAttribute("aria-hidden", "true");
  ring.setAttribute("aria-hidden", "true");
  document.body.append(dot, ring);
  document.documentElement.classList.add("has-cursor");

  const label = ring.querySelector(".cursor-label");
  let mx = innerWidth / 2, my = innerHeight / 2;
  let rx = mx, ry = my;

  const setDot = gsap && gsap.quickSetter ? gsap.quickSetter(dot, "css") : null;

  addEventListener("pointermove", e => {
    if (e.pointerType && e.pointerType !== "mouse") return;
    mx = e.clientX; my = e.clientY;
    if (setDot) setDot({ x: mx, y: my });
    else dot.style.transform = `translate(${mx}px, ${my}px)`;
  }, { passive: true });

  const raf = () => {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // Context: what does the ring become over what?
  const linkSel = 'a, button, [role="button"], input, select, textarea, summary, label, .chip, .swatch-dot, .size-btn, .opt-btn, .qty button';
  const viewSel = '.plate, .media-stage';

  document.addEventListener("pointerover", e => {
    const view = e.target.closest(viewSel);
    const link = e.target.closest(linkSel);
    if (view && !link) {
      ring.dataset.state = "view";
      label.textContent = view.closest("[data-cursor-label]")?.dataset.cursorLabel || "View";
    } else if (link) {
      ring.dataset.state = "link";
      label.textContent = "";
    } else {
      ring.dataset.state = "";
      label.textContent = "";
    }
  });

  document.addEventListener("pointerdown", () => ring.classList.add("down"));
  document.addEventListener("pointerup", () => ring.classList.remove("down"));
  document.addEventListener("mouseleave", () => { dot.style.opacity = "0"; ring.style.opacity = "0"; });
  document.addEventListener("mouseenter", () => { dot.style.opacity = ""; ring.style.opacity = ""; });
}

/* ------------------------------------------------------------
   Magnetic CTAs — the button leans toward the pointer.
   ------------------------------------------------------------ */
function magnetic() {
  const targets = document.querySelectorAll(".btn-gold, .btn-dark, [data-magnetic], .scroll-cue");
  targets.forEach(el => {
    const strength = el.classList.contains("btn-gold") || el.classList.contains("btn-dark") ? 0.35 : 0.25;
    const xTo = gsap ? gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" }) : null;
    const yTo = gsap ? gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" }) : null;
    const move = e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      if (xTo) { xTo(x); yTo(y); } else el.style.transform = `translate(${x}px, ${y}px)`;
    };
    const reset = () => { if (xTo) { xTo(0); yTo(0); } else el.style.transform = ""; };
    el.addEventListener("pointerenter", () => el.addEventListener("pointermove", move));
    el.addEventListener("pointerleave", () => { el.removeEventListener("pointermove", move); reset(); });
  });
}

/* ------------------------------------------------------------
   Plate tilt — hero/capsule plates follow the pointer in 3D.
   ------------------------------------------------------------ */
function plateTilt() {
  const plates = document.querySelectorAll(".capsule-plate .plate, .studio-teaser .viewer");
  plates.forEach(el => {
    el.style.transformStyle = "preserve-3d";
    const max = 6;
    const move = e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      if (gsap) gsap.to(el, { rotationY: px * max, rotationX: -py * max, duration: 0.5, ease: "power2.out", transformPerspective: 900 });
    };
    const reset = () => { if (gsap) gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.7, ease: "power3.out" }); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", reset);
  });
}

/* Scan freshly-rendered content for motion. Idempotent — safe to call
   after every paint. Pages reach this through ui.js' reveal helpers, so
   no page code needs to know motion exists. */
export function motionScan(scope = document) {
  if (!hasGSAP || reduce) return;
  depthParallax(scope);
  plateReveal(scope);
  ScrollTrigger.refresh();
}

/* Explicit refresh (e.g. after layout-changing async content). */
export function refreshMotion() {
  if (!hasGSAP || reduce) return;
  ScrollTrigger.refresh();
}
