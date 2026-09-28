import "server-only";
import { sql } from "@/lib/db";
import { mergeGuestCart } from "@/lib/cart";
import { consumeToken } from "./tokens";
import { touchAdminActivity } from "./session";

// Deliberately not in actions.ts: anything exported from a "use server" file
// becomes a publicly callable endpoint. These run only from trusted server code.

export async function afterSignIn(userId: string) {
  await mergeGuestCart(userId);
  const [staff] = await sql`select 1 from user_roles where user_id = ${userId} limit 1`;
  if (staff) await touchAdminActivity();
}

export async function verifyEmailToken(token: string): Promise<boolean> {
  const userId = await consumeToken(token, "verify_email");
  if (!userId) return false;
  await sql`update users set email_verified_at = coalesce(email_verified_at, now()) where id = ${userId}`;
  return true;
}
