import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const categories = [
  {
    label: "Men",
    href: "/men",
    copy: "Compression, tailoring & limited drops.",
    tone: "duo-ink",
  },
  {
    label: "Women",
    href: "/women",
    copy: "Sculpted activewear & lifestyle sets.",
    tone: "duo-graphite",
  },
  {
    label: "Children",
    href: "/children",
    copy: "Premium essentials, made to move.",
    tone: "duo-olive",
  },
];

export function CategoryShowcase() {
  return (
    <section className="bg-ivory py-20 sm:py-28">
      <div className="mx-auto max-w-editorial px-5 sm:px-8">
        <Reveal className="mb-12 flex items-end justify-between gap-6">
          <div>
            <span className="eyebrow">The Collections</span>
            <h2 className="mt-4 max-w-xl text-3xl leading-tight sm:text-4xl">
              Dressed for every pursuit
            </h2>
          </div>
          <Link
            href="/collections"
            className="hidden shrink-0 pb-2 text-[0.7rem] uppercase tracking-wide2 text-ink underline-offset-8 hover:text-gold-ink hover:underline sm:block"
          >
            View all
          </Link>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-3">
          {categories.map((cat, i) => (
            <Reveal key={cat.label} delay={i * 0.12}>
              <Link
                href={cat.href}
                className="group relative block aspect-[4/5] overflow-hidden"
              >
                <div
                  className={cn(
                    "grain absolute inset-0 transition-transform duration-[1.2s] ease-luxe group-hover:scale-105",
                    cat.tone
                  )}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-1 p-7">
                  <h3 className="font-display text-3xl tracking-wide text-ivory sm:text-4xl">
                    {cat.label}
                  </h3>
                  <p className="text-sm font-light text-ivory/70">{cat.copy}</p>
                  <span className="mt-4 flex items-center gap-2 text-[0.66rem] uppercase tracking-wide2 text-gold">
                    Explore
                    <span className="h-px w-6 bg-gold transition-all duration-300 ease-luxe group-hover:w-10" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
