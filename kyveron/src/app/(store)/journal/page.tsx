import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { sql } from "@/lib/db";

export const metadata: Metadata = { title: "Journal", description: "Notes on fabric, fit, and training from Kyveron.", alternates: { canonical: "/journal" } };

export default async function JournalIndex() {
  const posts = await sql<{ slug: string; title: string; excerpt: string | null; cover_url: string | null; cover_alt: string | null; published_at: Date }[]>`
    select slug, title, excerpt, cover_url, cover_alt, published_at from journal_posts
    where status = 'published' and deleted_at is null and published_at <= now() order by published_at desc limit 30`;
  const [lead, ...rest] = posts;
  return (
    <div className="container-x py-12 lg:py-16">
      <h1 className="display text-[clamp(2.2rem,4.6vw,4rem)]">Journal</h1>
      <p className="mt-3 max-w-lg text-ink-soft">Practical notes on fabric, fit, care, and training.</p>
      {!lead && <p className="mt-10 text-ink-soft">No articles yet.</p>}
      {lead && (
        <Link href={`/journal/${lead.slug}`} className="group mt-12 grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-end">
          <span className="relative block aspect-[4/3] overflow-hidden bg-[#e7e2d8]">
            {lead.cover_url && <Image src={lead.cover_url} alt={lead.cover_alt ?? ""} fill priority sizes="(min-width: 768px) 55vw, 100vw" className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.02]" />}
          </span>
          <span className="block pb-4">
            <span className="spec-line block">{lead.published_at.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }).toUpperCase()}</span>
            <span className="display mt-3 block text-[clamp(1.8rem,3vw,2.6rem)] group-hover:underline">{lead.title}</span>
            {lead.excerpt && <span className="mt-3 block text-ink-soft">{lead.excerpt}</span>}
          </span>
        </Link>
      )}
      {rest.length > 0 && (
        <ul className="mt-16 grid gap-10 border-t border-line pt-10 md:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
          {rest.map((p) => (
            <li key={p.slug}>
              <Link href={`/journal/${p.slug}`} className="group block">
                <span className="relative block aspect-[4/3] overflow-hidden bg-[#e7e2d8]">{p.cover_url && <Image src={p.cover_url} alt={p.cover_alt ?? ""} fill sizes="33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.02]" />}</span>
                <span className="mt-4 block text-lg font-semibold group-hover:underline">{p.title}</span>
                {p.excerpt && <span className="mt-1 block text-sm text-ink-soft">{p.excerpt}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
