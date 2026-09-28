"use client";

import { useActionState } from "react";
import { deletePost, saveCollection, saveFaq, saveHome, savePage, savePost, type CState } from "@/app/admin/actions/content";

const inp = "input !min-h-10 text-sm";
function Msg({ s }: { s: CState }) {
  return s?.message ? <span className={`text-sm ${s.ok ? "text-success" : "text-danger"}`} role="status">{s.message}</span> : null;
}
function F({ id, label, children, hint }: { id: string; label: string; children: React.ReactNode; hint?: string }) {
  return <div className="field"><label htmlFor={id}>{label}</label>{children}{hint && <p className="field-hint">{hint}</p>}</div>;
}

export function HomeForm({ v }: { v: { heroHeadline: string; heroSub: string; heroPosterAlt: string; videoSrc: string; videoBytes: string; quality: [string, string][]; hasDraft: boolean } }) {
  const [s, action, pending] = useActionState(saveHome, undefined);
  return (
    <form action={action} className="grid gap-4" encType="multipart/form-data">
      {v.hasDraft && <p className="notice notice-cobalt text-sm">There is an unpublished draft. <a className="link" href="/?preview=draft" target="_blank" rel="noopener">Preview it</a>.</p>}
      <F id="h-h" label="Hero headline"><input id="h-h" name="heroHeadline" defaultValue={v.heroHeadline} className={inp} maxLength={90} /></F>
      <F id="h-s" label="Hero supporting line"><textarea id="h-s" name="heroSub" defaultValue={v.heroSub} className="textarea !min-h-20 text-sm" maxLength={200} /></F>
      <div className="grid gap-4 md:grid-cols-2">
        <F id="h-p" label="Hero poster image (optional replacement)" hint="Landscape, at least 2400px wide. Shown on phones, reduced motion, and while video loads."><input id="h-p" name="posterFile" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="text-sm" /></F>
        <F id="h-pa" label="Poster alt text"><input id="h-pa" name="heroPosterAlt" defaultValue={v.heroPosterAlt} className={inp} maxLength={200} /></F>
        <F id="h-v" label="Scroll video (optional .mp4)" hint="Encode with a keyframe every 8 frames (ffmpeg -g 8). Leave blank for a still hero."><input id="h-v" name="videoSrc" defaultValue={v.videoSrc} className={inp} placeholder="/media/hero-scrub.mp4" /></F>
        <F id="h-vb" label="Video size in bytes" hint="Used for the loading ring when the host omits Content-Length."><input id="h-vb" name="videoBytes" inputMode="numeric" defaultValue={v.videoBytes} className={inp} /></F>
      </div>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Quality checks (home page list). Only publish what you actually do.</legend>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="grid gap-2 md:grid-cols-[200px_1fr]">
            <input aria-label={`Check ${i + 1} title`} name={`q${i}t`} defaultValue={v.quality[i]?.[0] ?? ""} className={inp} maxLength={60} />
            <input aria-label={`Check ${i + 1} description`} name={`q${i}d`} defaultValue={v.quality[i]?.[1] ?? ""} className={inp} maxLength={300} />
          </div>
        ))}
      </fieldset>
      <div className="flex flex-wrap items-center gap-2">
        <button name="intent" value="draft" className="btn btn-secondary btn-sm" disabled={pending}>Save draft</button>
        <a className="btn btn-secondary btn-sm" href="/?preview=draft" target="_blank" rel="noopener">Preview draft</a>
        <button name="intent" value="publish" className="btn btn-primary btn-sm" disabled={pending}>Publish</button>
        <Msg s={s} />
      </div>
    </form>
  );
}

export function PostForm({ p }: { p?: Record<string, string> }) {
  const [s, action, pending] = useActionState(savePost, undefined);
  const v = (k: string) => p?.[k] ?? "";
  return (
    <form action={action} className="grid gap-4" encType="multipart/form-data">
      {p?.id && <input type="hidden" name="id" value={p.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <F id="j-t" label="Title"><input id="j-t" name="title" defaultValue={v("title")} className={inp} required maxLength={140} /></F>
        <F id="j-s" label="URL slug"><input id="j-s" name="slug" defaultValue={v("slug")} className={inp} required /></F>
        <F id="j-a" label="Author"><input id="j-a" name="authorName" defaultValue={v("authorName")} className={inp} /></F>
        <F id="j-st" label="Status"><select id="j-st" name="status" defaultValue={v("status") || "draft"} className="select !min-h-10 text-sm"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></F>
        <F id="j-d" label="Publish date (optional; future = scheduled)"><input id="j-d" name="publishedAt" type="datetime-local" defaultValue={v("publishedAt")} className={inp} /></F>
        <F id="j-c" label="Cover image"><input id="j-c" name="coverFile" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="text-sm" /></F>
      </div>
      <F id="j-ca" label="Cover alt text"><input id="j-ca" name="coverAlt" defaultValue={v("coverAlt")} className={inp} /></F>
      <F id="j-e" label="Excerpt"><textarea id="j-e" name="excerpt" defaultValue={v("excerpt")} className="textarea !min-h-16 text-sm" maxLength={300} /></F>
      <F id="j-b" label="Body" hint="Markdown: ## heading, - list, **bold**, [link](https://…), > note. HTML is not rendered."><textarea id="j-b" name="body" defaultValue={v("body")} className="textarea !min-h-80 font-mono text-sm" /></F>
      <div className="grid gap-4 md:grid-cols-2">
        <F id="j-st2" label="SEO title"><input id="j-st2" name="seoTitle" defaultValue={v("seoTitle")} className={inp} maxLength={70} /></F>
        <F id="j-sd" label="SEO description"><input id="j-sd" name="seoDescription" defaultValue={v("seoDescription")} className={inp} maxLength={160} /></F>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn btn-primary btn-sm" disabled={pending}>Save</button>
        {p?.slug && <a className="btn btn-secondary btn-sm" href={`/journal/${p.slug}?preview=1`} target="_blank" rel="noopener">Preview</a>}
        {p?.id && <button type="button" className="btn btn-danger btn-sm" onClick={() => { if (confirm("Delete this article?")) void deletePost(p.id); }}>Delete</button>}
        <Msg s={s} />
      </div>
    </form>
  );
}

export function PageForm({ p }: { p: { slug: string; title: string; body: string; version: string; effectiveDate: string; needsLegalReview: boolean; seoDescription: string } }) {
  const [s, action, pending] = useActionState(savePage, undefined);
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="slug" value={p.slug} />
      <div className="grid gap-4 md:grid-cols-3">
        <F id="pg-t" label="Title"><input id="pg-t" name="title" defaultValue={p.title} className={inp} /></F>
        <F id="pg-v" label="Version"><input id="pg-v" name="version" defaultValue={p.version} className={inp} /></F>
        <F id="pg-e" label="Effective date"><input id="pg-e" name="effectiveDate" type="date" defaultValue={p.effectiveDate} className={inp} /></F>
      </div>
      <F id="pg-b" label="Body (Markdown)"><textarea id="pg-b" name="body" defaultValue={p.body} className="textarea !min-h-96 font-mono text-sm" /></F>
      <F id="pg-sd" label="SEO description"><input id="pg-sd" name="seoDescription" defaultValue={p.seoDescription} className={inp} maxLength={160} /></F>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="needsLegalReview" defaultChecked={p.needsLegalReview} className="checkbox !mt-0" /> Pending legal review (shows a draft notice and hides the page from search engines)</label>
      <div className="flex items-center gap-2"><button className="btn btn-primary btn-sm" disabled={pending}>Save page</button><a className="btn btn-secondary btn-sm" href={`/legal/${p.slug}`} target="_blank" rel="noopener">View</a><Msg s={s} /></div>
    </form>
  );
}

export function FaqRow({ f }: { f?: { id: string; topic: string; question: string; answer: string; sortOrder: number } }) {
  const [s, action, pending] = useActionState(saveFaq, undefined);
  return (
    <form action={action} className="grid gap-2 border-b border-line py-3 md:grid-cols-[120px_1fr_1.4fr_60px_auto]">
      {f && <input type="hidden" name="id" value={f.id} />}
      <input aria-label="Topic" name="topic" defaultValue={f?.topic ?? ""} placeholder="Topic" className={inp} />
      <input aria-label="Question" name="question" defaultValue={f?.question ?? ""} placeholder="Question" className={inp} />
      <textarea aria-label="Answer" name="answer" defaultValue={f?.answer ?? ""} placeholder="Answer" className="textarea !min-h-10 text-sm" />
      <input aria-label="Order" name="sortOrder" defaultValue={f?.sortOrder ?? 0} className={inp} inputMode="numeric" />
      <span className="flex items-start gap-1">
        <button className="btn btn-secondary btn-sm !min-h-10" disabled={pending}>{f ? "Save" : "Add"}</button>
        {f && <button name="remove" value="1" className="btn btn-danger btn-sm !min-h-10" disabled={pending} onClick={(e) => { if (!confirm("Remove this question?")) e.preventDefault(); }}>×</button>}
      </span>
      <Msg s={s} />
    </form>
  );
}

export function CollectionForm({ c }: { c?: Record<string, string> }) {
  const [s, action, pending] = useActionState(saveCollection, undefined);
  const v = (k: string) => c?.[k] ?? "";
  return (
    <form action={action} className="grid gap-3 border-b border-line py-4 md:grid-cols-2" encType="multipart/form-data">
      {c?.id && <input type="hidden" name="id" value={c.id} />}
      <F id={`c-t-${v("id")}`} label="Title"><input id={`c-t-${v("id")}`} name="title" defaultValue={v("title")} className={inp} /></F>
      <F id={`c-s-${v("id")}`} label="URL slug"><input id={`c-s-${v("id")}`} name="slug" defaultValue={v("slug")} className={inp} /></F>
      <F id={`c-d-${v("id")}`} label="Description"><textarea id={`c-d-${v("id")}`} name="description" defaultValue={v("description")} className="textarea !min-h-16 text-sm" maxLength={400} /></F>
      <div className="grid gap-3">
        <F id={`c-b-${v("id")}`} label="Banner image"><input id={`c-b-${v("id")}`} name="bannerFile" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="text-sm" /></F>
        <F id={`c-ba-${v("id")}`} label="Banner alt text"><input id={`c-ba-${v("id")}`} name="bannerAlt" defaultValue={v("bannerAlt")} className={inp} /></F>
      </div>
      <F id={`c-st-${v("id")}`} label="Status"><select id={`c-st-${v("id")}`} name="status" defaultValue={v("status") || "draft"} className="select !min-h-10 text-sm"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></F>
      <div className="flex items-end gap-2"><button className="btn btn-primary btn-sm" disabled={pending}>{c ? "Save collection" : "Create collection"}</button><Msg s={s} /></div>
    </form>
  );
}
