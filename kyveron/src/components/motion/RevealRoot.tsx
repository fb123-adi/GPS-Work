"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scroll reveals. Elements marked [data-reveal] are visible in the HTML.
 * Only those still below the fold when this runs are armed (hidden), then
 * revealed by IntersectionObserver. Groups marked [data-reveal-stagger]
 * stagger their children (max 6 steps). After the entrance, delays are
 * retired so hover states respond immediately. Reduced motion skips it all,
 * and the page pauses animations while the tab is hidden.
 */
export function RevealRoot() {
  const pathname = usePathname();

  useEffect(() => {
    const onVis = () => document.body.classList.toggle("tab-hidden", document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches || !("IntersectionObserver" in window)) return;

    document.querySelectorAll<HTMLElement>("[data-reveal-stagger]:not([data-reveal-own] *)").forEach((group) => {
      Array.from(group.children).forEach((child, i) => {
        const el = child as HTMLElement;
        if (!el.hasAttribute("data-reveal")) el.setAttribute("data-reveal", "");
        el.style.setProperty("--stagger", String(Math.min(i, 5)));
      });
    });

    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in):not([data-reveal-own] *)"));
    const vh = window.innerHeight;
    const toWatch = els.filter((el) => el.getBoundingClientRect().top > vh * 0.92);
    toWatch.forEach((el) => el.classList.add("is-armed"));

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.classList.add("is-in");
          io.unobserve(el);
          el.addEventListener("transitionend", () => el.classList.add("is-done"), { once: true });
          setTimeout(() => el.classList.add("is-done"), 1400);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    toWatch.forEach((el) => io.observe(el));

    // If reduced motion is switched on mid-session, show everything at once.
    const onChange = () => {
      if (reduce.matches) {
        io.disconnect();
        document.querySelectorAll(".is-armed").forEach((el) => el.classList.add("is-in", "is-done"));
      }
    };
    reduce.addEventListener("change", onChange);
    return () => {
      io.disconnect();
      // Unrevealed elements must never stay hidden if this effect is torn down.
      document.querySelectorAll(".is-armed:not(.is-in)").forEach((el) => el.classList.remove("is-armed"));
      reduce.removeEventListener("change", onChange);
    };
  }, [pathname]);

  return null;
}
