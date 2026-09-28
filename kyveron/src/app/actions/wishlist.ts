"use server";

import { z } from "zod";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { addToCart } from "@/lib/cart";

export type WishResult = { ok: boolean; wished?: boolean; needsLogin?: boolean; error?: string };

async function wishlistId(userId: string) {
  const [w] = await sql<{ id: string }[]>`insert into wishlists (user_id) values (${userId})
    on conflict (user_id) do update set user_id = excluded.user_id returning id`;
  return w.id;
}

export async function toggleWishlist(productId: string): Promise<WishResult> {
  if (!z.string().uuid().safeParse(productId).success) return { ok: false, error: "Unknown product" };
  const user = await getCurrentUser();
  if (!user) return { ok: false, needsLogin: true };
  const id = await wishlistId(user.id);
  const removed = await sql`delete from wishlist_items where wishlist_id = ${id} and product_id = ${productId} returning 1`;
  if (removed.length) return { ok: true, wished: false };
  const [p] = await sql`select 1 from products where id = ${productId} and status = 'published' and deleted_at is null`;
  if (!p) return { ok: false, error: "This product is no longer available." };
  await sql`insert into wishlist_items (wishlist_id, product_id) values (${id}, ${productId}) on conflict do nothing`;
  return { ok: true, wished: true };
}

export async function moveWishToCart(productId: string, variantId: string): Promise<WishResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, needsLogin: true };
  try {
    await addToCart(variantId, 1);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not add to bag." };
  }
  const id = await wishlistId(user.id);
  await sql`delete from wishlist_items where wishlist_id = ${id} and product_id = ${productId}`;
  return { ok: true, wished: false };
}
