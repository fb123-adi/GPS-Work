import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { Markdown } from "@/lib/markdown";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";

type Post = { id: string; slug: string; title: string; excerpt: string | null; body: string; cover_url: string | null; cover_alt: string | null; author_name: string | null; published_at: Date | null; status: string; seo_title: string | null; seo_description: string | null };

/** Published posts are public; drafts are visible to content staff as a preview. */
async function load(slug: string, preview: boolean) {
  const [p] = await sql<Post[]>`select id, slug, title, excerpt, body, cover_url, cover_alt, author_name, published_at, status, seo_title, seo_description
    from journal_posts where slug = ${slug} and deleted_at is null`;
  if (!p) return null;
  const live = p.status === "published" && p.published_at && p.published_at <= new Date();
  if (live) return { post: p, preview: false };
  if (!preview) return null;
  const user = await getCurrentUser();
  return user && can(user.roles, "content.manage") ? { post: p, preview: true } : null;
}

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ preview?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await load((await params).slug, false);
  if (!r) return { title: "Journal", robots: { index: false } };
  return { title: r.post.seo_title ?? r.post.title, description: r.post.seo_description ?? r.post.excerpt ?? undefined, openGraph: r.post.cover_url ? { images: [r.post.cover_url], type: "article" } : undefined, alternates: { canonical: `/journal/${r.post.slug}` } };
}

export default async function JournalPost({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const r = await load(slug, sp.preview === "1");
  if (!r) notFound();
  const p = r.post;
  return (
    <article className="pb-20">
      {r.preview && <p className="bg-cobalt px-4 py-2 text-center text-sm text-white">Preview: this article is not published.</p>}
      <header className="container-x max-w-3xl py-12 lg:py-16">
        <Link href="/journal" className="link text-sm">Journal</Link>
        <h1 className="display mt-4 text-[clamp(2.2rem,4.6vw,3.8rem)]">{p.title}</h1>
        <p className="spec-line mt-4">{[p.author_name, p.published_at?.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })].filter(Boolean).join(" · ").toUpperCase()}</p>
      </header>
      {p.cover_url && <div className="container-x"><div className="relative aspect-[16/9] overflow-hidden bg-[#e7e2d8]"><Image src={p.cover_url} alt={p.cover_alt ?? ""} fill priority sizes="100vw" className="object-cover" /></div></div>}
      <div className="container-x prose-kv mt-12 max-w-3xl text-[1.0625rem] leading-[1.75]"><Markdown source={p.body} /></div>
    </article>
  );
}
