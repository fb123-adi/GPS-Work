"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";
import { SIZES } from "@/lib/products";
import { useCart } from "@/components/providers/CartProvider";
import { cn } from "@/lib/utils";

export function AddToCartPanel({ product }: { product: Product }) {
  const { add } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [error, setError] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Size selector */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[0.66rem] uppercase tracking-wide2 text-graphite">
            Size {size && <span className="text-ink">· {size}</span>}
          </span>
          <details className="group relative">
            <summary className="cursor-pointer list-none text-[0.66rem] uppercase tracking-wide2 text-gold-ink underline-offset-4 hover:underline">
              Size Guide
            </summary>
            <div className="absolute right-0 z-30 mt-3 w-72 border border-stone bg-ivory p-5 shadow-xl">
              <p className="mb-3 font-display text-base">Size Guide (cm)</p>
              <table className="w-full text-left text-xs text-graphite">
                <thead>
                  <tr className="text-taupe">
                    <th className="py-1 font-medium">Size</th>
                    <th className="py-1 font-medium">Chest</th>
                    <th className="py-1 font-medium">Waist</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["XS", "86", "70"],
                    ["S", "92", "76"],
                    ["M", "98", "82"],
                    ["L", "104", "88"],
                    ["XL", "110", "94"],
                    ["XXL", "116", "100"],
                  ].map(([s, c, w]) => (
                    <tr key={s} className="border-t border-stone/70">
                      <td className="py-1.5">{s}</td>
                      <td className="py-1.5">{c}</td>
                      <td className="py-1.5">{w}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>

        <div className="mt-3 grid grid-cols-6 gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setSize(s);
                setError(false);
              }}
              aria-pressed={size === s}
              className={cn(
                "flex min-h-[44px] items-center justify-center border text-[0.7rem] uppercase tracking-wide transition-colors",
                size === s
                  ? "border-ink bg-ink text-ivory"
                  : "border-stone text-ink hover:border-ink"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        {error && (
          <p role="alert" className="mt-2 text-xs text-[#b3261e]">
            Please select a size.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            if (!size) {
              setError(true);
              return;
            }
            add(product);
          }}
          className="flex min-h-[54px] flex-1 items-center justify-center bg-ink text-[0.72rem] uppercase tracking-wide2 text-ivory transition-colors hover:bg-gold hover:text-ink"
        >
          Add to Bag
        </button>
        <button
          aria-label="Add to wishlist"
          className="flex min-h-[54px] min-w-[54px] items-center justify-center border border-ink/70 text-ink transition-colors hover:bg-ink hover:text-ivory"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
        </button>
      </div>

      <p className="text-center text-[0.64rem] uppercase tracking-wide2 text-taupe">
        Complimentary worldwide shipping & returns
      </p>
    </div>
  );
}
