import type { MetadataRoute } from "next";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const [products, collections, posts] = await Promise.all([
    sql<{ slug: string; updated_at: Date }[]>`select slug, updated_at from products where status = 'published' and deleted_at is null and (publish_at is null or publish_at <= now())`,
    sql<{ slug: string; updated_at: Date }[]>`select slug, updated_at from collections where status = 'published' and deleted_at is null`,
    sql<{ slug: string; updated_at: Date }[]>`select slug, updated_at from journal_posts where status = 'published' and deleted_at is null and published_at <= now()`,
  ]);
  const staticPages = ["", "/shop", "/about", "/journal", "/contact", "/faq", "/size-guide", "/returns", "/track-order"];
  return [
    ...staticPages.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const })),
    ...products.map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: p.updated_at })),
    ...collections.map((c) => ({ url: `${base}/collections/${c.slug}`, lastModified: c.updated_at })),
    ...posts.map((p) => ({ url: `${base}/journal/${p.slug}`, lastModified: p.updated_at })),
  ];
}
