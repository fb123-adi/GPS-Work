import "server-only";
import { drivers, env } from "@/lib/env";

/**
 * Verifies a Cloudflare Turnstile token. Without keys configured, falls back
 * to honeypot + rate limiting only (callers still enforce both).
 */
export async function verifyCaptcha(token: string | null | undefined, ip: string): Promise<boolean> {
  if (drivers().captcha === "none") return true;
  if (!token) return false;
  const body = new URLSearchParams({ secret: env().TURNSTILE_SECRET_KEY!, response: token, remoteip: ip });
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

import { HONEYPOT_FIELD } from "./honeypot";
export { HONEYPOT_FIELD };

export function isBot(form: FormData): boolean {
  return Boolean(String(form.get(HONEYPOT_FIELD) ?? "").trim());
}
