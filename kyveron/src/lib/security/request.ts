import "server-only";
import { headers } from "next/headers";
import { env } from "@/lib/env";

export async function clientIp(): Promise<string> {
  const h = await headers();
  // Trust the first hop set by the platform's proxy (Vercel, Fly, nginx).
  const fwd = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = fwd || h.get("x-real-ip") || "0.0.0.0";
  return /^[0-9a-f:.]{3,45}$/i.test(ip) ? ip : "0.0.0.0";
}

export async function userAgent(): Promise<string> {
  return ((await headers()).get("user-agent") ?? "").slice(0, 300);
}

/**
 * CSRF defence for route handlers that accept browser POSTs. Server Actions
 * already compare Origin with Host; route handlers must opt in. Cookies are
 * SameSite=Lax as a second layer.
 */
export function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const allowed = new URL(env().APP_URL).origin;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin) throw new Response("Missing origin", { status: 403 });
  const o = new URL(origin);
  if (o.origin !== allowed && o.host !== host) throw new Response("Cross-site request blocked", { status: 403 });
}

export function secureCookie() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env().APP_URL.startsWith("https://"),
    path: "/",
  };
}
