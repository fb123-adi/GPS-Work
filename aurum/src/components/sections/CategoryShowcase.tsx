import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

const categories = [
  {
    label: "Men",
    href: "/men",
    copy: "Compression, tailoring & limited drops.",
    image: "/images/category-men.webp",
  },
  {
    label: "Women",
    href: "/women",
    copy: "Sculpted activewear & lifestyle sets.",
    image: "/images/category-women.webp",
  },
  {
    label: "Children",
    href: "/children",
    copy: "Premium essentials, made to move.",
    image: "/images/category-children.webp",
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
                <Image
                  src={cat.image}
                  alt={`${cat.label} collection`}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-[1.2s] ease-luxe group-hover:scale-105"
                />
                <div className="grain absolute inset-0" />
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
