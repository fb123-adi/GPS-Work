"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { CartView } from "@/lib/cart-view";
import { formatMoney } from "@/lib/money";
import { useCart } from "./CartProvider";
import { QtyStepper } from "./QtyStepper";
import { DeliveryEstimate } from "@/components/product/DeliveryEstimate";

export function CartPageClient({ initial }: { initial: CartView }) {
  const { cart: live, update, pending, applyCoupon, removeCoupon, lastError, refresh } = useCart();
  const [code, setCode] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const cart = live ?? initial;

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (cart.lines.length === 0) {
    return (
      <div className="py-20 text-center">
        <h1 className="display text-[clamp(1.8rem,3vw,2.6rem)]">Your bag is empty</h1>
        <p className="mt-3 text-ink-soft">Everything you add stays here, on any device you sign in to.</p>
        <Link href="/shop" className="btn btn-primary mt-8"><span className="btn-label">Continue shopping</span></Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
      <div>
        <h1 className="display mb-8 text-[clamp(1.8rem,3vw,2.6rem)]">Your bag <span className="text-ink-soft">({cart.count})</span></h1>
        {lastError && <p className="notice notice-error mb-4" role="alert">{lastError}</p>}
        {cart.problems.length > 0 && (
          <div className="notice notice-error mb-4" role="alert"><ul>{cart.problems.map((p) => <li key={p}>{p}</li>)}</ul></div>
        )}
        <ul className="divide-y divide-line border-y border-line" aria-busy={pending}>
          {cart.lines.map((l) => (
            <li key={l.variantId} className="grid grid-cols-[96px_1fr] gap-5 py-6 sm:grid-cols-[120px_1fr]">
              <Link href={`/products/${l.slug}`} className="relative aspect-[4/5] bg-[#e7e2d8]">
                {l.imageUrl && <Image src={l.imageUrl} alt={l.imageAlt ?? l.name} fill sizes="120px" className="object-cover" />}
              </Link>
              <div className="flex flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link href={`/products/${l.slug}`} className="font-medium hover:underline">{l.name}</Link>
                    <p className="text-sm text-ink-soft">{l.colour} · {l.size}</p>
                    <p className="mt-1 text-sm tabular-nums">{formatMoney(l.unitPriceMinor)}{l.compareAtMinor && <s className="ml-2 text-ink-soft">{formatMoney(l.compareAtMinor)}</s>}</p>
                  </div>
                  <p className="font-medium tabular-nums">{formatMoney(l.lineTotalMinor)}</p>
                </div>
                {l.purchasable && l.quantity > l.available && <p className="mt-2 text-sm text-danger">{l.available === 0 ? "Out of stock. Remove it to continue." : `Only ${l.available} available. Reduce the quantity to continue.`}</p>}
                {!l.purchasable && <p className="mt-2 text-sm text-danger">No longer available. Remove it to continue.</p>}
                <div className="mt-auto flex items-center gap-6 pt-4">
                  <QtyStepper value={l.quantity} max={Math.max(1, Math.min(10, l.available))} disabled={pending} onChange={(q) => update(l.variantId, q)} label={`Quantity of ${l.name}`} />
                  <button type="button" className="text-sm text-ink-soft underline-offset-4 hover:underline" onClick={() => update(l.variantId, 0)} disabled={pending}>Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/shop" className="link mt-6 inline-block">Continue shopping</Link>
      </div>

      <aside className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start" aria-label="Bag summary">
        <div className="border border-line bg-surface p-6">
          <h2 className="text-lg font-semibold">Summary</h2>
          <form className="mt-4" onSubmit={async (e) => {
            e.preventDefault();
            if (!code.trim()) return;
            const r = await applyCoupon(code.trim());
            setCouponMsg(r.ok ? null : r.error ?? "This code is not valid.");
            if (r.ok) setCode("");
          }}>
            <label htmlFor="cart-coupon" className="text-sm font-medium">Discount code</label>
            <div className="mt-1.5 flex gap-2">
              <input id="cart-coupon" className="input uppercase" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={32} autoComplete="off" aria-describedby="cart-coupon-msg" />
              <button className="btn btn-secondary">Apply</button>
            </div>
            <p id="cart-coupon-msg" className="mt-1 text-sm" aria-live="polite">
              {couponMsg && <span className="text-danger">{couponMsg}</span>}
              {cart.couponCode && !couponMsg && <span className="text-success">{cart.couponCode} applied. <button type="button" className="underline" onClick={() => removeCoupon()}>Remove</button></span>}
            </p>
          </form>
          <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatMoney(cart.subtotalMinor)}</dd></div>
            {cart.discountMinor > 0 && <div className="flex justify-between text-success"><dt>Discount</dt><dd className="tabular-nums">−{formatMoney(cart.discountMinor)}</dd></div>}
            <div className="flex justify-between"><dt>Standard delivery (estimate)</dt><dd className="tabular-nums">{cart.shippingMinor === 0 ? "Free" : formatMoney(cart.shippingMinor)}</dd></div>
            <div className="flex justify-between text-ink-soft"><dt>GST included (estimate)</dt><dd className="tabular-nums">{formatMoney(cart.taxMinor)}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-semibold"><dt>Estimated total</dt><dd className="tabular-nums">{formatMoney(cart.totalMinor)}</dd></div>
          </dl>
          {cart.freeShippingRemainingMinor !== null && <p className="mt-2 text-sm text-ink-soft">Add {formatMoney(cart.freeShippingRemainingMinor)} more for free standard delivery.</p>}
          <Link href="/checkout" className={`btn btn-primary mt-5 w-full ${cart.problems.length ? "pointer-events-none opacity-45" : ""}`} aria-disabled={cart.problems.length > 0}>
            <span className="btn-label">Proceed to checkout</span>
          </Link>
          <p className="mt-2 text-center text-xs text-ink-soft">Final delivery charge and total are confirmed at checkout.</p>
        </div>
        <DeliveryEstimate />
      </aside>
    </div>
  );
}
