import Link from "next/link";
import type { ReactNode } from "react";

/** Shared admin primitives: page header, panels, stat, table, status pill, pager. */
export function PageHeader({ title, actions, sub }: { title: string; actions?: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {sub && <div className="mt-1 text-sm text-ink-soft">{sub}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, children, actions, className = "" }: { title?: string; children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <section className={`border border-line bg-white ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          {actions}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Stat({ label, value, note }: { label: string; value: ReactNode; note?: ReactNode }) {
  return (
    <div className="border border-line bg-white px-4 py-4">
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      {note && <p className="mt-1 text-xs text-ink-soft">{note}</p>}
    </div>
  );
}

export function Table({ head, children, empty }: { head: ReactNode[]; children: ReactNode; empty?: string }) {
  return (
    <div className="overflow-x-auto border border-line bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-[#f3f0ea] text-xs text-ink-soft">
          <tr>{head.map((h, i) => <th key={i} scope="col" className="whitespace-nowrap px-3 py-2.5 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
      {empty && <p className="px-3 py-8 text-center text-sm text-ink-soft">{empty}</p>}
    </div>
  );
}

const TONES: Record<string, string> = {
  good: "border-success/40 bg-[#eef6f1] text-success",
  warn: "border-[#b7791f]/40 bg-[#fdf6e7] text-[#8a5a12]",
  bad: "border-danger/40 bg-[#fbf1ef] text-danger",
  info: "border-cobalt/40 bg-[#eef2fa] text-cobalt",
  muted: "border-line-strong bg-[#f3f0ea] text-ink-soft",
};

export function Pill({ tone = "muted", children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return <span className={`inline-flex items-center whitespace-nowrap border px-1.5 py-0.5 text-xs ${TONES[tone]}`}>{children}</span>;
}

export function statusTone(s: string): keyof typeof TONES {
  if (["paid", "confirmed", "delivered", "published", "captured", "processed", "refunded", "resolved"].includes(s)) return "good";
  if (["payment_failed", "cancelled", "payment_disputed", "failed", "rejected", "archived"].includes(s)) return "bad";
  if (["pending_payment", "cancellation_requested", "return_requested", "refund_pending", "draft", "pending", "open", "requested"].includes(s)) return "warn";
  return "info";
}

export function Pager({ page, pages, href }: { page: number; pages: number; href: (p: number) => string }) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center gap-2 text-sm">
      {page > 1 && <Link className="btn btn-secondary btn-sm" href={href(page - 1)}>Previous</Link>}
      <span className="text-ink-soft">Page {page} of {pages}</span>
      {page < pages && <Link className="btn btn-secondary btn-sm" href={href(page + 1)}>Next</Link>}
    </nav>
  );
}

export function Denied() {
  return <p className="notice">Your role does not include access to this section.</p>;
}
