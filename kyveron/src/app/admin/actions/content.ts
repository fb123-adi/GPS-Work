"use server";

import { z } from "zod";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guards";
import { audit } from "@/lib/audit";
import { storeImage, UploadError } from "@/lib/storage";

export type CState = { ok?: boolean; message?: string } | undefined;
const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80);

async function maybeUpload(form: FormData, field: string): Promise<string | null> {
  const f = form.get(field);
  if (!(f instanceof File) || f.size === 0) return null;
  return (await storeImage(f, "content")).url;
}

/** Homepage block: saved as a draft, previewable, then published explicitly. */
export async function saveHome(_: CState, form: FormData): Promise<CState> {
  const user = await requirePermission("content.manage");
  const quality: [string, string][] = [];
  for (let i = 0; i < 6; i++) {
    const t = String(form.get(`q${i}t`) ?? "").trim().slice(0, 60);
    const d = String(form.get(`q${i}d`) ?? "").trim().slice(0, 300);
    if (t && d) quality.push([t, d]);
  }
  let poster: string | null = null;
  try {
    poster = await maybeUpload(form, "posterFile");
  } catch (e) {
    return { message: e instanceof UploadError ? e.message : "Upload failed." };
  }
  const videoSrc = String(form.get("videoSrc") ?? "").trim();
  const videoBytes = Number(form.get("videoBytes") ?? 0);
  if (videoSrc && !/^(\/|https:\/\/)[^\s"'<>]+\.mp4$/.test(videoSrc)) return { message: "Video must be an .mp4 path or https URL." };
  const [cur] = await sql<{ data: Record<string, unknown>; draft_data: Record<string, unknown> | null }[]>`select data, draft_data from content_blocks where key = 'home'`;
  const base = cur?.draft_data ?? cur?.data ?? {};
  const draft = {
    ...base,
    heroHeadline: String(form.get("heroHeadline") ?? "").trim().slice(0, 90) || base.heroHeadline,
    heroSub: String(form.get("heroSub") ?? "").trim().slice(0, 200) || base.heroSub,
    heroPosterAlt: String(form.get("heroPosterAlt") ?? "").trim().slice(0, 200) || base.heroPosterAlt,
    ...(poster ? { heroPoster: poster } : {}),
    heroVideo: videoSrc ? { src: videoSrc, bytes: Number.isFinite(videoBytes) && videoBytes > 0 ? videoBytes : 8_000_000 } : null,
    qualitySteps: quality.length ? quality : base.qualitySteps,
  };
  await sql`insert into content_blocks (key, data, draft_data, updated_by) values ('home', ${sql.json(base as never)}, ${sql.json(draft as never)}, ${user.id})
    on conflict (key) do update set draft_data = excluded.draft_data, updated_by = excluded.updated_by, updated_at = now()`;
  await audit(user.id, "content.home.draft", "content_block", "home", { after: draft });
  if (form.get("intent") === "publish") {
    await sql`update content_blocks set data = draft_data, draft_data = null where key = 'home'`;
    await audit(user.id, "content.home.publish", "content_block", "home");
    refresh();
    return { ok: true, message: "Published to the home page." };
  }
  refresh();
  return { ok: true, message: "Draft saved. Preview it, then publish." };
}

export async function savePost(_: CState, form: FormData): Promise<CState> {
  const user = await requirePermission("content.manage");
  const parsed = z.object({
    id: z.string().uuid().optional(), slug, title: z.string().trim().min(3).max(140), excerpt: z.string().trim().max(300).optional(),
    body: z.string().max(50000), coverAlt: z.string().trim().max(200).optional(), authorName: z.string().trim().max(80).optional(),
    status: z.enum(["draft", "published", "archived"]), publishedAt: z.string().optional(),
    seoTitle: z.string().trim().max(70).optional(), seoDescription: z.string().trim().max(160).optional(),
  }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { message: `${String(parsed.error.issues[0].path[0])}: ${parsed.error.issues[0].message}` };
  const d = parsed.data;
  let cover: string | null = null;
  try {
    cover = await maybeUpload(form, "coverFile");
  } catch (e) {
    return { message: e instanceof UploadError ? e.message : "Upload failed." };
  }
  const values = {
    slug: d.slug, title: d.title, excerpt: d.excerpt || null, body: d.body, cover_alt: d.coverAlt || null, author_name: d.authorName || null,
    status: d.status, published_at: d.status === "published" ? (d.publishedAt ? new Date(d.publishedAt) : new Date()) : d.publishedAt ? new Date(d.publishedAt) : null,
    seo_title: d.seoTitle || null, seo_description: d.seoDescription || null, ...(cover ? { cover_url: cover } : {}),
  };
  let id = d.id;
  try {
    if (id) await sql`update journal_posts set ${sql(values)} where id = ${id}`;
    else id = (await sql<{ id: string }[]>`insert into journal_posts ${sql({ ...values, created_by: user.id })} returning id`)[0].id;
  } catch (e) {
    return { message: e instanceof Error && /unique/i.test(e.message) ? "That URL slug is taken." : "Could not save." };
  }
  await audit(user.id, d.id ? "journal.update" : "journal.create", "journal_post", id!, { after: { ...values, body: `${d.body.length} chars` } });
  refresh();
  if (!d.id) redirect(`/admin/content/journal/${id}?saved=1`);
  return { ok: true, message: "Saved." };
}

export async function deletePost(id: string) {
  const user = await requirePermission("content.manage");
  await sql`update journal_posts set deleted_at = now(), status = 'archived' where id = ${id}`;
  await audit(user.id, "journal.delete", "journal_post", id);
  redirect("/admin/content?tab=journal");
}

export async function savePage(_: CState, form: FormData): Promise<CState> {
  const user = await requirePermission("content.manage");
  const parsed = z.object({
    slug: z.string().regex(/^[a-z-]{2,40}$/), title: z.string().trim().min(2).max(120), body: z.string().max(60000),
    version: z.string().trim().min(1).max(20), effectiveDate: z.string().optional(), needsLegalReview: z.string().optional(),
    seoDescription: z.string().trim().max(160).optional(),
  }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { message: parsed.error.issues[0].message };
  const d = parsed.data;
  const [before] = await sql`select version, needs_legal_review from content_pages where slug = ${d.slug}`;
  await sql`insert into content_pages (slug, title, body, version, effective_date, needs_legal_review, seo_description, updated_by)
    values (${d.slug}, ${d.title}, ${d.body}, ${d.version}, ${d.effectiveDate || null}, ${d.needsLegalReview === "on"}, ${d.seoDescription || null}, ${user.id})
    on conflict (slug) do update set title = excluded.title, body = excluded.body, version = excluded.version, effective_date = excluded.effective_date,
      needs_legal_review = excluded.needs_legal_review, seo_description = excluded.seo_description, updated_by = excluded.updated_by, updated_at = now()`;
  await audit(user.id, "page.update", "content_page", d.slug, { before, after: { version: d.version, needsLegalReview: d.needsLegalReview === "on" } });
  refresh();
  return { ok: true, message: "Page saved." };
}

export async function saveFaq(_: CState, form: FormData): Promise<CState> {
  const user = await requirePermission("content.manage");
  const parsed = z.object({
    id: z.string().uuid().optional(), topic: z.string().trim().min(2).max(40), question: z.string().trim().min(5).max(200),
    answer: z.string().trim().min(5).max(2000), sortOrder: z.coerce.number().int().min(0).max(999), remove: z.string().optional(),
  }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { message: parsed.error.issues[0].message };
  const d = parsed.data;
  if (d.id && d.remove) await sql`delete from faqs where id = ${d.id}`;
  else if (d.id) await sql`update faqs set topic = ${d.topic}, question = ${d.question}, answer = ${d.answer}, sort_order = ${d.sortOrder} where id = ${d.id}`;
  else await sql`insert into faqs (topic, question, answer, sort_order) values (${d.topic}, ${d.question}, ${d.answer}, ${d.sortOrder})`;
  await audit(user.id, d.remove ? "faq.delete" : "faq.save", "faq", d.id ?? null, { after: d });
  refresh();
  return { ok: true, message: d.remove ? "Removed." : "Saved." };
}

export async function saveCollection(_: CState, form: FormData): Promise<CState> {
  const user = await requirePermission("content.manage");
  const parsed = z.object({
    id: z.string().uuid().optional(), slug, title: z.string().trim().min(2).max(80), description: z.string().trim().max(400).optional(),
    bannerAlt: z.string().trim().max(200).optional(), status: z.enum(["draft", "published", "archived"]),
    seoTitle: z.string().trim().max(70).optional(), seoDescription: z.string().trim().max(160).optional(),
  }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { message: parsed.error.issues[0].message };
  const d = parsed.data;
  let banner: string | null = null;
  try {
    banner = await maybeUpload(form, "bannerFile");
  } catch (e) {
    return { message: e instanceof UploadError ? e.message : "Upload failed." };
  }
  const values = { slug: d.slug, title: d.title, description: d.description || null, banner_alt: d.bannerAlt || null, status: d.status,
    seo_title: d.seoTitle || null, seo_description: d.seoDescription || null, ...(banner ? { banner_url: banner } : {}) };
  try {
    if (d.id) await sql`update collections set ${sql(values)} where id = ${d.id}`;
    else await sql`insert into collections ${sql(values)}`;
  } catch {
    return { message: "That URL slug is taken." };
  }
  await audit(user.id, "collection.save", "collection", d.id ?? d.slug, { after: values });
  refresh();
  return { ok: true, message: "Collection saved." };
}
