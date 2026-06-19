import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

const tenets = ["Fitness", "Success", "Ambition", "Discipline"];

export function Lifestyle() {
  return (
    <section className="bg-ivory py-20 sm:py-28">
      <div className="mx-auto max-w-editorial px-5 sm:px-8">
        <div className="grid items-stretch gap-5 lg:grid-cols-2">
          {/* Editorial image */}
          <Reveal className="relative min-h-[28rem] overflow-hidden lg:min-h-[36rem]">
            <div className="grain absolute inset-0 duo-graphite" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-9">
              <span className="eyebrow-on-dark">The AURUM Lifestyle</span>
              <p className="mt-4 max-w-xs font-display text-2xl text-ivory">
                Where discipline becomes design.
              </p>
            </div>
          </Reveal>

          {/* Copy block */}
          <Reveal delay={0.12} className="flex flex-col justify-center bg-charcoal p-9 text-ivory sm:p-14">
            <span className="eyebrow-on-dark">Editorial</span>
            <h2 className="mt-6 text-balance font-display text-4xl leading-tight sm:text-5xl">
              More than apparel — a way of moving through the world
            </h2>
            <p className="mt-6 max-w-lg text-base font-light leading-relaxed text-ivory/75">
              AURUM is worn by those who treat every day as a discipline. Our editorial
              chronicles the athletes, founders, and creators who live at the intersection
              of performance and prestige.
            </p>

            <ul className="mt-9 flex flex-wrap gap-3">
              {tenets.map((t) => (
                <li
                  key={t}
                  className="border border-ivory/20 px-4 py-2 text-[0.66rem] uppercase tracking-wide2 text-ivory/80"
                >
                  {t}
                </li>
              ))}
            </ul>

            <Link
              href="/lifestyle"
              className="group mt-10 inline-flex items-center gap-3 self-start text-[0.72rem] uppercase tracking-wide2 text-gold"
            >
              Read the Journal
              <span className="h-px w-8 bg-gold transition-all duration-300 ease-luxe group-hover:w-12" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
