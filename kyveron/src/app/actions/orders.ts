"use server";

import { z } from "zod";
import { refresh } from "next/cache";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { canViewOrder } from "@/lib/orders/access";
import { transition } from "@/lib/orders/service";
import type { OrderStatus } from "@/lib/orders/state";

/** Customer cancellation: unpaid orders cancel immediately; paid orders become a request for staff. */
export async function requestCancellation(orderId: string, reason: string): Promise<{ ok: boolean; message: string }> {
  if (!z.string().uuid().safeParse(orderId).success) return { ok: false, message: "Order not found." };
  const [o] = await sql<{ id: string; user_id: string | null; status: OrderStatus }[]>`select id, user_id, status from orders where id = ${orderId}`;
  const user = await getCurrentUser();
  if (!o || !(await canViewOrder(o, user))) return { ok: false, message: "Order not found." };
  const note = z.string().trim().max(300).catch("").parse(reason) || "Requested by customer";
  try {
    if (o.status === "pending_payment" || o.status === "payment_failed") {
      await transition(o.id, "cancelled", "customer", { actorId: user?.id ?? null, note });
      refresh();
      return { ok: true, message: "Your order has been cancelled. Nothing was charged." };
    }
    await transition(o.id, "cancellation_requested", "customer", { actorId: user?.id ?? null, note });
    refresh();
    return { ok: true, message: "Cancellation requested. We will confirm by email, and refund your payment once it is cancelled." };
  } catch {
    return { ok: false, message: "This order can no longer be cancelled. Once it arrives you can return it." };
  }
}
