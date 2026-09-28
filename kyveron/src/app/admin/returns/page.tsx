import Link from "next/link";
import { sql } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/guards";
import { PageHeader, Pill, Table, statusTone } from "@/components/admin/ui";
import { ReturnControls } from "@/components/admin/Buttons";

export const metadata = { title: "Returns" };
const NEXT: Record<string, string[]> = { requested: ["approved", "rejected"], approved: ["received", "rejected"], received: ["refunded", "exchanged", "closed"], refunded: ["closed"], exchanged: ["closed"], rejected: ["closed"], closed: [] };

export default async function AdminReturns({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireStaffPage("returns.manage");
  const { status } = await searchParams;
  const s = status && NEXT[status] ? status : null;
  const rows = await sql<{ id: string; order_id: string; order_number: string; kind: string; status: string; reason: string; details: string | null; resolution: string; evidence_paths: string[]; created_at: Date; items: string }[]>`
    select r.id, r.order_id, o.order_number, r.kind, r.status, r.reason, r.details, r.resolution, r.evidence_paths, r.created_at,
      (select string_agg(oi.product_name || ' ' || oi.size || ' ×' || ri.quantity, ', ') from return_items ri join order_items oi on oi.id = ri.order_item_id where ri.return_id = r.id) items
    from returns r join orders o on o.id = r.order_id where ${s ? sql`r.status = ${s}` : sql`true`} order by r.created_at desc limit 200`;
  return (
    <div>
      <PageHeader title="Returns and exchanges" sub={`${rows.length} shown`} />
      <form className="mb-4 flex gap-2" action="/admin/returns">
        <label htmlFor="rs" className="sr-only">Status</label>
        <select id="rs" name="status" defaultValue={s ?? ""} className="select !min-h-10 !w-auto text-sm"><option value="">All</option>{Object.keys(NEXT).map((k) => <option key={k}>{k}</option>)}</select>
        <button className="btn btn-secondary btn-sm !min-h-10">Filter</button>
      </form>
      <Table head={["Order", "Type", "Items", "Reason", "Resolution", "Evidence", "Status", "Actions"]} empty={rows.length ? undefined : "No return requests."}>
        {rows.map((r) => (
          <tr key={r.id} className="align-top">
            <td className="px-3 py-2"><Link className="link" href={`/admin/orders/${r.order_id}`}>{r.order_number}</Link><span className="block text-xs text-ink-soft">{r.created_at.toLocaleDateString("en-IN")}</span></td>
            <td className="px-3 py-2">{r.kind}</td><td className="px-3 py-2 text-xs">{r.items}</td>
            <td className="px-3 py-2">{r.reason}{r.details && <span className="block text-xs text-ink-soft">{r.details}</span>}</td>
            <td className="px-3 py-2 text-xs">{r.resolution.replace("_", " ")}</td>
            <td className="px-3 py-2 text-xs">{r.evidence_paths.map((p, i) => <a key={p} className="link mr-2" href={`/api/media/${p}`} target="_blank" rel="noopener">photo {i + 1}</a>)}</td>
            <td className="px-3 py-2"><Pill tone={statusTone(r.status)}>{r.status}</Pill></td>
            <td className="px-3 py-2"><ReturnControls id={r.id} next={NEXT[r.status] ?? []} /></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
