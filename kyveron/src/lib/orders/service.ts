import "server-only";
import { randomInt } from "node:crypto";
import { sql, type Tx } from "@/lib/db";
import { env } from "@/lib/env";
import { loadLines } from "@/lib/cart";
import { quote, type Quote } from "@/lib/pricing";
import { RESERVATION_MINUTES, SHIPPING_METHODS, POLICY_VERSION } from "@/lib/config/store";
import { sendEmail } from "@/lib/email";
import { templates, type OrderEmailData } from "@/lib/email/templates";
import { canTransition, PAID_STATES, STATUS_LABEL, type Actor, type OrderStatus } from "./state";

export class CheckoutError extends Error {
  constructor(message: string, public problems: string[] = []) {
    super(message);
  }
}

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** Human-readable, non-sequential order number, e.g. KV2609-7QK3MX. */
export function generateOrderNumber(now = new Date()) {
  const yymm = `${String(now.getUTCFullYear()).slice(2)}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  let tail = "";
  for (let i = 0; i < 6; i++) tail += CROCKFORD[randomInt(32)];
  return `KV${yymm}-${tail}`;
}

export type Address = {
  fullName: string; phone: string; line1: string; line2?: string | null; landmark?: string | null;
  city: string; state: string; postalCode: string; country: string;
};

export type CheckoutInput = {
  cartId: string;
  idempotencyKey: string;
  userId: string | null;
  email: string;
  phone: string;
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: string;
  couponCode: string | null;
  paymentMethod: string;
  ip: string;
};

export function deliveryWindow(methodId: string, from = new Date()) {
  const m = SHIPPING_METHODS.find((s) => s.id === methodId) ?? SHIPPING_METHODS[0];
  const add = (d: number) => {
    const x = new Date(from);
    let added = 0;
    while (added < d) {
      x.setDate(x.getDate() + 1);
      if (x.getDay() !== 0) added++; // no Sunday dispatch/delivery
    }
    return x.toISOString().slice(0, 10);
  };
  return { from: add(m.daysMin), to: add(m.daysMax) };
}

/** Reserves stock atomically. Returns false if any line cannot be held. */
async function reserve(tx: Tx, items: { variantId: string; quantity: number }[]): Promise<boolean> {
  // Consistent lock order prevents deadlocks between concurrent checkouts.
  const sorted = [...items].sort((a, b) => a.variantId.localeCompare(b.variantId));
  for (const it of sorted) {
    const r = await tx`
      update product_variants set reserved = reserved + ${it.quantity}
      where id = ${it.variantId} and deleted_at is null and is_available
        and stock_on_hand - reserved >= ${it.quantity}
      returning id`;
    if (r.length === 0) return false;
  }
  return true;
}

async function releaseReservation(tx: Tx, orderId: string) {
  const items = await tx<{ variant_id: string; quantity: number }[]>`
    select variant_id, quantity from order_items where order_id = ${orderId} and variant_id is not null order by variant_id`;
  for (const it of items) {
    await tx`update product_variants set reserved = greatest(reserved - ${it.quantity}, 0) where id = ${it.variant_id}`;
  }
  await tx`update orders set reservation_expires_at = null where id = ${orderId}`;
  await tx`update coupon_redemptions set state = 'released' where order_id = ${orderId} and state = 'pending'`;
}

/**
 * Creates the order, its line snapshot, and stock reservations in one
 * transaction from the server-side quote. Idempotent per idempotencyKey:
 * a double-submitted checkout returns the same order.
 */
export async function createOrder(input: CheckoutInput): Promise<{ orderId: string; orderNumber: string; totalMinor: number; created: boolean }> {
  const existing = await sql<{ id: string; order_number: string; total_minor: string }[]>`
    select id, order_number, total_minor from orders where idempotency_key = ${input.idempotencyKey}`;
  if (existing[0]) {
    return { orderId: existing[0].id, orderNumber: existing[0].order_number, totalMinor: Number(existing[0].total_minor), created: false };
  }

  return sql.begin(async (tx) => {
    const [cart] = await tx`select id from carts where id = ${input.cartId} and converted_at is null for update`;
    if (!cart) throw new CheckoutError("Your bag has changed. Please review it and try again.");
    const lines = await loadLines(input.cartId, tx);
    if (lines.length === 0) throw new CheckoutError("Your bag is empty.");

    const q: Quote = await quote(lines, {
      couponCode: input.couponCode, shippingMethod: input.shippingMethod, userId: input.userId, email: input.email,
    }, tx);
    if (q.problems.length) throw new CheckoutError("Some items in your bag changed.", q.problems);
    if (input.couponCode && q.couponError) throw new CheckoutError(q.couponError);

    const ok = await reserve(tx, q.lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })));
    if (!ok) throw new CheckoutError("Some items sold out while you were checking out. Please review your bag.");

    const window = deliveryWindow(q.shippingMethod.id);
    let orderNumber = generateOrderNumber();
    for (let i = 0; i < 5; i++) {
      const [clash] = await tx`select 1 from orders where order_number = ${orderNumber}`;
      if (!clash) break;
      orderNumber = generateOrderNumber();
    }

    const [order] = await tx<{ id: string }[]>`
      insert into orders (order_number, cart_id, user_id, email, phone, status, currency, subtotal_minor, discount_minor,
        shipping_minor, tax_minor, tax_inclusive, total_minor, coupon_code, shipping_method, shipping_address,
        billing_address, payment_method, idempotency_key, reservation_expires_at, estimated_delivery_from,
        estimated_delivery_to, terms_version, placed_ip)
      values (${orderNumber}, ${input.cartId}, ${input.userId}, ${input.email}, ${input.phone}, 'pending_payment', 'INR',
        ${q.subtotalMinor}, ${q.discountMinor}, ${q.shippingMinor}, ${q.taxMinor}, ${q.taxInclusive}, ${q.totalMinor},
        ${q.coupon?.code ?? null}, ${q.shippingMethod.id}, ${tx.json(input.shippingAddress)}, ${tx.json(input.billingAddress)},
        ${input.paymentMethod}, ${input.idempotencyKey}, now() + make_interval(mins => ${RESERVATION_MINUTES}),
        ${window.from}, ${window.to}, ${POLICY_VERSION}, ${input.ip})
      returning id`;

    for (const l of q.lines) {
      await tx`insert into order_items (order_id, variant_id, product_id, sku, product_name, size, colour, image_url,
          unit_price_minor, compare_at_minor, quantity, discount_minor, tax_rate, tax_minor, line_total_minor)
        values (${order.id}, ${l.variantId}, ${l.productId}, ${l.sku}, ${l.name}, ${l.size}, ${l.colour}, ${l.imageUrl},
          ${l.unitPriceMinor}, ${l.compareAtMinor}, ${l.quantity}, ${l.discountMinor}, ${l.taxRate}, ${l.taxMinor}, ${l.lineTotalMinor})`;
    }
    if (q.coupon) {
      await tx`insert into coupon_redemptions (coupon_id, order_id, user_id, email, discount_minor)
        values (${q.coupon.id}, ${order.id}, ${input.userId}, ${input.email}, ${q.discountMinor})`;
    }
    await tx`insert into order_status_history (order_id, from_status, to_status, actor_id, actor_type, note)
      values (${order.id}, null, 'pending_payment', ${input.userId}, 'customer', 'Order placed')`;

    return { orderId: order.id, orderNumber, totalMinor: q.totalMinor, created: true };
  }) as Promise<{ orderId: string; orderNumber: string; totalMinor: number; created: boolean }>;
}

/**
 * Re-holds stock for a payment retry if the original reservation lapsed.
 * The order (and its amount) never changes; only the hold is renewed.
 */
export async function renewReservation(orderId: string): Promise<boolean> {
  return sql.begin(async (tx) => {
    const [o] = await tx<{ status: OrderStatus; reservation_expires_at: Date | null }[]>`
      select status, reservation_expires_at from orders where id = ${orderId} for update`;
    if (!o || !["pending_payment", "payment_failed"].includes(o.status)) return false;
    if (o.reservation_expires_at && o.reservation_expires_at.getTime() > Date.now()) {
      await tx`update orders set reservation_expires_at = now() + make_interval(mins => ${RESERVATION_MINUTES}) where id = ${orderId}`;
      return true;
    }
    const items = await tx<{ variant_id: string; quantity: number }[]>`
      select variant_id, quantity from order_items where order_id = ${orderId}`;
    const ok = await reserve(tx, items.map((i) => ({ variantId: i.variant_id, quantity: i.quantity })));
    if (!ok) return false;
    await tx`update orders set reservation_expires_at = now() + make_interval(mins => ${RESERVATION_MINUTES}) where id = ${orderId}`;
    await tx`update coupon_redemptions set state = 'pending' where order_id = ${orderId} and state = 'released'`;
    return true;
  }) as Promise<boolean>;
}

async function recordTransition(
  tx: Tx, orderId: string, from: OrderStatus, to: OrderStatus, actor: Actor, actorId: string | null, note: string | null,
) {
  await tx`update orders set status = ${to},
      paid_at = case when ${to} = 'paid' and paid_at is null then now() else paid_at end,
      cancelled_at = case when ${to} = 'cancelled' then now() else cancelled_at end
    where id = ${orderId}`;
  await tx`insert into order_status_history (order_id, from_status, to_status, actor_id, actor_type, note)
    values (${orderId}, ${from}, ${to}, ${actorId}, ${actor}, ${note})`;
}

export async function orderEmailData(orderId: string): Promise<OrderEmailData & { email: string }> {
  const [o] = await sql<{ order_number: string; email: string; currency: string; total_minor: string; shipping_address: Address }[]>`
    select order_number, email, currency, total_minor, shipping_address from orders where id = ${orderId}`;
  const items = await sql<{ product_name: string; size: string; colour: string; quantity: number; line_total_minor: string }[]>`
    select product_name, size, colour, quantity, line_total_minor from order_items where order_id = ${orderId}`;
  return {
    email: o.email,
    orderNumber: o.order_number,
    name: o.shipping_address.fullName.split(" ")[0],
    currency: o.currency,
    totalMinor: Number(o.total_minor),
    items: items.map((i) => ({ name: i.product_name, size: i.size, colour: i.colour, quantity: i.quantity, lineTotalMinor: Number(i.line_total_minor) })),
    trackUrl: `${env().APP_URL}/track-order?order=${encodeURIComponent(o.order_number)}`,
  };
}

/**
 * Marks an order paid after the server has verified the payment (signature
 * or webhook). Idempotent: repeated calls for the same payment are no-ops.
 * Commits the reserved stock; if the reservation lapsed and stock is gone,
 * the order is still recorded as paid but flagged for staff review.
 */
export async function markPaid(
  orderId: string,
  p: { gatewayOrderId: string; gatewayPaymentId: string; method?: string | null; actor: Actor },
) {
  const result = await sql.begin(async (tx) => {
    const [o] = await tx<{ status: OrderStatus; stock_committed: boolean; reservation_expires_at: Date | null }[]>`
      select status, stock_committed, reservation_expires_at from orders where id = ${orderId} for update`;
    if (!o) throw new Error("Order not found");

    await tx`update payments set status = 'captured', gateway_payment_id = ${p.gatewayPaymentId},
        method = coalesce(${p.method ?? null}, method), captured_at = coalesce(captured_at, now()), signature_verified = true
      where order_id = ${orderId} and gateway_order_id = ${p.gatewayOrderId}`;

    if (PAID_STATES.includes(o.status) || o.status === "refunded") return { changed: false };
    if (o.status === "cancelled") {
      await tx`update orders set needs_review = true,
        review_reason = 'Payment captured after the order was cancelled. Refund required.' where id = ${orderId}`;
      await tx`insert into order_status_history (order_id, from_status, to_status, actor_type, note)
        values (${orderId}, 'cancelled', 'cancelled', 'gateway', 'Late payment received on a cancelled order; flagged for refund')`;
      return { changed: false };
    }

    const items = await tx<{ variant_id: string; quantity: number }[]>`
      select variant_id, quantity from order_items where order_id = ${orderId} and variant_id is not null order by variant_id`;
    const held = o.reservation_expires_at !== null;
    let shortfall = false;
    for (const it of items) {
      const r = held
        ? await tx<{ stock_on_hand: number }[]>`update product_variants
            set stock_on_hand = stock_on_hand - ${it.quantity}, reserved = reserved - ${it.quantity}
            where id = ${it.variant_id} and reserved >= ${it.quantity} and stock_on_hand >= ${it.quantity}
            returning stock_on_hand`
        : await tx<{ stock_on_hand: number }[]>`update product_variants
            set stock_on_hand = stock_on_hand - ${it.quantity}
            where id = ${it.variant_id} and stock_on_hand - reserved >= ${it.quantity}
            returning stock_on_hand`;
      if (r.length === 0) {
        shortfall = true;
        continue;
      }
      await tx`insert into inventory_movements (variant_id, delta, reason, order_id, stock_after)
        values (${it.variant_id}, ${-it.quantity}, 'sale', ${orderId}, ${r[0].stock_on_hand})`;
    }
    await tx`update orders set stock_committed = true, reservation_expires_at = null,
        payment_method = coalesce(${p.method ?? null}, payment_method),
        needs_review = ${shortfall} or needs_review,
        review_reason = case when ${shortfall} then 'Paid after reservation lapsed; some stock unavailable.' else review_reason end
      where id = ${orderId}`;
    await tx`update coupon_redemptions set state = 'confirmed' where order_id = ${orderId}`;
    await recordTransition(tx, orderId, o.status, "paid", p.actor, null, "Payment verified");
    if (!shortfall) await recordTransition(tx, orderId, "paid", "confirmed", "system", null, "Order confirmed");

    // The paid cart is done; start the customer on a fresh one.
    await tx`update carts set converted_at = now()
      where id = (select cart_id from orders where id = ${orderId}) and converted_at is null`;
    return { changed: true };
  });

  if (result.changed) {
    const data = await orderEmailData(orderId);
    await sendEmail({ to: data.email, ...templates.orderConfirmed(data), dedupeKey: `order-confirmed:${orderId}` });
  }
  return result;
}

export async function markPaymentFailed(orderId: string, info: { gatewayOrderId: string; gatewayPaymentId?: string | null; code?: string | null; description?: string | null; actor: Actor }) {
  const changed = await sql.begin(async (tx) => {
    const [o] = await tx<{ status: OrderStatus }[]>`select status from orders where id = ${orderId} for update`;
    if (!o) return false;
    await tx`update payments set status = 'failed', failed_at = now(),
        gateway_payment_id = coalesce(gateway_payment_id, ${info.gatewayPaymentId ?? null}),
        error_code = ${info.code ?? null}, error_description = ${info.description?.slice(0, 300) ?? null}
      where order_id = ${orderId} and gateway_order_id = ${info.gatewayOrderId} and status in ('created','authorized')`;
    if (o.status !== "pending_payment") return false;
    await recordTransition(tx, orderId, o.status, "payment_failed", info.actor, null, info.description ?? "Payment failed");
    return true;
  });
  if (changed) {
    const data = await orderEmailData(orderId);
    await sendEmail({
      to: data.email,
      ...templates.paymentFailed(data, `${env().APP_URL}/checkout/pay/${orderId}`),
      dedupeKey: `payment-failed:${orderId}:${info.gatewayPaymentId ?? "x"}`,
    });
  }
}

const NOTIFY: Partial<Record<OrderStatus, [string, string]>> = {
  out_for_delivery: ["Out for delivery", "Your order is out for delivery today."],
  delivered: ["Delivered", "Your order has been delivered. If anything is not right, you can start a return within 14 days."],
  cancelled: ["Order cancelled", "Your order has been cancelled. If you paid, your refund will follow and we will email you when it is processed."],
  refund_pending: ["Refund started", "We have started your refund. Banks usually take 5 to 7 working days to show it."],
  refunded: ["Refund processed", "Your refund has been processed by our payment provider."],
  cancellation_requested: ["Cancellation requested", "We have your cancellation request and will confirm shortly."],
  return_requested: ["Return requested", "We have your return request. We will email you the next steps."],
  returned: ["Return received", "We have received your return and are checking it."],
};

/**
 * The single entry point for status changes after payment. Validates the
 * transition for the actor, records history, releases or restocks inventory
 * where needed, and notifies the customer.
 */
export async function transition(orderId: string, to: OrderStatus, actor: Actor, opts: { actorId?: string | null; note?: string | null } = {}) {
  const from = await sql.begin(async (tx) => {
    const [o] = await tx<{ status: OrderStatus; stock_committed: boolean; reservation_expires_at: Date | null }[]>`
      select status, stock_committed, reservation_expires_at from orders where id = ${orderId} for update`;
    if (!o) throw new Error("Order not found");
    if (!canTransition(o.status, to, actor)) {
      throw new Error(`Cannot move an order from ${STATUS_LABEL[o.status]} to ${STATUS_LABEL[to]}.`);
    }
    if (to === "cancelled") {
      if (o.reservation_expires_at) await releaseReservation(tx, orderId);
      if (o.stock_committed) {
        const items = await tx<{ variant_id: string; quantity: number }[]>`
          select variant_id, quantity from order_items where order_id = ${orderId} and variant_id is not null`;
        for (const it of items) {
          const [v] = await tx<{ stock_on_hand: number }[]>`update product_variants set stock_on_hand = stock_on_hand + ${it.quantity}
            where id = ${it.variant_id} returning stock_on_hand`;
          if (v) await tx`insert into inventory_movements (variant_id, delta, reason, order_id, actor_id, stock_after, note)
            values (${it.variant_id}, ${it.quantity}, 'return', ${orderId}, ${opts.actorId ?? null}, ${v.stock_on_hand}, 'Order cancelled')`;
        }
        await tx`update orders set stock_committed = false where id = ${orderId}`;
      }
    }
    await recordTransition(tx, orderId, o.status, to, actor, opts.actorId ?? null, opts.note ?? null);
    return o.status;
  });

  const n = NOTIFY[to];
  if (n) {
    const data = await orderEmailData(orderId);
    await sendEmail({ to: data.email, ...templates.statusUpdate(data, n[0], n[1]), dedupeKey: `status:${orderId}:${to}:${from}` });
  }
  return from;
}

/**
 * Housekeeping (run by /api/cron/reservations every few minutes):
 * release lapsed holds, and cancel orders left unpaid for 24 hours.
 */
export async function releaseExpiredReservations() {
  const expired = await sql<{ id: string }[]>`
    select id from orders where status in ('pending_payment','payment_failed')
      and reservation_expires_at is not null and reservation_expires_at < now() limit 200`;
  for (const { id } of expired) {
    await sql.begin(async (tx) => {
      const [o] = await tx`select id from orders where id = ${id} and reservation_expires_at < now() for update`;
      if (o) await releaseReservation(tx, id);
    });
  }
  const stale = await sql<{ id: string }[]>`
    select id from orders where status in ('pending_payment','payment_failed')
      and created_at < now() - interval '24 hours' limit 200`;
  for (const { id } of stale) {
    await transition(id, "cancelled", "system", { note: "Unpaid for 24 hours" }).catch(() => {});
  }
  return { released: expired.length, cancelled: stale.length };
}
