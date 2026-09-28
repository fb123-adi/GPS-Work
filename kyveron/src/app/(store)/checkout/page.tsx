import type { Metadata } from "next";
import Link from "next/link";
import { sql } from "@/lib/db";
import { drivers, env } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";
import { quoteCheckout } from "@/app/actions/checkout";
import { findCartId } from "@/lib/cart";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const [summary, user] = await Promise.all([quoteCheckout({ shippingMethod: "standard", couponCode: null }), getCurrentUser()]);
  if (!summary) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="display text-3xl">Your bag is empty</h1>
        <p className="mt-3 text-ink-soft">Add something to your bag to check out.</p>
        <Link href="/shop" className="btn btn-primary mt-8"><span className="btn-label">Continue shopping</span></Link>
      </div>
    );
  }
  // Carry over a code applied in the bag.
  const cartId = await findCartId();
  const [cart] = cartId ? await sql<{ coupon_code: string | null }[]>`select coupon_code from carts where id = ${cartId}` : [];
  const withCoupon = cart?.coupon_code ? await quoteCheckout({ shippingMethod: "standard", couponCode: cart.coupon_code }) : summary;
  const saved = user
    ? await sql<{ id: string; label: string | null; fullName: string; phone: string; line1: string; line2: string | null; landmark: string | null; city: string; state: string; postalCode: string }[]>`
        select id, label, full_name as "fullName", phone, line1, line2, landmark, city, state, postal_code as "postalCode"
        from addresses where user_id = ${user.id} and deleted_at is null order by is_default desc, created_at desc limit 6`
    : [];
  return (
    <div className="container-x py-10 lg:py-14">
      <h1 className="display mb-10 text-[clamp(1.8rem,3vw,2.6rem)]">Checkout</h1>
      <CheckoutForm initial={withCoupon ?? summary} user={user ? { email: user.email, name: user.fullName } : null} saved={saved}
        codEnabled={env().COD_ENABLED === "true"} mockPayments={drivers().payments === "mock"} />
    </div>
  );
}
