"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

const categories = [
  {
    label: "MEN",
    subtitle: "Performance & Prestige",
    description: "Engineered for the ambitious athlete.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=85",
    href: "#men",
    products: "48 Pieces",
  },
  {
    label: "WOMEN",
    subtitle: "Strength & Elegance",
    description: "Where power meets grace.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=85",
    href: "#women",
    products: "52 Pieces",
  },
  {
    label: "CHILDREN",
    subtitle: "Future Champions",
    description: "Luxury essentials for the next generation.",
    image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&q=85",
    href: "#children",
    products: "31 Pieces",
  },
];

function CategoryCard({
  cat,
  index,
}: {
  cat: (typeof categories)[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.9,
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="group relative overflow-hidden cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={cat.image}
          alt={cat.label}
          fill
          sizes="(max-width:768px) 100vw, 33vw"
          className="object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-110"
        />
        {/* Overlay */}
        <div className="absolute inset-0 category-card-overlay transition-opacity duration-500 group-hover:opacity-90" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-8">
          <div className="transform transition-all duration-500">
            <p className="font-jost text-xs tracking-[0.3em] uppercase text-aurum-gold mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-y-2 group-hover:translate-y-0">
              {cat.subtitle}
            </p>
            <h3 className="font-bodoni text-4xl md:text-5xl font-bold text-aurum-ivory tracking-widest mb-1">
              {cat.label}
            </h3>
            <p className="font-jost text-xs text-aurum-gray tracking-[0.1em] mb-5">
              {cat.products}
            </p>

            {/* CTA */}
            <motion.a
              href={cat.href}
              className="inline-flex items-center gap-2 font-jost text-xs tracking-[0.2em] uppercase text-aurum-gold border-b border-aurum-gold/40 pb-0.5 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-400"
            >
              Shop Now
              <ArrowRight className="w-3 h-3" />
            </motion.a>
          </div>
        </div>

        {/* Gold corner accents */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-aurum-gold/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-aurum-gold/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-aurum-gold/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-aurum-gold/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </motion.div>
  );
}

export default function Categories() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="py-24 px-6 lg:px-8 bg-aurum-black" id="categories">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="font-jost text-xs tracking-[0.4em] uppercase text-aurum-gold mb-4">
            Explore
          </p>
          <h2 className="font-bodoni text-4xl md:text-5xl font-bold text-aurum-ivory tracking-tight">
            Shop by Category
          </h2>
          <div className="luxury-divider mt-6" />
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.label} cat={cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
