import type { Metadata } from "next";
import Link from "next/link";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { canViewOrder } from "@/lib/orders/access";
import { returnEligibility } from "@/lib/returns";
import { RETURNS } from "@/lib/config/store";
import { ReturnForm, ReturnLookup } from "@/components/returns/ReturnForms";

export const metadata: Metadata = { title: "Returns and exchanges", description: "Start a return or size exchange within 14 days of delivery." };

const STATUS: Record<string, string> = { requested: "Requested", approved: "Approved, pickup scheduled", rejected: "Not approved", received: "Received, checking", refunded: "Refunded", exchanged: "Exchange sent", closed: "Closed" };

export default async function ReturnsPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const [{ order }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const orderNumber = order?.toUpperCase().match(/^KV\d{4}-[0-9A-Z]{6}$/)?.[0];
  let selected: { id: string; order_number: string } | null = null;
  if (orderNumber) {
    const [o] = await sql<{ id: string; order_number: string; user_id: string | null }[]>`select id, order_number, user_id from orders where order_number = ${orderNumber}`;
    if (o && (await canViewOrder(o, user))) selected = o;
  }
  const eligibleOrders = user ? await sql<{ order_number: string; created_at: Date }[]>`
    select order_number, created_at from orders where user_id = ${user.id} and status = 'delivered' order by created_at desc limit 10` : [];
  const requests = user ? await sql<{ id: string; order_number: string; kind: string; status: string; created_at: Date }[]>`
    select r.id, o.order_number, r.kind, r.status, r.created_at from returns r join orders o on o.id = r.order_id
    where r.user_id = ${user.id} order by r.created_at desc limit 20` : [];

  let body: React.ReactNode;
  if (selected) {
    const elig = await returnEligibility(selected.id);
    const items = await sql<{ id: string; product_name: string; size: string; colour: string; quantity: number; returned_quantity: number }[]>`
      select id, product_name, size, colour, quantity, returned_quantity from order_items where order_id = ${selected.id}`;
    body = elig.eligible ? (
      <>
        <p className="mb-6 text-sm text-ink-soft">Order {selected.order_number} · {elig.daysLeft} {elig.daysLeft === 1 ? "day" : "days"} left in your return window.</p>
        <ReturnForm orderId={selected.id} reasons={RETURNS.reasons} items={items.map((i) => ({ id: i.id, name: i.product_name, size: i.size, colour: i.colour, max: i.quantity - i.returned_quantity }))} />
      </>
    ) : <p className="notice">{elig.reason}</p>;
  } else if (user) {
    body = eligibleOrders.length ? (
      <ul className="divide-y divide-line border-y border-line">
        {eligibleOrders.map((o) => (
          <li key={o.order_number} className="flex items-center justify-between py-4 text-sm">
            <span><span className="font-medium">{o.order_number}</span> · {o.created_at.toLocaleDateString("en-IN")}</span>
            <Link href={`/returns?order=${o.order_number}`} className="btn btn-secondary btn-sm">Start return</Link>
          </li>
        ))}
      </ul>
    ) : <p className="text-ink-soft">No delivered orders are eligible right now.</p>;
  } else {
    body = <ReturnLookup />;
  }

  return (
    <div className="container-x grid gap-12 py-12 lg:grid-cols-[1fr_1.4fr] lg:py-16">
      <div>
        <h1 className="display text-[clamp(2rem,4vw,3.2rem)]">Returns and exchanges</h1>
        <div className="mt-6 space-y-3 text-[0.9375rem] text-[#2b2a27]">
          <p>You can return or exchange items within <strong className="font-medium">{RETURNS.windowDays} days of delivery</strong> if they are unworn, unwashed, and have their tags attached.</p>
          <p>Not returnable: {RETURNS.exclusions.join("; ").toLowerCase()}.</p>
          <p>We arrange a pickup from your delivery address. Refunds go back to the original payment method within 5 to 7 working days of us receiving the item.</p>
          <p><Link href="/legal/returns-policy" className="link">Full returns policy</Link></p>
        </div>
        {requests.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-3 font-semibold">Your requests</h2>
            <ul className="divide-y divide-line border-y border-line text-sm">
              {requests.map((r) => (
                <li key={r.id} className="flex justify-between gap-4 py-3"><span>{r.order_number} · {r.kind === "exchange" ? "Exchange" : "Return"}</span><span className="text-ink-soft">{STATUS[r.status] ?? r.status}</span></li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div>{body}</div>
    </div>
  );
}
