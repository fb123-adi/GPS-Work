import Image from "next/image";
import Link from "next/link";
import { sql } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/guards";
import { can } from "@/lib/auth/roles";
import { formatMoney } from "@/lib/money";
import { PageHeader, Pill, Table, statusTone } from "@/components/admin/ui";

export const metadata = { title: "Products" };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; deleted?: string }> }) {
  const user = await requireStaffPage("products.view");
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const status = ["draft", "published", "archived"].includes(sp.status ?? "") ? sp.status! : null;
  const like = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
  const rows = await sql<{ id: string; name: string; slug: string; status: string; min_price_minor: string | null; image: string | null; variants: number; stock: number; is_featured: boolean; publish_at: Date | null; category: string | null }[]>`
    select p.id, p.name, p.slug, p.status, p.min_price_minor, p.is_featured, p.publish_at, c.name as category,
      (select url from product_images i where i.product_id = p.id order by sort_order limit 1) image,
      (select count(*)::int from product_variants v where v.product_id = p.id and v.deleted_at is null) variants,
      (select coalesce(sum(stock_on_hand - reserved), 0)::int from product_variants v where v.product_id = p.id and v.deleted_at is null) stock
    from products p left join categories c on c.id = p.category_id
    where p.deleted_at is null and ${status ? sql`p.status = ${status}` : sql`true`}
      and ${q ? sql`(p.name ilike ${like} or p.slug ilike ${like} or exists (select 1 from product_variants v where v.product_id = p.id and v.sku ilike ${like}))` : sql`true`}
    order by p.updated_at desc limit 200`;
  const edit = can(user.roles, "products.edit");
  return (
    <div>
      <PageHeader title="Products" sub={`${rows.length} shown`} actions={<>
        {can(user.roles, "exports.catalog") && <a className="btn btn-secondary btn-sm" href="/api/admin/export/products">Export CSV</a>}
        {edit && <Link href="/admin/products/new" className="btn btn-primary btn-sm">New product</Link>}
      </>} />
      {sp.deleted && <p className="notice notice-success mb-4">Product deleted. Past orders keep their details.</p>}
      <form className="mb-4 flex flex-wrap gap-2" action="/admin/products">
        <label htmlFor="pq" className="sr-only">Search</label>
        <input id="pq" name="q" defaultValue={q} placeholder="Name, URL slug, or SKU" className="input !min-h-10 max-w-sm text-sm" />
        <label htmlFor="ps" className="sr-only">Status</label>
        <select id="ps" name="status" defaultValue={status ?? ""} className="select !min-h-10 !w-auto text-sm">
          <option value="">All</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option>
        </select>
        <button className="btn btn-secondary btn-sm !min-h-10">Filter</button>
      </form>
      <Table head={["", "Product", "Category", "Status", "Variants", "Available", "From"]} empty={rows.length ? undefined : "No products match."}>
        {rows.map((p) => (
          <tr key={p.id} className="hover:bg-[#faf8f4]">
            <td className="w-14 px-3 py-2"><span className="relative block h-12 w-10 bg-[#e7e2d8]">{p.image && <Image src={p.image} alt="" fill sizes="40px" className="object-cover" />}</span></td>
            <td className="px-3"><Link className="link font-medium" href={`/admin/products/${p.id}`}>{p.name}</Link><span className="block text-xs text-ink-soft">/{p.slug}{p.is_featured ? " · featured" : ""}</span></td>
            <td className="px-3">{p.category ?? "—"}</td>
            <td className="px-3"><Pill tone={statusTone(p.status)}>{p.status}</Pill>{p.publish_at && p.publish_at > new Date() && <span className="block text-xs text-ink-soft">from {p.publish_at.toLocaleDateString("en-IN")}</span>}</td>
            <td className="px-3">{p.variants}</td>
            <td className="px-3">{p.stock <= 0 ? <Pill tone="bad">0</Pill> : p.stock}</td>
            <td className="px-3 tabular-nums">{p.min_price_minor ? formatMoney(Number(p.min_price_minor)) : "—"}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
