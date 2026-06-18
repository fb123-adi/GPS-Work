/**
 * CENTRAL IMAGERY PIPELINE
 * ------------------------------------------------------------------
 * Single source of truth for every image on the site.
 *
 * The site ships with self-contained SVG placeholder art so it looks
 * designed out of the box. To make it cinematic with real photography:
 *
 *   OPTION A — Drop your own files
 *     Put images in /public/images/ using the keys below
 *     (e.g. hero.jpg) and change the extension here.
 *
 *   OPTION B — Use a remote source (Unsplash, your CDN, Shopify…)
 *     Flip USE_REMOTE to true and edit the REMOTE map. next.config.ts
 *     already whitelists images.unsplash.com — add other hosts there.
 *
 * Everything downstream imports from here, so one edit re-skins the site.
 */

const USE_REMOTE = false;

// Local placeholder art (always present, never breaks)
const LOCAL = {
  hero: "/images/hero.svg",
  manifesto: "/images/manifesto.svg",
  newsletter: "/images/newsletter.svg",
  men: "/images/men.svg",
  women: "/images/women.svg",
  children: "/images/children.svg",
  life1: "/images/life-1.svg",
  life2: "/images/life-2.svg",
  life3: "/images/life-3.svg",
  life4: "/images/life-4.svg",
} as const;

// Curated remote photography — loads on your machine / Vercel (not in the
// network-restricted build sandbox). Swap any of these for your own assets.
const REMOTE: Record<keyof typeof LOCAL, string> = {
  hero: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1920&q=90",
  manifesto: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=85",
  newsletter: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1600&q=80",
  men: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=85",
  women: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=85",
  children: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&q=85",
  life1: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=85",
  life2: "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=600&q=85",
  life3: "https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=800&q=85",
  life4: "https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?w=600&q=85",
};

export const img = USE_REMOTE ? REMOTE : LOCAL;
