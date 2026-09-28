"use client";

import { useActionState, useState, useTransition } from "react";
import { archiveCoupon, moderateReview, saveCoupon, setStaffRole, updateReturn, updateTicket } from "@/app/admin/actions/ops";
import { STAFF_ROLES } from "@/lib/auth/roles";

type R = { ok: boolean; message: string } | null;
const Msg = ({ r }: { r: R }) => (r ? <span className={`text-xs ${r.ok ? "text-success" : "text-danger"}`} role="status">{r.message}</span> : null);

export function ReturnControls({ id, next }: { id: string; next: string[] }) {
  const [note, setNote] = useState("");
  const [restock, setRestock] = useState(true);
  const [r, setR] = useState<R>(null);
  const [pending, start] = useTransition();
  if (!next.length) return <span className="text-xs text-ink-soft">Closed</span>;
  return (
    <div className="grid gap-1.5">
      <input aria-label="Staff note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="border border-line-strong px-2 py-1 text-xs" maxLength={500} />
      {next.includes("received") && <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={restock} onChange={(e) => setRestock(e.target.checked)} /> Restock items when received</label>}
      <div className="flex flex-wrap gap-1">
        {next.map((s) => (
          <button key={s} type="button" disabled={pending} onClick={() => start(async () => setR(await updateReturn(id, s, note, restock)))}
            className={`btn btn-sm !min-h-7 text-xs ${s === "rejected" ? "btn-danger" : "btn-secondary"}`}>{s}</button>
        ))}
      </div>
      <Msg r={r} />
    </div>
  );
}

export function CouponForm({ c, products, collections }: {
  c?: Record<string, string | boolean | string[] | null>; products: { id: string; name: string }[]; collections: { id: string; title: string }[];
}) {
  const [s, action, pending] = useActionState(saveCoupon, undefined);
  const v = (k: string) => (c?.[k] as string) ?? "";
  const b = (k: string) => Boolean(c?.[k]);
  const arr = (k: string) => (c?.[k] as string[] | null) ?? [];
  const inp = "input !min-h-10 text-sm";
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      {c?.id && <input type="hidden" name="id" value={String(c.id)} />}
      <div className="field"><label htmlFor="cp-code">Code</label><input id="cp-code" name="code" defaultValue={v("code")} className={`${inp} uppercase`} required /></div>
      <div className="field"><label htmlFor="cp-desc">Internal description</label><input id="cp-desc" name="description" defaultValue={v("description")} className={inp} /></div>
      <div className="field"><label htmlFor="cp-kind">Type</label><select id="cp-kind" name="kind" defaultValue={v("kind") || "percent"} className="select !min-h-10 text-sm"><option value="percent">Percentage</option><option value="fixed">Fixed amount (₹)</option></select></div>
      <div className="field"><label htmlFor="cp-val">Value (% or ₹)</label><input id="cp-val" name="value" inputMode="decimal" defaultValue={v("value")} className={inp} required /></div>
      <div className="field"><label htmlFor="cp-max">Maximum discount ₹ (optional)</label><input id="cp-max" name="maxDiscount" inputMode="decimal" defaultValue={v("maxDiscount")} className={inp} /></div>
      <div className="field"><label htmlFor="cp-min">Minimum bag value ₹</label><input id="cp-min" name="minSubtotal" inputMode="decimal" defaultValue={v("minSubtotal")} className={inp} /></div>
      <div className="field"><label htmlFor="cp-s">Starts (optional)</label><input id="cp-s" name="startsAt" type="datetime-local" defaultValue={v("startsAt")} className={inp} /></div>
      <div className="field"><label htmlFor="cp-e">Ends (optional)</label><input id="cp-e" name="endsAt" type="datetime-local" defaultValue={v("endsAt")} className={inp} /></div>
      <div className="field"><label htmlFor="cp-ul">Total uses (optional)</label><input id="cp-ul" name="usageLimit" inputMode="numeric" defaultValue={v("usageLimit")} className={inp} /></div>
      <div className="field"><label htmlFor="cp-pc">Uses per customer (optional)</label><input id="cp-pc" name="perCustomerLimit" inputMode="numeric" defaultValue={v("perCustomerLimit")} className={inp} /></div>
      <div className="field"><label htmlFor="cp-prod">Only these products (optional)</label>
        <select id="cp-prod" name="products" multiple defaultValue={arr("products")} className="select h-32 text-sm">{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
      <div className="field"><label htmlFor="cp-col">Only these collections (optional)</label>
        <select id="cp-col" name="collections" multiple defaultValue={arr("collections")} className="select h-32 text-sm">{collections.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select></div>
      <div className="flex flex-wrap gap-5 text-sm md:col-span-2">
        <label className="flex items-center gap-2"><input type="checkbox" name="firstOrderOnly" defaultChecked={b("firstOrderOnly")} className="checkbox !mt-0" /> First order only</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="excludeSale" defaultChecked={b("excludeSale")} className="checkbox !mt-0" /> Exclude reduced items</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="isActive" defaultChecked={c ? b("isActive") : true} className="checkbox !mt-0" /> Active</label>
      </div>
      <div className="flex items-center gap-3 md:col-span-2">
        <button className="btn btn-primary btn-sm" disabled={pending} data-loading={pending}><span className="btn-label">Save discount</span></button>
        {s?.message && <span className="text-sm text-danger" role="alert">{s.message}</span>}
      </div>
    </form>
  );
}

export function ArchiveCoupon({ id }: { id: string }) {
  const [r, setR] = useState<R>(null);
  const [pending, start] = useTransition();
  return <span className="flex items-center gap-2"><button type="button" className="text-xs text-danger hover:underline" disabled={pending} onClick={() => { if (confirm("Archive this code? It stops working immediately.")) start(async () => setR(await archiveCoupon(id))); }}>Archive</button><Msg r={r} /></span>;
}

export function ReviewModeration({ id }: { id: string }) {
  const [r, setR] = useState<R>(null);
  const [pending, start] = useTransition();
  return (
    <span className="flex flex-wrap items-center gap-1">
      <button type="button" className="btn btn-secondary btn-sm !min-h-7 text-xs" disabled={pending} onClick={() => start(async () => setR(await moderateReview(id, "published")))}>Publish</button>
      <button type="button" className="btn btn-danger btn-sm !min-h-7 text-xs" disabled={pending} onClick={() => start(async () => setR(await moderateReview(id, "rejected")))}>Reject</button>
      <Msg r={r} />
    </span>
  );
}

export function TicketStatus({ id, status }: { id: string; status: string }) {
  const [r, setR] = useState<R>(null);
  const [pending, start] = useTransition();
  return (
    <span className="flex items-center gap-2">
      <select aria-label="Ticket status" defaultValue={status} disabled={pending} className="border border-line-strong px-1 py-1 text-xs"
        onChange={(e) => start(async () => setR(await updateTicket(id, e.target.value)))}>
        {["open", "pending", "resolved", "closed"].map((s) => <option key={s}>{s}</option>)}
      </select>
      <Msg r={r} />
    </span>
  );
}

export function StaffForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("support_agent");
  const [r, setR] = useState<R>(null);
  const [pending, start] = useTransition();
  return (
    <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); start(async () => setR(await setStaffRole(email, role, true))); }}>
      <div className="field"><label htmlFor="st-email" className="!text-xs">Account email</label><input id="st-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input !min-h-10 !w-64 text-sm" required /></div>
      <div className="field"><label htmlFor="st-role" className="!text-xs">Role</label><select id="st-role" value={role} onChange={(e) => setRole(e.target.value)} className="select !min-h-10 text-sm">{STAFF_ROLES.map((x) => <option key={x}>{x}</option>)}</select></div>
      <button className="btn btn-primary btn-sm !min-h-10" disabled={pending}>Grant role</button>
      <Msg r={r} />
    </form>
  );
}

export function RevokeRole({ email, role }: { email: string; role: string }) {
  const [r, setR] = useState<R>(null);
  const [pending, start] = useTransition();
  return <span className="inline-flex items-center gap-1"><button type="button" className="text-xs text-danger hover:underline" disabled={pending} onClick={() => { if (confirm(`Remove ${role} from ${email}?`)) start(async () => setR(await setStaffRole(email, role, false))); }}>remove</button><Msg r={r} /></span>;
}
