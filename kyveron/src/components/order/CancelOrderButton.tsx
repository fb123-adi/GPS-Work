"use client";

import { useRef, useState, useTransition } from "react";
import { requestCancellation } from "@/app/actions/orders";

/** Destructive action with an explicit confirmation step. */
export function CancelOrderButton({ orderId }: { orderId: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();
  if (result?.ok) return <p className="notice notice-success" role="status">{result.message}</p>;
  return (
    <>
      <button type="button" className="btn btn-danger" onClick={() => ref.current?.showModal()}>Cancel order</button>
      <dialog ref={ref} className="m-auto w-[min(440px,calc(100vw-32px))] border border-obsidian bg-ivory p-6 backdrop:bg-obsidian/40" aria-labelledby="cancel-h">
        <h2 id="cancel-h" className="text-lg font-semibold">Cancel this order?</h2>
        <p className="mt-2 text-sm text-ink-soft">If you have paid, your refund goes back to the original payment method once the cancellation is confirmed.</p>
        <label htmlFor="cancel-reason" className="mt-4 block text-sm font-medium">Reason (optional)</label>
        <textarea id="cancel-reason" className="textarea mt-1 !min-h-20" maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
        {result && !result.ok && <p className="field-error mt-2" role="alert">{result.message}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={() => ref.current?.close()}>Keep order</button>
          <button type="button" className="btn btn-danger" disabled={pending} data-loading={pending}
            onClick={() => start(async () => { const r = await requestCancellation(orderId, reason); setResult(r); if (r.ok) ref.current?.close(); })}>
            <span className="btn-label">Yes, cancel</span>
          </button>
        </div>
      </dialog>
    </>
  );
}
