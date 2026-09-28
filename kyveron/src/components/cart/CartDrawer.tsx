"use client";

import Image from "next/image";
import Link from "next/link";
import { Drawer } from "@/components/ui/Drawer";
import { formatMoney } from "@/lib/money";
import { useCart } from "./CartProvider";
import { QtyStepper } from "./QtyStepper";

export function CartDrawer() {
  const { cart, open, setOpen, update, pending, lastError } = useCart();
  const close = () => setOpen(false);
  const loading = open && !cart;

  return (
    <Drawer open={open} onClose={close} label="Your bag" sheet>
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="text-lg font-semibold">
          Your bag{cart && cart.count > 0 ? <span className="ml-2 text-ink-soft font-normal">({cart.count})</span> : null}
        </h2>
        <button type="button" onClick={close} className="btn btn-sm -mr-2" aria-label="Close bag">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5" aria-busy={loading || pending}>
        {loading && (
          <ul className="divide-y divide-line" aria-label="Loading bag">
            {[0, 1].map((i) => (
              <li key={i} className="flex gap-4 py-5">
                <div className="skeleton h-[100px] w-[80px]" />
                <div className="flex-1 space-y-2 pt-1"><div className="skeleton h-4 w-3/4" /><div className="skeleton h-3 w-1/3" /><div className="skeleton h-3 w-1/4" /></div>
              </li>
            ))}
          </ul>
        )}
        {cart && cart.lines.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg font-medium">Your bag is empty.</p>
            <p className="mt-2 text-ink-soft">Start with the Daily Uniform, the pieces most people buy first.</p>
            <Link href="/collections/daily-uniform" className="btn btn-primary mt-6" onClick={close}>
              <span className="btn-label">Shop the Daily Uniform</span>
            </Link>
          </div>
        )}
        {lastError && <p className="notice notice-error mt-4" role="alert">{lastError}</p>}
        {cart && cart.lines.length > 0 && (
          <ul className="divide-y divide-line">
            {cart.lines.map((l) => (
              <li key={l.variantId} className="flex gap-4 py-5">
                <Link href={`/products/${l.slug}`} onClick={close} className="relative block h-[100px] w-[80px] flex-none overflow-hidden bg-[#e7e2d8]">
                  {l.imageUrl && <Image src={l.imageUrl} alt={l.imageAlt ?? l.name} fill sizes="80px" className="object-cover" />}
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-3">
                    <Link href={`/products/${l.slug}`} onClick={close} className="font-medium leading-snug hover:underline">{l.name}</Link>
                    <span className="whitespace-nowrap tabular-nums">{formatMoney(l.lineTotalMinor)}</span>
                  </div>
                  <p className="text-sm text-ink-soft">{l.colour} · {l.size}</p>
                  {!l.purchasable && <p className="mt-1 text-sm text-danger">No longer available</p>}
                  {l.purchasable && l.quantity > l.available && (
                    <p className="mt-1 text-sm text-danger">{l.available === 0 ? "Out of stock" : `Only ${l.available} available`}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <QtyStepper value={l.quantity} max={Math.max(1, Math.min(10, l.available))} disabled={pending} onChange={(q) => update(l.variantId, q)} label={`Quantity of ${l.name}`} />
                    <button type="button" className="text-sm text-ink-soft underline-offset-4 hover:underline" onClick={() => update(l.variantId, 0)} disabled={pending}>
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {cart && cart.lines.length > 0 && (
        <div className="border-t border-line bg-surface px-5 py-5">
          {cart.freeShippingRemainingMinor !== null ? (
            <p className="mb-3 text-sm text-ink-soft">Add {formatMoney(cart.freeShippingRemainingMinor)} more for free standard delivery.</p>
          ) : (
            <p className="mb-3 text-sm text-success">Free standard delivery on this order.</p>
          )}
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatMoney(cart.subtotalMinor)}</dd></div>
            {cart.discountMinor > 0 && (
              <div className="flex justify-between text-success"><dt>Discount ({cart.couponCode})</dt><dd className="tabular-nums">−{formatMoney(cart.discountMinor)}</dd></div>
            )}
          </dl>
          <p className="mt-1 text-xs text-ink-soft">Prices include GST. Shipping and final total at checkout.</p>
          <div className="mt-4 grid gap-2">
            <Link href="/checkout" className="btn btn-primary w-full" onClick={close} aria-disabled={cart.problems.length > 0}>
              <span className="btn-label">Checkout · {formatMoney(cart.subtotalMinor - cart.discountMinor)}</span>
            </Link>
            <Link href="/cart" className="btn btn-secondary w-full" onClick={close}><span className="btn-label">View bag</span></Link>
          </div>
        </div>
      )}
    </Drawer>
  );
}
