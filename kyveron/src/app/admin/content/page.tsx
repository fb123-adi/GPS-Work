import Link from "next/link";
import { sql } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/guards";
import { PageHeader, Panel, Pill, Table, statusTone } from "@/components/admin/ui";
import { CollectionForm, FaqRow, HomeForm } from "@/components/admin/ContentForms";

export const metadata = { title: "Content" };
const TABS = [["home", "Homepage"], ["journal", "Journal"], ["pages", "Legal and help pages"], ["faqs", "FAQs"], ["collections", "Collections"]] as const;

export default async function Content({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireStaffPage("content.manage");
  const sp = await searchParams;
  const tab = TABS.find(([k]) => k === sp.tab)?.[0] ?? "home";
  let body: React.ReactNode = null;
  if (tab === "home") {
    const [b] = await sql<{ data: Record<string, unknown>; draft_data: Record<string, unknown> | null }[]>`select data, draft_data from content_blocks where key = 'home'`;
    const d = (b?.draft_data ?? b?.data ?? {}) as { heroHeadline?: string; heroSub?: string; heroPosterAlt?: string; heroVideo?: { src: string; bytes: number } | null; qualitySteps?: [string, string][] };
    body = <Panel title="Homepage"><HomeForm v={{ heroHeadline: d.heroHeadline ?? "", heroSub: d.heroSub ?? "", heroPosterAlt: d.heroPosterAlt ?? "", videoSrc: d.heroVideo?.src ?? "", videoBytes: d.heroVideo ? String(d.heroVideo.bytes) : "", quality: d.qualitySteps ?? [], hasDraft: !!b?.draft_data }} /></Panel>;
  } else if (tab === "journal") {
    const posts = await sql<{ id: string; title: string; slug: string; status: string; published_at: Date | null }[]>`select id, title, slug, status, published_at from journal_posts where deleted_at is null order by coalesce(published_at, created_at) desc`;
    body = (
      <div className="grid gap-4">
        <div><Link href="/admin/content/journal/new" className="btn btn-primary btn-sm">New article</Link></div>
        <Table head={["Title", "Status", "Published"]}>{posts.map((p) => <tr key={p.id}><td className="px-3 py-2"><Link className="link" href={`/admin/content/journal/${p.id}`}>{p.title}</Link></td><td className="px-3"><Pill tone={statusTone(p.status)}>{p.status}</Pill></td><td className="px-3 text-xs">{p.published_at?.toLocaleDateString("en-IN") ?? "—"}</td></tr>)}</Table>
      </div>
    );
  } else if (tab === "pages") {
    const pages = await sql<{ slug: string; title: string; version: string; needs_legal_review: boolean; updated_at: Date }[]>`select slug, title, version, needs_legal_review, updated_at from content_pages order by title`;
    body = <Table head={["Page", "Version", "Review", "Updated"]}>{pages.map((p) => <tr key={p.slug}><td className="px-3 py-2"><Link className="link" href={`/admin/content/pages/${p.slug}`}>{p.title}</Link></td><td className="px-3">{p.version}</td><td className="px-3">{p.needs_legal_review ? <Pill tone="warn">needs lawyer review</Pill> : <Pill tone="good">approved</Pill>}</td><td className="px-3 text-xs">{p.updated_at.toLocaleDateString("en-IN")}</td></tr>)}</Table>;
  } else if (tab === "faqs") {
    const faqs = await sql<{ id: string; topic: string; question: string; answer: string; sort_order: number }[]>`select id, topic, question, answer, sort_order from faqs order by topic, sort_order`;
    body = <Panel title="Questions">{faqs.map((f) => <FaqRow key={f.id} f={{ id: f.id, topic: f.topic, question: f.question, answer: f.answer, sortOrder: f.sort_order }} />)}<p className="mt-4 text-sm font-medium">Add a question</p><FaqRow /></Panel>;
  } else {
    const cols = await sql<{ id: string; slug: string; title: string; description: string | null; banner_alt: string | null; status: string }[]>`select id, slug, title, description, banner_alt, status from collections where deleted_at is null order by sort_order`;
    body = <Panel title="Collections">{cols.map((c) => <CollectionForm key={c.id} c={{ id: c.id, slug: c.slug, title: c.title, description: c.description ?? "", bannerAlt: c.banner_alt ?? "", status: c.status }} />)}<p className="mt-4 text-sm font-medium">New collection</p><CollectionForm /></Panel>;
  }
  return (
    <div className="grid max-w-6xl gap-5">
      <PageHeader title="Content" />
      <nav aria-label="Content sections" className="flex flex-wrap gap-2">{TABS.map(([k, l]) => <Link key={k} href={`/admin/content?tab=${k}`} className="chip !min-h-9 text-sm" data-selected={k === tab} aria-current={k === tab ? "page" : undefined}>{l}</Link>)}</nav>
      {body}
    </div>
  );
}
