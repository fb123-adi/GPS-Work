"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getProducts, getCollections, type Product } from "@/lib/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

const collections = getCollections();
const all = getProducts();

export function SignatureCollections() {
  const [active, setActive] = useState<(typeof collections)[number]>("Best Sellers");
  const items: Product[] = all.filter((p) => p.collection === active);

  return (
    <section className="bg-parchment py-20 sm:py-28">
      <div className="mx-auto max-w-editorial px-5 sm:px-8">
        <SectionHeading
          eyebrow="Signature Collections"
          title="The pieces that define us"
          intro="Curated edits across performance, lifestyle, and our most coveted limited drops."
        />

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Collections"
          className="mt-12 flex flex-wrap justify-center gap-2"
        >
          {collections.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={active === c}
              onClick={() => setActive(c)}
              className={cn(
                "min-h-[44px] px-5 text-[0.7rem] uppercase tracking-wide2 transition-all duration-300 ease-luxe",
                active === c
                  ? "bg-ink text-ivory"
                  : "bg-transparent text-graphite hover:text-ink"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4"
          >
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
