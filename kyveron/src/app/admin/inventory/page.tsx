import Link from "next/link";
import { sql } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/guards";
import { can } from "@/lib/auth/roles";
import { PageHeader, Panel, Pill, Table } from "@/components/admin/ui";
import { StockAdjust } from "@/components/admin/StockAdjust";

export const metadata = { title: "Inventory" };

export default async function Inventory({ searchParams }: { searchParams: Promise<{ q?: string; filter?: string; history?: string }> }) {
  const user = await requireStaffPage("inventory.adjust");
  const sp = await searchParams;
  if (sp.history && !/^[0-9a-f-]{36}$/.test(sp.history)) sp.history = undefined;
  const q = (sp.q ?? "").trim().slice(0, 60);
  const like = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
  const filter = sp.filter === "low" ? sql`v.stock_on_hand - v.reserved <= v.low_stock_threshold and v.stock_on_hand - v.reserved > 0`
    : sp.filter === "out" ? sql`v.stock_on_hand - v.reserved <= 0` : sql`true`;
  const rows = await sql<{ id: string; sku: string; product: string; product_id: string; colour: string; size: string; stock_on_hand: number; reserved: number; low_stock_threshold: number; is_available: boolean }[]>`
    select v.id, v.sku, p.name as product, p.id as product_id, v.colour, v.size, v.stock_on_hand, v.reserved, v.low_stock_threshold, v.is_available
    from product_variants v join products p on p.id = v.product_id
    where v.deleted_at is null and p.deleted_at is null and ${filter} and ${q ? sql`(v.sku ilike ${like} or p.name ilike ${like})` : sql`true`}
    order by p.name, v.colour, v.size limit 500`;
  const history = await sql<{ sku: string; delta: number; reason: string; note: string | null; stock_after: number; created_at: Date; email: string | null; order_number: string | null }[]>`
    select v.sku, m.delta, m.reason, m.note, m.stock_after, m.created_at, u.email, o.order_number
    from inventory_movements m join product_variants v on v.id = m.variant_id left join users u on u.id = m.actor_id left join orders o on o.id = m.order_id
    ${sp.history ? sql`where v.id = ${sp.history}` : sql``}
    order by m.created_at desc limit 50`;
  return (
    <div className="grid gap-6">
      <PageHeader title="Inventory" sub="Available = on hand minus units held for open checkouts." actions={can(user.roles, "exports.catalog") && <a className="btn btn-secondary btn-sm" href="/api/admin/export/inventory">Export CSV</a>} />
      <form className="flex flex-wrap gap-2" action="/admin/inventory">
        <label htmlFor="iq" className="sr-only">Search</label>
        <input id="iq" name="q" defaultValue={q} placeholder="SKU or product" className="input !min-h-10 max-w-xs text-sm" />
        <label htmlFor="if" className="sr-only">Filter</label>
        <select id="if" name="filter" defaultValue={sp.filter ?? ""} className="select !min-h-10 !w-auto text-sm"><option value="">All stock</option><option value="low">Low stock</option><option value="out">Out of stock</option></select>
        <button className="btn btn-secondary btn-sm !min-h-10">Filter</button>
      </form>
      <Table head={["SKU", "Product", "Variant", "On hand", "Held", "Available", "Low at", "Adjust"]} empty={rows.length ? undefined : "Nothing matches."}>
        {rows.map((v) => {
          const avail = v.stock_on_hand - v.reserved;
          return (
            <tr key={v.id}>
              <td className="px-3 py-2 font-mono text-xs"><Link href={`/admin/inventory?history=${v.id}`} className="hover:underline">{v.sku}</Link></td>
              <td className="px-3"><Link href={`/admin/products/${v.product_id}`} className="hover:underline">{v.product}</Link></td>
              <td className="px-3 whitespace-nowrap">{v.colour} · {v.size}{!v.is_available && <span className="ml-1"><Pill>off sale</Pill></span>}</td>
              <td className="px-3 tabular-nums">{v.stock_on_hand}</td><td className="px-3 tabular-nums">{v.reserved || "—"}</td>
              <td className="px-3">{avail <= 0 ? <Pill tone="bad">0</Pill> : avail <= v.low_stock_threshold ? <Pill tone="warn">{avail}</Pill> : avail}</td>
              <td className="px-3 tabular-nums">{v.low_stock_threshold}</td>
              <td className="px-3"><StockAdjust variantId={v.id} sku={v.sku} /></td>
            </tr>
          );
        })}
      </Table>
      <Panel title={sp.history ? "History for this SKU" : "Recent stock movements"} actions={sp.history && <Link href="/admin/inventory" className="link text-xs">All movements</Link>}>
        <ul className="divide-y divide-line text-sm">
          {history.map((h, i) => (
            <li key={i} className="flex flex-wrap justify-between gap-2 py-2">
              <span><span className="font-mono text-xs">{h.sku}</span> <span className={h.delta > 0 ? "text-success" : "text-danger"}>{h.delta > 0 ? `+${h.delta}` : h.delta}</span> · {h.reason}{h.order_number ? ` · ${h.order_number}` : ""}{h.note ? ` · ${h.note}` : ""}</span>
              <span className="text-xs text-ink-soft">now {h.stock_after} · {h.email ?? "system"} · {h.created_at.toLocaleString("en-IN")}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
