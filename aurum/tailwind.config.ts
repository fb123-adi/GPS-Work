import type { Config } from "tailwindcss";

/**
 * AURUM design tokens.
 *
 * Palette tuned to an "old money" register: restrained, warm, and
 * monochromatic. The brand gold is muted to an antique brass so it reads
 * as heritage rather than flash. The bright #CA8A04 from the brief is kept
 * only as a non-text decorative tint; `gold` (antique brass) is the working
 * accent and `gold-ink` is the AA-contrast variant for text on cream.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0C0A09", // primary black
        charcoal: "#1C1917", // raised surfaces on dark
        graphite: "#44403C", // muted text on cream
        taupe: "#A8A29E", // secondary gray
        stone: "#D6D3D1", // hairline borders
        ivory: "#FAF7F0", // warm cream (old-money ivory)
        parchment: "#F1EBDD", // sectional cream tint
        champagne: "#E7DCC4", // soft gold-adjacent surface
        gold: "#A98343", // antique brass — working accent
        "gold-ink": "#7C5E2E", // darker brass for text on light (AA)
        "gold-glow": "#CA8A04", // decorative tint only (not for text)
      },
      fontFamily: {
        // Wired to next/font CSS variables in layout.tsx.
        display: ["var(--font-bodoni)", "Bodoni Moda", "serif"],
        body: ["var(--font-jost)", "Jost", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        luxe: "0.28em",
        wide2: "0.16em",
      },
      maxWidth: {
        editorial: "88rem",
      },
      transitionTimingFunction: {
        luxe: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "kenburns": {
          "0%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1.18)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s var(--ease-luxe, cubic-bezier(0.22,1,0.36,1)) both",
        marquee: "marquee 38s linear infinite",
        kenburns: "kenburns 18s ease-out forwards",
        shimmer: "shimmer 2.2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
