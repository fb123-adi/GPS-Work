import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { BASE_CURRENCY, COUNTRIES, CURRENCIES, type CurrencyCode } from "@/lib/config/store";
import { convertForDisplay, formatMoney } from "@/lib/money";

export const CURRENCY_COOKIE = "kv_currency";
export const COUNTRY_COOKIE = "kv_country";

export type PriceFormatter = {
  currency: CurrencyCode;
  country: string;
  approximate: boolean;
  format: (inrMinor: number) => string;
};

/**
 * Display currency for this request. Prices are always converted on the
 * server from INR catalogue prices using stored rates; the browser never
 * computes or submits a converted price. Checkout charges INR.
 */
export const getPriceFormatter = cache(async (): Promise<PriceFormatter> => {
  const store = await cookies();
  const wanted = store.get(CURRENCY_COOKIE)?.value as CurrencyCode | undefined;
  const country = COUNTRIES.find((c) => c.code === store.get(COUNTRY_COOKIE)?.value)?.code ?? "IN";
  const cfg = CURRENCIES.find((c) => c.code === wanted) ?? CURRENCIES[0];
  if (cfg.code === BASE_CURRENCY) {
    return { currency: "INR", country, approximate: false, format: (m) => formatMoney(m, "INR", "en-IN") };
  }
  const [rate] = await sql<{ rate_from_inr: string }[]>`select rate_from_inr from exchange_rates where currency = ${cfg.code}`;
  if (!rate) return { currency: "INR", country, approximate: false, format: (m) => formatMoney(m, "INR", "en-IN") };
  const r = Number(rate.rate_from_inr);
  return {
    currency: cfg.code,
    country,
    approximate: true,
    format: (m) => `≈ ${formatMoney(convertForDisplay(m, r, cfg.code), cfg.code, cfg.locale)}`,
  };
});
