"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { moveWishToCart, toggleWishlist } from "@/app/actions/wishlist";
import { useCart } from "@/components/cart/CartProvider";
import type { VariantLite } from "./SizePicker";

export function WishlistItem({ card, variants }: { card: { id: string; slug: string; name: string; image: { url: string; alt: string } | null; priceText: string; inStock: boolean }; variants: VariantLite[] }) {
  const [size, setSize] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const { refresh, announce } = useCart();
  const inStock = variants.filter((v) => v.available > 0);
  return (
    <article>
      <Link href={`/products/${card.slug}`} className="card-media block">
        {card.image && <Image src={card.image.url} alt={card.image.alt} fill sizes="25vw" className="object-cover" />}
        {!card.inStock && <span className="badge badge-muted absolute left-3 top-3 bg-ivory">Sold out</span>}
      </Link>
      <div className="mt-3 flex justify-between gap-2 text-[0.9375rem]"><Link href={`/products/${card.slug}`} className="font-medium">{card.name}</Link><span className="tabular-nums">{card.priceText}</span></div>
      {card.inStock ? (
        <div className="mt-3 grid gap-2">
          <label className="sr-only" htmlFor={`ws-${card.id}`}>Size and colour</label>
          <select id={`ws-${card.id}`} className="select !min-h-11 text-sm" value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="">Choose size</option>
            {inStock.map((v) => <option key={v.id} value={v.id}>{v.colour} · {v.size}</option>)}
          </select>
          <button type="button" className="btn btn-primary btn-sm" disabled={pending || !size}
            onClick={() => start(async () => { const r = await moveWishToCart(card.id, size); if (r.ok) { await refresh(); announce("Moved to your bag"); router.refresh(); } else setMsg(r.error ?? "Could not move to bag."); })}>
            Move to bag
          </button>
        </div>
      ) : (
        <p className="mt-2 text-sm text-ink-soft">Out of stock in every size. Open the product to get an email when it returns.</p>
      )}
      {msg && <p className="field-error mt-1">{msg}</p>}
      <button type="button" className="mt-2 text-sm text-ink-soft underline-offset-4 hover:underline" disabled={pending}
        onClick={() => start(async () => { await toggleWishlist(card.id); router.refresh(); })}>Remove</button>
    </article>
  );
}
