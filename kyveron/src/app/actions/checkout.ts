"use server";

import { z } from "zod";
import { sql } from "@/lib/db";
import { env } from "@/lib/env";
import { findCartId, loadLines } from "@/lib/cart";
import { quote } from "@/lib/pricing";
import { getCurrentUser } from "@/lib/auth/session";
import { clientIp, userAgent } from "@/lib/security/request";
import { enforce, LIMITS, RateLimitError } from "@/lib/security/rate-limit";
import { checkoutSchema, fieldErrors, pinCode } from "@/lib/validation";
import { CheckoutError, createOrder } from "@/lib/orders/service";
import { startPayment, type PaymentSession } from "@/lib/payments/service";
import { canViewOrder, grantOrderAccess } from "@/lib/orders/access";
import { POLICY_VERSION } from "@/lib/config/store";
import { estimateDelivery } from "@/lib/delivery";

export type Summary = {
  lines: { variantId: string; name: string; size: string; colour: string; quantity: number; imageUrl: string | null; lineTotalMinor: number }[];
  subtotalMinor: number; discountMinor: number; shippingMinor: number; taxMinor: number; totalMinor: number;
  couponCode: string | null; couponError: string | null; problems: string[]; shippingMethod: string;
};

/** Live order summary for the checkout sidebar. Server-computed; the client only sends choices. */
export async function quoteCheckout(input: { shippingMethod: string; couponCode: string | null; email?: string }): Promise<Summary | null> {
  const cartId = await findCartId();
  if (!cartId) return null;
  const lines = await loadLines(cartId);
  if (!lines.length) return null;
  const user = await getCurrentUser();
  const coupon = input.couponCode ? z.string().trim().toUpperCase().max(32).regex(/^[A-Z0-9-]+$/).safeParse(input.couponCode) : null;
  const email = input.email ? z.string().email().safeParse(input.email) : null;
  const q = await quote(lines, {
    couponCode: coupon?.success ? coupon.data : null,
    shippingMethod: input.shippingMethod,
    userId: user?.id,
    email: user?.email ?? (email?.success ? email.data : null),
  });
  return {
    lines: q.lines.map((l) => ({ variantId: l.variantId, name: l.name, size: l.size, colour: l.colour, quantity: l.quantity, imageUrl: l.imageUrl, lineTotalMinor: l.lineTotalMinor })),
    subtotalMinor: q.subtotalMinor, discountMinor: q.discountMinor, shippingMinor: q.shippingMinor, taxMinor: q.taxMinor,
    totalMinor: q.totalMinor, couponCode: q.coupon?.code ?? null, couponError: q.couponError, problems: q.problems,
    shippingMethod: q.shippingMethod.id,
  };
}

export async function checkPin(pin: string) {
  const ok = pinCode.safeParse(pin);
  if (!ok.success) return { ok: false as const, error: "Enter a valid 6-digit PIN code." };
  return estimateDelivery(ok.data);
}

export type PlaceResult =
  | { ok: true; orderId: string; session: PaymentSession }
  | { ok: false; message: string; errors?: Record<string, string>; problems?: string[] };

/**
 * Creates the order and opens a payment attempt. Everything the customer
 * pays is recalculated here. The idempotency key makes double-clicks and
 * retries return the same order instead of a new one.
 */
export async function placeOrder(raw: unknown): Promise<PlaceResult> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: "Please check the highlighted fields.", errors: fieldErrors(parsed.error) };
  const d = parsed.data;

  if (d.paymentMethod === "cod" && env().COD_ENABLED !== "true") return { ok: false, message: "Cash on delivery is not available." };
  if (d.paymentMethod === "emi") return { ok: false, message: "EMI is not enabled for this store yet." };

  const user = await getCurrentUser();
  const ip = await clientIp();
  try {
    await enforce(LIMITS.checkout(user ? `u:${user.id}` : `ip:${ip}`));
  } catch (e) {
    if (e instanceof RateLimitError) return { ok: false, message: e.message };
    throw e;
  }

  const cartId = await findCartId();
  if (!cartId) return { ok: false, message: "Your bag is empty." };

  let orderId: string;
  try {
    const created = await createOrder({
      cartId, idempotencyKey: d.idempotencyKey, userId: user?.id ?? null, email: user?.email ?? d.email, phone: d.phone,
      shippingAddress: d.shipping, billingAddress: d.billingSameAsShipping || !d.billing ? d.shipping : d.billing,
      shippingMethod: d.shippingMethod, couponCode: d.couponCode || null, paymentMethod: d.paymentMethod, ip,
    });
    orderId = created.orderId;
    if (created.created) {
      await grantOrderAccess(orderId);
      await sql`insert into consent_records (user_id, subject, purpose, granted, policy_version, source, ip, user_agent)
        values (${user?.id ?? null}, ${user?.email ?? d.email}, 'terms_and_privacy', true, ${POLICY_VERSION}, 'checkout', ${ip}, ${await userAgent()})`;
      if (d.marketingOptIn) {
        await sql`insert into consent_records (user_id, subject, purpose, granted, policy_version, source, ip, user_agent)
          values (${user?.id ?? null}, ${user?.email ?? d.email}, 'marketing_email', true, ${POLICY_VERSION}, 'checkout', ${ip}, ${await userAgent()})`;
        await sql`insert into newsletter_subscribers (email, source) values (${user?.email ?? d.email}, 'checkout') on conflict (email) do nothing`;
      }
      if (user && d.saveAddress) {
        const a = d.shipping;
        const [dupe] = await sql`select 1 from addresses where user_id = ${user.id} and deleted_at is null
          and line1 = ${a.line1} and postal_code = ${a.postalCode}`;
        if (!dupe) {
          await sql`insert into addresses (user_id, full_name, phone, line1, line2, landmark, city, state, postal_code, country, is_default)
            values (${user.id}, ${a.fullName}, ${a.phone}, ${a.line1}, ${a.line2}, ${a.landmark}, ${a.city}, ${a.state}, ${a.postalCode}, ${a.country},
              not exists (select 1 from addresses where user_id = ${user.id} and deleted_at is null))`;
        }
      }
    } else {
      // Same key: make sure this browser owns the order before continuing.
      const [o] = await sql<{ id: string; user_id: string | null }[]>`select id, user_id from orders where id = ${orderId}`;
      if (!(await canViewOrder(o, user))) return { ok: false, message: "Please refresh the page and try again." };
    }
  } catch (e) {
    if (e instanceof CheckoutError) return { ok: false, message: e.message, problems: e.problems };
    throw e;
  }

  try {
    const session = await startPayment(orderId);
    return { ok: true, orderId, session };
  } catch (e) {
    // The order exists and stock is held; the customer can retry payment.
    return { ok: false, message: e instanceof Error ? e.message : "Could not start payment. Please try again." };
  }
}

/** Opens a fresh payment attempt for an existing unpaid order (retry). */
export async function retryPayment(orderId: string): Promise<PlaceResult> {
  if (!z.string().uuid().safeParse(orderId).success) return { ok: false, message: "Order not found." };
  const [o] = await sql<{ id: string; user_id: string | null }[]>`select id, user_id from orders where id = ${orderId}`;
  const user = await getCurrentUser();
  if (!o || !(await canViewOrder(o, user))) return { ok: false, message: "Order not found." };
  try {
    await enforce(LIMITS.checkout(user ? `u:${user.id}` : `ip:${await clientIp()}`));
    return { ok: true, orderId, session: await startPayment(orderId) };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not start payment." };
  }
}
