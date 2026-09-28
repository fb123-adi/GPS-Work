import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env";
import { secureCookie } from "@/lib/security/request";
import type { CurrentUser } from "@/lib/auth/session";

/**
 * Guest order access. After checkout (or verified tracking) the browser gets
 * a signed, httpOnly cookie listing the order ids it may view. Knowing or
 * guessing an order id is never enough on its own.
 */
const COOKIE = "kv_orders";
const key = () => new TextEncoder().encode(env().SESSION_SECRET);

async function readIds(): Promise<string[]> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return [];
  try {
    const { payload } = await jwtVerify(raw, key(), { audience: "order-access" });
    return Array.isArray(payload.ids) ? (payload.ids as string[]) : [];
  } catch {
    return [];
  }
}

export async function grantOrderAccess(orderId: string) {
  const ids = [orderId, ...(await readIds()).filter((i) => i !== orderId)].slice(0, 12);
  const jwt = await new SignJWT({ ids })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience("order-access")
    .setExpirationTime("30d")
    .sign(key());
  (await cookies()).set(COOKIE, jwt, { ...secureCookie(), maxAge: 30 * 86400 });
}

export async function canViewOrder(order: { id: string; user_id: string | null }, user: CurrentUser | null) {
  if (user && order.user_id === user.id) return true;
  return (await readIds()).includes(order.id);
}
