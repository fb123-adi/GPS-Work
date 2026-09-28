"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Staggered reveal for content inside Suspense boundaries. It runs after its
 * own hydration (the global RevealRoot may run before streamed content
 * hydrates, and must not touch it). Children stay visible by default.
 */
export function RevealGroup({ as: Tag = "ul", className, children }: { as?: "ul" | "div"; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement & HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const kids = Array.from(root.children) as HTMLElement[];
    const vh = window.innerHeight;
    const armed = kids.filter((el) => el.getBoundingClientRect().top > vh * 0.92);
    armed.forEach((el, i) => {
      el.setAttribute("data-reveal", "");
      el.style.setProperty("--stagger", String(i % 6));
      el.classList.add("is-armed");
    });
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        el.classList.add("is-in");
        io.unobserve(el);
        setTimeout(() => el.classList.add("is-done"), 1400);
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    armed.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      armed.forEach((el) => { if (!el.classList.contains("is-in")) el.classList.remove("is-armed"); });
    };
  }, []);
  return <Tag ref={ref} className={className} data-reveal-own="">{children}</Tag>;
}
