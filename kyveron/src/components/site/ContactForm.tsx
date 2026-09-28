"use client";

import { useActionState, useEffect } from "react";
import { submitContact } from "@/app/actions/engagement";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Honeypot } from "@/components/ui/Honeypot";

export function ContactForm({ siteKey }: { siteKey: string | null }) {
  const [s, action] = useActionState(submitContact, undefined);
  useEffect(() => {
    if (!siteKey || document.getElementById("cf-turnstile-script")) return;
    const el = document.createElement("script");
    el.id = "cf-turnstile-script";
    el.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    el.async = true;
    document.head.appendChild(el);
  }, [siteKey]);
  if (s?.ok) return <p className="notice notice-success self-start" role="status">{s.message}</p>;
  const e = s?.errors ?? {};
  const err = (k: string) => (e[k] ? <p className="field-error">{e[k]}</p> : null);
  return (
    <form action={action} className="grid gap-4 border border-line bg-surface p-6 sm:grid-cols-2" noValidate>
      <Honeypot />
      <div className="field"><label htmlFor="c-name">Name</label><input id="c-name" name="name" className="input" autoComplete="name" required aria-invalid={!!e.name} />{err("name")}</div>
      <div className="field"><label htmlFor="c-email">Email</label><input id="c-email" name="email" type="email" className="input" autoComplete="email" required aria-invalid={!!e.email} />{err("email")}</div>
      <div className="field"><label htmlFor="c-phone">Mobile <span className="font-normal text-ink-soft">(optional)</span></label><input id="c-phone" name="phone" type="tel" className="input" autoComplete="tel" />{err("phone")}</div>
      <div className="field"><label htmlFor="c-order">Order number <span className="font-normal text-ink-soft">(if any)</span></label><input id="c-order" name="orderNumber" className="input uppercase" placeholder="KV2609-7QK3MX" />{err("orderNumber")}</div>
      <div className="field sm:col-span-2"><label htmlFor="c-cat">Topic</label>
        <select id="c-cat" name="category" className="select" defaultValue="order">
          <option value="order">An order</option><option value="delivery">Delivery</option><option value="returns">Returns and exchanges</option>
          <option value="payment">Payment or refund</option><option value="product">Product or sizing</option><option value="account">My account</option><option value="other">Something else</option>
        </select></div>
      <div className="field sm:col-span-2"><label htmlFor="c-msg">Message</label><textarea id="c-msg" name="message" className="textarea" maxLength={3000} required aria-invalid={!!e.message} />{err("message")}</div>
      {siteKey && <div className="cf-turnstile sm:col-span-2" data-sitekey={siteKey} data-theme="light" />}
      {s?.message && <p className="notice notice-error sm:col-span-2" role="alert">{s.message}</p>}
      <div className="sm:col-span-2"><SubmitButton>Send message</SubmitButton></div>
    </form>
  );
}
