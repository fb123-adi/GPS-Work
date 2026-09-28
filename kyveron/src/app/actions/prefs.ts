"use server";

import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { COUNTRIES, CURRENCIES } from "@/lib/config/store";
import { COUNTRY_COOKIE, CURRENCY_COOKIE } from "@/lib/currency";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { POLICY_VERSION } from "@/lib/config/store";
import { clientIp, userAgent } from "@/lib/security/request";

export async function setRegion(form: FormData) {
  const currency = String(form.get("currency") ?? "");
  const country = String(form.get("country") ?? "");
  const store = await cookies();
  const opts = { path: "/", sameSite: "lax" as const, maxAge: 365 * 86400 };
  if (CURRENCIES.some((c) => c.code === currency)) store.set(CURRENCY_COOKIE, currency, opts);
  if (COUNTRIES.some((c) => c.code === country)) store.set(COUNTRY_COOKIE, country, opts);
  const user = await getCurrentUser();
  if (user) {
    await sql`update profiles set preferred_currency = ${CURRENCIES.find((c) => c.code === currency)?.code ?? "INR"},
      preferred_country = ${COUNTRIES.find((c) => c.code === country)?.code ?? "IN"} where user_id = ${user.id}`;
  }
  refresh();
}

/** Cookie consent. Necessary cookies are always on; analytics/marketing are opt-in and logged. */
export async function saveCookieConsent(choice: { analytics: boolean; marketing: boolean }) {
  const store = await cookies();
  let anon = store.get("kv_cid")?.value;
  if (!anon || !/^[a-f0-9-]{36}$/.test(anon)) {
    anon = crypto.randomUUID();
    store.set("kv_cid", anon, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 365 * 86400 });
  }
  const value = `v=${POLICY_VERSION}&a=${choice.analytics ? 1 : 0}&m=${choice.marketing ? 1 : 0}`;
  store.set("kv_consent", value, { path: "/", sameSite: "lax", maxAge: 180 * 86400 });
  const user = await getCurrentUser();
  const ip = await clientIp();
  const ua = await userAgent();
  for (const [purpose, granted] of [["cookies_analytics", choice.analytics], ["cookies_marketing", choice.marketing]] as const) {
    await sql`insert into consent_records (user_id, subject, purpose, granted, policy_version, source, ip, user_agent)
      values (${user?.id ?? null}, ${user?.email ?? anon}, ${purpose}, ${granted}, ${POLICY_VERSION}, 'cookie_banner', ${ip}, ${ua})`;
  }
  return { ok: true };
}
