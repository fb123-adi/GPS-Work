import "server-only";
import { sql } from "@/lib/db";
import { findCartId, loadLines } from "@/lib/cart";
import { quote } from "@/lib/pricing";
import { getCurrentUser } from "@/lib/auth/session";

/** JSON-safe cart summary for the drawer and cart page. All numbers come from the server quote. */
export type CartView = {
  count: number;
  lines: {
    variantId: string; slug: string; name: string; size: string; colour: string; imageUrl: string | null; imageAlt: string | null;
    quantity: number; unitPriceMinor: number; compareAtMinor: number | null; lineTotalMinor: number; available: number; purchasable: boolean;
  }[];
  subtotalMinor: number;
  discountMinor: number;
  shippingMinor: number;
  taxMinor: number;
  totalMinor: number;
  couponCode: string | null;
  couponError: string | null;
  freeShippingRemainingMinor: number | null;
  problems: string[];
};

export async function buildCartView(shippingMethod = "standard"): Promise<CartView> {
  const cartId = await findCartId();
  const empty: CartView = {
    count: 0, lines: [], subtotalMinor: 0, discountMinor: 0, shippingMinor: 0, taxMinor: 0, totalMinor: 0,
    couponCode: null, couponError: null, freeShippingRemainingMinor: null, problems: [],
  };
  if (!cartId) return empty;
  const [cart] = await sql<{ coupon_code: string | null }[]>`select coupon_code from carts where id = ${cartId}`;
  const lines = await loadLines(cartId);
  if (!lines.length) return { ...empty, couponCode: cart?.coupon_code ?? null };
  const user = await getCurrentUser();
  const q = await quote(lines, { couponCode: cart?.coupon_code, shippingMethod, userId: user?.id, email: user?.email });
  const threshold = q.shippingMethod.freeAboveMinor;
  const after = q.subtotalMinor - q.discountMinor;
  return {
    count: lines.reduce((a, l) => a + l.quantity, 0),
    lines: q.lines.map((l) => ({
      variantId: l.variantId, slug: l.slug, name: l.name, size: l.size, colour: l.colour, imageUrl: l.imageUrl, imageAlt: l.imageAlt,
      quantity: l.quantity, unitPriceMinor: l.unitPriceMinor, compareAtMinor: l.compareAtMinor, lineTotalMinor: l.lineTotalMinor,
      available: l.available, purchasable: l.purchasable,
    })),
    subtotalMinor: q.subtotalMinor, discountMinor: q.discountMinor, shippingMinor: q.shippingMinor, taxMinor: q.taxMinor,
    totalMinor: q.totalMinor, couponCode: q.coupon?.code ?? cart?.coupon_code ?? null, couponError: q.couponError,
    freeShippingRemainingMinor: threshold !== null && after < threshold ? threshold - after : null,
    problems: q.problems,
  };
}
