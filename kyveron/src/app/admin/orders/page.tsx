import Link from "next/link";
import { sql } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/guards";
import { can } from "@/lib/auth/roles";
import { formatMoney } from "@/lib/money";
import { ORDER_STATUSES, STATUS_LABEL } from "@/lib/orders/state";
import { PageHeader, Pager, Pill, Table, statusTone } from "@/components/admin/ui";

export const metadata = { title: "Orders" };

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string; review?: string }> }) {
  const user = await requireStaffPage("orders.view");
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const status = (ORDER_STATUSES as readonly string[]).includes(sp.status ?? "") ? sp.status! : null;
  const page = Math.max(1, Number(sp.page) || 1);
  const per = 30;
  const like = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
  const digits = q.replace(/\D/g, "");
  const where = sql`
    ${status ? sql`o.status = ${status}` : sql`true`}
    and ${sp.review ? sql`o.needs_review` : sql`true`}
    and ${q ? sql`(o.order_number ilike ${like} or o.email ilike ${like}
         or (${digits.length >= 6} and o.phone like ${"%" + digits.slice(-10) + "%"})
         or exists (select 1 from order_items i where i.order_id = o.id and i.sku ilike ${like})
         or o.shipping_address->>'fullName' ilike ${like})` : sql`true`}`;
  const [[{ n }], rows] = await Promise.all([
    sql<{ n: number }[]>`select count(*)::int n from orders o where ${where}`,
    sql<{ id: string; order_number: string; email: string; status: string; total_minor: string; created_at: Date; items: number; needs_review: boolean; name: string }[]>`
      select o.id, o.order_number, o.email, o.status, o.total_minor, o.created_at, o.needs_review, o.shipping_address->>'fullName' as name,
        (select coalesce(sum(quantity), 0)::int from order_items i where i.order_id = o.id) items
      from orders o where ${where} order by o.created_at desc limit ${per} offset ${(page - 1) * per}`,
  ]);
  const qs = (p: number) => `/admin/orders?${new URLSearchParams({ ...(q && { q }), ...(status && { status }), ...(sp.review && { review: "1" }), page: String(p) })}`;
  return (
    <div>
      <PageHeader title="Orders" sub={`${n} matching`} actions={can(user.roles, "exports.orders") && <a className="btn btn-secondary btn-sm" href={`/api/admin/export/orders${status ? `?status=${status}` : ""}`}>Export CSV</a>} />
      <form className="mb-4 flex flex-wrap gap-2" action="/admin/orders">
        <label htmlFor="oq" className="sr-only">Search</label>
        <input id="oq" name="q" defaultValue={q} placeholder="Order number, email, mobile, SKU, name" className="input !min-h-10 max-w-sm text-sm" />
        <label htmlFor="os" className="sr-only">Status</label>
        <select id="os" name="status" defaultValue={status ?? ""} className="select !min-h-10 !w-auto text-sm">
          <option value="">All statuses</option>{ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="review" value="1" defaultChecked={!!sp.review} className="checkbox !mt-0" /> Needs review</label>
        <button className="btn btn-secondary btn-sm !min-h-10">Search</button>
      </form>
      <Table head={["Order", "Placed", "Customer", "Items", "Status", "Total"]} empty={rows.length === 0 ? "No orders match." : undefined}>
        {rows.map((o) => (
          <tr key={o.id} className="hover:bg-[#faf8f4]">
            <td className="px-3 py-2.5"><Link className="link font-medium" href={`/admin/orders/${o.id}`}>{o.order_number}</Link>{o.needs_review && <span className="ml-2"><Pill tone="bad">Review</Pill></span>}</td>
            <td className="px-3 whitespace-nowrap text-ink-soft">{o.created_at.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
            <td className="px-3"><span className="block">{o.name}</span><span className="text-xs text-ink-soft">{o.email}</span></td>
            <td className="px-3">{o.items}</td>
            <td className="px-3"><Pill tone={statusTone(o.status)}>{STATUS_LABEL[o.status as keyof typeof STATUS_LABEL]}</Pill></td>
            <td className="px-3 tabular-nums">{formatMoney(Number(o.total_minor))}</td>
          </tr>
        ))}
      </Table>
      <Pager page={page} pages={Math.ceil(n / per)} href={qs} />
    </div>
  );
}
