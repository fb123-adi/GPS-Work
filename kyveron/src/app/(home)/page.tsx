import Image from "next/image";
import Link from "next/link";
import { sql } from "@/lib/db";
import { featuredProducts, listCollections } from "@/lib/catalog";
import { getPriceFormatter } from "@/lib/currency";
import { Hero, type HeroVideo } from "@/components/home/Hero";
import { ProductCard } from "@/components/product/ProductCard";
import { wishedIds } from "@/lib/wishlist";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

// TODO(owner): replace bracketed values with your real QC process (Admin > Content > Homepage). Do not publish unverified claims.
const DEFAULT_QUALITY: [string, string][] = [
  ["Wash test", "Garments are washed [number] times at [temperature] and measured for shrinkage before a fabric is approved."],
  ["Wear test", "[Describe who wears samples, for how long, and where.]"],
  ["Seam check", "[Describe the stitch and seam checks done on each production batch.]"],
  ["Fit review", "[Describe how each size is fitted and approved.]"],
];

type HomeBlock = { qualitySteps?: [string, string][]; heroHeadline?: string; heroSub?: string; heroPoster?: string; heroPosterAlt?: string; heroVideo?: HeroVideo };

export default async function HomePage({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const { preview } = await searchParams;
  const [[block], featured, collections, fmt, wished] = await Promise.all([
    sql<{ data: HomeBlock; draft_data: HomeBlock | null }[]>`select data, draft_data from content_blocks where key = 'home'`,
    featuredProducts(4),
    listCollections(),
    getPriceFormatter(),
    wishedIds(),
  ]);
  // Content staff can preview the unpublished homepage draft.
  const user = preview === "draft" ? await getCurrentUser() : null;
  const showDraft = !!(user && can(user.roles, "content.manage") && block?.draft_data);
  const home = (showDraft ? block?.draft_data : block?.data) ?? {};
  const performance = collections.find((c) => c.slug === "performance");

  return (
    <>
      {showDraft && <p className="fixed inset-x-0 top-[var(--header-h)] z-[var(--z-dropdown)] bg-cobalt py-1.5 text-center text-xs text-white">Previewing unpublished homepage draft</p>}
      <Hero
        headline={home.heroHeadline ?? "Made for the hours you move."}
        sub={home.heroSub ?? "Daily wear and training pieces in considered fabrics. Made in India."}
        poster={home.heroPoster ?? "/media/placeholder/hero.webp"}
        posterAlt={home.heroPosterAlt ?? "Placeholder hero image. Replace with campaign photography."}
        video={home.heroVideo ?? null}
      />

      {/* Proposition: one sentence, three facts. */}
      <section className="container-x grid gap-10 py-20 md:grid-cols-[1.2fr_1fr] md:py-28" aria-labelledby="prop">
        <h2 id="prop" className="display text-[clamp(1.9rem,3.6vw,3.25rem)]" data-reveal>
          Fewer styles, made properly. Clothes you can wear to the gym, the office, and the airport in the same week.
        </h2>
        <dl className="grid content-end gap-6 border-t border-obsidian/20 pt-6 sm:grid-cols-3 md:grid-cols-1 md:border-t-0 md:border-l md:pl-10 md:pt-0" data-reveal-stagger>
          {[
            ["Fabric first", "Every product page lists fibre, weight, and care. No vague blends."],
            ["Honest stock", "What you see is what is on our shelf. No countdowns."],
            ["14-day returns", "Unworn, tags on. Start it from your account in a minute."],
          ].map(([t, d]) => (
            <div key={t}>
              <dt className="font-semibold">{t}</dt>
              <dd className="mt-1 text-ink-soft">{d}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-x pb-20 md:pb-28" aria-labelledby="featured">
        <div className="mb-8 flex items-end justify-between gap-6">
          <h2 id="featured" className="display text-[clamp(1.6rem,2.6vw,2.4rem)]">What people buy first</h2>
          <Link href="/shop" className="link hidden whitespace-nowrap sm:inline">Shop all products</Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6" data-reveal-stagger>
          {featured.map((p, i) => (
            <ProductCard key={p.id} p={p} fmt={fmt} priority={i < 2} wished={wished.has(p.id)} />
          ))}
        </div>
        <Link href="/shop" className="btn btn-secondary mt-10 w-full sm:hidden"><span className="btn-label">Shop all products</span></Link>
      </section>

      {/* Performance story: drenched obsidian, asymmetric. */}
      <section className="on-dark bg-obsidian text-ivory" aria-labelledby="perf">
        <div className="container-x grid items-center gap-12 py-20 md:grid-cols-[1fr_1.1fr] md:py-28">
          <div className="relative aspect-[4/5] overflow-hidden" data-reveal="mask">
            <Image src="/media/placeholder/editorial-1.webp" alt="Placeholder editorial image for the performance collection" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </div>
          <div className="max-w-xl">
            <p className="spec-line !text-cobalt-dark">PERFORMANCE</p>
            <h2 id="perf" className="display mt-4 text-[clamp(2rem,4vw,3.6rem)]" data-reveal>Built for heat, sweat, and a full range of movement.</h2>
            <p className="mt-6 text-lg leading-[1.75] text-ivory/85" data-reveal>
              Perforated back panels where heat builds first. Flatlock seams that sit flat under a pack strap. High-rise waistbands that stay put.
              Each piece lists what it is made of and how it should fit, so you can judge it yourself.
            </p>
            <ul className="mt-8 grid gap-3 border-t border-graphite pt-6 text-[0.9375rem]" data-reveal-stagger>
              <li className="flex justify-between gap-6"><span>Aero Training Tee</span><span className="spec-line">RECYCLED POLY · 8% ELASTANE</span></li>
              <li className="flex justify-between gap-6"><span>Sculpt Legging</span><span className="spec-line">280 GSM INTERLOCK</span></li>
              <li className="flex justify-between gap-6"><span>Featherweight Shell</span><span className="spec-line">40 G/M² RIPSTOP</span></li>
            </ul>
            <Link href={`/collections/${performance?.slug ?? "performance"}`} className="btn btn-invert mt-10"><span className="btn-label">Explore performance</span></Link>
          </div>
        </div>
      </section>

      {/* Collections: one wide, two stacked. */}
      <section className="container-x py-20 md:py-28" aria-labelledby="collections">
        <h2 id="collections" className="display mb-10 text-[clamp(1.6rem,2.6vw,2.4rem)]">Collections</h2>
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr] md:grid-rows-2 lg:gap-6">
          {collections.filter((c) => c.slug !== "performance").slice(0, 3).map((c, i) => (
            <Link key={c.slug} href={`/collections/${c.slug}`}
              className={`group relative block overflow-hidden bg-graphite text-ivory ${i === 0 ? "aspect-[4/3] md:row-span-2 md:aspect-auto" : "aspect-[16/9]"}`}
              data-reveal="scale">
              {c.banner_url && <Image src={c.banner_url} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-[900ms] ease-[var(--ease-smooth)] group-hover:scale-[1.03]" />}
              <span className="absolute inset-0 bg-obsidian/25" aria-hidden="true" />
              <span className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
                <span className="display block text-[clamp(1.5rem,2.4vw,2.2rem)]">{c.title}</span>
                <span className="mt-2 block max-w-md text-sm text-ivory/85">{c.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Quality story: spec sheet layout. */}
      <section className="border-y border-line bg-surface" aria-labelledby="quality">
        <div className="container-x grid gap-12 py-20 md:grid-cols-[1fr_1.4fr] md:py-28">
          <div>
            <h2 id="quality" className="display text-[clamp(1.8rem,3vw,2.8rem)]" data-reveal>How we decide a piece is ready</h2>
            <p className="mt-5 max-w-md text-ink-soft" data-reveal>We would rather tell you what we check than call it premium. These are the checks a garment passes before it goes on sale.</p>
            <Link href="/about" className="link mt-6 inline-block">About Kyveron</Link>
          </div>
          <ol className="divide-y divide-line border-y border-line" data-reveal-stagger>
            {(home.qualitySteps ?? DEFAULT_QUALITY).map(([t, d], i) => (
              <li key={t} className="grid grid-cols-[3rem_1fr] gap-4 py-6">
                <span className="spec-line pt-1 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <div><h3 className="font-semibold">{t}</h3><p className="mt-1 text-ink-soft">{d}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Editorial pair. */}
      <section className="container-x grid gap-10 py-20 md:grid-cols-2 md:items-end md:py-28" aria-labelledby="journal-h">
        <div className="relative aspect-[4/5] overflow-hidden" data-reveal="mask">
          <Image src="/media/placeholder/editorial-2.webp" alt="Placeholder editorial image for the journal" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="max-w-md md:pb-12">
          <h2 id="journal-h" className="display text-[clamp(1.8rem,3vw,2.8rem)]" data-reveal>Notes on fabric, fit, and training</h2>
          <p className="mt-5 text-ink-soft" data-reveal>Short, practical guides from the people who make the clothes. How to read GSM on a label. What actually helps when you train in humidity.</p>
          <Link href="/journal" className="btn btn-secondary mt-8"><span className="btn-label">Read the journal</span></Link>
        </div>
      </section>
    </>
  );
}
