"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { retryPayment } from "@/app/actions/checkout";
import { launchPayment } from "./launchPayment";

export function RetryPayment({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const go = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const r = await retryPayment(orderId);
      if (!r.ok) return setError(r.message);
      const out = await launchPayment(r.session);
      if (out.kind === "redirect") return router.push(out.url);
      if (out.kind === "paid" || out.kind === "unverified") return router.push(`/order-confirmation/${orderId}`);
      if (out.kind === "failed") setError(out.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open payment.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mt-8">
      <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={go} disabled={busy} data-loading={busy}>
        <span className="btn-label">Try payment again</span>
      </button>
      {error && <p className="notice notice-error mt-4" role="alert">{error}</p>}
    </div>
  );
}
