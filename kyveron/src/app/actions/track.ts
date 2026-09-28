"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { sql } from "@/lib/db";
import { clientIp } from "@/lib/security/request";
import { enforce, LIMITS, RateLimitError } from "@/lib/security/rate-limit";
import { grantOrderAccess } from "@/lib/orders/access";

export type TrackState = { message?: string } | undefined;

/**
 * Order lookup for guests: order number plus the email or mobile used at
 * checkout. On match the browser gets signed access to that order only.
 * The same generic message is returned for every mismatch.
 */
export async function trackOrder(_: TrackState, form: FormData): Promise<TrackState> {
  const parsed = z.object({
    orderNumber: z.string().trim().toUpperCase().regex(/^KV\d{4}-[0-9A-Z]{6}$/),
    contact: z.string().trim().min(5).max(254),
  }).safeParse({ orderNumber: form.get("orderNumber"), contact: form.get("contact") });
  const generic = { message: "We could not find an order with those details. Check the order number in your confirmation email." };
  if (!parsed.success) return generic;
  try {
    await enforce(LIMITS.track(await clientIp()));
  } catch (e) {
    if (e instanceof RateLimitError) return { message: e.message };
    throw e;
  }
  const { orderNumber, contact } = parsed.data;
  const phone = contact.replace(/[\s-]/g, "");
  const phoneNorm = /^(\+91|91|0)?[6-9]\d{9}$/.test(phone) ? `+91${phone.slice(-10)}` : null;
  const [o] = await sql<{ id: string }[]>`
    select id from orders where order_number = ${orderNumber}
      and (email = ${contact.toLowerCase()} or (${phoneNorm}::text is not null and phone = ${phoneNorm}))`;
  if (!o) return generic;
  await grantOrderAccess(o.id);
  redirect(`/track-order/${o.id}`);
}
