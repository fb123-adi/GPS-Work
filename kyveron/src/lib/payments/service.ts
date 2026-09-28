import "server-only";
import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";
import { env } from "@/lib/env";
import { gateway } from "./gateway";
import { markPaid, markPaymentFailed, renewReservation, transition } from "@/lib/orders/service";
import type { OrderStatus } from "@/lib/orders/state";

export type PaymentSession = {
  provider: "razorpay" | "mock";
  keyId: string | null;
  gatewayOrderId: string;
  amountMinor: number;
  currency: string;
  orderId: string;
  orderNumber: string;
  prefill: { email: string; contact: string; name: string };
};

/**
 * Opens a payment attempt for an existing order. The amount always comes
 * from the stored order, never from the request. Retries reuse the same
 * order and create a new gateway order, so no duplicate orders are made.
 */
export async function startPayment(orderId: string): Promise<PaymentSession> {
  const [o] = await sql<{
    id: string; order_number: string; status: OrderStatus; total_minor: string; currency: string; email: string; phone: string;
    shipping_address: { fullName: string };
  }[]>`select id, order_number, status, total_minor, currency, email, phone, shipping_address from orders where id = ${orderId}`;
  if (!o) throw new Error("Order not found");
  if (!["pending_payment", "payment_failed"].includes(o.status)) throw new Error("This order does not need payment.");

  if (!(await renewReservation(orderId))) {
    throw new Error("Some items in this order are no longer in stock. Please contact us or place a new order.");
  }
  if (o.status === "payment_failed") await transition(orderId, "pending_payment", "customer", { note: "Payment retried" });

  // Reuse an open attempt from the last 15 minutes to avoid piling up gateway orders on refresh.
  const [open] = await sql<{ gateway_order_id: string }[]>`
    select gateway_order_id from payments where order_id = ${orderId} and status = 'created'
      and created_at > now() - interval '15 minutes' and provider = ${gateway.provider}
    order by created_at desc limit 1`;
  let gatewayOrderId = open?.gateway_order_id;
  if (!gatewayOrderId) {
    const g = await gateway.createOrder(Number(o.total_minor), o.currency, o.order_number, { order_id: o.id });
    if (g.amount !== Number(o.total_minor)) throw new Error("Gateway amount mismatch");
    await sql`insert into payments (order_id, provider, gateway_order_id, status, amount_minor, currency)
      values (${o.id}, ${gateway.provider}, ${g.id}, 'created', ${g.amount}, ${g.currency})`;
    gatewayOrderId = g.id;
  }
  return {
    provider: gateway.provider,
    keyId: gateway.publicKey(),
    gatewayOrderId,
    amountMinor: Number(o.total_minor),
    currency: o.currency,
    orderId: o.id,
    orderNumber: o.order_number,
    prefill: { email: o.email, contact: o.phone, name: o.shipping_address.fullName },
  };
}

/**
 * Handles the browser's post-checkout callback. The signature proves the
 * gateway issued this payment for this gateway order; we additionally check
 * the order/amount pairing from our own database.
 */
export async function verifyCheckout(input: { gatewayOrderId: string; paymentId: string; signature: string }) {
  const [p] = await sql<{ order_id: string; amount_minor: string; status: string }[]>`
    select order_id, amount_minor, status from payments where gateway_order_id = ${input.gatewayOrderId}`;
  if (!p) return { ok: false as const, reason: "unknown_order" };
  if (!gateway.verifyPaymentSignature(input.gatewayOrderId, input.paymentId, input.signature)) {
    await sql`update payments set error_code = 'signature_mismatch' where gateway_order_id = ${input.gatewayOrderId}`;
    return { ok: false as const, reason: "bad_signature", orderId: p.order_id };
  }
  let method: string | null = null;
  if (gateway.provider === "razorpay") {
    // Belt and braces: confirm state and amount with Razorpay directly.
    const pay = await gateway.fetchPayment(input.paymentId);
    if (pay.order_id !== input.gatewayOrderId || pay.amount !== Number(p.amount_minor)) {
      return { ok: false as const, reason: "mismatch", orderId: p.order_id };
    }
    if (!["captured", "authorized"].includes(pay.status)) {
      return { ok: false as const, reason: `status_${pay.status}`, orderId: p.order_id };
    }
    method = pay.method ?? null;
  } else {
    method = "mock";
  }
  await markPaid(p.order_id, { gatewayOrderId: input.gatewayOrderId, gatewayPaymentId: input.paymentId, method, actor: "gateway" });
  return { ok: true as const, orderId: p.order_id };
}

export async function reportCheckoutFailure(gatewayOrderId: string, info: { paymentId?: string; code?: string; description?: string }) {
  const [p] = await sql<{ order_id: string }[]>`select order_id from payments where gateway_order_id = ${gatewayOrderId}`;
  if (!p) return null;
  // A browser-reported failure is only advisory: it can mark a failure but
  // never a success. The webhook remains authoritative.
  await markPaymentFailed(p.order_id, {
    gatewayOrderId, gatewayPaymentId: info.paymentId, code: info.code ?? "checkout_failed",
    description: info.description ?? "Payment was not completed", actor: "system",
  });
  return p.order_id;
}

type RazorpayEvent = {
  event: string;
  payload: {
    payment?: { entity: { id: string; order_id: string; status: string; amount: number; method?: string; error_code?: string; error_description?: string } };
    refund?: { entity: { id: string; payment_id: string; amount: number; status: string } };
    order?: { entity: { id: string } };
    dispute?: { entity: { id: string; payment_id: string; status: string } };
  };
};

/**
 * Processes a verified webhook exactly once per event id. Returns false for
 * duplicates. Errors are stored on the event row and rethrown so the gateway
 * retries.
 */
export async function processWebhook(eventId: string, event: RazorpayEvent): Promise<boolean> {
  const inserted = await sql<{ id: number }[]>`
    insert into webhook_events (provider, event_id, event_type, payload)
    values ('razorpay', ${eventId}, ${event.event}, ${sql.json(event as never)})
    on conflict (provider, event_id) do nothing returning id`;
  let rowId = inserted[0]?.id;
  if (!rowId) {
    const [prev] = await sql<{ id: number; processed_at: Date | null }[]>`
      select id, processed_at from webhook_events where provider = 'razorpay' and event_id = ${eventId}`;
    if (prev.processed_at) return false; // duplicate delivery
    rowId = prev.id; // previous attempt failed; retry processing
  }

  try {
    const pay = event.payload.payment?.entity;
    switch (event.event) {
      case "payment.captured":
      case "order.paid": {
        if (!pay) break;
        const [p] = await sql<{ order_id: string; amount_minor: string }[]>`
          select order_id, amount_minor from payments where gateway_order_id = ${pay.order_id}`;
        if (!p) break;
        if (pay.amount !== Number(p.amount_minor)) {
          await sql`update orders set needs_review = true, review_reason = 'Captured amount does not match order total.' where id = ${p.order_id}`;
          break;
        }
        await markPaid(p.order_id, { gatewayOrderId: pay.order_id, gatewayPaymentId: pay.id, method: pay.method, actor: "gateway" });
        break;
      }
      case "payment.authorized": {
        if (!pay) break;
        await sql`update payments set status = 'authorized', authorized_at = now(), gateway_payment_id = ${pay.id}
          where gateway_order_id = ${pay.order_id} and status = 'created'`;
        break;
      }
      case "payment.failed": {
        if (!pay) break;
        const [p] = await sql<{ order_id: string }[]>`select order_id from payments where gateway_order_id = ${pay.order_id}`;
        if (p) await markPaymentFailed(p.order_id, { gatewayOrderId: pay.order_id, gatewayPaymentId: pay.id, code: pay.error_code, description: pay.error_description, actor: "gateway" });
        break;
      }
      case "refund.processed":
      case "refund.failed": {
        const r = event.payload.refund?.entity;
        if (!r) break;
        const status = event.event === "refund.processed" ? "processed" : "failed";
        const [row] = await sql<{ order_id: string }[]>`
          update refunds set status = ${status}, processed_at = case when ${status} = 'processed' then now() else processed_at end
          where gateway_refund_id = ${r.id} returning order_id`;
        if (row && status === "processed") await settleRefundState(row.order_id);
        break;
      }
      case "payment.dispute.created": {
        const d = event.payload.dispute?.entity;
        if (!d) break;
        const [p] = await sql<{ order_id: string }[]>`select order_id from payments where gateway_payment_id = ${d.payment_id}`;
        if (!p) break;
        await sql`update payments set status = 'disputed' where gateway_payment_id = ${d.payment_id}`;
        await transition(p.order_id, "payment_disputed", "gateway", { note: `Dispute ${d.id} opened` }).catch(async () => {
          await sql`update orders set needs_review = true, review_reason = 'Payment dispute opened' where id = ${p.order_id}`;
        });
        break;
      }
      case "payment.dispute.won":
      case "payment.dispute.lost": {
        const d = event.payload.dispute?.entity;
        if (!d) break;
        const [p] = await sql<{ order_id: string }[]>`select order_id from payments where gateway_payment_id = ${d.payment_id}`;
        if (!p) break;
        const won = event.event.endsWith("won");
        await sql`update payments set status = ${won ? "captured" : "refunded"} where gateway_payment_id = ${d.payment_id}`;
        await transition(p.order_id, won ? "paid" : "refunded", "gateway", { note: `Dispute ${d.id} ${won ? "won" : "lost"}` }).catch(() => {});
        break;
      }
      default:
        break; // acknowledged, not used
    }
    await sql`update webhook_events set processed_at = now(), error = null where id = ${rowId}`;
    return true;
  } catch (err) {
    await sql`update webhook_events set error = ${err instanceof Error ? err.message.slice(0, 500) : "error"} where id = ${rowId}`;
    throw err;
  }
}

/** Moves the order to refunded once processed refunds cover the amount paid. */
async function settleRefundState(orderId: string) {
  const [s] = await sql<{ refunded: string; total: string; status: OrderStatus }[]>`
    select coalesce(sum(r.amount_minor) filter (where r.status = 'processed'), 0) as refunded, o.total_minor as total, o.status
    from orders o left join refunds r on r.order_id = o.id where o.id = ${orderId} group by o.id`;
  const full = Number(s.refunded) >= Number(s.total);
  await sql`update payments set status = ${full ? "refunded" : "partially_refunded"}
    where order_id = ${orderId} and status in ('captured','partially_refunded')`;
  if (full && s.status === "refund_pending") await transition(orderId, "refunded", "gateway", { note: "Refund processed" });
}

/**
 * Staff-initiated refund (full or partial) through the gateway. Amount is
 * capped at what remains refundable. Idempotency key prevents double refunds
 * on double-clicks.
 */
export async function initiateRefund(orderId: string, amountMinor: number, reason: string, staffId: string, idempotencyKey: string = randomUUID()) {
  const [pay] = await sql<{ id: string; gateway_payment_id: string; amount_minor: string; currency: string }[]>`
    select id, gateway_payment_id, amount_minor, currency from payments
    where order_id = ${orderId} and status in ('captured','partially_refunded') and gateway_payment_id is not null
    order by captured_at desc limit 1`;
  if (!pay) throw new Error("No captured payment to refund.");
  const [done] = await sql<{ n: string }[]>`select coalesce(sum(amount_minor), 0) as n from refunds
    where order_id = ${orderId} and status <> 'failed'`;
  const remaining = Number(pay.amount_minor) - Number(done.n);
  const amount = Math.trunc(amountMinor);
  if (amount <= 0 || amount > remaining) throw new Error(`Refund must be between ₹0.01 and the remaining ₹${(remaining / 100).toFixed(2)}.`);

  const g = await gateway.refund(pay.gateway_payment_id, amount, idempotencyKey);
  await sql`insert into refunds (order_id, payment_id, gateway_refund_id, amount_minor, currency, status, reason, initiated_by, processed_at)
    values (${orderId}, ${pay.id}, ${g.id}, ${amount}, ${pay.currency},
      ${g.status === "processed" ? "processed" : "pending"}, ${reason}, ${staffId},
      ${g.status === "processed" ? new Date() : null})
    on conflict (gateway_refund_id) do nothing`;

  const [o] = await sql<{ status: OrderStatus }[]>`select status from orders where id = ${orderId}`;
  if (!["refund_pending", "refunded"].includes(o.status)) {
    await transition(orderId, "refund_pending", "staff", { actorId: staffId, note: `Refund ₹${(amount / 100).toFixed(2)}: ${reason}` }).catch(() => {});
  }
  if (g.status === "processed") await settleRefundState(orderId);
  return { refundId: g.id, amountMinor: amount, mock: gateway.provider === "mock", appUrl: env().APP_URL };
}
