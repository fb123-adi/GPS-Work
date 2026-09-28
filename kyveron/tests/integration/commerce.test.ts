import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { sql, withUserRls } from "@/lib/db";
import { createOrder, markPaid, releaseExpiredReservations, transition, CheckoutError } from "@/lib/orders/service";
import { startPayment, verifyCheckout, processWebhook, initiateRefund } from "@/lib/payments/service";
import { gateway } from "@/lib/payments/gateway";
import { quote } from "@/lib/pricing";
import { loadLines } from "@/lib/cart";

const addr = { fullName: "Test Buyer", phone: "+919876543210", line1: "1 Test Street", line2: null, landmark: null, city: "Bengaluru", state: "Karnataka", postalCode: "560001", country: "IN" };
let variantId = "";


async function cartWith(qty: number, userId: string | null = null, v = variantId) {
  const [c] = await sql<{ id: string }[]>`insert into carts (user_id) values (${userId}) returning id`;
  await sql`insert into cart_items (cart_id, variant_id, quantity) values (${c.id}, ${v}, ${qty})`;
  return c.id;
}

function input(cartId: string, extra: Partial<Parameters<typeof createOrder>[0]> = {}) {
  return { cartId, idempotencyKey: randomUUID(), userId: null, email: "buyer@example.com", phone: "+919876543210",
    shippingAddress: addr, billingAddress: addr, shippingMethod: "standard", couponCode: null, paymentMethod: "upi", ip: "127.0.0.1", ...extra };
}

async function stock() {
  const [v] = await sql<{ stock_on_hand: number; reserved: number }[]>`select stock_on_hand, reserved from product_variants where id = ${variantId}`;
  return v;
}

beforeAll(async () => {
  const [p] = await sql<{ id: string }[]>`insert into products (slug, name, status, description) values ('test-tee', 'Test Tee', 'published', 'x') returning id`;

  const [v] = await sql<{ id: string }[]>`insert into product_variants (product_id, sku, size, colour, price_minor, stock_on_hand)
    values (${p.id}, 'T-TEE-M', 'M', 'Black', 249000, 5) returning id`;
  variantId = v.id;
});

afterAll(async () => {
  await sql.end();
});

describe("checkout and inventory", () => {
  it("prices from the database, not the client", async () => {
    const cartId = await cartWith(2);
    const q = await quote(await loadLines(cartId), { shippingMethod: "standard" });
    expect(q.subtotalMinor).toBe(498000);
    expect(q.shippingMinor).toBe(0); // over ₹2,999
    expect(q.totalMinor).toBe(498000);
    expect(q.taxMinor).toBe(23714); // 5% inclusive on each ₹2,490 line
  });

  it("reserves stock atomically and is idempotent per key", async () => {
    const cartId = await cartWith(2);
    const inp = input(cartId);
    const a = await createOrder(inp);
    const b = await createOrder(inp);
    expect(b.orderId).toBe(a.orderId);
    expect(b.created).toBe(false);
    expect((await stock()).reserved).toBe(2);
  });

  it("prevents overselling under concurrency", async () => {
    // 3 available now (5 on hand, 2 reserved). Four buyers try for 2 each at once.
    const carts = await Promise.all([1, 2, 3, 4].map(() => cartWith(2)));
    const results = await Promise.allSettled(carts.map((c) => createOrder(input(c))));
    const ok = results.filter((r) => r.status === "fulfilled").length;
    expect(ok).toBe(1);
    expect(results.filter((r) => r.status === "rejected").every((r) => (r as PromiseRejectedResult).reason instanceof CheckoutError)).toBe(true);
    const s = await stock();
    expect(s.reserved).toBe(4);
    expect(s.reserved).toBeLessThanOrEqual(s.stock_on_hand);
  });

  it("marks paid only with a valid signature, once, and commits stock", async () => {
    await sql`update product_variants set stock_on_hand = 10, reserved = 0 where id = ${variantId}`;
    await sql`update orders set reservation_expires_at = null where status = 'pending_payment'`;
    const cartId = await cartWith(1);
    const { orderId } = await createOrder(input(cartId));
    const session = await startPayment(orderId);
    expect(session.provider).toBe("mock");
    expect(session.amountMinor).toBe(249000 + 9900);

    const bad = await verifyCheckout({ gatewayOrderId: session.gatewayOrderId, paymentId: "mock_pay_x", signature: "0".repeat(64) });
    expect(bad.ok).toBe(false);
    const [still] = await sql<{ status: string }[]>`select status from orders where id = ${orderId}`;
    expect(still.status).toBe("pending_payment");

    const pay = "mock_pay_good";
    const sig = gateway.signMock(session.gatewayOrderId, pay);
    expect((await verifyCheckout({ gatewayOrderId: session.gatewayOrderId, paymentId: pay, signature: sig })).ok).toBe(true);
    expect((await verifyCheckout({ gatewayOrderId: session.gatewayOrderId, paymentId: pay, signature: sig })).ok).toBe(true);

    const [o] = await sql<{ status: string; stock_committed: boolean }[]>`select status, stock_committed from orders where id = ${orderId}`;
    expect(o.status).toBe("confirmed");
    expect(o.stock_committed).toBe(true);
    const s = await stock();
    expect(s.stock_on_hand).toBe(9);
    expect(s.reserved).toBe(0);
    const [{ n }] = await sql<{ n: number }[]>`select count(*)::int n from inventory_movements where order_id = ${orderId} and reason = 'sale'`;
    expect(n).toBe(1);
    const [c] = await sql<{ converted_at: Date | null }[]>`select converted_at from carts where id = ${cartId}`;
    expect(c.converted_at).not.toBeNull();
    const [{ e }] = await sql<{ e: number }[]>`select count(*)::int e from email_outbox where dedupe_key = ${`order-confirmed:${orderId}`}`;
    expect(e).toBe(1);
  });

  it("processes duplicate webhooks exactly once", async () => {
    const cartId = await cartWith(1);
    const { orderId } = await createOrder(input(cartId));
    const s = await startPayment(orderId);
    const event = { event: "payment.captured", payload: { payment: { entity: { id: "pay_dup1", order_id: s.gatewayOrderId, status: "captured", amount: s.amountMinor, method: "upi" } } } };
    expect(await processWebhook("evt_1", event)).toBe(true);
    expect(await processWebhook("evt_1", event)).toBe(false);
    const [{ n }] = await sql<{ n: number }[]>`select count(*)::int n from order_status_history where order_id = ${orderId} and to_status = 'paid'`;
    expect(n).toBe(1);
  });

  it("flags amount mismatches instead of marking paid", async () => {
    const { orderId } = await createOrder(input(await cartWith(1)));
    const s = await startPayment(orderId);
    await processWebhook("evt_bad_amt", { event: "payment.captured", payload: { payment: { entity: { id: "pay_x2", order_id: s.gatewayOrderId, status: "captured", amount: 100 } } } });
    const [o] = await sql<{ status: string; needs_review: boolean }[]>`select status, needs_review from orders where id = ${orderId}`;
    expect(o.status).toBe("pending_payment");
    expect(o.needs_review).toBe(true);
  });

  it("releases lapsed reservations and retries without a new order", async () => {
    await sql`update product_variants set stock_on_hand = 3, reserved = 0 where id = ${variantId}`;
    await sql`update orders set reservation_expires_at = null where status = 'pending_payment'`;
    const { orderId } = await createOrder(input(await cartWith(2)));
    expect((await stock()).reserved).toBe(2);
    await sql`update orders set reservation_expires_at = now() - interval '1 minute' where id = ${orderId}`;
    await releaseExpiredReservations();
    expect((await stock()).reserved).toBe(0);
    await startPayment(orderId); // retry re-reserves
    expect((await stock()).reserved).toBe(2);
    const [{ n }] = await sql<{ n: number }[]>`select count(*)::int n from orders where id = ${orderId}`;
    expect(n).toBe(1);
  });

  it("rejects invalid transitions and restocks on cancellation", async () => {
    await sql`update product_variants set stock_on_hand = 10, reserved = 0 where id = ${variantId}`;
    await sql`update orders set reservation_expires_at = null where status = 'pending_payment'`;
    const { orderId } = await createOrder(input(await cartWith(1)));
    const s = await startPayment(orderId);
    await markPaid(orderId, { gatewayOrderId: s.gatewayOrderId, gatewayPaymentId: "pay_c1", actor: "gateway" });
    await expect(transition(orderId, "delivered", "staff")).rejects.toThrow();
    await transition(orderId, "cancelled", "staff", { note: "test" });
    expect((await stock()).stock_on_hand).toBe(10);
    const staff = randomUUID();
    await sql`insert into users (id, email) values (${staff}, 'staff@example.com')`;
    const r = await initiateRefund(orderId, 100000, "partial", staff);
    expect(r.mock).toBe(true);
    await expect(initiateRefund(orderId, 999999, "too much", staff)).rejects.toThrow();
  });
});

describe("coupons", () => {
  it("enforces first-order and per-customer limits server-side", async () => {
    await sql`update product_variants set stock_on_hand = 50, reserved = 0 where id = ${variantId}`;
    await sql`insert into coupons (code, kind, value, first_order_only, per_customer_limit) values ('FIRST10', 'percent', 10, true, 1)`;
    const lines = await loadLines(await cartWith(1));
    const fresh = await quote(lines, { couponCode: "FIRST10", email: "new@example.com" });
    expect(fresh.discountMinor).toBe(24900);
    const repeat = await quote(lines, { couponCode: "FIRST10", email: "buyer@example.com" });
    expect(repeat.discountMinor).toBe(0);
    expect(repeat.couponError).toMatch(/first orders/);
    const bogus = await quote(lines, { couponCode: "NOPE" });
    expect(bogus.couponError).toBeTruthy();
  });
});

describe("row-level security", () => {
  it("customers only see their own orders and never cost price", async () => {
    const a = randomUUID(), b = randomUUID();
    await sql`insert into users (id, email) values (${a}, 'a@example.com'), (${b}, 'b@example.com')`;
    await createOrder(input(await cartWith(1, a), { userId: a, email: "a@example.com" }));
    await createOrder(input(await cartWith(1, b), { userId: b, email: "b@example.com" }));
    const seen = await withUserRls(a, (tx) => tx<{ user_id: string }[]>`select user_id from orders`);
    expect(seen.length).toBe(1);
    expect(seen[0].user_id).toBe(a);
    await expect(withUserRls(a, (tx) => tx`select cost_minor from product_variants limit 1`)).rejects.toThrow(/permission denied/);
    await expect(withUserRls(a, (tx) => tx`update orders set total_minor = 1`)).rejects.toThrow(/permission denied/);
    const addrs = await withUserRls(a, (tx) => tx`select * from webhook_events`).catch((e: Error) => e.message);
    expect(String(addrs)).toMatch(/permission denied/);
  });

  it("anonymous role reads only published catalogue", async () => {
    await sql`insert into products (slug, name, status) values ('secret-draft', 'Draft', 'draft')`;
    const rows = await sql.begin(async (tx) => {
      await tx`set local role anon`;
      return tx<{ slug: string }[]>`select slug from products`;
    });
    expect(rows.map((r) => r.slug)).not.toContain("secret-draft");
    expect(rows.map((r) => r.slug)).toContain("test-tee");
  });
});
