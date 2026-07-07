# AURUM — Design System

Register: brand (design IS the product). Site lives in `aurum/` as a framework-free multi-page static site.

## Concept

**The private house museum.** AURUM's site is a maison, not a store. Garments are exhibited as artifacts: engraved hairline "plates" (procedural SVG line art) on graphite plinths under spotlights, each with a provenance number (Nº 014 — Merino, Biella). The hero and product viewers are real WebGL (vendored Three.js) with liquid-gold material under studio light. Nothing appears instantly; everything arrives.

## Color (OKLCH; near-black drench + gold signature)

| Token | Value | Role |
|---|---|---|
| `--bg` | `oklch(12% 0.004 80)` | body drench (deep black #050505-family) |
| `--bg-deep` | `oklch(8% 0.003 80)` | hero / vault |
| `--surface` | `oklch(17% 0.005 80)` | graphite panels |
| `--raised` | `oklch(21% 0.006 80)` | raised panels, inputs |
| `--line` | `oklch(30% 0.008 85)` | hairline borders |
| `--ink` | `oklch(94% 0.014 90)` | warm ivory text |
| `--ink-soft` | `oklch(74% 0.018 88)` | secondary text (≥4.5:1 on bg) |
| `--gold` | `oklch(76% 0.119 95)` | Royal gold #D4AF37 — CTAs, hairlines, mark |
| `--champagne` | `oklch(86% 0.06 95)` | gold highlight |
| `--emerald` | `oklch(58% 0.10 165)` | accent (colorways) |
| `--burgundy` | `oklch(45% 0.12 15)` | accent (colorways) |
| `--sapphire` | `oklch(55% 0.10 260)` | accent (colorways) |
| `--silver` | `oklch(82% 0.008 260)` | titanium accent |

Strategy: **Drenched** near-black; gold ≤10% of surface, placed where a hand would touch. Gold-on-black band for Limited Edition is the one inversion.

## Typography

- **Display:** Italiana 400 (hairline fashion didone; self-hosted woff2). Headings `clamp()`, max 6rem, letter-spacing +0.01em, `text-wrap: balance`.
- **Text/UI:** Archivo 200/400/500/600 (machined grotesk; self-hosted). Body 1.0625rem / 1.68 line-height (light-on-dark bonus applied). Measure ≤70ch.
- Scale ratio ≥1.3. Caps only on short labels (buttons, provenance numbers).

## Components

- **Plate**: SVG garment engraving in a 4:5 frame, radial spotlight, plinth shadow, provenance caption. Stroke tinted by colorway.
- **Buttons**: `.btn-gold` (solid gold, black text), `.btn-ghost` (1px gold hairline, ivory text). 150–300ms ease-out-quart transitions.
- **Chrome**: fixed translucent header (blur earns its place over WebGL), drawer `<dialog>`s for cart/search, gold 2px focus rings.
- **Icons**: hand-rolled inline SVG, 1.5px stroke, one family.

## Motion

Choreographed arrival: hero load sequence (mark → headline mask reveal → CTAs), IntersectionObserver reveals with visible-by-default safety, scroll-snap galleries, mouse-parallax camera in WebGL. Ease-out-quart/expo only, 150–400ms; every effect has a `prefers-reduced-motion` alternative (instant/crossfade). 3D is progressive enhancement with static SVG fallback.

## Pages

`index.html` · `collection.html?c=men|women|unisex|kids` (+capsule filters) · `product.html?id=` (3D viewer) · `studio.html` (3D configurator) · `membership.html` · `about.html`. Shared: `css/aurum.css`, `js/{data,garments,ui,hero3d,garment3d,studio}.js`, vendored `three` + fonts.
