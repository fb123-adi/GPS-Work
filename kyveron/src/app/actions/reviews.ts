"use server";

import { z } from "zod";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { enforce, LIMITS, RateLimitError } from "@/lib/security/rate-limit";

export type ReviewState = { ok?: boolean; message?: string; errors?: Record<string, string> } | undefined;

const schema = z.object({
  productId: z.string().uuid(),
  rating: z.coerce.number().int().min(1, "Choose a rating.").max(5),
  title: z.string().trim().max(80).optional(),
  body: z.string().trim().min(20, "Write at least 20 characters.").max(2000),
  fit: z.enum(["runs_small", "true_to_size", "runs_large", ""]).optional(),
});

export async function submitReview(_: ReviewState, form: FormData): Promise<ReviewState> {
  const user = await getCurrentUser();
  if (!user) return { message: "Please sign in to write a review." };
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { errors };
  }
  try {
    await enforce(LIMITS.review(user.id));
  } catch (e) {
    if (e instanceof RateLimitError) return { message: e.message };
    throw e;
  }
  const d = parsed.data;
  const [purchase] = await sql<{ id: string }[]>`
    select oi.id from order_items oi join orders o on o.id = oi.order_id
    where o.user_id = ${user.id} and oi.product_id = ${d.productId} and o.status = 'delivered' limit 1`;
  const r = await sql`
    insert into reviews (product_id, user_id, order_item_id, rating, title, body, fit_feedback, is_verified_purchase)
    values (${d.productId}, ${user.id}, ${purchase?.id ?? null}, ${d.rating}, ${d.title || null}, ${d.body}, ${d.fit || null}, ${!!purchase})
    on conflict (product_id, user_id) do nothing returning id`;
  if (!r.length) return { message: "You have already reviewed this product." };
  return { ok: true, message: "Thank you. Your review will appear after a quick check, usually within a day." };
}

export async function voteReview(reviewId: string, helpful: boolean) {
  const user = await getCurrentUser();
  if (!user || !z.string().uuid().safeParse(reviewId).success) return { ok: false };
  await sql`insert into review_votes (review_id, user_id, helpful) values (${reviewId}, ${user.id}, ${helpful})
    on conflict (review_id, user_id) do update set helpful = excluded.helpful`;
  return { ok: true };
}
