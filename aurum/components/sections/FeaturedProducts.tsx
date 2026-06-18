"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import ProductCard from "@/components/ui/ProductCard";
import { products, collections } from "@/lib/data";

export default function FeaturedProducts() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeCollection, setActiveCollection] = useState("best-sellers");

  const filtered = products.filter((p) => {
    if (activeCollection === "best-sellers") return p.badge === "Best Seller";
    if (activeCollection === "new-arrivals") return p.isNew;
    if (activeCollection === "limited-edition") return p.isLimited;
    if (activeCollection === "performance")
      return p.subcategory?.includes("Compression") || p.subcategory?.includes("Performance");
    return true;
  });

  // Fall back to all products if filter returns empty
  const displayProducts = filtered.length > 0 ? filtered : products.slice(0, 4);

  return (
    <section id="featured" className="py-24 px-6 lg:px-8 bg-aurum-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div>
            <p className="font-jost text-xs tracking-[0.4em] uppercase text-aurum-gold mb-3">
              Signature Pieces
            </p>
            <h2 className="font-bodoni text-4xl md:text-5xl font-bold text-aurum-ivory tracking-tight">
              Featured Collection
            </h2>
          </div>

          {/* Collection tabs */}
          <div className="flex flex-wrap gap-2">
            {collections.map((col) => (
              <button
                key={col.id}
                onClick={() => setActiveCollection(col.id)}
                className={`px-4 py-2 font-jost text-xs tracking-[0.12em] uppercase transition-all duration-300 ${
                  activeCollection === col.id
                    ? "bg-aurum-gold text-aurum-black font-semibold"
                    : "border border-aurum-gold/20 text-aurum-gray hover:border-aurum-gold/40 hover:text-aurum-ivory"
                }`}
              >
                {col.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Products grid */}
        <motion.div
          key={activeCollection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {displayProducts.slice(0, 4).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {/* View all */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-12"
        >
          <motion.a
            href="#"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-outline inline-block px-12 py-4 text-sm tracking-[0.2em]"
          >
            View All Products
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
