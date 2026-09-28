import Link from "next/link";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/guards";
import { formatMoney } from "@/lib/money";
import { STATUS_LABEL, type OrderStatus } from "@/lib/orders/state";
import { PageHeader, Panel, Pill, statusTone } from "@/components/admin/ui";

export default async function Customer({ params }: { params: Promise<{ id: string }> }) {
  await requireStaffPage("customers.view");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [c] = await sql<{ email: string; phone: string | null; created_at: Date; full_name: string | null; marketing_email: boolean; marketing_whatsapp: boolean; deletion_requested_at: Date | null; email_verified_at: Date | null }[]>`
    select u.email, u.phone, u.created_at, u.email_verified_at, p.full_name, coalesce(p.marketing_email, false) marketing_email,
      coalesce(p.marketing_whatsapp, false) marketing_whatsapp, p.deletion_requested_at
    from users u left join profiles p on p.user_id = u.id where u.id = ${id}`;
  if (!c) notFound();
  const [orders, addresses, returns, tickets] = await Promise.all([
    sql<{ id: string; order_number: string; status: OrderStatus; total_minor: string; created_at: Date }[]>`select id, order_number, status, total_minor, created_at from orders where user_id = ${id} order by created_at desc limit 50`,
    sql<{ line1: string; city: string; state: string; postal_code: string; is_default: boolean }[]>`select line1, city, state, postal_code, is_default from addresses where user_id = ${id} and deleted_at is null`,
    sql<{ id: string; status: string; kind: string; created_at: Date }[]>`select id, status, kind, created_at from returns where user_id = ${id} order by created_at desc`,
    sql<{ reference: string; category: string; status: string; created_at: Date }[]>`select reference, category, status, created_at from contact_tickets where user_id = ${id} or email = ${c.email} order by created_at desc limit 20`,
  ]);
  return (
    <div className="grid max-w-5xl gap-6">
      <PageHeader title={c.full_name ?? c.email} sub={`Customer since ${c.created_at.toLocaleDateString("en-IN")}`} actions={<Link href="/admin/customers" className="btn btn-secondary btn-sm">All customers</Link>} />
      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Contact">
          <p className="text-sm">{c.email} {c.email_verified_at ? <Pill tone="good">verified</Pill> : <Pill>unverified</Pill>}<br />{c.phone ?? "No mobile"}</p>
          <p className="mt-3 text-sm">Marketing: email {c.marketing_email ? "yes" : "no"} · WhatsApp {c.marketing_whatsapp ? "yes" : "no"}</p>
          {c.deletion_requested_at && <p className="mt-3 text-sm text-danger">Deletion requested {c.deletion_requested_at.toLocaleDateString("en-IN")}</p>}
        </Panel>
        <Panel title="Addresses">
          {addresses.length ? <ul className="space-y-1 text-sm">{addresses.map((a, i) => <li key={i}>{a.line1}, {a.city}, {a.state} {a.postal_code}{a.is_default ? " (default)" : ""}</li>)}</ul> : <p className="text-sm text-ink-soft">None saved.</p>}
        </Panel>
      </div>
      <Panel title={`Orders (${orders.length})`}>
        <ul className="divide-y divide-line text-sm">
          {orders.map((o) => <li key={o.id} className="flex justify-between gap-3 py-2"><Link className="link" href={`/admin/orders/${o.id}`}>{o.order_number}</Link><span>{o.created_at.toLocaleDateString("en-IN")}</span><Pill tone={statusTone(o.status)}>{STATUS_LABEL[o.status]}</Pill><span className="tabular-nums">{formatMoney(Number(o.total_minor))}</span></li>)}
        </ul>
      </Panel>
      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Returns">{returns.length ? <ul className="text-sm">{returns.map((r) => <li key={r.id}>{r.kind} · {r.status} · {r.created_at.toLocaleDateString("en-IN")}</li>)}</ul> : <p className="text-sm text-ink-soft">None.</p>}</Panel>
        <Panel title="Support tickets">{tickets.length ? <ul className="text-sm">{tickets.map((t) => <li key={t.reference}>{t.reference} · {t.category} · {t.status}</li>)}</ul> : <p className="text-sm text-ink-soft">None.</p>}</Panel>
      </div>
    </div>
  );
}
