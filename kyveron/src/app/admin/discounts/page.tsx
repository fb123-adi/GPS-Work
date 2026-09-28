import Link from "next/link";
import { sql } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/guards";
import { formatMoney } from "@/lib/money";
import { nowMs } from "@/lib/time";
import { PageHeader, Pill, Table } from "@/components/admin/ui";
import { ArchiveCoupon } from "@/components/admin/Buttons";

export const metadata = { title: "Discounts" };

export default async function Discounts({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireStaffPage("discounts.manage");
  const sp = await searchParams;
  const rows = await sql<{ id: string; code: string; description: string | null; kind: string; value: number; is_active: boolean; ends_at: Date | null; starts_at: Date | null; usage_limit: number | null; used: number; min_subtotal_minor: string }[]>`
    select c.*, (select count(*)::int from coupon_redemptions r where r.coupon_id = c.id and r.state = 'confirmed') used
    from coupons c where deleted_at is null order by created_at desc`;
  const now = nowMs();
  return (
    <div>
      <PageHeader title="Discounts" actions={<Link href="/admin/discounts/new" className="btn btn-primary btn-sm">New discount</Link>} />
      {sp.saved && <p className="notice notice-success mb-4">Saved.</p>}
      <Table head={["Code", "Discount", "Minimum", "Used", "Window", "Status", ""]} empty={rows.length ? undefined : "No discounts yet."}>
        {rows.map((c) => {
          const live = c.is_active && (!c.starts_at || c.starts_at.getTime() <= now) && (!c.ends_at || c.ends_at.getTime() > now);
          return (
            <tr key={c.id}>
              <td className="px-3 py-2.5"><Link className="link font-mono" href={`/admin/discounts/${c.id}`}>{c.code}</Link>{c.description && <span className="block text-xs text-ink-soft">{c.description}</span>}</td>
              <td className="px-3">{c.kind === "percent" ? `${c.value}%` : formatMoney(c.value)}</td>
              <td className="px-3">{Number(c.min_subtotal_minor) ? formatMoney(Number(c.min_subtotal_minor)) : "—"}</td>
              <td className="px-3">{c.used}{c.usage_limit ? ` / ${c.usage_limit}` : ""}</td>
              <td className="px-3 text-xs">{c.starts_at?.toLocaleDateString("en-IN") ?? "now"} → {c.ends_at?.toLocaleDateString("en-IN") ?? "no end"}</td>
              <td className="px-3"><Pill tone={live ? "good" : "muted"}>{live ? "live" : c.is_active ? "scheduled/expired" : "inactive"}</Pill></td>
              <td className="px-3"><ArchiveCoupon id={c.id} /></td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}
