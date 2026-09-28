"use client";

import { useActionState, useState, useTransition } from "react";
import { changePassword, signOut } from "@/lib/auth/actions";
import { deleteAddress, enrollMfa, requestAccountDeletion, saveAddress, updateMarketingPrefs, updateProfile, verifyMfa } from "@/app/actions/account";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { CURRENCIES, INDIAN_STATES } from "@/lib/config/store";

type S = { ok?: boolean; message?: string; errors?: Record<string, string> } | undefined;

function Msg({ s }: { s: S }) {
  if (!s?.message) return null;
  return <p className={`text-sm ${s.ok ? "text-success" : "text-danger"}`} role={s.ok ? "status" : "alert"}>{s.message}</p>;
}
function E({ s, k }: { s: S; k: string }) {
  return s?.errors?.[k] ? <p className="field-error">{s.errors[k]}</p> : null;
}

export function ProfileForm({ v }: { v: { fullName: string; email: string; phone: string; preferredSize: string; preferredCurrency: string } }) {
  const [s, action] = useActionState(updateProfile, undefined);
  return (
    <form action={action} className="grid max-w-xl gap-4 sm:grid-cols-2">
      <div className="field sm:col-span-2"><label htmlFor="pf-name">Full name</label><input id="pf-name" name="fullName" defaultValue={v.fullName} className="input" autoComplete="name" /><E s={s} k="fullName" /></div>
      <div className="field sm:col-span-2"><span className="label">Email</span><p className="text-[0.9375rem]">{v.email} <span className="text-sm text-ink-soft">(contact support to change)</span></p></div>
      <div className="field sm:col-span-2"><label htmlFor="pf-phone">Mobile number</label><input id="pf-phone" name="phone" type="tel" defaultValue={v.phone} className="input" autoComplete="tel" /><E s={s} k="phone" /></div>
      <div className="field"><label htmlFor="pf-size">Usual size</label>
        <select id="pf-size" name="preferredSize" defaultValue={v.preferredSize} className="select"><option value="">Not set</option>{["XS", "S", "M", "L", "XL", "XXL"].map((x) => <option key={x}>{x}</option>)}</select></div>
      <div className="field"><label htmlFor="pf-cur">Display currency</label>
        <select id="pf-cur" name="preferredCurrency" defaultValue={v.preferredCurrency} className="select">{CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}</select></div>
      <div className="flex items-center gap-4 sm:col-span-2"><SubmitButton>Save profile</SubmitButton><Msg s={s} /></div>
    </form>
  );
}

type Addr = { id: string; label: string | null; fullName: string; phone: string; line1: string; line2: string | null; landmark: string | null; city: string; state: string; postalCode: string; isDefault: boolean };

export function AddressForm({ a, onDone }: { a?: Addr; onDone?: () => void }) {
  const [s, action] = useActionState(async (p: S, f: FormData) => {
    const r: S = await saveAddress(p, f).catch((e: Error) => ({ message: e.message }));
    if (r?.ok) onDone?.();
    return r;
  }, undefined);
  const f = (name: string, label: string, def?: string | null, opt?: { auto?: string; optional?: boolean; half?: boolean }) => (
    <div className={`field ${opt?.half ? "" : "sm:col-span-2"}`}>
      <label htmlFor={`ad-${a?.id ?? "new"}-${name}`}>{label}{opt?.optional && <span className="font-normal text-ink-soft"> (optional)</span>}</label>
      <input id={`ad-${a?.id ?? "new"}-${name}`} name={name} defaultValue={def ?? ""} className="input" autoComplete={opt?.auto} aria-invalid={!!s?.errors?.[name]} />
      <E s={s} k={name} />
    </div>
  );
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {a && <input type="hidden" name="id" value={a.id} />}
      {f("label", "Label", a?.label, { optional: true, half: true })}
      {f("fullName", "Full name", a?.fullName, { auto: "name", half: true })}
      {f("phone", "Mobile number", a?.phone, { auto: "tel", half: true })}
      {f("postalCode", "PIN code", a?.postalCode, { auto: "postal-code", half: true })}
      {f("line1", "House number, building, street", a?.line1, { auto: "address-line1" })}
      {f("line2", "Area, locality", a?.line2, { auto: "address-line2", optional: true })}
      {f("landmark", "Landmark", a?.landmark, { optional: true, half: true })}
      {f("city", "City", a?.city, { auto: "address-level2", half: true })}
      <div className="field sm:col-span-2"><label htmlFor={`ad-${a?.id ?? "new"}-state`}>State</label>
        <select id={`ad-${a?.id ?? "new"}-state`} name="state" defaultValue={a?.state ?? ""} className="select"><option value="">Choose a state</option>{INDIAN_STATES.map((x) => <option key={x}>{x}</option>)}</select><E s={s} k="state" /></div>
      <label className="flex items-center gap-3 text-sm sm:col-span-2"><input type="checkbox" name="isDefault" defaultChecked={a?.isDefault} className="checkbox !mt-0" /> Use as my default address</label>
      <div className="flex items-center gap-4 sm:col-span-2"><SubmitButton>{a ? "Save changes" : "Add address"}</SubmitButton><Msg s={s} /></div>
    </form>
  );
}

export function AddressList({ items }: { items: Addr[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(items.length === 0);
  const [pending, start] = useTransition();
  return (
    <div className="grid gap-6">
      {items.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((a) => (
            <li key={a.id} className="border border-line bg-surface p-5 text-sm">
              {editing === a.id ? (
                <AddressForm a={a} onDone={() => setEditing(null)} />
              ) : (
                <>
                  <p className="font-medium">{a.label ?? a.fullName} {a.isDefault && <span className="badge badge-muted ml-2">Default</span>}</p>
                  <address className="mt-2 not-italic leading-relaxed text-[#2b2a27]">{a.fullName}<br />{a.line1}{a.line2 && <><br />{a.line2}</>}<br />{a.city}, {a.state} {a.postalCode}<br />{a.phone}</address>
                  <div className="mt-4 flex gap-4">
                    <button type="button" className="link" onClick={() => setEditing(a.id)}>Edit</button>
                    <button type="button" className="text-danger underline-offset-4 hover:underline" disabled={pending}
                      onClick={() => { if (confirm("Remove this address?")) start(() => deleteAddress(a.id)); }}>Remove</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {adding ? (
        <div className="max-w-xl border-t border-line pt-6"><h2 className="mb-4 font-semibold">New address</h2><AddressForm onDone={() => setAdding(false)} /></div>
      ) : (
        <button type="button" className="btn btn-secondary justify-self-start" onClick={() => setAdding(true)}>Add an address</button>
      )}
    </div>
  );
}

export function MarketingForm({ email, whatsapp }: { email: boolean; whatsapp: boolean }) {
  const [s, action] = useActionState(updateMarketingPrefs, undefined);
  return (
    <form action={action} className="grid max-w-xl gap-3">
      <label className="flex items-start gap-3"><input type="checkbox" name="marketingEmail" defaultChecked={email} className="checkbox" /> <span>Email about new releases and restocks</span></label>
      <label className="flex items-start gap-3"><input type="checkbox" name="marketingWhatsapp" defaultChecked={whatsapp} className="checkbox" /> <span>WhatsApp messages for launches</span></label>
      <p className="text-sm text-ink-soft">Order and account emails are always sent; they are not marketing.</p>
      <div className="flex items-center gap-4"><SubmitButton className="btn btn-secondary">Save preferences</SubmitButton><Msg s={s} /></div>
    </form>
  );
}

export function DeleteAccountForm() {
  const [s, action] = useActionState(requestAccountDeletion, undefined);
  if (s?.ok) return <p className="notice notice-success" role="status">{s.message}</p>;
  return (
    <form action={action} className="grid max-w-xl gap-3">
      <p className="text-sm text-ink-soft">We will delete your profile, addresses, wishlist, and saved preferences. Order and invoice records are kept for as long as tax law requires, then removed.</p>
      <div className="field"><label htmlFor="del-confirm">Type DELETE to confirm</label><input id="del-confirm" name="confirm" className="input" autoComplete="off" /><E s={s} k="confirm" /></div>
      <div><SubmitButton className="btn btn-danger">Request account deletion</SubmitButton></div>
    </form>
  );
}

export function PasswordForm({ local }: { local: boolean }) {
  const [s, action] = useActionState(changePassword, undefined);
  return (
    <form action={action} className="grid max-w-md gap-4">
      {local && <div className="field"><label htmlFor="cur">Current password</label><input id="cur" name="current" type="password" autoComplete="current-password" className="input" /><E s={s} k="current" /></div>}
      <div className="field"><label htmlFor="npw">New password</label><input id="npw" name="password" type="password" autoComplete="new-password" className="input" /><E s={s} k="password" /></div>
      <div className="flex items-center gap-4"><SubmitButton>Update password</SubmitButton><Msg s={s} /></div>
    </form>
  );
}

export function MfaSetup() {
  const [step, setStep] = useState<{ factorId: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();
  if (msg?.ok) return <p className="notice notice-success">{msg.message}</p>;
  return (
    <div className="grid max-w-md gap-4">
      {!step ? (
        <button type="button" className="btn btn-secondary justify-self-start" disabled={pending}
          onClick={() => start(async () => { const r = await enrollMfa(); if (r.ok) setStep({ factorId: r.factorId!, qr: r.qr!, secret: r.secret! }); else setMsg({ ok: false, message: r.message ?? "Unavailable" }); })}>
          Set up two-step verification
        </button>
      ) : (
        <>
          <p className="text-sm">Scan this with an authenticator app (Google Authenticator, 1Password, Authy), then enter the 6-digit code.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={step.qr} alt="QR code for your authenticator app" width={180} height={180} className="border border-line bg-white p-2" />
          <p className="text-xs text-ink-soft">Or enter this key: <code className="break-all">{step.secret}</code></p>
          <div className="flex gap-2">
            <label htmlFor="mfa-code" className="sr-only">6-digit code</label>
            <input id="mfa-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" className="input" />
            <button type="button" className="btn btn-primary" disabled={pending || code.length !== 6} onClick={() => start(async () => setMsg(await verifyMfa(step.factorId, code)))}>Verify</button>
          </div>
        </>
      )}
      {msg && !msg.ok && <p className="field-error" role="alert">{msg.message}</p>}
    </div>
  );
}

export function SignOutButton() {
  return <form action={signOut}><button className="btn btn-secondary">Sign out</button></form>;
}
