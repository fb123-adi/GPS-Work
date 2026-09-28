import { sql } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/guards";
import { PageHeader, Table } from "@/components/admin/ui";

export const metadata = { title: "Audit log" };

export default async function Audit({ searchParams }: { searchParams: Promise<{ entity?: string }> }) {
  await requireStaffPage("audit.view");
  const entity = ((await searchParams).entity ?? "").replace(/[^a-z_]/g, "").slice(0, 30);
  const rows = await sql<{ id: number; action: string; entity_type: string; entity_id: string | null; email: string | null; ip: string | null; created_at: Date; after: unknown }[]>`
    select l.id, l.action, l.entity_type, l.entity_id, u.email, host(l.ip) ip, l.created_at, l.after
    from admin_audit_logs l left join users u on u.id = l.actor_id where ${entity ? sql`l.entity_type = ${entity}` : sql`true`}
    order by l.created_at desc limit 300`;
  return (
    <div>
      <PageHeader title="Audit log" sub="Secrets are redacted before they are stored." />
      <form className="mb-4 flex gap-2" action="/admin/audit"><label htmlFor="ae" className="sr-only">Entity</label>
        <input id="ae" name="entity" defaultValue={entity} placeholder="order, product, coupon…" className="input !min-h-10 max-w-xs text-sm" /><button className="btn btn-secondary btn-sm !min-h-10">Filter</button></form>
      <Table head={["When", "Who", "Action", "Entity", "Details"]}>
        {rows.map((r) => (
          <tr key={r.id} className="align-top">
            <td className="whitespace-nowrap px-3 py-2 text-xs">{r.created_at.toLocaleString("en-IN")}</td>
            <td className="px-3 py-2 text-xs">{r.email ?? "system"}<span className="block text-ink-soft">{r.ip}</span></td>
            <td className="px-3 py-2">{r.action}</td>
            <td className="px-3 py-2 text-xs">{r.entity_type} {r.entity_id?.slice(0, 8)}</td>
            <td className="max-w-md px-3 py-2"><code className="block max-h-24 overflow-auto whitespace-pre-wrap break-all text-[11px] text-ink-soft">{r.after ? JSON.stringify(r.after).slice(0, 600) : ""}</code></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
