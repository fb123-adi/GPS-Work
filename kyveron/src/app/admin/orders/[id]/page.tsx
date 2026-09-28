import Link from "next/link";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/guards";
import { can } from "@/lib/auth/roles";
import { getOrder } from "@/lib/orders/queries";
import { formatMoney } from "@/lib/money";
import { nextStatuses, STATUS_LABEL } from "@/lib/orders/state";
import { BRAND } from "@/lib/config/store";
import { PageHeader, Panel, Pill, statusTone } from "@/components/admin/ui";
import { ClearReview, NoteForm, RefundForm, ShipmentForm, StatusControls } from "@/components/admin/OrderActions";

export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireStaffPage("orders.view");
  const o = await getOrder((await params).id);
  if (!o) notFound();
  const notes = await sql<{ body: string; created_at: Date; email: string }[]>`
    select n.body, n.created_at, u.email from order_notes n join users u on u.id = n.author_id where n.order_id = ${o.id} order by n.created_at desc`;
  const refunded = o.refunds.filter((r) => r.status !== "failed").reduce((a, r) => a + Number(r.amount_minor), 0);
  const captured = o.payments.find((p) => ["captured", "partially_refunded"].includes(p.status));
  const remaining = captured ? (Number(captured.amount_minor) - refunded) / 100 : 0;
  const next = nextStatuses(o.status, "staff").filter((s) => (s === "cancelled" ? can(user.roles, "orders.cancel") : can(user.roles, "orders.fulfil")));
  const a = o.shipping_address;
  const fmt = (d: Date) => d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="grid gap-6">
      <PageHeader title={`Order ${o.order_number}`}
        sub={<span className="flex flex-wrap items-center gap-2">Placed {fmt(o.created_at)} <Pill tone={statusTone(o.status)}>{STATUS_LABEL[o.status]}</Pill></span>}
        actions={<>
          <Link href="/admin/orders" className="btn btn-secondary btn-sm">All orders</Link>
          <a href={`/api/admin/orders/${o.id}/packing-slip`} target="_blank" rel="noopener" className="btn btn-secondary btn-sm">Packing slip</a>
          <a href={`/api/orders/${o.id}/invoice`} target="_blank" rel="noopener" className="btn btn-secondary btn-sm">Invoice</a>
          <a href={`mailto:${o.email}?subject=${encodeURIComponent(`Your Kyveron order ${o.order_number}`)}`} className="btn btn-secondary btn-sm">Email customer</a>
        </>} />

      {o.needs_review && (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-danger bg-[#fbf1ef] px-4 py-3 text-sm text-danger">
          <span><strong>Needs review:</strong> {o.review_reason}</span>
          {can(user.roles, "orders.fulfil") && <ClearReview orderId={o.id} />}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-6">
          <Panel title="Items">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-ink-soft"><tr><th className="pb-2">Item</th><th>SKU</th><th>Qty</th><th className="text-right">Unit</th><th className="text-right">GST</th><th className="text-right">Line</th></tr></thead>
              <tbody className="divide-y divide-line">
                {o.items.map((i) => (
                  <tr key={i.id}><td className="py-2">{i.product_name}<br /><span className="text-xs text-ink-soft">{i.colour} · {i.size}{i.returned_quantity ? ` · ${i.returned_quantity} returned` : ""}</span></td>
                    <td className="font-mono text-xs">{i.sku}</td><td>{i.quantity}</td>
                    <td className="text-right tabular-nums">{formatMoney(Number(i.unit_price_minor))}</td>
                    <td className="text-right text-xs tabular-nums">{Number(i.tax_rate)}% · {formatMoney(Number(i.tax_minor))}</td>
                    <td className="text-right tabular-nums">{formatMoney(Number(i.line_total_minor))}</td></tr>
                ))}
              </tbody>
            </table>
            <dl className="ml-auto mt-4 grid max-w-xs gap-1 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatMoney(Number(o.subtotal_minor))}</dd></div>
              <div className="flex justify-between"><dt>Discount {o.coupon_code && `(${o.coupon_code})`}</dt><dd>−{formatMoney(Number(o.discount_minor))}</dd></div>
              <div className="flex justify-between"><dt>Delivery ({o.shipping_method})</dt><dd>{formatMoney(Number(o.shipping_minor))}</dd></div>
              <div className="flex justify-between text-ink-soft"><dt>GST included</dt><dd>{formatMoney(Number(o.tax_minor))}</dd></div>
              <div className="flex justify-between border-t border-line pt-1 font-semibold"><dt>Total</dt><dd>{formatMoney(Number(o.total_minor))}</dd></div>
            </dl>
          </Panel>

          {can(user.roles, "orders.fulfil") && (
            <Panel title="Fulfilment">
              <StatusControls orderId={o.id} next={next} />
              {["confirmed", "processing", "packed"].includes(o.status) && (
                <div className="mt-5 border-t border-line pt-4"><p className="mb-2 text-sm font-medium">Add shipment</p><ShipmentForm orderId={o.id} /></div>
              )}
              {o.shipments.length > 0 && (
                <ul className="mt-4 space-y-1 border-t border-line pt-3 text-sm">
                  {o.shipments.map((s) => <li key={s.tracking_number}>{s.courier} · {s.tracking_number} {s.tracking_url && <a className="link" href={s.tracking_url} target="_blank" rel="noopener noreferrer">track</a>}</li>)}
                </ul>
              )}
            </Panel>
          )}

          <Panel title="Payments and refunds">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-ink-soft"><tr><th className="pb-2">Provider</th><th>Gateway order</th><th>Payment</th><th>Status</th><th>Signature</th><th className="text-right">Amount</th></tr></thead>
              <tbody className="divide-y divide-line">
                {o.payments.map((p, i) => (
                  <tr key={i}><td className="py-2">{p.provider}{p.method ? ` · ${p.method}` : ""}</td><td className="max-w-[9rem] truncate font-mono text-xs" title={p.gateway_order_id ?? ""}>{p.gateway_order_id}</td>
                    <td className="max-w-[9rem] truncate font-mono text-xs" title={p.gateway_payment_id ?? ""}>{p.gateway_payment_id ?? "—"}</td><td><Pill tone={statusTone(p.status)}>{p.status}</Pill>{p.error_description && <span className="block text-xs text-danger">{p.error_description}</span>}</td>
                    <td>{p.signature_verified ? <Pill tone="good">verified</Pill> : <Pill>—</Pill>}</td><td className="text-right tabular-nums">{formatMoney(Number(p.amount_minor))}</td></tr>
                ))}
              </tbody>
            </table>
            {o.refunds.length > 0 && (
              <ul className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
                {o.refunds.map((r, i) => <li key={i}>{formatMoney(Number(r.amount_minor))} · <Pill tone={statusTone(r.status)}>{r.status}</Pill> · {r.reason} <span className="text-xs text-ink-soft">{fmt(r.created_at)}</span></li>)}
              </ul>
            )}
            {can(user.roles, "orders.refund") && captured && <div className="mt-4 border-t border-line pt-4"><p className="mb-2 text-sm font-medium">Issue a refund</p><RefundForm orderId={o.id} remainingRupees={remaining} /></div>}
          </Panel>
        </div>

        <div className="grid content-start gap-6">
          <Panel title="Customer">
            <p className="text-sm">{a.fullName}<br /><a className="link" href={`mailto:${o.email}`}>{o.email}</a><br />{o.phone}</p>
            {o.user_id && can(user.roles, "customers.view") && <Link className="link mt-2 inline-block text-sm" href={`/admin/customers/${o.user_id}`}>Customer profile</Link>}
            <p className="mt-3 text-xs text-ink-soft">Delivery address</p>
            <address className="text-sm not-italic">{a.line1}{a.line2 && <>, {a.line2}</>}{a.landmark && <>, near {a.landmark}</>}<br />{a.city}, {a.state} {a.postalCode}</address>
          </Panel>
          <Panel title="History">
            <ol className="space-y-2 text-sm">
              {o.history.map((h, i) => (
                <li key={i}><span className="font-medium">{STATUS_LABEL[h.to_status]}</span> <span className="text-xs text-ink-soft">· {h.actor_type} · {fmt(h.created_at)}</span>{h.note && <span className="block text-xs text-ink-soft">{h.note}</span>}</li>
              ))}
            </ol>
          </Panel>
          <Panel title="Internal notes">
            {can(user.roles, "orders.note") && <NoteForm orderId={o.id} />}
            <ul className="mt-3 space-y-3 text-sm">
              {notes.map((n, i) => <li key={i} className="border-t border-line pt-2"><p className="whitespace-pre-line">{n.body}</p><p className="text-xs text-ink-soft">{n.email} · {fmt(n.created_at)}</p></li>)}
            </ul>
          </Panel>
          <p className="text-xs text-ink-soft">Customer support: {BRAND.supportEmail}</p>
        </div>
      </div>
    </div>
  );
}
