import { SHIPPING_METHODS, WAREHOUSE_PIN } from "@/lib/config/store";

/**
 * Delivery estimate from a PIN code. This is a zone heuristic (first digits
 * of the PIN relative to the dispatch warehouse), not a courier lookup.
 * TODO(owner): replace with your courier's serviceability API (e.g.
 * Shiprocket, Delhivery) once an account exists.
 */
export type Estimate =
  | { ok: true; pin: string; methods: { id: string; label: string; from: string; to: string }[]; note: string }
  | { ok: false; error: string };

// Remote / special-handling postal circles: J&K, Ladakh, North East, Andaman, Lakshadweep.
const REMOTE_PREFIX = ["18", "19", "79", "74", "73", "682"];

function addWorkingDays(from: Date, days: number) {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) added++;
  }
  return d;
}

export function estimateDelivery(pin: string, now = new Date()): Estimate {
  if (!/^[1-9]\d{5}$/.test(pin)) return { ok: false, error: "Enter a valid 6-digit PIN code." };
  const sameRegion = pin[0] === WAREHOUSE_PIN[0];
  const sameCity = pin.slice(0, 3) === WAREHOUSE_PIN.slice(0, 3);
  const remote = REMOTE_PREFIX.some((p) => pin.startsWith(p));
  const extra = remote ? 3 : sameCity ? -1 : sameRegion ? 0 : 1;
  const cutoff = now.getHours() >= 14 ? 1 : 0;
  const fmt = (d: Date) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  return {
    ok: true,
    pin,
    methods: SHIPPING_METHODS.filter((m) => !(remote && m.id === "express")).map((m) => ({
      id: m.id,
      label: m.label,
      from: fmt(addWorkingDays(now, Math.max(1, m.daysMin + extra + cutoff))),
      to: fmt(addWorkingDays(now, Math.max(1, m.daysMax + extra + cutoff))),
    })),
    note: remote ? "Remote PIN: express is unavailable and delivery may take longer." : "Estimate only. Your exact date is confirmed when the order ships.",
  };
}
