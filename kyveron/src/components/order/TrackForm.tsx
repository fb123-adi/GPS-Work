"use client";

import { useActionState } from "react";
import { trackOrder } from "@/app/actions/track";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function TrackForm({ defaultOrder }: { defaultOrder: string }) {
  const [state, action] = useActionState(trackOrder, undefined);
  return (
    <form action={action} className="grid max-w-md gap-4 border border-line bg-surface p-6">
      <div className="field">
        <label htmlFor="orderNumber">Order number</label>
        <input id="orderNumber" name="orderNumber" className="input uppercase" defaultValue={defaultOrder} placeholder="KV2609-7QK3MX" required autoComplete="off" />
      </div>
      <div className="field">
        <label htmlFor="contact">Email or mobile number</label>
        <input id="contact" name="contact" className="input" required autoComplete="email" />
      </div>
      {state?.message && <p className="notice notice-error" role="alert">{state.message}</p>}
      <SubmitButton>Find my order</SubmitButton>
    </form>
  );
}
