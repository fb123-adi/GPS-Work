"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

/**
 * Cinematic hero, built to the scroll-scrub standard:
 *  - Five static-hero gates, identical in CSS (globals below) and JS, decided
 *    live via matchMedia change listeners.
 *  - Video fetched as a Blob (works on hosts without HTTP Range) behind an
 *    honest progress ring, with a 20s stall watchdog.
 *  - dt-normalised lerp in a rAF loop that rests when converged or off-screen.
 *  - Gated seeks (never write currentTime mid-seek) and delta-gated DOM writes.
 *  - Complete without video: the poster and copy are the page.
 * Without a configured video it renders a static poster with a restrained
 * desktop-only parallax.
 */
export type HeroVideo = { src: string; bytes: number } | null;

const GATES = [
  "(max-width: 720px)",
  "(orientation: portrait) and (max-width: 1024px)",
  "(orientation: portrait) and (pointer: coarse)",
  "(orientation: landscape) and (pointer: coarse) and (max-height: 560px)",
  "(prefers-reduced-motion: reduce)",
];

const smoothstep = (p: number, e0: number, e1: number) => {
  const t = Math.min(1, Math.max(0, (p - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

export function Hero({ headline, sub, poster, posterAlt, video }: { headline: string; sub: string; poster: string; posterAlt: string; video: HeroVideo }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const videoEl = useRef<HTMLVideoElement>(null);
  const ring = useRef<SVGSVGElement>(null);
  const media = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = root.current!;
    const v = videoEl.current;
    const bands = Array.from(section.querySelectorAll<HTMLElement>("[data-band]")).map((el) => ({
      el, a: Number(el.dataset.a), b: Number(el.dataset.b), first: el.dataset.first === "1", last: el.dataset.last === "1", op: -1, k: -1,
    }));
    let scrubOn = false;
    let started = false;
    let heroOnScreen = true;
    let target = 0, shown = 0, rafId: number | null = null, lastTick = 0;
    let seekBusy = false, pending: number | null = null;
    let parallaxRaf = 0, lastShift = -1;

    const progress = () => {
      const r = section.getBoundingClientRect();
      const range = section.offsetHeight - window.innerHeight;
      return range <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / range));
    };

    const requestSeek = (t: number) => {
      if (!v || !v.duration) return;
      if (seekBusy) { pending = t; return; }
      seekBusy = true;
      v.currentTime = t;
    };
    const onSeeked = () => {
      seekBusy = false;
      if (pending !== null) { const t = pending; pending = null; requestSeek(t); }
    };
    const onErr = () => { seekBusy = false; pending = null; stage.current?.classList.add("video-failed"); };

    const updateCaptions = (p: number) => {
      for (const band of bands) {
        const f = Math.min(0.03, (band.b - band.a) / 3);
        const inO = band.first ? 1 : smoothstep(p, band.a, band.a + f);
        const outO = band.last ? 1 : 1 - smoothstep(p, band.b - f, band.b);
        const op = Math.round(inO * outO * 1000) / 1000;
        const k = Math.round(Math.min(1, Math.max(0, (p - band.a) / Math.min(0.04, (band.b - band.a) * 0.35))) * 125) / 125;
        if (op !== band.op) { band.op = op; band.el.style.opacity = String(op); band.el.style.visibility = op === 0 ? "hidden" : "visible"; }
        const kk = band.first ? 1 : k;
        if (kk !== band.k) { band.k = kk; band.el.style.setProperty("--k", String(kk)); }
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(100, now - (lastTick || now));
      lastTick = now;
      shown += (target - shown) * (1 - Math.pow(1 - 0.14, dt / 16.667));
      if (Math.abs(target - shown) < 0.0005) { shown = target; rafId = null; lastTick = 0; }
      else rafId = requestAnimationFrame(tick);
      if (v?.duration) requestSeek(shown * v.duration);
      updateCaptions(shown);
    };
    const onScroll = () => {
      target = progress();
      if (rafId === null && heroOnScreen) rafId = requestAnimationFrame(tick);
    };

    const loadVideo = async () => {
      if (started || !video || !v) return;
      started = true;
      const ctrl = new AbortController();
      let watchdog = setTimeout(() => ctrl.abort(), 20000);
      try {
        const res = await fetch(video.src, { signal: ctrl.signal, priority: "low" } as RequestInit);
        if (!res.ok || !res.body) throw new Error("video");
        const total = Number(res.headers.get("Content-Length")) || video.bytes;
        const reader = res.body.getReader();
        const chunks: BlobPart[] = [];
        let got = 0, lastRing = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          clearTimeout(watchdog);
          watchdog = setTimeout(() => ctrl.abort(), 20000);
          chunks.push(value as BlobPart);
          got += value.length;
          const now = performance.now();
          if (now - lastRing > 100) { lastRing = now; ring.current?.style.setProperty("--ld", String(Math.round(126 * (1 - Math.min(1, got / total))))); }
        }
        clearTimeout(watchdog);
        ring.current?.style.setProperty("--ld", "0");
        v.src = URL.createObjectURL(new Blob(chunks, { type: "video/mp4" }));
        v.load();
        v.addEventListener("canplay", () => {
          requestSeek(progress() * v.duration);
          stage.current?.classList.add("video-ready");
        }, { once: true });
      } catch {
        clearTimeout(watchdog);
        stage.current?.classList.add("video-failed");
      }
    };

    // Static-mode parallax: poster drifts at 12% of scroll speed while on screen (desktop, motion allowed).
    const parallax = () => {
      parallaxRaf = 0;
      if (!media.current || !heroOnScreen) return;
      const shift = Math.round(Math.min(window.scrollY, window.innerHeight) * 0.12);
      if (shift !== lastShift) { lastShift = shift; media.current.style.transform = `translate3d(0, ${shift}px, 0)`; }
    };
    const onParallax = () => { if (!parallaxRaf) parallaxRaf = requestAnimationFrame(parallax); };

    const enable = () => {
      if (scrubOn) return;
      scrubOn = true;
      section.dataset.mode = video ? "scrub" : "static";
      if (video) {
        void loadVideo();
        window.addEventListener("scroll", onScroll, { passive: true });
        bands.forEach((b) => { b.op = -1; b.k = -1; });
        onScroll();
      } else {
        window.addEventListener("scroll", onParallax, { passive: true });
      }
    };
    const disable = () => {
      scrubOn = false;
      section.dataset.mode = "static";
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onParallax);
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
      if (media.current) media.current.style.transform = "";
      bands.forEach((b) => { b.el.style.opacity = ""; b.el.style.visibility = ""; b.el.style.removeProperty("--k"); b.op = -1; b.k = -1; });
    };
    const mqls = GATES.map((q) => matchMedia(q));
    const apply = () => (mqls.some((m) => m.matches) ? disable() : enable());
    mqls.forEach((m) => m.addEventListener("change", apply));
    apply();

    const io = new IntersectionObserver(([e]) => {
      heroOnScreen = e.isIntersecting;
      if (heroOnScreen && scrubOn) (video ? onScroll : onParallax)();
    });
    io.observe(section);
    v?.addEventListener("seeked", onSeeked);
    v?.addEventListener("error", onErr);

    return () => {
      mqls.forEach((m) => m.removeEventListener("change", apply));
      disable();
      io.disconnect();
      v?.removeEventListener("seeked", onSeeked);
      v?.removeEventListener("error", onErr);
      cancelAnimationFrame(parallaxRaf);
    };
  }, [video]);

  return (
    <section ref={root} className="hero on-dark relative bg-obsidian text-ivory" data-has-video={video ? "1" : "0"} data-mode="static" aria-label="Introduction">
      <div ref={stage} className="hero-stage sticky top-0 h-[100svh] min-h-[560px] overflow-hidden">
        <div ref={media} className="load-2 absolute inset-[-6%_0_-6%_0] will-change-transform">
          <Image src={poster} alt={posterAlt} fill priority sizes="100vw" className="object-cover" />
        </div>
        {video && (
          <video ref={videoEl} className="hero-video absolute inset-0 h-full w-full object-cover opacity-0" preload="none" muted playsInline aria-hidden="true" tabIndex={-1} />
        )}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_30%_60%,rgba(10,10,12,0.05)_30%,rgba(10,10,12,0.62)_100%)]" aria-hidden="true" />

        <div className="container-x relative flex h-full flex-col justify-end pb-[max(3.5rem,8vh)]">
          <div data-band data-a="0" data-b="0.36" data-first="1" className="hero-band max-w-[46rem]">
            <h1 className="display load-3 text-[clamp(2.6rem,6.2vw,5.5rem)] [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]">{headline}</h1>
            <p className="load-4 mt-5 max-w-[34rem] text-[1.0625rem] leading-[1.7] text-ivory/90 sm:text-lg">{sub}</p>
            <div className="load-5 mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-invert"><span className="btn-label">Shop collection</span></Link>
              <Link href="/collections/performance" className="btn btn-ghost-dark"><span className="btn-label">Explore performance</span></Link>
            </div>
          </div>
          {video && (
            <>
              <div data-band data-a="0.38" data-b="0.68" className="hero-band hero-band-later max-w-[40rem]" aria-hidden="true">
                <p className="display text-[clamp(2rem,4.4vw,3.8rem)]">Weight, fibre, and fit, stated plainly.</p>
                <p className="spec-line mt-4 !text-stone">220 GSM SUPIMA · 4-WAY STRETCH TWILL · 17.5 MICRON MERINO</p>
              </div>
              <div data-band data-a="0.7" data-b="1" data-last="1" className="hero-band hero-band-later max-w-[40rem]" aria-hidden="true">
                <p className="display text-[clamp(2rem,4.4vw,3.8rem)]">Made in India. Worn in Indian weather.</p>
              </div>
            </>
          )}
        </div>

        {video && (
          <svg ref={ring} className="hero-ring absolute bottom-6 right-6 h-10 w-10 text-ivory/70" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
            <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="126" style={{ strokeDashoffset: "var(--ld,126)" }} transform="rotate(-90 24 24)" />
          </svg>
        )}
      </div>
      <style>{`
        .hero[data-has-video="1"][data-mode="scrub"] { height: 340vh; }
        .hero[data-mode="scrub"] .hero-band { position: absolute; left: var(--gutter); right: var(--gutter); bottom: max(3.5rem, 8vh); }
        .hero[data-mode="static"] .hero-band-later { display: none; }
        .hero-video { transition: opacity 600ms var(--ease-smooth); transform: translateZ(0); }
        .hero-stage.video-ready .hero-video { opacity: 1; }
        .hero-stage.video-ready .hero-ring, .hero-stage.video-failed .hero-ring, .hero[data-mode="static"] .hero-ring { opacity: 0; transition: opacity 400ms; }
        .hero-stage.video-failed .hero-video { display: none; }
        .hero-band-later > * { transform: translate3d(0, calc((1 - var(--k, 1)) * 18px), 0); }
        @media (max-width: 720px), (orientation: portrait) and (max-width: 1024px), (orientation: portrait) and (pointer: coarse),
          (orientation: landscape) and (pointer: coarse) and (max-height: 560px), (prefers-reduced-motion: reduce) {
          .hero { height: auto !important; }
          .hero .hero-band-later, .hero .hero-video, .hero .hero-ring { display: none; }
        }
      `}</style>
    </section>
  );
}
