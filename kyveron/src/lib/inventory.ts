import "server-only";
import { sql } from "@/lib/db";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { templates } from "@/lib/email/templates";
import { audit } from "@/lib/audit";

export async function notifyBackInStock(variantId: string) {
  const reqs = await sql<{ id: string; email: string; name: string; slug: string }[]>`
    select b.id, b.email, p.name, p.slug from back_in_stock_requests b
    join product_variants v on v.id = b.variant_id join products p on p.id = v.product_id
    where b.variant_id = ${variantId} and b.notified_at is null and v.stock_on_hand - v.reserved > 0 and p.status = 'published' limit 500`;
  for (const r of reqs) {
    await sendEmail({ to: r.email, ...templates.backInStock(r.name, `${env().APP_URL}/products/${r.slug}`), dedupeKey: `bis:${r.id}` });
    await sql`update back_in_stock_requests set notified_at = now() where id = ${r.id}`;
  }
}


/**
 * Adjusts on-hand stock with a reason, atomically, never below what is
 * reserved or below zero, and logs the movement.
 */
export async function adjustStock(variantId: string, delta: number, reason: string, note: string | null, actorId: string) {
  const r = await sql.begin(async (tx) => {
    const [v] = await tx<{ stock_on_hand: number; reserved: number }[]>`
      update product_variants set stock_on_hand = stock_on_hand + ${delta}
      where id = ${variantId} and stock_on_hand + ${delta} >= reserved and stock_on_hand + ${delta} >= 0
      returning stock_on_hand, reserved`;
    if (!v) throw new Error("That would take stock below zero or below what is reserved for open checkouts.");
    await tx`insert into inventory_movements (variant_id, delta, reason, note, actor_id, stock_after)
      values (${variantId}, ${delta}, ${reason}, ${note}, ${actorId}, ${v.stock_on_hand})`;
    await audit(actorId, "inventory.adjust", "variant", variantId, { after: { delta, reason, note, stock: v.stock_on_hand } }, tx);
    return v;
  });
  if (delta > 0) await notifyBackInStock(variantId);
  return r;
}
