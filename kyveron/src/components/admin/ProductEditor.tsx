"use client";

import Image from "next/image";
import { useActionState, useRef, useState, useTransition } from "react";
import {
  deleteImage, deleteProduct, duplicateProduct, saveProduct, saveVariants, setProductStatus, updateImage, uploadImages,
} from "@/app/admin/actions/products";
import { SubmitButton } from "@/components/ui/SubmitButton";

type P = {
  id?: string; name: string; slug: string; subtitle: string; description: string; categoryId: string; gender: string; material: string;
  care: string; fit: string; fitNotes: string; seoTitle: string; seoDescription: string; publishAt: string; isFeatured: boolean;
  isPerformance: boolean; collections: string[];
};

const inputCls = "input !min-h-10 text-sm";

export function ProductForm({ p, categories, collections }: { p: P; categories: { id: string; name: string }[]; collections: { id: string; title: string }[] }) {
  const [s, action] = useActionState(saveProduct, undefined);
  const [name, setName] = useState(p.name);
  const [slug, setSlug] = useState(p.slug);
  const [slugTouched, setSlugTouched] = useState(!!p.id);
  const e = s?.errors ?? {};
  const err = (k: string) => (e[k] ? <p className="field-error">{e[k]}</p> : null);
  const f = (k: keyof P, label: string, opts: { area?: boolean; max?: number; hint?: string; type?: string } = {}) => (
    <div className="field">
      <label htmlFor={`pf-${k}`}>{label}</label>
      {opts.area ? (
        <textarea id={`pf-${k}`} name={k} defaultValue={String(p[k] ?? "")} className="textarea text-sm" maxLength={opts.max} aria-invalid={!!e[k]} />
      ) : (
        <input id={`pf-${k}`} name={k} type={opts.type ?? "text"} defaultValue={String(p[k] ?? "")} className={inputCls} maxLength={opts.max} aria-invalid={!!e[k]} />
      )}
      {opts.hint && !e[k] && <p className="field-hint">{opts.hint}</p>}
      {err(k)}
    </div>
  );
  return (
    <form action={action} className="grid gap-5">
      {p.id && <input type="hidden" name="id" value={p.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="field">
          <label htmlFor="pf-name">Name</label>
          <input id="pf-name" name="name" value={name} className={inputCls} maxLength={120} aria-invalid={!!e.name}
            onChange={(ev) => { setName(ev.target.value); if (!slugTouched) setSlug(ev.target.value.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").slice(0, 80)); }} />
          {err("name")}
        </div>
        <div className="field">
          <label htmlFor="pf-slug">URL slug</label>
          <input id="pf-slug" name="slug" value={slug} className={inputCls} onChange={(ev) => { setSlug(ev.target.value); setSlugTouched(true); }} aria-invalid={!!e.slug} />
          {e.slug ? err("slug") : <p className="field-hint">/products/{slug || "…"}</p>}
        </div>
        {f("subtitle", "Subtitle (spec line)", { max: 120, hint: "Short fact line, e.g. 220 GSM long-staple cotton" })}
        <div className="field">
          <label htmlFor="pf-cat">Category</label>
          <select id="pf-cat" name="categoryId" defaultValue={p.categoryId} className="select !min-h-10 text-sm"><option value="">None</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        </div>
        <div className="field">
          <label htmlFor="pf-gender">For</label>
          <select id="pf-gender" name="gender" defaultValue={p.gender} className="select !min-h-10 text-sm"><option value="men">Men</option><option value="women">Women</option><option value="unisex">Unisex</option><option value="kids">Kids</option></select>
        </div>
        {f("fit", "Fit", { max: 40, hint: "e.g. Regular, Relaxed, Athletic" })}
      </div>
      {f("description", "Description", { area: true, max: 5000 })}
      <div className="grid gap-4 md:grid-cols-2">
        {f("material", "Fabric and material", { area: true, max: 300 })}
        {f("care", "Care instructions", { area: true, max: 600 })}
      </div>
      {f("fitNotes", "Fit notes", { max: 300, hint: "How it runs and whether to size up or down" })}
      <fieldset>
        <legend className="text-sm font-medium">Collections</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {collections.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm"><input type="checkbox" name="collections" value={c.id} defaultChecked={p.collections.includes(c.id)} className="checkbox !mt-0" />{c.title}</label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isFeatured" defaultChecked={p.isFeatured} className="checkbox !mt-0" /> Featured on home page</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPerformance" defaultChecked={p.isPerformance} className="checkbox !mt-0" /> Performance piece</label>
        {f("publishAt", "Scheduled publish (optional)", { type: "datetime-local" })}
      </div>
      <details className="border-t border-line pt-4">
        <summary className="cursor-pointer text-sm font-medium">Search engine listing</summary>
        <div className="mt-3 grid gap-4">
          {f("seoTitle", "SEO title", { max: 70, hint: "Up to 70 characters" })}
          {f("seoDescription", "SEO description", { area: true, max: 160, hint: "Up to 160 characters" })}
        </div>
      </details>
      <div className="flex items-center gap-4">
        <SubmitButton className="btn btn-primary btn-sm">{p.id ? "Save product" : "Create product"}</SubmitButton>
        {s?.message && <p className={`text-sm ${s.ok ? "text-success" : "text-danger"}`} role="status">{s.message}</p>}
      </div>
    </form>
  );
}

export type VariantRow = {
  id?: string; sku: string; size: string; colour: string; colourHex: string; price: string; compareAt: string; cost?: string;
  stock?: number; reserved?: number; lowStockThreshold: string; isAvailable: boolean; remove?: boolean;
};

export function VariantEditor({ productId, initial, showCost }: { productId: string; initial: VariantRow[]; showCost: boolean }) {
  const [rows, setRows] = useState<VariantRow[]>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();
  const set = (i: number, patch: Partial<VariantRow>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const add = () => {
    const last = rows[rows.length - 1];
    setRows([...rows, { sku: "", size: "", colour: last?.colour ?? "", colourHex: last?.colourHex ?? "", price: last?.price ?? "", compareAt: "", cost: last?.cost ?? "", lowStockThreshold: "3", isAvailable: true }]);
  };
  const cell = "border-b border-line px-1.5 py-1.5";
  const inp = "w-full border border-line-strong bg-white px-2 py-1.5 text-sm";
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="text-xs text-ink-soft">
            <tr>{["SKU", "Size", "Colour", "Hex", "Price ₹", "Compare-at ₹", ...(showCost ? ["Cost ₹"] : []), "Stock", "Low at", "On sale", ""].map((h) => <th key={h} className="px-1.5 pb-2 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id ?? `n${i}`} className={r.remove ? "opacity-40" : ""}>
                <td className={cell}><input aria-label="SKU" className={`${inp} font-mono uppercase`} value={r.sku} onChange={(e) => set(i, { sku: e.target.value })} /></td>
                <td className={cell}><input aria-label="Size" className={`${inp} w-16`} value={r.size} onChange={(e) => set(i, { size: e.target.value })} /></td>
                <td className={cell}><input aria-label="Colour" className={inp} value={r.colour} onChange={(e) => set(i, { colour: e.target.value })} /></td>
                <td className={cell}><input aria-label="Colour hex" type="color" className="h-8 w-10 border border-line-strong" value={r.colourHex || "#cccccc"} onChange={(e) => set(i, { colourHex: e.target.value })} /></td>
                <td className={cell}><input aria-label="Price" inputMode="decimal" className={`${inp} w-24`} value={r.price} onChange={(e) => set(i, { price: e.target.value })} /></td>
                <td className={cell}><input aria-label="Compare-at price" inputMode="decimal" className={`${inp} w-24`} value={r.compareAt} onChange={(e) => set(i, { compareAt: e.target.value })} /></td>
                {showCost && <td className={cell}><input aria-label="Cost price" inputMode="decimal" className={`${inp} w-24`} value={r.cost ?? ""} onChange={(e) => set(i, { cost: e.target.value })} /></td>}
                <td className={`${cell} whitespace-nowrap tabular-nums`}>{r.id ? <>{r.stock}{r.reserved ? <span className="text-xs text-ink-soft"> ({r.reserved} held)</span> : null}</> : <span className="text-xs text-ink-soft">0 (use Inventory)</span>}</td>
                <td className={cell}><input aria-label="Low stock threshold" inputMode="numeric" className={`${inp} w-14`} value={r.lowStockThreshold} onChange={(e) => set(i, { lowStockThreshold: e.target.value })} /></td>
                <td className={cell}><input aria-label="Available for sale" type="checkbox" className="checkbox !mt-0" checked={r.isAvailable} onChange={(e) => set(i, { isAvailable: e.target.checked })} /></td>
                <td className={cell}>
                  <button type="button" className="text-xs text-danger underline-offset-2 hover:underline" onClick={() => (r.id ? set(i, { remove: !r.remove }) : setRows(rows.filter((_, j) => j !== i)))}>
                    {r.remove ? "Undo" : "Remove"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-secondary btn-sm" onClick={add}>Add variant</button>
        <button type="button" className="btn btn-primary btn-sm" disabled={pending} data-loading={pending}
          onClick={() => start(async () => {
            const payload = rows.map((r) => ({ id: r.id, sku: r.sku, size: r.size, colour: r.colour, colourHex: r.colourHex, price: r.price, compareAt: r.compareAt,
              lowStockThreshold: r.lowStockThreshold, isAvailable: r.isAvailable, remove: r.remove, cost: showCost ? r.cost ?? "" : undefined }));
            setMsg(await saveVariants(productId, payload));
          })}>
          <span className="btn-label">Save variants</span>
        </button>
        {msg && <p className={`text-sm ${msg.ok ? "text-success" : "text-danger"}`} role="status">{msg.message}</p>}
      </div>
      <p className="mt-2 text-xs text-ink-soft">Stock changes go through Inventory so each movement has a reason. Removing a variant hides it but keeps order history.</p>
    </div>
  );
}

type Img = { id: string; url: string; alt: string; colour: string | null };

export function ImageManager({ productId, images, colours }: { productId: string; images: Img[]; colours: string[] }) {
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();
  const [preview, setPreview] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <div className="grid gap-5">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <li key={img.id} className="border border-line bg-white p-2">
            <div className="relative aspect-[4/5] bg-[#e7e2d8]"><Image src={img.url} alt={img.alt} fill sizes="200px" className="object-cover" /></div>
            <ImageMeta img={img} colours={colours} />
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="flex gap-1">
                <button type="button" className="btn btn-secondary btn-sm !min-h-7 !px-2" disabled={pending || i === 0} aria-label="Move earlier" onClick={() => start(async () => setMsg(await updateImage(img.id, { move: -1 })))}>←</button>
                <button type="button" className="btn btn-secondary btn-sm !min-h-7 !px-2" disabled={pending || i === images.length - 1} aria-label="Move later" onClick={() => start(async () => setMsg(await updateImage(img.id, { move: 1 })))}>→</button>
              </span>
              <button type="button" className="text-danger hover:underline" disabled={pending} onClick={() => { if (confirm("Remove this image?")) start(async () => setMsg(await deleteImage(img.id))); }}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      <form ref={formRef} className="grid gap-3 border border-dashed border-line-strong bg-white p-4 md:grid-cols-[1fr_1fr_160px_auto] md:items-end"
        onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); start(async () => { const r = await uploadImages(productId, fd); setMsg(r); if (r.ok) { formRef.current?.reset(); setPreview([]); } }); }}>
        <div className="field"><label htmlFor="im-files" className="!text-xs">Images (JPEG, PNG, WebP, AVIF; 8 MB max each)</label>
          <input id="im-files" name="images" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="text-sm"
            onChange={(e) => setPreview(Array.from(e.target.files ?? []).slice(0, 10).map((f) => URL.createObjectURL(f)))} /></div>
        <div className="field"><label htmlFor="im-alt" className="!text-xs">Alt text</label><input id="im-alt" name="alt" className={inputCls} placeholder="e.g. Hoodie in Stone, front view" maxLength={200} /></div>
        <div className="field"><label htmlFor="im-col" className="!text-xs">Colour</label>
          <select id="im-col" name="colour" className="select !min-h-10 text-sm"><option value="">All colours</option>{colours.map((c) => <option key={c}>{c}</option>)}</select></div>
        <button className="btn btn-primary btn-sm !min-h-10" disabled={pending} data-loading={pending}><span className="btn-label">Upload</span></button>
        {preview.length > 0 && (
          <div className="flex gap-2 md:col-span-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {preview.map((u) => <img key={u} src={u} alt="Selected upload preview" className="h-20 w-16 border border-line object-cover" />)}
          </div>
        )}
      </form>
      {msg && <p className={`text-sm ${msg.ok ? "text-success" : "text-danger"}`} role="status">{msg.message}</p>}
    </div>
  );
}

function ImageMeta({ img, colours }: { img: Img; colours: string[] }) {
  const [alt, setAlt] = useState(img.alt);
  const [colour, setColour] = useState(img.colour ?? "");
  const [pending, start] = useTransition();
  const dirty = alt !== img.alt || colour !== (img.colour ?? "");
  return (
    <div className="mt-2 grid gap-1">
      <label className="sr-only" htmlFor={`alt-${img.id}`}>Alt text</label>
      <input id={`alt-${img.id}`} value={alt} onChange={(e) => setAlt(e.target.value)} className="border border-line-strong px-2 py-1 text-xs" maxLength={200} />
      <select aria-label="Colour" value={colour} onChange={(e) => setColour(e.target.value)} className="border border-line-strong px-1 py-1 text-xs">
        <option value="">All colours</option>{colours.map((c) => <option key={c}>{c}</option>)}
      </select>
      {dirty && <button type="button" className="btn btn-secondary btn-sm !min-h-7 text-xs" disabled={pending} onClick={() => start(async () => { await updateImage(img.id, { alt, colour: colour || null }); })}>Save</button>}
    </div>
  );
}

export function StatusBar({ productId, status, slug }: { productId: string; status: string; slug: string }) {
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [typed, setTyped] = useState("");
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        {status !== "published" && <button type="button" className="btn btn-primary btn-sm" disabled={pending} onClick={() => start(async () => setMsg(await setProductStatus(productId, "published")))}>Publish</button>}
        {status === "published" && <button type="button" className="btn btn-secondary btn-sm" disabled={pending} onClick={() => start(async () => setMsg(await setProductStatus(productId, "draft")))}>Unpublish</button>}
        {status !== "archived" && <button type="button" className="btn btn-secondary btn-sm" disabled={pending} onClick={() => start(async () => setMsg(await setProductStatus(productId, "archived")))}>Archive</button>}
        <button type="button" className="btn btn-secondary btn-sm" disabled={pending} onClick={() => start(async () => { await duplicateProduct(productId); })}>Duplicate</button>
        <a className="btn btn-secondary btn-sm" href={`/products/${slug}`} target="_blank" rel="noopener">View in store</a>
        <button type="button" className="btn btn-danger btn-sm" onClick={() => setConfirmDelete((c) => !c)}>Delete</button>
      </div>
      {confirmDelete && (
        <div className="flex flex-wrap items-center gap-2 border border-danger p-3 text-sm">
          <label htmlFor="del-slug">Type <code>{slug}</code> to delete. Order history is kept.</label>
          <input id="del-slug" className="input !min-h-9 !w-60 text-sm" value={typed} onChange={(e) => setTyped(e.target.value)} />
          <button type="button" className="btn btn-danger btn-sm" disabled={pending || typed !== slug} onClick={() => start(async () => { const r = await deleteProduct(productId, typed); if (r) setMsg(r); })}>Delete product</button>
        </div>
      )}
      {msg && <p className={`text-sm ${msg.ok ? "text-success" : "text-danger"}`} role="status">{msg.message}</p>}
    </div>
  );
}
