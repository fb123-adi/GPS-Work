/** Minimal className combiner (no runtime deps). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Format a price in GBP for the storefront. Swap currency per-locale later. */
export function formatPrice(amount: number, currency = "GBP", locale = "en-GB"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
