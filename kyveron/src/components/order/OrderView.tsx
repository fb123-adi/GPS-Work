import Image from "next/image";
import Link from "next/link";
import type { FullOrder } from "@/lib/orders/queries";
import { formatMoney } from "@/lib/money";
import { PAID_STATES, STATUS_LABEL } from "@/lib/orders/state";
import { BRAND } from "@/lib/config/store";
import { OrderTimeline } from "./OrderTimeline";

const PAYMENT_LABEL: Record<string, string> = {
  created: "Awaiting payment", authorized: "Authorised", captured: "Paid", failed: "Failed", cancelled: "Cancelled",
  refunded: "Refunded", partially_refunded: "Partly refunded", disputed: "Under review",
};

export function OrderView({ o, showActions = true }: { o: FullOrder; showActions?: boolean }) {
  const paid = PAID_STATES.includes(o.status) || o.status === "refunded";
  const lastPayment = o.payments[0];
  const d = (x: Date | null) => x?.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const a = o.shipping_address;
  return (
    <div className="grid gap-10">
      <section aria-label="Order status" className="border border-line bg-surface p-6">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-lg font-semibold">{STATUS_LABEL[o.status]}</p>
          <p className="text-sm text-ink-soft">
            Payment: <span className={paid ? "text-success" : o.status === "payment_failed" ? "text-danger" : ""}>{lastPayment ? PAYMENT_LABEL[lastPayment.status] ?? lastPayment.status : "Not started"}</span>
            {lastPayment?.method ? ` · ${lastPayment.method.toUpperCase()}` : ""}
          </p>
        </div>
        {paid ? (
          <OrderTimeline status={o.status} history={o.history} />
        ) : (
          <p className="text-sm">
            {o.status === "cancelled" ? "This order was cancelled." : "We have not received payment for this order yet. Nothing has been charged."}
            {["pending_payment", "payment_failed"].includes(o.status) && showActions && <> <Link href={`/checkout/pay/${o.id}`} className="link">Complete payment</Link></>}
          </p>
        )}
        {o.shipments.map((s) => (
          <p key={s.tracking_number} className="mt-4 text-sm">
            Shipped with {s.courier}. Tracking number <strong className="font-medium">{s.tracking_number}</strong>.{" "}
            {s.tracking_url && <a className="link" href={s.tracking_url} target="_blank" rel="noopener noreferrer">Track with courier</a>}
          </p>
        ))}
        {paid && o.estimated_delivery_from && !["delivered", "cancelled", "refunded", "returned"].includes(o.status) && (
          <p className="mt-4 text-sm">Estimated delivery: <strong className="font-medium">{d(o.estimated_delivery_from)} to {d(o.estimated_delivery_to)}</strong></p>
        )}
      </section>

      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="items-h">
          <h2 id="items-h" className="mb-3 font-semibold">Items</h2>
          <ul className="divide-y divide-line border-y border-line">
            {o.items.map((i) => (
              <li key={i.id} className="flex gap-4 py-4">
                <span className="relative h-20 w-16 flex-none bg-[#e7e2d8]">{i.image_url && <Image src={i.image_url} alt="" fill sizes="64px" className="object-cover" />}</span>
                <span className="flex-1 text-sm"><span className="font-medium">{i.product_name}</span><br /><span className="text-ink-soft">{i.colour} · {i.size} · Qty {i.quantity}</span></span>
                <span className="text-sm tabular-nums">{formatMoney(Number(i.line_total_minor), o.currency)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatMoney(Number(o.subtotal_minor), o.currency)}</dd></div>
            {Number(o.discount_minor) > 0 && <div className="flex justify-between text-success"><dt>Discount{o.coupon_code ? ` (${o.coupon_code})` : ""}</dt><dd className="tabular-nums">−{formatMoney(Number(o.discount_minor), o.currency)}</dd></div>}
            <div className="flex justify-between"><dt>Delivery</dt><dd className="tabular-nums">{Number(o.shipping_minor) === 0 ? "Free" : formatMoney(Number(o.shipping_minor), o.currency)}</dd></div>
            <div className="flex justify-between text-ink-soft"><dt>Includes GST</dt><dd className="tabular-nums">{formatMoney(Number(o.tax_minor), o.currency)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatMoney(Number(o.total_minor), o.currency)}</dd></div>
          </dl>
          {o.refunds.length > 0 && (
            <div className="mt-4 text-sm">
              <p className="font-medium">Refunds</p>
              <ul className="mt-1 space-y-1 text-ink-soft">{o.refunds.map((r, i) => <li key={i}>{formatMoney(Number(r.amount_minor), o.currency)} · {r.status === "processed" ? `processed ${d(r.processed_at)}` : r.status}</li>)}</ul>
            </div>
          )}
        </section>
        <section aria-labelledby="addr-h" className="text-sm">
          <h2 id="addr-h" className="mb-3 font-semibold">Delivery address</h2>
          <address className="not-italic leading-relaxed">
            {a.fullName}<br />{a.line1}{a.line2 ? <><br />{a.line2}</> : null}{a.landmark ? <><br />Near {a.landmark}</> : null}<br />{a.city}, {a.state} {a.postalCode}<br />{a.phone}
          </address>
          <h2 className="mb-2 mt-6 font-semibold">Need help?</h2>
          <p className="text-ink-soft">Email <a className="link" href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a> or WhatsApp <a className="link" href={BRAND.whatsappLink}>{BRAND.whatsapp}</a> with your order number. {BRAND.serviceHours}.</p>
          {showActions && paid && (
            <p className="mt-4"><a className="link" href={`/api/orders/${o.id}/invoice`} target="_blank" rel="noopener">View or print invoice</a></p>
          )}
        </section>
      </div>
    </div>
  );
}
