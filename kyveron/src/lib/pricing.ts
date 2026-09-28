import "server-only";
import { sql, type Db } from "@/lib/db";
import { allocate, inclusiveTax, percentOf } from "@/lib/money";
import { SHIPPING_METHODS, TAX, type ShippingMethod } from "@/lib/config/store";
import type { CartLine } from "@/lib/cart";

/**
 * Server-side price calculation. This is the only place totals are computed.
 * Browsers submit variant ids, quantities, a coupon code, and a shipping
 * method; never amounts.
 */
export type QuoteLine = CartLine & {
  lineSubtotalMinor: number;
  discountMinor: number;
  taxRate: number;
  taxMinor: number;
  lineTotalMinor: number;
};

export type Quote = {
  currency: "INR";
  lines: QuoteLine[];
  subtotalMinor: number;
  discountMinor: number;
  shippingMinor: number;
  taxMinor: number;
  taxInclusive: boolean;
  totalMinor: number;
  shippingMethod: ShippingMethod;
  coupon: { code: string; id: string; description: string | null } | null;
  couponError: string | null;
  problems: string[];
};

type CouponRow = {
  id: string; code: string; description: string | null; kind: "percent" | "fixed"; value: number;
  max_discount_minor: string | null; min_subtotal_minor: string; starts_at: Date | null; ends_at: Date | null;
  usage_limit: number | null; per_customer_limit: number | null; first_order_only: boolean;
  exclude_sale_items: boolean; applies_to_product_ids: string[] | null; applies_to_collection_ids: string[] | null;
  is_active: boolean;
};

export function taxRateFor(unitNetMinor: number): number {
  for (const s of TAX.slabs) if (s.maxUnitPriceMinor === null || unitNetMinor <= s.maxUnitPriceMinor) return s.ratePercent;
  return TAX.slabs[TAX.slabs.length - 1].ratePercent;
}

export function shippingFor(methodId: string | undefined, subtotalAfterDiscount: number) {
  const method = SHIPPING_METHODS.find((m) => m.id === methodId) ?? SHIPPING_METHODS[0];
  const free = method.freeAboveMinor !== null && subtotalAfterDiscount >= method.freeAboveMinor;
  return { method, fee: subtotalAfterDiscount === 0 || free ? 0 : method.feeMinor };
}

async function evaluateCoupon(
  db: Db, code: string, lines: CartLine[], customer: { userId?: string | null; email?: string | null },
): Promise<{ coupon: CouponRow; eligible: boolean[] } | { error: string }> {
  const [c] = await db<CouponRow[]>`select * from coupons where code = ${code} and deleted_at is null`;
  const generic = "This code is not valid.";
  if (!c || !c.is_active) return { error: generic };
  const now = Date.now();
  if (c.starts_at && c.starts_at.getTime() > now) return { error: "This code is not active yet." };
  if (c.ends_at && c.ends_at.getTime() < now) return { error: "This code has expired." };
  if (c.usage_limit !== null) {
    const [u] = await db<{ n: number }[]>`select count(*)::int n from coupon_redemptions where coupon_id = ${c.id} and state <> 'released'`;
    if (u.n >= c.usage_limit) return { error: "This code has reached its usage limit." };
  }
  if (c.per_customer_limit !== null || c.first_order_only) {
    if (!customer.userId && !customer.email) return { error: "Enter your email at checkout to use this code." };
  }
  if (c.per_customer_limit !== null && (customer.userId || customer.email)) {
    const [u] = await db<{ n: number }[]>`select count(*)::int n from coupon_redemptions
      where coupon_id = ${c.id} and state <> 'released'
        and (user_id = ${customer.userId ?? null} or email = ${customer.email ?? null})`;
    if (u.n >= c.per_customer_limit) return { error: "You have already used this code." };
  }
  if (c.first_order_only && (customer.userId || customer.email)) {
    const [o] = await db<{ n: number }[]>`select count(*)::int n from orders
      where (user_id = ${customer.userId ?? null} or email = ${customer.email ?? null})
        and status not in ('pending_payment','payment_failed','cancelled')`;
    if (o.n > 0) return { error: "This code is for first orders only." };
  }
  let inCollections = new Set<string>();
  if (c.applies_to_collection_ids?.length) {
    const rows = await db<{ product_id: string }[]>`select product_id from collection_products
      where collection_id = any(${c.applies_to_collection_ids}::uuid[])`;
    inCollections = new Set(rows.map((r) => r.product_id));
  }
  const eligible = lines.map((l) => {
    if (c.exclude_sale_items && l.compareAtMinor) return false;
    const restricted = (c.applies_to_product_ids?.length ?? 0) > 0 || (c.applies_to_collection_ids?.length ?? 0) > 0;
    if (!restricted) return true;
    return (c.applies_to_product_ids ?? []).includes(l.productId) || inCollections.has(l.productId);
  });
  if (!eligible.some(Boolean)) return { error: "This code does not apply to the items in your bag." };
  return { coupon: c, eligible };
}

export async function quote(
  lines: CartLine[],
  opts: { couponCode?: string | null; shippingMethod?: string; userId?: string | null; email?: string | null },
  db: Db = sql,
): Promise<Quote> {
  const problems: string[] = [];
  for (const l of lines) {
    if (!l.purchasable) problems.push(`${l.name} (${l.size}) is no longer available.`);
    else if (l.quantity > l.available) {
      problems.push(l.available === 0 ? `${l.name} (${l.size}) is out of stock.` : `Only ${l.available} of ${l.name} (${l.size}) left.`);
    }
  }
  const subtotals = lines.map((l) => l.unitPriceMinor * l.quantity);
  const subtotal = subtotals.reduce((a, b) => a + b, 0);

  let discount = 0;
  let perLineDiscount = lines.map(() => 0);
  let coupon: Quote["coupon"] = null;
  let couponError: string | null = null;
  if (opts.couponCode) {
    const r = await evaluateCoupon(db, opts.couponCode, lines, { userId: opts.userId, email: opts.email });
    if ("error" in r) couponError = r.error;
    else {
      const eligibleSubtotal = subtotals.reduce((a, s, i) => a + (r.eligible[i] ? s : 0), 0);
      if (subtotal < Number(r.coupon.min_subtotal_minor)) {
        couponError = `Spend ₹${Number(r.coupon.min_subtotal_minor) / 100} or more to use this code.`;
      } else {
        discount = r.coupon.kind === "percent" ? percentOf(eligibleSubtotal, r.coupon.value) : r.coupon.value;
        if (r.coupon.max_discount_minor) discount = Math.min(discount, Number(r.coupon.max_discount_minor));
        discount = Math.min(discount, eligibleSubtotal);
        perLineDiscount = allocate(discount, subtotals.map((s, i) => (r.eligible[i] ? s : 0)));
        coupon = { code: r.coupon.code, id: r.coupon.id, description: r.coupon.description };
      }
    }
  }

  const quoted: QuoteLine[] = lines.map((l, i) => {
    const net = subtotals[i] - perLineDiscount[i];
    const rate = taxRateFor(Math.floor(net / l.quantity));
    return {
      ...l,
      lineSubtotalMinor: subtotals[i],
      discountMinor: perLineDiscount[i],
      taxRate: rate,
      taxMinor: TAX.inclusive ? inclusiveTax(net, rate) : percentOf(net, rate),
      lineTotalMinor: net,
    };
  });

  const afterDiscount = subtotal - discount;
  const { method, fee } = shippingFor(opts.shippingMethod, afterDiscount);
  const tax = quoted.reduce((a, l) => a + l.taxMinor, 0);
  const total = afterDiscount + fee + (TAX.inclusive ? 0 : tax);

  return {
    currency: "INR", lines: quoted, subtotalMinor: subtotal, discountMinor: discount, shippingMinor: fee,
    taxMinor: tax, taxInclusive: TAX.inclusive, totalMinor: total, shippingMethod: method, coupon, couponError, problems,
  };
}
