import Link from "next/link";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/guards";
import { can } from "@/lib/auth/roles";
import { PageHeader, Panel, Pill, statusTone } from "@/components/admin/ui";
import { ImageManager, ProductForm, StatusBar, VariantEditor } from "@/components/admin/ProductEditor";

const toR = (m: string | null) => (m === null ? "" : (Number(m) / 100).toFixed(2).replace(/\.00$/, ""));

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; duplicated?: string }> }) {
  const user = await requireStaffPage("products.view");
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [p] = await sql<Record<string, unknown>[]>`select * from products where id = ${id} and deleted_at is null`;
  if (!p) notFound();
  const showCost = can(user.roles, "products.cost.view");
  const editable = can(user.roles, "products.edit");
  const [categories, collections, inCols, variants, images] = await Promise.all([
    sql<{ id: string; name: string }[]>`select id, name from categories order by sort_order`,
    sql<{ id: string; title: string }[]>`select id, title from collections where deleted_at is null order by sort_order`,
    sql<{ collection_id: string }[]>`select collection_id from collection_products where product_id = ${id}`,
    // Cost is only selected for roles allowed to see it.
    sql<{ id: string; sku: string; size: string; colour: string; colour_hex: string | null; price_minor: string; compare_at_minor: string | null; cost_minor: string | null; stock_on_hand: number; reserved: number; low_stock_threshold: number; is_available: boolean }[]>`
      select id, sku, size, colour, colour_hex, price_minor, compare_at_minor, ${showCost ? sql`cost_minor` : sql`null::bigint as cost_minor`},
        stock_on_hand, reserved, low_stock_threshold, is_available
      from product_variants where product_id = ${id} and deleted_at is null order by colour, sort_order`,
    sql<{ id: string; url: string; alt: string; colour: string | null }[]>`select id, url, alt, colour from product_images where product_id = ${id} order by sort_order`,
  ]);
  const colours = [...new Set(variants.map((v) => v.colour))];
  const pa = p.publish_at as Date | null;
  return (
    <div className="grid max-w-6xl gap-6">
      <PageHeader title={String(p.name)} sub={<span className="flex items-center gap-2"><Pill tone={statusTone(String(p.status))}>{String(p.status)}</Pill> /products/{String(p.slug)}</span>}
        actions={<Link href="/admin/products" className="btn btn-secondary btn-sm">All products</Link>} />
      {sp.created && <p className="notice notice-success">Product created as a draft. Add variants and images, then publish.</p>}
      {sp.duplicated && <p className="notice notice-success">Duplicated as a draft. Stock for the copy starts at zero.</p>}
      {editable && <Panel title="Status"><StatusBar productId={id} status={String(p.status)} slug={String(p.slug)} /></Panel>}
      <Panel title="Details">
        {editable ? (
          <ProductForm categories={categories} collections={collections} p={{
            id, name: String(p.name), slug: String(p.slug), subtitle: String(p.subtitle ?? ""), description: String(p.description ?? ""),
            categoryId: String(p.category_id ?? ""), gender: String(p.gender), material: String(p.material ?? ""), care: String(p.care ?? ""),
            fit: String(p.fit ?? ""), fitNotes: String(p.fit_notes ?? ""), seoTitle: String(p.seo_title ?? ""), seoDescription: String(p.seo_description ?? ""),
            publishAt: pa ? new Date(pa.getTime() - pa.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "",
            isFeatured: Boolean(p.is_featured), isPerformance: Boolean(p.is_performance), collections: inCols.map((c) => c.collection_id),
          }} />
        ) : <p className="text-sm text-ink-soft">Read-only for your role.</p>}
      </Panel>
      <Panel title={`Variants (${variants.length})`}>
        {editable ? (
          <VariantEditor productId={id} showCost={showCost} initial={variants.map((v) => ({
            id: v.id, sku: v.sku, size: v.size, colour: v.colour, colourHex: v.colour_hex ?? "", price: toR(v.price_minor), compareAt: toR(v.compare_at_minor),
            cost: showCost ? toR(v.cost_minor) : undefined, stock: v.stock_on_hand, reserved: v.reserved, lowStockThreshold: String(v.low_stock_threshold), isAvailable: v.is_available,
          }))} />
        ) : (
          <ul className="text-sm">{variants.map((v) => <li key={v.id}>{v.sku} · {v.colour} {v.size} · stock {v.stock_on_hand}</li>)}</ul>
        )}
      </Panel>
      <Panel title={`Images (${images.length})`}>
        {editable ? <ImageManager productId={id} images={images} colours={colours} /> : <p className="text-sm">{images.length} images</p>}
      </Panel>
    </div>
  );
}
