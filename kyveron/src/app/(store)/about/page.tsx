import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { sql } from "@/lib/db";
import { Markdown } from "@/lib/markdown";

export const metadata: Metadata = { title: "About", description: "Kyveron makes daily wear and training clothes in India. What we make, how we choose fabric, and what we check." };

export default async function AboutPage() {
  const [p] = await sql<{ body: string }[]>`select body from content_pages where slug = 'about'`;
  return (
    <>
      <section className="container-x grid gap-10 py-14 md:grid-cols-[1.2fr_1fr] md:items-end lg:py-20">
        <h1 className="display text-[clamp(2.4rem,5.4vw,4.8rem)]">We make fewer clothes, and we make them carefully.</h1>
        <p className="max-w-md text-lg text-ink-soft">{p?.body ?? "Kyveron makes daily wear and training clothes in India."}</p>
      </section>
      <section className="container-x pb-16">
        <div className="relative aspect-[21/9] overflow-hidden bg-graphite" data-reveal="mask">
          <Image src="/media/placeholder/hero.webp" alt="Placeholder image for the Kyveron studio" fill sizes="100vw" className="object-cover" />
        </div>
      </section>
      <section className="container-x grid gap-12 pb-20 md:grid-cols-3">
        {[
          ["What we make", "Tees, polos, sweats, bottoms, and training layers. A small range that works together, restocked rather than replaced every season."],
          ["How we choose fabric", "We start from fibre and weight, then fit. Every product page states the composition, weight, and care, so you can compare without guessing."],
          ["What we will not claim", "We will not invent heritage, certifications, or sustainability credentials. When we can document something, we will publish it here with evidence."],
        ].map(([t, d]) => (
          <div key={t} data-reveal>
            <h2 className="text-lg font-semibold">{t}</h2>
            <p className="mt-3 text-[#2b2a27]">{d}</p>
          </div>
        ))}
      </section>
      <section className="border-t border-line bg-surface">
        <div className="container-x prose-kv py-16">
          <h2>Quality standards</h2>
          <Markdown source={"[Owner to document the actual quality checks, suppliers, and production partners here once they can be verified. This section is intentionally a placeholder.]"} />
          <p><Link href="/shop" className="link">Shop the collection</Link></p>
        </div>
      </section>
    </>
  );
}
