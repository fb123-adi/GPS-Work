/**
 * Money helpers. Amounts are integers in minor units (paise for INR, cents for
 * USD). No floating-point arithmetic touches a stored amount; conversions for
 * display round once, at the edge.
 */
export type Minor = number;

export const CURRENCY_DECIMALS: Record<string, number> = {
  INR: 2, USD: 2, EUR: 2, GBP: 2, AED: 2, SGD: 2, JPY: 0,
};

export function assertMinor(n: number): Minor {
  if (!Number.isSafeInteger(n)) throw new Error(`Invalid minor amount: ${n}`);
  return n;
}

/** Percentage of an amount, rounded half-up to the nearest minor unit. */
export function percentOf(amount: Minor, percent: number): Minor {
  // percent may carry up to two decimals (e.g. 18.00); scale to integers.
  const bp = Math.round(percent * 100);
  return Math.floor((amount * bp + 5000) / 10000);
}

/** Tax contained in a tax-inclusive price: amount * r / (100 + r). */
export function inclusiveTax(amount: Minor, ratePercent: number): Minor {
  const bp = Math.round(ratePercent * 100);
  return Math.floor((amount * bp + (10000 + bp) / 2) / (10000 + bp));
}

/**
 * Splits a discount across lines in proportion to their totals so per-line
 * tax can be computed; remainder goes to the largest line.
 */
export function allocate(total: Minor, weights: Minor[]): Minor[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum === 0 || total === 0) return weights.map(() => 0);
  const parts = weights.map((w) => Math.floor((total * w) / sum));
  let rest = total - parts.reduce((a, b) => a + b, 0);
  const order = weights.map((w, i) => [w, i] as const).sort((a, b) => b[0] - a[0]);
  for (let k = 0; rest > 0; k = (k + 1) % order.length, rest--) parts[order[k][1]]++;
  return parts;
}

export function formatMoney(minor: Minor, currency = "INR", locale = "en-IN"): string {
  const decimals = CURRENCY_DECIMALS[currency] ?? 2;
  const major = minor / 10 ** decimals;
  const whole = Number.isInteger(major);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: whole ? 0 : decimals,
    maximumFractionDigits: decimals,
  }).format(major);
}

/** Converts an INR amount for display only. Never used to charge. */
export function convertForDisplay(inrMinor: Minor, rateFromInr: number, currency: string): Minor {
  const decimals = CURRENCY_DECIMALS[currency] ?? 2;
  // INR has 2 decimals; rescale if the target differs.
  const scaled = inrMinor * rateFromInr * 10 ** (decimals - 2);
  return Math.round(scaled);
}
