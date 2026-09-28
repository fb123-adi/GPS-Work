"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { formatMoney } from "@/lib/money";
import { INDIAN_STATES, SHIPPING_METHODS } from "@/lib/config/store";
import { placeOrder, quoteCheckout, type Summary } from "@/app/actions/checkout";
import { launchPayment } from "./launchPayment";

type SavedAddress = { id: string; label: string | null; fullName: string; phone: string; line1: string; line2: string | null; landmark: string | null; city: string; state: string; postalCode: string };
type Addr = { fullName: string; phone: string; line1: string; line2: string; landmark: string; city: string; state: string; postalCode: string; country: string };

const emptyAddr: Addr = { fullName: "", phone: "", line1: "", line2: "", landmark: "", city: "", state: "", postalCode: "", country: "IN" };

const PAYMENT_OPTIONS = [
  { id: "upi", label: "UPI", hint: "Google Pay, PhonePe, Paytm, BHIM, or any UPI app" },
  { id: "card", label: "Credit or debit card", hint: "Visa, Mastercard, RuPay, Amex" },
  { id: "netbanking", label: "Net banking", hint: "All major Indian banks" },
  { id: "wallet", label: "Wallets", hint: "Paytm, Amazon Pay, Mobikwik and more" },
] as const;

export function CheckoutForm({
  initial, user, saved, codEnabled, mockPayments,
}: {
  initial: Summary; user: { email: string; name: string | null } | null; saved: SavedAddress[]; codEnabled: boolean; mockPayments: boolean;
}) {
  const router = useRouter();
  // One key per checkout visit: resubmits and retries return the same order.
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const def = saved[0];
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(def?.phone ?? "");
  const [addrId, setAddrId] = useState<string>(def?.id ?? "new");
  const [ship, setShip] = useState<Addr>(def ? { ...emptyAddr, ...def, line2: def.line2 ?? "", landmark: def.landmark ?? "" } : emptyAddr);
  const [sameBilling, setSameBilling] = useState(true);
  const [bill, setBill] = useState<Addr>(emptyAddr);
  const [method, setMethod] = useState(initial.shippingMethod);
  const [couponInput, setCouponInput] = useState(initial.couponCode ?? "");
  const [coupon, setCoupon] = useState<string | null>(initial.couponCode);
  const [payment, setPayment] = useState<string>("upi");
  const [terms, setTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [summary, setSummary] = useState<Summary>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const [quoting, startQuote] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Re-quote from the server when choices that affect the total change.
  useEffect(() => {
    startQuote(async () => {
      const s = await quoteCheckout({ shippingMethod: method, couponCode: coupon, email });
      if (s) setSummary(s);
      else router.replace("/cart");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, coupon]);

  const pickSaved = (id: string) => {
    setAddrId(id);
    const a = saved.find((s) => s.id === id);
    if (a) {
      setShip({ ...emptyAddr, ...a, line2: a.line2 ?? "", landmark: a.landmark ?? "" });
      setPhone((p) => p || a.phone);
    } else setShip(emptyAddr);
  };

  const err = (k: string) => errors[k];
  const field = (prefix: "shipping" | "billing", a: Addr, set: (a: Addr) => void) => {
    const f = (k: keyof Addr, label: string, opts: { auto?: string; type?: string; half?: boolean; optional?: boolean; inputMode?: "numeric" | "tel" } = {}) => {
      const id = `${prefix}-${k}`;
      const e = err(`${prefix}.${k}`);
      return (
        <div className={`field ${opts.half ? "" : "sm:col-span-2"}`}>
          <label htmlFor={id}>{label}{opts.optional && <span className="font-normal text-ink-soft"> (optional)</span>}</label>
          <input id={id} className="input" value={a[k]} onChange={(ev) => set({ ...a, [k]: ev.target.value })} autoComplete={opts.auto}
            type={opts.type ?? "text"} inputMode={opts.inputMode} aria-invalid={!!e} aria-describedby={e ? `${id}-err` : undefined} required={!opts.optional} />
          {e && <p id={`${id}-err`} className="field-error">{e}</p>}
        </div>
      );
    };
    const sec = prefix === "shipping" ? "shipping" : "billing";
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {f("fullName", "Full name", { auto: `${sec} name` })}
        {f("phone", "Mobile number for delivery updates", { auto: `${sec} tel`, type: "tel", inputMode: "tel" })}
        {f("line1", "House number, building, street", { auto: `${sec} address-line1` })}
        {f("line2", "Area, locality", { auto: `${sec} address-line2`, optional: true })}
        {f("landmark", "Landmark", { optional: true, half: true })}
        {f("postalCode", "PIN code", { auto: `${sec} postal-code`, inputMode: "numeric", half: true })}
        {f("city", "City", { auto: `${sec} address-level2`, half: true })}
        <div className="field">
          <label htmlFor={`${prefix}-state`}>State</label>
          <select id={`${prefix}-state`} className="select" value={a.state} onChange={(ev) => set({ ...a, state: ev.target.value })} autoComplete={`${sec} address-level1`}
            aria-invalid={!!err(`${prefix}.state`)} required>
            <option value="">Choose a state</option>
            {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
          {err(`${prefix}.state`) && <p className="field-error">{err(`${prefix}.state`)}</p>}
        </div>
      </div>
    );
  };

  const blocked = summary.problems.length > 0;
  const total = useMemo(() => formatMoney(summary.totalMinor), [summary.totalMinor]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return; // guards double submission
    setErrors({});
    setMessage(null);
    setProblems([]);
    setSubmitting(true);
    setStatus("Creating your order…");
    try {
      const r = await placeOrder({
        idempotencyKey, email, phone, shipping: ship, billingSameAsShipping: sameBilling,
        billing: sameBilling ? undefined : bill, shippingMethod: method, couponCode: coupon, paymentMethod: payment,
        acceptTerms: terms, saveAddress: !!user && addrId === "new" && saveAddress, marketingOptIn: marketing,
      });
      if (!r.ok) {
        setErrors(r.errors ?? {});
        setMessage(r.message);
        setProblems(r.problems ?? []);
        setStatus(null);
        const first = r.errors && Object.keys(r.errors)[0];
        if (first) document.getElementById(first.replace(".", "-"))?.focus();
        return;
      }
      setStatus("Opening secure payment…");
      const outcome = await launchPayment(r.session);
      if (outcome.kind === "redirect") return router.push(outcome.url);
      if (outcome.kind === "paid") return router.push(`/order-confirmation/${outcome.orderId}`);
      if (outcome.kind === "unverified") return router.push(`/order-confirmation/${outcome.orderId ?? r.orderId}`);
      // Dismissed: the order and held stock stay; send them to the retry page.
      router.push(`/checkout/pay/${r.orderId}?cancelled=1`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Something went wrong. Your bag is safe; please try again.");
      setStatus(null);
    } finally {
      setSubmitting(false);
    }
  };

  const legend = "text-lg font-semibold";
  return (
    <form onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
      <div className="grid gap-10">
        {message && (
          <div className="notice notice-error" role="alert">
            <p>{message}</p>
            {problems.length > 0 && <ul className="mt-2 list-disc pl-5">{problems.map((p) => <li key={p}>{p}</li>)}</ul>}
            {problems.length > 0 && <Link href="/cart" className="link mt-2 inline-block">Review your bag</Link>}
          </div>
        )}

        <fieldset className="grid gap-4">
          <legend className={legend}>Contact</legend>
          {user ? (
            <p className="text-sm">Signed in as <strong className="font-medium">{user.email}</strong></p>
          ) : (
            <p className="text-sm text-ink-soft">Checking out as a guest. <Link href="/login?next=/checkout" className="link">Sign in</Link> to use saved addresses. You can create an account after your order.</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {!user && (
              <div className="field">
                <label htmlFor="email">Email for your receipt</label>
                <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required aria-invalid={!!err("email")} />
                {err("email") && <p className="field-error">{err("email")}</p>}
              </div>
            )}
            <div className="field">
              <label htmlFor="phone">Mobile number</label>
              <input id="phone" type="tel" inputMode="tel" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="98xxxxxxxx" required aria-invalid={!!err("phone")} />
              {err("phone") ? <p className="field-error">{err("phone")}</p> : <p className="field-hint">For order and delivery updates only.</p>}
            </div>
          </div>
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className={legend}>Delivery address</legend>
          {saved.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Saved addresses">
              {saved.map((a) => (
                <label key={a.id} className={`cursor-pointer border p-4 text-sm transition-colors ${addrId === a.id ? "border-obsidian bg-surface" : "border-line-strong hover:border-obsidian"}`}>
                  <input type="radio" name="saved" className="sr-only" checked={addrId === a.id} onChange={() => pickSaved(a.id)} />
                  <span className="font-medium">{a.label ?? a.fullName}</span><br />
                  <span className="text-ink-soft">{a.line1}, {a.city} {a.postalCode}</span>
                </label>
              ))}
              <label className={`cursor-pointer border p-4 text-sm ${addrId === "new" ? "border-obsidian bg-surface" : "border-line-strong hover:border-obsidian"}`}>
                <input type="radio" name="saved" className="sr-only" checked={addrId === "new"} onChange={() => pickSaved("new")} />
                <span className="font-medium">Use a new address</span>
              </label>
            </div>
          )}
          {field("shipping", ship, setShip)}
          {user && addrId === "new" && (
            <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} /> Save this address to my account</label>
          )}
          <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="checkbox" checked={sameBilling} onChange={(e) => setSameBilling(e.target.checked)} /> Billing address is the same as delivery</label>
          {!sameBilling && (
            <div className="grid gap-4 border-t border-line pt-4">
              <p className="font-medium">Billing address</p>
              {field("billing", bill, setBill)}
            </div>
          )}
        </fieldset>

        <fieldset className="grid gap-3">
          <legend className={legend}>Delivery method</legend>
          {SHIPPING_METHODS.map((m) => {
            const fee = m.id === summary.shippingMethod ? summary.shippingMinor : m.freeAboveMinor !== null && summary.subtotalMinor - summary.discountMinor >= m.freeAboveMinor ? 0 : m.feeMinor;
            return (
              <label key={m.id} className={`flex cursor-pointer items-center justify-between gap-4 border p-4 transition-colors ${method === m.id ? "border-obsidian bg-surface" : "border-line-strong hover:border-obsidian"}`}>
                <span className="flex items-start gap-3">
                  <input type="radio" name="method" className="mt-1 accent-obsidian" checked={method === m.id} onChange={() => setMethod(m.id)} />
                  <span><span className="font-medium">{m.label}</span><br /><span className="text-sm text-ink-soft">{m.daysMin} to {m.daysMax} working days</span></span>
                </span>
                <span className="tabular-nums">{fee === 0 ? "Free" : formatMoney(fee)}</span>
              </label>
            );
          })}
        </fieldset>

        <fieldset className="grid gap-3">
          <legend className={legend}>Payment</legend>
          {mockPayments && <p className="notice notice-cobalt text-sm">Test mode: payments are simulated. No money will move.</p>}
          {PAYMENT_OPTIONS.map((p) => (
            <label key={p.id} className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${payment === p.id ? "border-obsidian bg-surface" : "border-line-strong hover:border-obsidian"}`}>
              <input type="radio" name="payment" className="mt-1 accent-obsidian" checked={payment === p.id} onChange={() => setPayment(p.id)} />
              <span><span className="font-medium">{p.label}</span><br /><span className="text-sm text-ink-soft">{p.hint}</span></span>
            </label>
          ))}
          {codEnabled && (
            <label className={`flex cursor-pointer items-start gap-3 border p-4 ${payment === "cod" ? "border-obsidian bg-surface" : "border-line-strong"}`}>
              <input type="radio" name="payment" className="mt-1 accent-obsidian" checked={payment === "cod"} onChange={() => setPayment("cod")} />
              <span className="font-medium">Cash on delivery</span>
            </label>
          )}
          <p className="text-sm text-ink-soft">Payments are processed by Razorpay. We never see or store your card or UPI details.</p>
        </fieldset>

        <div className="grid gap-3">
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" id="acceptTerms" className="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} aria-invalid={!!err("acceptTerms")} />
            <span>I agree to the <Link href="/legal/terms" className="link" target="_blank">terms and conditions</Link>, <Link href="/legal/privacy" className="link" target="_blank">privacy policy</Link>, and <Link href="/legal/returns-policy" className="link" target="_blank">returns policy</Link>.</span>
          </label>
          {err("acceptTerms") && <p className="field-error">{err("acceptTerms")}</p>}
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
            <span>Email me about new releases and restocks (optional).</span>
          </label>
        </div>
      </div>

      <aside className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start" aria-label="Order summary">
        <div className="border border-line bg-surface p-6">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <ul className="mt-4 divide-y divide-line">
            {summary.lines.map((l) => (
              <li key={l.variantId} className="flex gap-3 py-3 text-sm">
                <span className="relative h-16 w-[52px] flex-none bg-[#e7e2d8]">
                  {l.imageUrl && <Image src={l.imageUrl} alt="" fill sizes="52px" className="object-cover" />}
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center bg-obsidian px-1 text-[11px] text-ivory">{l.quantity}</span>
                </span>
                <span className="flex-1"><span className="font-medium">{l.name}</span><br /><span className="text-ink-soft">{l.colour} · {l.size}</span></span>
                <span className="tabular-nums">{formatMoney(l.lineTotalMinor)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-line pt-4">
            <label htmlFor="coupon" className="text-sm font-medium">Discount code</label>
            <div className="mt-1.5 flex gap-2">
              <input id="coupon" className="input uppercase" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} maxLength={32} autoComplete="off" />
              <button type="button" className="btn btn-secondary" onClick={() => setCoupon(couponInput.trim() || null)} disabled={quoting}>Apply</button>
            </div>
            {summary.couponError && coupon && <p className="field-error mt-1" role="alert">{summary.couponError}</p>}
            {summary.couponCode && (
              <p className="mt-1 text-sm text-success">{summary.couponCode} applied. <button type="button" className="underline" onClick={() => { setCoupon(null); setCouponInput(""); }}>Remove</button></p>
            )}
          </div>
          <dl className={`mt-4 space-y-1.5 border-t border-line pt-4 text-sm transition-opacity ${quoting ? "opacity-60" : ""}`} aria-busy={quoting}>
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatMoney(summary.subtotalMinor)}</dd></div>
            {summary.discountMinor > 0 && <div className="flex justify-between text-success"><dt>Discount</dt><dd className="tabular-nums">−{formatMoney(summary.discountMinor)}</dd></div>}
            <div className="flex justify-between"><dt>Delivery</dt><dd className="tabular-nums">{summary.shippingMinor === 0 ? "Free" : formatMoney(summary.shippingMinor)}</dd></div>
            <div className="flex justify-between text-ink-soft"><dt>Includes GST</dt><dd className="tabular-nums">{formatMoney(summary.taxMinor)}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-semibold"><dt>Total to pay</dt><dd className="tabular-nums">{total}</dd></div>
          </dl>
          {blocked && (
            <div className="notice notice-error mt-4 text-sm" role="alert">
              <ul>{summary.problems.map((p) => <li key={p}>{p}</li>)}</ul>
              <Link href="/cart" className="link">Update your bag</Link>
            </div>
          )}
          <button type="submit" className="btn btn-primary mt-5 w-full" disabled={submitting || blocked || quoting} data-loading={submitting} aria-describedby="pay-status">
            <span className="btn-label">Pay {total} securely</span>
          </button>
          <p id="pay-status" className="mt-2 min-h-5 text-center text-sm text-ink-soft" aria-live="polite">{status}</p>
          <p className="text-center text-xs text-ink-soft">Charged in INR. Your bag is kept if payment does not go through.</p>
        </div>
      </aside>
    </form>
  );
}
