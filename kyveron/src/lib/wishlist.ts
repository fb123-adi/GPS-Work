import "server-only";
import { cache } from "react";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export const wishedIds = cache(async (): Promise<Set<string>> => {
  const user = await getCurrentUser();
  if (!user) return new Set();
  const rows = await sql<{ product_id: string }[]>`
    select wi.product_id from wishlist_items wi join wishlists w on w.id = wi.wishlist_id where w.user_id = ${user.id}`;
  return new Set(rows.map((r) => r.product_id));
});
