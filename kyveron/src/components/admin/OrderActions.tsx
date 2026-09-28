"use client";

import { useRef, useState, useTransition } from "react";
import { addNote, addShipment, changeStatus, clearReviewFlag, refundOrder, type AdminResult } from "@/app/admin/actions/orders";
import { STATUS_LABEL, type OrderStatus } from "@/lib/orders/state";

function Result({ r }: { r: AdminResult | null }) {
  if (!r) return null;
  return <p className={`mt-2 text-sm ${r.ok ? "text-success" : "text-danger"}`} role={r.ok ? "status" : "alert"}>{r.message}</p>;
}

const DESTRUCTIVE: OrderStatus[] = ["cancelled", "refunded"];

/** Only transitions the state machine allows for staff are offered; the server re-checks. */
export function StatusControls({ orderId, next }: { orderId: string; next: OrderStatus[] }) {
  const [note, setNote] = useState("");
  const [r, setR] = useState<AdminResult | null>(null);
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState<OrderStatus | null>(null);
  if (next.length === 0) return <p className="text-sm text-ink-soft">No further status changes available.</p>;
  const go = (to: OrderStatus) => start(async () => { setR(await changeStatus(orderId, to, note)); setConfirming(null); setNote(""); });
  return (
    <div>
      <label htmlFor="st-note" className="text-xs text-ink-soft">Note (optional, recorded in history)</label>
      <input id="st-note" value={note} onChange={(e) => setNote(e.target.value)} className="input mt-1 !min-h-10 text-sm" maxLength={500} />
      <div className="mt-3 flex flex-wrap gap-2">
        {next.filter((s) => s !== "shipped").map((s) => (
          DESTRUCTIVE.includes(s) ? (
            confirming === s ? (
              <span key={s} className="flex items-center gap-2 border border-danger px-2 py-1 text-sm">
                Confirm {STATUS_LABEL[s].toLowerCase()}?
                <button type="button" className="btn btn-danger btn-sm" disabled={pending} onClick={() => go(s)}>Yes</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConfirming(null)}>No</button>
              </span>
            ) : <button key={s} type="button" className="btn btn-danger btn-sm" disabled={pending} onClick={() => setConfirming(s)}>Mark {STATUS_LABEL[s].toLowerCase()}</button>
          ) : <button key={s} type="button" className="btn btn-secondary btn-sm" disabled={pending} onClick={() => go(s)}>Mark {STATUS_LABEL[s].toLowerCase()}</button>
        ))}
      </div>
      <Result r={r} />
    </div>
  );
}

export function ShipmentForm({ orderId }: { orderId: string }) {
  const [r, setR] = useState<AdminResult | null>(null);
  const [pending, start] = useTransition();
  return (
    <form className="grid gap-2 sm:grid-cols-3" onSubmit={(e) => {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      start(async () => setR(await addShipment(orderId, Object.fromEntries(f))));
    }}>
      <div className="field"><label htmlFor="sh-c" className="!text-xs">Courier</label><input id="sh-c" name="courier" className="input !min-h-10 text-sm" list="couriers" required /></div>
      <datalist id="couriers"><option>Delhivery</option><option>Blue Dart</option><option>DTDC</option><option>Ecom Express</option><option>Xpressbees</option><option>India Post</option><option>Shiprocket</option></datalist>
      <div className="field"><label htmlFor="sh-t" className="!text-xs">Tracking number</label><input id="sh-t" name="trackingNumber" className="input !min-h-10 text-sm" required /></div>
      <div className="field"><label htmlFor="sh-u" className="!text-xs">Tracking link (optional)</label><input id="sh-u" name="trackingUrl" type="url" className="input !min-h-10 text-sm" placeholder="https://" /></div>
      <div className="sm:col-span-3"><button className="btn btn-primary btn-sm" disabled={pending} data-loading={pending}><span className="btn-label">Mark shipped and notify customer</span></button><Result r={r} /></div>
    </form>
  );
}

export function RefundForm({ orderId, remainingRupees }: { orderId: string; remainingRupees: number }) {
  const [amount, setAmount] = useState(remainingRupees.toFixed(2));
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [r, setR] = useState<AdminResult | null>(null);
  const [pending, start] = useTransition();
  const key = useRef(crypto.randomUUID());
  if (remainingRupees <= 0) return <p className="text-sm text-ink-soft">Nothing left to refund.</p>;
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <div className="field"><label htmlFor="rf-a" className="!text-xs">Amount (₹, max {remainingRupees.toFixed(2)})</label>
          <input id="rf-a" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" className="input !min-h-10 !w-40 text-sm" /></div>
        <div className="field flex-1"><label htmlFor="rf-r" className="!text-xs">Reason</label><input id="rf-r" value={reason} onChange={(e) => setReason(e.target.value)} className="input !min-h-10 text-sm" maxLength={300} /></div>
      </div>
      {!confirm ? (
        <button type="button" className="btn btn-danger btn-sm justify-self-start" onClick={() => setConfirm(true)} disabled={!Number(amount)}>Refund ₹{Number(amount || 0).toFixed(2)}</button>
      ) : (
        <div className="flex items-center gap-2 text-sm">
          This sends money back to the customer through the payment provider. Continue?
          <button type="button" className="btn btn-danger btn-sm" disabled={pending} data-loading={pending}
            onClick={() => start(async () => { const res = await refundOrder(orderId, amount, reason, key.current); setR(res); setConfirm(false); if (res.ok) key.current = crypto.randomUUID(); })}>
            <span className="btn-label">Confirm refund</span>
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConfirm(false)}>Cancel</button>
        </div>
      )}
      <Result r={r} />
    </div>
  );
}

export function NoteForm({ orderId }: { orderId: string }) {
  const [body, setBody] = useState("");
  const [r, setR] = useState<AdminResult | null>(null);
  const [pending, start] = useTransition();
  return (
    <form onSubmit={(e) => { e.preventDefault(); start(async () => { const res = await addNote(orderId, body); setR(res); if (res.ok) setBody(""); }); }}>
      <label htmlFor="note" className="sr-only">Internal note</label>
      <textarea id="note" value={body} onChange={(e) => setBody(e.target.value)} className="textarea !min-h-20 text-sm" placeholder="Visible to staff only" maxLength={2000} />
      <button className="btn btn-secondary btn-sm mt-2" disabled={pending || !body.trim()}>Add note</button>
      <Result r={r} />
    </form>
  );
}

export function ClearReview({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition();
  return <button type="button" className="btn btn-secondary btn-sm" disabled={pending} onClick={() => start(async () => { await clearReviewFlag(orderId); })}>Mark reviewed</button>;
}
