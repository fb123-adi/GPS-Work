"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { useCart } from "@/components/cart/CartProvider";
import { SizePicker, type VariantLite } from "./SizePicker";

type Quick = { name: string; slug: string; image: { url: string; alt: string } | null; priceText: string; fit: string | null; variants: VariantLite[] };

export function QuickViewButton({ slug, name, disabled }: { slug: string; name: string; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Quick | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setOpen(true);
    if (data) return;
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(slug)}/quick`);
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError("Could not load this product. Open the product page instead.");
    }
  };

  return (
    <>
      <button type="button" onClick={load} disabled={disabled} className="btn btn-invert btn-sm w-full border border-obsidian/10">
        {disabled ? "Sold out" : "Quick add"}
        <span className="sr-only">: {name}</span>
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} label={`Quick add: ${name}`} sheet>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-semibold">{name}</h2>
          <button type="button" className="inline-flex h-11 w-11 items-center justify-center -mr-2" aria-label="Close" onClick={() => setOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {error && <p className="notice notice-error">{error}</p>}
          {!data && !error && (
            <div aria-label="Loading" className="space-y-4"><div className="skeleton aspect-[4/5] w-1/2" /><div className="skeleton h-5 w-1/3" /><div className="skeleton h-11 w-full" /></div>
          )}
          {data && <QuickBody data={data} onDone={() => setOpen(false)} />}
        </div>
      </Drawer>
    </>
  );
}

function QuickBody({ data, onDone }: { data: Quick; onDone: () => void }) {
  const { add, pending } = useCart();
  const colours = [...new Set(data.variants.map((v) => v.colour))];
  const [colour, setColour] = useState(colours[0]);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="grid gap-5">
      <div className="flex gap-4">
        <div className="relative aspect-[4/5] w-32 flex-none overflow-hidden bg-[#e7e2d8]">
          {data.image && <Image src={data.image.url} alt={data.image.alt} fill sizes="128px" className="object-cover" />}
        </div>
        <div>
          <p className="text-lg tabular-nums">{data.priceText}</p>
          {data.fit && <p className="spec-line mt-1">{data.fit} fit</p>}
          <Link href={`/products/${data.slug}`} className="link mt-3 inline-block text-sm">Full details and size guide</Link>
        </div>
      </div>
      <SizePicker variants={data.variants} colour={colour} onColour={(c) => { setColour(c); setVariantId(null); }} value={variantId} onChange={setVariantId} />
      {error && <p className="field-error" role="alert">{error}</p>}
      <button type="button" className="btn btn-primary w-full" disabled={pending} data-loading={pending}
        onClick={async () => {
          if (!variantId) return setError("Choose a size.");
          const r = await add(variantId, 1);
          if (r.ok) onDone();
          else setError(r.error ?? "Could not add to bag.");
        }}>
        <span className="btn-label">Add to bag</span>
      </button>
    </div>
  );
}
