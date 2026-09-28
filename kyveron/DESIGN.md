# Kyveron Design System

## Direction

**The measured garment.** Kyveron's world is the cutting table and the track: chalk marks, spec sheets, measured hems. The page reads like a well-made garment label scaled up: an expanded wordmark, precise hairlines, exact numbers. Product photography carries the colour; the interface carries order.

Signature element: **the spec line.** Every product carries a single machined row of facts (fibre · weight · fit) set in the expanded display width with a cobalt tick for performance pieces. It appears on cards, the product page, and the hero, and it is the one place the type gets technical.

## Colour (brand palette, supplied by the owner)

| Token | Hex | Role |
|---|---|---|
| `--obsidian` | #151515 | Primary ink; drenched surfaces (hero, performance band, footer) |
| `--ivory` | #F2EEE6 | Page ground; ink on obsidian |
| `--graphite` | #303238 | Secondary surfaces on dark; strong UI text |
| `--stone` | #AAA394 | Hairlines, dividers, quiet metadata on dark (never body text on ivory; fails contrast) |
| `--cobalt` | #214C9A | Links, selected states, performance details, focus rings |
| `--ink-soft` | #55524B | Secondary text on ivory (7.1:1) |

Strategy: Restrained on shopping surfaces (ivory ground, obsidian ink, cobalt at under 5% of pixels). Drenched obsidian for the hero, the performance story band, and the footer. No gradients. The ivory ground is the owner's brand colour, not a default choice.

## Typography

- **Mona Sans** (variable, wght 200–900, wdth 75–125), one family used deliberately at two widths.
  - Display: wdth 112, weight 500, tracking −0.02em, `text-wrap: balance`, clamp up to 5.5rem.
  - Wordmark and spec line: wdth 125, weight 600, tracking +0.18em, uppercase (short labels only).
  - Text/UI: wdth 100, weight 400/500, 16–17px body, 1.6 line height, measure ≤ 68ch.
- Scale: 0.8125 / 0.875 / 1 / 1.25 / 1.5625 / 1.953 / 2.441 / clamp display.

## Motion tokens

```css
--ease-standard: cubic-bezier(0.22, 1, 0.36, 1);
--ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
--ease-emphasis: cubic-bezier(0.34, 1.56, 0.64, 1); /* reserved; not used for UI chrome */
--duration-fast: 160ms; --duration-standard: 320ms; --duration-slow: 600ms; --duration-page: 800ms;
```

- Entrances: `[data-reveal]` elements are visible by default; JS adds `.is-armed` then `.is-in`. Stagger 70ms, capped at 6 items.
- Hero: scroll-linked video scrub (desktop, five static-hero gates) per the scrub pipeline: Blob fetch with progress ring, dt-normalised lerp, gated seeks, delta-gated writes. Poster fallback everywhere else.
- Product cards: second image crossfade, image scale 1 → 1.03 inside the clip, quick-add fades in; no layout shift.
- Drawer: 320ms slide from right (desktop), bottom sheet on mobile, backdrop fade, focus trap, scroll lock.
- Reduced motion: every transition ≈ 0ms, hero shows poster, reveals show final state.

## Components

- Buttons: `btn-primary` (obsidian fill, ivory text), `btn-secondary` (1px obsidian outline), `btn-invert` (ivory on dark), `btn-link` (cobalt, underline on hover). 48px height, square corners (2px radius), fixed width during loading.
- Inputs: 48px, 1px `--line-strong` border, cobalt focus ring (2px, offset 2px), inline error text in `--danger`.
- Chips (sizes, filters): square, 44px min, selected = obsidian fill; unavailable = diagonal strike, still focusable with reason.
- Z scale: header 30, dropdown 40, backdrop 50, drawer 60, toast 70.
