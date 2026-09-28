"use client";

import { useActionState, useState } from "react";
import { createReturn, lookupForReturn } from "@/app/actions/returns";
import { SubmitButton } from "@/components/ui/SubmitButton";

type Item = { id: string; name: string; size: string; colour: string; max: number };

export function ReturnLookup() {
  const [s, action] = useActionState(lookupForReturn, undefined);
  return (
    <form action={action} className="grid max-w-md gap-4 border border-line bg-surface p-6">
      <h2 className="font-semibold">Find your order</h2>
      <div className="field"><label htmlFor="rl-order">Order number</label><input id="rl-order" name="orderNumber" className="input uppercase" placeholder="KV2609-7QK3MX" required /></div>
      <div className="field"><label htmlFor="rl-email">Email used at checkout</label><input id="rl-email" name="email" type="email" className="input" autoComplete="email" required /></div>
      {s?.message && <p className="notice notice-error" role="alert">{s.message}</p>}
      <SubmitButton>Continue</SubmitButton>
    </form>
  );
}

export function ReturnForm({ orderId, items, reasons }: { orderId: string; items: Item[]; reasons: string[] }) {
  const [s, action] = useActionState(createReturn, undefined);
  const [kind, setKind] = useState<"return" | "exchange">("return");
  if (s?.ok) return <p className="notice notice-success" role="status">{s.message}</p>;
  return (
    <form action={action} className="grid max-w-2xl gap-6" encType="multipart/form-data">
      <input type="hidden" name="orderId" value={orderId} />
      <fieldset>
        <legend className="mb-3 font-semibold">What would you like to do?</legend>
        <div className="flex gap-2">
          {(["return", "exchange"] as const).map((k) => (
            <label key={k} className={`chip cursor-pointer ${kind === k ? "!bg-obsidian !text-ivory" : ""}`}>
              <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
              {k === "return" ? "Return for a refund" : "Exchange for another size"}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 font-semibold">Which items?</legend>
        <ul className="divide-y divide-line border-y border-line">
          {items.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span><span className="font-medium">{i.name}</span><br /><span className="text-ink-soft">{i.colour} · {i.size}</span></span>
              <label className="flex items-center gap-2">Quantity
                <select name={`qty_${i.id}`} className="select !w-20" defaultValue="0" disabled={i.max === 0}>
                  {Array.from({ length: i.max + 1 }, (_, n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
            </li>
          ))}
        </ul>
        {s?.errors?.items && <p className="field-error mt-2">{s.errors.items}</p>}
      </fieldset>
      <div className="field">
        <label htmlFor="rt-reason">Reason</label>
        <select id="rt-reason" name="reason" className="select" defaultValue=""><option value="">Choose a reason</option>{reasons.map((r) => <option key={r}>{r}</option>)}</select>
        {s?.errors?.reason && <p className="field-error">{s.errors.reason}</p>}
      </div>
      <div className="field">
        <label htmlFor="rt-details">Anything we should know? <span className="font-normal text-ink-soft">(optional)</span></label>
        <textarea id="rt-details" name="details" className="textarea" maxLength={1000} />
      </div>
      <div className="field">
        <label htmlFor="rt-evidence">Photos <span className="font-normal text-ink-soft">(optional, up to 3, JPEG/PNG/WebP, 8 MB each)</span></label>
        <input id="rt-evidence" name="evidence" type="file" accept="image/jpeg,image/png,image/webp" multiple className="text-sm" />
        {s?.errors?.evidence && <p className="field-error">{s.errors.evidence}</p>}
      </div>
      <fieldset>
        <legend className="mb-3 font-semibold">How should we resolve it?</legend>
        {kind === "exchange" ? (
          <><input type="hidden" name="resolution" value="exchange" /><p className="text-sm text-ink-soft">We will send the new size once your return is picked up. Tell us the size you want in the note above.</p></>
        ) : (
          <div className="grid gap-2 text-sm">
            <label className="flex items-start gap-3"><input type="radio" name="resolution" value="original_payment" defaultChecked className="mt-1 accent-obsidian" /> Refund to the original payment method (5 to 7 working days after we receive it)</label>
            <label className="flex items-start gap-3"><input type="radio" name="resolution" value="store_credit" className="mt-1 accent-obsidian" /> Store credit</label>
          </div>
        )}
        {s?.errors?.resolution && <p className="field-error mt-2">{s.errors.resolution}</p>}
      </fieldset>
      {s?.message && !s.ok && <p className="notice notice-error" role="alert">{s.message}</p>}
      <div><SubmitButton>Submit request</SubmitButton></div>
    </form>
  );
}
