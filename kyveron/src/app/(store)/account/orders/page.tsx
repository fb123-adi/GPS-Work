import Link from "next/link";
import { withUserRls } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { formatMoney } from "@/lib/money";
import { STATUS_LABEL, type OrderStatus } from "@/lib/orders/state";

export default async function OrdersPage() {
  const user = await requireUser("/account/orders");
  // Read through row-level security as this customer (defence in depth).
  const orders = await withUserRls(user.id, (tx) => tx<{ id: string; order_number: string; status: OrderStatus; total_minor: string; created_at: Date; items: number }[]>`
    select o.id, o.order_number, o.status, o.total_minor, o.created_at,
      (select coalesce(sum(quantity), 0)::int from order_items i where i.order_id = o.id) as items
    from orders o order by o.created_at desc limit 100`);
  return (
    <div>
      <h1 className="display mb-8 text-[clamp(1.8rem,3vw,2.6rem)]">Orders</h1>
      {orders.length === 0 ? <p className="text-ink-soft">You have not placed an order yet. <Link href="/shop" className="link">Browse the shop</Link></p> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead><tr className="border-b border-obsidian"><th className="py-2 font-semibold">Order</th><th className="font-semibold">Placed</th><th className="font-semibold">Items</th><th className="font-semibold">Status</th><th className="text-right font-semibold">Total</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-line">
                  <td className="py-4"><Link href={`/account/orders/${o.id}`} className="link font-medium">{o.order_number}</Link></td>
                  <td>{o.created_at.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td>{o.items}</td><td>{STATUS_LABEL[o.status]}</td>
                  <td className="text-right tabular-nums">{formatMoney(Number(o.total_minor))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
