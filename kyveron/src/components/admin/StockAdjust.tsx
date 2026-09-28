"use client";

import { useState, useTransition } from "react";
import { adjustInventory } from "@/app/admin/actions/inventory";

export function StockAdjust({ variantId, sku }: { variantId: string; sku: string }) {
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("restock");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();
  if (!open) return <button type="button" className="text-xs text-cobalt hover:underline" onClick={() => setOpen(true)}>Adjust</button>;
  return (
    <form className="flex flex-wrap items-center gap-1.5" onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await adjustInventory({ variantId, delta, reason, note }); setMsg(r); if (r.ok) { setDelta(""); setNote(""); } }); }}>
      <label className="sr-only" htmlFor={`d-${variantId}`}>Change for {sku}</label>
      <input id={`d-${variantId}`} value={delta} onChange={(e) => setDelta(e.target.value.replace(/[^\d-]/g, ""))} placeholder="+10 / -2" className="w-20 border border-line-strong px-2 py-1 text-xs" />
      <select aria-label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} className="border border-line-strong px-1 py-1 text-xs">
        <option value="restock">Restock</option><option value="adjustment">Count adjustment</option><option value="damaged">Damaged</option><option value="return">Customer return</option><option value="correction">Correction</option>
      </select>
      <input aria-label="Note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" className="w-28 border border-line-strong px-2 py-1 text-xs" maxLength={300} />
      <button className="btn btn-primary btn-sm !min-h-7 text-xs" disabled={pending || !delta}>Save</button>
      <button type="button" className="text-xs text-ink-soft" onClick={() => { setOpen(false); setMsg(null); }}>Close</button>
      {msg && <span className={`w-full text-xs ${msg.ok ? "text-success" : "text-danger"}`} role="status">{msg.message}</span>}
    </form>
  );
}
