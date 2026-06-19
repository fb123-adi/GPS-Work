import { Reveal } from "@/components/ui/Reveal";

export function Manifesto() {
  return (
    <section className="relative overflow-hidden bg-ink py-28 text-ivory sm:py-36">
      <div className="grain absolute inset-0 opacity-[0.07]" />
      {/* faint oversized watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-0 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[28vw] leading-none text-ivory/[0.03]"
      >
        AURUM
      </span>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <span className="eyebrow-on-dark">Brand Manifesto</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mx-auto mt-7 max-w-3xl text-balance font-display text-4xl leading-[1.1] sm:text-5xl md:text-6xl">
            The Pursuit of <span className="italic text-gold">Excellence</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-2xl text-pretty text-lg font-light leading-relaxed text-ivory/75">
            AURUM exists to redefine modern sportswear through superior craftsmanship,
            exceptional materials, and timeless design — for ambitious individuals who
            demand both performance and status.
          </p>
        </Reveal>
        <Reveal delay={0.3} className="mt-10 flex justify-center">
          <span className="hairline" />
        </Reveal>
      </div>
    </section>
  );
}
