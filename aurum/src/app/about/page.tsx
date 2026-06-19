import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About",
  description:
    "AURUM — derived from the Latin for gold. A maison built at the intersection of luxury fashion, premium sport, and modern streetwear.",
};

const values = [
  { t: "Excellence", d: "We pursue the highest standard in every fibre, seam, and silhouette." },
  { t: "Craftsmanship", d: "Considered construction, made to be lived in and to last." },
  { t: "Prestige", d: "Designed for those who carry ambition into every room they enter." },
  { t: "Timelessness", d: "Fashion-forward, never trend-dependent. Built beyond the season." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="The Maison"
        title="AURUM — the pursuit of excellence"
        intro="Derived from the Latin word for gold, AURUM sits at the intersection of luxury fashion, premium sport, and modern streetwear — for those who demand both performance and status."
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <section className="bg-ivory py-16 sm:py-24">
        <div className="mx-auto grid max-w-editorial gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
          <Reveal className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="/images/about.webp"
              alt="The AURUM maison"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="grain absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
            <p className="absolute bottom-8 left-8 font-display text-3xl italic text-gold">
              Est. MMXXV
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <h2 className="font-display text-3xl leading-tight sm:text-4xl">
              Redefining modern sportswear
            </h2>
            <p className="mt-6 text-base font-light leading-relaxed text-graphite">
              AURUM exists to redefine modern sportswear through superior craftsmanship,
              exceptional materials, and timeless design. We build for ambitious individuals
              who refuse to choose between performance and prestige.
            </p>
            <p className="mt-4 text-base font-light leading-relaxed text-graphite">
              Every garment is engineered in our atelier and rendered in interactive 3D, so
              you can study the craft before it ever reaches you.
            </p>
            <div className="mt-10">
              <ButtonLink href="/collections" variant="primary">
                Explore the Collections
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-parchment py-16 sm:py-24">
        <div className="mx-auto max-w-editorial px-5 sm:px-8">
          <div className="grid gap-px overflow-hidden border border-stone bg-stone sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.t} delay={i * 0.1} className="bg-ivory p-9">
                <span className="text-[0.7rem] uppercase tracking-luxe text-taupe">0{i + 1}</span>
                <h3 className="mt-4 font-display text-2xl">{v.t}</h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-graphite">{v.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
