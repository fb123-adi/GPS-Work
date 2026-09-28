"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { subscribe } from "@/app/actions/engagement";
import { Honeypot } from "@/components/ui/Honeypot";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function NewsletterForm() {
  const [state, action] = useActionState(subscribe, undefined);
  const [channel, setChannel] = useState<"email" | "whatsapp">("email");
  if (state?.ok) return <p className="text-ivory" role="status">{state.message}</p>;
  return (
    <form action={action} className="grid gap-3" noValidate>
      <Honeypot />
      <fieldset className="flex gap-2">
        <legend className="sr-only">How should we reach you?</legend>
        {(["email", "whatsapp"] as const).map((c) => (
          <label key={c} className={`chip cursor-pointer !border-graphite ${channel === c ? "!bg-ivory !text-obsidian" : "text-ivory"}`}>
            <input type="radio" name="channel" value={c} checked={channel === c} onChange={() => setChannel(c)} className="sr-only" />
            {c === "email" ? "Email" : "WhatsApp"}
          </label>
        ))}
      </fieldset>
      <div className="field">
        <label htmlFor="nl-contact" className="!text-stone">{channel === "email" ? "Email address" : "WhatsApp number"}</label>
        <div className="flex gap-2">
          <input id="nl-contact" name="contact" type={channel === "email" ? "email" : "tel"} inputMode={channel === "email" ? "email" : "tel"}
            autoComplete={channel === "email" ? "email" : "tel"} placeholder={channel === "email" ? "you@example.com" : "98xxxxxxxx"}
            className="input flex-1 !border-graphite !bg-graphite !text-ivory placeholder:!text-stone"
            aria-invalid={!!state?.errors?.contact} aria-describedby={state?.errors?.contact ? "nl-err" : undefined} />
          <SubmitButton className="btn btn-invert">Sign up</SubmitButton>
        </div>
        {state?.errors?.contact && <p id="nl-err" className="text-sm text-[#f0a79f]">{state.errors.contact}</p>}
      </div>
      <label className="flex items-start gap-3 text-sm text-stone">
        <input type="checkbox" name="consent" className="checkbox !accent-ivory" />
        <span>I agree to receive launch and restock messages. Unsubscribe any time. See the <Link href="/legal/privacy" className="link">privacy policy</Link>.</span>
      </label>
      {state?.errors?.consent && <p className="text-sm text-[#f0a79f]">{state.errors.consent}</p>}
      {state?.message && !state.ok && <p className="text-sm text-[#f0a79f]" role="alert">{state.message}</p>}
    </form>
  );
}
