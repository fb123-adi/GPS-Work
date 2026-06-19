"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice, cn } from "@/lib/utils";

const toneClass: Record<string, string> = {
  ink: "duo-ink",
  graphite: "duo-graphite",
  champagne: "duo-champagne",
  olive: "duo-olive",
  oxblood: "duo-oxblood",
};

export function CartDrawer() {
  const { isOpen, close, lines, remove, subtotal, count } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-ink/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            aria-hidden
          />
          <motion.aside
            className="fixed right-0 top-0 z-[90] flex h-full w-full max-w-md flex-col bg-ivory"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="Shopping bag"
          >
            <header className="flex items-center justify-between border-b border-stone px-6 py-6">
              <h2 className="font-display text-xl">
                Your Bag <span className="text-taupe">({count})</span>
              </h2>
              <button
                onClick={close}
                aria-label="Close bag"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center text-ink hover:text-gold-ink"
              >
                <CloseIcon />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <p className="font-display text-2xl">Your bag is empty</p>
                  <p className="max-w-xs text-sm font-light text-graphite">
                    Discover pieces engineered for performance and designed for prestige.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-stone">
                  {lines.map((line) => (
                    <li key={line.product.id} className="flex gap-4 py-6">
                      <div
                        className={cn(
                          "h-24 w-20 shrink-0",
                          toneClass[line.product.tone] ?? "duo-ink"
                        )}
                      />
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-2">
                          <h3 className="font-display text-base leading-tight">
                            {line.product.name}
                          </h3>
                          <span className="text-sm text-graphite">
                            {formatPrice(line.product.price)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs uppercase tracking-wide2 text-taupe">
                          {line.product.category} · Qty {line.qty}
                        </p>
                        <button
                          onClick={() => remove(line.product.id)}
                          className="mt-auto self-start text-xs uppercase tracking-wide2 text-graphite underline-offset-4 hover:text-gold-ink hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <footer className="border-t border-stone px-6 py-6">
              <div className="flex items-center justify-between pb-4">
                <span className="text-xs uppercase tracking-wide2 text-graphite">Subtotal</span>
                <span className="font-display text-xl">{formatPrice(subtotal)}</span>
              </div>
              <button
                disabled={lines.length === 0}
                className="flex min-h-[52px] w-full items-center justify-center bg-ink text-[0.72rem] uppercase tracking-wide2 text-ivory transition-colors hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                Proceed to Checkout
              </button>
              <p className="pt-3 text-center text-[0.65rem] uppercase tracking-wide2 text-taupe">
                Complimentary shipping & returns worldwide
              </p>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
