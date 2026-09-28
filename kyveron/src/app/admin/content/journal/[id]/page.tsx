import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/guards";
import { PageHeader, Panel } from "@/components/admin/ui";
import { PostForm } from "@/components/admin/ContentForms";

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  await requireStaffPage("content.manage");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [p] = await sql<{ id: string; slug: string; title: string; excerpt: string | null; body: string; cover_alt: string | null; author_name: string | null; status: string; published_at: Date | null; seo_title: string | null; seo_description: string | null }[]>`
    select * from journal_posts where id = ${id} and deleted_at is null`;
  if (!p) notFound();
  const local = (d: Date | null) => (d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");
  return (
    <div className="max-w-4xl">
      <PageHeader title={p.title} />
      <Panel><PostForm p={{ id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt ?? "", body: p.body, coverAlt: p.cover_alt ?? "", authorName: p.author_name ?? "", status: p.status, publishedAt: local(p.published_at), seoTitle: p.seo_title ?? "", seoDescription: p.seo_description ?? "" }} /></Panel>
    </div>
  );
}
