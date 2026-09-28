"use server";

import { z } from "zod";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guards";
import { STAFF_ROLES } from "@/lib/auth/roles";
import { audit } from "@/lib/audit";
import { transition } from "@/lib/orders/service";
import { adjustStock } from "@/lib/inventory";

type R = { ok: boolean; message: string };
const uuid = z.string().uuid();
const err = (e: unknown): R => ({ ok: false, message: e instanceof Error ? e.message : "Action failed." });

/* ------------------------------ Returns ------------------------------ */

const RETURN_FLOW: Record<string, string[]> = {
  requested: ["approved", "rejected"],
  approved: ["received", "rejected"],
  received: ["refunded", "exchanged", "closed"],
  refunded: ["closed"], exchanged: ["closed"], rejected: ["closed"], closed: [],
};

export async function updateReturn(returnId: string, to: string, note: string, restock: boolean): Promise<R> {
  try {
    const user = await requirePermission("returns.manage");
    if (!uuid.safeParse(returnId).success) return { ok: false, message: "Invalid return." };
    const [r] = await sql<{ status: string; order_id: string }[]>`select status, order_id from returns where id = ${returnId}`;
    if (!r || !RETURN_FLOW[r.status]?.includes(to)) return { ok: false, message: "That change is not allowed from the current state." };
    await sql`update returns set status = ${to}, staff_note = ${note.slice(0, 500) || null} where id = ${returnId}`;
    if (to === "received") {
      const items = await sql<{ order_item_id: string; quantity: number; variant_id: string | null }[]>`
        select ri.order_item_id, ri.quantity, oi.variant_id from return_items ri join order_items oi on oi.id = ri.order_item_id where ri.return_id = ${returnId}`;
      for (const it of items) {
        await sql`update order_items set returned_quantity = least(quantity, returned_quantity + ${it.quantity}) where id = ${it.order_item_id}`;
        if (restock && it.variant_id) await adjustStock(it.variant_id, it.quantity, "return", `Return ${returnId.slice(0, 8)}`, user.id);
      }
      await transition(r.order_id, "returned", "staff", { actorId: user.id, note: "Return received" }).catch(() => {});
    }
    if (to === "rejected") await transition(r.order_id, "delivered", "staff", { actorId: user.id, note: note || "Return not approved" }).catch(() => {});
    await audit(user.id, "return.status", "return", returnId, { before: { status: r.status }, after: { status: to, note, restock } });
    refresh();
    return { ok: true, message: `Marked ${to}.` + (to === "received" ? " Use the order page to issue the refund." : "") };
  } catch (e) {
    return err(e);
  }
}

/* ------------------------------ Discounts ------------------------------ */

const couponSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,32}$/, "Code: 3-32 letters, numbers, dashes."),
  description: z.string().trim().max(200).optional(),
  kind: z.enum(["percent", "fixed"]),
  value: z.coerce.number().positive(),
  maxDiscount: z.union([z.literal(""), z.coerce.number().positive()]),
  minSubtotal: z.union([z.literal(""), z.coerce.number().min(0)]),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  usageLimit: z.union([z.literal(""), z.coerce.number().int().positive()]),
  perCustomerLimit: z.union([z.literal(""), z.coerce.number().int().positive()]),
  firstOrderOnly: z.string().optional(),
  excludeSale: z.string().optional(),
  isActive: z.string().optional(),
});

export async function saveCoupon(_: unknown, form: FormData): Promise<{ ok?: boolean; message?: string }> {
  const user = await requirePermission("discounts.manage");
  const parsed = couponSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { message: parsed.error.issues[0].message };
  const d = parsed.data;
  if (d.kind === "percent" && d.value > 90) return { message: "Percentage discounts are capped at 90%." };
  const products = form.getAll("products").map(String).filter((x) => uuid.safeParse(x).success);
  const collections = form.getAll("collections").map(String).filter((x) => uuid.safeParse(x).success);
  const date = (s?: string) => (s ? new Date(s) : null);
  if (d.startsAt && d.endsAt && date(d.endsAt)! <= date(d.startsAt)!) return { message: "End date must be after the start date." };
  const values = {
    code: d.code, description: d.description || null, kind: d.kind,
    value: d.kind === "percent" ? Math.round(d.value) : Math.round(d.value * 100),
    max_discount_minor: d.maxDiscount === "" ? null : Math.round(d.maxDiscount * 100),
    min_subtotal_minor: d.minSubtotal === "" ? 0 : Math.round(d.minSubtotal * 100),
    starts_at: date(d.startsAt), ends_at: date(d.endsAt),
    usage_limit: d.usageLimit === "" ? null : d.usageLimit, per_customer_limit: d.perCustomerLimit === "" ? null : d.perCustomerLimit,
    first_order_only: d.firstOrderOnly === "on", exclude_sale_items: d.excludeSale === "on", is_active: d.isActive === "on",
    applies_to_product_ids: products.length ? products : null, applies_to_collection_ids: collections.length ? collections : null,
  };
  try {
    if (d.id) {
      const [before] = await sql`select * from coupons where id = ${d.id}`;
      await sql`update coupons set ${sql(values)} where id = ${d.id}`;
      await audit(user.id, "coupon.update", "coupon", d.id, { before, after: values });
    } else {
      const [row] = await sql<{ id: string }[]>`insert into coupons ${sql({ ...values, created_by: user.id })} returning id`;
      await audit(user.id, "coupon.create", "coupon", row.id, { after: values });
    }
  } catch (e) {
    return { message: e instanceof Error && /unique/i.test(e.message) ? "That code already exists." : "Could not save." };
  }
  redirect("/admin/discounts?saved=1");
}

export async function archiveCoupon(id: string): Promise<R> {
  try {
    const user = await requirePermission("discounts.manage");
    await sql`update coupons set deleted_at = now(), is_active = false where id = ${id}`;
    await audit(user.id, "coupon.archive", "coupon", id);
    refresh();
    return { ok: true, message: "Archived." };
  } catch (e) {
    return err(e);
  }
}

/* ------------------------------ Reviews & tickets ------------------------------ */

export async function moderateReview(id: string, status: "published" | "rejected"): Promise<R> {
  try {
    const user = await requirePermission("reviews.moderate");
    await sql`update reviews set status = ${status} where id = ${id}`;
    await audit(user.id, `review.${status}`, "review", id);
    refresh();
    return { ok: true, message: status === "published" ? "Published." : "Rejected." };
  } catch (e) {
    return err(e);
  }
}

export async function updateTicket(id: string, status: string): Promise<R> {
  try {
    const user = await requirePermission("tickets.manage");
    if (!["open", "pending", "resolved", "closed"].includes(status)) return { ok: false, message: "Invalid status." };
    await sql`update contact_tickets set status = ${status}, assigned_to = coalesce(assigned_to, ${user.id}) where id = ${id}`;
    await audit(user.id, "ticket.status", "ticket", id, { after: { status } });
    refresh();
    return { ok: true, message: "Updated." };
  } catch (e) {
    return err(e);
  }
}

/* ------------------------------ Staff ------------------------------ */

export async function setStaffRole(email: string, role: string, grant: boolean): Promise<R> {
  try {
    const user = await requirePermission("staff.manage");
    if (!(STAFF_ROLES as readonly string[]).includes(role)) return { ok: false, message: "Unknown role." };
    const [target] = await sql<{ id: string }[]>`select id from users where email = ${email.trim().toLowerCase()} and deleted_at is null`;
    if (!target) return { ok: false, message: "No account with that email. The person must register first." };
    if (!grant && target.id === user.id && role === "super_admin") {
      const [{ n }] = await sql<{ n: number }[]>`select count(*)::int n from user_roles where role = 'super_admin'`;
      if (n <= 1) return { ok: false, message: "You are the last super admin. Grant another before removing yourself." };
    }
    if (grant) await sql`insert into user_roles (user_id, role, granted_by) values (${target.id}, ${role}, ${user.id}) on conflict do nothing`;
    else await sql`delete from user_roles where user_id = ${target.id} and role = ${role}`;
    await audit(user.id, grant ? "staff.grant" : "staff.revoke", "user", target.id, { after: { role, email } });
    refresh();
    return { ok: true, message: grant ? `Granted ${role}.` : `Removed ${role}.` };
  } catch (e) {
    return err(e);
  }
}
