"use server";

import { z } from "zod";
import { refresh } from "next/cache";
import { sql } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guards";
import { audit } from "@/lib/audit";
import { orderEmailData, transition } from "@/lib/orders/service";
import { initiateRefund } from "@/lib/payments/service";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders/state";
import { sendEmail } from "@/lib/email";
import { templates } from "@/lib/email/templates";

export type AdminResult = { ok: boolean; message: string };

const id = z.string().uuid();

function fail(e: unknown): AdminResult {
  return { ok: false, message: e instanceof Error ? e.message : "Action failed." };
}

export async function changeStatus(orderId: string, to: string, note: string): Promise<AdminResult> {
  try {
    const perm = to === "cancelled" ? "orders.cancel" : "orders.fulfil";
    const user = await requirePermission(perm);
    if (!id.safeParse(orderId).success || !(ORDER_STATUSES as readonly string[]).includes(to)) return { ok: false, message: "Invalid request." };
    const from = await transition(orderId, to as OrderStatus, "staff", { actorId: user.id, note: note.slice(0, 500) || null });
    await audit(user.id, "order.status", "order", orderId, { before: { status: from }, after: { status: to, note } });
    refresh();
    return { ok: true, message: "Status updated." };
  } catch (e) {
    return fail(e);
  }
}

const shipmentSchema = z.object({
  courier: z.string().trim().min(2).max(60),
  trackingNumber: z.string().trim().min(3).max(60).regex(/^[A-Za-z0-9-]+$/, "Letters, numbers, and dashes only."),
  trackingUrl: z.union([z.literal(""), z.string().url().refine((u) => u.startsWith("https://"), "Use an https link.")]),
});

export async function addShipment(orderId: string, input: unknown): Promise<AdminResult> {
  try {
    const user = await requirePermission("orders.fulfil");
    const d = shipmentSchema.parse(input);
    if (!id.safeParse(orderId).success) return { ok: false, message: "Invalid order." };
    const [o] = await sql<{ status: OrderStatus }[]>`select status from orders where id = ${orderId}`;
    if (!o || !["packed", "processing", "confirmed"].includes(o.status)) return { ok: false, message: "Pack the order before adding a shipment." };
    await sql`insert into shipments (order_id, courier, tracking_number, tracking_url, shipped_at, created_by)
      values (${orderId}, ${d.courier}, ${d.trackingNumber}, ${d.trackingUrl || null}, now(), ${user.id})`;
    if (o.status !== "packed") {
      if (o.status === "confirmed") await transition(orderId, "processing", "staff", { actorId: user.id });
      await transition(orderId, "packed", "staff", { actorId: user.id });
    }
    await transition(orderId, "shipped", "staff", { actorId: user.id, note: `${d.courier} ${d.trackingNumber}` });
    const data = await orderEmailData(orderId);
    await sendEmail({ to: data.email, ...templates.shipped(data, d.courier, d.trackingNumber, d.trackingUrl || null), dedupeKey: `shipped:${orderId}:${d.trackingNumber}` });
    await audit(user.id, "order.shipment", "order", orderId, { after: d });
    refresh();
    return { ok: true, message: "Shipment added and customer notified." };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, message: e.issues[0].message };
    return fail(e);
  }
}

export async function refundOrder(orderId: string, amountRupees: string, reason: string, idempotencyKey: string): Promise<AdminResult> {
  try {
    const user = await requirePermission("orders.refund");
    const amount = Math.round(Number(amountRupees) * 100);
    if (!id.safeParse(orderId).success || !Number.isFinite(amount) || amount <= 0) return { ok: false, message: "Enter a valid amount." };
    if (!z.string().uuid().safeParse(idempotencyKey).success) return { ok: false, message: "Refresh and try again." };
    const cleanReason = reason.trim().slice(0, 300) || "Refund";
    const r = await initiateRefund(orderId, amount, cleanReason, user.id, idempotencyKey);
    await audit(user.id, "order.refund", "order", orderId, { after: { amountMinor: r.amountMinor, refundId: r.refundId, reason: cleanReason } });
    refresh();
    return { ok: true, message: r.mock ? "Refund simulated (test mode)." : "Refund submitted to Razorpay. Status updates arrive by webhook." };
  } catch (e) {
    return fail(e);
  }
}

export async function addNote(orderId: string, body: string): Promise<AdminResult> {
  try {
    const user = await requirePermission("orders.note");
    const text = body.trim().slice(0, 2000);
    if (!id.safeParse(orderId).success || !text) return { ok: false, message: "Write a note first." };
    await sql`insert into order_notes (order_id, author_id, body) values (${orderId}, ${user.id}, ${text})`;
    await audit(user.id, "order.note", "order", orderId);
    refresh();
    return { ok: true, message: "Note added." };
  } catch (e) {
    return fail(e);
  }
}

export async function clearReviewFlag(orderId: string): Promise<AdminResult> {
  try {
    const user = await requirePermission("orders.fulfil");
    await sql`update orders set needs_review = false where id = ${orderId}`;
    await audit(user.id, "order.review_cleared", "order", orderId);
    refresh();
    return { ok: true, message: "Flag cleared." };
  } catch (e) {
    return fail(e);
  }
}
