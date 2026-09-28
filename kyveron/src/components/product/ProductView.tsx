"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Gallery } from "./Gallery";
import { SizePicker, type VariantLite } from "./SizePicker";
import { WishlistButton } from "./WishlistButton";
import { DeliveryEstimate } from "./DeliveryEstimate";
import { useCart } from "@/components/cart/CartProvider";
import { requestBackInStock } from "@/app/actions/engagement";
import { Icon } from "@/components/ui/Icon";

type Variant = VariantLite & { sku: string; priceText: string; compareText: string | null };
type Props = {
  product: { id: string; slug: string; name: string; subtitle: string | null; fit: string | null; material: string | null; isPerformance: boolean };
  images: { id: string; url: string; alt: string; colour: string | null }[];
  variants: Variant[];
  rating: { average: number; count: number };
  approximate: boolean;
  wished: boolean;
  details: ReactNode;
};

export function ProductView({ product, images, variants, rating, approximate, wished, details }: Props) {
  const firstInStock = variants.find((v) => v.available > 0) ?? variants[0];
  const [colour, setColour] = useState(firstInStock?.colour ?? "");
  const [variantId, setVariantId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const { add, pending } = useCart();
  const router = useRouter();

  const selected = variants.find((v) => v.id === variantId) ?? null;
  const priceVariant = selected ?? variants.find((v) => v.colour === colour) ?? variants[0];
  const soldOut = selected ? selected.available === 0 : false;

  useEffect(() => {
    // Recently viewed is a browsing convenience only (ids, no prices).
    try {
      const key = "kv_recent";
      const list = JSON.parse(localStorage.getItem(key) ?? "[]").filter((x: unknown) => typeof x === "string" && x !== product.id);
      localStorage.setItem(key, JSON.stringify([product.id, ...list].slice(0, 12)));
    } catch {
      /* storage blocked */
    }
  }, [product.id]);

  const submit = async (buyNow: boolean) => {
    setError(null);
    if (!selected) {
      setError("Choose a size.");
      document.getElementById("pdp-sizes")?.querySelector<HTMLButtonElement>("[role=radio]")?.focus();
      return;
    }
    const r = await add(selected.id, 1, { openDrawer: !buyNow });
    if (!r.ok) return setError(r.error ?? "Could not add to bag.");
    if (buyNow) router.push("/checkout");
    else {
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    }
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* dismissed */
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,1fr)] lg:gap-14">
      <Gallery images={images} colour={colour} name={product.name} />
      <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
        {product.isPerformance && <p className="spec-line !text-cobalt">PERFORMANCE</p>}
        <h1 className="display mt-2 text-[clamp(1.9rem,3vw,2.6rem)] !leading-[1.08]">{product.name}</h1>
        {product.subtitle && <p className="spec-line mt-2">{product.subtitle.toUpperCase()}</p>}
        <div className="mt-5 flex items-baseline gap-3">
          <p className="price-swap text-xl tabular-nums" key={priceVariant?.priceText}>{priceVariant?.priceText}</p>
          {priceVariant?.compareText && <s className="text-ink-soft tabular-nums" aria-label={`Was ${priceVariant.compareText}`}>{priceVariant.compareText}</s>}
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          {approximate ? "Approximate conversion. Charged in INR, inclusive of GST." : "Inclusive of all taxes (GST)."} Free standard delivery over ₹2,999.
        </p>
        {rating.count > 0 && (
          <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm">
            <span aria-hidden="true" className="tracking-[0.15em]">{"★★★★★".slice(0, Math.round(rating.average))}<span className="text-line-strong">{"★★★★★".slice(Math.round(rating.average))}</span></span>
            <span className="link">{rating.average.toFixed(1)} from {rating.count} {rating.count === 1 ? "review" : "reviews"}</span>
          </a>
        )}

        <div className="mt-7 border-t border-line pt-6" id="pdp-sizes">
          <SizePicker variants={variants} colour={colour} onColour={(c) => { setColour(c); setVariantId(null); }} value={variantId} onChange={(id) => { setVariantId(id); setError(null); }} idPrefix="pdp" />
          <div className="mt-1 flex items-center justify-between text-sm">
            {product.fit && <span className="text-ink-soft">{product.fit} fit</span>}
            <a href="#size-guide" className="link">Size guide</a>
          </div>
        </div>

        {error && <p className="field-error mt-4" role="alert">{error}</p>}

        {soldOut && selected ? (
          <BackInStock variantId={selected.id} size={selected.size} />
        ) : (
          <div className="mt-6 grid gap-2">
            <button type="button" className="btn btn-primary w-full" onClick={() => submit(false)} disabled={pending} data-loading={pending}>
              <span className="btn-label inline-flex items-center gap-2">
                {added ? <><Icon name="check" size={18} /> Added to bag</> : "Add to bag"}
              </span>
            </button>
            <button type="button" className="btn btn-secondary w-full" onClick={() => submit(true)} disabled={pending}>
              <span className="btn-label">Buy now</span>
            </button>
          </div>
        )}
        <div className="mt-3 flex gap-2">
          <WishlistButton productId={product.id} productName={product.name} initial={wished} variant="full" />
          <button type="button" className="btn btn-secondary" onClick={share} aria-label="Share this product">
            <Icon name="share" size={18} /><span>{copied ? "Link copied" : "Share"}</span>
          </button>
        </div>

        <DeliveryEstimate />

        <ul className="mt-6 space-y-2 border-t border-line pt-6 text-sm">
          <li className="flex gap-3"><Icon name="return" size={18} className="mt-0.5 flex-none" /> 14-day returns and size exchanges on unworn items with tags. <Link href="/legal/returns-policy" className="link">Details</Link></li>
          {product.material && <li className="flex gap-3"><Icon name="check" size={18} className="mt-0.5 flex-none" /> {product.material}</li>}
        </ul>
        {details}
      </div>
    </div>
  );
}

function BackInStock({ variantId, size }: { variantId: string; size: string }) {
  const [state, action, pending] = useActionState(requestBackInStock, undefined);
  if (state?.ok) return <p className="notice notice-success mt-6" role="status">{state.message}</p>;
  return (
    <form action={action} className="mt-6 grid gap-2 border border-line-strong p-4">
      <p className="font-medium">Size {size} is sold out</p>
      <p className="text-sm text-ink-soft">Leave your email and we will write once when it is back. No marketing.</p>
      <input type="hidden" name="variantId" value={variantId} />
      <div className="flex gap-2">
        <label htmlFor="bis-email" className="sr-only">Email</label>
        <input id="bis-email" name="email" type="email" autoComplete="email" required className="input" placeholder="you@example.com" />
        <button className="btn btn-primary" disabled={pending} data-loading={pending}><span className="btn-label">Notify me</span></button>
      </div>
      {state?.errors?.email && <p className="field-error">{state.errors.email}</p>}
      {state?.message && !state.ok && <p className="field-error">{state.message}</p>}
    </form>
  );
}
