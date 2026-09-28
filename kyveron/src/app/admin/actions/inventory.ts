"use server";

import { z } from "zod";
import { refresh } from "next/cache";
import { requirePermission } from "@/lib/auth/guards";
import { adjustStock } from "@/lib/inventory";

const schema = z.object({
  variantId: z.string().uuid(),
  delta: z.coerce.number().int().refine((n) => n !== 0 && Math.abs(n) <= 10000, "Enter a non-zero amount."),
  reason: z.enum(["restock", "adjustment", "damaged", "return", "correction"]),
  note: z.string().trim().max(300).optional(),
});

export async function adjustInventory(input: unknown): Promise<{ ok: boolean; message: string }> {
  const user = await requirePermission("inventory.adjust");
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const d = parsed.data;
  try {
    const v = await adjustStock(d.variantId, d.delta, d.reason, d.note || null, user.id);
    refresh();
    return { ok: true, message: `Stock now ${v.stock_on_hand}.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Adjustment failed." };
  }
}
