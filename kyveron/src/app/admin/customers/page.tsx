import Link from "next/link";
import { sql } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/guards";
import { can } from "@/lib/auth/roles";
import { formatMoney } from "@/lib/money";
import { PageHeader, Table } from "@/components/admin/ui";

export const metadata = { title: "Customers" };

export default async function Customers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireStaffPage("customers.view");
  const q = ((await searchParams).q ?? "").trim().slice(0, 80);
  const like = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
  const rows = await sql<{ id: string; email: string; full_name: string | null; created_at: Date; orders: number; spent: string; deletion: Date | null }[]>`
    select u.id, u.email, p.full_name, u.created_at, p.deletion_requested_at deletion,
      (select count(*)::int from orders o where o.user_id = u.id and o.paid_at is not null) orders,
      (select coalesce(sum(total_minor), 0) from orders o where o.user_id = u.id and o.paid_at is not null) spent
    from users u left join profiles p on p.user_id = u.id
    where u.deleted_at is null and ${q ? sql`(u.email ilike ${like} or p.full_name ilike ${like} or u.phone like ${"%" + q.replace(/\D/g, "").slice(-10) + "%"})` : sql`true`}
    order by u.created_at desc limit 100`;
  return (
    <div>
      <PageHeader title="Customers" sub="Showing the minimum needed to help customers." actions={can(user.roles, "exports.customers") && <a className="btn btn-secondary btn-sm" href="/api/admin/export/customers">Export CSV (audited)</a>} />
      <form className="mb-4 flex gap-2" action="/admin/customers">
        <label htmlFor="cq" className="sr-only">Search</label>
        <input id="cq" name="q" defaultValue={q} placeholder="Email, name, or mobile" className="input !min-h-10 max-w-sm text-sm" />
        <button className="btn btn-secondary btn-sm !min-h-10">Search</button>
      </form>
      <Table head={["Customer", "Joined", "Paid orders", "Total spent", ""]} empty={rows.length ? undefined : "No customers match."}>
        {rows.map((c) => (
          <tr key={c.id}>
            <td className="px-3 py-2.5"><Link className="link" href={`/admin/customers/${c.id}`}>{c.full_name ?? "—"}</Link><span className="block text-xs text-ink-soft">{c.email}</span></td>
            <td className="px-3">{c.created_at.toLocaleDateString("en-IN")}</td><td className="px-3">{c.orders}</td>
            <td className="px-3 tabular-nums">{formatMoney(Number(c.spent))}</td>
            <td className="px-3 text-xs text-danger">{c.deletion ? "Deletion requested" : ""}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
