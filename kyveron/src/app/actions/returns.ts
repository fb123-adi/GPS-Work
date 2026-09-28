"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { canViewOrder } from "@/lib/orders/access";
import { transition } from "@/lib/orders/service";
import { RETURNS } from "@/lib/config/store";
import { returnEligibility } from "@/lib/returns";
import { storeImage, UploadError } from "@/lib/storage";
import { enforce, LIMITS, RateLimitError } from "@/lib/security/rate-limit";
import { clientIp } from "@/lib/security/request";

export type ReturnState = { ok?: boolean; message?: string; errors?: Record<string, string> } | undefined;

const schema = z.object({
  orderId: z.string().uuid(),
  kind: z.enum(["return", "exchange"]),
  reason: z.string().refine((r) => RETURNS.reasons.includes(r), "Choose a reason."),
  details: z.string().trim().max(1000).optional(),
  resolution: z.enum(["original_payment", "store_credit", "exchange"]),
});

export async function createReturn(_: ReturnState, form: FormData): Promise<ReturnState> {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { errors };
  }
  const d = parsed.data;
  const user = await getCurrentUser();
  const [o] = await sql<{ id: string; user_id: string | null }[]>`select id, user_id from orders where id = ${d.orderId}`;
  if (!o || !(await canViewOrder(o, user))) return { message: "Order not found." };
  try {
    await enforce(LIMITS.upload(user ? `u:${user.id}` : `ip:${await clientIp()}`));
  } catch (e) {
    if (e instanceof RateLimitError) return { message: e.message };
    throw e;
  }
  const elig = await returnEligibility(o.id);
  if (!elig.eligible) return { message: elig.reason };
  if (d.kind === "exchange" && d.resolution !== "exchange") return { errors: { resolution: "Exchanges are resolved with a replacement." } };

  const items = await sql<{ id: string; quantity: number; returned_quantity: number }[]>`
    select id, quantity, returned_quantity from order_items where order_id = ${o.id}`;
  const picked = items
    .map((i) => ({ id: i.id, qty: Math.trunc(Number(form.get(`qty_${i.id}`) ?? 0)), max: i.quantity - i.returned_quantity }))
    .filter((i) => i.qty > 0);
  if (!picked.length) return { errors: { items: "Choose at least one item." } };
  if (picked.some((p) => p.qty > p.max)) return { errors: { items: "You chose more than you can return for one of the items." } };

  const files = form.getAll("evidence").filter((f): f is File => f instanceof File && f.size > 0).slice(0, 3);
  const paths: string[] = [];
  try {
    for (const f of files) paths.push((await storeImage(f, "returns")).path);
  } catch (e) {
    if (e instanceof UploadError) return { errors: { evidence: e.message } };
    throw e;
  }

  await sql.begin(async (tx) => {
    const [r] = await tx<{ id: string }[]>`
      insert into returns (order_id, user_id, kind, reason, details, resolution, evidence_paths)
      values (${o.id}, ${user?.id ?? o.user_id}, ${d.kind}, ${d.reason}, ${d.details || null}, ${d.resolution}, ${paths})
      returning id`;
    for (const p of picked) {
      await tx`insert into return_items (return_id, order_item_id, quantity) values (${r.id}, ${p.id}, ${p.qty})`;
    }
  });
  await transition(o.id, "return_requested", "customer", { actorId: user?.id ?? null, note: `${d.kind === "exchange" ? "Exchange" : "Return"}: ${d.reason}` });
  return { ok: true, message: "Request received. We will email pickup details within one working day. Keep the tags on." };
}

export async function lookupForReturn(_: ReturnState, form: FormData): Promise<ReturnState> {
  const orderNumber = String(form.get("orderNumber") ?? "").trim().toUpperCase();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!/^KV\d{4}-[0-9A-Z]{6}$/.test(orderNumber) || !email.includes("@")) return { message: "Check the order number and email." };
  try {
    await enforce(LIMITS.track(await clientIp()));
  } catch (e) {
    if (e instanceof RateLimitError) return { message: e.message };
    throw e;
  }
  const [o] = await sql<{ id: string }[]>`select id from orders where order_number = ${orderNumber} and email = ${email}`;
  if (!o) return { message: "We could not find an order with those details." };
  const { grantOrderAccess } = await import("@/lib/orders/access");
  await grantOrderAccess(o.id);
  redirect(`/returns?order=${orderNumber}`);
}
