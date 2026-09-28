import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { getOrder } from "@/lib/orders/queries";
import { isCancellableByCustomer } from "@/lib/orders/state";
import { OrderView } from "@/components/order/OrderView";
import { CancelOrderButton } from "@/components/order/CancelOrderButton";

export default async function AccountOrder({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("/account/orders");
  const o = await getOrder((await params).id);
  if (!o || o.user_id !== user.id) notFound();
  return (
    <div>
      <Link href="/account/orders" className="link text-sm">All orders</Link>
      <h1 className="display mb-8 mt-3 text-[clamp(1.6rem,2.6vw,2.2rem)]">Order {o.order_number}</h1>
      <OrderView o={o} />
      <div className="mt-10 flex flex-wrap gap-3">
        {isCancellableByCustomer(o.status) && <CancelOrderButton orderId={o.id} />}
        {o.status === "delivered" && <Link href={`/returns?order=${o.order_number}`} className="btn btn-secondary"><span className="btn-label">Return or exchange</span></Link>}
      </div>
    </div>
  );
}
