import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/guards";
import { PageHeader, Panel } from "@/components/admin/ui";
import { PageForm } from "@/components/admin/ContentForms";

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireStaffPage("content.manage");
  const { slug } = await params;
  const [p] = await sql<{ slug: string; title: string; body: string; version: string; effective_date: Date | null; needs_legal_review: boolean; seo_description: string | null }[]>`
    select slug, title, body, version, effective_date, needs_legal_review, seo_description from content_pages where slug = ${slug}`;
  if (!p) notFound();
  return (
    <div className="max-w-5xl">
      <PageHeader title={p.title} sub="Legal text must be written or approved by a qualified lawyer. Bump the version and effective date when terms change." />
      <Panel><PageForm p={{ slug: p.slug, title: p.title, body: p.body, version: p.version, effectiveDate: p.effective_date?.toISOString().slice(0, 10) ?? "", needsLegalReview: p.needs_legal_review, seoDescription: p.seo_description ?? "" }} /></Panel>
    </div>
  );
}
