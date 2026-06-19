# AURUM — Luxury Sportswear & Apparel

A world-class luxury ecommerce experience for **AURUM**. Not a generic clothing
store — a digital luxury house for elite sportswear, built to communicate
**Performance · Prestige · Exclusivity · Excellence**.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — design tokens in `tailwind.config.ts`
- **Framer Motion** — scroll reveals, hover choreography, page motion
- Fonts via `next/font`: **Bodoni Moda** (display) + **Jost** (body)

## Getting started

```bash
cd aurum
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run typecheck
```

## Design system — "old money" luxury

A restrained, warm, monochromatic register. The brand gold is muted to an
**antique brass** so it reads heritage rather than flashy.

| Token        | Hex       | Use                                   |
| ------------ | --------- | ------------------------------------- |
| `ink`        | `#0C0A09` | Primary black                         |
| `charcoal`   | `#1C1917` | Raised dark surfaces                  |
| `graphite`   | `#44403C` | Body text on cream                    |
| `taupe`      | `#A8A29E` | Secondary text                        |
| `stone`      | `#D6D3D1` | Hairline borders                      |
| `ivory`      | `#FAF7F0` | Warm cream background                 |
| `parchment`  | `#F1EBDD` | Sectional cream tint                  |
| `gold`       | `#A98343` | Antique brass — working accent        |
| `gold-ink`   | `#7C5E2E` | Brass for text on light (AA contrast) |
| `gold-glow`  | `#CA8A04` | Decorative tint only (never text)     |

> The brief's bright `#CA8A04` is retained only as a decorative tint; it fails
> WCAG contrast as text, so `gold` / `gold-ink` are used for legible accents.

## Homepage structure

`src/app/page.tsx` composes the ten sections from the brief:

1. Cinematic Hero · 2. Collection Categories · 3. Brand Manifesto ·
4. Signature Collections (tabbed) · 5. Why AURUM · 6. Featured Products (carousel) ·
7. Social Proof · 8. AURUM Lifestyle · 9. Newsletter · 10. Footer (in layout)

## Imagery

Real campaign photography isn't bundled. Sections use **duotone editorial
placeholders** (`.duo-*` + `.grain` in `globals.css`) so the layout reads as
intentional luxury out of the box. Replace them with `next/image` — remote
patterns for Unsplash and Shopify CDN are pre-allowed in `next.config.mjs`.

## What's implemented vs. next

**Implemented:** full responsive homepage, navigation with mobile menu, working
**cart drawer** (client state via `CartProvider`), tabbed collections, snap
carousel, newsletter capture, SEO metadata, accessibility (skip link, focus
rings, reduced-motion, 44px targets), `next/font`.

**Scaffolded for next (per brief):** Stripe / Shopify Headless checkout,
product detail pages (360° views, size guide, care), search & filtering, i18n /
multi-currency, VIP memberships. The data layer (`src/lib/products.ts`) is
shaped to map onto a real storefront feed — swap the source in `getProducts()`.
