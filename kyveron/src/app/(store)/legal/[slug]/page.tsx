import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { Markdown } from "@/lib/markdown";

type Page = { slug: string; title: string; body: string; version: string; effective_date: Date | null; needs_legal_review: boolean; updated_at: Date; seo_description: string | null };

async function load(slug: string) {
  if (!/^[a-z-]{2,40}$/.test(slug)) return null;
  const [p] = await sql<Page[]>`select slug, title, body, version, effective_date, needs_legal_review, updated_at, seo_description
    from content_pages where slug = ${slug} and status = 'published'`;
  return p ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await load((await params).slug);
  return p ? { title: p.title, description: p.seo_description ?? undefined, robots: p.needs_legal_review ? { index: false } : undefined } : { title: "Not found" };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await load((await params).slug);
  if (!p) notFound();
  return (
    <article className="container-x max-w-3xl py-12 lg:py-16">
      <h1 className="display text-[clamp(2rem,4vw,3rem)]">{p.title}</h1>
      <p className="mt-3 text-sm text-ink-soft">
        Version {p.version} · {p.effective_date ? `Effective ${p.effective_date.toLocaleDateString("en-IN")}` : "Effective date to be set"} · Last updated {p.updated_at.toLocaleDateString("en-IN")}
      </p>
      {p.needs_legal_review && (
        <p className="notice notice-error mt-6 text-sm" role="note">Draft pending review by a qualified lawyer. This text is a placeholder and does not describe Kyveron&apos;s final terms.</p>
      )}
      <div className="prose-kv mt-8"><Markdown source={p.body} /></div>
    </article>
  );
}
