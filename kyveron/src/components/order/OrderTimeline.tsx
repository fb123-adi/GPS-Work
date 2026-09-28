import { STATUS_LABEL, TIMELINE, type OrderStatus } from "@/lib/orders/state";

const EXCEPTIONS: OrderStatus[] = ["cancellation_requested", "cancelled", "return_requested", "returned", "refund_pending", "refunded", "payment_disputed", "payment_failed", "pending_payment"];

/** Customer-facing timeline: the happy path, with exception states listed as they happened. */
export function OrderTimeline({ status, history }: { status: OrderStatus; history: { to_status: OrderStatus; created_at: Date; note: string | null }[] }) {
  const reached = new Map<OrderStatus, Date>();
  for (const h of history) if (!reached.has(h.to_status)) reached.set(h.to_status, h.created_at);
  const idx = Math.max(-1, ...TIMELINE.map((s, i) => (reached.has(s) || s === status ? i : -1)));
  const exceptions = history.filter((h) => EXCEPTIONS.includes(h.to_status) && h.to_status !== "pending_payment");
  const fmt = (d: Date) => d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });

  return (
    <div>
      <ol className="grid gap-0 sm:grid-cols-5" aria-label="Order progress">
        {TIMELINE.map((s, i) => {
          const done = i <= idx;
          return (
            <li key={s} className="relative flex gap-3 pb-6 sm:block sm:pb-0" aria-current={s === status ? "step" : undefined}>
              <span className="relative flex flex-col items-center sm:flex-row">
                <span className={`z-[1] h-3 w-3 flex-none border ${done ? "border-obsidian bg-obsidian" : "border-line-strong bg-ivory"}`} aria-hidden="true" />
                {i < TIMELINE.length - 1 && <span className={`absolute left-[5px] top-3 h-full w-px sm:left-3 sm:top-[5px] sm:h-px sm:w-full ${i < idx ? "bg-obsidian" : "bg-line"}`} aria-hidden="true" />}
              </span>
              <span className="sm:mt-3 sm:block">
                <span className={`block text-sm ${done ? "font-medium" : "text-ink-soft"}`}>{STATUS_LABEL[s]}</span>
                {reached.get(s) && <span className="block text-xs text-ink-soft">{fmt(reached.get(s)!)}</span>}
                <span className="sr-only">{done ? "(completed)" : "(pending)"}</span>
              </span>
            </li>
          );
        })}
      </ol>
      {exceptions.length > 0 && (
        <ul className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
          {exceptions.map((h, i) => (
            <li key={i} className="flex flex-wrap justify-between gap-2">
              <span className="font-medium">{STATUS_LABEL[h.to_status]}{h.note ? <span className="font-normal text-ink-soft">: {h.note}</span> : null}</span>
              <span className="text-ink-soft">{fmt(h.created_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
