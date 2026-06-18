"use client";

import { motion } from "framer-motion";

const items = [
  "Performance",
  "Prestige",
  "Craftsmanship",
  "Excellence",
  "Luxury",
  "Precision",
  "Ambition",
  "Discipline",
];

export default function BrandMarquee() {
  return (
    <div className="py-6 bg-aurum-gold/5 border-y border-aurum-gold/10 overflow-hidden">
      <div className="marquee-inner flex whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center mx-8">
            <span className="font-bodoni text-sm tracking-[0.3em] uppercase text-aurum-gold/70">
              {item}
            </span>
            <span className="w-1 h-1 bg-aurum-gold/40 rounded-full mx-8" />
          </span>
        ))}
      </div>
    </div>
  );
}
