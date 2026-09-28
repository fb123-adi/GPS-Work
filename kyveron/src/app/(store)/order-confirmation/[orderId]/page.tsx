import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { canViewOrder } from "@/lib/orders/access";
import { getOrder } from "@/lib/orders/queries";
import { PAID_STATES } from "@/lib/orders/state";
import { OrderView } from "@/components/order/OrderView";
import { AutoRefresh } from "@/components/order/AutoRefresh";

export const metadata: Metadata = { title: "Order confirmation", robots: { index: false } };

/**
 * Viewable only by the signed-in owner or the browser that placed the order
 * (signed access cookie). Guessing an id returns a 404.
 */
export default async function ConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const [o, user] = await Promise.all([getOrder(orderId), getCurrentUser()]);
  if (!o || !(await canViewOrder(o, user))) notFound();
  const paid = PAID_STATES.includes(o.status);
  const waiting = o.status === "pending_payment" && o.payments.some((p) => p.status === "authorized" || p.status === "created");
  return (
    <div className="container-x max-w-5xl py-12 lg:py-16">
      {paid ? (
        <header className="mb-10">
          <p className="spec-line">ORDER {o.order_number}</p>
          <h1 className="display mt-3 text-[clamp(2rem,4vw,3.2rem)]">Thank you{o.shipping_address.fullName ? `, ${o.shipping_address.fullName.split(" ")[0]}` : ""}. Your order is confirmed.</h1>
          <p className="mt-4 max-w-xl text-ink-soft">A confirmation is on its way to {o.email}. We will email again with tracking when it ships.</p>
        </header>
      ) : (
        <header className="mb-10">
          <p className="spec-line">ORDER {o.order_number}</p>
          <h1 className="display mt-3 text-[clamp(2rem,4vw,3.2rem)]">{waiting ? "Confirming your payment" : "Payment not completed"}</h1>
          <p className="mt-4 max-w-xl text-ink-soft">
            {waiting
              ? "We are waiting for the payment provider to confirm. This page updates automatically. Please do not pay again."
              : "Nothing has been charged for this order. Your items are held for a short time."}
          </p>
          {waiting && <AutoRefresh seconds={5} max={24} />}
        </header>
      )}
      <OrderView o={o} />
      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/shop" className="btn btn-primary"><span className="btn-label">Continue shopping</span></Link>
        {user ? <Link href="/account/orders" className="btn btn-secondary"><span className="btn-label">Your orders</span></Link>
          : <Link href="/register" className="btn btn-secondary"><span className="btn-label">Create an account</span></Link>}
      </div>
    </div>
  );
}
