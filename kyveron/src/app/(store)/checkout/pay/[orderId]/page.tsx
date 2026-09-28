import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { canViewOrder } from "@/lib/orders/access";
import { formatMoney } from "@/lib/money";
import { STATUS_LABEL, type OrderStatus } from "@/lib/orders/state";
import { RetryPayment } from "@/components/checkout/RetryPayment";

export const metadata: Metadata = { title: "Complete payment", robots: { index: false } };

export default async function PayPage({ params, searchParams }: { params: Promise<{ orderId: string }>; searchParams: Promise<{ cancelled?: string; failed?: string }> }) {
  const [{ orderId }, sp] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f-]{36}$/.test(orderId)) notFound();
  const [o] = await sql<{ id: string; user_id: string | null; order_number: string; status: OrderStatus; total_minor: string; reservation_expires_at: Date | null }[]>`
    select id, user_id, order_number, status, total_minor, reservation_expires_at from orders where id = ${orderId}`;
  if (!o || !(await canViewOrder(o, await getCurrentUser()))) notFound();
  if (!["pending_payment", "payment_failed"].includes(o.status)) redirect(`/order-confirmation/${o.id}`);
  return (
    <div className="container-x max-w-xl py-16">
      <h1 className="display text-[clamp(1.8rem,3vw,2.4rem)]">{sp.failed || o.status === "payment_failed" ? "Your payment did not go through" : "Complete your payment"}</h1>
      <p className="mt-4 text-ink-soft">
        Order <strong className="text-obsidian">{o.order_number}</strong> · {STATUS_LABEL[o.status]} · {formatMoney(Number(o.total_minor))}.{" "}
        {sp.cancelled ? "You closed the payment window, so nothing was charged." : "No money has been taken for this order."} If your bank shows a debit, it will be confirmed here or reversed automatically.
      </p>
      <p className="mt-3 text-sm text-ink-soft">
        We are holding your items{o.reservation_expires_at ? ` until ${o.reservation_expires_at.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })} IST` : " while stock lasts"}. Retrying uses the same order; you will not be charged twice.
      </p>
      <RetryPayment orderId={o.id} />
      <p className="mt-8 text-sm"><Link href="/cart" className="link">Back to bag</Link> · <Link href="/contact" className="link">Contact us</Link></p>
    </div>
  );
}
