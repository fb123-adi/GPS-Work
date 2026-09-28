import "server-only";
import { sql } from "@/lib/db";
import { RETURNS } from "@/lib/config/store";

/** Return window starts at delivery (status history), not at order date. */
export async function returnEligibility(orderId: string) {
  const [o] = await sql<{ status: string; delivered_at: Date | null }[]>`
    select o.status, (select min(created_at) from order_status_history h where h.order_id = o.id and h.to_status = 'delivered') as delivered_at
    from orders o where o.id = ${orderId}`;
  if (!o) return { eligible: false, reason: "Order not found." };
  if (o.status !== "delivered") return { eligible: false, reason: o.status === "return_requested" ? "A return is already open for this order." : "Returns open once your order is delivered." };
  const days = o.delivered_at ? (Date.now() - o.delivered_at.getTime()) / 86400000 : 0;
  if (days > RETURNS.windowDays) return { eligible: false, reason: `The ${RETURNS.windowDays}-day return window for this order has closed.` };
  return { eligible: true, daysLeft: Math.max(0, Math.ceil(RETURNS.windowDays - days)) };
}

