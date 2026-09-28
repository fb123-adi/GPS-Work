"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

type Est = { ok: true; methods: { id: string; label: string; from: string; to: string }[]; note: string } | { ok: false; error: string };

export function DeliveryEstimate() {
  const [pin, setPin] = useState("");
  const [est, setEst] = useState<Est | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Restore a remembered PIN after hydration (browser-only storage).
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("kv_pin");
    } catch {
      saved = null;
    }
    if (saved && /^[1-9]\d{5}$/.test(saved)) queueMicrotask(() => setPin(saved!));
  }, []);

  const check = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/delivery-estimate?pin=${encodeURIComponent(pin)}`);
      const data = (await res.json()) as Est;
      setEst(data);
      if (data.ok) localStorage.setItem("kv_pin", pin);
    } catch {
      setEst({ ok: false, error: "Could not check right now. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 border-t border-line pt-6">
      <form onSubmit={check} className="grid gap-2">
        <label htmlFor="pdp-pin" className="flex items-center gap-2 text-sm font-medium"><Icon name="truck" size={18} /> Check delivery date</label>
        <div className="flex gap-2">
          <input id="pdp-pin" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="postal-code"
            placeholder="6-digit PIN code" className="input" aria-describedby="pdp-pin-out" />
          <button className="btn btn-secondary" disabled={loading || pin.length !== 6} data-loading={loading}><span className="btn-label">Check</span></button>
        </div>
      </form>
      <div id="pdp-pin-out" aria-live="polite" className="mt-3 text-sm">
        {est && !est.ok && <p className="field-error">{est.error}</p>}
        {est && est.ok && (
          <>
            <ul className="space-y-1">
              {est.methods.map((m) => <li key={m.id} className="flex justify-between gap-4"><span>{m.label}</span><span className="tabular-nums">{m.from} to {m.to}</span></li>)}
            </ul>
            <p className="mt-2 text-ink-soft">{est.note}</p>
          </>
        )}
      </div>
    </div>
  );
}
