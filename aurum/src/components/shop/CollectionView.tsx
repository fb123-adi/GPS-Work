"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Product } from "@/lib/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { cn } from "@/lib/utils";

type SortKey = "featured" | "price-asc" | "price-desc";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price · Low to High" },
  { key: "price-desc", label: "Price · High to Low" },
];

export function CollectionView({ products }: { products: Product[] }) {
  const collections = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.collection)))],
    [products]
  );
  const [filter, setFilter] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("featured");

  const visible = useMemo(() => {
    let list = filter === "All" ? products : products.filter((p) => p.collection === filter);
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, filter, sort]);

  return (
    <section className="bg-ivory py-14 sm:py-20">
      <div className="mx-auto max-w-editorial px-5 sm:px-8">
        {/* Toolbar */}
        <div className="flex flex-col gap-5 border-b border-stone pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {collections.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                aria-pressed={filter === c}
                className={cn(
                  "min-h-[40px] px-4 text-[0.66rem] uppercase tracking-wide2 transition-colors",
                  filter === c ? "bg-ink text-ivory" : "text-graphite hover:text-ink"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-3 text-[0.66rem] uppercase tracking-wide2 text-taupe">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="min-h-[40px] border border-stone bg-transparent px-3 text-[0.66rem] uppercase tracking-wide2 text-ink focus:border-gold focus:outline-none"
            >
              {sortOptions.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="py-5 text-[0.66rem] uppercase tracking-wide2 text-taupe">
          {visible.length} {visible.length === 1 ? "piece" : "pieces"}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${filter}-${sort}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4"
          >
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
