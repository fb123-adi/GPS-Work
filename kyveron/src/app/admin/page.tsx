import Link from "next/link";
import { sql } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/guards";
import { formatMoney } from "@/lib/money";
import { nowMs } from "@/lib/time";
import { PageHeader, Panel, Pill, Stat, Table } from "@/components/admin/ui";
import { RevenueChart } from "@/components/admin/RevenueChart";

export const metadata = { title: "Dashboard" };

const RANGES = { "7": "Last 7 days", "30": "Last 30 days", "90": "Last 90 days" } as const;
const PAID = sql`o.status in ('paid','confirmed','processing','packed','shipped','out_for_delivery','delivered','cancellation_requested','return_requested','returned','refund_pending','refunded','payment_disputed')`;

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ range?: string; from?: string; to?: string; denied?: string }> }) {
  await requireStaffPage("dashboard.view");
  const sp = await searchParams;
  const custom = sp.from && sp.to && /^\d{4}-\d{2}-\d{2}$/.test(sp.from) && /^\d{4}-\d{2}-\d{2}$/.test(sp.to);
  const days = (Object.keys(RANGES) as string[]).includes(sp.range ?? "") ? Number(sp.range) : 30;
  const from = custom ? sp.from! : new Date(nowMs() - (days - 1) * 86400000).toISOString().slice(0, 10);
  const to = custom ? sp.to! : new Date().toISOString().slice(0, 10);

  const [[k], series, lowStock, [pending], [returnsSummary], failed, [refunds]] = await Promise.all([
    sql<{ revenue: string; orders: number; aov: string | null }[]>`
      select coalesce(sum(o.total_minor), 0) revenue, count(*)::int orders, avg(o.total_minor)::bigint aov
      from orders o where ${PAID} and o.paid_at::date between ${from}::date and ${to}::date`,
    sql<{ day: Date; revenue: string; orders: number }[]>`
      select d::date as day, coalesce(sum(o.total_minor), 0) revenue, count(o.id)::int orders
      from generate_series(${from}::date, ${to}::date, interval '1 day') d
      left join orders o on o.paid_at::date = d::date and ${PAID}
      group by d order by d`,
    sql<{ sku: string; name: string; available: number; threshold: number; product_id: string }[]>`
      select v.sku, p.name || ' · ' || v.colour || ' / ' || v.size as name, (v.stock_on_hand - v.reserved) available, v.low_stock_threshold threshold, p.id product_id
      from product_variants v join products p on p.id = v.product_id
      where v.deleted_at is null and p.deleted_at is null and p.status = 'published' and v.stock_on_hand - v.reserved <= v.low_stock_threshold
      order by available asc limit 8`,
    sql<{ n: number }[]>`select count(*)::int n from orders where status in ('paid','confirmed','processing','packed')`,
    sql<{ open: number; total: number }[]>`select count(*) filter (where status in ('requested','approved','received'))::int open, count(*)::int total
      from returns where created_at::date between ${from}::date and ${to}::date`,
    sql<{ id: string; order_number: string; email: string; total_minor: string; updated_at: Date }[]>`
      select id, order_number, email, total_minor, updated_at from orders where status = 'payment_failed' order by updated_at desc limit 5`,
    sql<{ n: number; amount: string }[]>`select count(*)::int n, coalesce(sum(amount_minor), 0) amount from refunds
      where status = 'processed' and processed_at::date between ${from}::date and ${to}::date`,
  ]);

  return (
    <div className="grid gap-6">
      <PageHeader title="Dashboard" sub={`${new Date(from).toLocaleDateString("en-IN")} to ${new Date(to).toLocaleDateString("en-IN")}`}
        actions={
          <form className="flex flex-wrap items-end gap-2 text-sm" action="/admin">
            {Object.entries(RANGES).map(([v, l]) => (
              <Link key={v} href={`/admin?range=${v}`} className="chip !min-h-9 text-xs" data-selected={!custom && days === Number(v)}>{l}</Link>
            ))}
            <label className="sr-only" htmlFor="from">From</label><input id="from" name="from" type="date" defaultValue={from} className="input !min-h-9 !w-auto !py-1 text-xs" />
            <label className="sr-only" htmlFor="to">To</label><input id="to" name="to" type="date" defaultValue={to} className="input !min-h-9 !w-auto !py-1 text-xs" />
            <button className="btn btn-secondary btn-sm">Apply</button>
          </form>
        } />
      {sp.denied && <p className="notice notice-error">Your role does not include that section.</p>}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Revenue (paid orders)" value={formatMoney(Number(k.revenue))} note="Gross, incl. GST and delivery" />
        <Stat label="Orders" value={k.orders} />
        <Stat label="Average order value" value={k.aov ? formatMoney(Number(k.aov)) : "—"} />
        <Stat label="Awaiting fulfilment" value={pending.n} note={<Link className="link" href="/admin/orders?status=confirmed">View queue</Link>} />
        <Stat label="Conversion rate" value={<span className="text-base font-normal text-ink-soft">Not measured</span>} note="Needs an analytics integration for sessions." />
      </div>
      <Panel title="Revenue by day">
        <RevenueChart data={series.map((s) => ({ day: s.day.toISOString().slice(0, 10), revenueMinor: Number(s.revenue), orders: s.orders }))} />
      </Panel>
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Low stock" actions={<Link href="/admin/inventory?filter=low" className="link text-xs">Inventory</Link>}>
          {lowStock.length === 0 ? <p className="text-sm text-ink-soft">Nothing below its threshold.</p> : (
            <ul className="divide-y divide-line text-sm">
              {lowStock.map((v) => (
                <li key={v.sku} className="flex justify-between gap-3 py-2">
                  <Link href={`/admin/products/${v.product_id}`} className="truncate hover:underline">{v.name}</Link>
                  <Pill tone={v.available <= 0 ? "bad" : "warn"}>{v.available <= 0 ? "Out of stock" : `${v.available} left`}</Pill>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Returns and refunds">
          <dl className="grid grid-cols-3 gap-3 text-sm">
            <div><dt className="text-ink-soft">Return requests</dt><dd className="text-xl font-semibold">{returnsSummary.total}</dd></div>
            <div><dt className="text-ink-soft">Open</dt><dd className="text-xl font-semibold">{returnsSummary.open}</dd></div>
            <div><dt className="text-ink-soft">Refunded</dt><dd className="text-xl font-semibold tabular-nums">{formatMoney(Number(refunds.amount))}</dd></div>
          </dl>
          <Link href="/admin/returns" className="link mt-3 inline-block text-xs">Manage returns</Link>
        </Panel>
      </div>
      <Panel title="Recent failed payments">
        {failed.length === 0 ? <p className="text-sm text-ink-soft">None.</p> : (
          <Table head={["Order", "Customer", "Amount", "When"]}>
            {failed.map((f) => (
              <tr key={f.id}><td className="px-3 py-2"><Link className="link" href={`/admin/orders/${f.id}`}>{f.order_number}</Link></td>
                <td className="px-3">{f.email}</td><td className="px-3 tabular-nums">{formatMoney(Number(f.total_minor))}</td>
                <td className="px-3 text-ink-soft">{f.updated_at.toLocaleString("en-IN")}</td></tr>
            ))}
          </Table>
        )}
      </Panel>
    </div>
  );
}
