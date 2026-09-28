import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { canViewOrder } from "@/lib/orders/access";
import { getOrder } from "@/lib/orders/queries";
import { isCancellableByCustomer } from "@/lib/orders/state";
import { OrderView } from "@/components/order/OrderView";
import { CancelOrderButton } from "@/components/order/CancelOrderButton";

export const metadata: Metadata = { title: "Order status", robots: { index: false } };

export default async function TrackedOrder({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const [o, user] = await Promise.all([getOrder(orderId), getCurrentUser()]);
  if (!o || !(await canViewOrder(o, user))) notFound();
  return (
    <div className="container-x max-w-5xl py-12 lg:py-16">
      <p className="spec-line">ORDER {o.order_number}</p>
      <h1 className="display mb-8 mt-3 text-[clamp(1.8rem,3vw,2.6rem)]">Order status</h1>
      <OrderView o={o} />
      <div className="mt-10 flex flex-wrap gap-3">
        {isCancellableByCustomer(o.status) && <CancelOrderButton orderId={o.id} />}
        {o.status === "delivered" && <Link href={`/returns?order=${o.order_number}`} className="btn btn-secondary"><span className="btn-label">Start a return</span></Link>}
      </div>
    </div>
  );
}
