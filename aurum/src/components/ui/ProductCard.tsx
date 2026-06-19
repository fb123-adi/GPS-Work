"use client";

import { motion } from "framer-motion";
import type { Product } from "@/lib/products";
import { formatPrice, cn } from "@/lib/utils";
import { useCart } from "@/components/providers/CartProvider";

const toneClass: Record<Product["tone"], string> = {
  ink: "duo-ink",
  graphite: "duo-graphite",
  champagne: "duo-champagne",
  olive: "duo-olive",
  oxblood: "duo-oxblood",
};

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const lightTone = product.tone === "champagne";

  return (
    <motion.article
      className="group relative flex flex-col"
      whileHover="hover"
      initial="rest"
      animate="rest"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-stone">
        {/* Editorial placeholder — swap for <Image> with campaign assets. */}
        <motion.div
          variants={{ rest: { scale: 1 }, hover: { scale: 1.06 } }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className={cn("grain absolute inset-0", toneClass[product.tone])}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-60" />

        {product.badge && (
          <span
            className={cn(
              "absolute left-4 top-4 z-10 px-3 py-1 text-[0.6rem] uppercase tracking-wide2 backdrop-blur-sm",
              lightTone ? "bg-ink/85 text-ivory" : "bg-ivory/90 text-ink"
            )}
          >
            {product.badge}
          </span>
        )}

        {/* Quick actions slide up on hover; always tabbable for keyboard users. */}
        <motion.div
          variants={{ rest: { y: 16, opacity: 0 }, hover: { y: 0, opacity: 1 } }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-3 bottom-3 z-10 flex items-center gap-2"
        >
          <button
            onClick={() => add(product)}
            className="flex min-h-[44px] flex-1 items-center justify-center bg-ink/90 px-4 text-[0.62rem] uppercase tracking-wide2 text-ivory backdrop-blur transition-colors hover:bg-gold hover:text-ink"
          >
            Add to Cart
          </button>
          <button
            aria-label={`Quick view ${product.name}`}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center bg-ivory/90 text-ink backdrop-blur transition-colors hover:bg-gold"
          >
            <EyeIcon />
          </button>
          <button
            aria-label={`Add ${product.name} to wishlist`}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center bg-ivory/90 text-ink backdrop-blur transition-colors hover:bg-gold"
          >
            <HeartIcon />
          </button>
        </motion.div>
      </div>

      <div className="flex items-start justify-between gap-4 pt-5">
        <div>
          <p className="text-[0.65rem] uppercase tracking-wide2 text-taupe">
            {product.category} · {product.collection}
          </p>
          <h3 className="mt-1 font-display text-lg leading-tight text-ink">{product.name}</h3>
        </div>
        <p className="shrink-0 pt-1 font-body text-sm tracking-wide text-graphite">
          {formatPrice(product.price)}
        </p>
      </div>
    </motion.article>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}
